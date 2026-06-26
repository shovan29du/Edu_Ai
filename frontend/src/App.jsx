import React, { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import GradeSelector from './components/GradeSelector.jsx';
import SyllabusCard from './components/SyllabusCard.jsx';
import ProgressDashboard from './components/ProgressDashboard.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import { fetchGrade } from './api/grade.js';

export default function App() {
  const [standard, setStandard] = useState(1);
  const [grade, setGrade] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchGrade(standard)
      .then((data) => {
        setGrade(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setGrade(null);
        setLoading(false);
      });
  }, [standard]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="mx-auto max-w-5xl space-y-6 p-4">
        <GradeSelector standard={standard} onChange={setStandard} />
        <ProgressDashboard />
        {loading && <LoadingSpinner />}
        {error && <p role="alert" className="text-red-600">{error}</p>}
        {grade &&
          Object.entries(grade.subjects).map(([name, subject]) => (
            <SyllabusCard key={name} subjectName={name} subject={subject} />
          ))}
      </main>
    </div>
  );
}
