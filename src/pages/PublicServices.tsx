import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShoppingCart, LayoutGrid, AlertCircle, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const getIconForService = (name: string) => {
    // Basic mapping logic
    return <ShoppingCart className="w-5 h-5" />;
};

export const PublicServices = () => {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        // Using anon key, we assume RLS allows anonymous SELECT on services OR we fetch only active ones. 
        // If RLS prevents anonymous see if we need to adjust.
        const { data, error } = await supabase.from('services').select('*').eq('status', 'active').order('provider_id');
        if (data) {
            setServices(data);
        } else {
            console.error("Error fetching services:", error);
        }
        setLoading(false);
    };

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-white">
            <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <Zap className="text-white w-6 h-6 fill-current" />
                        </div>
                        <span className="font-display font-bold text-2xl tracking-tight text-gray-900">Famestack</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Home</Link>
                        <Link to="/services" className="text-sm font-bold text-brand transition-colors">Services</Link>
                        <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Login</Link>
                        <Link to="/register" className="bg-brand text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-brand-light transition-all shadow-lg shadow-brand/25 hover:shadow-brand/40 hover:-translate-y-0.5">
                            Get Started
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6 leading-tight">
                        Our Complete Range of Services
                    </h1>
                    <p className="text-xl text-gray-500">
                        Everything you need to grow your social presence in one place.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto mb-12 relative">
                    <input
                        type="text"
                        placeholder="Search for a service..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-6 pr-12 py-4 rounded-2xl border border-gray-200 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all text-lg shadow-sm"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
                    </div>
                ) : services.length === 0 ? (
                    <div className="text-center py-20 px-6 bg-gray-50 rounded-3xl border border-gray-100">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No services found</h3>
                        <p className="text-gray-500">We couldn't find any services matching your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredServices.map((service) => (
                            <div key={service.id} className="bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-xl hover:shadow-brand/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
                                <div className="w-12 h-12 rounded-2xl bg-brand-subtle flex items-center justify-center text-brand mb-6 group-hover:scale-110 transition-transform duration-300">
                                    {getIconForService(service.name)}
                                </div>
                                <h3 className="text-xl font-bold font-display text-gray-900 mb-2">{service.name}</h3>
                                <div className="text-sm text-gray-500 mb-6 flex-grow">{service.description || 'Premium social media growth service.'}</div>
                                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                    <div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Starting at</div>
                                        <div className="text-2xl font-bold font-display text-brand">
                                            ₦{service.rate}
                                            <span className="text-sm text-gray-400 font-medium tracking-normal">/1k</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-brand group-hover:text-white transition-colors"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
