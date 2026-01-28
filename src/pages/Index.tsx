import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FeaturedAds } from '../components/FeaturedAds';
import { useAds } from '../contexts/AdsContext';
import { CATEGORIES } from '../types';
import { Star, ArrowRight, TrendingUp } from 'lucide-react';

export function Index() {
    const { getFeaturedAds, getFilteredAds } = useAds();
    const featuredAds = getFeaturedAds();
    const allAds = getFilteredAds();

    // Get ad count per category
    const getCategoryCount = (categoryId: string) => {
        return allAds.filter(ad => ad.category === categoryId).length;
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
                <div className="container-app text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Find What You're Looking For
                    </h1>
                    <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                        Browse thousands of classified ads across India. Post your ad for free!
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/post-ad" className="btn-lg bg-white text-primary-600 hover:bg-gray-100 rounded-xl font-semibold px-8 py-3">
                            Post Free Ad
                        </Link>
                        <Link to="/browse" className="btn-lg bg-primary-500 text-white hover:bg-primary-400 rounded-xl font-semibold px-8 py-3 border border-primary-400">
                            Browse All Ads
                        </Link>
                    </div>
                </div>
            </section>

            {/* Browse by Category Section - NOW ABOVE FEATURED */}
            <section className="py-12 dark:bg-gray-800">
                <div className="container-app">
                    <div className="flex items-center gap-2 mb-8">
                        <TrendingUp className="text-primary-500" size={24} />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Browse by Category</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {CATEGORIES.map(category => {
                            const count = getCategoryCount(category.id);
                            return (
                                <Link
                                    key={category.id}
                                    to={`/category/${category.id}`}
                                    className="group bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-600 hover:border-primary-200"
                                >
                                    <div className="text-4xl mb-3">{category.icon}</div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                        {category.label}
                                    </h3>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {count} ad{count !== 1 ? 's' : ''}
                                        </span>
                                        <ArrowRight size={16} className="text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Featured Ads Section - NOW BELOW CATEGORIES */}
            {featuredAds.length > 0 && (
                <section className="py-12 bg-gradient-to-b from-amber-50 to-white dark:from-gray-800 dark:to-gray-900">
                    <div className="container-app">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Star className="text-amber-500" size={24} />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Ads</h2>
                            </div>
                        </div>
                        <FeaturedAds />
                    </div>
                </section>
            )}

            {/* Stats Section */}
            <section className="py-12 bg-gray-100 dark:bg-gray-800">
                <div className="container-app">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div>
                            <div className="text-3xl font-bold text-primary-600">{allAds.length}+</div>
                            <div className="text-gray-600 dark:text-gray-400">Active Ads</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-primary-600">{CATEGORIES.length}</div>
                            <div className="text-gray-600 dark:text-gray-400">Categories</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-primary-600">500+</div>
                            <div className="text-gray-600 dark:text-gray-400">Cities</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-primary-600">Free</div>
                            <div className="text-gray-600 dark:text-gray-400">To Post</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                <div className="container-app text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Post Your Ad?</h2>
                    <p className="text-primary-100 mb-8 max-w-xl mx-auto">
                        Reach thousands of potential buyers. It's free and takes less than 2 minutes!
                    </p>
                    <Link to="/post-ad" className="inline-block bg-white text-primary-600 hover:bg-gray-100 rounded-xl font-semibold px-8 py-3 transition-colors">
                        Post Your Ad Now
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
