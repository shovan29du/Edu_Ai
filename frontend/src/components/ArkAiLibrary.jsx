import { useEffect, useState } from 'react';
import { listArkAiModels, listArkAiPrompts, listArkAiTools } from '../api/arkAi.js';

const SECTIONS = ['Prompts', 'Models', 'Tools'];

export default function ArkAiLibrary({ onUsePrompt }) {
  const [section, setSection] = useState('Prompts');

  return (
    <div className="rounded-xl border p-4 dark:border-gray-700">
      <h3 className="font-semibold">Ark AI Library</h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        The full prompt library, model catalog, and free tools directory carried over from Ark_Ai.
      </p>
      <div className="mt-3 flex gap-2" role="tablist" aria-label="Ark AI Library section">
        {SECTIONS.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={section === s}
            onClick={() => setSection(s)}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              section === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {section === 'Prompts' && <PromptsSection onUsePrompt={onUsePrompt} />}
        {section === 'Models' && <ModelsSection />}
        {section === 'Tools' && <ToolsSection />}
      </div>
    </div>
  );
}

function PromptsSection({ onUsePrompt }) {
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    listArkAiPrompts(query, tag)
      .then((data) => {
        setPrompts(data.prompts || []);
        setTags(data.tags || []);
        setError('');
      })
      .catch((err) => setError(err.message));
  }, [query, tag]);

  return (
    <div>
      <p className="text-xs text-gray-500">
        {prompts.length} of 367 expert reference prompts shown{tag ? ` in "${tag}"` : ''}. Each can be used
        as extra context for your Ark AI conversation.
      </p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search prompts…"
          className="min-w-0 flex-1 rounded border px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="rounded border px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="">All tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      <ul className="mt-3 max-h-96 space-y-2 overflow-y-auto">
        {prompts.map((p) => (
          <li key={p.id} className="rounded border p-2 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              className="flex w-full items-center justify-between gap-2 text-left"
            >
              <span className="font-medium">{p.name}</span>
              <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] uppercase text-gray-500 dark:bg-gray-800">
                {p.tag}
              </span>
            </button>
            {expanded === p.id && (
              <div className="mt-2 space-y-2">
                <p className="max-h-40 overflow-y-auto whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-300">
                  {p.prompt}
                </p>
                {onUsePrompt && (
                  <button
                    type="button"
                    onClick={() => onUsePrompt(p.prompt)}
                    className="rounded bg-indigo-600 px-3 py-1 text-xs font-semibold text-white"
                  >
                    Use as Ark AI context
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
        {prompts.length === 0 && !error && <li className="text-sm text-gray-400">No prompts match.</li>}
      </ul>
    </div>
  );
}

function ModelsSection() {
  const [models, setModels] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    listArkAiModels()
      .then((data) => setModels(data.models || []))
      .catch((err) => setError(err.message));
  }, []);

  const byProvider = models.reduce((acc, m) => {
    (acc[m.provider] ||= []).push(m);
    return acc;
  }, {});

  return (
    <div>
      <p className="rounded bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
        Ark AI here only ever calls Claude (Anthropic) — that's the one provider this app has credentials
        for. The rest of this catalog is what the original Ark_Ai project supports; each other provider
        would need its own separate API key to actually work.
      </p>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-3 max-h-96 space-y-3 overflow-y-auto">
        {Object.entries(byProvider).map(([provider, list]) => (
          <div key={provider}>
            <h4 className="text-xs font-semibold uppercase text-gray-500">{provider} ({list.length})</h4>
            <div className="mt-1 flex flex-wrap gap-1">
              {list.map((m) => (
                <span key={m.id} className="rounded-full border px-2 py-0.5 text-xs dark:border-gray-700">
                  {m.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolsSection() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [kind, setKind] = useState('');
  const [categories, setCategories] = useState([]);
  const [kinds, setKinds] = useState([]);
  const [tools, setTools] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    listArkAiTools(query, category, kind)
      .then((data) => {
        setTools(data.tools || []);
        setCategories(data.categories || []);
        setKinds(data.kinds || []);
        setError('');
      })
      .catch((err) => setError(err.message));
  }, [query, category, kind]);

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools…"
          className="min-w-0 flex-1 rounded border px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
        <select value={kind} onChange={(e) => setKind(e.target.value)} className="rounded border px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800">
          <option value="">All kinds</option>
          {kinds.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded border px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      <ul className="mt-3 max-h-96 space-y-2 overflow-y-auto">
        {tools.map((t) => (
          <li key={t.id} className="rounded border p-2 dark:border-gray-700">
            <div className="flex items-center justify-between gap-2">
              {t.url ? (
                <a href={t.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                  {t.name}
                </a>
              ) : (
                <span className="font-medium">{t.name}</span>
              )}
              <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] uppercase text-gray-500 dark:bg-gray-800">
                {t.kind}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">{t.category} · {t.note}</p>
          </li>
        ))}
        {tools.length === 0 && !error && <li className="text-sm text-gray-400">No tools match.</li>}
      </ul>
    </div>
  );
}
