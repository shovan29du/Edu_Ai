/**
 * UpdateLinksButton — browser-side live URL checker + auto-fixer.
 *
 * Flow:
 *  1. Fetch all content URLs from /api/get-all-links
 *  2. Check each URL from the browser (bypasses server-side proxy restrictions)
 *     - Wikipedia: Wikipedia REST API (CORS-enabled) → confirms article exists
 *     - YouTube search links: validate search_query param
 *     - General URLs: fetch with no-cors (detects dead servers vs live ones)
 *  3. For broken/missing pages, compute a replacement URL
 *  4. POST replacements to /api/apply-link-fixes
 *  5. Show per-category report
 */
import { useState } from 'react';

const CONCURRENCY = 8;   // parallel fetches at a time
const TIMEOUT_MS  = 6000;

// ── Replacement generators ────────────────────────────────────────────────────

function qs(s) { return encodeURIComponent(s); }

function ytSearch(title, source)  { return `https://www.youtube.com/results?search_query=${qs(`${title} ${source}`).replace(/%20/g, '+')}+educational`; }
function wikiSearch(title)        { return `https://en.wikipedia.org/w/index.php?search=${qs(title)}`; }
function googleSearch(title, src) { return `https://www.google.com/search?q=${qs(title + ' ' + src)}`; }

const DOMAIN_SEARCH = {
  'khanacademy.org':  (t) => `https://www.khanacademy.org/search?page_search_query=${qs(t)}`,
  'ck12.org':         (t) => `https://www.ck12.org/search/?q=${qs(t)}`,
  'bbc.co.uk':        (t) => `https://www.bbc.co.uk/bitesize/search?q=${qs(t)}`,
  'bbc.com':          (t) => `https://www.bbc.co.uk/bitesize/search?q=${qs(t)}`,
  'britannica.com':   (t) => `https://www.britannica.com/search?query=${qs(t)}`,
  'ducksters.com':    (t) => `https://www.ducksters.com/search.php?q=${qs(t)}`,
  'nationalgeographic': (t) => `https://www.nationalgeographic.com/search?q=${qs(t)}`,
  'nasa.gov':         (t) => `https://www.nasa.gov/search-results?q=${qs(t)}`,
  'pbs.org':          (t) => `https://www.pbs.org/search/#q=${qs(t)}`,
  'gutenberg.org':    (t) => `https://www.gutenberg.org/ebooks/search/?query=${qs(t)}`,
};

function replacementFor(url, title, source, key) {
  // Song search links — always rebuildable
  if (key === 'youtube_search') return ytSearch(title, source);
  if (key === 'wiki_search')    return wikiSearch(title);
  if (key === 'lyrics_search')  return `https://www.google.com/search?q=${qs(title + ' ' + source + ' lyrics')}`;

  // YouTube watch links → YouTube search
  if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) return ytSearch(title, source);

  // Wikipedia → Wikipedia search
  if (url.includes('wikipedia.org')) return wikiSearch(title || url.split('/').pop().replace(/_/g,' '));

  // Known educational domains → their own search
  for (const [domain, fn] of Object.entries(DOMAIN_SEARCH)) {
    if (url.includes(domain)) return fn(title || source);
  }

  // Generic fallback
  return googleSearch(title, source);
}

// ── URL checking ──────────────────────────────────────────────────────────────

