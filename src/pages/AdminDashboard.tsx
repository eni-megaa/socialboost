import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    BarChart3,
    Layers,
    Settings,
    Globe,
    ListOrdered,
    Users,
    Menu,
    X,
    LogOut,
    Zap,
    Briefcase,
    Package,
    ShoppingCart,
    LifeBuoy,
    CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CategoryManager } from './admin/CategoryManager';
import { ServiceManager } from './admin/ServiceManager';
import { ProviderManager } from './admin/ProviderManager';
import { GlobalOrders } from './admin/GlobalOrders';
import { UserManager } from './admin/UserManager';
import { AdminHome } from './admin/AdminHome';
import { SiteSettings } from './admin/SiteSettings';
import { Announcements } from './admin/Announcements';
import { SupportTickets } from './admin/SupportTickets';
import { AdminPaymentSettings } from './admin/AdminPaymentSettings';

export const AdminDashboardLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const adminNavItems = [
        { name: 'Analytics', path: '/admin', icon: <BarChart3 className="w-5 h-5" /> },
        { name: 'Categories', path: '/admin/categories', icon: <Layers className="w-5 h-5" /> },
        { name: 'Services', path: '/admin/services', icon: <Package className="w-5 h-5" /> },
        { name: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
        { name: 'Providers', path: '/admin/providers', icon: <Globe className="w-5 h-5" /> },
        { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart className="w-5 h-5" /> },
        { name: 'Tickets', path: '/admin/tickets', icon: <LifeBuoy className="w-5 h-5" /> },
        { name: 'Announcements', path: '/admin/announcements', icon: <Settings className="w-5 h-5" /> }, // Bell removed, using settings temporarily until proper icon
        { name: 'Payments', path: '/admin/payments', icon: <Briefcase className="w-5 h-5" /> },
        { name: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 text-white">
                <div className="h-20 flex items-center px-6 border-b border-slate-800">
                    <Link to="/admin" className="flex items-center gap-2 px-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-brand-light rounded-lg flex items-center justify-center">
                            <Zap className="text-white w-5 h-5 fill-current" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight text-white">Famestack</span>
                    </Link>    <span className="text-[10px] bg-brand/20 text-brand px-1.5 py-0.5 rounded uppercase font-bold ml-1">Admin</span>
                </div>

                <div className="p-4 flex-1">
                    <nav className="space-y-1">
                        {adminNavItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive
                                        ? 'bg-brand text-white'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg font-medium text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
                    <div className="md:hidden flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-2 text-brand">
                            <Zap className="w-6 h-6 fill-current" />
                            <span className="font-bold font-display">Famestack</span>
                        </Link>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-900 leading-none">Admin Panel</p>
                            <p className="text-xs text-brand font-medium">System Administrator</p>
                        </div>
                        <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-gray-600">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-50 bg-gray-900/50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
                        <div className="absolute right-0 top-0 bottom-0 w-64 bg-slate-900 flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                                <span className="font-bold text-white">Admin Menu</span>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-4 flex-1">
                                <nav className="space-y-1">
                                    {adminNavItems.map((item) => {
                                        const isActive = location.pathname === item.path;
                                        return (
                                            <Link
                                                key={item.name}
                                                to={item.path}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive
                                                    ? 'bg-brand text-white'
                                                    : 'text-slate-400 hover:bg-slate-800'
                                                    }`}
                                            >
                                                {item.icon}
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}

                {/* Admin Content Area */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <Routes>
                        <Route path="/" element={<AdminHome />} />
                        <Route path="/categories" element={<CategoryManager />} />
                        <Route path="/services" element={<ServiceManager />} />
                        <Route path="/users" element={<UserManager />} />
                        <Route path="/providers" element={<ProviderManager />} />
                        <Route path="/orders" element={<GlobalOrders />} />
                        <Route path="/tickets" element={<SupportTickets />} />
                        <Route path="/announcements" element={<Announcements />} />
                        <Route path="/payments" element={<AdminPaymentSettings />} />
                        <Route path="/settings" element={<SiteSettings />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};
