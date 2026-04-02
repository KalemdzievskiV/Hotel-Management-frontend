'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { housekeepingApi, CreateHousekeepingTaskDto, UpdateHousekeepingTaskDto } from '@/lib/api/housekeeping';
import { hotelsApi } from '@/lib/api/hotels';
import { usersApi } from '@/lib/api/users';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { ClipboardList, CheckCircle, Clock, AlertCircle, Plus, Play, Check, Wand2 } from 'lucide-react';
import { format } from 'date-fns';

const TASK_TYPES = [
    { value: 1, label: 'Clean Room' },
    { value: 2, label: 'Change Linen' },
    { value: 3, label: 'Deep Clean' },
    { value: 4, label: 'Maintenance' },
    { value: 5, label: 'Inspection' },
    { value: 6, label: 'Turn Down' },
];

const PRIORITIES = [
    { value: 1, label: 'Low', color: 'secondary' },
    { value: 2, label: 'Normal', color: 'default' },
    { value: 3, label: 'High', color: 'destructive' },
    { value: 4, label: 'Urgent', color: 'destructive' },
];

const STATUSES = [
    { value: 1, label: 'Pending', icon: Clock, color: 'secondary' },
    { value: 2, label: 'In Progress', icon: Play, color: 'default' },
    { value: 3, label: 'Completed', icon: CheckCircle, color: 'default' },
    { value: 4, label: 'Cancelled', icon: AlertCircle, color: 'secondary' },
    { value: 5, label: 'Needs Inspection', icon: AlertCircle, color: 'destructive' },
];

