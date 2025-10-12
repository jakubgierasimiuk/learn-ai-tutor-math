# Referral Rewards System - Complete Explanation

## Overview

The Mentavo AI referral system is designed to reward users who bring new paying customers to the platform. The system has multiple reward tiers and stages to ensure quality referrals and prevent abuse.

---

## Reward Stages

### Stage 1: Registration (Invited)
**When**: Your friend clicks your referral link and registers

**Rewards**:
- **Your friend gets**: 7 days free trial + 4000 AI tokens
- **You get**: Nothing yet (but you're one step closer!)

**Database state**: `referrals.stage = 'invited'`

---

### Stage 2: Activation (Activated)
**When**: Your friend:
- Verifies their phone number (SMS)
- Completes at least 20 minutes of learning

**Rewards**:
- **Your friend**: Keeps their 7-day trial
- **You get**: **Convertible reward** - choose one:
  - 3 days Premium extension
  - OR 4000 AI tokens

**Database state**: `referrals.stage = 'activated'`

**Note**: This reward is "convertible" meaning you choose what you prefer when claiming it.

---

### Stage 3: Conversion (Converted)
**When**: Your friend purchases a paid subscription

**Rewards**:
- **You get**: **30 days Premium** (full month!)

**Database state**: `referrals.stage = 'converted'`

**Important**: This reward is given **regardless** of when your friend purchases:
- They can buy immediately on Day 1 → You still get 30 days
- They can buy after the 7-day trial → You still get 30 days
- They can buy 2 months later → You still get 30 days

---

## Ladder Bonuses (Milestones)

On top of the standard 30 days per conversion, you get **massive bonuses** when you reach certain milestones:

### 🎯 Milestone 1: 2 Conversions
- **Bonus**: +30 days
- **Total earned**: 60 days (30 + 30)
- **Unlocked**: "Advocate" tier

### 🎯 Milestone 2: 5 Conversions
- **Bonus**: +60 days (2 months!)
- **Total earned**: 210 days (150 + 60)
- **Unlocked**: "Promoter" tier

### 🎯 Milestone 3: 10 Conversions
- **Bonus**: +150 days (5 months!)
- **Total earned**: 510 days (300 + 60 + 150 = 17 months!)
- **Unlocked**: "Ambassador" tier + Points system

### 🔥 Beyond 10: Points System
- **Each conversion** after 10th: +1 point
- **Points can be exchanged** for:
  - More Premium days
  - AI tokens
  - Gift cards (Spotify, Netflix, Steam, Amazon...)

---

## Complete Example: Journey to 10 Conversions

Let's say you refer 10 friends who all purchase subscriptions:

| # | Event | Reward | Running Total |
|---|-------|--------|---------------|
| 1 | Friend 1 converts | 30 days | 30 days |
| 2 | Friend 2 converts | 30 days **+ 30 days milestone** | 90 days |
| 3 | Friend 3 converts | 30 days | 120 days |
| 4 | Friend 4 converts | 30 days | 150 days |
| 5 | Friend 5 converts | 30 days **+ 60 days milestone** | 240 days |
| 6 | Friend 6 converts | 30 days | 270 days |
| 7 | Friend 7 converts | 30 days | 300 days |
| 8 | Friend 8 converts | 30 days | 330 days |
| 9 | Friend 9 converts | 30 days | 360 days |
| 10 | Friend 10 converts | 30 days **+ 150 days milestone** | 540 days |

**Total**: 540 days = **18 months of Premium for free!** 🎉

---

## Special Cases

### Case 1: Friend buys immediately (no trial)

**Scenario**: Your friend registers and purchases on the same day without waiting for the trial period.

**What happens**:
1. Friend registers → `stage: 'invited'`
2. Friend purchases → System detects `stage = 'invited'`
3. **Auto-activation occurs**:
   - Friend is auto-activated with `risk_score = 30` (lower due to no verification)
   - You receive activation reward (convertible 3 days/4000 tokens)
4. **Conversion completes normally**:
   - You receive conversion reward (30 days Premium)

**Result**: You get BOTH rewards (activation + conversion) even though friend skipped the trial!

---

### Case 2: Friend never activates

**Scenario**: Your friend registers but never verifies phone or completes 20 min of learning, then purchases.

**What happens**:
- Same as Case 1 - auto-activation occurs
- You still get full rewards

**Why**: We want to reward you for bringing a paying customer, regardless of their activation method.

---

### Case 3: Friend activates but never purchases

**Scenario**: Friend completes verification + learning but never buys subscription.

**What happens**:
- You receive activation reward (convertible 3 days/4000 tokens)
- You do NOT receive conversion reward (30 days)
- Referral stays at `stage: 'activated'`

**Result**: You get the small activation reward, but the big conversion reward requires actual purchase.

---

## Reward Claiming

### Automatic Rewards (Released immediately)
- **Conversion rewards (30 days)**: Added automatically to your subscription
- **Milestone bonuses**: Added automatically when milestone reached
- **Activation rewards**: Released if `risk_score >= 85`

### Convertible Rewards
- **When**: Activation reward with `risk_score 70-84`
- **How to claim**: Go to `/referral` → "Available Rewards" section → Choose days or tokens

### Pending Rewards (Manual review)
- **When**: Activation reward with `risk_score < 70`
- **How to claim**: Requires admin approval (fraud prevention)

---

## Security & Fraud Prevention

### Risk Scoring System

Each referral gets a risk score (0-100) to detect potential fraud:

**High Trust (85-100)**: Instant rewards
- Phone verified (not VoIP)
- Unique device and IP
- 20+ minutes real learning

**Medium Trust (70-84)**: Rewards after 48-72h
- Phone verified
- Some potential red flags

**Low Trust (0-69)**: Manual review
- VoIP number
- Duplicate device/IP
- Suspicious patterns

### Fraud Signals Tracked
- IP address (VPN detection)
- Device fingerprint (duplicate detection)
- Phone number (VoIP/burner detection)
- Learning patterns (pseudo-activity detection)

---

## Technical Implementation

### Database Tables
- `referrals`: Core referral records with stages
- `rewards`: All rewards (days, tokens, convertible, points)
- `user_referral_stats`: Aggregated stats and tier tracking
- `referral_events`: Audit log of all referral actions
- `fraud_signals`: Security signals for risk scoring

### Edge Functions
- `create-referral-code`: Generates unique referral codes
- `process-referral-v2`: Handles register/activate/convert actions
- `consume-convertible-reward`: Allows users to choose days vs tokens

### Triggers
- `trigger_update_referral_stats_v2`: Updates stats on referral stage change
- `award_ladder_bonuses_trigger`: Grants milestone bonuses automatically

---

## FAQ

**Q: Can I refer myself?**
A: No, the system prevents self-referrals.

**Q: What if my friend cancels their subscription?**
A: You keep the rewards you've earned. Cancellation doesn't retroactively remove rewards.

**Q: How long are my Premium days valid?**
A: Premium days are added to your subscription end date. They don't expire if unused.

**Q: Can I combine referral rewards with other promotions?**
A: Yes! Referral rewards stack with other promotions and discounts.

**Q: What's the maximum I can earn?**
A: Technically unlimited! Each conversion = 30 days + milestone bonuses + points after 10.

---

## Support

If you encounter issues:
1. Check Admin Panel → Referrals tab for referral status
2. Review edge function logs for errors
3. Contact support with your referral code for manual investigation