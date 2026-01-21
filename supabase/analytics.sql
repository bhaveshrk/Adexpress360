-- ===============================================
-- PHASE 3: USER ANALYTICS SETUP
-- Run this in Supabase SQL Editor
-- ===============================================

-- 1. Create table for daily aggregated stats
CREATE TABLE IF NOT EXISTS public.ad_daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    views_count INTEGER DEFAULT 0,
    calls_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Ensure one row per ad per day
    UNIQUE(ad_id, date)
);

-- Enable RLS
ALTER TABLE public.ad_daily_stats ENABLE ROW LEVEL SECURITY;

-- Policies for ad_daily_stats
-- Only the owner of the ad should be able to VIEW their detailed stats
CREATE POLICY "Ad owners can view their daily stats"
    ON public.ad_daily_stats FOR SELECT
    USING (
        auth.uid()::text = (SELECT user_id FROM public.ads WHERE id = ad_daily_stats.ad_id)
    );

-- Anyone can INSERT/UPDATE via the secure function (so we don't strictly need public insert policies if only using RPC, 
-- but for safety to prevent manual tampering, we'll rely on the Security Definer function below)

-- 2. Create optimized RPC function to increment stats
-- This function updates BOTH the main 'ads' table totals AND the 'ad_daily_stats' daily counters.
-- It runs with SECURITY DEFINER to bypass RLS, allowing anonymous users to increment view counts.

CREATE OR REPLACE FUNCTION increment_ad_stats(p_ad_id UUID, p_type TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Update the TOTAL counts in the main ads table
    IF p_type = 'view' THEN
        UPDATE public.ads 
        SET views_count = COALESCE(views_count, 0) + 1 
        WHERE id = p_ad_id;
    ELSIF p_type = 'call' THEN
        UPDATE public.ads 
        SET calls_count = COALESCE(calls_count, 0) + 1 
        WHERE id = p_ad_id;
    END IF;

    -- 2. Upsert into daily stats (Bucket by today's date)
    INSERT INTO public.ad_daily_stats (ad_id, date, views_count, calls_count)
    VALUES (
        p_ad_id, 
        CURRENT_DATE, 
        CASE WHEN p_type = 'view' THEN 1 ELSE 0 END, 
        CASE WHEN p_type = 'call' THEN 1 ELSE 0 END
    )
    ON CONFLICT (ad_id, date)
    DO UPDATE SET
        views_count = ad_daily_stats.views_count + CASE WHEN p_type = 'view' THEN 1 ELSE 0 END,
        calls_count = ad_daily_stats.calls_count + CASE WHEN p_type = 'call' THEN 1 ELSE 0 END,
        updated_at = NOW();

END;
$$;
