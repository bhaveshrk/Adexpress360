import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAds } from '../contexts/AdsContext';
import { useToast } from '../contexts/ToastContext';
import { CATEGORIES, CITIES_BY_STATE, DURATION_OPTIONS, AdCategory, City, AdFormData, validatePhone } from '../types';
import { ArrowLeft, ArrowRight, Check, Star, Search, ChevronDown, MapPin } from 'lucide-react';

export function PostAd() {
    const { user, loading: authLoading } = useAuth();
    const { addAd } = useAds();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [citySearch, setCitySearch] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const cityDropdownRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState<AdFormData>({
        title: '',
        subject: '',
        description: '',
        sub_description: '',
        phone_number: user?.phone_number || '',
        category: 'general',
        city: 'Mumbai',
        location: '',
        duration_days: 7,
        is_featured: false,
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
                setShowCityDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    React.useEffect(() => {
        if (!authLoading && !user) navigate('/auth');
        if (user?.phone_number) setFormData(prev => ({ ...prev, phone_number: user.phone_number }));
    }, [user, authLoading, navigate]);

    const updateFormData = (updates: Partial<AdFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
        Object.keys(updates).forEach(key => {
            if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
        });
    };

    const handleCitySelect = (city: string) => {
        updateFormData({ city });
        setCitySearch('');
        setShowCityDropdown(false);
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
        if (!formData.subject.trim()) newErrors.subject = 'Headline is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (formData.description.length < 20) newErrors.description = 'Description must be at least 20 characters';
        if (!validatePhone(formData.phone_number)) newErrors.phone_number = 'Enter a valid 10-digit mobile number';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!user) return;
        setSubmitting(true);
        try {
            await addAd(formData, user.id);
            showToast('Ad published successfully!', 'success');
            navigate('/dashboard');
        } catch {
            showToast('Failed to publish ad', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const canProceedStep1 = formData.category && formData.city;
    const canProceedStep2 = formData.title && formData.subject && formData.description && formData.phone_number.length === 10;

    // Filter cities based on search
    const filteredCities = Object.entries(CITIES_BY_STATE).reduce((acc, [state, cities]) => {
        const filtered = cities.filter(city =>
            city.toLowerCase().includes(citySearch.toLowerCase()) ||
            state.toLowerCase().includes(citySearch.toLowerCase())
        );
        if (filtered.length > 0) acc[state] = filtered;
        return acc;
    }, {} as Record<string, string[]>);

    if (authLoading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 py-6">
                <div className="container-app">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                        <ArrowLeft size={18} /> Back
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Post Your Ad</h1>
                    <p className="text-gray-500 mt-1">Reach millions of customers across India</p>
                </div>
            </div>

            {/* Steps */}
            <div className="bg-white border-b border-gray-100 py-4">
                <div className="container-app">
                    <div className="flex items-center max-w-xl">
                        {[1, 2, 3].map((num, i) => (
                            <React.Fragment key={num}>
                                <div className={`step-indicator ${step === num ? 'step-active' : step > num ? 'step-complete' : 'step-pending'}`}>
                                    <div className="step-circle">{step > num ? <Check size={14} /> : num}</div>
                                </div>
                                {i < 2 && <div className={step > num ? 'step-line-complete' : 'step-line'} />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="container-app py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="card p-6">
                        {/* Step 1 */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900">Category & Location</h2>

                                <div>
                                    <label className="label">Category</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => updateFormData({ category: cat.id })}
                                                className={`p-4 rounded-xl border-2 text-left transition-all ${formData.category === cat.id
                                                        ? 'border-primary-500 bg-primary-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <span className="text-2xl">{cat.icon}</span>
                                                <span className="block text-sm font-medium text-gray-900 mt-1">{cat.label}</span>
                                                <span className="block text-xs text-gray-500">{cat.description}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* City Selector with Dropdown */}
                                <div ref={cityDropdownRef} className="relative">
                                    <label className="label">City</label>

                                    {/* Selected city display / trigger button */}
                                    <button
                                        type="button"
                                        onClick={() => setShowCityDropdown(!showCityDropdown)}
                                        className="w-full flex items-center justify-between input cursor-pointer"
                                    >
                                        <span className="flex items-center gap-2">
                                            <MapPin size={18} className="text-gray-400" />
                                            <span className="font-medium">{formData.city}</span>
                                        </span>
                                        <ChevronDown size={18} className={`text-gray-400 transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown */}
                                    {showCityDropdown && (
                                        <div className="absolute z-20 mt-2 w-full bg-white rounded-xl shadow-soft border border-gray-200 animate-fade-in">
                                            {/* Search input */}
                                            <div className="p-3 border-b border-gray-100">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        type="text"
                                                        value={citySearch}
                                                        onChange={(e) => setCitySearch(e.target.value)}
                                                        placeholder="Search city or state..."
                                                        className="input pl-10 py-2"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>

                                            {/* City list */}
                                            <div className="max-h-64 overflow-y-auto">
                                                {Object.keys(filteredCities).length === 0 ? (
                                                    <div className="p-4 text-center text-gray-500">No cities found</div>
                                                ) : (
                                                    Object.entries(filteredCities).map(([state, cities]) => (
                                                        <div key={state}>
                                                            <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase sticky top-0">
                                                                {state}
                                                            </div>
                                                            {cities.map(city => (
                                                                <button
                                                                    key={city}
                                                                    type="button"
                                                                    onClick={() => handleCitySelect(city)}
                                                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${formData.city === city
                                                                            ? 'bg-primary-50 text-primary-700 font-medium'
                                                                            : 'hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    {city}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="label">Locality / Area <span className="text-gray-400">(optional)</span></label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => updateFormData({ location: e.target.value })}
                                        placeholder="e.g., Koramangala, Andheri West"
                                        className="input"
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button onClick={() => setStep(2)} disabled={!canProceedStep1} className="btn-primary">
                                        Continue <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2 */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900">Ad Details</h2>

                                <div>
                                    <label className="label">Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => updateFormData({ title: e.target.value })}
                                        placeholder="e.g., 2BHK Apartment for Rent near Metro"
                                        className={errors.title ? 'input border-danger-500' : 'input'}
                                        maxLength={100}
                                    />
                                    {errors.title && <p className="text-danger-500 text-sm mt-1">{errors.title}</p>}
                                    <p className="text-xs text-gray-400 mt-1">{formData.title.length}/100</p>
                                </div>

                                <div>
                                    <label className="label">Headline *</label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => updateFormData({ subject: e.target.value })}
                                        placeholder="Short catchy headline to grab attention"
                                        className={errors.subject ? 'input border-danger-500' : 'input'}
                                        maxLength={150}
                                    />
                                    {errors.subject && <p className="text-danger-500 text-sm mt-1">{errors.subject}</p>}
                                </div>

                                <div>
                                    <label className="label">Description *</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => updateFormData({ description: e.target.value })}
                                        placeholder="Describe your ad in detail. Include all relevant information like condition, features, price, timing, etc."
                                        rows={5}
                                        className={errors.description ? 'input border-danger-500 resize-none' : 'input resize-none'}
                                    />
                                    {errors.description && <p className="text-danger-500 text-sm mt-1">{errors.description}</p>}
                                    <p className="text-xs text-gray-400 mt-1">{formData.description.length} characters</p>
                                </div>

                                <div>
                                    <label className="label">Contact Number *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 border-r border-gray-200 pr-2 text-sm">+91</span>
                                        <input
                                            type="tel"
                                            value={formData.phone_number}
                                            onChange={(e) => updateFormData({ phone_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                            placeholder="9876543210"
                                            className={errors.phone_number ? 'input pl-14 border-danger-500' : 'input pl-14'}
                                        />
                                    </div>
                                    {errors.phone_number && <p className="text-danger-500 text-sm mt-1">{errors.phone_number}</p>}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <button onClick={() => setStep(1)} className="btn-secondary"><ArrowLeft size={16} /> Back</button>
                                    <button onClick={() => { if (validateStep2()) setStep(3); }} disabled={!canProceedStep2} className="btn-primary">
                                        Continue <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3 */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900">Review & Publish</h2>

                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-900">{formData.title}</h3>
                                    <p className="text-primary-600 text-sm">{formData.subject}</p>
                                    <p className="text-gray-600 text-sm mt-2 line-clamp-3">{formData.description}</p>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <span className="badge-primary">{CATEGORIES.find(c => c.id === formData.category)?.icon} {CATEGORIES.find(c => c.id === formData.category)?.label}</span>
                                        <span className="badge-gray">{formData.city}{formData.location && `, ${formData.location}`}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">📞 +91 {formData.phone_number}</p>
                                </div>

                                <div>
                                    <label className="label">Duration & Pricing</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {DURATION_OPTIONS.map(opt => (
                                            <button
                                                key={opt.days}
                                                type="button"
                                                onClick={() => updateFormData({ duration_days: opt.days })}
                                                className={`p-4 rounded-xl border-2 text-left transition-all ${formData.duration_days === opt.days
                                                        ? 'border-primary-500 bg-primary-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <span className="font-medium text-gray-900">{opt.label}</span>
                                                <span className={`block text-sm mt-0.5 ${opt.price === 'Free' ? 'text-success-600 font-medium' : 'text-gray-500'}`}>
                                                    {opt.price}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input type="checkbox" checked={formData.is_featured} onChange={(e) => updateFormData({ is_featured: e.target.checked })} className="mt-1 w-5 h-5 accent-amber-500" />
                                        <div>
                                            <span className="flex items-center gap-2 font-medium text-gray-900">
                                                <Star className="text-amber-500 fill-amber-500" size={16} />
                                                Featured Ad - ₹99
                                            </span>
                                            <p className="text-sm text-gray-600 mt-1">Appear at the top of search results and get 10x more views</p>
                                        </div>
                                    </label>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <button onClick={() => setStep(2)} className="btn-secondary"><ArrowLeft size={16} /> Back</button>
                                    <button onClick={handleSubmit} disabled={submitting} className="btn-success btn-lg">
                                        {submitting ? 'Publishing...' : 'Publish Ad'} <Check size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
