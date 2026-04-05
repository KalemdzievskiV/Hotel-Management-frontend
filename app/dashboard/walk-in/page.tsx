'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { walkInApi, QuickCheckInDto, QuickGuestDto, GuestIntelligenceDto } from '@/lib/api/walk-in';
import { hotelsApi } from '@/lib/api/hotels';
import { guestsApi } from '@/lib/api/guests';
import { reservationsApi } from '@/lib/api/reservations';
import { useAuthStore } from '@/store/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
    UserCheck, Search, Star, AlertTriangle, Clock, DollarSign,
    ChevronRight, BedDouble, LogIn, LogOut, History, Plus
} from 'lucide-react';
import { format, addDays } from 'date-fns';

const PAYMENT_METHODS = [
    { value: 1, label: 'Cash' },
    { value: 2, label: 'Credit Card' },
    { value: 3, label: 'Debit Card' },
    { value: 4, label: 'Bank Transfer' },
    { value: 5, label: 'Online' },
];

const DISCOUNT_REASONS = [
    'Slow day',
    'Regular customer',
    'Long stay',
    'VIP guest',
    'Corporate rate',
    'Walk-in special',
    'Manager discretion',
    'Other',
];

type Step = 'guest' | 'room' | 'pricing' | 'confirm';

export default function WalkInPage() {
    const { user } = useAuthStore();
    const [step, setStep] = useState<Step>('guest');
    const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
    const [guestSearch, setGuestSearch] = useState('');
    const [selectedGuest, setSelectedGuest] = useState<any>(null);
    const [isNewGuest, setIsNewGuest] = useState(false);
    const [newGuest, setNewGuest] = useState<Partial<QuickGuestDto>>({});
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [checkIn, setCheckIn] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    const [checkOut, setCheckOut] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm"));
    const [numberOfGuests, setNumberOfGuests] = useState(1);
    const [overridePrice, setOverridePrice] = useState<number | null>(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [discountReason, setDiscountReason] = useState('');
    const [depositAmount, setDepositAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<number>(1);
    const [specialRequests, setSpecialRequests] = useState('');
    const [guestIntelligence, setGuestIntelligence] = useState<GuestIntelligenceDto | null>(null);
    const [showIntelligence, setShowIntelligence] = useState(false);
    const [showExpressCheckout, setShowExpressCheckout] = useState(false);
    const [extraCharges, setExtraCharges] = useState(0);
    const [extraChargesNotes, setExtraChargesNotes] = useState('');
    const [finalPayment, setFinalPayment] = useState(0);
    const [checkoutReservationId, setCheckoutReservationId] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState('');

    const { data: hotels } = useQuery({ queryKey: ['hotels'], queryFn: () => hotelsApi.getAll() });
    const hotelId = selectedHotelId ?? (hotels?.[0]?.id ?? null);

    const { data: availableRooms, isLoading: roomsLoading } = useQuery({
        queryKey: ['available-rooms', hotelId, checkIn, checkOut],
        queryFn: () => reservationsApi.getAvailableRooms({
            hotelId: hotelId!,
            checkIn: new Date(checkIn).toISOString(),
            checkOut: new Date(checkOut).toISOString(),
        }),
        enabled: !!hotelId,
        select: (data) => data.rooms,
    });

    const { data: guestSearchResults } = useQuery({
        queryKey: ['guest-search', guestSearch],
        queryFn: () => guestsApi.search(guestSearch),
        enabled: guestSearch.length >= 2,
    });

    const { data: checkedInReservations } = useQuery({
        queryKey: ['checked-in', hotelId],
        queryFn: () => reservationsApi.getByHotel(hotelId!),
        enabled: !!hotelId,
        select: (data) => data.filter((r: any) => r.status === 'CheckedIn' || r.status === 3),
    });

    const quickCheckIn = useMutation({
        mutationFn: (dto: QuickCheckInDto) => walkInApi.quickCheckIn(dto),
        onSuccess: (result) => {
            setSuccessMessage(`✅ Room ${selectedRoom?.roomNumber} checked in for ${selectedGuest?.firstName ?? newGuest.firstName} ${selectedGuest?.lastName ?? newGuest.lastName}`);
            setStep('guest');
            setSelectedGuest(null);
            setSelectedRoom(null);
            setIsNewGuest(false);
            setNewGuest({});
            setDiscountAmount(0);
            setDepositAmount(0);
        },
    });

    const expressCheckout = useMutation({
        mutationFn: ({ id, dto }: { id: number; dto: any }) => walkInApi.expressCheckOut(id, dto),
        onSuccess: () => {
            setSuccessMessage('✅ Express checkout completed');
            setShowExpressCheckout(false);
        },
    });

    const updateFlags = useMutation({
        mutationFn: ({ id, dto }: { id: number; dto: any }) => walkInApi.updateGuestFlags(id, dto),
    });

    const loadGuestIntelligence = async (guestId: number) => {
        const intel = await walkInApi.getGuestIntelligence(guestId);
        setGuestIntelligence(intel);
        setShowIntelligence(true);
    };

    const basePrice = selectedRoom
        ? (overridePrice ?? selectedRoom.pricePerNight ?? 0)
        : 0;
    const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));
    const subtotal = basePrice * nights;
    const finalTotal = Math.max(0, subtotal - discountAmount);

    const handleQuickCheckIn = () => {
        if (!hotelId || !selectedRoom) return;
        const dto: QuickCheckInDto = {
            hotelId,
            roomId: selectedRoom.id,
            existingGuestId: selectedGuest?.id,
            newGuest: isNewGuest ? (newGuest as QuickGuestDto) : undefined,
            checkInDate: new Date(checkIn).toISOString(),
            checkOutDate: new Date(checkOut).toISOString(),
            numberOfGuests,
            overridePrice: overridePrice ?? undefined,
            discountAmount,
            discountReason: discountReason || undefined,
            depositAmount,
            paymentMethod,
            specialRequests: specialRequests || undefined,
        };
        quickCheckIn.mutate(dto);
    };

    return (
        <DashboardLayout>
            <div className="p-6 max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Walk-In Check-In</h1>
                        <p className="text-gray-500 mt-1">Fast guest registration and room assignment</p>
                    </div>
                    <div className="flex gap-3">
                        {hotels && hotels.length > 1 && (
                            <Select value={String(hotelId)} onValueChange={v => setSelectedHotelId(Number(v))}>
                                <SelectTrigger className="w-48"><SelectValue placeholder="Select hotel" /></SelectTrigger>
                                <SelectContent>{hotels.map(h => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}</SelectContent>
                            </Select>
                        )}
                        <Button variant="outline" onClick={() => setShowExpressCheckout(true)}>
                            <LogOut className="h-4 w-4 mr-2" /> Express Checkout
                        </Button>
                    </div>
                </div>

                {successMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 font-medium flex items-center justify-between">
                        <span>{successMessage}</span>
                        <button onClick={() => setSuccessMessage('')} className="text-green-600 hover:text-green-800">✕</button>
                    </div>
                )}

                {/* Step Indicator */}
                <div className="flex items-center gap-2">
                    {(['guest', 'room', 'pricing', 'confirm'] as Step[]).map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <button
                                onClick={() => step !== 'guest' && setStep(s)}
                                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                                    step === s ? 'bg-blue-600 text-white' :
                                    ['guest','room','pricing','confirm'].indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                                }`}
                            >
                                {i + 1}
                            </button>
                            <span className={`text-sm font-medium capitalize ${step === s ? 'text-blue-600' : 'text-gray-500'}`}>{s}</span>
                            {i < 3 && <ChevronRight className="h-4 w-4 text-gray-300" />}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Flow */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Step 1: Guest */}
                        {step === 'guest' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserCheck className="h-5 w-5 text-blue-600" /> Guest
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {!isNewGuest ? (
                                        <>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    className="pl-9"
                                                    placeholder="Search by name, email or phone..."
                                                    value={guestSearch}
                                                    onChange={e => setGuestSearch(e.target.value)}
                                                />
                                            </div>
                                            {guestSearchResults && guestSearchResults.length > 0 && (
                                                <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                                                    {guestSearchResults.map((g: any) => (
                                                        <button key={g.id} className="w-full text-left p-3 hover:bg-blue-50 flex items-center justify-between" onClick={() => { setSelectedGuest(g); setGuestSearch(''); }}>
                                                            <div>
                                                                <p className="font-medium">{g.firstName} {g.lastName}</p>
                                                                <p className="text-sm text-gray-500">{g.email} · {g.phoneNumber}</p>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                {g.isVIP && <Badge className="bg-yellow-100 text-yellow-800">VIP</Badge>}
                                                                {g.isBlacklisted && <Badge variant="destructive">Blocked</Badge>}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {selectedGuest && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-semibold text-blue-900">{selectedGuest.firstName} {selectedGuest.lastName}</p>
                                                                {selectedGuest.isVIP && <Badge className="bg-yellow-100 text-yellow-800"><Star className="h-3 w-3 mr-1" />VIP</Badge>}
                                                                {selectedGuest.isBlacklisted && <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Blocked</Badge>}
                                                            </div>
                                                            <p className="text-sm text-gray-600">{selectedGuest.email} · {selectedGuest.phoneNumber}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button size="sm" variant="outline" onClick={() => loadGuestIntelligence(selectedGuest.id)}>
                                                                <History className="h-3 w-3 mr-1" /> History
                                                            </Button>
                                                            <Button size="sm" variant="ghost" onClick={() => setSelectedGuest(null)}>✕</Button>
                                                        </div>
                                                    </div>
                                                    {selectedGuest.isBlacklisted && (
                                                        <div className="mt-2 text-sm text-red-700 bg-red-50 rounded p-2">
                                                            ⚠️ {selectedGuest.blacklistReason || 'This guest is blocked from booking'}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div className="text-center">
                                                <Button variant="outline" onClick={() => setIsNewGuest(true)}>
                                                    <Plus className="h-4 w-4 mr-2" /> Register New Guest
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div><Label>First Name *</Label><Input value={newGuest.firstName ?? ''} onChange={e => setNewGuest(p => ({ ...p, firstName: e.target.value }))} /></div>
                                                <div><Label>Last Name *</Label><Input value={newGuest.lastName ?? ''} onChange={e => setNewGuest(p => ({ ...p, lastName: e.target.value }))} /></div>
                                                <div><Label>Email *</Label><Input type="email" value={newGuest.email ?? ''} onChange={e => setNewGuest(p => ({ ...p, email: e.target.value }))} /></div>
                                                <div><Label>Phone *</Label><Input value={newGuest.phoneNumber ?? ''} onChange={e => setNewGuest(p => ({ ...p, phoneNumber: e.target.value }))} /></div>
                                                <div><Label>ID/Passport</Label><Input value={newGuest.identificationNumber ?? ''} onChange={e => setNewGuest(p => ({ ...p, identificationNumber: e.target.value }))} /></div>
                                                <div><Label>Nationality</Label><Input value={newGuest.nationality ?? ''} onChange={e => setNewGuest(p => ({ ...p, nationality: e.target.value }))} /></div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => setIsNewGuest(false)}>← Back to search</Button>
                                        </>
                                    )}
                                    <Button
                                        className="w-full"
                                        disabled={!selectedGuest && !(isNewGuest && newGuest.firstName && newGuest.email && newGuest.phoneNumber)}
                                        onClick={() => setStep('room')}
                                    >
                                        Next: Select Room <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 2: Room */}
                        {step === 'room' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BedDouble className="h-5 w-5 text-blue-600" /> Available Rooms Tonight
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label>Check-In</Label>
                                            <Input type="datetime-local" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>Check-Out</Label>
                                            <Input type="datetime-local" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
                                        </div>
                                    </div>
                                    {roomsLoading ? <p className="text-gray-500 text-center py-4">Loading rooms...</p> : (
                                        <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto">
                                            {availableRooms?.map((room: any) => (
                                                <button
                                                    key={room.id}
                                                    onClick={() => setSelectedRoom(room)}
                                                    className={`border rounded-lg p-3 text-left transition-all ${selectedRoom?.id === room.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-lg">Room {room.roomNumber}</span>
                                                        <span className="text-green-700 font-semibold">${room.pricePerNight}/night</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500">{room.type} · Floor {room.floor} · {room.capacity} guests</p>
                                                    {room.bedType && <p className="text-xs text-gray-400">{room.bedType}</p>}
                                                </button>
                                            ))}
                                            {(!availableRooms || availableRooms.length === 0) && (
                                                <p className="col-span-2 text-center text-gray-500 py-4">No rooms available for selected dates</p>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setStep('guest')}>← Back</Button>
                                        <Button className="flex-1" disabled={!selectedRoom} onClick={() => setStep('pricing')}>
                                            Next: Pricing <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 3: Pricing */}
                        {step === 'pricing' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-blue-600" /> Pricing
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                                        <div className="flex justify-between"><span className="text-gray-600">Room {selectedRoom?.roomNumber} · {nights} night(s)</span><span className="font-medium">${selectedRoom?.pricePerNight}/night</span></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label>Override Price ($/night)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder={String(selectedRoom?.pricePerNight ?? 0)}
                                                value={overridePrice ?? ''}
                                                onChange={e => setOverridePrice(e.target.value ? Number(e.target.value) : null)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Discount Amount ($)</Label>
                                            <Input type="number" step="0.01" value={discountAmount} onChange={e => setDiscountAmount(Number(e.target.value))} />
                                        </div>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div>
                                            <Label>Discount Reason</Label>
                                            <Select value={discountReason} onValueChange={setDiscountReason}>
                                                <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                                                <SelectContent>{DISCOUNT_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label>Deposit ($)</Label>
                                            <Input type="number" step="0.01" value={depositAmount} onChange={e => setDepositAmount(Number(e.target.value))} />
                                        </div>
                                        <div>
                                            <Label>Payment Method</Label>
                                            <Select value={String(paymentMethod)} onValueChange={v => setPaymentMethod(Number(v))}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>{PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Special Requests</Label>
                                        <Input value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} placeholder="Any notes or requests..." />
                                    </div>
                                    <div className="border-t pt-3 space-y-1 text-sm">
                                        <div className="flex justify-between"><span className="text-gray-600">Subtotal ({nights} nights)</span><span>${subtotal.toFixed(2)}</span></div>
                                        {discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-${discountAmount.toFixed(2)}</span></div>}
                                        <div className="flex justify-between font-bold text-base"><span>Total</span><span>${finalTotal.toFixed(2)}</span></div>
                                        {depositAmount > 0 && <div className="flex justify-between text-gray-600"><span>Deposit</span><span>-${depositAmount.toFixed(2)}</span></div>}
                                        {depositAmount > 0 && <div className="flex justify-between font-semibold"><span>Balance Due</span><span>${Math.max(0, finalTotal - depositAmount).toFixed(2)}</span></div>}
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setStep('room')}>← Back</Button>
                                        <Button className="flex-1" onClick={() => setStep('confirm')}>
                                            Review & Check In <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 4: Confirm */}
                        {step === 'confirm' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <LogIn className="h-5 w-5 text-green-600" /> Confirm Check-In
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Guest</span><span className="font-medium">{selectedGuest ? `${selectedGuest.firstName} ${selectedGuest.lastName}` : `${newGuest.firstName} ${newGuest.lastName} (new)`}</span></div>
                                        <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Room</span><span className="font-medium">Room {selectedRoom?.roomNumber} ({selectedRoom?.type})</span></div>
                                        <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Check-In</span><span className="font-medium">{format(new Date(checkIn), 'MMM d, yyyy HH:mm')}</span></div>
                                        <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Check-Out</span><span className="font-medium">{format(new Date(checkOut), 'MMM d, yyyy HH:mm')}</span></div>
                                        <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Duration</span><span className="font-medium">{nights} night(s)</span></div>
                                        <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Total Amount</span><span className="font-bold text-lg">${finalTotal.toFixed(2)}</span></div>
                                        {depositAmount > 0 && <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Deposit Paid</span><span className="text-green-600">${depositAmount.toFixed(2)} ({PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label})</span></div>}
                                        {discountAmount > 0 && <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Discount</span><span className="text-green-600">-${discountAmount.toFixed(2)} ({discountReason})</span></div>}
                                    </div>
                                    {selectedGuest?.isBlacklisted && (
                                        <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-red-700 text-sm">
                                            <AlertTriangle className="h-4 w-4 inline mr-2" />
                                            Warning: This guest is flagged. Proceeding overrides the restriction.
                                        </div>
                                    )}
                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setStep('pricing')}>← Back</Button>
                                        <Button
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                            onClick={handleQuickCheckIn}
                                            disabled={quickCheckIn.isPending}
                                        >
                                            {quickCheckIn.isPending ? 'Checking In...' : '✓ Confirm Check-In'}
                                        </Button>
                                    </div>
                                    {quickCheckIn.isError && (
                                        <p className="text-red-600 text-sm text-center">
                                            {(quickCheckIn.error as any)?.response?.data?.message || 'Check-in failed. Please verify room availability and try again.'}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Panel - Currently Checked In */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Currently Checked In
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y max-h-96 overflow-y-auto">
                                    {checkedInReservations?.map((r: any) => (
                                        <div key={r.id} className="p-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-sm">Room {r.roomNumber}</p>
                                                    <p className="text-xs text-gray-500">{r.guestName}</p>
                                                    <p className="text-xs text-gray-400">Out: {format(new Date(r.checkOutDate), 'MMM d')}</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-xs"
                                                    onClick={() => { setCheckoutReservationId(r.id); setFinalPayment(r.remainingAmount ?? 0); setShowExpressCheckout(true); }}
                                                >
                                                    <LogOut className="h-3 w-3 mr-1" /> Out
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!checkedInReservations || checkedInReservations.length === 0) && (
                                        <p className="p-4 text-center text-gray-400 text-sm">No guests checked in</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Guest Intelligence Dialog */}
            <Dialog open={showIntelligence} onOpenChange={setShowIntelligence}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Guest History — {guestIntelligence?.fullName}</DialogTitle>
                    </DialogHeader>
                    {guestIntelligence && (
                        <div className="space-y-4">
                            <div className="flex gap-2 flex-wrap">
                                {guestIntelligence.isVIP && <Badge className="bg-yellow-100 text-yellow-800"><Star className="h-3 w-3 mr-1" />VIP Guest</Badge>}
                                {guestIntelligence.isBlacklisted && <Badge variant="destructive">Blacklisted</Badge>}
                                {guestIntelligence.hasOutstandingPayments && <Badge className="bg-orange-100 text-orange-800">Outstanding Balance</Badge>}
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-2xl font-bold">{guestIntelligence.totalStays}</p>
                                    <p className="text-xs text-gray-500">Total Stays</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-2xl font-bold">${guestIntelligence.totalSpent.toFixed(0)}</p>
                                    <p className="text-xs text-gray-500">Total Spent</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-lg font-bold">{guestIntelligence.mostUsedRoomType ?? '—'}</p>
                                    <p className="text-xs text-gray-500">Preferred Room</p>
                                </div>
                            </div>
                            {guestIntelligence.preferences && <div className="text-sm"><span className="font-medium">Preferences: </span>{guestIntelligence.preferences}</div>}
                            {guestIntelligence.specialRequests && <div className="text-sm"><span className="font-medium">Special Requests: </span>{guestIntelligence.specialRequests}</div>}
                            {guestIntelligence.recentStays.length > 0 && (
                                <div>
                                    <p className="font-medium text-sm mb-2">Recent Stays</p>
                                    <div className="space-y-1">
                                        {guestIntelligence.recentStays.map(s => (
                                            <div key={s.reservationId} className="text-xs flex justify-between bg-gray-50 rounded p-2">
                                                <span>Room {s.roomNumber} ({s.roomType})</span>
                                                <span>{format(new Date(s.checkInDate), 'MMM d')} → {format(new Date(s.checkOutDate), 'MMM d, yyyy')}</span>
                                                <span className="font-medium">${s.totalAmount}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-2 pt-2 border-t">
                                <Button size="sm" variant="outline" onClick={() => updateFlags.mutate({ id: guestIntelligence.guestId, dto: { isVIP: !guestIntelligence.isVIP } })}>
                                    <Star className="h-3 w-3 mr-1" /> {guestIntelligence.isVIP ? 'Remove VIP' : 'Mark VIP'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Express Checkout Dialog */}
            <Dialog open={showExpressCheckout} onOpenChange={setShowExpressCheckout}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>Express Checkout</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        {!checkoutReservationId && (
                            <div>
                                <Label>Select Reservation</Label>
                                <Select value={String(checkoutReservationId ?? '')} onValueChange={v => { setCheckoutReservationId(Number(v)); const r = checkedInReservations?.find((x: any) => x.id === Number(v)); setFinalPayment(r?.remainingAmount ?? 0); }}>
                                    <SelectTrigger><SelectValue placeholder="Choose reservation" /></SelectTrigger>
                                    <SelectContent>{checkedInReservations?.map((r: any) => <SelectItem key={r.id} value={String(r.id)}>Room {r.roomNumber} — {r.guestName}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        )}
                        <div>
                            <Label>Extra Charges ($)</Label>
                            <Input type="number" step="0.01" value={extraCharges} onChange={e => setExtraCharges(Number(e.target.value))} placeholder="0.00" />
                        </div>
                        {extraCharges > 0 && (
                            <div>
                                <Label>Extra Charges Notes</Label>
                                <Input value={extraChargesNotes} onChange={e => setExtraChargesNotes(e.target.value)} placeholder="Minibar, damages, etc." />
                            </div>
                        )}
                        <div>
                            <Label>Final Payment ($)</Label>
                            <Input type="number" step="0.01" value={finalPayment} onChange={e => setFinalPayment(Number(e.target.value))} />
                        </div>
                        <div>
                            <Label>Payment Method</Label>
                            <Select value={String(paymentMethod)} onValueChange={v => setPaymentMethod(Number(v))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowExpressCheckout(false); setCheckoutReservationId(null); }}>Cancel</Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700"
                            disabled={!checkoutReservationId || expressCheckout.isPending}
                            onClick={() => checkoutReservationId && expressCheckout.mutate({ id: checkoutReservationId, dto: { extraCharges, extraChargesNotes, finalPayment: finalPayment || undefined, paymentMethod } })}
                        >
                            {expressCheckout.isPending ? 'Processing...' : 'Checkout'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
