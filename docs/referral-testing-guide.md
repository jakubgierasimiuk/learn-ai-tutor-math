# Referral System Testing Guide

## Overview
This guide covers comprehensive testing scenarios for the Mentavo AI referral system.

## Prerequisites
- Admin access to the Admin Panel → Referrals tab
- Test user accounts
- Access to browser DevTools for debugging

---

## Scenario 1: Happy Path (Complete Flow)

### Objective
Test the standard referral flow from invitation to conversion with all steps completed.

### Steps

1. **User A creates referral code**
   - Log in as User A
   - Navigate to `/referral`
   - Click "Generuj kod" if not already generated
   - Copy the referral link (e.g., `https://mentavo.pl?ref=ABC12345`)
   - ✅ **Expected**: Referral code appears and can be copied

2. **User B clicks the referral link**
   - Open the link in incognito/private window
   - ✅ **Expected**: Check localStorage - key `mentavo_referral_code` should contain `ABC12345`
   - ✅ **Check DevTools Console**: Should see `[Referral] 💾 Saved referral code to localStorage`

3. **User B registers**
   - Complete registration on the auth page
   - ✅ **Expected**: 
     - User B receives 7 days trial + 4000 tokens
     - Check Admin Panel → Referrals: New entry with `stage: 'invited'`
     - Check `referrals` table: `referrer_id = User A ID`, `referred_user_id = User B ID`
     - Check `rewards` table: User B should have reward with `source: 'referral_signup'`

4. **User B completes activation (phone + 20 min learning)**
   - Verify phone number
   - Complete at least 20 minutes of learning sessions
   - Call `checkActivation()` (should happen automatically via hook)
   - ✅ **Expected**:
     - Referral `stage` changes to `'activated'`
     - User A receives convertible reward (3 days OR 4000 tokens)
     - Check `rewards` table: User A has `kind: 'convertible'`, `source: 'referral_activation'`
     - Check `referral_events`: Event `referral_activated` logged

5. **User B purchases subscription**
   - Navigate to subscription/checkout page
   - Complete Stripe checkout successfully
   - User is redirected to `/subscription-success?session_id=...`
   - ✅ **Expected**:
     - `completeConversion()` is called automatically
     - Referral `stage` changes to `'converted'`
     - User A receives 30 days Premium
     - Check `rewards` table: User A has `kind: 'days'`, `amount: 30`, `source: 'referral_conversion'`
     - Check `referral_events`: Event `referral_converted` logged
     - Check `user_referral_stats`: `successful_referrals = 1`

---

## Scenario 2: Quick Purchase (No Activation)

### Objective
Test what happens when a user purchases immediately without completing activation criteria.

### Steps

1. **User A creates referral code**
   - Same as Scenario 1 Step 1

2. **User C clicks link and registers**
   - Same as Scenario 1 Steps 2-3
   - ✅ **Check**: `stage = 'invited'`

3. **User C purchases subscription IMMEDIATELY (Day 1)**
   - Navigate to checkout
   - Complete purchase
   - Redirect to `/subscription-success`
   - ✅ **Expected**:
     - System detects `stage = 'invited'` during `completeConversion()`
     - **Auto-activation occurs** with `risk_score = 30`
     - User A receives BOTH:
       - Convertible reward (3 days OR 4000 tokens) for auto-activation
       - 30 days Premium for conversion
     - Check `referral_events`: Event `auto_activated` logged
     - Final `stage = 'converted'`

---

## Scenario 3: Ladder Rewards (Milestones)

### Objective
Test the tiered reward system at 2, 5, and 10 successful conversions.

### Steps

1. **Setup: User A already has 0 conversions**
   - Check Admin Panel → Referrals tab
   - Verify `successful_referrals = 0` in `user_referral_stats`

2. **First conversion (User D purchases)**
   - Complete full flow (Scenario 1 or 2)
   - ✅ **Expected**:
     - User A gets 30 days (standard conversion reward)
     - `successful_referrals = 1`
     - No milestone bonus yet

3. **Second conversion (User E purchases) - MILESTONE 2**
   - Complete another referral flow
   - ✅ **Expected**:
     - User A gets 30 days (standard conversion reward)
     - **BONUS**: +30 days milestone reward
     - Total: 60 days from 2nd conversion
     - Check `rewards` table: New entry with `source: 'referral_milestone'`, `amount: 30`, `meta.milestone: 2`
     - Check `user_referral_stats`: `milestone_rewards_claimed = [2]`
     - `successful_referrals = 2`

4. **Fifth conversion (Users F, G, H purchase) - MILESTONE 5**
   - Complete 3 more referral flows
   - ✅ **Expected**:
     - User A gets 30 days × 3 = 90 days (standard rewards)
     - On 5th conversion: **BONUS**: +60 days milestone reward
     - Check `rewards` table: Entry with `source: 'referral_milestone'`, `amount: 60`, `meta.milestone: 5`
     - Check `user_referral_stats`: `milestone_rewards_claimed = [2, 5]`
     - `successful_referrals = 5`

