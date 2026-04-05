import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { Plus, Edit2, Trash2, Globe, Key, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { ServiceImportModal } from '../../components/admin/ServiceImportModal';

type Provider = Database['public']['Tables']['providers']['Row'];

export const ProviderManager = () => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [syncProvider, setSyncProvider] = useState<Provider | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [apiUrl, setApiUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [apiType, setApiType] = useState('v2'); // standard SMM API type
    const [status, setStatus] = useState<'active' | 'inactive'>('active');

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('providers').select('*');
        if (!error && data) setProviders(data);
        setLoading(false);
    };

    const handleSave = async () => {
        // Trim whitespace from URL and key before saving
        const payload = { name: name.trim(), api_url: apiUrl.trim(), api_key: apiKey.trim(), api_type: apiType, status };
        if (editId) {
            const { error } = await supabase.from('providers').update(payload).eq('id', editId);
            if (!error) {
                setProviders(providers.map(p => p.id === editId ? { ...p, ...payload } : p));
                resetForm();
            }
        } else {
            const { data, error } = await supabase.from('providers').insert(payload).select().single();
            if (!error && data) {
                setProviders([...providers, data]);
                resetForm();
            }
        }
    };

    const handleEdit = (p: Provider) => {
        setEditId(p.id);
        setName(p.name);
        setApiUrl(p.api_url);
        setApiKey(p.api_key);
        setApiType(p.api_type || 'v2');
        setStatus(p.status as 'active' | 'inactive');
        setIsAdding(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"? This will also permanently delete all associated services.`)) {
            return;
        }

        const { error } = await supabase.from('providers').delete().eq('id', id);
        if (!error) {
            setProviders(providers.filter(p => p.id !== id));
        } else {
            alert('Failed to delete provider. Please check if there are active orders linked to its services.');
            console.error('Delete error:', error);
        }
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditId(null);
        setName('');
        setApiUrl('');
        setApiKey('');
    };

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-display text-gray-900 leading-tight">External Providers</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Connect to other SMM panels via API to automate orders.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-brand text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-light transition-all shadow-xl shadow-brand/20"
                    >
                        <Plus className="w-5 h-5" /> Add Provider
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 mb-8 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 font-black text-6xl -rotate-12 pointer-events-none uppercase">Provider</div>
                    <h2 className="text-xl font-bold mb-8 relative z-10">{editId ? 'Edit Connection' : 'Register New Panel'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Friendly Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand font-bold text-gray-900"
                                placeholder="e.g. PeakSMM, SMMHeaven"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <LinkIcon className="w-3 h-3" /> API End-Point (V2 URL)
                            </label>
                            <input
                                type="url"
                                value={apiUrl}
                                onChange={e => setApiUrl(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand font-mono text-sm font-bold text-brand"
                                placeholder="https://provider.com/api/v2"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Key className="w-3 h-3" /> API Key / Access Key
                                {editId && <span className="text-brand ml-1">(editing — verify the key below)</span>}
                            </label>
                            <input
                                type="text"
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand font-mono text-sm"
                                placeholder="Paste your API key from the provider's dashboard"
                            />
                            {apiKey && <p className="mt-1 text-xs text-gray-400">{apiKey.length} characters</p>}
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Service Status</label>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand font-bold"
                            >
                                <option value="active">Operational (Active)</option>
                                <option value="inactive">Paused (Inactive)</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-10 flex justify-end gap-3 relative z-10">
                        <button onClick={resetForm} className="px-8 py-3 rounded-2xl border border-gray-100 font-bold text-gray-600 hover:bg-gray-50 transition-all">
                            Discard
                        </button>
                        <button onClick={handleSave} className="px-10 py-3 rounded-2xl bg-brand text-white font-bold hover:bg-brand-light shadow-xl shadow-brand/30 transition-all">
                            {editId ? 'Apply Changes' : 'Connect & Authenticate'}
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-40 text-center">
                        <div className="animate-spin w-10 h-10 border-4 border-brand border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Synchronizing providers...</p>
                    </div>
                ) : providers.length === 0 ? (
                    <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 opacity-50">
                        <Globe className="w-20 h-20 text-gray-300" />
                        <p className="text-gray-400 font-bold text-xl">No providers connected yet.</p>
                        <p className="text-sm">Link your first SMM panel to start automating.</p>
                    </div>
                ) : (
                    providers.map(p => (
                        <div key={p.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 hover:shadow-2xl hover:translate-y-[-4px] transition-all group overflow-hidden relative">
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="w-14 h-14 bg-brand/5 rounded-[1.25rem] flex items-center justify-center text-brand border border-brand/10">
                                    <Globe className="w-7 h-7" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSyncProvider(p)}
                                        className="p-3 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-2xl transition-all"
                                        title="Sync Services"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleEdit(p)} className="p-3 text-gray-400 bg-gray-50 hover:text-brand hover:bg-brand/10 rounded-2xl transition-all">
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id, p.name)}
                                        className="p-3 text-red-400 bg-red-50 hover:text-red-600 hover:bg-red-100 rounded-2xl transition-all"
                                        title="Delete Provider"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="relative z-10 mb-6">
                                <h3 className="text-2xl font-black text-gray-900 mb-1 leading-tight">{p.name}</h3>
                                <p className="text-xs font-mono font-medium text-gray-400 truncate opacity-60">{p.api_url}</p>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-50 relative z-10">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {p.status}
                                </span>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-black uppercase leading-none mb-1 opacity-50">Provider Balance</p>
                                    <p className="text-lg font-black text-gray-900">₦{p.balance?.toFixed(2) || '0.00'}</p>
                                </div>
                            </div>
                            {/* Accent Background Decor */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand/5 rounded-full blur-3xl group-hover:bg-brand/10 transition-colors"></div>
                        </div>
                    ))
                )}
            </div>

            {syncProvider && (
                <ServiceImportModal
                    provider={syncProvider}
                    onClose={() => setSyncProvider(null)}
                    onImportComplete={() => fetchProviders()}
                />
            )}
        </div>
    );
};
