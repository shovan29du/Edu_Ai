import React, { useRef, useState } from 'react';
import { useChild } from '../contexts/ChildContext.jsx';
import { postProgress } from '../api/progress.js';

const DEFAULT_CODE = '// Write JavaScript here\nconsole.log("Hello, world!");';

function buildSandboxDoc(code) {
  const escaped = JSON.stringify(code);
  return `<!doctype html><html><body><script>
    const log = [];
    const origLog = console.log;
    console.log = (...args) => { log.push(args.join(' ')); origLog(...args); };
    try {
      eval(${escaped});
    } catch (err) {
      log.push('Error: ' + err.message);
    }
    parent.postMessage({ type: 'code-output', output: log.join('\\n') }, '*');
  </script></body></html>`;
}

export default function CodeEditor() {
  const { child } = useChild();
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState('');
  const [saved, setSaved] = useState(false);
  const iframeRef = useRef(null);

  function handleRun() {
    setOutput('');
    setSaved(false);
    const handleMessage = (event) => {
      if (event.data?.type === 'code-output') {
        setOutput(event.data.output);
        window.removeEventListener('message', handleMessage);
      }
    };
    window.addEventListener('message', handleMessage);
    if (iframeRef.current) {
      iframeRef.current.srcdoc = buildSandboxDoc(code);
      iframeRef.current.setAttribute('srcdoc', buildSandboxDoc(code));
    }
  }

  async function handleSave() {
    await postProgress(child, { snippets: { [`snippet-${Date.now()}`]: code } });
    setSaved(true);
  }

  return (
    <section aria-label="Code editor" className="rounded border p-4 dark:border-gray-700">
      <h2 className="mb-3 text-lg font-bold">Code Editor</h2>
      <label className="sr-only" htmlFor="code-editor-textarea">
        JavaScript code
      </label>
      <textarea
        id="code-editor-textarea"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={8}
        className="w-full rounded border p-2 font-mono text-sm focus:outline focus:outline-2 focus:outline-blue-500 dark:bg-gray-800 dark:text-white"
      />
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={handleRun}
          className="rounded border px-3 py-1 focus:outline focus:outline-2 focus:outline-blue-500"
        >
          Run
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="rounded border px-3 py-1 focus:outline focus:outline-2 focus:outline-blue-500"
        >
          Save snippet
        </button>
        {saved && <span role="status">Saved!</span>}
      </div>
      <pre
        role="region"
        aria-label="Code output"
        className="mt-3 min-h-[2rem] rounded border bg-gray-100 p-2 text-sm dark:bg-gray-800"
      >
        {output}
      </pre>
      <iframe
        ref={iframeRef}
        title="code-sandbox"
        sandbox="allow-scripts"
        className="hidden"
      />
    </section>
  );
}
