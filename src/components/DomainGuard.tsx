import { useEffect } from 'react';
import { PRODUCTION_DOMAIN } from '@/lib/constants';

/**
 * DomainGuard Component
 * 
 * Automatically redirects users from *.lovable.app domains to the production domain.
 * Preserves the full URL path, query parameters, and hash fragments.
 * 
 * This component should be placed early in the app tree (after BrowserRouter)
 * to ensure the redirect happens before any other components load.
 */
export const DomainGuard = () => {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname;
    
    // Skip if already on production domain or localhost
    if (hostname === 'mentavo.pl' || hostname === 'www.mentavo.pl' || hostname === 'localhost') {
      return;
    }

    // Check if we're on a lovable.app domain
    if (hostname.includes('lovable.app')) {
      const fullPath = window.location.pathname + window.location.search + window.location.hash;
      const redirectUrl = `${PRODUCTION_DOMAIN}${fullPath}`;
      
      console.warn(
        '[DomainGuard] Redirecting from lovable.app to production domain:',
        { from: window.location.href, to: redirectUrl }
      );
      
      // Use replace to avoid adding to browser history
      window.location.replace(redirectUrl);
    }
  }, []);

  // Component doesn't render anything - it's just a side effect
  return null;
};