function statusBadge(status: number) {
    const s = STATUSES.find(x => x.value === status);
    const colorMap: Record<string, string> = {
        secondary: 'bg-gray-100 text-gray-700',
        default: status === 2 ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800',
        destructive: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[s?.color ?? 'secondary']}`}>{s?.label ?? 'Unknown'}</span>;
}

function priorityBadge(priority: number) {
    const p = PRIORITIES.find(x => x.value === priority);
    if (priority >= 3) return <Badge variant="destructive">{p?.label}</Badge>;
    return <Badge variant="outline">{p?.label}</Badge>;
}

export default function HousekeepingPage() {
    const qc = useQueryClient();
    const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [showCreate, setShowCreate] = useState(false);
    const [newTask, setNewTask] = useState<Partial<CreateHousekeepingTaskDto>>({ type: 1, priority: 2 });

    const { data: hotels } = useQuery({ queryKey: ['hotels'], queryFn: () => hotelsApi.getAll() });
    const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll() });

    const hotelId = selectedHotelId ?? (hotels?.[0]?.id ?? null);

    const { data: schedule, isLoading } = useQuery({
        queryKey: ['housekeeping-schedule', hotelId, selectedDate],
        queryFn: () => housekeepingApi.getSchedule(hotelId!, selectedDate),
        enabled: !!hotelId,
    });

    const { data: allTasks } = useQuery({
        queryKey: ['housekeeping-tasks', hotelId],
        queryFn: () => housekeepingApi.getTasks(hotelId!),
        enabled: !!hotelId,
    });

    const { data: performance } = useQuery({
        queryKey: ['housekeeping-performance', hotelId],
        queryFn: () => housekeepingApi.getPerformance(hotelId!),
        enabled: !!hotelId,
    });

    const createTask = useMutation({
        mutationFn: (dto: CreateHousekeepingTaskDto) => housekeepingApi.create(dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['housekeeping-schedule', hotelId] });
            qc.invalidateQueries({ queryKey: ['housekeeping-tasks', hotelId] });
            setShowCreate(false);
            setNewTask({ type: 1, priority: 2 });
        },
    });

    const startTask = useMutation({
        mutationFn: (id: number) => housekeepingApi.startTask(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['housekeeping-schedule', hotelId] });
            qc.invalidateQueries({ queryKey: ['housekeeping-tasks', hotelId] });
        },
    });

    const completeTask = useMutation({
        mutationFn: (id: number) => housekeepingApi.completeTask(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['housekeeping-schedule', hotelId] });
            qc.invalidateQueries({ queryKey: ['housekeeping-tasks', hotelId] });
        },
    });

    const generateDaily = useMutation({
        mutationFn: () => housekeepingApi.generateDailyTasks(hotelId!, selectedDate),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['housekeeping-schedule', hotelId] }),
    });

    const hotelRooms = allTasks ? [...new Map(allTasks.map(t => [t.roomId, { id: t.roomId, number: t.roomNumber }])).values()] : [];
    const staffUsers = users?.filter(u => u.roles?.includes('Manager') || u.roles?.includes('Admin')) ?? [];

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Housekeeping</h1>
                        <p className="text-gray-500 mt-1">Manage cleaning tasks and room status</p>
                    </div>
                    <div className="flex gap-3">
                        {hotels && hotels.length > 1 && (
                            <Select value={String(hotelId)} onValueChange={v => setSelectedHotelId(Number(v))}>
                                <SelectTrigger className="w-48"><SelectValue placeholder="Select hotel" /></SelectTrigger>
                                <SelectContent>{hotels.map(h => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}</SelectContent>
                            </Select>
                        )}
                        <Button variant="outline" onClick={() => generateDaily.mutate()} disabled={generateDaily.isPending}>
                            <Wand2 className="h-4 w-4 mr-2" /> Auto-generate Tasks
                        </Button>
                        <Button onClick={() => setShowCreate(true)}>
                            <Plus className="h-4 w-4 mr-2" /> New Task
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Tasks</p>
                                    <p className="text-2xl font-bold">{schedule?.totalTasks ?? 0}</p>
                                </div>
                                <ClipboardList className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-600">{schedule?.pendingTasks ?? 0}</p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">In Progress</p>
                                    <p className="text-2xl font-bold text-blue-600">{schedule?.inProgressTasks ?? 0}</p>
                                </div>
                                <Play className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Completed</p>
                                    <p className="text-2xl font-bold text-green-600">{schedule?.completedTasks ?? 0}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="schedule">
                    <div className="flex items-center justify-between mb-2">
                        <TabsList>
                            <TabsTrigger value="schedule">Daily Schedule</TabsTrigger>
                            <TabsTrigger value="all">All Tasks</TabsTrigger>
                            <TabsTrigger value="performance">Staff Performance</TabsTrigger>
                        </TabsList>
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                            className="w-44"
                        />
                    </div>

                    {/* Schedule Tab */}
                    <TabsContent value="schedule">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Schedule for {format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM d')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {isLoading ? (
                                    <div className="p-8 text-center text-gray-500">Loading schedule...</div>
                                ) : (
                                    <div className="divide-y">
                                        {schedule?.tasks.map(task => (
                                            <div key={task.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-center w-16">
                                                        <p className="font-bold text-lg text-gray-900">Room</p>
                                                        <p className="text-blue-600 font-semibold">{task.roomNumber}</p>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{task.typeName}</span>
                                                            {priorityBadge(task.priority)}
                                                            {statusBadge(task.status)}
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-0.5">
                                                            {task.assignedToName ? `Assigned to ${task.assignedToName}` : 'Unassigned'}
                                                            {task.durationMinutes ? ` · ${task.durationMinutes}min` : ''}
                                                        </p>
                                                        {task.notes && <p className="text-xs text-gray-400 mt-0.5">{task.notes}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {task.status === 1 && (
                                                        <Button size="sm" variant="outline" onClick={() => startTask.mutate(task.id)}>
                                                            <Play className="h-3 w-3 mr-1" /> Start
                                                        </Button>
                                                    )}
                                                    {task.status === 2 && (
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => completeTask.mutate(task.id)}>
                                                            <Check className="h-3 w-3 mr-1" /> Complete
                                                        </Button>
                                                    )}
                                                    {task.status === 3 && (
                                                        <span className="text-sm text-green-600 font-medium">✓ Done {task.completedAt ? format(new Date(task.completedAt), 'HH:mm') : ''}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {(!schedule?.tasks || schedule.tasks.length === 0) && (
                                            <div className="p-12 text-center">
                                                <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500">No tasks scheduled for this day.</p>
                                                <Button variant="outline" className="mt-3" onClick={() => generateDaily.mutate()}>
                                                    <Wand2 className="h-4 w-4 mr-2" /> Auto-generate from checkouts
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* All Tasks Tab */}
                    <TabsContent value="all">
                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-gray-50">
                                                <th className="text-left p-4 font-medium">Room</th>
                                                <th className="text-left p-4 font-medium">Type</th>
                                                <th className="text-left p-4 font-medium">Priority</th>
                                                <th className="text-left p-4 font-medium">Status</th>
                                                <th className="text-left p-4 font-medium">Assigned To</th>
                                                <th className="text-left p-4 font-medium">Scheduled</th>
                                                <th className="text-left p-4 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allTasks?.map(task => (
                                                <tr key={task.id} className="border-b hover:bg-gray-50">
                                                    <td className="p-4 font-semibold text-blue-600">{task.roomNumber}</td>
                                                    <td className="p-4">{task.typeName}</td>
                                                    <td className="p-4">{priorityBadge(task.priority)}</td>
                                                    <td className="p-4">{statusBadge(task.status)}</td>
                                                    <td className="p-4 text-gray-600">{task.assignedToName ?? 'Unassigned'}</td>
                                                    <td className="p-4 text-gray-500">{format(new Date(task.scheduledFor), 'MMM d')}</td>
                                                    <td className="p-4">
                                                        <div className="flex gap-2">
                                                            {task.status === 1 && (
                                                                <Button size="sm" variant="outline" onClick={() => startTask.mutate(task.id)}>
                                                                    <Play className="h-3 w-3 mr-1" /> Start
                                                                </Button>
                                                            )}
                                                            {task.status === 2 && (
                                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => completeTask.mutate(task.id)}>
                                                                    <Check className="h-3 w-3 mr-1" /> Complete
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!allTasks || allTasks.length === 0) && (
                                                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No tasks found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Performance Tab */}
                    <TabsContent value="performance">
                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-gray-50">
                                                <th className="text-left p-4 font-medium">Staff Member</th>
                                                <th className="text-right p-4 font-medium">Assigned</th>
                                                <th className="text-right p-4 font-medium">Completed</th>
                                                <th className="text-right p-4 font-medium">Completion Rate</th>
                                                <th className="text-right p-4 font-medium">Avg. Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {performance?.map(p => (
                                                <tr key={p.userId} className="border-b hover:bg-gray-50">
                                                    <td className="p-4 font-medium">{p.name}</td>
                                                    <td className="p-4 text-right">{p.tasksAssigned}</td>
                                                    <td className="p-4 text-right text-green-600 font-medium">{p.tasksCompleted}</td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${p.completionRate}%` }} />
                                                            </div>
                                                            <span>{p.completionRate}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right text-gray-500">
                                                        {p.averageDurationMinutes ? `${p.averageDurationMinutes}min` : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!performance || performance.length === 0) && (
                                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No performance data for the selected period.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Create Task Dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>New Housekeeping Task</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Task Type</Label>
                                <Select value={String(newTask.type)} onValueChange={v => setNewTask(p => ({ ...p, type: Number(v) }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{TASK_TYPES.map(t => <SelectItem key={t.value} value={String(t.value)}>{t.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Priority</Label>
                                <Select value={String(newTask.priority)} onValueChange={v => setNewTask(p => ({ ...p, priority: Number(v) }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{PRIORITIES.map(p => <SelectItem key={p.value} value={String(p.value)}>{p.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Room ID</Label>
                            <Input type="number" placeholder="Enter Room ID" value={newTask.roomId ?? ''} onChange={e => setNewTask(p => ({ ...p, roomId: Number(e.target.value) }))} />
                        </div>
                        <div>
                            <Label>Scheduled For</Label>
                            <Input type="datetime-local" value={newTask.scheduledFor ?? selectedDate + 'T08:00'} onChange={e => setNewTask(p => ({ ...p, scheduledFor: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Notes (optional)</Label>
                            <Input value={newTask.notes ?? ''} onChange={e => setNewTask(p => ({ ...p, notes: e.target.value }))} placeholder="Any special instructions" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                        <Button onClick={() => createTask.mutate(newTask as CreateHousekeepingTaskDto)} disabled={!newTask.roomId || createTask.isPending}>
                            {createTask.isPending ? 'Creating...' : 'Create Task'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
