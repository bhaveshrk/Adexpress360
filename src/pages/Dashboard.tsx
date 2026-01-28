import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAds } from '../contexts/AdsContext';
import { useToast } from '../contexts/ToastContext';
import { AdCard } from '../components/AdCard';
import { ConfirmDialog } from '../components/Modal';
import { ExtendDurationModal } from '../components/ExtendDurationModal';
import { Ad } from '../types';
import { formatTimeRemaining } from '../utils/security';
import { AnalyticsChart } from '../components/AnalyticsChart';
import { ArrowLeft, Plus, Eye, Phone, TrendingUp, Clock, Bookmark, RefreshCw, Settings, AlertCircle, CheckCircle, XCircle, CheckSquare, Timer, BarChart2, X, Search } from 'lucide-react';

// Get saved ads from localStorage
const SAVED_ADS_KEY = 'findads_saved_ads';
const getSavedAds = (): string[] => {
    try {
        const saved = localStorage.getItem(SAVED_ADS_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

export function Dashboard() {
    const { user, loading: authLoading, signOut } = useAuth();
    const { getUserAds, deleteAd, renewAd, extendAd, getAdById } = useAds();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [deleteConfirm, setDeleteConfirm] = useState<Ad | null>(null);
    const [renewConfirm, setRenewConfirm] = useState<Ad | null>(null);
    const [extendModal, setExtendModal] = useState<{ ad: Ad; mode: 'extend' | 'renew' } | null>(null);
    const [analyticsModal, setAnalyticsModal] = useState<Ad | null>(null);
    const [activeTab, setActiveTab] = useState<'my-ads' | 'saved' | 'searches'>('my-ads');
    const [savedSearches, setSavedSearches] = useState<any[]>([]);

    // @ts-ignore
    const { getSavedSearches, deleteSavedSearch } = useAds();

    React.useEffect(() => {
        if (user) {
            getSavedSearches(user.id).then(setSavedSearches);
        }
    }, [user, getSavedSearches]);

    const handleSearchDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm('Delete this saved search?')) {
            await deleteSavedSearch(id);
            setSavedSearches(prev => prev.filter(s => s.id !== id));
            showToast('Search deleted', 'success');
        }
    };

    React.useEffect(() => {
        if (!authLoading && !user) navigate('/auth');
    }, [user, authLoading, navigate]);

    if (authLoading || !user) {
        return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>;
    }

    const userAds = getUserAds(user.id);

    // Separate by status
    const pendingAds = userAds.filter(ad => ad.approval_status === 'pending');
    const approvedAds = userAds.filter(ad =>
        (!ad.approval_status || ad.approval_status === 'approved') &&
        ad.is_active &&
        new Date(ad.expires_at) > new Date()
    );
    const rejectedAds = userAds.filter(ad => ad.approval_status === 'rejected');
    const expiredAds = userAds.filter(ad => new Date(ad.expires_at) <= new Date());

    const totalViews = userAds.reduce((sum, ad) => sum + ad.views_count, 0);
    const totalCalls = userAds.reduce((sum, ad) => sum + ad.calls_count, 0);

    // Get saved ads
    const savedAdIds = getSavedAds();
    const savedAds = savedAdIds.map(id => getAdById(id)).filter(Boolean) as Ad[];

    const handleEdit = (ad: Ad) => navigate(`/edit-ad/${ad.id}`);
    const handleDelete = (ad: Ad) => setDeleteConfirm(ad);
    const handleRenew = (ad: Ad) => setExtendModal({ ad, mode: 'renew' });
    const handleExtend = (ad: Ad) => setExtendModal({ ad, mode: 'extend' });

    const confirmDelete = async () => {
        if (deleteConfirm && user) {
            const result = await deleteAd(deleteConfirm.id, user.id);
            if (result.success) {
                showToast('Ad deleted', 'success');
            } else {
                showToast(result.error || 'Failed to delete', 'error');
            }
            setDeleteConfirm(null);
        }
    };

    const confirmRenew = async () => {
        if (renewConfirm) {
            await renewAd(renewConfirm.id, 7);
            showToast('Ad renewed for 7 days!', 'success');
            setRenewConfirm(null);
        }
    };

    const confirmExtend = async (days: number) => {
        if (extendModal) {
            if (extendModal.mode === 'extend') {
                await extendAd(extendModal.ad.id, days);
                showToast(`Ad extended by ${days} days!`, 'success');
            } else {
                await renewAd(extendModal.ad.id, days);
                showToast(`Ad renewed for ${days} days!`, 'success');
            }
            setExtendModal(null);
        }
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'pending':
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1"><Clock size={12} /> Pending Approval</span>;
            case 'approved':
                return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle size={12} /> Approved</span>;
            case 'rejected':
                return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1"><XCircle size={12} /> Rejected</span>;
            default:
                return null;
        }
    };

    // Expiry Checklist (<= 2 days)
    const expiringSoonAds = approvedAds.filter(ad => {
        const daysRemaining = (new Date(ad.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
        return daysRemaining > 0 && daysRemaining <= 2;
    });

    // Request notification permission and send alert
    React.useEffect(() => {
        if (expiringSoonAds.length > 0 && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('Ads Expiring Soon!', {
                    body: `You have ${expiringSoonAds.length} ad(s) expiring within 2 days. Renew them now to keep them active.`,
                    icon: '/vite.svg'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
        }
    }, [expiringSoonAds.length]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-6">
                <div className="container-app">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors">
                        <ArrowLeft size={18} /> Back
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome, {user.display_name || user.phone_number}</p>
                        </div>
                        <div className="flex gap-2">
                            <Link to="/post-ad" className="btn-primary">
                                <Plus size={18} /> Post Ad
                            </Link>
                            <button onClick={() => signOut()} className="btn-ghost">
                                <Settings size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-app py-8">
                {/* Expiry Warning Banner */}
                {expiringSoonAds.length > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50 rounded-xl p-4 mb-8 flex items-start gap-4 animate-fade-in shadow-sm">
                        <div className="p-2 bg-orange-100 dark:bg-orange-800/40 rounded-lg shrink-0">
                            <AlertCircle className="text-orange-600 dark:text-orange-400" size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-1">
                                Action Required: {expiringSoonAds.length} Ad{expiringSoonAds.length > 1 ? 's' : ''} Expiring Soon
                            </h3>
                            <p className="text-orange-700 dark:text-orange-300 text-sm mb-3">
                                Some of your ads will expire within 2 days. Renew them now to prevent them from becoming inactive.
                            </p>
                            <div className="flex gap-2 flex-wrap">
                                {expiringSoonAds.slice(0, 3).map(ad => (
                                    <button
                                        key={ad.id}
                                        onClick={() => handleRenew(ad)}
                                        className="text-xs font-medium bg-white dark:bg-gray-800 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700/50 px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1"
                                    >
                                        Renew "{ad.title.slice(0, 15)}..."
                                    </button>
                                ))}
                                {expiringSoonAds.length > 3 && (
                                    <span className="text-xs text-orange-600 dark:text-orange-400 self-center">+{expiringSoonAds.length - 3} more</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-8">
                    <div className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl flex items-center justify-center">
                                <Clock className="text-yellow-600 dark:text-yellow-400" size={20} />
                            </div>
                            <div>
                                <div className="stat-value text-yellow-600">{pendingAds.length}</div>
                                <div className="stat-label">Pending</div>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center">
                                <TrendingUp className="text-primary-600 dark:text-primary-400" size={20} />
                            </div>
                            <div>
                                <div className="stat-value">{approvedAds.length}</div>
                                <div className="stat-label">Active</div>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                                <Eye className="text-gray-600 dark:text-gray-400" size={20} />
                            </div>
                            <div>
                                <div className="stat-value">{totalViews.toLocaleString()}</div>
                                <div className="stat-label">Views</div>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-success-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                                <Phone className="text-success-600 dark:text-green-400" size={20} />
                            </div>
                            <div>
                                <div className="stat-value">{totalCalls}</div>
                                <div className="stat-label">Calls</div>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                                <CheckSquare className="text-blue-600 dark:text-blue-400" size={20} />
                            </div>
                            <div>
                                <div className="stat-value text-blue-600">{expiredAds.length}</div>
                                <div className="stat-label">Fulfilled</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('my-ads')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'my-ads'
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        My Ads ({userAds.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'saved'
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <Bookmark size={14} />
                        Bookmarks ({savedAds.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('searches')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'searches'
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <Search size={14} />
                        Saved Searches ({savedSearches.length})
                    </button>
                </div>

                {/* My Ads Tab */}
                {activeTab === 'my-ads' && (
                    <>
                        {userAds.length > 0 ? (
                            <div className="space-y-6">
                                {/* Pending Ads */}
                                {pendingAds.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlertCircle className="text-yellow-500" size={16} />
                                            <h3 className="text-sm font-semibold text-yellow-600 uppercase tracking-wider">Pending Approval ({pendingAds.length})</h3>
                                        </div>
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                                            <p className="text-sm text-yellow-700">
                                                These ads are waiting for admin approval. They will be visible to everyone once approved.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {pendingAds.map(ad => (
                                                <div key={ad.id} className="relative">
                                                    <div className="absolute top-4 right-4 z-10">
                                                        {getStatusBadge(ad.approval_status)}
                                                    </div>
                                                    <AdCard ad={ad} showActions onEdit={handleEdit} onDelete={handleDelete} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Approved/Active Ads */}
                                {approvedAds.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Active Ads ({approvedAds.length})</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {approvedAds.map(ad => (
                                                <div key={ad.id} className="relative">
                                                    <AdCard ad={ad} showActions onEdit={handleEdit} onDelete={handleDelete} />
                                                    <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                            <span className="flex items-center gap-1"><Eye size={12} /> {ad.views_count}</span>
                                                            <span className="flex items-center gap-1"><Phone size={12} /> {ad.calls_count}</span>
                                                            <span className="flex items-center gap-1">
                                                                <Timer size={12} />
                                                                {formatTimeRemaining(new Date(ad.expires_at))}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setAnalyticsModal(ad)}
                                                                className="flex-1 py-2 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-1"
                                                            >
                                                                <BarChart2 size={12} /> Analytics
                                                            </button>
                                                            <button
                                                                onClick={() => handleExtend(ad)}
                                                                className="flex-1 py-2 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors flex items-center justify-center gap-1"
                                                            >
                                                                <Clock size={12} /> Extend
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Rejected Ads */}
                                {rejectedAds.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-3">Rejected Ads ({rejectedAds.length})</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {rejectedAds.map(ad => (
                                                <div key={ad.id} className="relative opacity-60">
                                                    <div className="absolute top-4 right-4 z-10">
                                                        {getStatusBadge(ad.approval_status)}
                                                    </div>
                                                    <AdCard ad={ad} onEdit={handleEdit} onDelete={handleDelete} />
                                                    {ad.rejection_reason && (
                                                        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50 text-xs text-red-600 dark:text-red-400">
                                                            <strong>Reason:</strong> {ad.rejection_reason}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Fulfilled Ads (Expired) */}
                                {expiredAds.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <CheckSquare className="text-blue-500" size={16} />
                                            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Fulfilled Ads ({expiredAds.length})</h3>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-xl p-4 mb-4">
                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                These ads have completed their duration. You can renew them to make them active again.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {expiredAds.map(ad => (
                                                <div key={ad.id} className="relative">
                                                    <div className="absolute top-4 right-4 z-10">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                                                            <CheckSquare size={12} /> Fulfilled
                                                        </span>
                                                    </div>
                                                    <AdCard ad={ad} onEdit={handleEdit} onDelete={handleDelete} />
                                                    <div className="mt-2">
                                                        <button
                                                            onClick={() => handleRenew(ad)}
                                                            className="w-full py-2.5 text-sm font-medium text-white bg-primary-500 rounded-xl hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <RefreshCw size={14} /> Renew Ad
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="card text-center py-16">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Plus className="text-gray-400" size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No ads yet</h3>
                                <p className="text-gray-500 mb-6">Start posting to reach the right audience</p>
                                <Link to="/post-ad" className="btn-primary">Post Your First Ad</Link>
                            </div>
                        )}
                    </>
                )}

                {/* Saved Ads Tab */}
                {activeTab === 'saved' && (
                    <>
                        {savedAds.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {savedAds.map(ad => (
                                    <AdCard key={ad.id} ad={ad} />
                                ))}
                            </div>
                        ) : (
                            <div className="card text-center py-16">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bookmark className="text-gray-400" size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookmarks yet</h3>
                                <p className="text-gray-500 mb-6">Bookmark ads you're interested in for quick access</p>
                                <Link to="/" className="btn-secondary">Browse Ads</Link>
                            </div>
                        )}
                    </>
                )}

                {/* Saved Searches Tab */}
                {activeTab === 'searches' && (
                    <div className="space-y-4">
                        {savedSearches.length > 0 ? (
                            savedSearches.map(search => (
                                <Link
                                    key={search.id}
                                    to={`/?q=${search.filter_criteria.searchQuery || ''}&category=${search.filter_criteria.category || 'all'}&city=${search.filter_criteria.city || 'all'}`}
                                    className="block bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors group relative"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 mb-1">
                                                {search.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Saved on {new Date(search.created_at).toLocaleDateString()}
                                            </p>
                                            <div className="flex gap-2 mt-2">
                                                {search.filter_criteria.category !== 'all' && (
                                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs text-gray-600 dark:text-gray-300">
                                                        {search.filter_criteria.category}
                                                    </span>
                                                )}
                                                {search.filter_criteria.city !== 'all' && (
                                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs text-gray-600 dark:text-gray-300">
                                                        {search.filter_criteria.city}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => handleSearchDelete(search.id, e)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                            title="Delete saved search"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="card text-center py-16">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="text-gray-400" size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved searches</h3>
                                <p className="text-gray-500 mb-6">Save your search filters on the Browse page</p>
                                <Link to="/" className="btn-secondary">Browse Ads</Link>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={confirmDelete}
                title="Delete Ad"
                message={`Delete "${deleteConfirm?.title}"? This cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />

            {/* Renew/Extend Modal */}
            <ExtendDurationModal
                isOpen={!!extendModal}
                onClose={() => setExtendModal(null)}
                onConfirm={confirmExtend}
                adTitle={extendModal?.ad.title || ''}
                currentExpiry={extendModal ? new Date(extendModal.ad.expires_at) : new Date()}
                mode={extendModal?.mode || 'extend'}
            />

            {/* Analytics Modal */}
            {analyticsModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
                    onClick={() => setAnalyticsModal(null)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <BarChart2 className="text-primary-500" />
                                Analytics: {analyticsModal.title}
                            </h2>
                            <button
                                onClick={() => setAnalyticsModal(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <AnalyticsChart
                                adId={analyticsModal.id}
                                totalViews={analyticsModal.views_count}
                                totalCalls={analyticsModal.calls_count}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
