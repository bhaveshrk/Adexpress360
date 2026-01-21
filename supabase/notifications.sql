-- ===============================================
-- PHASE 4: NOTIFICATIONS & ALERTS
-- Run this in Supabase SQL Editor
-- ===============================================

-- 1. Create saved_searches table
CREATE TABLE IF NOT EXISTS public.saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- e.g. "iPhone in Mumbai"
    filter_criteria JSONB NOT NULL, -- { category: 'electronics', city: 'Mumbai', query: 'iPhone' }
    last_checked_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own saved searches"
    ON public.saved_searches
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. Index for performance
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON public.saved_searches(user_id);
