import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fetchSiteSettings } from '../api';

const SiteSettingsContext = createContext({
  settings: { background_url: null, sidebar_character_url: null },
  reload: async () => {},
  setSettings: () => {},
});

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({ background_url: null, sidebar_character_url: null });

  const reload = useCallback(async () => {
    try {
      const d = await fetchSiteSettings();
      setSettings(d);
    } catch (e) { /* keep defaults silently */ }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return (
    <SiteSettingsContext.Provider value={{ settings, reload, setSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
