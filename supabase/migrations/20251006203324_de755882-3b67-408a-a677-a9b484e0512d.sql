-- Remove legacy trigger that called v1 stats function (which referenced non-existent referrals.status)
DROP TRIGGER IF EXISTS referral_status_change ON public.referrals;

-- Keep the v2 trigger which updates stats only on stage changes (already present):
-- trigger_update_referral_stats_v2 AFTER UPDATE ON referrals

-- Optional: leave old function in place to avoid breaking dependencies, but it will no longer be invoked.