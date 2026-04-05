import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { Search, User, Trash2, Shield, ShieldOff, Wallet, X, Loader2 } from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const UserManager = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editUser, setEditUser] = useState<Profile | null>(null);
    const [newBalance, setNewBalance] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (data) setUsers(data);
        setLoading(false);
    };

    // Helper: call the admin edge function
    const callManageUser = async (action: string, targetUserId: string) => {
        const { data, error } = await supabase.functions.invoke('manage-user', {
            body: { action, target_user_id: targetUserId },
        });
        if (error) throw new Error(error.message || 'Action failed');
        if (data?.error) throw new Error(data.error);
        return data;
    };

    const handleUpdateBalance = async () => {
        if (!editUser) return;
        setActionLoading('balance');
        const { error } = await supabase.from('profiles').update({ balance: parseFloat(newBalance) }).eq('id', editUser.id);
        if (!error) {
            setUsers(users.map(u => u.id === editUser.id ? { ...u, balance: parseFloat(newBalance) } : u));
            setEditUser(null);
        }
        setActionLoading(null);
    };

    const handleDeleteUser = async (user: Profile) => {
        if (!window.confirm(`Permanently delete "${user.email}"? This cannot be undone.`)) return;
        setActionLoading(user.id + '_delete');
        try {
            await callManageUser('delete', user.id);
            setUsers(users.filter(u => u.id !== user.id));
        } catch (err: any) {
            alert('Delete failed: ' + err.message);
        }
        setActionLoading(null);
    };

    const handleSetRole = async (user: Profile, newRole: 'admin' | 'user') => {
        const action = newRole === 'admin' ? 'set_admin' : 'set_user';
        const label = newRole === 'admin' ? 'promote to Admin' : 'demote to User';
        if (!window.confirm(`${label} "${user.email}"?`)) return;
        setActionLoading(user.id + '_role');
        try {
            await callManageUser(action, user.id);
            setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
        } catch (err: any) {
            alert('Role change failed: ' + err.message);
        }
        setActionLoading(null);
    };

    const filteredUsers = users.filter(u =>
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold font-display mb-2">User Management</h1>
            <p className="text-gray-500 mb-8">Manage all registered users, roles, and balances.</p>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by email or ID..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand bg-white text-sm"
                        />
                    </div>
                    <span className="text-sm text-gray-400 font-medium ml-4">{filteredUsers.length} users</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <th className="p-4 pl-8">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Balance</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4 pr-8 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={5} className="p-12 text-center text-gray-400 italic">Fetching users...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={5} className="p-12 text-center text-gray-400 italic">No users found.</td></tr>
                            ) : filteredUsers.map(user => {
                                const isDeleting = actionLoading === user.id + '_delete';
                                const isRoleChanging = actionLoading === user.id + '_role';
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="p-4 pl-8">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900 group-hover:text-brand transition-colors">{user.email || 'No Email'}</div>
                                                    <div className="text-[10px] text-gray-400 font-mono">ID: {user.id.slice(0, 8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold border ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-bold text-gray-900">₦{user.balance.toFixed(2)}</div>
                                        </td>
                                        <td className="p-4 text-xs text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 pr-8">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Edit Balance */}
                                                <button
                                                    onClick={() => { setEditUser(user); setNewBalance(user.balance.toString()); }}
                                                    title="Edit Balance"
                                                    className="p-2 text-gray-400 hover:text-brand hover:bg-brand/10 rounded-xl transition-all"
                                                >
                                                    <Wallet className="w-4 h-4" />
                                                </button>

                                                {/* Toggle Role */}
                                                {user.role === 'admin' ? (
                                                    <button
                                                        onClick={() => handleSetRole(user, 'user')}
                                                        disabled={isRoleChanging}
                                                        title="Demote to User"
                                                        className="p-2 text-purple-400 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-all disabled:opacity-50"
                                                    >
                                                        {isRoleChanging ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldOff className="w-4 h-4" />}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSetRole(user, 'admin')}
                                                        disabled={isRoleChanging}
                                                        title="Promote to Admin"
                                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all disabled:opacity-50"
                                                    >
                                                        {isRoleChanging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                                    </button>
                                                )}

                                                {/* Delete User */}
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    disabled={isDeleting}
                                                    title="Delete User"
                                                    className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                                                >
                                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Balance Edit Modal */}
            {editUser && (
                <div className="fixed inset-0 z-50 bg-gray-900/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Wallet className="w-6 h-6 text-brand" /> Edit Balance
                            </h2>
                            <button onClick={() => setEditUser(null)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Setting balance for <span className="font-bold text-gray-900">{editUser.email}</span></p>
                        <div className="relative mb-6">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₦</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={newBalance}
                                onChange={e => setNewBalance(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand font-bold text-lg"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setEditUser(null)} className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button
                                onClick={handleUpdateBalance}
                                disabled={actionLoading === 'balance'}
                                className="flex-1 py-3 rounded-xl bg-brand text-white font-bold hover:bg-brand-light shadow-lg shadow-brand/30 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {actionLoading === 'balance' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Update Balance
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
