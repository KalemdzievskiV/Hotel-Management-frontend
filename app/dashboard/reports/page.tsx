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
    Legend
} from 'recharts';
import { Download, TrendingUp, Users, DollarSign, Activity, CreditCard } from 'lucide-react';
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
                    <TabsList>
                        <TabsTrigger value="revenue">Revenue</TabsTrigger>
                        <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
                        <TabsTrigger value="guests">Guests</TabsTrigger>
                        <TabsTrigger value="payments">Payments</TabsTrigger>
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
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Outstanding Payments</CardTitle>
                                <CardDescription>
                                    Reservations with pending or partial payments.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loadingPayments ? (
                                    <div>Loading...</div>
                                ) : (
                                    <div className="rounded-md border">
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
                                                {outstandingPayments?.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="p-4 text-center text-muted-foreground">
                                                            No outstanding payments found.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    outstandingPayments?.map((payment) => (
                                                        <tr key={payment.reservationId} className="border-t hover:bg-muted/50">
                                                            <td className="p-4 font-medium">{payment.guestName}</td>
                                                            <td className="p-4">{payment.roomNumber}</td>
                                                            <td className="p-4">
                                                                {format(new Date(payment.checkInDate), 'MMM dd')} - {format(new Date(payment.checkOutDate), 'MMM dd')}
                                                            </td>
                                                            <td className="p-4">{formatCurrency(payment.totalAmount)}</td>
                                                            <td className="p-4 text-green-600">{formatCurrency(payment.paidAmount)}</td>
                                                            <td className="p-4 text-red-600 font-bold">{formatCurrency(payment.remainingAmount)}</td>
                                                            <td className="p-4">
                                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                                    {payment.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
