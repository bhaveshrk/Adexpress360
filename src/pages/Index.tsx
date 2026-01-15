import React, { useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CategoryNav } from '../components/CategoryNav';
import { FeaturedAds } from '../components/FeaturedAds';
import { AdCard } from '../components/AdCard';
import { useAds } from '../contexts/AdsContext';
import { Search } from 'lucide-react';

export function Index() {
    const { getFilteredAds, filter, incrementViews } = useAds();
    const filteredAds = getFilteredAds();

    useEffect(() => {
        filteredAds.forEach(ad => {
            const viewedKey = `viewed_${ad.id}`;
            if (!sessionStorage.getItem(viewedKey)) {
                incrementViews(ad.id);
                sessionStorage.setItem(viewedKey, 'true');
            }
        });
    }, [filteredAds]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <CategoryNav />
            <FeaturedAds />

            {/* Main content */}
            <main className="flex-1 container-app py-8">
                {/* Results header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {filter.category === 'all' ? 'All Ads' : `${filter.category}`}
                            {filter.city !== 'all' && ` in ${filter.city}`}
                        </h1>
                        {filter.searchQuery && (
                            <p className="text-gray-500 text-sm mt-1">
                                Results for "{filter.searchQuery}"
                            </p>
                        )}
                    </div>
                    <span className="text-gray-500 text-sm">
                        {filteredAds.length} ad{filteredAds.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Ads grid */}
                {filteredAds.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredAds.map(ad => (
                            <AdCard key={ad.id} ad={ad} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-gray-400" size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No ads found</h3>
                        <p className="text-gray-500">
                            Try adjusting your filters or search
                        </p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
