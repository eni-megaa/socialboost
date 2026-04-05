import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { User, Mail, Calendar, Save, CheckCircle } from 'lucide-react';

export const Account = () => {
    const { user, profile } = useAuth();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Since full_name is not in profiles table, we'll try to use user metadata or nothing for now
        if (user?.user_metadata?.full_name) {
            setName(user.user_metadata.full_name);
        } else if (user?.email) {
            // Fallback for UI purposes
            setName(user.email.split('@')[0]);
        }
    }, [user]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                data: { full_name: name }
            });

            if (updateError) throw updateError;

            // Notify admin of profile update
            await supabase.from('admin_notifications').insert({
                type: 'user',
                title: 'Profile Updated',
                message: `User ${user.email} updated their profile name.`
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold font-display mb-8">Manage Account</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Overview */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-center">
                        <div className="w-24 h-24 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">
                            <User className="w-12 h-12" />
                        </div>
                        <h2 className="font-bold text-xl">{name || 'User'}</h2>
                        <p className="text-sm text-gray-500 mb-4">{user.email}</p>
                        <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                            Verified Account
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-bold text-sm text-gray-900 mb-4 uppercase tracking-widest">Account Details</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Section */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                        <h2 className="text-xl font-bold mb-6">Profile Settings</h2>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 text-opacity-50">Email Address</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                                />
                                <p className="mt-2 text-xs text-gray-400">Email cannot be changed manually.</p>
                            </div>

                            <div className="pt-4 border-t border-gray-50 flex items-center justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-light transition-all shadow-lg shadow-brand/30 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {success ? (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Saved!
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            {loading ? 'Updating...' : 'Update Profile'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="mt-8 bg-blue-50 rounded-3xl p-6 border border-blue-100">
                        <h3 className="font-bold text-blue-900 mb-2">Security Tip</h3>
                        <p className="text-sm text-blue-800 leading-relaxed">
                            Always ensure your password is unique and not used on other platforms. We recommend using a mix of letters, numbers, and symbols.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
