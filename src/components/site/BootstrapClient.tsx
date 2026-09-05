'use client';

import { useEffect } from 'react';

/**
 * Loads Bootstrap's JS bundle in the browser only.
 *
 * Bootstrap 5 touches `document` at import time, so it cannot be imported at
 * module scope in a server-rendered tree. Importing it here — once, after
 * mount — gives every `data-bs-*` attribute in the app (offcanvas, dropdown,
 * collapse) its behaviour without pulling the bundle into the server build.
 */
export default function BootstrapClient() {
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min.js').catch(() => {
      // Non-fatal: nav and cart both have no-JS fallbacks (real links to
      // /collections and /cart), so the site stays usable either way.
    });
  }, []);

  return null;
}