5. **Tenth conversion (5 more users) - MILESTONE 10**
   - Complete 5 more referral flows
   - ✅ **Expected**:
     - User A gets 30 days × 5 = 150 days (standard rewards)
     - On 10th conversion: **BONUS**: +150 days milestone reward
     - Check `rewards` table: Entry with `source: 'referral_milestone'`, `amount: 150`, `meta.milestone: 10`
     - Check `user_referral_stats`: `milestone_rewards_claimed = [2, 5, 10]`
     - `successful_referrals = 10`
     - `current_tier = 'ambassador'`

6. **After 10: Points system**
   - Complete 11th conversion
   - ✅ **Expected**:
     - User A gets 30 days (standard reward)
     - `total_points = 1`, `available_points = 1`
     - Each conversion beyond 10 adds 1 point

---

## Scenario 4: Duplicate Prevention

### Objective
Ensure users can't game the system by triggering conversions multiple times.

### Steps

1. **User B already converted**
   - Check: `stage = 'converted'` in `referrals` table

2. **Try to call completeConversion() again**
   - Manually invoke via hook or API
   - ✅ **Expected**:
     - Function returns early with `message: 'Referral already converted'`
     - No duplicate rewards created
     - Check logs: `[CONVERSION] ℹ️ Already converted, skipping`

---

## Scenario 5: Edge Case - No Referral

### Objective
Test what happens when a user purchases without being referred.

### Steps

1. **User Z registers directly (no referral link)**
   - Navigate to `/auth` and register
   - No `ref=` parameter in URL
   - ✅ **Expected**: No referral record created

2. **User Z purchases subscription**
   - Complete checkout
   - Redirect to `/subscription-success`
   - ✅ **Expected**:
     - `completeConversion()` is called but finds no referral
     - Error caught gracefully: "User was not referred - this is okay"
     - No error shown to user
     - Success page displays normally

---

## Admin Tools for Testing

### Admin Panel → Referrals Tab

1. **View all referrals**
   - Table shows: Referrer email, Referred email, Code, Stage, Risk score, Date
   - Filter by email

2. **Force Actions**
   - Click "Szczegóły" on any referral
   - Use "Force Activate" or "Force Convert" buttons for testing
   - View event timeline

3. **Verify Rewards**
   - Check rewards history for each user
   - Verify amounts and sources match expected values

---

## Common Issues & Debugging

### Issue: Conversion not triggering after purchase

**Check**:
1. Edge function logs: `/supabase/functions/process-referral-v2`
2. Look for: `[CONVERSION] 🎯 Starting complete_conversion action`
3. Verify `/subscription-success` page is being reached after Stripe checkout

**Fix**:
- Ensure `success_url` in `create-checkout` contains `{CHECKOUT_SESSION_ID}`
- Check network tab for failed API calls

### Issue: Referrer not receiving reward

**Check**:
1. `rewards` table: Does entry exist for `referrer_id`?
2. `referral_events`: Is `referral_converted` event logged?
3. Edge function logs: Look for `[CONVERSION] 🎁 Granting conversion reward`

**Fix**:
- Verify `update_referral_stats_v2` DB function executed
- Check if `award_ladder_bonus()` trigger fired

### Issue: Milestone bonus not awarded

**Check**:
1. `user_referral_stats`: Verify `successful_referrals` count
2. `milestone_rewards_claimed`: Check if milestone already claimed
3. Postgres logs: Look for `NOTICE: Milestone X reached for user Y`

**Fix**:
- Manually trigger: `SELECT award_ladder_bonus()` for the user
- Verify trigger `award_ladder_bonuses_trigger` is active

---

## Test Data Cleanup

After testing, clean up test data:

```sql
-- Remove test referrals
DELETE FROM referrals WHERE referral_code LIKE 'TEST%';

-- Remove test rewards
DELETE FROM rewards WHERE user_id IN (SELECT user_id FROM profiles WHERE email LIKE '%test%');

-- Reset referral stats for test users
DELETE FROM user_referral_stats WHERE user_id IN (SELECT user_id FROM profiles WHERE email LIKE '%test%');
```

---

## Success Criteria

All scenarios pass if:
- ✅ Referrals are created with correct stages
- ✅ Rewards are granted to correct users with correct amounts
- ✅ Milestone bonuses trigger at 2, 5, 10 conversions
- ✅ No duplicate rewards are created
- ✅ Auto-activation works for quick purchases
- ✅ System handles users without referrals gracefully
- ✅ All events are logged correctly

## Next Steps

If all tests pass:
1. Enable referral system in production
2. Monitor logs for first week
3. Set up alerts for failed conversions
4. Create user-facing docs explaining reward structure