import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

type Category = { id: string, name: string };
type Service = { id: string, name: string, rate: number, min_quantity: number, max_quantity: number, description: string };

export const NewOrder = () => {
    const { profile } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [services, setServices] = useState<Service[]>([]);

    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [link, setLink] = useState('');
    const [quantity, setQuantity] = useState(100);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Derived
    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    const selectedService = services.find(s => s.id === selectedServiceId);
    const charge = selectedService ? (selectedService.rate / 1000) * quantity : 0;

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategoryId) fetchServices(selectedCategoryId);
        else setServices([]);
    }, [selectedCategoryId]);

    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('id, name').eq('status', 'active').order('sort_order');
        if (data) setCategories(data);
    };

    const fetchServices = async (categoryId: string) => {
        const { data } = await supabase.from('services').select('*').eq('category_id', categoryId).eq('status', 'active');
        if (data) {
            setServices(data);
            if (data.length > 0) setSelectedServiceId(data[0].id);
        }
    };

    // Keep service selection in sync with filtering
    useEffect(() => {
        if (filteredServices.length > 0 && !filteredServices.find(s => s.id === selectedServiceId)) {
            setSelectedServiceId(filteredServices[0].id);
        } else if (filteredServices.length === 0) {
            setSelectedServiceId('');
        }
    }, [searchTerm, services]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedService || !profile) return;

        setError('');
        setSuccess('');
        setLoading(true);

        if (quantity < selectedService.min_quantity || quantity > selectedService.max_quantity) {
            setError(`Quantity must be between ${selectedService.min_quantity} and ${selectedService.max_quantity}`);
            setLoading(false);
            return;
        }

        if (profile.balance < charge) {
            setError('Insufficient funds. Please add money to your wallet.');
            setLoading(false);
            return;
        }

        try {
            // 1. Deduct balance
            const newBalance = profile.balance - charge;
            const { error: profileError } = await supabase.from('profiles').update({ balance: newBalance }).eq('id', profile.id);
            if (profileError) throw profileError;

            // 2. Create Order
            const { data: orderData, error: orderError } = await supabase.from('orders').insert({
                user_id: profile.id,
                service_id: selectedService.id,
                link,
                quantity,
                charge,
                status: 'pending'
            }).select().single();

            if (orderError) throw orderError;

            // 3. Log transaction
            await supabase.from('transactions').insert({
                user_id: profile.id,
                amount: -charge,
                type: 'spend',
                balance_after: newBalance,
                description: `Order ${orderData.id.slice(0, 8)} - ${selectedService.name}`,
                order_id: orderData.id
            });

            // 4. Send Notification
            await supabase.from('admin_notifications').insert({
                title: 'New Order',
                message: `User ${profile.email || 'Unknown'} placed an order for ${selectedService.name} (Qty: ${quantity})`,
                type: 'order'
            });

            setSuccess(`Order placed successfully! Charge: ₦${charge.toFixed(2)}`);
            setLink('');
            setQuantity(selectedService.min_quantity);

        } catch (err: any) {
            setError(err.message || 'An error occurred while placing the order.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
            {/* Left: Form */}
            <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <h1 className="text-2xl font-bold font-display mb-6">New Order</h1>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">{error}</div>}
                {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                        <select
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
                            value={selectedCategoryId}
                            onChange={e => setSelectedCategoryId(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select a platform</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Service</label>
                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search services..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    disabled={!selectedCategoryId}
                                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm bg-gray-50 disabled:opacity-50"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                            </div>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50 disabled:bg-gray-50"
                                value={selectedServiceId}
                                onChange={e => setSelectedServiceId(e.target.value)}
                                required
                                disabled={!selectedCategoryId || filteredServices.length === 0}
                            >
                                {filteredServices.length === 0 ? (
                                    <option value="">No services match your search</option>
                                ) : (
                                    filteredServices.map(s => <option key={s.id} value={s.id}>{s.name} - ₦{s.rate}/1k</option>)
                                )}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Link</label>
                        <input
                            type="url"
                            required
                            placeholder="https://instagram.com/p/..."
                            value={link}
                            onChange={e => setLink(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Quantity</label>
                        <input
                            type="number"
                            required
                            min={selectedService?.min_quantity || 1}
                            max={selectedService?.max_quantity || 100000}
                            value={quantity}
                            onChange={e => setQuantity(parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                        {selectedService && (
                            <p className="mt-2 text-xs text-gray-500 font-medium">
                                Min: {selectedService.min_quantity} - Max: {selectedService.max_quantity}
                            </p>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Charge</p>
                            <p className="text-2xl font-bold font-display text-brand">₦{charge.toFixed(4)}</p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !selectedService}
                            className="bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-light transition-all shadow-lg shadow-brand/30 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Place Order'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Right: Info */}
            <div className="w-full md:w-80">
                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 sticky top-6">
                    <h3 className="font-bold text-gray-900 mb-4">Service Details</h3>
                    {selectedService ? (
                        <div className="space-y-4 text-sm text-gray-600">
                            <p><span className="font-bold text-gray-900">Name:</span> {selectedService.name}</p>
                            <p><span className="font-bold text-gray-900">Rate per 1000:</span> ₦{selectedService.rate.toFixed(2)}</p>
                            <div className="h-px bg-gray-200 my-4" />
                            <div>
                                <span className="font-bold text-gray-900 block mb-1">Description:</span>
                                <p className="whitespace-pre-line leading-relaxed">{selectedService.description || 'No description provided.'}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">Select a service to view its details and constraints.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
