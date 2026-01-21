import { useState } from 'react';
import { DURATION_OPTIONS } from '../types';
import { X, Clock, Calendar, Check } from 'lucide-react';

interface ExtendDurationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (days: number) => void;
    adTitle: string;
    currentExpiry: Date;
    mode: 'extend' | 'renew';
}

export function ExtendDurationModal({
    isOpen,
    onClose,
    onConfirm,
    adTitle,
    currentExpiry,
    mode
}: ExtendDurationModalProps) {
    const [selectedDays, setSelectedDays] = useState(7);

    if (!isOpen) return null;

    const now = new Date();
    const isExpired = currentExpiry < now;
    const baseDate = mode === 'extend' && !isExpired ? currentExpiry : now;
    const newExpiry = new Date(baseDate.getTime() + selectedDays * 24 * 60 * 60 * 1000);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {mode === 'extend' ? 'Extend Duration' : 'Renew Ad'}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 truncate">
                        {adTitle}
                    </p>
                </div>

                {/* Duration Options */}
                <div className="space-y-2 mb-6">
                    {DURATION_OPTIONS.map(option => (
                        <button
                            key={option.days}
                            onClick={() => setSelectedDays(option.days)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedDays === option.days
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedDays === option.days
                                        ? 'border-primary-500 bg-primary-500'
                                        : 'border-gray-300 dark:border-gray-500'
                                    }`}>
                                    {selectedDays === option.days && (
                                        <Check size={12} className="text-white" />
                                    )}
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {option.label}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        +{option.days} days
                                    </div>
                                </div>
                            </div>
                            <span className={`font-semibold ${option.price === 'Free'
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                {option.price}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Expiry Preview */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <Calendar size={16} />
                        <span>New expiry date</span>
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                        {formatDate(newExpiry)}
                    </div>
                    {mode === 'extend' && !isExpired && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Current: {formatDate(currentExpiry)}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(selectedDays)}
                        className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <Clock size={18} />
                        {mode === 'extend' ? 'Extend' : 'Renew'}
                    </button>
                </div>
            </div>
        </div>
    );
}
