import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';

export const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
                emailRedirectTo: `${window.location.origin}/dashboard`
            }
        });

        if (error) {
            setError(error.message);
        } else {
            // Send Notification
            supabase.from('admin_notifications').insert({
                title: 'New User Registration',
                message: `New user signed up: ${name} (${email})`,
                type: 'user'
            }).then();

            setSuccessMsg('Registration was successful! Please check your email for a confirmation link.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-brand-subtle flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md cursor-pointer" onClick={() => navigate('/')}>
                <div className="flex justify-center">
                    <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/30">
                        <Zap className="text-white w-8 h-8 fill-current" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-display">
                    Create an Account
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleRegister}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">User Name</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    required
                                    placeholder="John Doe"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email address</label>
                            <div className="mt-1">
                                <input
                                    type="email"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && <div className="text-red-500 bg-red-50 p-3 rounded-lg text-sm font-medium border border-red-100">{error}</div>}
                        {successMsg && <div className="text-emerald-600 bg-emerald-50 p-3 rounded-lg text-sm font-medium border border-emerald-100 text-center">{successMsg}</div>}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-brand hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50"
                            >
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <span className="text-sm text-gray-600">Already have an account? </span>
                        <button onClick={() => navigate('/login')} className="text-sm font-bold text-brand hover:text-brand-light">
                            Sign in
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
