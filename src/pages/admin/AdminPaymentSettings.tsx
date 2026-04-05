import React, { useState, useEffect } from 'react';
import { Save, Wallet, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PaymentMethod {
    id: string;
    name: string;
    public_key: string | null;
    secret_key: string | null;
    is_active: boolean;
}

export const AdminPaymentSettings = () => {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMethods = async () => {
        try {
            setLoading(true);
            const { data, error: fetchErr } = await supabase
                .from('payment_methods')
                .select('*')
                .order('name');

            if (fetchErr) throw fetchErr;

            // If empty, initialize the default ones in memory so the admin can save them.
            if (!data || data.length === 0) {
                setMethods([
                    { id: 'paystack', name: 'Paystack', public_key: '', secret_key: '', is_active: false },
                    { id: 'flutterwave', name: 'Flutterwave', public_key: '', secret_key: '', is_active: false },
                    { id: 'opay', name: 'OPay', public_key: '', secret_key: '', is_active: false },
                    { id: 'paga', name: 'Paga', public_key: '', secret_key: '', is_active: false },
                ]);
            } else {
                setMethods(data);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch payment methods.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMethods();
    }, []);

    const handleChange = (id: string, field: keyof PaymentMethod, value: any) => {
        setMethods(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            for (const method of methods) {
                const { error: upsertErr } = await supabase
                    .from('payment_methods')
                    .upsert({
                        id: method.id,
                        name: method.name,
                        public_key: method.public_key,
                        secret_key: method.secret_key,
                        is_active: method.is_active,
                        updated_at: new Date().toISOString()
                    });

                if (upsertErr) throw upsertErr;
            }

            alert('Payment settings saved successfully!');
            fetchMethods();
        } catch (err: any) {
            setError(err.message || 'Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
         return (
             <div className="flex justify-center items-center p-20">
                 <RefreshCw className="w-8 h-8 animate-spin text-brand" />
             </div>
         );
    }

    // Special view for missing table
    if (error?.includes('payment_methods') || error?.includes('42P01')) {
        const sqlSnippet = `-- 1. Create the table\ncreate table public.payment_methods (\n  id text primary key, \n  name text not null,\n  public_key text, \n  secret_key text, \n  is_active boolean not null default false,\n  created_at timestamp with time zone default timezone('utc'::text, now()) not null,\n  updated_at timestamp with time zone default timezone('utc'::text, now()) not null\n);\n\n-- 2. Enable RLS\nalter table public.payment_methods enable row level security;\n\n-- 3. Add default rows\ninsert into public.payment_methods (id, name, is_active) values \n  ('paystack', 'Paystack', false),\n  ('flutterwave', 'Flutterwave', false),\n  ('opay', 'OPay', false),\n  ('paga', 'Paga', false);\n\n-- 4. Set policies\ncreate policy "Admins can do everything" on public.payment_methods for all using (is_admin());\ncreate policy "Users can read active" on public.payment_methods for select using (is_active = true);`;

        return (
            <div className="p-10 max-w-4xl mx-auto">
                <div className="bg-orange-50 border border-orange-200 rounded-3xl p-10">
                    <div className="flex items-center gap-4 text-orange-800 mb-6">
                        <AlertCircle className="w-10 h-10" />
                        <div>
                            <h2 className="text-2xl font-bold">Database Setup Required</h2>
                            <p className="font-medium opacity-80">The payment gateway table was not found. Please run the following SQL in your Supabase SQL Editor:</p>
                        </div>
                    </div>
                    
                    <div className="bg-slate-900 rounded-2xl p-6 mb-8 overflow-x-auto shadow-2xl">
                        <pre className="text-brand-light text-sm font-mono leading-relaxed">
                            {sqlSnippet}
                        </pre>
                    </div>

                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-900/20"
                    >
                        I've run the SQL. Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold font-display mb-2">Payment Gateways</h1>
            <p className="text-gray-500 mb-8">Configure your integrated payment processors for Nigeria (Paystack, Flutterwave, OPay, Paga).</p>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 border border-red-100 rounded-xl mb-6 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="space-y-6">
                {methods.map((method) => (
                    <div key={method.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Wallet className="w-6 h-6 text-brand" /> {method.name}
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-bold ${method.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                    {method.is_active ? 'Active' : 'Disabled'}
                                </span>
                                <button
                                    onClick={() => handleChange(method.id, 'is_active', !method.is_active)}
                                    className={`w-14 h-7 rounded-full transition-colors relative ${method.is_active ? 'bg-brand' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${method.is_active ? 'translate-x-7' : ''}`} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Public Key</label>
                                <input
                                    type="text"
                                    value={method.public_key || ''}
                                    onChange={e => handleChange(method.id, 'public_key', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand font-mono text-sm"
                                    placeholder={`pk_test_...`}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Secret Key (Hidden from users)</label>
                                <input
                                    type="password"
                                    value={method.secret_key || ''}
                                    onChange={e => handleChange(method.id, 'secret_key', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand font-mono text-sm"
                                    placeholder={`sk_test_...`}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-brand text-white px-10 py-4 rounded-2xl font-bold hover:bg-brand-light transition-all shadow-xl shadow-brand/30 flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
                        {saving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};
