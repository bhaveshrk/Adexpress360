-- COMPLETE FIX - Run this in Supabase SQL Editor

-- First, let's see all policies on ads table and drop them programmatically
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'ads'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.ads', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Now drop the foreign key constraint
ALTER TABLE public.ads DROP CONSTRAINT IF EXISTS ads_user_id_fkey;

-- Change user_id to TEXT type  
ALTER TABLE public.ads ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Make user_id nullable
ALTER TABLE public.ads ALTER COLUMN user_id DROP NOT NULL;

-- Recreate simple open policies
CREATE POLICY "Anyone can read ads" ON public.ads
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert ads" ON public.ads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update ads" ON public.ads
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete ads" ON public.ads
    FOR DELETE USING (true);

-- Grant permissions
GRANT ALL ON public.ads TO anon;
GRANT ALL ON public.ads TO authenticated;

-- Verify
SELECT 'Done! All policies dropped and recreated.' as status;
