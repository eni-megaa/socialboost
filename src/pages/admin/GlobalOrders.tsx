import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { Search, ExternalLink, User } from 'lucide-react';

type Order = Database['public']['Tables']['orders']['Row'] & {
    profiles: { email: string | null };
    services: { name: string };
};

export const GlobalOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        let query = supabase
            .from('orders')
            .select('*, profiles(email), services(name)')
            .order('created_at', { ascending: false });

        if (statusFilter !== 'all') {
            query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;
        if (!error && data) setOrders(data as unknown as Order[]);
        setLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'canceled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
        if (!error) {
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        }
    };

    const filteredOrders = orders.filter(o =>
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.link.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.profiles?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-display text-gray-900 leading-tight">Global Orders</h1>
                    <p className="text-gray-500">Monitor and manage every order placed on Famestack.</p>
                </div>
                <div className="flex bg-white rounded-xl border border-gray-100 p-1 shadow-sm">
                    {['all', 'pending', 'processing', 'completed', 'canceled'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${statusFilter === s ? 'bg-brand text-white' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by ID, Link, or User Email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand bg-white text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <th className="p-4 pl-8">Order Info</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Service</th>
                                <th className="p-4">Charge / Qty</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 pr-8 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="p-12 text-center text-gray-400 italic">Fetching orders...</td></tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr><td colSpan={6} className="p-12 text-center text-gray-400">No orders matching your filters.</td></tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="p-4 pl-8">
                                            <div className="text-xs font-mono text-gray-400 mb-1 group-hover:text-brand transition-colors">#{order.id.slice(0, 12)}</div>
                                            <div className="text-xs text-gray-500 max-w-[180px] truncate flex items-center gap-1">
                                                <ExternalLink className="w-3 h-3" />
                                                <a href={order.link} target="_blank" rel="noreferrer" className="hover:underline">{order.link}</a>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div className="text-sm font-medium text-gray-900 group-hover:text-brand transition-colors">
                                                    {order.profiles?.email || 'Unknown'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-bold text-gray-900">{order.services?.name}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase">Manual / Provider</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-bold text-gray-900">₦{order.charge.toFixed(2)}</div>
                                            <div className="text-xs text-brand font-medium">{order.quantity.toLocaleString()} quantity</div>
                                        </td>
                                        <td className="p-4 font-bold">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase border shadow-sm ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-8 text-right">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                className="bg-gray-50 border border-gray-100 text-xs rounded-lg px-2 py-1 font-bold focus:outline-none focus:ring-1 focus:ring-brand"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="completed">Completed</option>
                                                <option value="canceled">Canceled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
