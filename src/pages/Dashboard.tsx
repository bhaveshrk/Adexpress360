import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAds } from '../contexts/AdsContext';
import { useToast } from '../contexts/ToastContext';
import { AdCard } from '../components/AdCard';
import { ConfirmDialog } from '../components/Modal';
import { Ad } from '../types';
import { formatRelativeTime } from '../utils/security';
import { ArrowLeft, Plus, Eye, Phone, TrendingUp, Clock, Bookmark, RefreshCw, Settings, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

// Get saved ads from localStorage
const SAVED_ADS_KEY = 'adexpress360_saved_ads';
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
    const { getUserAds, deleteAd, renewAd, getAdById } = useAds();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [deleteConfirm, setDeleteConfirm] = useState<Ad | null>(null);
    const [renewConfirm, setRenewConfirm] = useState<Ad | null>(null);
    const [activeTab, setActiveTab] = useState<'my-ads' | 'saved'>('my-ads');

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
    const handleRenew = (ad: Ad) => setRenewConfirm(ad);

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
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
                    <div className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <Clock className="text-yellow-600" size={20} />
                            </div>
                            <div>
                                <div className="stat-value text-yellow-600">{pendingAds.length}</div>
                                <div className="stat-label">Pending</div>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="text-primary-600" size={20} />
                            </div>
                            <div>
                                <div className="stat-value">{approvedAds.length}</div>
                                <div className="stat-label">Active</div>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                <Eye className="text-gray-600" size={20} />
                            </div>
                            <div>
                                <div className="stat-value">{totalViews.toLocaleString()}</div>
                                <div className="stat-label">Views</div>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center">
                                <Phone className="text-success-600" size={20} />
                            </div>
                            <div>
                                <div className="stat-value">{totalCalls}</div>
                                <div className="stat-label">Calls</div>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                <XCircle className="text-red-600" size={20} />
                            </div>
                            <div>
                                <div className="stat-value">{rejectedAds.length}</div>
                                <div className="stat-label">Rejected</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('my-ads')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'my-ads'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        My Ads ({userAds.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${activeTab === 'saved'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Bookmark size={14} />
                        Saved ({savedAds.length})
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
                                                    <div className="mt-2 p-3 bg-white rounded-xl border border-gray-100 flex justify-between text-xs text-gray-500">
                                                        <span className="flex items-center gap-1"><Eye size={12} /> {ad.views_count}</span>
                                                        <span className="flex items-center gap-1"><Phone size={12} /> {ad.calls_count}</span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {formatRelativeTime(new Date(ad.expires_at)).replace(' ago', ' left')}
                                                        </span>
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
                                                    <AdCard ad={ad} showActions onEdit={handleEdit} onDelete={handleDelete} />
                                                    {ad.rejection_reason && (
                                                        <div className="mt-2 p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-600">
                                                            <strong>Reason:</strong> {ad.rejection_reason}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Expired Ads */}
                                {expiredAds.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Expired Ads</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {expiredAds.map(ad => (
                                                <div key={ad.id} className="relative opacity-60">
                                                    <div className="absolute top-4 right-4 z-10 badge-warning">Expired</div>
                                                    <AdCard ad={ad} showActions onEdit={handleEdit} onDelete={handleDelete} />
                                                    <div className="mt-2 flex gap-2">
                                                        <button
                                                            onClick={() => handleRenew(ad)}
                                                            className="btn-primary btn-sm flex-1"
                                                        >
                                                            <RefreshCw size={14} /> Renew
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
                                <p className="text-gray-500 mb-6">Start posting to reach customers</p>
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
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved ads</h3>
                                <p className="text-gray-500 mb-6">Save ads you're interested in for quick access</p>
                                <Link to="/" className="btn-secondary">Browse Ads</Link>
                            </div>
                        )}
                    </>
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

            {/* Renew Confirmation */}
            <ConfirmDialog
                isOpen={!!renewConfirm}
                onClose={() => setRenewConfirm(null)}
                onConfirm={confirmRenew}
                title="Renew Ad"
                message={`Renew "${renewConfirm?.title}" for another 7 days?`}
                confirmText="Renew"
                variant="default"
            />
        </div>
    );
}
