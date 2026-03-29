'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CalendarDateRangePicker } from '@/components/ui/date-range-picker';
import { downloadCSV } from '@/lib/export';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { Download, TrendingUp, DollarSign, Activity, AlertTriangle, XCircle } from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState({
        from: subDays(new Date(), 30),
        to: new Date(),
    });

    // Fetch Daily Revenue
    const { data: dailyRevenue, isLoading: loadingRevenue } = useQuery({
        queryKey: ['dailyRevenue', dateRange],
        queryFn: () => reportsApi.getDailyRevenue(
            dateRange.from?.toISOString(),
            dateRange.to?.toISOString()
        ),
        enabled: !!dateRange.from && !!dateRange.to,
    });

    // Fetch Occupancy History
    const { data: occupancyHistory, isLoading: loadingOccupancy } = useQuery({
        queryKey: ['occupancyHistory', dateRange],
        queryFn: () => reportsApi.getOccupancyHistory(
            dateRange.from?.toISOString(),
            dateRange.to?.toISOString()
        ),
        enabled: !!dateRange.from && !!dateRange.to,
    });

    // Fetch Guest History
    const { data: guestHistory, isLoading: loadingGuests } = useQuery({
        queryKey: ['guestHistory'],
        queryFn: reportsApi.getGuestVisitHistory,
    });

    // Fetch Outstanding Payments
    const { data: outstandingPayments, isLoading: loadingPayments } = useQuery({
        queryKey: ['outstandingPayments'],
        queryFn: reportsApi.getOutstandingPayments,
    });

    // Fetch Cancellations
    const { data: cancellations, isLoading: loadingCancellations } = useQuery({
        queryKey: ['cancellations', dateRange],
        queryFn: () => reportsApi.getCancellations(dateRange.from?.toISOString(), dateRange.to?.toISOString()),
        enabled: !!dateRange.from && !!dateRange.to,
    });

    // Fetch No-Shows
    const { data: noShows, isLoading: loadingNoShows } = useQuery({
        queryKey: ['noShows', dateRange],
        queryFn: () => reportsApi.getNoShows(dateRange.from?.toISOString(), dateRange.to?.toISOString()),
        enabled: !!dateRange.from && !!dateRange.to,
    });

    // Fetch Payment Reconciliation
    const { data: reconciliation, isLoading: loadingReconciliation } = useQuery({
        queryKey: ['reconciliation', dateRange],
        queryFn: () => reportsApi.getPaymentReconciliation(dateRange.from?.toISOString(), dateRange.to?.toISOString()),
        enabled: !!dateRange.from && !!dateRange.to,
    });

    // Fetch Monthly Revenue
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const { data: monthlyRevenue, isLoading: loadingMonthly } = useQuery({
        queryKey: ['monthlyRevenue', selectedYear],
        queryFn: () => reportsApi.getMonthlyRevenue(selectedYear),
    });

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

    const formatDate = (dateStr: string) => format(new Date(dateStr), 'MMM dd');

    const handleExportRevenue = () => {
        if (!dailyRevenue) return;
        downloadCSV(dailyRevenue, 'revenue-report.csv');
    };

    const handleExportOccupancy = () => {
        if (!occupancyHistory) return;
        downloadCSV(occupancyHistory, 'occupancy-report.csv');
    };

    const handleExportGuests = () => {
        if (!guestHistory) return;
        downloadCSV(guestHistory, 'guest-report.csv');
    };

    const handleExportPayments = () => {
        if (!outstandingPayments) return;
        downloadCSV(outstandingPayments, 'outstanding-payments.csv');
    };

    const handleDateRangeChange = (range: DateRange | undefined) => {
        if (range?.from) {
            setDateRange({
                from: range.from,
                to: range.to || range.from, // Default to same day if no end date
            });
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
                        <p className="text-muted-foreground">
                            Analyze your hotel's performance, revenue, and occupancy trends.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarDateRangePicker date={dateRange} setDate={handleDateRangeChange} />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleExportRevenue}>
                                    Export Revenue Data
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExportOccupancy}>
                                    Export Occupancy Data
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExportGuests}>
                                    Export Guest History
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExportPayments}>
                                    Export Outstanding Payments
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <Tabs defaultValue="revenue" className="space-y-4">
                    <TabsList className="flex-wrap h-auto gap-1">
                        <TabsTrigger value="revenue">Revenue</TabsTrigger>
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                        <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
                        <TabsTrigger value="guests">Guests</TabsTrigger>
                        <TabsTrigger value="payments">Payments</TabsTrigger>
                        <TabsTrigger value="cancellations">Cancellations</TabsTrigger>
                        <TabsTrigger value="noshows">No-Shows</TabsTrigger>
                        <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
                    </TabsList>

                    {/* Revenue Tab */}
                    <TabsContent value="revenue" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {dailyRevenue ? formatCurrency(dailyRevenue.reduce((sum, item) => sum + item.totalRevenue, 0)) : '...'}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Selected period</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Avg. Daily Revenue</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {dailyRevenue && dailyRevenue.length > 0
                                            ? formatCurrency(dailyRevenue.reduce((sum, item) => sum + item.totalRevenue, 0) / dailyRevenue.length)
                                            : '...'}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Selected period</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Revenue Trend</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[350px]">
                                    {loadingRevenue ? (
                                        <div className="h-full flex items-center justify-center">Loading...</div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={dailyRevenue}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis
                                                    dataKey="date"
                                                    tickFormatter={formatDate}
                                                    stroke="#888888"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    stroke="#888888"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickFormatter={(value) => `$${value}`}
                                                />
                                                <Tooltip
                                                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                                                    labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy')}
                                                />
                                                <Bar dataKey="totalRevenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Occupancy Tab */}
                    <TabsContent value="occupancy" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Avg. Occupancy</CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {occupancyHistory && occupancyHistory.length > 0
                                            ? `${(occupancyHistory.reduce((sum, item) => sum + item.occupancyRate, 0) / occupancyHistory.length).toFixed(1)}%`
                                            : '...'}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Selected period</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Occupancy Rate History</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[350px]">
                                    {loadingOccupancy ? (
                                        <div className="h-full flex items-center justify-center">Loading...</div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={occupancyHistory}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis
                                                    dataKey="date"
                                                    tickFormatter={formatDate}
                                                    stroke="#888888"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    stroke="#888888"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickFormatter={(value) => `${value}%`}
                                                />
                                                <Tooltip
                                                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Occupancy']}
                                                    labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy')}
                                                />
                                                <Line type="monotone" dataKey="occupancyRate" stroke="#16a34a" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Guests Tab */}
                    <TabsContent value="guests" className="space-y-4">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Top Guests by Spending</CardTitle>
                                <CardDescription>
                                    Your most valuable customers based on total spend.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loadingGuests ? (
                                    <div>Loading...</div>
                                ) : (
                                    <div className="space-y-8">
                                        {guestHistory?.map((guest) => (
                                            <div key={guest.guestId} className="flex items-center">
                                                <div className="ml-4 space-y-1">
                                                    <p className="text-sm font-medium leading-none">{guest.guestName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {guest.visitCount} visits • Last seen {format(new Date(guest.lastVisit), 'MMM dd, yyyy')}
                                                    </p>
                                                </div>
                                                <div className="ml-auto font-medium">
                                                    {formatCurrency(guest.totalSpent)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Payments Tab */}
                    <TabsContent value="payments" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Outstanding Payments</CardTitle>
                                <CardDescription>Reservations with pending or partial payments.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loadingPayments ? (
                                    <div className="py-8 text-center text-muted-foreground">Loading...</div>
                                ) : (
                                    <div className="rounded-md border overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-muted/50 text-muted-foreground">
                                                <tr>
                                                    <th className="p-4 font-medium">Guest</th>
                                                    <th className="p-4 font-medium">Room</th>
                                                    <th className="p-4 font-medium">Dates</th>
                                                    <th className="p-4 font-medium">Total</th>
                                                    <th className="p-4 font-medium">Paid</th>
                                                    <th className="p-4 font-medium">Remaining</th>
                                                    <th className="p-4 font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {!outstandingPayments?.length ? (
                                                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No outstanding payments.</td></tr>
                                                ) : outstandingPayments.map((p) => (
                                                    <tr key={p.reservationId} className="border-t hover:bg-muted/50">
                                                        <td className="p-4 font-medium">{p.guestName}</td>
                                                        <td className="p-4">{p.roomNumber}</td>
                                                        <td className="p-4">{format(new Date(p.checkInDate), 'MMM dd')} – {format(new Date(p.checkOutDate), 'MMM dd')}</td>
                                                        <td className="p-4">{formatCurrency(p.totalAmount)}</td>
                                                        <td className="p-4 text-green-600">{formatCurrency(p.paidAmount)}</td>
                                                        <td className="p-4 text-red-600 font-bold">{formatCurrency(p.remainingAmount)}</td>
                                                        <td className="p-4"><span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold">{p.status}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Monthly Revenue Tab */}
                    <TabsContent value="monthly" className="space-y-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Year:</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="border rounded px-2 py-1 text-sm"
                            >
                                {[0, 1, 2].map((offset) => {
                                    const y = new Date().getFullYear() - offset;
                                    return <option key={y} value={y}>{y}</option>;
                                })}
                            </select>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Annual Revenue</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {monthlyRevenue ? formatCurrency(monthlyRevenue.reduce((s, m) => s + m.totalRevenue, 0)) : '...'}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{selectedYear}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {monthlyRevenue ? monthlyRevenue.reduce((s, m) => s + m.reservationCount, 0) : '...'}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{selectedYear}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Best Month</CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {monthlyRevenue && monthlyRevenue.length > 0
                                            ? monthlyRevenue.reduce((best, m) => m.totalRevenue > best.totalRevenue ? m : best).month
                                            : '—'}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Highest revenue month</p>
                                </CardContent>
                            </Card>
                        </div>
                        <Card>
                            <CardHeader><CardTitle>Monthly Revenue — {selectedYear}</CardTitle></CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[350px]">
                                    {loadingMonthly ? (
                                        <div className="h-full flex items-center justify-center text-muted-foreground">Loading...</div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={monthlyRevenue}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                                                <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} />
                                                <Bar dataKey="totalRevenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Cancellations Tab */}
                    <TabsContent value="cancellations" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Cancellations</CardTitle>
                                    <XCircle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">
                                        {cancellations ? cancellations.reduce((s, c) => s + c.cancellationCount, 0) : '...'}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Selected period</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Lost Revenue</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">
                                        {cancellations ? formatCurrency(cancellations.reduce((s, c) => s + c.lostRevenue, 0)) : '...'}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Selected period</p>
                                </CardContent>
                            </Card>
                        </div>
                        <Card>
                            <CardHeader><CardTitle>Cancellations Over Time</CardTitle></CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[300px]">
                                    {loadingCancellations ? (
                                        <div className="h-full flex items-center justify-center text-muted-foreground">Loading...</div>
                                    ) : !cancellations?.length ? (
                                        <div className="h-full flex items-center justify-center text-muted-foreground">No cancellations in this period.</div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={cancellations}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="date" tickFormatter={formatDate} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                                <Tooltip labelFormatter={(l) => format(new Date(l), 'MMM dd, yyyy')} />
                                                <Bar dataKey="cancellationCount" name="Cancellations" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Cancellation Details</CardTitle></CardHeader>
                            <CardContent>
                                <div className="rounded-md border overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/50 text-muted-foreground">
                                            <tr>
                                                <th className="p-4 font-medium">Date</th>
                                                <th className="p-4 font-medium">Count</th>
                                                <th className="p-4 font-medium">Lost Revenue</th>
                                                <th className="p-4 font-medium">Most Common Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {!cancellations?.length ? (
                                                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No cancellations in this period.</td></tr>
                                            ) : cancellations.map((c, i) => (
                                                <tr key={i} className="border-t hover:bg-muted/50">
                                                    <td className="p-4">{format(new Date(c.date), 'MMM dd, yyyy')}</td>
                                                    <td className="p-4 font-bold text-red-600">{c.cancellationCount}</td>
                                                    <td className="p-4">{formatCurrency(c.lostRevenue)}</td>
                                                    <td className="p-4 text-muted-foreground">{c.mostCommonReason}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* No-Shows Tab */}
                    <TabsContent value="noshows" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total No-Shows</CardTitle>
                                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-amber-600">
                                        {noShows ? noShows.length : '...'}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Selected period</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Revenue at Risk</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-amber-600">
                                        {noShows ? formatCurrency(noShows.reduce((s, n) => s + n.totalAmount, 0)) : '...'}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Total booked but not arrived</p>
                                </CardContent>
                            </Card>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>No-Show Reservations</CardTitle>
                                <CardDescription>Guests who did not check in for their reservation.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/50 text-muted-foreground">
                                            <tr>
                                                <th className="p-4 font-medium">#</th>
                                                <th className="p-4 font-medium">Guest</th>
                                                <th className="p-4 font-medium">Room</th>
                                                <th className="p-4 font-medium">Expected Check-In</th>
                                                <th className="p-4 font-medium">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loadingNoShows ? (
                                                <tr><td colSpan={5} className="p-8 text-center">Loading...</td></tr>
                                            ) : !noShows?.length ? (
                                                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No no-shows in this period.</td></tr>
                                            ) : noShows.map((n) => (
                                                <tr key={n.reservationId} className="border-t hover:bg-muted/50">
                                                    <td className="p-4 text-muted-foreground">#{n.reservationId}</td>
                                                    <td className="p-4 font-medium">{n.guestName}</td>
                                                    <td className="p-4">{n.roomNumber}</td>
                                                    <td className="p-4">{format(new Date(n.checkInDate), 'MMM dd, yyyy')}</td>
                                                    <td className="p-4 font-medium">{formatCurrency(n.totalAmount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Payment Reconciliation Tab */}
                    <TabsContent value="reconciliation" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Cash</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{reconciliation ? formatCurrency(reconciliation.reduce((s, r) => s + r.cashRevenue, 0)) : '...'}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Card</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{reconciliation ? formatCurrency(reconciliation.reduce((s, r) => s + r.cardRevenue, 0)) : '...'}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Bank Transfer</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{reconciliation ? formatCurrency(reconciliation.reduce((s, r) => s + r.bankTransferRevenue, 0)) : '...'}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Collected</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">{reconciliation ? formatCurrency(reconciliation.reduce((s, r) => s + r.totalRevenue, 0)) : '...'}</div>
                                </CardContent>
                            </Card>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Daily Payment Reconciliation</CardTitle>
                                <CardDescription>Revenue by payment method per day.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/50 text-muted-foreground">
                                            <tr>
                                                <th className="p-4 font-medium">Date</th>
                                                <th className="p-4 font-medium">Transactions</th>
                                                <th className="p-4 font-medium">Cash</th>
                                                <th className="p-4 font-medium">Card</th>
                                                <th className="p-4 font-medium">Bank Transfer</th>
                                                <th className="p-4 font-medium">Other</th>
                                                <th className="p-4 font-medium">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loadingReconciliation ? (
                                                <tr><td colSpan={7} className="p-8 text-center">Loading...</td></tr>
                                            ) : !reconciliation?.length ? (
                                                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No payment data in this period.</td></tr>
                                            ) : reconciliation.map((r, i) => (
                                                <tr key={i} className="border-t hover:bg-muted/50">
                                                    <td className="p-4">{format(new Date(r.date), 'MMM dd, yyyy')}</td>
                                                    <td className="p-4">{r.totalTransactions}</td>
                                                    <td className="p-4">{formatCurrency(r.cashRevenue)}</td>
                                                    <td className="p-4">{formatCurrency(r.cardRevenue)}</td>
                                                    <td className="p-4">{formatCurrency(r.bankTransferRevenue)}</td>
                                                    <td className="p-4">{formatCurrency(r.otherRevenue)}</td>
                                                    <td className="p-4 font-bold">{formatCurrency(r.totalRevenue)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
