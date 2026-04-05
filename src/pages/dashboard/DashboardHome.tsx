import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ShoppingCart, Clock, CheckCircle2 } from 'lucide-react';

export const DashboardHome = () => {
    const { profile } = useAuth();
    const [stats, setStats] = useState({ totalActive: 0, totalOrders: 0, totalSpent: 0 });
    const [announcements, setAnnouncements] = useState<any[]>([]);

    useEffect(() => {
        if (profile) {
            fetchStats();
            fetchAnnouncements();
        }
    }, [profile]);

    const fetchAnnouncements = async () => {
        const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3);
        if (data) setAnnouncements(data);
    };

    const fetchStats = async () => {
        // Get basic stats from orders table
        const { data: orders } = await supabase
            .from('orders')
            .select('status, charge')
            .eq('user_id', profile.id);

        if (orders) {
            let active = 0;
            let spent = 0;
            orders.forEach(o => {
                if (['pending', 'processing', 'in_progress'].includes(o.status)) active++;
                if (['completed', 'partial'].includes(o.status)) spent += Number(o.charge);
            });

            setStats({
                totalActive: active,
                totalOrders: orders.length,
                totalSpent: spent
            });
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold font-display mb-2">Welcome back!</h1>
            <p className="text-gray-600 mb-8">Here's what's happening with your account today.</p>

            {
                announcements.length > 0 && (
                    <div className="mb-8 space-y-3">
                        {announcements.map(ann => (
                            <div key={ann.id} className={`p-4 rounded-2xl border flex items-start gap-4 ${ann.type === 'update' ? 'bg-blue-50 border-blue-100 text-blue-900' :
                                ann.type === 'alert' ? 'bg-red-50 border-red-100 text-red-900' :
                                    'bg-orange-50 border-orange-100 text-orange-900'
                                }`}>
                                <div className="mt-1">
                                    <CheckCircle2 className={`w-5 h-5 ${ann.type === 'update' ? 'text-blue-600' :
                                        ann.type === 'alert' ? 'text-red-600' :
                                            'text-orange-600'
                                        }`} />
                                </div>
                                <div>
                                    <h3 className="font-bold">{ann.title}</h3>
                                    <p className="text-sm opacity-90 mt-1">{ann.message}</p>
                                    <p className="text-xs opacity-70 mt-2 font-medium">{new Date(ann.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Active Orders</p>
                        <p className="text-2xl font-bold">{stats.totalActive}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                        <p className="text-2xl font-bold">{stats.totalOrders}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-brand flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Spent</p>
                        <p className="text-2xl font-bold">₦{stats.totalSpent.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold">Recent Activity</h2>
                </div>
                <div className="p-12 text-center text-gray-500">
                    No recent activity to display. Place an order to get started!
                </div>
            </div>
        </div >
    );
};
