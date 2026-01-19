-- ===============================================
-- ATOMIC INCREMENT FUNCTIONS (VIEW & CALL COUNTS)
-- Run this in Supabase SQL Editor
-- ===============================================

-- 1. Increment View Count
CREATE OR REPLACE FUNCTION public.increment_view_count(ad_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Allows anon users to update without explicit table permissions
AS $$
BEGIN
  UPDATE public.ads
  SET views_count = views_count + 1
  WHERE id = ad_id;
END;
$$;

-- 2. Increment Call Count
CREATE OR REPLACE FUNCTION public.increment_call_count(ad_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.ads
  SET calls_count = calls_count + 1
  WHERE id = ad_id;
END;
$$;

-- 3. Grant Permissions
GRANT EXECUTE ON FUNCTION public.increment_view_count(UUID) TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_call_count(UUID) TO postgres, anon, authenticated, service_role;

-- 4. Verify
SELECT 'Functions created successfully' as status;
