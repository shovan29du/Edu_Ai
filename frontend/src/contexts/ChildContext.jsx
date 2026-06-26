import React, { createContext, useContext, useEffect, useState } from 'react';

const ChildContext = createContext(null);

export function ChildProvider({ children }) {
  const [child, setChild] = useState(() => localStorage.getItem('selectedChild') || 'Aliza');
  const [isRestricted, setIsRestricted] = useState(
    () => localStorage.getItem('isRestricted') === 'true'
  );
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    localStorage.setItem('selectedChild', child);
  }, [child]);

  useEffect(() => {
    localStorage.setItem('isRestricted', isRestricted);
  }, [isRestricted]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <ChildContext.Provider
      value={{ child, setChild, isRestricted, setIsRestricted, darkMode, setDarkMode }}
    >
      {children}
    </ChildContext.Provider>
  );
}

export function useChild() {
  const ctx = useContext(ChildContext);
  if (!ctx) throw new Error('useChild must be used within ChildProvider');
  return ctx;
}
