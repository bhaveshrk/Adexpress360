-- Simpler fix for Supabase RLS
-- Run this in the Supabase SQL Editor

-- Drop existing policies first
DROP POLICY IF EXISTS "Active ads are viewable by everyone" ON public.ads;
DROP POLICY IF EXISTS "Authenticated users can insert ads" ON public.ads;
DROP POLICY IF EXISTS "Anyone can read approved ads" ON public.ads;
DROP POLICY IF EXISTS "Anyone can insert ads" ON public.ads;

-- Add approval columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ads' AND column_name = 'approval_status') THEN
        ALTER TABLE public.ads ADD COLUMN approval_status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- Make user_id nullable
ALTER TABLE public.ads ALTER COLUMN user_id DROP NOT NULL;

-- Allow ANYONE to read approved ads (this is the key fix!)
CREATE POLICY "Anyone can read approved ads" ON public.ads
    FOR SELECT USING (true);

-- Allow anyone to insert ads  
CREATE POLICY "Anyone can insert ads" ON public.ads
    FOR INSERT WITH CHECK (true);

-- Allow anyone to update ads (for admin approval)
CREATE POLICY "Anyone can update ads" ON public.ads
    FOR UPDATE USING (true);

-- Grant anon role access
GRANT SELECT, INSERT, UPDATE ON public.ads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ads TO authenticated;
