import React, { createContext, useContext, useEffect, useState } from 'react';

const ChildContext = createContext(null);

export const PARENT_PROFILES = ['Parent', 'Shovan', 'Bely'];

export function isParentProfile(child) {
  return PARENT_PROFILES.includes(child);
}

export function ChildProvider({ children }) {
  const [child, setChild] = useState(() => localStorage.getItem('selectedChild') || 'Aliza');
  const [isRestricted, setIsRestricted] = useState(
    () => localStorage.getItem('isRestricted') === 'true'
  );
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  const [appearance, setAppearance] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem('appearance')) || {
          bgColor: '',
          fontColor: '',
          fontFamily: '',
          fontSize: 'medium',
          theme: 'default',
        }
      );
    } catch {
      return { bgColor: '', fontColor: '', fontFamily: '', fontSize: 'medium', theme: 'default' };
    }
  });

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

  useEffect(() => {
    localStorage.setItem('appearance', JSON.stringify(appearance));
    const root = document.documentElement;
    root.style.setProperty('--app-bg-color', appearance.bgColor || '');
    root.style.setProperty('--app-font-color', appearance.fontColor || '');
    root.style.setProperty('--app-font-family', appearance.fontFamily || '');
    const sizeMap = { small: '14px', medium: '16px', large: '19px', 'x-large': '22px' };
    root.style.setProperty('--app-font-size', sizeMap[appearance.fontSize] || sizeMap.medium);
    root.setAttribute('data-theme', appearance.theme || 'default');
  }, [appearance]);

  function updateAppearance(patch) {
    setAppearance((prev) => ({ ...prev, ...patch }));
  }

  return (
    <ChildContext.Provider
      value={{
        child,
        setChild,
        isRestricted,
        setIsRestricted,
        darkMode,
        setDarkMode,
        appearance,
        updateAppearance,
      }}
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
