import { useState } from 'react';
import { tabColorTheme } from '../utils/tabColors.js';

/** Small reusable sub-tab bar for a top-level tab that groups several
 * pages under one heading (e.g. "Other Subjects", or a page merged with
 * a related one). Each item gets its own vibrant colour, using the same
 * hash-based palette as the main tab bar, so a group of six subjects
 * doesn't read as one flat wall of identical blue pills. */
export default function TabGroup({ ariaLabel, items }) {
  const [active, setActive] = useState(items[0].id);
  const activeItem = items.find((item) => item.id === active) || items[0];

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label={ariaLabel} className="flex flex-wrap gap-2">
        {items.map((item) => {
          const theme = tabColorTheme(item.id);
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={active === item.id}
              onClick={() => setActive(item.id)}
              className={`flex items-center gap-1 rounded-full border px-4 py-1.5 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline focus:outline-2 focus:outline-blue-500 ${
                active === item.id ? theme.active : theme.inactive
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {activeItem.render()}
    </div>
  );
}
