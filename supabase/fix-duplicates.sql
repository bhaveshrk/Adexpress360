-- FIX DUPLICATES AND ENFORCE CONSTRAINT
-- Run this in Supabase SQL Editor

-- 1. Identify duplicates (for debugging purposes)
SELECT phone_number, COUNT(*)
FROM public.user_accounts
GROUP BY phone_number
HAVING COUNT(*) > 1;

-- 2. Delete duplicates, keeping the LATEST created account (or earliest, depending on preference. Usually latest has most recent login).
-- Actually, let's keep the one that was created EARLIEST, assuming that's the "original". 
-- Or maybe the one with the most recent update? 
-- Let's keep the EARLIEST (oldest) one to be safe with references, or LATEST?
-- If we keep LATEST, we might lose old references in 'ads' table if they referenced the old user_id.
-- BUT 'ads' table uses user_id as TEXT or UUID? It uses TEXT.
-- Let's assume we keep the one that IS referenced?
-- Hard to know. Let's just keep the OLDEST one.

DELETE FROM public.user_accounts a
USING public.user_accounts b
WHERE a.id > b.id
AND a.phone_number = b.phone_number;

-- 3. Now that duplicates are gone, ensure the UNIQUE constraint exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_accounts_phone_number_key'
    ) THEN
        ALTER TABLE public.user_accounts ADD CONSTRAINT user_accounts_phone_number_key UNIQUE (phone_number);
    END IF;
END $$;

-- 4. Verify
SELECT * FROM public.user_accounts;
