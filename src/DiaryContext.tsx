import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSettings } from './SettingsContext';
import { GoogleGenAI } from '@google/genai';

export interface DiaryEntry {
  id: string;
  timestamp: number;
  content: string;
  author: 'user' | 'char';
}

interface DiaryContextType {
  entries: DiaryEntry[];
  isGenerating: boolean;
  generateDiary: () => Promise<void>;
  addEntry: (content: string, author: 'user' | 'char') => void;
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

export function DiaryProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    const saved = localStorage.getItem('mobile_os_diaries');
    // For backward compatibility, default author to 'char' if not present
    return saved ? JSON.parse(saved).map((e: any) => ({ ...e, author: e.author || 'char' })) : [];
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    localStorage.setItem('mobile_os_diaries', JSON.stringify(entries));
  }, [entries]);

  const addEntry = useCallback((content: string, author: 'user' | 'char') => {
    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      content: content.trim(),
      author,
    };
    setEntries(prev => [newEntry, ...prev]);
  }, []);

  const generateDiary = useCallback(async () => {
    const apiKey = settings.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey && !settings.apiUrl) return;
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      let content = '';
      const recentUserEntries = entries
        .filter(e => e.author === 'user')
        .slice(0, 3)
        .map(e => `用户在 ${new Date(e.timestamp).toLocaleString()} 写了日记: "${e.content}"`)
        .join('\n');

      const prompt = `你是一个生活在手机里的虚拟角色。请写一篇简短的个人日记，记录你今天的心情、想法或者对用户的观察。字数在100字以内，不需要写称呼或落款，直接写日记正文。${recentUserEntries ? `\n\n最近用户写的日记（你可以参考或回应）：\n${recentUserEntries}` : ''}`;

      if (settings.apiUrl) {
        // Use custom OpenAI-compatible API
        const res = await fetch(settings.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }]
          })
        });
        const data = await res.json();
        content = data.choices?.[0]?.message?.content || '';
      } else {
        // Fallback to Gemini
        if (!apiKey) throw new Error("API Key is missing.");
        
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-preview',
          contents: prompt,
        });
        content = response.text || '';
      }

      if (content) {
        const newEntry: DiaryEntry = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          content: content.trim(),
          author: 'char',
        };
        setEntries(prev => [newEntry, ...prev]);
      }
    } catch (error) {
      console.error('Failed to generate diary:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [settings.apiKey, settings.apiUrl, isGenerating, entries]);

  // Random generation logic
  useEffect(() => {
    const apiKey = settings.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey && !settings.apiUrl) return;

    // Check every 1 minute
    const interval = setInterval(() => {
      // 10% chance every minute to write a diary, or if no entries exist
      if (entries.length === 0 || Math.random() < 0.1) {
        generateDiary();
      }
    }, 60000);

    // Initial check on mount if empty
    if (entries.length === 0) {
      generateDiary();
    }

    return () => clearInterval(interval);
  }, [settings.apiKey, settings.apiUrl, entries.length, generateDiary]);

  return (
    <DiaryContext.Provider value={{ entries, isGenerating, generateDiary, addEntry }}>
      {children}
    </DiaryContext.Provider>
  );
}

export function useDiary() {
  const context = useContext(DiaryContext);
  if (context === undefined) throw new Error('useDiary must be used within a DiaryProvider');
  return context;
}
