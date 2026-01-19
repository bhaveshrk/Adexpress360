import React, { useState } from 'react';
import { Ad, CATEGORIES } from '../types';
import { useAds } from '../contexts/AdsContext';
import { useToast } from '../contexts/ToastContext';
import { maskPhone, shareAd, formatRelativeTime, sanitizeForDisplay } from '../utils/security';
import { MapPin, Eye, Phone, MessageCircle, Star, Clock, Share2, Bookmark, BookmarkCheck, Flag, X } from 'lucide-react';

interface AdCardProps {
    ad: Ad;
    showActions?: boolean;
    onEdit?: (ad: Ad) => void;
    onDelete?: (ad: Ad) => void;
}

// Saved ads stored in localStorage
const SAVED_ADS_KEY = 'adexpress360_saved_ads';

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

export function AdCard({ ad, showActions = false, onEdit, onDelete }: AdCardProps) {
    const { incrementCalls } = useAds();
    const { showToast } = useToast();
    const [showPhone, setShowPhone] = useState(false);
    const [isSaved, setIsSaved] = useState(() => getSavedAds().includes(ad.id));
    const [isSharing, setIsSharing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const category = CATEGORIES.find(c => c.id === ad.category);
    const timeAgo = formatRelativeTime(new Date(ad.created_at));

    // Decode HTML entities for display
    const displayTitle = sanitizeForDisplay(ad.title);
    const displaySubject = sanitizeForDisplay(ad.subject);
    const displayDescription = sanitizeForDisplay(ad.description);
    const displaySubDescription = ad.sub_description ? sanitizeForDisplay(ad.sub_description) : '';

    const handleCall = () => {
        incrementCalls(ad.id);
        window.open(`tel:${ad.phone_number}`, '_self');
    };

    const handleWhatsApp = () => {
        incrementCalls(ad.id);
        const message = encodeURIComponent(`Hi, I'm interested in your ad: "${displayTitle}" on adexpress360.`);
        window.open(`https://wa.me/91${ad.phone_number}?text=${message}`, '_blank');
    };

    const handleShare = async () => {
        setIsSharing(true);
        const url = `${window.location.origin}?ad=${ad.id}`;
        const success = await shareAd(displayTitle, url);
        if (success) {
            showToast('Link copied to clipboard!', 'success');
        }
        setIsSharing(false);
    };

    const handleSave = () => {
        const nowSaved = toggleSavedAd(ad.id);
        setIsSaved(nowSaved);
        showToast(nowSaved ? 'Ad saved!' : 'Ad removed from saved', 'info');
    };

    const handleReport = () => {
        showToast('Thank you for reporting. We will review this ad.', 'info');
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setShowPhone(false);
    };

    return (
        <>
            {/* Card - clickable to open modal */}
            <article
                className="card-hover overflow-hidden cursor-pointer"
                onClick={openModal}
            >
                {/* Featured badge */}
                {ad.is_featured && (
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1.5 flex items-center gap-1.5">
                        <Star size={14} className="fill-white text-white" />
                        <span className="text-xs font-semibold text-white uppercase tracking-wide">Featured</span>
                    </div>
                )}

                <div className="p-5">
                    {/* Top row: Category + Location */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="badge-primary">
                            {category?.icon} {category?.label}
                        </span>
                        <span className="badge-gray">
                            <MapPin size={12} />
                            {ad.city}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-snug mb-1 line-clamp-2">
                        {displayTitle}
                    </h3>

                    {/* Subject */}
                    <p className="text-sm text-primary-600 font-medium mb-2 line-clamp-1">
                        {displaySubject}
                    </p>

                    {/* Description - truncated */}
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                        {displayDescription}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <Eye size={14} />
                            {ad.views_count.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {timeAgo}
                        </span>
                    </div>
                </div>
            </article>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="badge-primary">
                                    {category?.icon} {category?.label}
                                </span>
                                {ad.is_featured && (
                                    <span className="badge-warning">
                                        <Star size={12} className="fill-current" />
                                        Featured
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-5">
                            {/* Title */}
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {displayTitle}
                            </h2>

                            {/* Subject */}
                            <p className="text-primary-600 dark:text-primary-400 font-medium mb-4">
                                {displaySubject}
                            </p>

                            {/* Location */}
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-4">
                                <MapPin size={16} />
                                <span>{ad.city}{ad.location && `, ${ad.location}`}</span>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                    {displayDescription}
                                </p>
                                {displaySubDescription && (
                                    <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">
                                        {displaySubDescription}
                                    </p>
                                )}
                            </div>

                            {/* Meta info */}
                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                                <span className="flex items-center gap-1">
                                    <Eye size={14} />
                                    {ad.views_count.toLocaleString()} views
                                </span>
                                <span className="flex items-center gap-1">
                                    <Phone size={14} />
                                    {ad.calls_count} calls
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {timeAgo}
                                </span>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                <button
                                    onClick={handleSave}
                                    className={`btn-sm ${isSaved ? 'btn-primary' : 'btn-secondary'}`}
                                >
                                    {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                                    {isSaved ? 'Saved' : 'Save'}
                                </button>
                                <button
                                    onClick={handleShare}
                                    disabled={isSharing}
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

                            {/* Contact section */}
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Contact Seller</p>
                                <div className="flex flex-col gap-2">
                                    {!showPhone ? (
                                        <button
                                            onClick={() => setShowPhone(true)}
                                            className="btn-secondary w-full"
                                        >
                                            <Phone size={18} />
                                            Show Number ({maskPhone(ad.phone_number)})
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleCall}
                                            className="btn-primary w-full"
                                        >
                                            <Phone size={18} />
                                            Call: +91 {ad.phone_number}
                                        </button>
                                    )}

                                    <button
                                        onClick={handleWhatsApp}
                                        className="btn-whatsapp w-full"
                                    >
                                        <MessageCircle size={18} />
                                        Chat on WhatsApp
                                    </button>
                                </div>
                            </div>

                            {/* Dashboard actions */}
                            {showActions && (
                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        onClick={() => { closeModal(); onEdit?.(ad); }}
                                        className="btn-secondary flex-1"
                                    >
                                        Edit Ad
                                    </button>
                                    <button
                                        onClick={() => { closeModal(); onDelete?.(ad); }}
                                        className="btn-danger"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
