'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { staffApi } from '@/lib/api/staff';
import { hotelsApi } from '@/lib/api/hotels';
import { billingApi } from '@/lib/api/billing';
import { getApiErrorMessage } from '@/lib/api/errors';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { CreateStaffDto } from '@/types';

const emptyForm = { firstName: '', lastName: '', email: '', password: '', role: 'Housekeeper' as CreateStaffDto['role'], hotelId: 0 };

/**
 * A hotel owner's managers and housekeepers. How many can be active depends on the plan.
 */
export default function StaffPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: staff, isLoading } = useQuery({ queryKey: ['staff'], queryFn: staffApi.getAll });
  const { data: hotels } = useQuery({ queryKey: ['hotels'], queryFn: () => hotelsApi.getAll() });
  const { data: billing } = useQuery({ queryKey: ['billing'], queryFn: billingApi.getOverview });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['staff'] });
    queryClient.invalidateQueries({ queryKey: ['billing'] });
  };
  const failed = (error: unknown) => showToast(getApiErrorMessage(error, 'Something went wrong'), 'error');

  const create = useMutation({
    mutationFn: staffApi.create,
    onSuccess: user => {
      refresh();
      setAdding(false);
      setForm(emptyForm);
      showToast(`${user.firstName} ${user.lastName} can now sign in with ${user.email}`, 'success');
    },
    onError: error => setFormError(getApiErrorMessage(error, 'The staff member could not be added')),
  });
  const setActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => (active ? staffApi.activate(id) : staffApi.deactivate(id)),
    onSuccess: (_, { active }) => {
      refresh();
      showToast(active ? 'Staff member can sign in again' : 'Staff member can no longer sign in', 'success');
    },
    onError: failed,
  });
  const move = useMutation({
    mutationFn: ({ id, hotelId }: { id: string; hotelId: number }) => staffApi.moveToHotel(id, hotelId),
    onSuccess: () => {
      refresh();
      showToast('Staff member moved', 'success');
    },
    onError: failed,
  });

  const openAdd = () => {
    setForm({ ...emptyForm, hotelId: hotels?.[0]?.id ?? 0 });
    setFormError(null);
    setAdding(true);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    create.mutate(form);
  };

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const limit = billing?.limits.maxStaff;
  const atLimit = billing && limit !== null && limit !== undefined && billing.usage.staff >= limit;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
            <p className="mt-1 text-gray-600">
              Managers and housekeepers of your hotels.
              {billing && (
                <>
                  {' '}
                  {billing.usage.staff} of {limit ?? 'unlimited'} active on your {billing.currentPlan} plan.
                  {atLimit && (
                    <>
                      {' '}
                      <Link href="/dashboard/billing" className="font-medium text-blue-600 hover:text-blue-700">Upgrade for more</Link>
                    </>
                  )}
                </>
              )}
            </p>
          </div>
          <Button onClick={openAdd} disabled={!hotels?.length}>Add staff</Button>
        </div>

        {hotels && hotels.length === 0 && (
          <p className="text-gray-600">
            Add a hotel first; staff work at one of your hotels. <Link href="/dashboard/hotels/new" className="text-blue-600">Add a hotel</Link>
          </p>
        )}

        <Card className="py-0">
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Hotel</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>
                )}
                {staff?.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No staff yet. Add a manager or housekeeper to share the work.</td></tr>
                )}
                {staff?.map(member => (
                  <tr key={member.id}>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{member.firstName} {member.lastName}</span>
                      <span className="block text-gray-500">{member.email}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{member.roles.join(', ')}</td>
                    <td className="px-4 py-3">
                      {hotels && hotels.length > 1 ? (
                        <Select
                          value={String(member.hotelId)}
                          onValueChange={value => move.mutate({ id: member.id, hotelId: Number(value) })}
                        >
                          <SelectTrigger className="w-44" aria-label={`Hotel of ${member.firstName} ${member.lastName}`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {hotels.map(hotel => <SelectItem key={hotel.id} value={String(hotel.id)}>{hotel.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-gray-700">{member.hotelName}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={member.isActive ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-100'}>
                        {member.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={setActive.isPending}
                        onClick={() => setActive.mutate({ id: member.id, active: !member.isActive })}
                      >
                        {member.isActive ? 'Deactivate' : 'Reactivate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={submit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add staff</DialogTitle>
              <DialogDescription>They sign in with this email and password. Share the password with them yourself.</DialogDescription>
            </DialogHeader>
            {formError && <p role="alert" className="text-sm text-red-700">{formError}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="staff-first-name">First name</Label>
                <Input id="staff-first-name" required value={form.firstName} onChange={update('firstName')} />
              </div>
              <div>
                <Label htmlFor="staff-last-name">Last name</Label>
                <Input id="staff-last-name" required value={form.lastName} onChange={update('lastName')} />
              </div>
            </div>
            <div>
              <Label htmlFor="staff-email">Email</Label>
              <Input id="staff-email" type="email" required value={form.email} onChange={update('email')} />
            </div>
            <div>
              <Label htmlFor="staff-password">Password</Label>
              <Input id="staff-password" type="password" required minLength={6} autoComplete="new-password" value={form.password} onChange={update('password')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="staff-role">Role</Label>
                <Select value={form.role} onValueChange={value => setForm(prev => ({ ...prev, role: value as CreateStaffDto['role'] }))}>
                  <SelectTrigger id="staff-role" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Housekeeper">Housekeeper</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="staff-hotel">Hotel</Label>
                <Select value={String(form.hotelId)} onValueChange={value => setForm(prev => ({ ...prev, hotelId: Number(value) }))}>
                  <SelectTrigger id="staff-hotel" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {hotels?.map(hotel => <SelectItem key={hotel.id} value={String(hotel.id)}>{hotel.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
              <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Adding…' : 'Add staff'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
