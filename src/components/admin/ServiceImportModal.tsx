import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Check, Loader2, ArrowRight, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ProviderService {
    service: string;
    name: string;
    type: string;
    category: string;
    rate: string;
    min: string;
    max: string;
}

interface ServiceImportModalProps {
    provider: { id: string; name: string; api_url: string; api_key: string };
    onClose: () => void;
    onImportComplete: () => void;
}

export const ServiceImportModal = ({ provider, onClose, onImportComplete }: ServiceImportModalProps) => {
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [externalServices, setExternalServices] = useState<ProviderService[]>([]);
    const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState('');
    const [margin, setMargin] = useState(30); // 30% profit margin by default
    const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        setFetchError('');
        try {
            const { data: result, error } = await supabase.functions.invoke('provider-proxy', {
                body: { provider_id: provider.id, action: 'services' },
            });

            if (error) throw new Error(error.message || 'Failed to reach the proxy function');
            if (!result?.success) throw new Error(result?.error || 'Provider connection failed');

            const services = result.data;
            if (Array.isArray(services)) {
                setExternalServices(services);
            } else {
                throw new Error('Provider returned an unexpected format. Check the API URL is correct (should end in /api/v2).');
            }
        } catch (err: any) {
            setFetchError(err.message || 'Failed to connect to provider API.');
            console.error('Failed to fetch services:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleService = (id: string) => {
        const next = new Set(selectedServices);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedServices(next);
    };

    const toggleAll = () => {
        if (selectedServices.size === filteredServices.length) {
            setSelectedServices(new Set());
        } else {
            setSelectedServices(new Set(filteredServices.map(s => s.service)));
        }
    };

    const handleImport = async () => {
        if (selectedServices.size === 0) return;
        setImporting(true);

        const servicesToImport = externalServices.filter(s => selectedServices.has(s.service));

        try {
            for (const s of servicesToImport) {
                // 1. Get or Create Category
                let localCategoryId = categoryMap[s.category];
                if (!localCategoryId) {
                    // Check if category exists by name
                    const { data: existingCat } = await supabase.from('categories').select('id').eq('name', s.category).single();
                    if (existingCat) {
                        localCategoryId = existingCat.id;
                    } else {
                        // Create new category
                        const { data: newCat, error: catError } = await supabase.from('categories').insert({ name: s.category }).select().single();
                        if (catError) throw catError;
                        localCategoryId = newCat.id;
                    }
                    setCategoryMap(prev => ({ ...prev, [s.category]: localCategoryId }));
                }

                // 2. Calculate Rate
                const providerRate = parseFloat(s.rate);
                const ourRate = providerRate * (1 + margin / 100);

                // 3. Insert Service
                await supabase.from('services').insert({
                    name: s.name,
                    category_id: localCategoryId,
                    provider_id: provider.id,
                    provider_service_id: s.service,
                    rate: ourRate,
                    provider_rate: providerRate,
                    min_quantity: parseInt(s.min),
                    max_quantity: parseInt(s.max),
                    status: 'active',
                    type: 'default'
                });
            }

            onImportComplete();
            onClose();
        } catch (err) {
            console.error('Import failed:', err);
            alert('Failed to import some services. Please check the logs.');
        } finally {
            setImporting(false);
        }
    };

    const filteredServices = externalServices.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            Sync Services from {provider.name}
                            <span className="text-xs bg-brand/10 text-brand px-2 py-1 rounded-full uppercase tracking-tighter">API V2</span>
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Found {externalServices.length} services available on provider panel.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Controls */}
                <div className="p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-6 items-end bg-white">
                    <div className="md:col-span-5">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Search Catalog</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or category..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all font-medium text-sm"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <TrendingUp className="w-3 h-3" /> Profit Margin (%)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={margin}
                                onChange={e => setMargin(parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand font-bold text-brand"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">%</span>
                        </div>
                    </div>
                    <div className="md:col-span-4 flex gap-3">
                        <button
                            onClick={toggleAll}
                            className="flex-1 py-3 px-4 rounded-2xl border border-gray-100 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            {selectedServices.size === filteredServices.length ? 'Deselect All' : 'Select All'}
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={selectedServices.size === 0 || importing}
                            className="flex-[2] bg-brand text-white py-3 px-6 rounded-2xl font-bold text-sm shadow-xl shadow-brand/30 hover:bg-brand-light disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                            {importing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Import {selectedServices.size} Services <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/20">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-brand" />
                            <p className="font-bold tracking-tight">Connecting to provider API...</p>
                        </div>
                    ) : fetchError ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 p-8">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-400">
                                <X className="w-8 h-8" />
                            </div>
                            <p className="text-xl font-bold text-gray-900">Connection Failed</p>
                            <p className="text-sm text-red-500 text-center max-w-sm bg-red-50 rounded-2xl p-4 font-mono">{fetchError}</p>
                            <p className="text-sm text-gray-400 text-center">Make sure the API URL and API key are correct. You can edit the provider details and try again.</p>
                            <button onClick={fetchServices} className="mt-2 px-6 py-3 bg-brand text-white rounded-2xl font-bold text-sm hover:bg-brand-light transition-all">
                                Retry Connection
                            </button>
                        </div>
                    ) : filteredServices.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                            <Search className="w-16 h-16 mb-4" />
                            <p className="text-xl font-bold">No services found</p>
                            <p className="text-sm">Try adjusting your search criteria</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {filteredServices.map(s => (
                                <div
                                    key={s.service}
                                    onClick={() => toggleService(s.service)}
                                    className={`p-5 rounded-[2rem] border transition-all cursor-pointer flex items-center gap-6 ${selectedServices.has(s.service)
                                        ? 'bg-brand/5 border-brand shadow-sm translate-x-1'
                                        : 'bg-white border-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${selectedServices.has(s.service) ? 'bg-brand border-brand text-white' : 'border-gray-200 text-transparent'
                                        }`}>
                                        <Check className="w-4 h-4 stroke-[3]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter bg-gray-100 px-2 py-0.5 rounded-full">ID: {s.service}</span>
                                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase truncate max-w-[150px]">{s.category}</span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 truncate">{s.name}</h4>
                                    </div>
                                    <div className="text-right whitespace-nowrap">
                                        <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Cost / Your Price</p>
                                        <div className="flex items-center gap-2 justify-end">
                                            <span className="text-xs text-gray-400 line-through">₦{parseFloat(s.rate).toFixed(3)}</span>
                                            <span className="text-base font-black text-gray-900">₦{(parseFloat(s.rate) * (1 + margin / 100)).toFixed(3)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
