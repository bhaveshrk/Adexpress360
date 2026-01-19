import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import { Ad, CATEGORIES, CITIES_BY_STATE } from '../types';
import {
    Shield, LogOut, Search, CheckCircle, XCircle, Clock, Eye,
    TrendingUp, Users, FileText, Plus, Edit, Trash2, MapPin,
    Phone, ChevronDown, RefreshCw
} from 'lucide-react';

interface AdminStats {
    totalAds: number;
    pendingAds: number;
    approvedAds: number;
    rejectedAds: number;
    totalUsers: number;
}

export function AdminDashboard() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [ads, setAds] = useState<Ad[]>([]);
    const [stats, setStats] = useState<AdminStats>({ totalAds: 0, pendingAds: 0, approvedAds: 0, rejectedAds: 0, totalUsers: 0 });
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
    const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showPostModal, setShowPostModal] = useState(false);

    // Check admin session
    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/admin');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            if (!profile?.is_admin) {
                await supabase.auth.signOut();
                navigate('/admin');
                return;
            }

            fetchData();
        };

        checkAdmin();
    }, [navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch ads from Supabase
            let supabaseAds: Ad[] = [];
            try {
                const { data: adsData } = await supabase
                    .from('ads')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (adsData) supabaseAds = adsData;
            } catch (e) {
                console.log('Supabase fetch error:', e);
            }

            // Also get local ads
            let localAds: Ad[] = [];
            try {
                const stored = localStorage.getItem('adexpress360_ads_local');
                if (stored) localAds = JSON.parse(stored);
            } catch (e) {
                console.log('Local storage error:', e);
            }

            // Merge: prefer Supabase, add local ads not in Supabase
            const supabaseIds = new Set(supabaseAds.map(a => a.id));
            const mergedAds = [
                ...supabaseAds,
                ...localAds.filter(a => !supabaseIds.has(a.id))
            ];

            setAds(mergedAds);
            setStats({
                totalAds: mergedAds.length,
                pendingAds: mergedAds.filter(a => a.approval_status === 'pending').length,
                approvedAds: mergedAds.filter(a => a.approval_status === 'approved' || !a.approval_status).length,
                rejectedAds: mergedAds.filter(a => a.approval_status === 'rejected').length,
                totalUsers: 0,
            });
            // Fetch user count
            const { count } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            setStats(prev => ({ ...prev, totalUsers: count || 0 }));
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (ad: Ad) => {
        // Update in localStorage
        try {
            const stored = localStorage.getItem('adexpress360_ads_local');
            if (stored) {
                const localAds = JSON.parse(stored);
                const updatedAds = localAds.map((a: Ad) =>
                    a.id === ad.id ? { ...a, approval_status: 'approved', approved_at: new Date().toISOString() } : a
                );
                localStorage.setItem('adexpress360_ads_local', JSON.stringify(updatedAds));
            }
        } catch (e) {
            console.log('Local update error:', e);
        }

        // Also try Supabase
        try {
            await supabase.from('ads').update({
                approval_status: 'approved',
                approved_at: new Date().toISOString()
            }).eq('id', ad.id);
        } catch (e) {
            console.log('Supabase update skipped:', e);
        }

        showToast('Ad approved!', 'success');
        fetchData();
    };

    const handleReject = async () => {
        if (!selectedAd || !rejectReason) return;

        // Update in localStorage
        try {
            const stored = localStorage.getItem('adexpress360_ads_local');
            if (stored) {
                const localAds = JSON.parse(stored);
                const updatedAds = localAds.map((a: Ad) =>
                    a.id === selectedAd.id ? {
                        ...a,
                        approval_status: 'rejected',
                        rejection_reason: rejectReason,
                        approved_at: new Date().toISOString()
                    } : a
                );
                localStorage.setItem('adexpress360_ads_local', JSON.stringify(updatedAds));
            }
        } catch (e) {
            console.log('Local update error:', e);
        }

        // Also try Supabase
        try {
            await supabase.from('ads').update({
                approval_status: 'rejected',
                rejection_reason: rejectReason,
                approved_at: new Date().toISOString()
            }).eq('id', selectedAd.id);
        } catch (e) {
            console.log('Supabase update skipped:', e);
        }

        showToast('Ad rejected', 'success');
        setShowRejectModal(false);
        setSelectedAd(null);
        setRejectReason('');
        fetchData();
    };

    const handleDelete = async (ad: Ad) => {
        if (!confirm('Delete this ad permanently?')) return;

        // Delete from localStorage
        try {
            const stored = localStorage.getItem('adexpress360_ads_local');
            if (stored) {
                const localAds = JSON.parse(stored);
                const filteredAds = localAds.filter((a: Ad) => a.id !== ad.id);
                localStorage.setItem('adexpress360_ads_local', JSON.stringify(filteredAds));
            }
        } catch (e) {
            console.log('Local delete error:', e);
        }

        // Also try Supabase
        try {
            await supabase.from('ads').delete().eq('id', ad.id);
        } catch (e) {
            console.log('Supabase delete skipped:', e);
        }

        showToast('Ad deleted', 'success');
        fetchData();
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/admin');
    };

    const filteredAds = ads.filter(ad => {
        if (activeTab === 'all') return true;
        return ad.approval_status === activeTab;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 rounded-full text-xs font-medium flex items-center gap-1"><Clock size={12} /> Pending</span>;
            case 'approved':
                return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle size={12} /> Approved</span>;
            case 'rejected':
                return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-full text-xs font-medium flex items-center gap-1"><XCircle size={12} /> Rejected</span>;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-gray-900 text-white py-4">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="text-primary-400" size={24} />
                        <div>
                            <h1 className="font-bold text-lg">Admin Dashboard</h1>
                            <p className="text-gray-400 text-xs">adexpress360</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/" className="text-gray-400 hover:text-white text-sm">View Site</Link>
                        <button onClick={handleSignOut} className="flex items-center gap-2 text-gray-400 hover:text-white">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                                <FileText className="text-blue-600 dark:text-blue-400" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold dark:text-white">{stats.totalAds}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Total Ads</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl flex items-center justify-center">
                                <Clock className="text-yellow-600 dark:text-yellow-400" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-yellow-600">{stats.pendingAds}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                                <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">{stats.approvedAds}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Approved</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center">
                                <XCircle className="text-red-600 dark:text-red-400" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-600">{stats.rejectedAds}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Rejected</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                                <Users className="text-purple-600 dark:text-purple-400" size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold dark:text-white">{stats.totalUsers}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Users</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                        {(['pending', 'approved', 'rejected', 'all'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                {tab === 'pending' && stats.pendingAds > 0 && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">{stats.pendingAds}</span>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={fetchData} className="p-2 bg-white rounded-lg hover:bg-gray-50">
                            <RefreshCw size={18} />
                        </button>
                        <button
                            onClick={() => setShowPostModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                        >
                            <Plus size={18} /> Post Ad
                        </button>
                    </div>
                </div>

                {/* Ads Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Ad</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Category</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Location</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Stats</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredAds.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500">
                                        No ads found in this category
                                    </td>
                                </tr>
                            ) : (
                                filteredAds.map(ad => (
                                    <tr key={ad.id} className="hover:bg-gray-50">
                                        <td className="py-4 px-4">
                                            <div className="max-w-xs">
                                                <div className="font-medium text-gray-900 truncate">{ad.title}</div>
                                                <div className="text-sm text-gray-500 truncate">{ad.subject}</div>
                                                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                    <Phone size={10} /> {ad.phone_number}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm">
                                                {CATEGORIES.find(c => c.id === ad.category)?.icon}{' '}
                                                {CATEGORIES.find(c => c.id === ad.category)?.label}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-sm flex items-center gap-1">
                                                <MapPin size={12} className="text-gray-400" />
                                                {ad.city}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {getStatusBadge(ad.approval_status || 'pending')}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-xs text-gray-500">
                                                <span className="flex items-center gap-1"><Eye size={12} /> {ad.views_count}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {ad.approval_status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(ad)}
                                                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedAd(ad); setShowRejectModal(true); }}
                                                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(ad)}
                                                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
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

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Reject Ad</h3>
                        <p className="text-gray-600 text-sm mb-4">
                            Rejecting: <strong>{selectedAd?.title}</strong>
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter reason for rejection..."
                            className="w-full p-3 border rounded-xl mb-4 resize-none h-24"
                            required
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setShowRejectModal(false); setSelectedAd(null); setRejectReason(''); }}
                                className="flex-1 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason}
                                className="flex-1 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50"
                            >
                                Reject Ad
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Post Ad Modal (simplified) */}
            {showPostModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-4">Post Ad (Admin)</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            Post an ad on behalf of a user. You can enter any phone number.
                        </p>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const durationDays = parseInt(formData.get('duration') as string) || 30;

                            // Save to localStorage for the hybrid approach
                            const newAd = {
                                id: crypto.randomUUID(),
                                user_id: 'admin',
                                title: String(formData.get('title') || ''),
                                subject: String(formData.get('subject') || ''),
                                description: String(formData.get('description') || ''),
                                phone_number: String(formData.get('phone') || ''),
                                category: String(formData.get('category') || ''),
                                city: String(formData.get('city') || ''),
                                created_at: new Date().toISOString(),
                                expires_at: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
                                approval_status: 'approved',
                                is_active: true,
                                is_featured: false,
                                views_count: 0,
                                calls_count: 0,
                            };

                            // Save to localStorage
                            try {
                                const stored = localStorage.getItem('adexpress360_ads_local');
                                const localAds = stored ? JSON.parse(stored) : [];
                                localAds.unshift(newAd);
                                localStorage.setItem('adexpress360_ads_local', JSON.stringify(localAds));
                            } catch (err) {
                                console.log('Local save error:', err);
                            }

                            // Also try Supabase
                            try {
                                await supabase.from('ads').insert({
                                    ...newAd,
                                    user_id: (await supabase.auth.getUser()).data.user?.id || 'admin',
                                });
                            } catch (err) {
                                console.log('Supabase insert skipped:', err);
                            }

                            showToast('Ad created!', 'success');
                            setShowPostModal(false);
                            fetchData();
                        }} className="space-y-4">
                            <input name="title" placeholder="Title" required className="w-full p-3 border rounded-xl" />
                            <input name="subject" placeholder="Headline" required className="w-full p-3 border rounded-xl" />
                            <textarea name="description" placeholder="Description" required className="w-full p-3 border rounded-xl h-24 resize-none" />
                            <input name="phone" placeholder="Phone Number" required className="w-full p-3 border rounded-xl" />
                            <select name="category" required className="w-full p-3 border rounded-xl">
                                {CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                                ))}
                            </select>
                            <select name="city" required className="w-full p-3 border rounded-xl">
                                {Object.entries(CITIES_BY_STATE).map(([state, cities]) => (
                                    <optgroup key={state} label={state}>
                                        {cities.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>

                            {/* Duration Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Duration</label>
                                <select name="duration" required className="w-full p-3 border rounded-xl">
                                    <option value="7">1 Week</option>
                                    <option value="14">2 Weeks</option>
                                    <option value="30" selected>1 Month</option>
                                    <option value="60">2 Months</option>
                                    <option value="90">3 Months</option>
                                    <option value="180">6 Months</option>
                                    <option value="365">1 Year</option>
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <button type="button" onClick={() => setShowPostModal(false)} className="flex-1 py-3 border rounded-xl">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-3 bg-primary-500 text-white rounded-xl">
                                    Create Ad
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
