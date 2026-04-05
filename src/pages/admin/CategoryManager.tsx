import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { Plus, Edit2, Trash2, Save, X, GripVertical } from 'lucide-react';

type Category = Database['public']['Tables']['categories']['Row'];

export const CategoryManager = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'active' | 'inactive'>('active');
    const [sortOrder, setSortOrder] = useState(0);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        const [categoriesResp, servicesResp] = await Promise.all([
            supabase.from('categories').select('*').order('sort_order', { ascending: true }),
            supabase.from('services').select('category_id, status')
        ]);

        if (categoriesResp.error) {
            console.error("Error fetching categories:", categoriesResp.error);
            setLoading(false);
            return;
        }

        const allCategories = categoriesResp.data || [];
        const allServices = servicesResp.data || [];

        // Determine which categories have at least one active service
        const categoriesWithActiveServices = new Set(
            allServices.filter(s => s.status === 'active').map(s => s.category_id)
        );

        const activeCategories: Category[] = [];

        for (const cat of allCategories) {
            // Delete categories that have NO active services
            if (!categoriesWithActiveServices.has(cat.id)) {
                // Background delete, doesn't need to block UI
                supabase.from('categories').delete().eq('id', cat.id).then(({error}) => {
                    if (error) console.error(`Error auto-deleting empty category ${cat.id}:`, error);
                    else console.log(`Auto-deleted empty category: ${cat.name}`);
                });
            } else {
                activeCategories.push(cat);
            }
        }

        setCategories(activeCategories);
        setLoading(false);
    };

    const handleSave = async () => {
        const payload = {
            name,
            description,
            status,
            sort_order: sortOrder
        };

        if (editId) {
            const { error } = await supabase.from('categories').update(payload).eq('id', editId);
            if (!error) {
                setCategories(categories.map(c => c.id === editId ? { ...c, ...payload } : c));
                resetForm();
            }
        } else {
            const { data, error } = await supabase.from('categories').insert(payload).select().single();
            if (!error && data) {
                setCategories([...categories, data]);
                resetForm();
            }
        }
    };

    const handleEdit = (cat: Category) => {
        setEditId(cat.id);
        setName(cat.name);
        setDescription(cat.description || '');
        setStatus(cat.status as 'active' | 'inactive');
        setSortOrder(cat.sort_order || 0);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This may affect services in this category.')) return;
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (!error) setCategories(categories.filter(c => c.id !== id));
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditId(null);
        setName('');
        setDescription('');
        setSortOrder(0);
        setStatus('active');
    };

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-display text-gray-900">Categories</h1>
                    <p className="text-gray-500">Manage the platforms and groupings for your services.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-brand text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-light transition-all"
                    >
                        <Plus className="w-5 h-5" /> Add Category
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
                    <h2 className="text-lg font-bold mb-4">{editId ? 'Edit Category' : 'New Category'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Category Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
                                placeholder="e.g. Instagram Followers"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Sort Order</label>
                            <input
                                type="number"
                                value={sortOrder}
                                onChange={e => setSortOrder(parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand h-24"
                                placeholder="Briefly describe what services this category includes..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
                            >
                                <option value="active">Active (Visible)</option>
                                <option value="inactive">Inactive (Hidden)</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-3 font-bold">
                        <button onClick={resetForm} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="px-6 py-2.5 rounded-xl bg-brand text-white hover:bg-brand-light">
                            {editId ? 'Update Category' : 'Create Category'}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="p-4 pl-6 w-12">#</th>
                            <th className="p-4">Category Name</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Description</th>
                            <th className="p-4 pr-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-12 text-center text-gray-400">Loading categories...</td></tr>
                        ) : categories.length === 0 ? (
                            <tr><td colSpan={5} className="p-12 text-center text-gray-400">No categories found.</td></tr>
                        ) : (
                            categories.map(cat => (
                                <tr key={cat.id} className="hover:bg-gray-50/50">
                                    <td className="p-4 pl-6 text-gray-400 font-mono text-xs">{cat.sort_order}</td>
                                    <td className="p-4 font-bold text-gray-900">{cat.name}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${cat.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {cat.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500 max-w-xs truncate">{cat.description}</td>
                                    <td className="p-4 pr-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(cat)} className="p-2 text-gray-400 hover:text-brand hover:bg-brand-subtle rounded-lg transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
