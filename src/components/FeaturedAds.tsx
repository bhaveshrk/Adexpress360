import React from 'react';
import { useAds } from '../contexts/AdsContext';
import { AdCard } from './AdCard';
import { Sparkles } from 'lucide-react';

export function FeaturedAds() {
    const { getFeaturedAds } = useAds();
    const featuredAds = getFeaturedAds();

    if (featuredAds.length === 0) return null;

    return (
        <section className="bg-gradient-to-b from-amber-50 to-white py-8 border-b border-amber-100">
            <div className="container-app">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="text-amber-500" size={24} />
                    <h2 className="text-xl font-bold text-gray-900">Featured Ads</h2>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {featuredAds.map(ad => (
                        <AdCard key={ad.id} ad={ad} />
                    ))}
                </div>
            </div>
        </section>
    );
}
