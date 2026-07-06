import React, { createContext, useContext, useEffect, useState } from 'react';

const ChildContext = createContext(null);

// Static fallback — overridden once /api/users responds
let _parentProfiles = ['Parent', 'Shovan', 'Bely'];

export function isParentProfile(child) {
  return _parentProfiles.includes(child);
}

export function getParentProfiles() {
  return _parentProfiles;
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
    const sizeMap = { small: '14px', medium: '16px', large: '19px', 'x-large': '22px', 'xx-large': '26px' };
    root.style.setProperty('--app-font-size', sizeMap[appearance.fontSize] || sizeMap.medium);
    const theme = appearance.theme || 'default';
    root.setAttribute('data-theme', theme);
    root.classList.toggle('dark', theme === 'dark' || theme === 'high-contrast');
    // Apply colour-blind filter
    const cbTheme = appearance.colorBlindTheme || '';
    const filterMap = {
      deuteranopia: 'url(#deuteranopia)',
      protanopia: 'url(#protanopia)',
      tritanopia: 'url(#tritanopia)',
    };
    root.style.filter = filterMap[cbTheme] || '';
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
