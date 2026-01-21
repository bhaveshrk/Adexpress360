import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AdCard } from '../components/AdCard';
import { useAds } from '../contexts/AdsContext';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES, CITIES, AdCategory } from '../types';
import { Search, Filter, X, ChevronDown, Clock, ArrowUpDown, Star } from 'lucide-react';

type DateFilter = 'all' | '24h' | 'week' | 'month';
type SortOption = 'newest' | 'oldest' | 'most_viewed' | 'ending_soon';

export function BrowseAds() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { ads, incrementViews } = useAds();

    // Filter states from URL params
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [selectedCategory, setSelectedCategory] = useState<AdCategory | 'all'>(
        (searchParams.get('category') as AdCategory) || 'all'
    );
    const [selectedCity, setSelectedCity] = useState<string>(searchParams.get('city') || 'all');
    const [dateFilter, setDateFilter] = useState<DateFilter>((searchParams.get('posted') as DateFilter) || 'all');
    const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'newest');
    const [showFilters, setShowFilters] = useState(false);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        if (selectedCity !== 'all') params.set('city', selectedCity);
        if (dateFilter !== 'all') params.set('posted', dateFilter);
        if (sortBy !== 'newest') params.set('sort', sortBy);
        setSearchParams(params, { replace: true });
    }, [searchQuery, selectedCategory, selectedCity, dateFilter, sortBy, setSearchParams]);

    // Get date threshold based on filter
    const getDateThreshold = (filter: DateFilter): Date | null => {
        const now = new Date();
        switch (filter) {
            case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
            case 'week': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case 'month': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            default: return null;
        }
    };

    // Filter and sort ads
    const filteredAds = useMemo(() => {
        const dateThreshold = getDateThreshold(dateFilter);

        let result = ads.filter(ad => {
            if (!ad.is_active) return false;
            if (new Date(ad.expires_at) < new Date()) return false;
            if (ad.approval_status && ad.approval_status !== 'approved') return false;

            if (selectedCategory !== 'all' && ad.category !== selectedCategory) return false;
            if (selectedCity !== 'all' && ad.city !== selectedCity) return false;

            // Date filter
            if (dateThreshold && new Date(ad.created_at) < dateThreshold) return false;

            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesTitle = ad.title.toLowerCase().includes(query);
                const matchesSubject = ad.subject.toLowerCase().includes(query);
                const matchesDescription = ad.description.toLowerCase().includes(query);
                const matchesCity = ad.city.toLowerCase().includes(query);
                const matchesLocation = ad.location?.toLowerCase().includes(query);
                if (!matchesTitle && !matchesSubject && !matchesDescription && !matchesCity && !matchesLocation) {
                    return false;
                }
            }
            return true;
        });

        // Sort ads
        result.sort((a, b) => {
            // Featured ads always first
            if (a.is_featured && !b.is_featured) return -1;
            if (!a.is_featured && b.is_featured) return 1;

            switch (sortBy) {
                case 'oldest':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case 'most_viewed':
                    return b.views_count - a.views_count;
                case 'ending_soon':
                    return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
                case 'newest':
                default:
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });

        return result;
    }, [ads, selectedCategory, selectedCity, searchQuery, dateFilter, sortBy]);

    // Track views for displayed ads
    useEffect(() => {
        filteredAds.forEach(ad => {
            const viewedKey = `viewed_${ad.id}`;
            if (!sessionStorage.getItem(viewedKey)) {
                incrementViews(ad.id);
                sessionStorage.setItem(viewedKey, 'true');
            }
        });
    }, [filteredAds, incrementViews]);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setSelectedCity('all');
        setDateFilter('all');
        setSortBy('newest');
    };

    const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedCity !== 'all' || dateFilter !== 'all';

    // Save Search handler
    const handleSaveSearch = async () => {
        if (!user) {
            // Redirect to login or show toast
            // For now assume user might be logged in or just show warning
            return;
        }

        const defaultName = `${selectedCategory !== 'all' ? selectedCategory : 'All Categories'} in ${selectedCity !== 'all' ? selectedCity : 'All Cities'}`;
        const name = window.prompt('Name your saved search:', defaultName);

        if (name) {
            const filterState = {
                searchQuery,
                category: selectedCategory,
                city: selectedCity,
                // We'll save these too as part of "filter_criteria" JSON
                dateFilter,
                sortBy
            };

            // @ts-ignore - filterState has extra fields but that's fine for JSON
            const result = await saveSearch(name, filterState, user.id);
            if (result.success) {
                // Show success toast (need to add toast context here if not present)
                alert('Search saved successfully! View it in your Dashboard.');
            } else {
                alert('Failed to save search: ' + result.error);
            }
        }
    };

    // Need user from context
    const { user } = useAuth(); // Import useAuth
    const { saveSearch } = useAds(); // Already have useAds but need saveSearch destuctured

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Header />

            {/* Page Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-8">
                <div className="container-app">
                    <h1 className="text-3xl font-bold mb-2">Browse All Ads</h1>
                    <p className="text-primary-100">
                        {filteredAds.length} ad{filteredAds.length !== 1 ? 's' : ''} found
                        {hasActiveFilters && ' with current filters'}
                    </p>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
                <div className="container-app py-4">
                    {/* Search Input */}
                    <div className="flex gap-3 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search ads by title, description, city..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${showFilters || hasActiveFilters
                                ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-300 dark:border-primary-600 text-primary-600 dark:text-primary-400'
                                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            <Filter size={20} />
                            <span className="hidden sm:inline">Filters</span>
                            {hasActiveFilters && (
                                <span className="flex items-center justify-center w-5 h-5 text-xs bg-primary-500 text-white rounded-full">
                                    {(selectedCategory !== 'all' ? 1 : 0) + (selectedCity !== 'all' ? 1 : 0)}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Filter Dropdowns */}
                    {showFilters && (
                        <div className="flex flex-wrap gap-3 pb-2">
                            {/* Category Filter */}
                            <div className="relative flex-1 min-w-[180px]">
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Category</label>
                                <div className="relative">
                                    <select
                                        value={selectedCategory}
                                        onChange={e => setSelectedCategory(e.target.value as AdCategory | 'all')}
                                        className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="all">All Categories</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.icon} {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                </div>
                            </div>

                            {/* City Filter */}
                            <div className="relative flex-1 min-w-[180px]">
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">City</label>
                                <div className="relative">
                                    <select
                                        value={selectedCity}
                                        onChange={e => setSelectedCity(e.target.value)}
                                        className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="all">All Cities</option>
                                        {CITIES.map(city => (
                                            <option key={city} value={city}>
                                                {city}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                </div>
                            </div>

                            {/* Date Posted Filter */}
                            <div className="relative flex-1 min-w-[150px]">
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date Posted</label>
                                <div className="relative">
                                    <select
                                        value={dateFilter}
                                        onChange={e => setDateFilter(e.target.value as DateFilter)}
                                        className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="24h">Last 24 Hours</option>
                                        <option value="week">Last Week</option>
                                        <option value="month">Last Month</option>
                                    </select>
                                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Sort By */}
                            <div className="relative flex-1 min-w-[160px]">
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Sort By</label>
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={e => setSortBy(e.target.value as SortOption)}
                                        className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="most_viewed">Most Viewed</option>
                                        <option value="ending_soon">Ending Soon</option>
                                    </select>
                                    <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {hasActiveFilters && (
                                <div className="flex items-end gap-2 ml-auto">
                                    {user && (
                                        <button
                                            onClick={handleSaveSearch}
                                            className="flex items-center gap-1 px-4 py-2.5 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                        >
                                            <Star size={16} />
                                            Save Search
                                        </button>
                                    )}
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-1 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <X size={16} />
                                        Clear All
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quick Category Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'all'
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            All
                        </button>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Ads Grid */}
            <main className="flex-1 container-app py-8">
                {filteredAds.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAds.map(ad => (
                            <AdCard key={ad.id} ad={ad} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-gray-400 dark:text-gray-500" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No ads found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                            {hasActiveFilters
                                ? 'Try adjusting your filters or search query'
                                : 'Be the first to post an ad!'}
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            )}
                            <Link to="/post-ad" className="btn-primary px-6 py-2.5 rounded-xl">
                                Post Your Ad
                            </Link>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
