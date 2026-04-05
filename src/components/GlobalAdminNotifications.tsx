import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Ticket, ShoppingCart, Users, Wallet, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useLocation, useNavigate } from 'react-router-dom';

export const GlobalAdminNotifications = () => {
    const { user, profile } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const isAdmin = profile?.role === 'admin';

    useEffect(() => {
        if (!isAdmin) return;

        fetchNotifications();
        
        const channel = supabase.channel('global_admin_notifications_changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_notifications' }, (payload) => {
                setNotifications(prev => [payload.new, ...prev]);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'admin_notifications' }, (payload) => {
                setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new : n));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isAdmin]);

    // Close notifications when route changes
    useEffect(() => {
        setShowNotifications(false);
    }, [location.pathname]);

    const fetchNotifications = async () => {
        const { data } = await supabase
            .from('admin_notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
            
        if (data) setNotifications(data);
    };

    const markAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await supabase.from('admin_notifications').update({ is_read: true }).eq('id', id);
        setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    const markAllAsRead = async () => {
        await supabase.from('admin_notifications').update({ is_read: true }).eq('is_read', false);
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    };

    // If not an admin, don't render anything
    if (!isAdmin) return null;

    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Helper to get correct icon and color per notification type
    const getIconInfo = (type: string) => {
        switch (type) {
            case 'ticket': return { icon: <Ticket className="w-4 h-4" />, classes: 'bg-blue-100 text-blue-600' };
            case 'order': return { icon: <ShoppingCart className="w-4 h-4" />, classes: 'bg-green-100 text-green-600' };
            case 'user': return { icon: <Users className="w-4 h-4" />, classes: 'bg-purple-100 text-purple-600' };
            case 'deposit': return { icon: <Wallet className="w-4 h-4" />, classes: 'bg-yellow-100 text-yellow-600' };
            default: return { icon: <Bell className="w-4 h-4" />, classes: 'bg-gray-100 text-gray-600' };
        }
    };

    const handleNotificationClick = (notif: any) => {
        // Mark as read when clicked
        if (!notif.is_read) {
            supabase.from('admin_notifications').update({ is_read: true }).eq('id', notif.id);
            setNotifications(notifications.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        }

        // Navigate based on type
        switch (notif.type) {
            case 'ticket':
                navigate('/admin/tickets');
                break;
            case 'order':
                navigate('/admin/orders');
                break;
            case 'user':
                navigate('/admin/users');
                break;
            case 'deposit':
                // Assuming admin has a way to view deposits/users
                navigate('/admin/users');
                break;
            default:
                break;
        }
        
        setShowNotifications(false);
    };

    // Don't render the floating bell if we are inside the admin dashboard layout 
    // because we'll inject this component directly into the Admin header there, OR
    // we can just use this floating one everywhere. Let's make it a floating widget globally.
    // If they are inside the admin dashboard, we might want it in the header.
    // For simplicity, let's make it a fixed floating button in the bottom right 
    // when outside the admin dashboard, and standard header icon inside?
    // User requested "works throughout the site for only admin".
    // A floating widget at the bottom right is universally visible.

    const isInsideAdminPanel = location.pathname.startsWith('/admin');

    // If inside admin panel, we might prefer integrating to the header, 
    // but the task says "global admin notification system... floating component" in my plan.
    // So we will render it globally. We can position it fixed.

    if (isInsideAdminPanel) {
       // On Admin Panel, we probably still want it to just render in the header, 
       // but App.tsx will be rendering this at the root. 
       // For a truly flexible component, if it's placed in App.tsx without positioning, it won't be visible.
       // Let's make it a fixed floating pill.
    }

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            <div className="relative">
                <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="flex items-center justify-center w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl hover:bg-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-slate-900/20"
                    title="Admin Notifications"
                >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[9px] font-bold">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {showNotifications && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                        <div className="absolute bottom-16 right-0 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-[70vh] origin-bottom-right animate-in fade-in slide-in-from-bottom-4">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-brand/10 text-brand rounded-md flex items-center justify-center">
                                       <Zap className="w-3.5 h-3.5" />
                                    </div>
                                    <h3 className="font-bold text-gray-900">Admin Alerts</h3>
                                </div>
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="text-xs font-bold text-brand hover:text-brand-light transition-colors">
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            
                            <div className="overflow-y-auto flex-1 p-2">
                                {notifications.length === 0 ? (
                                    <div className="p-8 flex flex-col items-center justify-center text-center text-gray-500">
                                        <Bell className="w-8 h-8 text-gray-200 mb-3" />
                                        <p className="text-sm font-medium">No notifications yet.</p>
                                        <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                                    </div>
                                ) : (
                                    notifications.map(notif => {
                                        const { icon, classes } = getIconInfo(notif.type);
                                        return (
                                            <div 
                                                key={notif.id} 
                                                onClick={() => handleNotificationClick(notif)}
                                                className={`p-3 rounded-xl mb-1 flex gap-3 transition-all cursor-pointer hover:bg-gray-50 ${notif.is_read ? 'bg-transparent' : 'bg-brand-50/50'}`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center ${classes}`}>
                                                    {icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <h4 className={`text-sm font-bold truncate pr-3 ${notif.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                                                            {notif.title}
                                                        </h4>
                                                        {!notif.is_read && (
                                                            <button 
                                                                onClick={(e) => markAsRead(notif.id, e)} 
                                                                className="text-gray-400 hover:text-brand shrink-0 focus:outline-none p-1 -m-1" 
                                                                title="Mark as read"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className={`text-xs ${notif.is_read ? 'text-gray-500' : 'text-gray-700 font-medium'} line-clamp-2`}>
                                                        {notif.message}
                                                    </p>
                                                    <span className="text-[10px] text-gray-400 mt-1.5 block font-medium">
                                                        {new Date(notif.created_at).toLocaleString(undefined, {
                                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
