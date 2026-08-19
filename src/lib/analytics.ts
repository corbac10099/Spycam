export function trackPageView(pageName: string, path: string = '') {
  if (typeof window === 'undefined') return;
  try {
    const effectivePath = path || window.location.pathname || '/';
    const payload = JSON.stringify({ pageName, path: effectivePath });
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/track', new Blob([payload], { type: 'application/json' }));
    } else {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (e) {
    // Non-blocking
  }
}
