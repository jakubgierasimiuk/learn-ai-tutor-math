/**
 * Utilities for persisting referral codes across the registration flow
 */

const REFERRAL_CODE_KEY = 'mentavo_referral_code';
const REFERRAL_CODE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface StoredReferralCode {
  code: string;
  timestamp: number;
}

/**
 * Save referral code to localStorage with TTL
 */
export const saveReferralCode = (code: string): void => {
  if (!code) return;
  
  const data: StoredReferralCode = {
    code,
    timestamp: Date.now()
  };
  
  try {
    localStorage.setItem(REFERRAL_CODE_KEY, JSON.stringify(data));
    console.log('[Referral] Saved referral code to localStorage:', code);
  } catch (error) {
    console.error('[Referral] Failed to save referral code:', error);
  }
};

/**
 * Get referral code from localStorage (if not expired)
 */
export const getReferralCode = (): string | null => {
  try {
    const stored = localStorage.getItem(REFERRAL_CODE_KEY);
    if (!stored) return null;
    
    const data: StoredReferralCode = JSON.parse(stored);
    const now = Date.now();
    
    // Check if expired (7 days)
    if (now - data.timestamp > REFERRAL_CODE_TTL) {
      console.log('[Referral] Code expired, clearing');
      clearReferralCode();
      return null;
    }
    
    console.log('[Referral] Retrieved referral code from localStorage:', data.code);
    return data.code;
  } catch (error) {
    console.error('[Referral] Failed to retrieve referral code:', error);
    return null;
  }
};

/**
 * Clear referral code from localStorage
 */
export const clearReferralCode = (): void => {
  try {
    localStorage.removeItem(REFERRAL_CODE_KEY);
    console.log('[Referral] Cleared referral code from localStorage');
  } catch (error) {
    console.error('[Referral] Failed to clear referral code:', error);
  }
};
