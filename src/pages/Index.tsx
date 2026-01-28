import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FeaturedAds } from '../components/FeaturedAds';
import { useAds } from '../contexts/AdsContext';
import { CATEGORIES } from '../types';
import {
    Star, ArrowRight, TrendingUp, CheckCircle, Users, MapPin,
    Zap, Shield, Clock, MessageCircle, Search, PlusCircle,
    ChevronRight, Quote
} from 'lucide-react';

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000) {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    let startTime: number;
                    const animate = (currentTime: number) => {
                        if (!startTime) startTime = currentTime;
                        const progress = Math.min((currentTime - startTime) / duration, 1);
                        setCount(Math.floor(progress * end));
                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        }
                    };
                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, duration, hasAnimated]);

    return { count, ref };
}

// Testimonials data
const TESTIMONIALS = [
    {
        name: "Priya Sharma",
        location: "Mumbai",
        avatar: "https://i.pravatar.cc/100?img=1",
        text: "Found a great PG near my college through this platform. Saved so much time searching!",
        rating: 5
    },
    {
        name: "Rahul Verma",
        location: "Delhi",
        avatar: "https://i.pravatar.cc/100?img=3",
        text: "Got my dream job through a listing here. The response was quick and the process was smooth.",
        rating: 5
    },
    {
        name: "Anita Desai",
        location: "Bangalore",
        avatar: "https://i.pravatar.cc/100?img=5",
        text: "Posted a tuition service ad and got 20+ students in just one month. Amazing reach!",
        rating: 5
    }
];

