const CONSENT_KEY = 'cookieConsent';
export const COOKIE_CONSENT_EVENT = 'cookie-consent';

export type CookieConsentValue = 'accepted' | 'declined';

export function readCookieConsent(): CookieConsentValue | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === 'accepted' || value === 'declined' ? value : null;
  } catch {
    return null;
  }
}

export function adsAllowed(): boolean {
  return readCookieConsent() === 'accepted';
}

export function writeCookieConsent(value: CookieConsentValue) {
  window.localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
  const granted = value === 'accepted' ? 'granted' : 'denied';
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.('consent', 'update', {
    ad_storage: granted,
    ad_user_data: granted,
    ad_personalization: granted,
  });
}
