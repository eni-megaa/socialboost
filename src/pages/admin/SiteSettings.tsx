import React, { useState, useEffect } from 'react';
import { Save, Globe, Shield, Bell, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const SiteSettings = () => {
    const [settings, setSettings] = useState({
        site_name: 'Famestack',
        site_email: 'support@famestack.com',
        maintenance_mode: 'false',
        registration_enabled: 'true',
        logo_url: '',
        hero_image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error: fetchErr } = await supabase
                .from('settings')
                .select('*');

            if (fetchErr) throw fetchErr;

            if (data && data.length > 0) {
                const newSettings = { ...settings };
                data.forEach(item => {
                    if (item.id in newSettings) {
                        (newSettings as any)[item.id] = item.value;
                    }
                });
                setSettings(newSettings);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(false);

            for (const [id, value] of Object.entries(settings)) {
                const { error: upsertErr } = await supabase
                    .from('settings')
                    .upsert({
                        id,
                        value: String(value),
                        updated_at: new Date().toISOString()
                    });

                if (upsertErr) throw upsertErr;
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save settings');
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

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold font-display mb-2">Site Settings</h1>
            <p className="text-gray-500 mb-8">Configure your platform's global branding and operational settings.</p>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 border border-red-100 rounded-xl mb-6 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-emerald-50 text-emerald-700 p-4 border border-emerald-100 rounded-xl mb-6 flex items-center gap-3">
                    <Zap className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">Settings saved successfully!</p>
                </div>
            )}

            <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Globe className="w-6 h-6 text-brand" /> General Branding
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Website Name</label>
                            <input
                                type="text"
                                value={settings.site_name}
                                onChange={e => setSettings({ ...settings, site_name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Support Email</label>
                            <input
                                type="email"
                                value={settings.site_email}
                                onChange={e => setSettings({ ...settings, site_email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand font-medium"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Logo SVG / URL</label>
                            <input
                                type="text"
                                value={settings.logo_url}
                                onChange={e => setSettings({ ...settings, logo_url: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand font-mono text-sm"
                                placeholder="https://..."
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Hero Image URL</label>
                            <input
                                type="text"
                                value={settings.hero_image_url}
                                onChange={e => setSettings({ ...settings, hero_image_url: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand font-mono text-sm"
                                placeholder="https://images.unsplash.com/..."
                            />
                            <p className="text-xs text-gray-400 mt-2">This image appears in the hero section of the landing page.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Shield className="w-6 h-6 text-brand" /> System Controls
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div>
                                <p className="font-bold text-gray-900">Maintenance Mode</p>
                                <p className="text-sm text-gray-500">Disable the frontend for everyone except admins.</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, maintenance_mode: settings.maintenance_mode === 'true' ? 'false' : 'true' })}
                                className={`w-14 h-7 rounded-full transition-colors relative ${settings.maintenance_mode === 'true' ? 'bg-brand' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${settings.maintenance_mode === 'true' ? 'translate-x-7' : ''}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div>
                                <p className="font-bold text-gray-900">Allow New Registrations</p>
                                <p className="text-sm text-gray-500">Enable or disable the sign-up page.</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, registration_enabled: settings.registration_enabled === 'true' ? 'false' : 'true' })}
                                className={`w-14 h-7 rounded-full transition-colors relative ${settings.registration_enabled === 'true' ? 'bg-brand' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${settings.registration_enabled === 'true' ? 'translate-x-7' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
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

