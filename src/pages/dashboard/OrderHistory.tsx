import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';

type Order = Database['public']['Tables']['orders']['Row'] & {
    services: { name: string, type: string };
};

export const OrderHistory = () => {
    const { profile } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile) {
            fetchOrders();
        }
    }, [profile]);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*, services(name, type)')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setOrders(data as unknown as Order[]);
        }
        setLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'canceled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold font-display mb-2">Order History</h1>
            <p className="text-gray-600 mb-8">Track the status of all your service requests.</p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="p-4 pl-6">ID</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Link</th>
                                <th className="p-4">Charge</th>
                                <th className="p-4">Start / Remains</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading orders...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-500 font-medium">You haven't placed any orders yet.</td></tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 pl-6 font-mono text-xs text-gray-500">{order.id.slice(0, 8)}</td>
                                        <td className="p-4 text-sm font-medium">{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-sm">
                                            <div className="max-w-[200px] truncate text-brand">
                                                <a href={order.link} target="_blank" rel="noreferrer">{order.link}</a>
                                            </div>
                                            <div className="text-xs text-gray-400 truncate">{order.services?.name}</div>
                                        </td>
                                        <td className="p-4 text-sm font-bold text-gray-900">₦{order.charge.toFixed(2)}</td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {order.start_count || '-'} / {order.remains || order.quantity}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(order.status)}`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
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
