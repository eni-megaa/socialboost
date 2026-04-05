import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ShoppingCart, Users, DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';

export const AdminHome = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBalance: 0,
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: [] as any[]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const [usersRes, ordersRes] = await Promise.all([
                supabase.from('profiles').select('id, balance'),
                supabase.from('orders').select('charge, status, created_at, id, profiles(email)').order('created_at', { ascending: false }).limit(5),
            ]);

            const profiles = usersRes.data || [];
            const totalBalance = profiles.reduce((acc, p) => acc + (p.balance || 0), 0);
            const totalUsers = profiles.length;

            const { data: allOrders } = await supabase.from('orders').select('charge').eq('status', 'completed');
            const totalRevenue = (allOrders || []).reduce((acc, o) => acc + Number(o.charge), 0);

            const { count: totalOrders } = await supabase.from('orders').select('id', { count: 'exact', head: true });

            setStats({
                totalUsers,
                totalBalance,
                totalOrders: totalOrders || 0,
                totalRevenue,
                recentOrders: ordersRes.data || [],
            });
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold font-display text-gray-900 leading-tight mb-8">Platform Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> Live
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Total Users</p>
                    <p className="text-2xl font-bold font-display">{stats.totalUsers}</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-brand flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> Live
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                    <p className="text-2xl font-bold font-display">{stats.totalOrders}</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> Live
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold font-display">₦{stats.totalRevenue.toFixed(2)}</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-brand flex items-center justify-center">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> Live
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Total Balance (All Users)</p>
                    <p className="text-2xl font-bold font-display">₦{stats.totalBalance.toFixed(2)}</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <h2 className="text-lg font-bold">Recent Platform Activity</h2>
                    <button className="text-sm font-bold text-brand hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td className="p-12 text-center text-gray-400">Loading activity...</td></tr>
                            ) : stats.recentOrders.length === 0 ? (
                                <tr><td className="p-12 text-center text-gray-400 font-medium">No recent orders yet.</td></tr>
                            ) : stats.recentOrders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 pl-8">
                                        <div className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{order.profiles?.email}</div>
                                        <div className="text-[10px] text-gray-400 font-mono">ID: {order.id.slice(0, 8)}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold border ${order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-bold text-gray-900">₦{order.charge.toFixed(2)}</td>
                                    <td className="p-4 pr-8 text-right text-xs text-gray-400">
                                        {new Date(order.created_at).toLocaleTimeString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
