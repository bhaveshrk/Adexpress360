import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Ad, AdCategory, AdsFilter, AdFormData } from '../types';
import { supabase } from '../lib/supabase';
import { sanitizeInput, validateAdContent } from '../utils/security';

interface AdsContextType {
    ads: Ad[];
    loading: boolean;
    filter: AdsFilter;
    setFilter: (filter: Partial<AdsFilter>) => void;
    getFilteredAds: () => Ad[];
    getFeaturedAds: () => Ad[];
    getUserAds: (userId: string) => Ad[];
    getAdById: (id: string) => Ad | undefined;
    getCategoryCount: (category: AdCategory | 'all') => number;
    addAd: (formData: AdFormData, userId: string) => Promise<{ ad?: Ad; error?: string }>;
    updateAd: (id: string, formData: Partial<AdFormData>, userId: string) => Promise<{ ad?: Ad; error?: string }>;
    deleteAd: (id: string, userId: string) => Promise<{ success: boolean; error?: string }>;
    incrementViews: (id: string) => void;
    incrementCalls: (id: string) => void;
    renewAd: (id: string, days: number) => Promise<boolean>;
    refreshAds: () => Promise<void>;
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);
const LOCAL_ADS_KEY = 'adexpress360_ads_local';

// Get ads from localStorage
function getLocalAds(): Ad[] {
    try {
        const stored = localStorage.getItem(LOCAL_ADS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

// Save ads to localStorage
function saveLocalAds(ads: Ad[]) {
    localStorage.setItem(LOCAL_ADS_KEY, JSON.stringify(ads));
}

export function AdsProvider({ children }: { children: ReactNode }) {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilterState] = useState<AdsFilter>({
        city: 'all',
        category: 'all',
        searchQuery: '',
    });

    // Fetch ads from both Supabase and local storage
    const fetchAds = async () => {
        try {
            // Get local ads
            const localAds = getLocalAds();

            // Try to get Supabase ads (for approved ads from admin)
            let supabaseAds: Ad[] = [];
            try {
                const { data, error } = await supabase
                    .from('ads')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    supabaseAds = data;
                }
            } catch (e) {
                console.log('Supabase fetch skipped:', e);
            }

            // Merge: prefer Supabase ads, add local ads that aren't in Supabase
            const supabaseIds = new Set(supabaseAds.map(a => a.id));
            const mergedAds = [
                ...supabaseAds,
                ...localAds.filter(a => !supabaseIds.has(a.id))
            ];

            setAds(mergedAds);
        } catch (error) {
            console.error('Fetch ads error:', error);
            // Fallback to local only
            setAds(getLocalAds());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();

        // Subscribe to realtime changes from Supabase
        const channel = supabase
            .channel('ads-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ads' }, () => {
                fetchAds();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const refreshAds = async () => {
        setLoading(true);
        await fetchAds();
    };

    const setFilter = useCallback((newFilter: Partial<AdsFilter>) => {
        setFilterState(prev => ({ ...prev, ...newFilter }));
    }, []);

    const getFilteredAds = useCallback((): Ad[] => {
        return ads.filter(ad => {
            if (!ad.is_active) return false;
            if (new Date(ad.expires_at) < new Date()) return false;
            // Only show approved ads to public (or pending to owner in dashboard)
            if (ad.approval_status && ad.approval_status !== 'approved') return false;
            if (filter.city !== 'all' && ad.city !== filter.city) return false;
            if (filter.category !== 'all' && ad.category !== filter.category) return false;
            if (filter.searchQuery) {
                const query = filter.searchQuery.toLowerCase();
                const matchesTitle = ad.title.toLowerCase().includes(query);
                const matchesSubject = ad.subject.toLowerCase().includes(query);
                const matchesDescription = ad.description.toLowerCase().includes(query);
                const matchesCity = ad.city.toLowerCase().includes(query);
                const matchesLocation = ad.location?.toLowerCase().includes(query);
                if (!matchesTitle && !matchesSubject && !matchesDescription && !matchesCity && !matchesLocation) return false;
            }
            return true;
        });
    }, [ads, filter]);

    const getFeaturedAds = useCallback((): Ad[] => {
        return ads.filter(ad =>
            ad.is_active &&
            ad.is_featured &&
            new Date(ad.expires_at) > new Date() &&
            (!ad.approval_status || ad.approval_status === 'approved')
        );
    }, [ads]);

    const getUserAds = useCallback((userId: string): Ad[] => {
        return ads.filter(ad => ad.user_id === userId);
    }, [ads]);

    const getAdById = useCallback((id: string): Ad | undefined => {
        return ads.find(ad => ad.id === id);
    }, [ads]);

    const getCategoryCount = useCallback((category: AdCategory | 'all'): number => {
        const activeAds = ads.filter(ad =>
            ad.is_active &&
            new Date(ad.expires_at) > new Date() &&
            (!ad.approval_status || ad.approval_status === 'approved')
        );
        if (category === 'all') return activeAds.length;
        return activeAds.filter(ad => ad.category === category).length;
    }, [ads]);

    const addAd = useCallback(async (formData: AdFormData, userId: string): Promise<{ ad?: Ad; error?: string }> => {
        // Sanitize inputs
        const sanitizedTitle = sanitizeInput(formData.title);
        const sanitizedSubject = sanitizeInput(formData.subject);
        const sanitizedDescription = sanitizeInput(formData.description);

        // Validate content
        const validation = validateAdContent(sanitizedTitle, sanitizedDescription);
        if (!validation.isValid) {
            return { error: validation.errors[0] };
        }

        const newAd: Ad = {
            id: crypto.randomUUID(),
            user_id: userId,
            title: sanitizedTitle,
            subject: sanitizedSubject,
            description: sanitizedDescription,
            sub_description: formData.sub_description ? sanitizeInput(formData.sub_description) : undefined,
            phone_number: formData.phone_number.replace(/\D/g, ''),
            category: formData.category,
            city: formData.city,
            location: formData.location ? sanitizeInput(formData.location) : undefined,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + formData.duration_days * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
            views_count: 0,
            calls_count: 0,
            is_featured: formData.is_featured,
            approval_status: 'pending', // All new ads go to pending
        };

        // Save to local storage first (always works)
        const localAds = getLocalAds();
        localAds.unshift(newAd);
        saveLocalAds(localAds);

        // Save to Supabase (required for admin to see the ad)
        try {
            const { error: insertError } = await supabase.from('ads').insert({
                id: newAd.id,
                user_id: newAd.user_id,
                title: newAd.title,
                subject: newAd.subject,
                description: newAd.description,
                sub_description: newAd.sub_description || null,
                phone_number: newAd.phone_number,
                category: newAd.category,
                city: newAd.city,
                location: newAd.location || null,
                created_at: newAd.created_at,
                expires_at: newAd.expires_at,
                is_active: newAd.is_active,
                views_count: newAd.views_count,
                calls_count: newAd.calls_count,
                is_featured: newAd.is_featured || false,
                approval_status: 'pending',
            });

            if (insertError) {
                console.error('Supabase insert error:', insertError);
                // Still return success since we saved locally
            } else {
                console.log('Ad saved to Supabase successfully');
            }
        } catch (e) {
            console.error('Supabase insert exception:', e);
        }

        setAds(prev => [newAd, ...prev]);
        return { ad: newAd };
    }, []);

    const updateAd = useCallback(async (id: string, formData: Partial<AdFormData>, userId: string): Promise<{ ad?: Ad; error?: string }> => {
        const existingAd = ads.find(ad => ad.id === id);
        if (!existingAd) return { error: 'Ad not found' };
        if (existingAd.user_id !== userId) return { error: 'You can only edit your own ads' };

        const updates: Partial<Ad> = {};
        if (formData.title) updates.title = sanitizeInput(formData.title);
        if (formData.subject) updates.subject = sanitizeInput(formData.subject);
        if (formData.description) updates.description = sanitizeInput(formData.description);
        if (formData.location) updates.location = sanitizeInput(formData.location);
        if (formData.phone_number) updates.phone_number = formData.phone_number.replace(/\D/g, '');
        if (formData.category) updates.category = formData.category;
        if (formData.city) updates.city = formData.city;
        if (formData.is_featured !== undefined) updates.is_featured = formData.is_featured;

        const updatedAd = { ...existingAd, ...updates };

        // Update local storage
        const localAds = getLocalAds();
        const localIndex = localAds.findIndex(a => a.id === id);
        if (localIndex >= 0) {
            localAds[localIndex] = updatedAd;
            saveLocalAds(localAds);
        }

        // Try Supabase update
        try {
            await supabase.from('ads').update(updates).eq('id', id);
        } catch (e) {
            console.log('Supabase update skipped:', e);
        }

        setAds(prev => prev.map(ad => ad.id === id ? updatedAd : ad));
        return { ad: updatedAd };
    }, [ads]);

    const deleteAd = useCallback(async (id: string, userId: string): Promise<{ success: boolean; error?: string }> => {
        const existingAd = ads.find(ad => ad.id === id);
        if (!existingAd) return { success: false, error: 'Ad not found' };
        if (existingAd.user_id !== userId) return { success: false, error: 'You can only delete your own ads' };

        // Remove from local storage
        const localAds = getLocalAds().filter(a => a.id !== id);
        saveLocalAds(localAds);

        // Try Supabase delete
        try {
            await supabase.from('ads').delete().eq('id', id);
        } catch (e) {
            console.log('Supabase delete skipped:', e);
        }

        setAds(prev => prev.filter(ad => ad.id !== id));
        return { success: true };
    }, [ads]);

    const incrementViews = useCallback(async (id: string) => {
        // Optimistic UI update
        setAds(prev => prev.map(ad => ad.id === id ? { ...ad, views_count: ad.views_count + 1 } : ad));

        // Update local storage
        const localAds = getLocalAds();
        const localAd = localAds.find(a => a.id === id);
        if (localAd) {
            localAd.views_count++;
            saveLocalAds(localAds);
        }

        // Try Supabase RPC (atomic increment) first, fall back to direct update
        try {
            const { error: rpcError } = await supabase.rpc('increment_view_count', { ad_id: id });

            if (rpcError) {
                console.log('RPC failed, trying direct update:', rpcError.message);
                // Fallback to direct update
                await supabase.from('ads').update({ views_count: (localAd?.views_count || 1) }).eq('id', id);
            }
            console.log('View count incremented for ad:', id);
        } catch (e) {
            console.error('Supabase views update exception:', e);
        }
    }, []);

    const incrementCalls = useCallback(async (id: string) => {
        // Optimistic UI update
        setAds(prev => prev.map(ad => ad.id === id ? { ...ad, calls_count: ad.calls_count + 1 } : ad));

        // Update local storage
        const localAds = getLocalAds();
        const localAd = localAds.find(a => a.id === id);
        if (localAd) {
            localAd.calls_count++;
            saveLocalAds(localAds);
        }

        // Try Supabase RPC (atomic increment) first
        try {
            const { error: rpcError } = await supabase.rpc('increment_call_count', { ad_id: id });

            if (rpcError) {
                console.log('RPC failed, trying direct update:', rpcError);
                await supabase.from('ads').update({ calls_count: (localAd?.calls_count || 1) }).eq('id', id);
            }
            console.log('Call count incremented for ad:', id);
        } catch (e) {
            console.error('Supabase calls update exception:', e);
        }
    }, []);

    const renewAd = useCallback(async (id: string, days: number): Promise<boolean> => {
        const newExpiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

        // Update local storage
        const localAds = getLocalAds();
        const ad = localAds.find(a => a.id === id);
        if (ad) {
            ad.expires_at = newExpiry;
            ad.is_active = true;
            saveLocalAds(localAds);
        }

        // Try Supabase
        try {
            await supabase.from('ads').update({ expires_at: newExpiry, is_active: true }).eq('id', id);
        } catch (e) {
            console.log('Supabase renew skipped:', e);
        }

        setAds(prev => prev.map(ad => ad.id === id ? { ...ad, expires_at: newExpiry, is_active: true } : ad));
        return true;
    }, []);

    return (
        <AdsContext.Provider value={{
            ads, loading, filter, setFilter, getFilteredAds, getFeaturedAds, getUserAds,
            getAdById, getCategoryCount, addAd, updateAd, deleteAd, incrementViews, incrementCalls, renewAd, refreshAds,
        }}>
            {children}
        </AdsContext.Provider>
    );
}

export function useAds(): AdsContextType {
    const context = useContext(AdsContext);
    if (!context) throw new Error('useAds must be used within AdsProvider');
    return context;
}
