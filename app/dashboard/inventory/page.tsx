'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, CreateInventoryItemDto, CreateInventoryTransactionDto } from '@/lib/api/inventory';
import { hotelsApi } from '@/lib/api/hotels';
import { useAuthStore } from '@/store/authStore';
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
import { AlertTriangle, Package, TrendingDown, DollarSign, Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = [
    { value: 1, label: 'Linens' },
    { value: 2, label: 'Towels' },
    { value: 3, label: 'Amenities' },
    { value: 4, label: 'Cleaning' },
    { value: 5, label: 'Maintenance' },
    { value: 6, label: 'Food & Beverage' },
    { value: 7, label: 'Other' },
];

const TRANSACTION_TYPES = [
    { value: 1, label: 'Usage', color: 'destructive' },
    { value: 2, label: 'Restock', color: 'default' },
    { value: 3, label: 'Damage', color: 'destructive' },
    { value: 4, label: 'Loss', color: 'destructive' },
    { value: 5, label: 'Return', color: 'secondary' },
];

export default function InventoryPage() {
    const { user } = useAuthStore();
    const qc = useQueryClient();
    const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
    const [showAddItem, setShowAddItem] = useState(false);
    const [showTransaction, setShowTransaction] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [newItem, setNewItem] = useState<Partial<CreateInventoryItemDto>>({ category: 1, quantity: 0, minimumThreshold: 5, unitCost: 0, unit: 'pcs' });
    const [txnForm, setTxnForm] = useState<Partial<CreateInventoryTransactionDto>>({ type: 1, quantity: 1 });

    const { data: hotels } = useQuery({
        queryKey: ['hotels'],
        queryFn: () => hotelsApi.getAll(),
    });

    const hotelId = selectedHotelId ?? (hotels?.[0]?.id ?? null);

    const { data: items, isLoading } = useQuery({
        queryKey: ['inventory', hotelId],
        queryFn: () => inventoryApi.getByHotel(hotelId!),
        enabled: !!hotelId,
    });

    const { data: lowStock } = useQuery({
        queryKey: ['inventory-low-stock', hotelId],
        queryFn: () => inventoryApi.getLowStock(hotelId!),
        enabled: !!hotelId,
    });

    const { data: transactions } = useQuery({
        queryKey: ['inventory-transactions', hotelId],
        queryFn: () => inventoryApi.getTransactions(hotelId!),
        enabled: !!hotelId,
    });

    const { data: costAnalysis } = useQuery({
        queryKey: ['inventory-cost', hotelId],
        queryFn: () => inventoryApi.getCostAnalysis(hotelId!),
        enabled: !!hotelId,
    });

    const createItem = useMutation({
        mutationFn: (dto: CreateInventoryItemDto) => inventoryApi.create(dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['inventory', hotelId] });
            qc.invalidateQueries({ queryKey: ['inventory-cost', hotelId] });
            setShowAddItem(false);
            setNewItem({ category: 1, quantity: 0, minimumThreshold: 5, unitCost: 0, unit: 'pcs' });
        },
    });

    const recordTxn = useMutation({
        mutationFn: (dto: CreateInventoryTransactionDto) => inventoryApi.recordTransaction(dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['inventory', hotelId] });
            qc.invalidateQueries({ queryKey: ['inventory-transactions', hotelId] });
            qc.invalidateQueries({ queryKey: ['inventory-low-stock', hotelId] });
            setShowTransaction(false);
            setTxnForm({ type: 1, quantity: 1 });
        },
    });

    const deleteItem = useMutation({
        mutationFn: (id: number) => inventoryApi.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['inventory', hotelId] });
            qc.invalidateQueries({ queryKey: ['inventory-cost', hotelId] });
        },
    });

    const totalValue = items?.reduce((s, i) => s + i.quantity * i.unitCost, 0) ?? 0;
    const lowStockCount = lowStock?.length ?? 0;

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                        <p className="text-gray-500 mt-1">Track linens, towels, amenities and supplies</p>
                    </div>
                    <div className="flex gap-3">
                        {hotels && hotels.length > 1 && (
                            <Select value={String(hotelId)} onValueChange={v => setSelectedHotelId(Number(v))}>
                                <SelectTrigger className="w-48"><SelectValue placeholder="Select hotel" /></SelectTrigger>
                                <SelectContent>
                                    {hotels.map(h => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                        <Button onClick={() => setShowAddItem(true)}>
                            <Plus className="h-4 w-4 mr-2" /> Add Item
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Items</p>
                                    <p className="text-2xl font-bold">{items?.length ?? 0}</p>
                                </div>
                                <Package className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Low Stock Alerts</p>
                                    <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Stock Value</p>
                                    <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Categories</p>
                                    <p className="text-2xl font-bold">{costAnalysis?.length ?? 0}</p>
                                </div>
                                <TrendingDown className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Low Stock Banner */}
                {lowStockCount > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <span className="font-semibold text-red-800">{lowStockCount} item(s) below minimum threshold</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {lowStock?.map(a => (
                                <Badge key={a.itemId} variant="destructive">
                                    {a.itemName}: {a.currentQuantity}/{a.minimumThreshold} {a.shortageAmount > 0 ? `(need ${a.shortageAmount} more)` : ''}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <Tabs defaultValue="items">
                    <TabsList>
                        <TabsTrigger value="items">Stock Items</TabsTrigger>
                        <TabsTrigger value="transactions">Transactions</TabsTrigger>
                        <TabsTrigger value="analysis">Cost Analysis</TabsTrigger>
                    </TabsList>

                    {/* Items Tab */}
                    <TabsContent value="items">
                        <Card>
                            <CardContent className="p-0">
                                {isLoading ? (
                                    <div className="p-8 text-center text-gray-500">Loading inventory...</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b bg-gray-50">
                                                    <th className="text-left p-4 font-medium">Name</th>
                                                    <th className="text-left p-4 font-medium">Category</th>
                                                    <th className="text-right p-4 font-medium">Quantity</th>
                                                    <th className="text-right p-4 font-medium">Min. Threshold</th>
                                                    <th className="text-right p-4 font-medium">Unit Cost</th>
                                                    <th className="text-left p-4 font-medium">Supplier</th>
                                                    <th className="text-left p-4 font-medium">Status</th>
                                                    <th className="text-left p-4 font-medium">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items?.map(item => (
                                                    <tr key={item.id} className="border-b hover:bg-gray-50">
                                                        <td className="p-4 font-medium">{item.name}</td>
                                                        <td className="p-4">
                                                            <Badge variant="outline">{item.categoryName}</Badge>
                                                        </td>
                                                        <td className={`p-4 text-right font-mono ${item.isLowStock ? 'text-red-600 font-bold' : ''}`}>
                                                            {item.quantity} {item.unit}
                                                        </td>
                                                        <td className="p-4 text-right font-mono text-gray-500">{item.minimumThreshold}</td>
                                                        <td className="p-4 text-right">${item.unitCost.toFixed(2)}</td>
                                                        <td className="p-4 text-gray-600">{item.supplier ?? '—'}</td>
                                                        <td className="p-4">
                                                            {item.isLowStock ? (
                                                                <Badge variant="destructive">Low Stock</Badge>
                                                            ) : (
                                                                <Badge className="bg-green-100 text-green-800">OK</Badge>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex gap-2">
                                                                <Button size="sm" variant="outline" onClick={() => { setSelectedItemId(item.id); setTxnForm({ inventoryItemId: item.id, type: 2, quantity: 1 }); setShowTransaction(true); }}>
                                                                    <ArrowUpCircle className="h-3 w-3 mr-1" /> Restock
                                                                </Button>
                                                                <Button size="sm" variant="outline" onClick={() => { setSelectedItemId(item.id); setTxnForm({ inventoryItemId: item.id, type: 1, quantity: 1 }); setShowTransaction(true); }}>
                                                                    <ArrowDownCircle className="h-3 w-3 mr-1" /> Use
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(!items || items.length === 0) && (
                                                    <tr><td colSpan={8} className="p-8 text-center text-gray-500">No inventory items. Add your first item.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Transactions Tab */}
                    <TabsContent value="transactions">
                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-gray-50">
                                                <th className="text-left p-4 font-medium">Date</th>
                                                <th className="text-left p-4 font-medium">Item</th>
                                                <th className="text-left p-4 font-medium">Type</th>
                                                <th className="text-right p-4 font-medium">Qty</th>
                                                <th className="text-left p-4 font-medium">Room</th>
                                                <th className="text-left p-4 font-medium">By</th>
                                                <th className="text-left p-4 font-medium">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions?.map(t => {
                                                const txType = TRANSACTION_TYPES.find(x => x.value === t.type);
                                                return (
                                                    <tr key={t.id} className="border-b hover:bg-gray-50">
                                                        <td className="p-4 text-gray-600">{format(new Date(t.date), 'MMM d, HH:mm')}</td>
                                                        <td className="p-4 font-medium">{t.itemName}</td>
                                                        <td className="p-4">
                                                            <Badge variant={t.type === 2 || t.type === 5 ? 'default' : 'destructive'}>
                                                                {t.typeName}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-4 text-right font-mono">{t.quantity}</td>
                                                        <td className="p-4">{t.roomNumber ?? '—'}</td>
                                                        <td className="p-4 text-gray-600">{t.createdByName}</td>
                                                        <td className="p-4 text-gray-500">{t.notes ?? '—'}</td>
                                                    </tr>
                                                );
                                            })}
                                            {(!transactions || transactions.length === 0) && (
                                                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No transactions recorded yet.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Cost Analysis Tab */}
                    <TabsContent value="analysis">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {costAnalysis?.map(c => (
                                <Card key={c.category}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">{c.categoryName}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Items</span>
                                            <span className="font-medium">{c.itemCount}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Total Quantity</span>
                                            <span className="font-medium">{c.totalQuantity}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Stock Value</span>
                                            <span className="font-semibold text-green-700">${c.totalValue.toFixed(2)}</span>
                                        </div>
                                        {c.lowStockCount > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Low Stock</span>
                                                <Badge variant="destructive">{c.lowStockCount}</Badge>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                            {(!costAnalysis || costAnalysis.length === 0) && (
                                <div className="col-span-3 text-center text-gray-500 py-8">No inventory data to analyze.</div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Add Item Dialog */}
            <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Name</Label>
                            <Input value={newItem.name ?? ''} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Bath Towels" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Category</Label>
                                <Select value={String(newItem.category)} onValueChange={v => setNewItem(p => ({ ...p, category: Number(v) }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={String(c.value)}>{c.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Unit</Label>
                                <Input value={newItem.unit ?? 'pcs'} onChange={e => setNewItem(p => ({ ...p, unit: e.target.value }))} placeholder="pcs, kg, L..." />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <Label>Quantity</Label>
                                <Input type="number" value={newItem.quantity ?? 0} onChange={e => setNewItem(p => ({ ...p, quantity: Number(e.target.value) }))} />
                            </div>
                            <div>
                                <Label>Min. Threshold</Label>
                                <Input type="number" value={newItem.minimumThreshold ?? 5} onChange={e => setNewItem(p => ({ ...p, minimumThreshold: Number(e.target.value) }))} />
                            </div>
                            <div>
                                <Label>Unit Cost ($)</Label>
                                <Input type="number" step="0.01" value={newItem.unitCost ?? 0} onChange={e => setNewItem(p => ({ ...p, unitCost: Number(e.target.value) }))} />
                            </div>
                        </div>
                        <div>
                            <Label>Supplier</Label>
                            <Input value={newItem.supplier ?? ''} onChange={e => setNewItem(p => ({ ...p, supplier: e.target.value }))} placeholder="Optional" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddItem(false)}>Cancel</Button>
                        <Button onClick={() => createItem.mutate({ ...newItem as CreateInventoryItemDto, hotelId: hotelId! })} disabled={!newItem.name || createItem.isPending}>
                            {createItem.isPending ? 'Adding...' : 'Add Item'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Transaction Dialog */}
            <Dialog open={showTransaction} onOpenChange={setShowTransaction}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>Record Transaction</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Item</Label>
                            <Select value={String(txnForm.inventoryItemId ?? '')} onValueChange={v => setTxnForm(p => ({ ...p, inventoryItemId: Number(v) }))}>
                                <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                                <SelectContent>{items?.map(i => <SelectItem key={i.id} value={String(i.id)}>{i.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Transaction Type</Label>
                            <Select value={String(txnForm.type)} onValueChange={v => setTxnForm(p => ({ ...p, type: Number(v) }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{TRANSACTION_TYPES.map(t => <SelectItem key={t.value} value={String(t.value)}>{t.label}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Quantity</Label>
                            <Input type="number" min={1} value={txnForm.quantity ?? 1} onChange={e => setTxnForm(p => ({ ...p, quantity: Number(e.target.value) }))} />
                        </div>
                        <div>
                            <Label>Notes (optional)</Label>
                            <Input value={txnForm.notes ?? ''} onChange={e => setTxnForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. Room 205 checkout" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowTransaction(false)}>Cancel</Button>
                        <Button onClick={() => recordTxn.mutate(txnForm as CreateInventoryTransactionDto)} disabled={!txnForm.inventoryItemId || recordTxn.isPending}>
                            {recordTxn.isPending ? 'Recording...' : 'Record'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
