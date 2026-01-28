-- ===============================================
-- COMPLETE SUPABASE SETUP FOR FINDADS
-- Run this entire file in Supabase SQL Editor
-- ===============================================

-- ===== 1. USER ACCOUNTS TABLE (Phone + Password Auth) =====
CREATE TABLE IF NOT EXISTS public.user_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(10) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name VARCHAR(100),
    email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read of user_accounts" ON public.user_accounts;
DROP POLICY IF EXISTS "Allow public insert to user_accounts" ON public.user_accounts;

-- Create policies: Anyone can read and insert (for signup/login)
CREATE POLICY "Allow public read of user_accounts"
    ON public.user_accounts FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert to user_accounts"
    ON public.user_accounts FOR INSERT
    WITH CHECK (true);

-- ===== 2. ADS TABLE =====
CREATE TABLE IF NOT EXISTS public.ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title VARCHAR(100) NOT NULL,
    subject VARCHAR(150),
    description TEXT NOT NULL,
    sub_description TEXT,
    phone_number VARCHAR(10) NOT NULL,
    category VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    views_count INTEGER DEFAULT 0,
    calls_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    approval_status VARCHAR(20) DEFAULT 'pending',
    rejection_reason TEXT
);

-- Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public read of ads" ON public.ads;
DROP POLICY IF EXISTS "Allow anyone to read approved ads" ON public.ads;
DROP POLICY IF EXISTS "Allow public insert of ads" ON public.ads;
DROP POLICY IF EXISTS "Allow anyone to insert ads" ON public.ads;
DROP POLICY IF EXISTS "Allow anyone to update ads" ON public.ads;
DROP POLICY IF EXISTS "Allow admin to update ads" ON public.ads;
DROP POLICY IF EXISTS "Allow anyone to delete ads" ON public.ads;
DROP POLICY IF EXISTS "Allow admin to delete ads" ON public.ads;

-- Create new policies for ads
-- ANYONE can read ads (for homepage display)
CREATE POLICY "Allow anyone to read ads"
    ON public.ads FOR SELECT
    USING (true);

-- ANYONE can insert ads (users post ads without Supabase auth)
CREATE POLICY "Allow anyone to insert ads"
    ON public.ads FOR INSERT
    WITH CHECK (true);

-- ANYONE can update ads (for admin approval, view counts, etc)
CREATE POLICY "Allow anyone to update ads"
    ON public.ads FOR UPDATE
    USING (true);

-- ANYONE can delete ads (for admin deletion)
CREATE POLICY "Allow anyone to delete ads"
    ON public.ads FOR DELETE
    USING (true);

-- ===== 3. PROFILES TABLE (Admin Users) =====
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    phone_number VARCHAR(15),
    email TEXT,
    display_name TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Admin profile policies
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ===== 4. INDEXES FOR PERFORMANCE =====
CREATE INDEX IF NOT EXISTS idx_ads_user_id ON public.ads(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_category ON public.ads(category);
CREATE INDEX IF NOT EXISTS idx_ads_city ON public.ads(city);
CREATE INDEX IF NOT EXISTS idx_ads_approval_status ON public.ads(approval_status);
CREATE INDEX IF NOT EXISTS idx_ads_is_active ON public.ads(is_active);
CREATE INDEX IF NOT EXISTS idx_ads_is_featured ON public.ads(is_featured);
CREATE INDEX IF NOT EXISTS idx_user_accounts_phone ON public.user_accounts(phone_number);

-- ===== 5. VERIFY SETUP =====
SELECT 'Setup complete! Tables created:' AS status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
    AND tablename IN ('user_accounts', 'ads', 'profiles');
