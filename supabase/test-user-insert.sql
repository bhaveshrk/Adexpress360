-- Test insert for user_accounts table
-- Run this in Supabase SQL Editor to verify the table works

-- Test insert
INSERT INTO public.user_accounts (phone_number, password_hash, display_name) 
VALUES ('9999999999', 'test_hash_123', 'Test User');

-- Check if it was inserted
SELECT * FROM public.user_accounts;

-- If you see the test user, the table works!
-- Delete the test user after
-- DELETE FROM public.user_accounts WHERE phone_number = '9999999999';
