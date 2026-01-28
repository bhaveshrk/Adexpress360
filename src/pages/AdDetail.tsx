import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAds } from '../contexts/AdsContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Ad, CATEGORIES } from '../types';
import { formatRelativeTime, sanitizeForDisplay, shareAd, copyToClipboard } from '../utils/security';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import {
    MapPin, Phone, MessageCircle, Star, Clock, Share2, Bookmark,
    BookmarkCheck, Flag, ArrowLeft, Eye, CheckCircle, Copy,
    Facebook, Twitter, Mail, X
} from 'lucide-react';

// Saved ads stored in localStorage
const SAVED_ADS_KEY = 'findads_saved_ads';

const getSavedAds = (): string[] => {
    try {
        const saved = localStorage.getItem(SAVED_ADS_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

const toggleSavedAd = (adId: string): boolean => {
    const saved = getSavedAds();
    const isSaved = saved.includes(adId);
    if (isSaved) {
        localStorage.setItem(SAVED_ADS_KEY, JSON.stringify(saved.filter(id => id !== adId)));
        return false;
    } else {
        localStorage.setItem(SAVED_ADS_KEY, JSON.stringify([...saved, adId]));
        return true;
    }
};

export function AdDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { ads, incrementCalls, incrementViews } = useAds();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [ad, setAd] = useState<Ad | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (id) {
            const foundAd = ads.find(a => a.id === id);
            if (foundAd) {
                setAd(foundAd);
                setIsSaved(getSavedAds().includes(foundAd.id));
                // Increment views for non-owners
                if (user?.id !== foundAd.user_id) {
                    incrementViews(foundAd.id);
                }
            }
            setLoading(false);
        }
    }, [id, ads, user, incrementViews]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                </div>
                <Footer />
            </div>
        );
    }

    if (!ad) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ad Not Found</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">This ad may have been removed or expired.</p>
                    <Link to="/browse" className="btn-primary">
                        Browse All Ads
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const category = CATEGORIES.find(c => c.id === ad.category);
    const timeAgo = formatRelativeTime(new Date(ad.created_at));
    const isOwner = user?.id === ad.user_id;

    const displayTitle = sanitizeForDisplay(ad.title);
    const displaySubject = sanitizeForDisplay(ad.subject);
    const displayDescription = sanitizeForDisplay(ad.description);
    const displaySubDescription = ad.sub_description ? sanitizeForDisplay(ad.sub_description) : '';

    const shareUrl = `${window.location.origin}/ad/${ad.id}`;

    const handleCall = () => {
        incrementCalls(ad.id);
        window.open(`tel:${ad.phone_number}`, '_self');
    };

    const handleWhatsApp = () => {
        incrementCalls(ad.id);
        const message = encodeURIComponent(`Hi, I'm interested in your ad: "${displayTitle}" on FindAds.`);
        window.open(`https://wa.me/91${ad.phone_number}?text=${message}`, '_blank');
    };

    const handleShare = async () => {
        const success = await shareAd(displayTitle, shareUrl);
        if (success) {
            showToast('Shared successfully!', 'success');
        } else {
            setShowShareModal(true);
        }
    };

    const handleCopyLink = async () => {
        const success = await copyToClipboard(shareUrl);
        if (success) {
            setCopied(true);
            showToast('Link copied to clipboard!', 'success');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleSave = () => {
        const nowSaved = toggleSavedAd(ad.id);
        setIsSaved(nowSaved);
        showToast(nowSaved ? 'Ad saved!' : 'Ad removed from saved', 'info');
    };

    const handleReport = () => {
        showToast('Thank you for reporting. We will review this ad.', 'info');
    };

    const handleShareFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
    };

    const handleShareTwitter = () => {
        const text = encodeURIComponent(`Check out this ad: ${displayTitle}`);
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${text}`, '_blank', 'width=600,height=400');
    };

    const handleShareEmail = () => {
        const subject = encodeURIComponent(`Check out this ad: ${displayTitle}`);
        const body = encodeURIComponent(`I found this interesting ad:\n\n${displayTitle}\n${displaySubject}\n\nView it here: ${shareUrl}`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Header />

            <main className="flex-1 container-app py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-6 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                            {/* Featured Badge */}
                            {ad.is_featured && (
                                <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-2 flex items-center gap-2">
                                    <Star size={16} className="fill-white text-white" />
                                    <span className="text-sm font-semibold text-white">Featured Ad</span>
                                </div>
                            )}

                            <div className="p-6 md:p-8">
                                {/* Category & Location */}
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className="badge-primary text-sm">
                                        {category?.icon} {category?.label}
                                    </span>
                                    <span className="badge-gray text-sm">
                                        <MapPin size={14} />
                                        {ad.city}{ad.location && `, ${ad.location}`}
                                    </span>
                                </div>

                                {/* Title */}
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                    {displayTitle}
                                </h1>

                                {/* Subject */}
                                <p className="text-lg text-primary-600 dark:text-primary-400 font-medium mb-6">
                                    {displaySubject}
                                </p>

                                {/* Meta Info */}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        Posted {timeAgo}
                                    </span>
                                    {isOwner && (
                                        <>
                                            <span className="flex items-center gap-1">
                                                <Eye size={14} />
                                                {ad.views_count} views
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Phone size={14} />
                                                {ad.calls_count} calls
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h2>
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {displayDescription}
                                    </p>
                                    {displaySubDescription && (
                                        <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm">
                                            {displaySubDescription}
                                        </p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={handleSave}
                                        className={`btn-sm ${isSaved ? 'btn-primary' : 'btn-secondary'}`}
                                    >
                                        {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                                        {isSaved ? 'Saved' : 'Save'}
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="btn-secondary btn-sm"
                                    >
                                        <Share2 size={16} />
                                        Share
                                    </button>
                                    <button
                                        onClick={handleReport}
                                        className="btn-secondary btn-sm text-gray-500"
                                    >
                                        <Flag size={14} />
                                        Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Contact */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-24">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Seller</h3>

                            <div className="space-y-3">
                                <button
                                    onClick={handleCall}
                                    className="btn-primary w-full py-3"
                                >
                                    <Phone size={20} />
                                    Call Now
                                </button>

                                <button
                                    onClick={handleWhatsApp}
                                    className="btn-whatsapp w-full py-3"
                                >
                                    <MessageCircle size={20} />
                                    Chat on WhatsApp
                                </button>
                            </div>

                            {/* Safety Tips */}
                            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                <h4 className="font-semibold text-amber-800 dark:text-amber-300 text-sm mb-2">Safety Tips</h4>
                                <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                                    <li>• Meet in a public place</li>
                                    <li>• Inspect item before paying</li>
                                    <li>• Don't share personal info</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Share Modal */}
            {showShareModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
                    onClick={() => setShowShareModal(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Share this Ad</h3>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Copy Link */}
                        <div className="mb-6">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Copy Link</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={shareUrl}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                                />
                                <button
                                    onClick={handleCopyLink}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${copied
                                        ? 'bg-green-500 text-white'
                                        : 'bg-primary-500 text-white hover:bg-primary-600'
                                        }`}
                                >
                                    {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Social Share */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Share on</label>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleShareFacebook}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Facebook size={20} />
                                    Facebook
                                </button>
                                <button
                                    onClick={handleShareTwitter}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                                >
                                    <Twitter size={20} />
                                    Twitter
                                </button>
                                <button
                                    onClick={handleShareEmail}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    <Mail size={20} />
                                    Email
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
