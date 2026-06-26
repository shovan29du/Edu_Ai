import React from 'react';

export default function LoadingSpinner() {
  return (
    <div role="status" aria-live="polite" className="p-4 text-center">
      Loading…
    </div>
  );
}
