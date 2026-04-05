import React, { useEffect, useState } from 'react';
import { Bell, Plus, Trash2, Megaphone } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const Announcements = () => {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('update');

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
        if (data) setNews(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this announcement?")) return;
        const { error } = await supabase.from('announcements').delete().eq('id', id);
        if (!error) {
            setNews(news.filter(n => n.id !== id));
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data, error } = await supabase.from('announcements').insert({
            title,
            content: message, // mapped to content in DB
            type,
            is_active: true
        }).select().single();

        if (data) {
            setNews([data, ...news]);
            setTitle('');
            setMessage('');
            setIsCreating(false);
        } else if (error) {
            alert("Error creating announcement");
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-display text-gray-900 leading-tight">Announcements</h1>
                    <p className="text-gray-500">Send news and updates to all your users.</p>
                </div>
                {isCreating ? (
                    <button onClick={() => setIsCreating(false)} className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">
                        Cancel
                    </button>
                ) : (
                    <button onClick={() => setIsCreating(true)} className="bg-brand text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-light transition-all shadow-lg shadow-brand/30">
                        <Plus className="w-5 h-5" /> New Announcement
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                            <textarea
                                required
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand h-24"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
                            >
                                <option value="update">Update</option>
                                <option value="info">Info</option>
                                <option value="alert">Alert</option>
                            </select>
                        </div>
                        <button type="submit" className="bg-brand text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-light transition-all w-full">
                            Publish
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="p-8 text-center text-gray-400 font-medium">Loading Announcements...</div>
                ) : news.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center text-gray-500 font-medium shadow-sm">
                        No announcements published yet.
                    </div>
                ) : news.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${item.is_active ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'}`}>
                                <Megaphone className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">
                                    {item.title}
                                    <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand/10 text-brand">
                                        {item.type || 'info'}
                                    </span>
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                                <p className="text-xs text-gray-400 font-medium mt-2">Published on {new Date(item.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
