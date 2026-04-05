import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { Plus, Edit2, Trash2, Search, Filter, RefreshCw } from 'lucide-react';

type Service = Database['public']['Tables']['services']['Row'] & {
    category?: { name: string };
    provider?: { name: string };
};

export const ServiceManager = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [providers, setProviders] = useState<{ id: string, name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [providerId, setProviderId] = useState('');
    const [providerServiceId, setProviderServiceId] = useState('');
    const [rate, setRate] = useState(0);
    const [minQuantity, setMinQuantity] = useState(1);
    const [maxQuantity, setMaxQuantity] = useState(10000);
    const [status, setStatus] = useState<'active' | 'inactive'>('active');
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        const [servRes, catRes, provRes] = await Promise.all([
            supabase.from('services').select('*, category:categories(name), provider:providers(name)').order('created_at', { ascending: false }),
            supabase.from('categories').select('id, name'),
            supabase.from('providers').select('id, name')
        ]);

        if (!servRes.error) setServices(servRes.data as unknown as Service[]);
        if (!catRes.error) setCategories(catRes.data);
        if (!provRes.error) setProviders(provRes.data);

        setLoading(false);
    };

    const handleSave = async () => {
        const payload = {
            name,
            category_id: categoryId,
            provider_id: providerId || null,
            provider_service_id: providerServiceId || null,
            rate,
            min_quantity: minQuantity,
            max_quantity: maxQuantity,
            status,
            description,
            type: 'default'
        };

        if (editId) {
            const { error } = await supabase.from('services').update(payload).eq('id', editId);
            if (!error) {
                fetchInitialData();
                resetForm();
            }
        } else {
            const { error } = await supabase.from('services').insert(payload);
            if (!error) {
                fetchInitialData();
                resetForm();
            }
        }
    };

    const handleEdit = (s: Service) => {
        setEditId(s.id);
        setName(s.name);
        setCategoryId(s.category_id);
        setProviderId(s.provider_id || '');
        setProviderServiceId(s.provider_service_id || '');
        setRate(s.rate);
        setMinQuantity(s.min_quantity);
        setMaxQuantity(s.max_quantity);
        setStatus(s.status as 'active' | 'inactive');
        setDescription(s.description || '');
        setIsAdding(true);
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditId(null);
        setName('');
        setRate(0);
        setDescription('');
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-display text-gray-900">Services</h1>
                    <p className="text-gray-500">Configure your offerings, set profit margins, and map to providers.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-brand text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-light transition-all shadow-lg shadow-brand/20"
                    >
                        <Plus className="w-5 h-5" /> Add Service
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-8">
                    <h2 className="text-xl font-bold mb-8">{editId ? 'Edit Service' : 'Add New Service'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Service Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand font-medium"
                                placeholder="e.g. Instagram Followers [REAL] [HQ]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                            <select
                                value={categoryId}
                                onChange={e => setCategoryId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Provider</label>
                                <select
                                    value={providerId}
                                    onChange={e => setProviderId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand"
                                >
                                    <option value="">No Provider (Manual)</option>
                                    {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Provider Service ID</label>
                                <input
                                    type="text"
                                    value={providerServiceId}
                                    onChange={e => setProviderServiceId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand"
                                    placeholder="External ID"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Our Rate (per 1000)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₦</span>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={rate}
                                        onChange={e => setRate(parseFloat(e.target.value) || 0)}
                                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Min Quantity</label>
                            <input
                                type="number"
                                value={minQuantity}
                                onChange={e => setMinQuantity(parseInt(e.target.value) || 1)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Max Quantity</label>
                            <input
                                type="number"
                                value={maxQuantity}
                                onChange={e => setMaxQuantity(parseInt(e.target.value) || 10000)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description / Instructions</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand h-24"
                                placeholder="Instructions for users..."
                            />
                        </div>
                    </div>

                    <div className="mt-10 flex justify-end gap-3">
                        <button onClick={resetForm} className="px-8 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="px-8 py-3 rounded-xl bg-brand text-white font-bold hover:bg-brand-light shadow-lg shadow-brand/20 transition-all">
                            {editId ? 'Update Service' : 'Create Service'}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-6">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search services..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                        />
                    </div>
                    <button onClick={fetchInitialData} className="p-2 text-gray-400 hover:text-brand transition-colors">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <th className="p-4 pl-8">Service Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Provider</th>
                                <th className="p-4">Rate (1k)</th>
                                <th className="p-4">Min / Max</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 pr-8 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={7} className="p-12 text-center text-gray-400">Loading services...</td></tr>
                            ) : services.map(s => (
                                <tr key={s.id} className="hover:bg-gray-50/50 group transition-all">
                                    <td className="p-4 pl-8">
                                        <div className="font-bold text-gray-900 group-hover:text-brand transition-colors">{s.name}</div>
                                        <div className="text-[10px] text-gray-400 font-mono">ID: {s.id.slice(0, 8)}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs font-medium text-gray-600 px-2 py-1 bg-gray-100 rounded-lg">{s.category?.name || 'Uncategorized'}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg">{s.provider?.name || 'MANUAL'}</span>
                                        {s.provider_service_id && <span className="block text-[10px] text-gray-400 mt-1">External ID: {s.provider_service_id}</span>}
                                    </td>
                                    <td className="p-4 text-sm font-bold text-gray-900">₦{s.rate.toFixed(4)}</td>
                                    <td className="p-4 text-xs text-gray-500">{s.min_quantity} / {s.max_quantity}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="p-4 pr-8 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => handleEdit(s)} className="p-2 text-gray-400 hover:text-brand hover:bg-brand-subtle rounded-xl transition-all">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => { }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
