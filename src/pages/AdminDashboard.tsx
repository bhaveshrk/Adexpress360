import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import { Ad, CATEGORIES, CITIES_BY_STATE } from '../types';
import {
    Shield, LogOut, Search, CheckCircle, XCircle, Clock, Eye,
    TrendingUp, Users, FileText, Plus, Edit, Trash2, MapPin,
    Phone, ChevronDown, ChevronUp, RefreshCw, X, BarChart3, PieChartIcon,
    Upload, Download, AlertCircle, FileSpreadsheet, History, AlertTriangle, Save, Pencil
} from 'lucide-react';
import {
    BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { AnalyticsChart } from '../components/AnalyticsChart';
import {
    parseFile, convertToAds, generateTemplate, BulkAdData, ValidationError, ParseResult,
    generateErrorReport, checkForDuplicates, DuplicateResult, exportAdsToExcel,
    saveUploadToHistory, getUploadHistory, UploadHistoryItem
} from '../utils/bulkUploadParser';

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
    const [showDetailModal, setShowDetailModal] = useState<Ad | null>(null);
    const [showEditModal, setShowEditModal] = useState<Ad | null>(null);
    const [showRenewModal, setShowRenewModal] = useState<Ad | null>(null);
    const [renewDays, setRenewDays] = useState(30);
    const [searchQuery, setSearchQuery] = useState('');

    // Bulk upload state
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
    const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null);
    const [bulkParseResult, setBulkParseResult] = useState<ParseResult | null>(null);
    const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
    const [bulkUploadStep, setBulkUploadStep] = useState<'select' | 'preview' | 'uploading' | 'done'>('select');

    // Enhanced bulk upload state
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
    const [showUploadHistory, setShowUploadHistory] = useState(false);
    const [duplicateResult, setDuplicateResult] = useState<DuplicateResult | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
    const [editedRowData, setEditedRowData] = useState<BulkAdData | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Load upload history when modal opens
    useEffect(() => {
        if (showBulkUploadModal) {
            setUploadHistory(getUploadHistory());
        }
    }, [showBulkUploadModal]);

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
                const stored = localStorage.getItem('findads_ads_local');
                if (stored) localAds = JSON.parse(stored);
            } catch (e) {
                console.log('Local storage error:', e);
            }

            // Merge: for ads in BOTH sources, prefer localStorage (reflects admin actions)
            // For ads only in one source, include them
            const localAdMap = new Map(localAds.map(a => [a.id, a]));
            const mergedAds = supabaseAds.map(supaAd => {
                const localAd = localAdMap.get(supaAd.id);
                // If local version exists, use it (has admin's approval updates)
                return localAd || supaAd;
            });
            // Add any local-only ads (not in Supabase)
            const supabaseIds = new Set(supabaseAds.map(a => a.id));
            localAds.forEach(localAd => {
                if (!supabaseIds.has(localAd.id)) {
                    mergedAds.push(localAd);
                }
            });

            setAds(mergedAds);
            setStats({
                totalAds: mergedAds.length,
                pendingAds: mergedAds.filter(a => a.approval_status === 'pending').length,
                approvedAds: mergedAds.filter(a => a.approval_status === 'approved' || !a.approval_status).length,
                rejectedAds: mergedAds.filter(a => a.approval_status === 'rejected').length,
                totalUsers: 0,
            });
            // Fetch user count from user_accounts table (phone registrations)
            const { count } = await supabase
                .from('user_accounts')
                .select('*', { count: 'exact', head: true });

            setStats(prev => ({ ...prev, totalUsers: count || 0 }));
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (ad: Ad) => {
        const now = new Date();

        // Calculate original duration (from created_at to expires_at)
        const createdAt = new Date(ad.created_at);
        const originalExpiry = new Date(ad.expires_at);
        const durationMs = originalExpiry.getTime() - createdAt.getTime();

        // Set new expiry from NOW + original duration
        const newExpiry = new Date(now.getTime() + durationMs).toISOString();

        const approvedAd = {
            ...ad,
            approval_status: 'approved' as const,
            approved_at: now.toISOString(),
            expires_at: newExpiry  // Duration starts from approval
        };

        // Optimistic update - update local state immediately
        setAds(prev => prev.map(a => a.id === ad.id ? approvedAd : a));

        // Update stats immediately
        setStats(prev => ({
            ...prev,
            pendingAds: prev.pendingAds - 1,
            approvedAds: prev.approvedAds + 1
        }));

        // Update in localStorage - add or update the ad
        try {
            const stored = localStorage.getItem('findads_ads_local');
            const localAds: Ad[] = stored ? JSON.parse(stored) : [];
            const existingIndex = localAds.findIndex(a => a.id === ad.id);
            if (existingIndex >= 0) {
                localAds[existingIndex] = approvedAd;
            } else {
                localAds.unshift(approvedAd);
            }
            localStorage.setItem('findads_ads_local', JSON.stringify(localAds));
        } catch (e) {
            console.log('Local update error:', e);
        }

        // Also try Supabase
        try {
            await supabase.from('ads').update({
                approval_status: 'approved',
                approved_at: now.toISOString(),
                expires_at: newExpiry
            }).eq('id', ad.id);
        } catch (e) {
            console.log('Supabase update skipped:', e);
        }

        showToast('Ad approved!', 'success');
    };

    const handleReject = async () => {
        if (!selectedAd || !rejectReason) return;

        // Update in localStorage
        try {
            const stored = localStorage.getItem('findads_ads_local');
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
                localStorage.setItem('findads_ads_local', JSON.stringify(updatedAds));
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
            const stored = localStorage.getItem('findads_ads_local');
            if (stored) {
                const localAds = JSON.parse(stored);
                const filteredAds = localAds.filter((a: Ad) => a.id !== ad.id);
                localStorage.setItem('findads_ads_local', JSON.stringify(filteredAds));
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

    const handleRenew = async (ad: Ad, days: number) => {
        const now = new Date();
        const newExpiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

        const renewedAd = {
            ...ad,
            expires_at: newExpiry,
            is_active: true,
            approval_status: 'approved' as const,
        };

        // Optimistic update
        setAds(prev => prev.map(a => a.id === ad.id ? renewedAd : a));

        // Update localStorage
        try {
            const stored = localStorage.getItem('findads_ads_local');
            const localAds: Ad[] = stored ? JSON.parse(stored) : [];
            const existingIndex = localAds.findIndex(a => a.id === ad.id);
            if (existingIndex >= 0) {
                localAds[existingIndex] = renewedAd;
            } else {
                localAds.unshift(renewedAd);
            }
            localStorage.setItem('findads_ads_local', JSON.stringify(localAds));
        } catch (e) {
            console.log('Local update error:', e);
        }

        // Also try Supabase
        try {
            await supabase.from('ads').update({
                expires_at: newExpiry,
                is_active: true,
                approval_status: 'approved',
            }).eq('id', ad.id);
        } catch (e) {
            console.log('Supabase update skipped:', e);
        }

        showToast(`Ad renewed for ${days} days!`, 'success');
        setShowRenewModal(null);
        setRenewDays(30);
    };

    const handleEditAd = async (ad: Ad, updates: Partial<Ad>) => {
        const updatedAd = { ...ad, ...updates };

        // Optimistic update
        setAds(prev => prev.map(a => a.id === ad.id ? updatedAd : a));

        // Update localStorage
        try {
            const stored = localStorage.getItem('findads_ads_local');
            const localAds: Ad[] = stored ? JSON.parse(stored) : [];
            const existingIndex = localAds.findIndex(a => a.id === ad.id);
            if (existingIndex >= 0) {
                localAds[existingIndex] = updatedAd;
            } else {
                localAds.unshift(updatedAd);
            }
            localStorage.setItem('findads_ads_local', JSON.stringify(localAds));
        } catch (e) {
            console.log('Local update error:', e);
        }

        // Also try Supabase
        try {
            await supabase.from('ads').update(updates).eq('id', ad.id);
        } catch (e) {
            console.log('Supabase update skipped:', e);
        }

        showToast('Ad updated successfully!', 'success');
        setShowEditModal(null);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/admin');
    };

    const filteredAds = ads.filter(ad => {
        // First filter by tab
        if (activeTab !== 'all' && ad.approval_status !== activeTab) {
            return false;
        }

        // Then filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            const categoryLabel = CATEGORIES.find(c => c.id === ad.category)?.label || '';

            return (
                ad.title?.toLowerCase().includes(query) ||
                ad.subject?.toLowerCase().includes(query) ||
                ad.description?.toLowerCase().includes(query) ||
                ad.phone_number?.toLowerCase().includes(query) ||
                ad.city?.toLowerCase().includes(query) ||
                ad.category?.toLowerCase().includes(query) ||
                categoryLabel.toLowerCase().includes(query) ||
                ad.location?.toLowerCase().includes(query) ||
                ad.id?.toLowerCase().includes(query)
            );
        }

        return true;
    });

    // Analytics Data
    const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        ads.forEach(ad => {
            const cat = CATEGORIES.find(c => c.id === ad.category);
            const label = cat?.label || ad.category;
            counts[label] = (counts[label] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value], i) => ({ name, value, fill: CHART_COLORS[i % CHART_COLORS.length] }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);
    }, [ads]);

    const cityData = useMemo(() => {
        const counts: Record<string, number> = {};
        ads.forEach(ad => {
            counts[ad.city] = (counts[ad.city] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [ads]);

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
                            <p className="text-gray-400 text-xs">FindAds</p>
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

                {/* Analytics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Ads by Category - Pie Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <PieChartIcon className="text-primary-500" size={20} />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ads by Category</h3>
                        </div>
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                                        labelLine={false}
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[280px] flex items-center justify-center text-gray-500">
                                No data available
                            </div>
                        )}
                    </div>

                    {/* Ads by City - Bar Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="text-primary-500" size={20} />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Cities</h3>
                        </div>
                        {cityData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={cityData} layout="vertical">
                                    <XAxis type="number" stroke="#9CA3AF" />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={100}
                                        stroke="#9CA3AF"
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="value" fill="#6366F1" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[280px] flex items-center justify-center text-gray-500">
                                No data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by phone, title, category, city, description..."
                            className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                    {searchQuery && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Found <strong className="text-gray-900 dark:text-white">{filteredAds.length}</strong> ads matching "{searchQuery}"
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                        {(['pending', 'approved', 'rejected', 'all'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                {tab === 'pending' && stats.pendingAds > 0 && (
                                    <span className="ml-1 sm:ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">{stats.pendingAds}</span>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={fetchData} className="p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700" title="Refresh">
                            <RefreshCw size={18} />
                        </button>
                        <button
                            onClick={() => exportAdsToExcel(ads)}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                            title="Export all ads to Excel"
                        >
                            <Download size={18} /> <span className="hidden sm:inline">Export Ads</span>
                        </button>
                        <button
                            onClick={() => {
                                setShowBulkUploadModal(true);
                                setBulkUploadStep('select');
                                setBulkUploadFile(null);
                                setBulkParseResult(null);
                                setDuplicateResult(null);
                                setUploadProgress(0);
                                setEditingRowIndex(null);
                                setEditedRowData(null);
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                }
                            }}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-sm"
                        >
                            <Upload size={18} /> <span className="hidden sm:inline">Bulk Upload</span>
                        </button>
                        <button
                            onClick={() => setShowPostModal(true)}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm"
                        >
                            <Plus size={18} /> <span className="hidden sm:inline">Post Ad</span>
                        </button>
                    </div>
                </div>

                {/* Ads List - Cards for mobile, Table for desktop */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                                <tr>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Ad</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Category</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Location</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Stats</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredAds.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">
                                            No ads found in this category
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAds.map(ad => (
                                        <tr key={ad.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="py-4 px-4">
                                                <div className="max-w-xs">
                                                    <div className="font-medium text-gray-900 dark:text-white truncate">{ad.title}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{ad.subject}</div>
                                                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                        <Phone size={10} /> {ad.phone_number}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-sm dark:text-gray-300">
                                                    {CATEGORIES.find(c => c.id === ad.category)?.icon}{' '}
                                                    {CATEGORIES.find(c => c.id === ad.category)?.label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-sm flex items-center gap-1 dark:text-gray-300">
                                                    <MapPin size={12} className="text-gray-400" />
                                                    {ad.city}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                {getStatusBadge(ad.approval_status || 'pending')}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-1"><Eye size={12} /> {ad.views_count}</span>
                                                    <span className="flex items-center gap-1 mt-1"><Phone size={12} /> {ad.calls_count}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => setShowDetailModal(ad)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setShowEditModal(ad)}
                                                        className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/50 rounded-lg"
                                                        title="Edit Ad"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setShowRenewModal(ad)}
                                                        className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/50 rounded-lg"
                                                        title="Renew Ad"
                                                    >
                                                        <RefreshCw size={18} />
                                                    </button>
                                                    {ad.approval_status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(ad)}
                                                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/50 rounded-lg"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => { setSelectedAd(ad); setShowRejectModal(true); }}
                                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                                                                title="Reject"
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(ad)}
                                                        className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredAds.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                                No ads found in this category
                            </div>
                        ) : (
                            filteredAds.map(ad => (
                                <div key={ad.id} className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 dark:text-white truncate">{ad.title}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{ad.subject}</div>
                                        </div>
                                        {getStatusBadge(ad.approval_status || 'pending')}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span>{CATEGORIES.find(c => c.id === ad.category)?.icon} {CATEGORIES.find(c => c.id === ad.category)?.label}</span>
                                        <span className="flex items-center gap-1"><MapPin size={10} /> {ad.city}</span>
                                        <span className="flex items-center gap-1"><Phone size={10} /> {ad.phone_number}</span>
                                        <span className="flex items-center gap-1"><Eye size={10} /> {ad.views_count}</span>
                                        <span className="flex items-center gap-1"><Phone size={10} /> {ad.calls_count}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                                        <button
                                            onClick={() => setShowDetailModal(ad)}
                                            className="py-2 px-3 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => setShowEditModal(ad)}
                                            className="py-2 px-3 bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setShowRenewModal(ad)}
                                            className="py-2 px-3 bg-orange-50 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-lg text-sm font-medium"
                                        >
                                            Renew
                                        </button>
                                        {ad.approval_status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(ad)}
                                                    className="py-2 px-3 bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedAd(ad); setShowRejectModal(true); }}
                                                    className="py-2 px-3 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleDelete(ad)}
                                            className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {
                showRejectModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Reject Ad</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                                Rejecting: <strong className="text-gray-900 dark:text-white">{selectedAd?.title}</strong>
                            </p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Enter reason for rejection..."
                                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl mb-4 resize-none h-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                                required
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setShowRejectModal(false); setSelectedAd(null); setRejectReason(''); }}
                                    className="flex-1 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={!rejectReason}
                                    className="flex-1 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Reject Ad
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Renew Ad Modal */}
            {showRenewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                            <RefreshCw className="text-orange-500" size={20} />
                            Renew Ad
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                            Renewing: <strong className="text-gray-900 dark:text-white">{showRenewModal.title}</strong>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            Current Expiry: {new Date(showRenewModal.expires_at).toLocaleDateString()}
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Extend By (Days)
                            </label>
                            <select
                                value={renewDays}
                                onChange={(e) => setRenewDays(parseInt(e.target.value))}
                                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                            >
                                <option value={7}>7 days</option>
                                <option value={15}>15 days</option>
                                <option value={30}>30 days</option>
                                <option value={60}>60 days</option>
                                <option value={90}>90 days</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setShowRenewModal(null); setRenewDays(30); }}
                                className="flex-1 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleRenew(showRenewModal, renewDays)}
                                className="flex-1 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                            >
                                Renew for {renewDays} days
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Ad Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Edit className="text-purple-500" size={20} />
                                Edit Ad
                            </h3>
                            <button
                                onClick={() => setShowEditModal(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleEditAd(showEditModal, {
                                title: String(formData.get('title') || ''),
                                subject: String(formData.get('subject') || ''),
                                description: String(formData.get('description') || ''),
                                phone_number: String(formData.get('phone') || ''),
                                category: String(formData.get('category') || '') as Ad['category'],
                                city: String(formData.get('city') || ''),
                            });
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                <input
                                    name="title"
                                    type="text"
                                    defaultValue={showEditModal.title}
                                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                                <input
                                    name="subject"
                                    type="text"
                                    defaultValue={showEditModal.subject}
                                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    defaultValue={showEditModal.description}
                                    rows={4}
                                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all resize-none"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                    <input
                                        name="phone"
                                        type="tel"
                                        defaultValue={showEditModal.phone_number}
                                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                    <select
                                        name="category"
                                        defaultValue={showEditModal.category}
                                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                        required
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                                <select
                                    name="city"
                                    defaultValue={showEditModal.city}
                                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                    required
                                >
                                    {Object.entries(CITIES_BY_STATE).map(([state, cities]) => (
                                        <optgroup key={state} label={state}>
                                            {cities.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(null)}
                                    className="flex-1 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Post Ad Modal (simplified) */}
            {
                showPostModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Post Ad (Admin)</h3>
                                <button
                                    onClick={() => setShowPostModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
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
                                    location: String(formData.get('location') || ''),
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
                                    const stored = localStorage.getItem('findads_ads_local');
                                    const localAds = stored ? JSON.parse(stored) : [];
                                    localAds.unshift(newAd);
                                    localStorage.setItem('findads_ads_local', JSON.stringify(localAds));
                                } catch (err) {
                                    console.log('Local save error:', err);
                                }

                                // Also try Supabase
                                try {
                                    const { error: insertError } = await supabase.from('ads').insert({
                                        ...newAd,
                                        user_id: (await supabase.auth.getUser()).data.user?.id || 'admin',
                                    });
                                    if (insertError) throw insertError;
                                } catch (err) {
                                    console.log('Supabase insert skipped:', err);
                                }

                                showToast('Ad created successfully!', 'success');
                                setShowPostModal(false);
                                fetchData();
                            }} className="space-y-4">
                                <input name="title" placeholder="Title" required className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500" />
                                <input name="subject" placeholder="Headline" required className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500" />
                                <textarea name="description" placeholder="Description" required className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none" />
                                <input name="phone" placeholder="Phone Number" required className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500" />
                                <input name="location" placeholder="Locality (e.g. Koramangala)" className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500" />

                                <select name="category" required className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500">
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                                <select name="city" required className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500">
                                    {Object.entries(CITIES_BY_STATE).map(([state, cities]) => (
                                        <optgroup key={state} label={state} className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
                                            {cities.map(city => (
                                                <option key={city} value={city} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">{city}</option>
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

            {/* Ad Detail Modal */}
            {showDetailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ad Details</h2>
                            <button
                                onClick={() => setShowDetailModal(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Title & Subject */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{showDetailModal.title}</h3>
                                <p className="text-primary-600 dark:text-primary-400 font-medium">{showDetailModal.subject}</p>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center gap-2">
                                {getStatusBadge(showDetailModal.approval_status || 'pending')}
                                {showDetailModal.is_featured && (
                                    <span className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 rounded-full text-xs font-medium">⭐ Featured</span>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Description</h4>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{showDetailModal.description}</p>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                                <div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Category</span>
                                    <span className="text-sm font-medium dark:text-white">{CATEGORIES.find(c => c.id === showDetailModal.category)?.icon} {CATEGORIES.find(c => c.id === showDetailModal.category)?.label}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block">City</span>
                                    <span className="text-sm font-medium dark:text-white flex items-center gap-1"><MapPin size={12} /> {showDetailModal.city}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Phone Number</span>
                                    <span className="text-sm font-medium dark:text-white flex items-center gap-1"><Phone size={12} /> +91 {showDetailModal.phone_number}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Location</span>
                                    <span className="text-sm font-medium dark:text-white">{showDetailModal.location || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Created</span>
                                    <span className="text-sm font-medium dark:text-white">{new Date(showDetailModal.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Expires</span>
                                    <span className="text-sm font-medium dark:text-white">{new Date(showDetailModal.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>

                            {/* Stats Summary */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 text-center">
                                    <Eye className="mx-auto text-blue-500 mb-1" size={24} />
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{showDetailModal.views_count.toLocaleString()}</div>
                                    <div className="text-xs text-blue-500">Total Views</div>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 text-center">
                                    <Phone className="mx-auto text-green-500 mb-1" size={24} />
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{showDetailModal.calls_count}</div>
                                    <div className="text-xs text-green-500">Total Calls</div>
                                </div>
                            </div>

                            {/* Analytics Chart */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Analytics (Last 30 Days)</h4>
                                <AnalyticsChart
                                    adId={showDetailModal.id}
                                    totalViews={showDetailModal.views_count}
                                    totalCalls={showDetailModal.calls_count}
                                />
                            </div>

                            {/* Rejection Reason (if rejected) */}
                            {showDetailModal.approval_status === 'rejected' && showDetailModal.rejection_reason && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Rejection Reason</h4>
                                    <p className="text-gray-700 dark:text-gray-300">{showDetailModal.rejection_reason}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Upload Modal */}
            {showBulkUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in flex flex-col">
                        {/* Header */}
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center">
                                    <FileSpreadsheet className="text-emerald-600 dark:text-emerald-400" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bulk Upload Ads</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Upload multiple ads from Excel/CSV file</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowBulkUploadModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {bulkUploadStep === 'select' && (
                                <div className="space-y-6">
                                    {/* Download Template Section */}
                                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                            <Download size={18} className="text-emerald-600" />
                                            Step 1: Download Template
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Download the Excel template with sample data and valid dropdown values for category, duration, and featured options.
                                        </p>
                                        <button
                                            onClick={() => generateTemplate()}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                                        >
                                            <Download size={16} />
                                            Download Template (.xlsx)
                                        </button>
                                    </div>

                                    {/* Upload Section */}
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                            <Upload size={18} className="text-primary-600" />
                                            Step 2: Upload Your File
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Upload your filled Excel (.xlsx) or CSV file. Make sure to follow the template format.
                                        </p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv,.xlsx,.xls"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setBulkUploadFile(file);
                                                    setBulkUploadLoading(true);
                                                    try {
                                                        const result = await parseFile(file);
                                                        setBulkParseResult(result);

                                                        // Check for duplicates against existing ads
                                                        if (result.data.length > 0) {
                                                            const dupResult = checkForDuplicates(result.data, ads);
                                                            setDuplicateResult(dupResult);
                                                        }

                                                        setBulkUploadStep('preview');
                                                    } catch (error) {
                                                        showToast(`Error parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
                                                    } finally {
                                                        setBulkUploadLoading(false);
                                                    }
                                                }
                                            }}
                                            className="block w-full text-sm text-gray-500 dark:text-gray-400
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-lg file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-primary-50 file:text-primary-700
                                                dark:file:bg-primary-900/50 dark:file:text-primary-300
                                                hover:file:bg-primary-100 dark:hover:file:bg-primary-900
                                                file:cursor-pointer cursor-pointer"
                                        />
                                        {bulkUploadLoading && (
                                            <div className="mt-4 flex items-center gap-2 text-primary-600">
                                                <div className="animate-spin w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full" />
                                                Parsing file...
                                            </div>
                                        )}
                                    </div>

                                    {/* Instructions */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                        <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Required Fields:</h4>
                                        <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                                            <li><strong>title</strong> - Main ad title (max 100 chars)</li>
                                            <li><strong>subject</strong> - Ad headline (max 150 chars)</li>
                                            <li><strong>description</strong> - Detailed description</li>
                                            <li><strong>phone_number</strong> - 10-digit Indian mobile number</li>
                                            <li><strong>category</strong> - jobs, rentals, sales, services, vehicles, matrimonial, or general</li>
                                            <li><strong>city</strong> - Valid Indian city name</li>
                                        </ul>
                                    </div>

                                    {/* Upload History */}
                                    {uploadHistory.length > 0 && (
                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                            <button
                                                onClick={() => setShowUploadHistory(!showUploadHistory)}
                                                className="w-full px-4 py-3 flex items-center justify-between text-left"
                                            >
                                                <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    <History size={18} />
                                                    Upload History ({uploadHistory.length})
                                                </span>
                                                {showUploadHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                            {showUploadHistory && (
                                                <div className="px-4 pb-4 space-y-2">
                                                    {uploadHistory.map((item) => (
                                                        <div key={item.id} className="flex items-center justify-between text-sm bg-white dark:bg-gray-800 rounded-lg px-3 py-2">
                                                            <div>
                                                                <span className="font-medium text-gray-900 dark:text-white">{item.fileName}</span>
                                                                <span className="text-gray-500 ml-2">({item.totalUploaded} ads)</span>
                                                            </div>
                                                            <span className="text-gray-400 text-xs">
                                                                {new Date(item.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {bulkUploadStep === 'preview' && bulkParseResult && (
                                <div className="space-y-6">
                                    {/* Summary */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{bulkParseResult.totalRows}</div>
                                            <div className="text-sm text-gray-500">Total Rows</div>
                                        </div>
                                        <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-green-600">{duplicateResult ? duplicateResult.cleanData.length : bulkParseResult.data.length}</div>
                                            <div className="text-sm text-green-600">Valid Ads</div>
                                        </div>
                                        <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold text-red-600">{bulkParseResult.errors.length}</div>
                                            <div className="text-sm text-red-600">Errors</div>
                                        </div>
                                    </div>

                                    {/* Duplicate Warning */}
                                    {duplicateResult && duplicateResult.duplicates.length > 0 && (
                                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                                            <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-2">
                                                <AlertTriangle size={18} />
                                                Duplicate Ads Found ({duplicateResult.duplicates.length})
                                            </h4>
                                            <p className="text-sm text-amber-600 dark:text-amber-400 mb-3">
                                                The following ads match existing ads (same title + phone number) and will be skipped:
                                            </p>
                                            <div className="max-h-32 overflow-y-auto space-y-1">
                                                {duplicateResult.duplicates.slice(0, 10).map((dup, index) => (
                                                    <div key={index} className="text-sm text-amber-600 dark:text-amber-400 bg-white dark:bg-gray-800 rounded-lg px-3 py-2">
                                                        <strong>Row {dup.uploadIndex}:</strong> {dup.title} ({dup.phone})
                                                    </div>
                                                ))}
                                                {duplicateResult.duplicates.length > 10 && (
                                                    <div className="text-sm text-amber-500 italic">
                                                        ... and {duplicateResult.duplicates.length - 10} more duplicates
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Errors with Download Button */}
                                    {bulkParseResult.errors.length > 0 && (
                                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                                                    <AlertCircle size={18} />
                                                    Validation Errors ({bulkParseResult.errors.length})
                                                </h4>
                                                <button
                                                    onClick={() => generateErrorReport(bulkParseResult.errors)}
                                                    className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 dark:bg-red-800/50 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                                                >
                                                    <Download size={14} />
                                                    Download Errors
                                                </button>
                                            </div>
                                            <div className="max-h-40 overflow-y-auto space-y-2">
                                                {bulkParseResult.errors.slice(0, 20).map((error, index) => (
                                                    <div key={index} className="text-sm text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 rounded-lg px-3 py-2">
                                                        <strong>Row {error.row}:</strong> {error.field} - {error.message}
                                                    </div>
                                                ))}
                                                {bulkParseResult.errors.length > 20 && (
                                                    <div className="text-sm text-red-500 italic">
                                                        ... and {bulkParseResult.errors.length - 20} more errors
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Preview Table with Inline Editing */}
                                    {bulkParseResult.data.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                                Preview ({duplicateResult ? duplicateResult.cleanData.length : bulkParseResult.data.length} valid ads)
                                                <span className="font-normal text-sm text-gray-500 ml-2">Click a row to edit</span>
                                            </h4>
                                            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                                        <tr>
                                                            <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-300">#</th>
                                                            <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Title</th>
                                                            <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Category</th>
                                                            <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-300">City</th>
                                                            <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Phone</th>
                                                            <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Duration</th>
                                                            <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Featured</th>
                                                            <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                        {(duplicateResult ? duplicateResult.cleanData : bulkParseResult.data).slice(0, 10).map((ad, index) => (
                                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                                <td className="py-2 px-3 text-gray-500">{index + 1}</td>
                                                                {editingRowIndex === index ? (
                                                                    <>
                                                                        <td className="py-2 px-3">
                                                                            <input
                                                                                type="text"
                                                                                value={editedRowData?.title || ''}
                                                                                onChange={(e) => setEditedRowData(prev => prev ? { ...prev, title: e.target.value } : null)}
                                                                                className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                                                                            />
                                                                        </td>
                                                                        <td className="py-2 px-3">
                                                                            <input
                                                                                type="text"
                                                                                value={editedRowData?.category || ''}
                                                                                onChange={(e) => setEditedRowData(prev => prev ? { ...prev, category: e.target.value } : null)}
                                                                                className="w-20 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                                                                            />
                                                                        </td>
                                                                        <td className="py-2 px-3">
                                                                            <input
                                                                                type="text"
                                                                                value={editedRowData?.city || ''}
                                                                                onChange={(e) => setEditedRowData(prev => prev ? { ...prev, city: e.target.value } : null)}
                                                                                className="w-24 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                                                                            />
                                                                        </td>
                                                                        <td className="py-2 px-3">
                                                                            <input
                                                                                type="text"
                                                                                value={editedRowData?.phone_number || ''}
                                                                                onChange={(e) => setEditedRowData(prev => prev ? { ...prev, phone_number: e.target.value } : null)}
                                                                                className="w-28 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                                                                            />
                                                                        </td>
                                                                        <td className="py-2 px-3">
                                                                            <input
                                                                                type="number"
                                                                                value={editedRowData?.duration_days || 30}
                                                                                onChange={(e) => setEditedRowData(prev => prev ? { ...prev, duration_days: parseInt(e.target.value) } : null)}
                                                                                className="w-16 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                                                                            />
                                                                        </td>
                                                                        <td className="py-2 px-3">
                                                                            <select
                                                                                value={editedRowData?.is_featured ? 'yes' : 'no'}
                                                                                onChange={(e) => setEditedRowData(prev => prev ? { ...prev, is_featured: e.target.value === 'yes' } : null)}
                                                                                className="px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                                                                            >
                                                                                <option value="no">No</option>
                                                                                <option value="yes">Yes</option>
                                                                            </select>
                                                                        </td>
                                                                        <td className="py-2 px-3">
                                                                            <div className="flex gap-1">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        if (editedRowData && duplicateResult) {
                                                                                            const newData = [...duplicateResult.cleanData];
                                                                                            newData[index] = editedRowData;
                                                                                            setDuplicateResult({ ...duplicateResult, cleanData: newData });
                                                                                        } else if (editedRowData && bulkParseResult) {
                                                                                            const newData = [...bulkParseResult.data];
                                                                                            newData[index] = editedRowData;
                                                                                            setBulkParseResult({ ...bulkParseResult, data: newData });
                                                                                        }
                                                                                        setEditingRowIndex(null);
                                                                                        setEditedRowData(null);
                                                                                    }}
                                                                                    className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50 rounded"
                                                                                    title="Save"
                                                                                >
                                                                                    <Save size={16} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setEditingRowIndex(null);
                                                                                        setEditedRowData(null);
                                                                                    }}
                                                                                    className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                                                                    title="Cancel"
                                                                                >
                                                                                    <X size={16} />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <td className="py-2 px-3 text-gray-900 dark:text-white font-medium truncate max-w-[200px]">{ad.title}</td>
                                                                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400 capitalize">{ad.category}</td>
                                                                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{ad.city}</td>
                                                                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{ad.phone_number}</td>
                                                                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{ad.duration_days} days</td>
                                                                        <td className="py-2 px-3">
                                                                            {ad.is_featured ? (
                                                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">Yes</span>
                                                                            ) : (
                                                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">No</span>
                                                                            )}
                                                                        </td>
                                                                        <td className="py-2 px-3">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setEditingRowIndex(index);
                                                                                    setEditedRowData({ ...ad });
                                                                                }}
                                                                                className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded"
                                                                                title="Edit"
                                                                            >
                                                                                <Pencil size={16} />
                                                                            </button>
                                                                        </td>
                                                                    </>
                                                                )}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                {(duplicateResult ? duplicateResult.cleanData : bulkParseResult.data).length > 10 && (
                                                    <div className="py-2 px-3 bg-gray-50 dark:bg-gray-900 text-sm text-gray-500 text-center">
                                                        ... and {(duplicateResult ? duplicateResult.cleanData : bulkParseResult.data).length - 10} more ads
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {bulkUploadStep === 'uploading' && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-full max-w-md mb-6">
                                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            <span>Uploading ads...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 ease-out"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">Please wait...</p>
                                    <p className="text-sm text-gray-500">Creating {duplicateResult ? duplicateResult.cleanData.length : bulkParseResult?.data.length} ads</p>
                                </div>
                            )}

                            {bulkUploadStep === 'done' && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle className="text-green-600" size={32} />
                                    </div>
                                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload Complete!</p>
                                    <p className="text-sm text-gray-500">{duplicateResult ? duplicateResult.cleanData.length : bulkParseResult?.data.length} ads have been successfully created</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
                            <button
                                onClick={() => {
                                    if (bulkUploadStep === 'preview') {
                                        setBulkUploadStep('select');
                                        setBulkParseResult(null);
                                        setBulkUploadFile(null);
                                        setDuplicateResult(null);
                                        setEditingRowIndex(null);
                                        setEditedRowData(null);
                                        // Reset file input
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    } else {
                                        setShowBulkUploadModal(false);
                                    }
                                }}
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                {bulkUploadStep === 'preview' ? 'Back' : 'Cancel'}
                            </button>

                            {bulkUploadStep === 'preview' && bulkParseResult && (duplicateResult ? duplicateResult.cleanData.length : bulkParseResult.data.length) > 0 && (
                                <button
                                    onClick={async () => {
                                        const dataToUpload = duplicateResult ? duplicateResult.cleanData : bulkParseResult.data;
                                        const uploadCount = dataToUpload.length;

                                        // Show confirmation for large batches (100+)
                                        if (uploadCount >= 100) {
                                            const confirmed = window.confirm(
                                                `You are about to upload ${uploadCount} ads. This may take a few minutes. Continue?`
                                            );
                                            if (!confirmed) return;
                                        }

                                        setBulkUploadStep('uploading');
                                        setUploadProgress(0);

                                        try {
                                            const adsToCreate = convertToAds(dataToUpload);
                                            const { data: { user } } = await supabase.auth.getUser();

                                            // Create ads with proper user_id
                                            const newAds = adsToCreate.map(ad => ({
                                                ...ad,
                                                id: crypto.randomUUID(),
                                                user_id: user?.id || 'admin',
                                            }));

                                            // Save to localStorage first
                                            try {
                                                const stored = localStorage.getItem('findads_ads_local');
                                                const localAds = stored ? JSON.parse(stored) : [];
                                                localStorage.setItem('findads_ads_local', JSON.stringify([...newAds, ...localAds]));
                                            } catch (e) {
                                                console.log('Local save error:', e);
                                            }

                                            setUploadProgress(30);

                                            // Batch Supabase insert (groups of 50 for efficiency)
                                            try {
                                                const batchSize = 50;
                                                const batches = [];
                                                for (let i = 0; i < newAds.length; i += batchSize) {
                                                    batches.push(newAds.slice(i, i + batchSize));
                                                }

                                                for (let i = 0; i < batches.length; i++) {
                                                    const batch = batches[i];
                                                    // Use upsert or regular insert for the batch
                                                    await supabase.from('ads').insert(batch);
                                                    // Update progress (30-90% range for batch inserts)
                                                    const progress = 30 + Math.round(((i + 1) / batches.length) * 60);
                                                    setUploadProgress(progress);
                                                }
                                            } catch (e) {
                                                console.log('Supabase batch insert skipped:', e);
                                            }

                                            setUploadProgress(100);

                                            // Save to upload history
                                            saveUploadToHistory(bulkUploadFile?.name || 'Unknown file', newAds.length);

                                            setBulkUploadStep('done');
                                            showToast(`Successfully uploaded ${newAds.length} ads!`, 'success');
                                            fetchData();
                                        } catch (error) {
                                            showToast(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
                                            setBulkUploadStep('preview');
                                        }
                                    }}
                                    className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                                >
                                    <Upload size={18} />
                                    Upload {duplicateResult ? duplicateResult.cleanData.length : bulkParseResult.data.length} Ads
                                </button>
                            )}

                            {bulkUploadStep === 'done' && (
                                <button
                                    onClick={() => setShowBulkUploadModal(false)}
                                    className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
