import { supabase } from './supabase';

export const incrementAdStats = async (adId: string, type: 'view' | 'call') => {
    try {
        const { error } = await supabase.rpc('increment_ad_stats', {
            p_ad_id: adId,
            p_type: type,
        });

        if (error) {
            console.error('Error incrementing stats:', error);
        }
    } catch (err) {
        console.error('Exception incrementing stats:', err);
    }
};

export const getAdStatsHistory = async (adId: string) => {
    const { data, error } = await supabase
        .from('ad_daily_stats')
        .select('*')
        .eq('ad_id', adId)
        .order('date', { ascending: true })
        .limit(30); // Last 30 entries (days)

    if (error) {
        console.error('Error fetching stats history:', error);
        return [];
    }
    return data;
}
