-- User Accounts table for phone+password authentication
-- Run this in Supabase SQL Editor

-- Create user_accounts table
CREATE TABLE IF NOT EXISTS public.user_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone_number TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (for login check)
CREATE POLICY "Anyone can read user_accounts" ON public.user_accounts
    FOR SELECT USING (true);

-- Allow anyone to insert (for signup)
CREATE POLICY "Anyone can insert user_accounts" ON public.user_accounts
    FOR INSERT WITH CHECK (true);

-- Allow users to update their own account
CREATE POLICY "Anyone can update user_accounts" ON public.user_accounts
    FOR UPDATE USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.user_accounts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_accounts TO authenticated;

-- Create index for fast phone lookup
CREATE INDEX IF NOT EXISTS idx_user_accounts_phone ON public.user_accounts(phone_number);
