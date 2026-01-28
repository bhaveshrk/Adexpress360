-- Additional SQL for Admin Features
-- Run this AFTER the main schema.sql

-- Add is_admin column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add approval_status column to ads
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' 
  CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Add approved_by column to ads
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id);

-- Add approved_at column to ads
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Add rejection_reason column to ads
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create index for approval_status
CREATE INDEX IF NOT EXISTS idx_ads_approval_status ON public.ads(approval_status);

-- Update RLS policies for admin access

-- Drop existing ads policies
DROP POLICY IF EXISTS "Active ads are viewable by everyone" ON public.ads;
DROP POLICY IF EXISTS "Authenticated users can insert ads" ON public.ads;
DROP POLICY IF EXISTS "Users can update own ads" ON public.ads;
DROP POLICY IF EXISTS "Users can delete own ads" ON public.ads;

-- New ads policies with admin support

-- Everyone can view approved and active ads, users can see their own pending ads
CREATE POLICY "View approved ads or own ads" ON public.ads
  FOR SELECT USING (
    (is_active = true AND approval_status = 'approved') OR 
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Users can insert ads (they go to pending)
CREATE POLICY "Users can insert ads" ON public.ads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update own ads, admins can update any ad
CREATE POLICY "Users update own ads, admins update any" ON public.ads
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Users can delete own ads, admins can delete any ad
CREATE POLICY "Users delete own ads, admins delete any" ON public.ads
  FOR DELETE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin can insert ads for any user
CREATE POLICY "Admins can insert for others" ON public.ads
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Function to approve an ad
CREATE OR REPLACE FUNCTION approve_ad(ad_id UUID, admin_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.ads 
  SET approval_status = 'approved', 
      approved_by = admin_id, 
      approved_at = NOW(),
      rejection_reason = NULL
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject an ad
CREATE OR REPLACE FUNCTION reject_ad(ad_id UUID, admin_id UUID, reason TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.ads 
  SET approval_status = 'rejected', 
      approved_by = admin_id, 
      approved_at = NOW(),
      rejection_reason = reason
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the first admin account (update the phone number to your admin phone)
-- INSERT INTO public.profiles (id, phone_number, display_name, is_admin, email)
-- VALUES (
--   'your-auth-user-id-here',
--   'ADMIN_PHONE_NUMBER',
--   'Admin',
--   true,
--   'admin@findads.com'
-- );
