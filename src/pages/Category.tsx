import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AdCard } from '../components/AdCard';
import { useAds } from '../contexts/AdsContext';
import { CATEGORIES, AdCategory } from '../types';
import { ArrowLeft, Search } from 'lucide-react';

export function Category() {
    const { categoryId } = useParams<{ categoryId: string }>();
    const { ads, filter, setFilter, incrementViews } = useAds();

    const category = CATEGORIES.find(c => c.id === categoryId);

    // Filter ads by category
    const categoryAds = ads.filter(ad => {
        if (!ad.is_active) return false;
        if (new Date(ad.expires_at) < new Date()) return false;
        if (ad.category !== categoryId) return false;
        if (filter.city !== 'all' && ad.city !== filter.city) return false;
        if (filter.searchQuery) {
            const query = filter.searchQuery.toLowerCase();
            const matchesTitle = ad.title.toLowerCase().includes(query);
            const matchesSubject = ad.subject.toLowerCase().includes(query);
            const matchesDescription = ad.description.toLowerCase().includes(query);
            if (!matchesTitle && !matchesSubject && !matchesDescription) return false;
        }
        return true;
    });

    // Track views
    useEffect(() => {
        categoryAds.forEach(ad => {
            const viewedKey = `viewed_${ad.id}`;
            if (!sessionStorage.getItem(viewedKey)) {
                incrementViews(ad.id);
                sessionStorage.setItem(viewedKey, 'true');
            }
        });
    }, [categoryAds]);

    // Set category filter on mount
    useEffect(() => {
        if (categoryId) {
            setFilter({ category: categoryId as AdCategory });
        }
        return () => {
            setFilter({ category: 'all' });
        };
    }, [categoryId]);

    if (!category) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Category not found</h1>
                    <Link to="/" className="text-primary-600 hover:underline">Go back home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            {/* Category Header */}
            <div className="bg-white border-b border-gray-200 py-8">
                <div className="container-app">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                        <ArrowLeft size={18} /> All Categories
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-3xl">
                            {category.icon}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{category.label}</h1>
                            <p className="text-gray-500">{category.description}</p>
                            <p className="text-sm text-gray-400 mt-1">{categoryAds.length} ads available</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Other Categories */}
            <div className="bg-gray-50 border-b border-gray-100 py-3 overflow-x-auto scrollbar-hide">
                <div className="container-app">
                    <div className="flex gap-2 min-w-max">
                        {CATEGORIES.filter(c => c.id !== categoryId).map(cat => (
                            <Link
                                key={cat.id}
                                to={`/category/${cat.id}`}
                                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:border-primary-300 hover:text-primary-600 transition-all"
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Ads Grid */}
            <main className="flex-1 container-app py-8">
                {filter.searchQuery && (
                    <p className="text-gray-500 text-sm mb-4">
                        Results for "{filter.searchQuery}" in {category.label}
                    </p>
                )}

                {categoryAds.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryAds.map(ad => (
                            <AdCard key={ad.id} ad={ad} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-gray-400" size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No ads in {category.label}</h3>
                        <p className="text-gray-500 mb-6">
                            Be the first to post in this category
                        </p>
                        <Link to="/post-ad" className="btn-primary">
                            Post Ad
                        </Link>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
