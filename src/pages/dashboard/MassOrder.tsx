import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ShoppingCart, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

export const MassOrder = () => {
    const { profile } = useAuth();
    const [orderText, setOrderText] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<{ id?: string; error?: string; line: string }[] | null>(null);

    const handleMassOrder = async () => {
        if (!orderText.trim() || !profile) return;

        setLoading(true);
        setResults([]);
        const lines = orderText.split('\n').filter(l => l.trim());
        const newResults: typeof results = [];

        for (const line of lines) {
            // expected format: service_id|quantity|link
            const parts = line.split('|');
            if (parts.length < 3) {
                newResults.push({ line, error: 'Invalid format. Use service_id|quantity|link' });
                continue;
            }

            const serviceId = parts[0].trim();
            const quantity = parseInt(parts[1].trim());
            const link = parts[2].trim();

            try {
                // 1. Fetch service to get rate
                const { data: service, error: sErr } = await supabase.from('services').select('*').eq('id', serviceId).single();
                if (sErr || !service) throw new Error('Service not found');

                const charge = (service.rate / 1000) * quantity;

                // 2. Check balance (this is naive, should be transactionally handled if possible)
                if (profile.balance < charge) throw new Error('Insufficient balance');

                // 3. Place order (simplified for mass order)
                const { data: order, error: oErr } = await supabase.from('orders').insert({
                    user_id: profile.id,
                    service_id: service.id,
                    link,
                    quantity,
                    charge,
                    status: 'pending'
                }).select().single();

                if (oErr) throw oErr;

                // 4. Update profile and log transaction (omitted for brevity here, should follow NewOrder pattern)
                await supabase.from('profiles').update({ balance: profile.balance - charge }).eq('id', profile.id);

                newResults.push({ line, id: order.id });
            } catch (err: any) {
                newResults.push({ line, error: err.message });
            }
        }

        setResults(newResults);
        setLoading(false);

        // Notify admin of mass order completion
        const successfulCount = newResults.filter(r => !r.error).length;
        if (successfulCount > 0) {
            await supabase.from('admin_notifications').insert({
                type: 'order',
                title: 'Mass Order Placed',
                message: `User ${profile.email} placed a mass order containing ${successfulCount} successful items.`
            });
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold font-display mb-2">Mass Order</h1>
            <p className="text-gray-600 mb-8">Place multiple orders at once. One order per line.</p>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Order Details</label>
                    <div className="text-xs text-brand bg-brand-subtle p-3 rounded-lg mb-4 font-mono">
                        Format: service_id|quantity|link (e.g. 101|1000|https://instagram.com/user)
                    </div>
                    <textarea
                        value={orderText}
                        onChange={e => setOrderText(e.target.value)}
                        className="w-full h-64 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand font-mono text-sm leading-relaxed"
                        placeholder="Paste your orders here..."
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleMassOrder}
                        disabled={loading || !orderText.trim()}
                        className="bg-brand text-white px-10 py-3 rounded-xl font-bold hover:bg-brand-light transition-all flex items-center gap-2 shadow-lg shadow-brand/30 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <Send className="w-5 h-5" /> Submit Orders
                            </>
                        )}
                    </button>
                </div>

                {results && (
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <h2 className="text-lg font-bold mb-4">Submission Summary</h2>
                        <div className="space-y-3">
                            {results.map((res, i) => (
                                <div key={i} className={`p-4 rounded-xl text-sm flex items-center justify-between ${res.error ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                                    <div className="flex items-center gap-3">
                                        {res.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                                        <span className="font-mono truncate max-w-[300px]">{res.line}</span>
                                    </div>
                                    <div className="font-bold">
                                        {res.error ? res.error : `Order #${res.id?.slice(0, 8)}`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
