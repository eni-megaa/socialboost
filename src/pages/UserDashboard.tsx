import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    CreditCard,
    History,
    LifeBuoy,
    Menu,
    X,
    LogOut,
    Zap,
    Send,
    User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

import { DashboardHome } from './dashboard/DashboardHome';
import { NewOrder } from './dashboard/NewOrder';
import { AddFunds } from './dashboard/AddFunds';
import { OrderHistory } from './dashboard/OrderHistory';
import { Support } from './dashboard/Support';
import { MassOrder } from './dashboard/MassOrder';
import { Account } from './dashboard/Account';

export const UserDashboardLayout = () => {
    const { profile } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { name: 'New Order', path: '/dashboard/order', icon: <ShoppingCart className="w-5 h-5" /> },
        { name: 'Mass Order', path: '/dashboard/mass', icon: <Send className="w-5 h-5" /> },
        { name: 'Order History', path: '/dashboard/history', icon: <History className="w-5 h-5" /> },
        { name: 'Add Funds', path: '/dashboard/funds', icon: <CreditCard className="w-5 h-5" /> },
        { name: 'Support', path: '/dashboard/support', icon: <LifeBuoy className="w-5 h-5" /> },
        { name: 'Account', path: '/dashboard/account', icon: <User className="w-5 h-5" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 flex-shrink-0">
                <div className="h-20 flex items-center px-6 border-b border-gray-100">
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                            <Zap className="text-white w-5 h-5 fill-current" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight text-brand">Famestack</span>
                    </Link>
                </div>

                <div className="p-4">
                    <div className="bg-brand-subtle rounded-xl p-4 mb-6">
                        <p className="text-xs text-gray-500 font-medium mb-1">Current Balance</p>
                        <p className="text-2xl font-bold">₦{profile?.balance?.toFixed(2) || '0.00'}</p>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive
                                        ? 'bg-brand text-white shadow-md shadow-brand/20'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="md:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                            <Zap className="text-white w-5 h-5 fill-current" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight text-brand">Famestack</span>
                    </Link>
                    <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-600">
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-50 bg-gray-900/50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
                        <div className="absolute right-0 top-0 bottom-0 w-64 bg-white flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                                <span className="font-bold">Menu</span>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-4 flex-1 overflow-y-auto">
                                <div className="bg-brand-subtle rounded-xl p-4 mb-6">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Current Balance</p>
                                    <p className="text-2xl font-bold">₦{profile?.balance?.toFixed(2) || '0.00'}</p>
                                </div>
                                <nav className="space-y-1">
                                    {navItems.map((item) => {
                                        const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                                        return (
                                            <Link
                                                key={item.name}
                                                to={item.path}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive
                                                    ? 'bg-brand text-white'
                                                    : 'text-gray-600 hover:bg-gray-50'
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

                {/* Page Content View */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="/order" element={<NewOrder />} />
                        <Route path="/mass" element={<MassOrder />} />
                        <Route path="/history" element={<OrderHistory />} />
                        <Route path="/funds" element={<AddFunds />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/account" element={<Account />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};
