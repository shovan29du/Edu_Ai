import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // re-check for a new version hourly

/**
 * Surfaces the PWA service-worker update lifecycle to the user instead of
 * silently swapping app code out from under them (registerType is 'prompt'
 * in vite.config.js precisely so this component gets to decide when).
 * Also exposes a manual "Check for updates" affordance via a custom event
 * (see Header.jsx) so a parent/admin isn't stuck waiting for the hourly poll.
 */
export default function UpdatePrompt() {
  const [dismissed, setDismissed] = useState(false);
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (!registration) return;
      setInterval(() => {
        registration.update().catch(() => {});
      }, CHECK_INTERVAL_MS);
      // Let a manual "Check for updates" button (Header.jsx) trigger an
      // immediate check without waiting for the hourly interval above.
      window.addEventListener('eduai-check-for-updates', () => {
        registration.update().catch(() => {});
      });
    },
  });

  useEffect(() => {
    if (!offlineReady) return;
    const t = setTimeout(() => setOfflineReady(false), 4000);
    return () => clearTimeout(t);
  }, [offlineReady, setOfflineReady]);

  if (needRefresh && !dismissed) {
    return (
      <div
        role="alert"
        className="fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center justify-center gap-3 border-t bg-blue-600 px-4 py-3 text-sm text-white shadow-lg dark:border-blue-800"
      >
        <span>🔄 A new version of EduAi_Pro is available.</span>
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          className="rounded-lg bg-white px-3 py-1 font-semibold text-blue-700 hover:bg-blue-50"
        >
          Update now
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-lg border border-white/50 px-3 py-1 text-white/90 hover:bg-white/10"
        >
          Later
        </button>
      </div>
    );
  }

  if (offlineReady) {
    return (
      <div
        role="status"
        className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-2 border-t bg-green-600 px-4 py-2 text-sm text-white shadow-lg dark:border-green-800"
      >
        ✅ EduAi_Pro is ready to work offline.
      </div>
    );
  }

  return null;
}