export function Index() {
    const { getFeaturedAds, getFilteredAds } = useAds();
    const featuredAds = getFeaturedAds();
    const allAds = getFilteredAds();
    const [activeTestimonial, setActiveTestimonial] = useState(0);

    // Animated counters
    const adsCounter = useAnimatedCounter(allAds.length > 0 ? allAds.length : 1000, 1500);
    const usersCounter = useAnimatedCounter(5000, 2000);
    const citiesCounter = useAnimatedCounter(500, 1800);

    // Get ad count per category
    const getCategoryCount = (categoryId: string) => {
        return allAds.filter(ad => ad.category === categoryId).length;
    };

    // Auto-rotate testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Header />

            {/* ===== HERO SECTION ===== */}
            <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 text-white py-20 lg:py-28">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-float" />
                    <div className="absolute top-1/2 -left-20 w-60 h-60 bg-accent-500/20 rounded-full blur-3xl animate-float-delayed" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl animate-float-slow" />

                    {/* Grid pattern overlay */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                        backgroundSize: '50px 50px'
                    }} />
                </div>

                <div className="container-app relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Trust badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8 border border-white/20">
                            <Shield className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-medium text-gray-200">India's Trusted Classifieds Platform</span>
                        </div>

                        {/* Main headline */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Find Jobs, Homes, Services
                            <br />
                            <span className="gradient-text">& So Much More</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                            India's one-stop classifieds platform for jobs, rentals, services, matrimony & more.
                            Post your ad for <span className="text-primary-400 font-semibold">FREE</span> and connect with the right people instantly.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                            <Link
                                to="/post-ad"
                                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white rounded-xl font-semibold px-8 py-4 text-lg shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 hover:-translate-y-0.5"
                            >
                                <PlusCircle className="w-5 h-5" />
                                Post Free Ad
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/browse"
                                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold px-8 py-4 text-lg border border-white/20 hover:border-white/30 transition-all duration-300"
                            >
                                <Search className="w-5 h-5" />
                                Browse All Ads
                            </Link>
                        </div>

                        {/* Quick trust points */}
                        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span>100% Free Posting</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span>Verified Users</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span>Pan-India Reach</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== TRUST BAR / STATS ===== */}
            <section className="py-8 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 -mt-6 relative z-20">
                <div className="container-app">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div ref={adsCounter.ref} className="text-center p-4">
                            <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400">
                                {adsCounter.count.toLocaleString()}+
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Active Ads
                            </div>
                        </div>
                        <div ref={usersCounter.ref} className="text-center p-4">
                            <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400">
                                {usersCounter.count.toLocaleString()}+
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
                                <Users className="w-3 h-3" />
                                Happy Users
                            </div>
                        </div>
                        <div ref={citiesCounter.ref} className="text-center p-4">
                            <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400">
                                {citiesCounter.count.toLocaleString()}+
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
                                <MapPin className="w-3 h-3" />
                                Cities Covered
                            </div>
                        </div>
                        <div className="text-center p-4">
                            <div className="text-3xl md:text-4xl font-bold text-green-500">
                                FREE
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
                                <Zap className="w-3 h-3" />
                                To Post Ads
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== BROWSE BY CATEGORY ===== */}
            <section className="py-16 dark:bg-gray-900">
                <div className="container-app">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                            Browse by Category
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                            Find what you're looking for in our diverse range of categories
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                        {CATEGORIES.map(category => {
                            const count = getCategoryCount(category.id);
                            return (
                                <Link
                                    key={category.id}
                                    to={`/category/${category.id}`}
                                    className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-300 hover:-translate-y-1 hover-glow"
                                >
                                    {/* Category icon with gradient background */}
                                    <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/50 dark:to-primary-800/50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <span className="text-3xl">{category.icon}</span>
                                    </div>

                                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1">
                                        {category.label}
                                    </h3>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {count} ad{count !== 1 ? 's' : ''}
                                        </span>
                                        <ArrowRight
                                            size={16}
                                            className="text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all"
                                        />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ===== FEATURED ADS ===== */}
            {featuredAds.length > 0 && (
                <section className="py-16 bg-gradient-to-b from-amber-50 via-orange-50/50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-900">
                    <div className="container-app">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                                        <Star className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                        Featured Ads
                                    </h2>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Premium listings from verified sellers
                                </p>
                            </div>
                            <Link
                                to="/browse"
                                className="hidden md:inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium hover:underline"
                            >
                                View All
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                        <FeaturedAds />
                    </div>
                </section>
            )}

            {/* ===== HOW IT WORKS ===== */}
            <section className="py-16 bg-gray-50 dark:bg-gray-900">
                <div className="container-app">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                            How It Works
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                            Get started in just 3 simple steps
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {/* Step 1 */}
                        <div className="relative text-center group">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform duration-300">
                                <PlusCircle className="w-10 h-10 text-white" />
                            </div>
                            <div className="absolute top-10 left-[calc(50%+50px)] hidden md:block w-[calc(100%-60px)] h-0.5 bg-gradient-to-r from-primary-500 to-gray-200 dark:to-gray-700" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                1. Post Your Ad
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Create your free ad with photos and details in under 2 minutes
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative text-center group">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg shadow-accent-500/25 group-hover:scale-105 transition-transform duration-300">
                                <MessageCircle className="w-10 h-10 text-white" />
                            </div>
                            <div className="absolute top-10 left-[calc(50%+50px)] hidden md:block w-[calc(100%-60px)] h-0.5 bg-gradient-to-r from-accent-500 to-gray-200 dark:to-gray-700" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                2. Get Responses
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Receive calls and messages from interested people instantly
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="text-center group">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:scale-105 transition-transform duration-300">
                                <CheckCircle className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                3. Close the Deal
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Meet, negotiate, and complete your transaction safely
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== TESTIMONIALS ===== */}
            <section className="py-16 bg-white dark:bg-gray-800">
                <div className="container-app">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                            What Our Users Say
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Join thousands of satisfied buyers and sellers
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto">
                        {/* Testimonial card */}
                        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 rounded-3xl p-8 md:p-10">
                            <Quote className="absolute top-6 left-6 w-12 h-12 text-primary-200 dark:text-primary-800" />

                            <div className="relative z-10">
                                <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 mb-6 leading-relaxed">
                                    "{TESTIMONIALS[activeTestimonial].text}"
                                </p>

                                <div className="flex items-center gap-4">
                                    <img
                                        src={TESTIMONIALS[activeTestimonial].avatar}
                                        alt={TESTIMONIALS[activeTestimonial].name}
                                        className="w-14 h-14 rounded-full object-cover ring-4 ring-white dark:ring-gray-600"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {TESTIMONIALS[activeTestimonial].name}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {TESTIMONIALS[activeTestimonial].location}
                                        </div>
                                    </div>
                                    <div className="ml-auto flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className="w-5 h-5 text-amber-400 fill-amber-400"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial dots */}
                        <div className="flex justify-center gap-2 mt-6">
                            {TESTIMONIALS.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveTestimonial(index)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === activeTestimonial
                                        ? 'bg-primary-500 w-8'
                                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FINAL CTA ===== */}
            <section className="relative py-20 overflow-hidden">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800" />

                {/* Decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                </div>

                <div className="container-app relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
                        <Clock className="w-4 h-4 text-primary-200" />
                        <span className="text-sm font-medium text-white/90">Takes less than 2 minutes</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        Ready to Post Your Ad?
                    </h2>
                    <p className="text-lg text-primary-100 mb-8 max-w-xl mx-auto">
                        Whether it's a job, rental, service, or anything else — reach thousands instantly.
                        It's completely free!
                    </p>

                    <Link
                        to="/post-ad"
                        className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-primary-600 rounded-xl font-bold px-10 py-4 text-lg shadow-xl shadow-black/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
                    >
                        Post Your Free Ad Now
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
