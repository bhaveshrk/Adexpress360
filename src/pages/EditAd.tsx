import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAds } from '../contexts/AdsContext';
import { useToast } from '../contexts/ToastContext';
import { CATEGORIES, CITIES_BY_STATE, AdFormData, validatePhone } from '../types';
import { ArrowLeft, Save, X, Star, Search } from 'lucide-react';

export function EditAd() {
    const { id } = useParams<{ id: string }>();
    const { user, loading: authLoading } = useAuth();
    const { getAdById, updateAd } = useAds();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<Partial<AdFormData>>({});
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [citySearch, setCitySearch] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!authLoading && !user) { navigate('/auth'); return; }
        if (id) {
            const ad = getAdById(id);
            if (ad) {
                if (user && ad.user_id !== user.id) {
                    showToast('Access denied', 'error');
                    navigate('/dashboard');
                    return;
                }
                setFormData({
                    title: ad.title,
                    subject: ad.subject,
                    description: ad.description,
                    phone_number: ad.phone_number,
                    category: ad.category,
                    city: ad.city,
                    location: ad.location,
                    is_featured: ad.is_featured,
                });
            } else {
                showToast('Ad not found', 'error');
                navigate('/dashboard');
            }
        }
        setLoading(false);
    }, [id, user, authLoading, navigate, getAdById]);

    const update = (updates: Partial<AdFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
        Object.keys(updates).forEach(key => {
            if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
        });
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title?.trim()) newErrors.title = 'Title is required';
        if (!formData.subject?.trim()) newErrors.subject = 'Headline is required';
        if (!formData.description?.trim()) newErrors.description = 'Description is required';
        if (!validatePhone(formData.phone_number || '')) newErrors.phone_number = 'Valid 10-digit number required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !validate()) return;
        setSubmitting(true);
        try {
            await updateAd(id, formData, user!.id);
            showToast('Ad updated successfully!', 'success');
            navigate('/dashboard');
        } catch {
            showToast('Failed to update', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredCities = Object.entries(CITIES_BY_STATE).reduce((acc, [state, cities]) => {
        const filtered = cities.filter(city =>
            city.toLowerCase().includes(citySearch.toLowerCase()) || state.toLowerCase().includes(citySearch.toLowerCase())
        );
        if (filtered.length > 0) acc[state] = filtered;
        return acc;
    }, {} as Record<string, string[]>);

    if (authLoading || loading) {
        return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-6">
                <div className="container-app">
                    <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors">
                        <ArrowLeft size={18} /> Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Ad</h1>
                </div>
            </div>

            <div className="container-app py-8">
                <div className="max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit} className="card p-6 space-y-6">
                        {/* Category */}
                        <div>
                            <label className="label">Category</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => update({ category: cat.id })}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${formData.category === cat.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        <span className="text-xl">{cat.icon}</span>
                                        <span className="block text-xs font-medium text-gray-900 dark:text-gray-200 mt-1">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* City */}
                        <div>
                            <label className="label">City</label>
                            <div className="relative mb-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    value={citySearch}
                                    onChange={(e) => setCitySearch(e.target.value)}
                                    placeholder="Search city..."
                                    className="input pl-9 py-2 text-sm"
                                />
                            </div>
                            <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800">
                                {Object.entries(filteredCities).slice(0, 8).map(([state, cities]) => (
                                    <div key={state}>
                                        <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase sticky top-0 backdrop-blur-sm">{state}</div>
                                        {cities.slice(0, 5).map(city => (
                                            <button
                                                key={city} type="button"
                                                onClick={() => { update({ city }); setCitySearch(''); }}
                                                className={`w-full text-left px-3 py-2 transition-colors ${formData.city === city ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                                            >{city}</button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Selected: <strong>{formData.city}</strong></p>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="label">Locality</label>
                            <input type="text" value={formData.location || ''} onChange={(e) => update({ location: e.target.value })} placeholder="e.g., Koramangala" className="input" />
                        </div>

                        {/* Title */}
                        <div>
                            <label className="label">Title *</label>
                            <input type="text" value={formData.title || ''} onChange={(e) => update({ title: e.target.value })} className={errors.title ? 'input border-danger-500' : 'input'} />
                            {errors.title && <p className="text-danger-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        {/* Headline */}
                        <div>
                            <label className="label">Headline *</label>
                            <input type="text" value={formData.subject || ''} onChange={(e) => update({ subject: e.target.value })} className={errors.subject ? 'input border-danger-500' : 'input'} />
                            {errors.subject && <p className="text-danger-500 text-sm mt-1">{errors.subject}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="label">Description *</label>
                            <textarea value={formData.description || ''} onChange={(e) => update({ description: e.target.value })} rows={5} className={errors.description ? 'input border-danger-500 resize-none' : 'input resize-none'} />
                            {errors.description && <p className="text-danger-500 text-sm mt-1">{errors.description}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="label">Phone *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600 pr-2 text-sm">+91</span>
                                <input type="tel" value={formData.phone_number || ''} onChange={(e) => update({ phone_number: e.target.value.replace(/\D/g, '').slice(0, 10) })} className={errors.phone_number ? 'input pl-14 border-danger-500' : 'input pl-14'} />
                            </div>
                            {errors.phone_number && <p className="text-danger-500 text-sm mt-1">{errors.phone_number}</p>}
                        </div>

                        {/* Featured */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={formData.is_featured || false} onChange={(e) => update({ is_featured: e.target.checked })} className="w-5 h-5 accent-amber-500" />
                                <span className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                    <Star className="text-amber-500 fill-amber-500" size={16} />
                                    Featured Ad
                                </span>
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <Link to="/dashboard" className="btn-secondary flex-1"><X size={16} /> Cancel</Link>
                            <button type="submit" disabled={submitting} className="btn-primary flex-1">
                                <Save size={16} /> {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
