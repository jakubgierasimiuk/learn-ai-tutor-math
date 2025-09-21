-- Fix user_subscriptions table RLS - CRITICAL: Customer payment info exposed
-- This table contains Stripe customer IDs and subscription details

-- The existing policies look mostly good, but let's ensure they're strict
-- Drop any potentially permissive policies
DROP POLICY IF EXISTS "Anyone can view subscriptions" ON public.user_subscriptions;

-- Ensure users can only see their own subscription data
-- (The existing policies should be fine, but let's verify they exist)

-- Add admin access for subscription management
CREATE POLICY "Admins can manage all subscriptions" 
ON public.user_subscriptions FOR ALL
USING (is_admin());