import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FeaturedAds } from '../components/FeaturedAds';
import { useAds } from '../contexts/AdsContext';
import { CATEGORIES } from '../types';
import {
    Star, ArrowRight, TrendingUp, FileEdit, Upload, CheckCircle,
    Search, Filter, Phone, Shield, Zap, Clock, Users, ThumbsUp,
    MapPin, Eye, MessageCircle
} from 'lucide-react';

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

            {/* Hero Section - Enhanced */}
            <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-300 rounded-full blur-3xl" />
                </div>

                <div className="container-app text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                        <Zap size={16} className="text-amber-400" />
                        <span className="text-sm font-medium">India's Easiest Classified Platform</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Post Ads in <span className="text-amber-400">2 Minutes</span>
                        <br />Find What You Need <span className="text-amber-400">Instantly</span>
                    </h1>

                    <p className="text-xl text-primary-100 mb-10 max-w-3xl mx-auto">
                        Whether you're selling, buying, hiring, or searching — our platform makes it
                        simple. No complicated steps. No hidden fees. Just results.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/post-ad" className="group btn-lg bg-white text-primary-600 hover:bg-gray-100 rounded-xl font-semibold px-8 py-4 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
                            <Upload size={20} />
                            Post Free Ad
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/browse" className="btn-lg bg-primary-500 text-white hover:bg-primary-400 rounded-xl font-semibold px-8 py-4 flex items-center gap-2 border border-primary-400">
                            <Search size={20} />
                            Browse All Ads
                        </Link>
                    </div>

                    {/* Trust indicators */}
                    <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm text-primary-200">
                        <div className="flex items-center gap-2">
                            <Shield size={18} className="text-green-400" />
                            <span>Verified Listings</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users size={18} className="text-blue-400" />
                            <span>10,000+ Users</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ThumbsUp size={18} className="text-amber-400" />
                            <span>100% Free to Post</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works - For Advertisers */}
            <section className="py-16 bg-white dark:bg-gray-800">
                <div className="container-app">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Post Your Ad in 3 Simple Steps
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            No registration hassles. No waiting for approval. Your ad goes live instantly.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {/* Step 1 */}
                        <div className="relative group">
                            <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-2xl p-8 h-full border border-primary-100 dark:border-primary-800 hover:shadow-lg transition-all">
                                <div className="w-14 h-14 bg-primary-500 text-white rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold shadow-lg">
                                    1
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <FileEdit className="text-primary-600" size={28} />
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Fill Details</h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Enter your ad title, description, category, and contact number. Our smart form guides you through.
                                </p>
                                <div className="mt-4 flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
                                    <Clock size={16} />
                                    <span>Takes ~1 minute</span>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative group">
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-2xl p-8 h-full border border-emerald-100 dark:border-emerald-800 hover:shadow-lg transition-all">
                                <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold shadow-lg">
                                    2
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <Eye className="text-emerald-600" size={28} />
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Preview & Submit</h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Review how your ad will appear to buyers. Make edits if needed, then hit publish.
                                </p>
                                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle size={16} />
                                    <span>Instant preview</span>
                                </div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative group">
                            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-2xl p-8 h-full border border-amber-100 dark:border-amber-800 hover:shadow-lg transition-all">
                                <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold shadow-lg">
                                    3
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <Phone className="text-amber-600" size={28} />
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Get Responses</h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Your ad goes live instantly! Start receiving calls and WhatsApp messages from interested buyers.
                                </p>
                                <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                                    <Zap size={16} />
                                    <span>Live in seconds</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link to="/post-ad" className="inline-flex items-center gap-2 btn-primary px-8 py-3 text-lg">
                            <Upload size={20} />
                            Post Your First Ad — It's Free!
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works - For Buyers/Searchers */}
            <section className="py-16 bg-gray-50 dark:bg-gray-900">
                <div className="container-app">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Find Exactly What You Need
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Powerful search and filters help you discover the perfect listing in seconds.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Feature 1 */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
                                <Search className="text-blue-600" size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Search</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Type what you're looking for and get instant results across all categories.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mb-4">
                                <Filter className="text-purple-600" size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Advanced Filters</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Filter by city, category, date posted, and more to narrow down results.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mb-4">
                                <MapPin className="text-green-600" size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Local Results</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Find ads near you. Browse 500+ cities across India with location-based search.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center mb-4">
                                <MessageCircle className="text-amber-600" size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Direct Contact</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Call or WhatsApp sellers directly. No middleman. Fast communication.
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-10">
                        <Link to="/browse" className="inline-flex items-center gap-2 btn-secondary px-8 py-3 text-lg">
                            <Search size={20} />
                            Start Browsing Now
                        </Link>
                    </div>
                </div>
            </section>

            {/* Browse by Category Section */}
            <section className="py-12 bg-white dark:bg-gray-800">
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
                                    className="group bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-600 hover:border-primary-200 hover:bg-white dark:hover:bg-gray-600"
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

            {/* Featured Ads Section */}
            {featuredAds.length > 0 && (
                <section className="py-12 bg-gradient-to-b from-amber-50 to-white dark:from-gray-800 dark:to-gray-900">
                    <div className="container-app">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Star className="text-amber-500" size={24} />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Ads</h2>
                            </div>
                            <Link to="/browse" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                                View All <ArrowRight size={16} />
                            </Link>
                        </div>
                        <FeaturedAds />
                    </div>
                </section>
            )}

            {/* Stats Section - Enhanced */}
            <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                <div className="container-app">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold mb-2">Trusted by Thousands</h2>
                        <p className="text-gray-400">Join India's growing classified community</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div className="group">
                            <div className="text-4xl font-bold text-primary-400 mb-2 group-hover:scale-110 transition-transform">{allAds.length}+</div>
                            <div className="text-gray-400">Active Ads</div>
                        </div>
                        <div className="group">
                            <div className="text-4xl font-bold text-emerald-400 mb-2 group-hover:scale-110 transition-transform">{CATEGORIES.length}</div>
                            <div className="text-gray-400">Categories</div>
                        </div>
                        <div className="group">
                            <div className="text-4xl font-bold text-blue-400 mb-2 group-hover:scale-110 transition-transform">500+</div>
                            <div className="text-gray-400">Cities Covered</div>
                        </div>
                        <div className="group">
                            <div className="text-4xl font-bold text-amber-400 mb-2 group-hover:scale-110 transition-transform">Free</div>
                            <div className="text-gray-400">To Post Ads</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-16 bg-white dark:bg-gray-800">
                <div className="container-app">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose AdExpress360?</h2>
                        <p className="text-gray-600 dark:text-gray-400">Built for simplicity, designed for results</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Zap className="text-green-600" size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Lightning Fast</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Post ads in under 2 minutes. No lengthy forms, no approval delays. Your ad goes live instantly.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Shield className="text-blue-600" size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Safe & Secure</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                We review all listings to keep scammers out. Your data is protected with industry-standard security.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <ThumbsUp className="text-purple-600" size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">100% Free</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                No hidden charges for basic ads. Post as many ads as you want without paying a single rupee.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-300 rounded-full blur-3xl" />
                </div>

                <div className="container-app text-center relative z-10">
                    <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
                        Join thousands of happy users. Whether you're selling or searching,
                        AdExpress360 makes it simple.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/post-ad" className="inline-flex items-center gap-2 bg-white text-primary-600 hover:bg-gray-100 rounded-xl font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all">
                            <Upload size={22} />
                            Post Your Ad Now
                        </Link>
                        <Link to="/browse" className="inline-flex items-center gap-2 bg-primary-500 text-white hover:bg-primary-400 rounded-xl font-semibold px-8 py-4 text-lg border border-primary-400">
                            <Search size={22} />
                            Browse Listings
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
