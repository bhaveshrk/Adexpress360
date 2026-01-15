import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAds } from '../contexts/AdsContext';
import { CATEGORIES, AdCategory } from '../types';

export function CategoryNav() {
    const { filter, setFilter, getCategoryCount } = useAds();
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    const handleCategoryClick = (categoryId: AdCategory | 'all') => {
        setFilter({ category: categoryId });
    };

    return (
        <div className="bg-white border-b border-gray-100 py-3 sticky top-16 z-30">
            <div className="container-app">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {/* All Categories button - only on home page */}
                    {isHomePage && (
                        <button
                            onClick={() => handleCategoryClick('all')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter.category === 'all'
                                    ? 'bg-primary-500 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            📋 All
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter.category === 'all' ? 'bg-white/20' : 'bg-gray-200'
                                }`}>
                                {getCategoryCount('all')}
                            </span>
                        </button>
                    )}

                    {/* Category buttons */}
                    {CATEGORIES.map(cat => (
                        isHomePage ? (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter.category === cat.id
                                        ? 'bg-primary-500 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {cat.icon} {cat.label}
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter.category === cat.id ? 'bg-white/20' : 'bg-gray-200'
                                    }`}>
                                    {getCategoryCount(cat.id)}
                                </span>
                            </button>
                        ) : (
                            <Link
                                key={cat.id}
                                to={`/category/${cat.id}`}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${location.pathname === `/category/${cat.id}`
                                        ? 'bg-primary-500 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {cat.icon} {cat.label}
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${location.pathname === `/category/${cat.id}` ? 'bg-white/20' : 'bg-gray-200'
                                    }`}>
                                    {getCategoryCount(cat.id)}
                                </span>
                            </Link>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
}
