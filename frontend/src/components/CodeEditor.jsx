import React, { useRef, useState } from 'react';
import { useChild } from '../contexts/ChildContext.jsx';
import { postProgress } from '../api/progress.js';

const DEFAULT_JS_CODE = '// Write JavaScript here\nconsole.log("Hello, world!");';
const DEFAULT_PY_CODE = '# Write Python here\nprint("Hello, world!")';

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';

let pyodidePromise = null;

function loadPyodide() {
  if (pyodidePromise) return pyodidePromise;
  pyodidePromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = PYODIDE_CDN;
    script.onload = async () => {
      try {
        const pyodide = await window.loadPyodide();
        resolve(pyodide);
      } catch (err) {
        reject(err);
      }
    };
    script.onerror = () => reject(new Error('Could not load the Python runtime. Check your internet connection.'));
    document.body.appendChild(script);
  });
  return pyodidePromise;
}

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

export default function CodeEditor({ defaultLanguage = 'javascript' }) {
  const { child } = useChild();
  const [language, setLanguage] = useState(defaultLanguage);
  const [code, setCode] = useState(defaultLanguage === 'python' ? DEFAULT_PY_CODE : DEFAULT_JS_CODE);
  const [output, setOutput] = useState('');
  const [saved, setSaved] = useState(false);
  const [pyLoading, setPyLoading] = useState(false);
  const iframeRef = useRef(null);

  function handleLanguageChange(nextLanguage) {
    setLanguage(nextLanguage);
    setOutput('');
    setCode(nextLanguage === 'python' ? DEFAULT_PY_CODE : DEFAULT_JS_CODE);
  }

  function runJavaScript() {
    setOutput('');
    const handleMessage = (event) => {
      if (event.data?.type === 'code-output') {
        setOutput(event.data.output);
        window.removeEventListener('message', handleMessage);
      }
    };
    window.addEventListener('message', handleMessage);
    if (iframeRef.current) {
      iframeRef.current.setAttribute('srcdoc', buildSandboxDoc(code));
    }
  }

  async function runPython() {
    setOutput('');
    setPyLoading(true);
    try {
      const pyodide = await loadPyodide();
      let captured = '';
      pyodide.setStdout({ batched: (text) => { captured += text + '\n'; } });
      pyodide.setStderr({ batched: (text) => { captured += text + '\n'; } });
      try {
        await pyodide.runPythonAsync(code);
      } catch (err) {
        captured += `Error: ${err.message}`;
      }
      setOutput(captured.trim());
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    } finally {
      setPyLoading(false);
    }
  }

  function handleRun() {
    setSaved(false);
    if (language === 'python') {
      runPython();
    } else {
      runJavaScript();
    }
  }

  async function handleSave() {
    await postProgress(child, { snippets: { [`snippet-${Date.now()}`]: code } });
    setSaved(true);
  }

  return (
    <section aria-label="Code editor" className="rounded border p-4 dark:border-gray-700">
      <h2 className="mb-3 text-lg font-bold">Code Editor</h2>
      <div className="mb-2 flex gap-2" role="radiogroup" aria-label="Programming language">
        <button
          type="button"
          role="radio"
          aria-checked={language === 'javascript'}
          onClick={() => handleLanguageChange('javascript')}
          className={`rounded border px-3 py-1 focus:outline focus:outline-2 focus:outline-blue-500 ${
            language === 'javascript' ? 'bg-blue-600 text-white' : ''
          }`}
        >
          JavaScript
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={language === 'python'}
          onClick={() => handleLanguageChange('python')}
          className={`rounded border px-3 py-1 focus:outline focus:outline-2 focus:outline-blue-500 ${
            language === 'python' ? 'bg-blue-600 text-white' : ''
          }`}
        >
          Python
        </button>
      </div>
      <label className="sr-only" htmlFor="code-editor-textarea">
        {language === 'python' ? 'Python code' : 'JavaScript code'}
      </label>
      <textarea
        id="code-editor-textarea"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={8}
        className="w-full rounded border p-2 font-mono text-sm focus:outline focus:outline-2 focus:outline-blue-500 dark:bg-gray-800 dark:text-white"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleRun}
          disabled={pyLoading}
          className="rounded border px-3 py-1 focus:outline focus:outline-2 focus:outline-blue-500 disabled:opacity-50"
        >
          {pyLoading ? 'Starting Python…' : 'Run'}
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
        className="mt-3 min-h-[2rem] whitespace-pre-wrap rounded border bg-gray-100 p-2 text-sm dark:bg-gray-800"
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