async function checkWikipedia(url) {
  // Extract article title from URL and use Wikipedia's CORS-enabled REST API
  const m = url.match(/wikipedia\.org\/wiki\/(.+?)(\?|#|$)/);
  if (!m) return { ok: true }; // can't parse → assume ok
  const title = decodeURIComponent(m[1]);
  try {
    const r = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { signal: AbortSignal.timeout(TIMEOUT_MS) }
    );
    if (r.status === 404) return { ok: false, reason: 'Article not found' };
    if (r.status === 301 || r.status === 200) {
      const d = await r.json().catch(() => ({}));
      // Check if it's a disambiguation page (not the content we want)
      if (d.type === 'disambiguation') return { ok: false, reason: 'Disambiguation page' };
      return { ok: true };
    }
    return { ok: r.ok };
  } catch {
    return { ok: false, reason: 'Unreachable' };
  }
}

async function checkGeneral(url) {
  // no-cors: opaque response = server responded; TypeError = dead server
  try {
    await fetch(url, { mode: 'no-cors', signal: AbortSignal.timeout(TIMEOUT_MS) });
    return { ok: true }; // got an opaque response — server is up
  } catch (e) {
    if (e.name === 'AbortError') return { ok: false, reason: 'Timeout' };
    return { ok: false, reason: 'Unreachable' };
  }
}

async function checkUrl(rec) {
  const { url, key } = rec;

  // YouTube search links — structural check only (search always works)
  if (url.includes('youtube.com/results?search_query=') && url.length > 50) return { ok: true };

  // Google search links — always valid
  if (url.includes('google.com/search?q=') && url.length > 40) return { ok: true };

  // Wikipedia — use their CORS API to verify the article exists
  if (url.includes('wikipedia.org/wiki/')) return checkWikipedia(url);

  // Wikipedia search — always valid
  if (url.includes('wikipedia.org/w/index.php?search=')) return { ok: true };

  // General live check
  return checkGeneral(url);
}

// Run tasks with limited concurrency
async function pLimit(tasks, limit, onProgress) {
  const results = new Array(tasks.length);
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
      onProgress(i + 1);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function UpdateLinksButton() {
  const [phase, setPhase]       = useState('idle'); // idle | fetching | checking | fixing | done
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [report, setReport]     = useState(null);
  const [open, setOpen]         = useState(false);

  async function run() {
    setPhase('fetching');
    setReport(null);
    setOpen(true);

    // 1. Get all URLs from backend
    let allUrls;
    try {
      const r = await fetch('/api/get-all-links?limit_per_file=150');
      allUrls = (await r.json()).urls;
    } catch {
      setReport({ error: 'Could not reach backend.' });
      setPhase('idle');
      return;
    }

    setPhase('checking');
    setProgress({ done: 0, total: allUrls.length });

    // 2. Check each URL from the browser
    const tasks = allUrls.map((rec) => () => checkUrl(rec));
    const results = await pLimit(tasks, CONCURRENCY, (done) =>
      setProgress({ done, total: allUrls.length })
    );

    // 3. Collect broken ones and generate replacements
    const fixes = [];
    allUrls.forEach((rec, i) => {
      if (!results[i].ok) {
        const repl = replacementFor(rec.url, rec.title, rec.source, rec.key);
        if (repl && repl !== rec.url) {
          fixes.push({ url: rec.url, replacement: repl, file: rec.file, key: rec.key, title: rec.title });
        }
      }
    });

    // 4. Build category report
    const catReport = {};
    allUrls.forEach((rec, i) => {
      const cat = rec.category;
      if (!catReport[cat]) catReport[cat] = { checked: 0, broken: 0, fixed: 0 };
      catReport[cat].checked++;
      if (!results[i].ok) catReport[cat].broken++;
    });

    // 5. Send fixes to backend
    if (fixes.length > 0) {
      setPhase('fixing');
      try {
        const r = await fetch('/api/apply-link-fixes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fixes }),
        });
        const d = await r.json();
        // Mark fixed in report
        fixes.forEach((fix) => {
          const cat = allUrls.find((u) => u.url === fix.url && u.file === fix.file)?.category;
          if (cat && catReport[cat]) catReport[cat].fixed++;
        });
        setReport({
          total_checked: allUrls.length,
          total_broken:  fixes.length,
          total_fixed:   d.applied,
          report: catReport,
          errors: d.errors,
        });
      } catch {
        setReport({ error: 'Fixes generated but failed to save them.' });
      }
    } else {
      setReport({
        total_checked: allUrls.length,
        total_broken:  0,
        total_fixed:   0,
        report: catReport,
      });
    }

    setPhase('done');
  }

  const busy = phase !== 'idle' && phase !== 'done';

  const label =
    phase === 'fetching'  ? 'Loading URLs…' :
    phase === 'checking'  ? `Checking ${progress.done}/${progress.total}…` :
    phase === 'fixing'    ? 'Saving fixes…' :
    '🔄 Update Links';

  return (
    <div className="relative">
      <button
        onClick={busy ? undefined : run}
        disabled={busy}
        title="Live-check all content links and repair broken ones"
        className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
      >
        {busy && <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />}
        {label}
      </button>

      {/* Progress bar */}
      {phase === 'checking' && progress.total > 0 && (
        <div className="absolute left-0 top-full mt-1 h-1 w-full overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${(progress.done / progress.total) * 100}%` }}
          />
        </div>
      )}

      {/* Report panel */}
      {open && report && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-xl border bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-semibold text-gray-800 dark:text-gray-100">Link Health Report</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          {report.error ? (
            <p className="text-sm text-red-600">{report.error}</p>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap gap-2 text-sm">
                <span className="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-700">
                  🔍 {report.total_checked.toLocaleString()} checked
                </span>
                {report.total_fixed > 0 && (
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    🔧 {report.total_fixed} fixed
                  </span>
                )}
                {report.total_broken > 0 ? (
                  <span className="rounded bg-red-100 px-2 py-0.5 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                    ⚠ {report.total_broken} broken
                  </span>
                ) : (
                  <span className="rounded bg-green-100 px-2 py-0.5 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                    ✅ All healthy
                  </span>
                )}
              </div>

              {report.errors?.length > 0 && (
                <p className="mb-2 text-xs text-red-500">Save errors: {report.errors.join('; ')}</p>
              )}

              <div className="max-h-72 space-y-1 overflow-y-auto text-xs">
                {Object.entries(report.report)
                  .sort((a, b) => (b[1].broken - b[1].fixed) - (a[1].broken - a[1].fixed))
                  .map(([cat, r]) => (
                    <div key={cat} className="flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <span className="flex-1 text-gray-700 dark:text-gray-300">{cat}</span>
                      <span className="text-gray-400">{r.checked} urls</span>
                      <span className={`w-20 text-right font-medium ${
                        r.broken - r.fixed > 0 ? 'text-red-600 dark:text-red-400' :
                        r.fixed > 0            ? 'text-amber-600 dark:text-amber-400' :
                                                 'text-green-600 dark:text-green-400'}`}>
                        {r.broken - r.fixed > 0 ? `⚠ ${r.broken - r.fixed} broken` :
                         r.fixed > 0            ? `🔧 ${r.fixed} fixed` : '✅'}
                      </span>
                    </div>
                  ))}
              </div>

              <p className="mt-3 text-xs text-gray-400">
                Checks live from your browser · Wikipedia verified via API · others via server reachability
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
