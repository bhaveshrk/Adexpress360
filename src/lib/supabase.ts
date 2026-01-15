import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hfcneioyzodknrgofipe.supabase.co';
const supabaseAnonKey = 'sb_publishable_WCYKrEJenQOKjHmxhPywmw_m-9qyU7d';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbUser {
    id: string;
    phone_number: string;
    email?: string;
    display_name?: string;
    created_at: string;
    updated_at: string;
}

export interface DbAd {
    id: string;
    user_id: string;
    title: string;
    subject: string;
    description: string;
    sub_description?: string;
    phone_number: string;
    category: string;
    city: string;
    location?: string;
    created_at: string;
    expires_at: string;
    is_active: boolean;
    views_count: number;
    calls_count: number;
    is_featured: boolean;
}
