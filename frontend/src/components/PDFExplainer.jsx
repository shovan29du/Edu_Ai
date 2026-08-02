import React, { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';
import ReadAloudButton from './ReadAloudButton.jsx';
import LevelSelector from './LevelSelector.jsx';
import {
  addPdfNote,
  askPdfDocument,
  deletePdfDocument,
  deletePdfNote,
  explainPdfDocument,
  listPdfDocuments,
  listPdfNotes,
  quizPdfDocument,
  uploadPdfDocument,
} from '../api/pdfExplainer.js';

export default function PDFExplainer({ level: initialLevel = '1', child = '' }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [level, setLevel] = useState(initialLevel);
  const [selectedId, setSelectedId] = useState(null);

  function refresh() {
    setLoading(true);
    listPdfDocuments(child)
      .then(setDocuments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child]);

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const record = await uploadPdfDocument(file, child);
      setDocuments((docs) => [...docs, record]);
      setSelectedId(record.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    setError(null);
    try {
      await deletePdfDocument(id);
      setDocuments((docs) => docs.filter((d) => d.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      setError(err.message);
    }
  }

  const selected = documents.find((d) => d.id === selectedId) || null;

  return (
    <section aria-label="PDF Explainer" className="space-y-6 rounded border p-4 dark:border-gray-700">
      <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white">
        <h2 className="text-xl font-bold">📄 PDF Explainer</h2>
        <p className="text-sm opacity-90">
          Upload any PDF and EduBot will explain it in simple language, answer questions about it,
          quiz you on its content, and let you save notes — all read aloud if you like.
        </p>
      </div>

      {error && <p role="alert" className="rounded bg-red-50 p-3 text-red-700">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept=".pdf"
          onChange={handleUpload}
          disabled={uploading}
          className="block text-sm"
        />
        {uploading && <span className="text-sm">Reading and analysing…</span>}
        <LevelSelector level={level} onChange={setLevel} />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : documents.length === 0 ? (
        <p className="text-sm text-gray-500">No PDFs uploaded yet.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className={`rounded-lg border p-3 dark:border-gray-700 ${
                selectedId === doc.id ? 'border-emerald-500 ring-1 ring-emerald-500' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedId(doc.id)}
                  className="break-all text-left font-medium text-emerald-700 underline dark:text-emerald-300"
                >
                  {doc.filename}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(doc.id)}
                  className="shrink-0 rounded border px-2 py-1 text-xs"
                >
                  Remove
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">{doc.page_count} page(s)</p>
              {doc.summary && <p className="mt-2 line-clamp-3 text-sm">{doc.summary}</p>}
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <DocumentWorkspace key={selected.id} doc={selected} level={level} child={child} />
      )}
    </section>
  );
}

function DocumentWorkspace({ doc, level, child }) {
  const [mode, setMode] = useState('explain');
  const [explanation, setExplanation] = useState('');
  const [explaining, setExplaining] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [asking, setAsking] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [quizzing, setQuizzing] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    listPdfNotes(doc.id, child).then(setNotes).catch(() => {});
  }, [doc.id, child]);

  async function handleExplain() {
    setExplaining(true);
    setError(null);
    try {
      const data = await explainPdfDocument(doc.id, { level });
      setExplanation(data.explanation);
    } catch (err) {
      setError(err.message);
    } finally {
      setExplaining(false);
    }
  }

  async function handleAsk(e) {
    e.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    setError(null);
    try {
      const data = await askPdfDocument(doc.id, question, { level });
      setAnswer(data.answer);
    } catch (err) {
      setError(err.message);
    } finally {
      setAsking(false);
    }
  }

  async function handleQuiz() {
    setQuizzing(true);
    setError(null);
    try {
      const data = await quizPdfDocument(doc.id, 5, { level });
      setQuiz(data.quiz);
    } catch (err) {
      setError(err.message);
    } finally {
      setQuizzing(false);
    }
  }

  async function handleAddNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setError(null);
    try {
      const note = await addPdfNote(doc.id, noteText, child);
      setNotes((n) => [...n, note]);
      setNoteText('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteNote(id) {
    setError(null);
    try {
      await deletePdfNote(id);
      setNotes((n) => n.filter((note) => note.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  const MODES = [
    { id: 'explain', label: '💡 Explain' },
    { id: 'ask', label: '❓ Ask' },
    { id: 'quiz', label: '📝 Quiz' },
    { id: 'notes', label: '🗒️ Notes' },
  ];

  return (
    <div className="rounded-xl border bg-white p-4 shadow dark:bg-gray-900 dark:border-gray-700">
      <h3 className="font-semibold">{doc.filename}</h3>

      {error && <p role="alert" className="mt-2 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${
              mode === m.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'explain' && (
        <div className="mt-4 space-y-3">
          <button
            type="button"
            onClick={handleExplain}
            disabled={explaining}
            className="rounded-lg bg-emerald-600 px-6 py-2 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {explaining ? 'Explaining…' : explanation ? 'Re-explain' : 'Explain this document'}
          </button>
          {explaining && <LoadingSpinner />}
          {explanation && (
            <div className="space-y-2">
              <ReadAloudButton text={explanation} />
              <div className="whitespace-pre-wrap rounded-lg border p-3 text-sm dark:border-gray-700">
                {explanation}
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'ask' && (
        <div className="mt-4 space-y-3">
          <form onSubmit={handleAsk} className="flex flex-col gap-2 sm:flex-row">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about this document…"
              className="min-w-0 flex-1 rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
            />
            <button
              type="submit"
              disabled={asking || !question.trim()}
              className="rounded-lg bg-emerald-600 px-6 py-2 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {asking ? 'Thinking…' : 'Ask'}
            </button>
          </form>
          {asking && <LoadingSpinner />}
          {answer && (
            <div className="space-y-2">
              <ReadAloudButton text={answer} />
              <div className="whitespace-pre-wrap rounded-lg border p-3 text-sm dark:border-gray-700">
                {answer}
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'quiz' && (
        <div className="mt-4 space-y-3">
          <button
            type="button"
            onClick={handleQuiz}
            disabled={quizzing}
            className="rounded-lg bg-emerald-600 px-6 py-2 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {quizzing ? 'Generating…' : quiz ? 'New quiz' : 'Generate a quiz'}
          </button>
          {quizzing && <LoadingSpinner />}
          {quiz && quiz.length > 0 && <DocumentQuiz questions={quiz} />}
          {quiz && quiz.length === 0 && (
            <p className="text-sm text-gray-500">No quiz could be generated for this document.</p>
          )}
        </div>
      )}

      {mode === 'notes' && (
        <div className="mt-4 space-y-3">
          <form onSubmit={handleAddNote} className="flex flex-col gap-2 sm:flex-row">
            <input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write a note about this document…"
              className="min-w-0 flex-1 rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
            />
            <button
              type="submit"
              disabled={!noteText.trim()}
              className="rounded-lg bg-emerald-600 px-6 py-2 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              Save note
            </button>
          </form>
          {notes.length === 0 ? (
            <p className="text-sm text-gray-500">No notes yet.</p>
          ) : (
            <ul className="space-y-2">
              {notes.map((note) => (
                <li key={note.id} className="flex items-start justify-between gap-2 rounded border p-2 text-sm dark:border-gray-700">
                  <span>{note.text}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id)}
                    className="shrink-0 rounded border px-2 py-1 text-xs"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function DocumentQuiz({ questions }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function score() {
    return questions.filter((q, i) => answers[i] === q.answer).length;
  }

  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={i} className="space-y-1">
          <p className="text-sm font-medium">{i + 1}. {q.question}</p>
          <div className="space-y-1">
            {Object.entries(q.options || {}).map(([letter, text]) => {
              const isSelected = answers[i] === letter;
              const isCorrect = submitted && letter === q.answer;
              const isWrong = submitted && isSelected && letter !== q.answer;
              return (
                <label
                  key={letter}
                  className={`flex cursor-pointer items-center gap-2 rounded px-3 py-1 text-sm ${
                    isCorrect ? 'bg-green-100 dark:bg-green-900' :
                    isWrong ? 'bg-red-100 dark:bg-red-900' :
                    isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name={`pdf-quiz-q${i}`}
                    disabled={submitted}
                    checked={isSelected}
                    onChange={() => setAnswers({ ...answers, [i]: letter })}
                  />
                  {letter}) {text}
                </label>
              );
            })}
          </div>
          {submitted && q.explanation && (
            <p className="text-xs text-gray-500">{q.explanation}</p>
          )}
        </div>
      ))}
      {!submitted ? (
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < questions.length}
          className="rounded bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Submit
        </button>
      ) : (
        <p className="font-semibold text-green-600">Score: {score()} / {questions.length}</p>
      )}
    </div>
  );
}
