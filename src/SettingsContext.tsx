import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Settings {
  wallpaper: string;
  icons: Record<string, string>;
  apiUrl: string;
  apiKey: string;
  model: string;
  fontSize: number;
  userAvatar: string;
  charAvatar: string;
  countdownBg: string;
  countdownText: string;
  countdownDate: string;
  statusBarColor: 'white' | 'black';
  backgroundActivity?: boolean;
}

const defaultSettings: Settings = {
  wallpaper: 'https://picsum.photos/seed/phone/1080/1920',
  icons: {},
  apiUrl: '',
  apiKey: '',
  model: '',
  fontSize: 16,
  userAvatar: '',
  charAvatar: '',
  countdownBg: '',
  countdownText: '跨年',
  countdownDate: '2027-01-01',
  statusBarColor: 'white',
  backgroundActivity: false,
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('mobile_os_settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('mobile_os_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
