export type EcommerceEventName =
  | 'view_item'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'search'
  | 'wishlist';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackEcommerceEvent(
  event: EcommerceEventName,
  payload: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    currency: 'PEN',
    timestamp: new Date().toISOString(),
    ...payload,
  });
  if (typeof window.gtag === 'function') {
    window.gtag('event', event, { currency: 'PEN', ...payload });
  }
  if (typeof window.fbq === 'function') {
    const fbMap: Record<EcommerceEventName, string> = {
      view_item: 'ViewContent',
      add_to_cart: 'AddToCart',
      begin_checkout: 'InitiateCheckout',
      purchase: 'Purchase',
      search: 'Search',
      wishlist: 'AddToWishlist',
    };
    window.fbq('track', fbMap[event], payload);
  }
}

export function formatPEN(amount: number): string {
  return `S/ ${amount.toLocaleString('es-PE', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
