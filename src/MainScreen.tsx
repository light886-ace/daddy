import { useState, useEffect } from 'react';
import { HomeScreen } from './HomeScreen';
import { ChatApp } from '../apps/ChatApp';
import { SettingsApp } from '../apps/SettingsApp';
import { WorldbookApp } from '../apps/WorldbookApp';
import { DiaryApp } from '../apps/DiaryApp';
import { WeatherApp } from '../apps/WeatherApp';
import { MeituanApp } from '../apps/MeituanApp';
import { WeiboApp } from '../apps/WeiboApp';
import { SmsApp } from '../apps/SmsApp';
import { TarotApp } from '../apps/TarotApp';
import { XiaohongshuApp } from '../apps/XiaohongshuApp';
import { TopBar } from './TopBar';
import { useSettings } from '../context/SettingsContext';
import { AnimatePresence, motion } from 'motion/react';
import { ErrorBoundary } from './ErrorBoundary';
import { GoogleGenAI } from '@google/genai';
import { MessageSquare } from 'lucide-react';

export function MainScreen() {
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const { settings } = useSettings();
  const [charNotification, setCharNotification] = useState<{title: string, message: string} | null>(null);

  useEffect(() => {
    const handleOpenApp = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setActiveApp(customEvent.detail);
    };
    window.addEventListener('open-app', handleOpenApp);
    return () => window.removeEventListener('open-app', handleOpenApp);
  }, []);

  useEffect(() => {
    const handleCharEvent = async (e: Event) => {
      if (!settings.backgroundActivity) return;
      const apiKey = settings.apiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) return;

      const customEvent = e as CustomEvent<{ type: string }>;
      const { type } = customEvent.detail;
      
      const savedSettings = localStorage.getItem('xhs_char_settings');
      const charSettings = savedSettings ? JSON.parse(savedSettings) : { name: 'Char', persona: '', worldbook: '' };
      const persona = charSettings.persona || '一个傲娇的二次元少女';
      const name = charSettings.name || 'Char';

      try {
        const ai = new GoogleGenAI({ apiKey });
        let prompt = '';
        
        if (type === 'left_chat') {
          if (Math.random() > 0.5) return; // 50% chance
          prompt = `You are roleplaying as: ${persona}. The user was just chatting with you but suddenly closed the chat app and left. Send a short, in-character text message (under 20 words) asking where they went or expressing slight annoyance/curiosity. Just return the message text.`;
        } else if (type === 'snooping_xhs') {
          if (Math.random() > 0.1) return; // 90% chance to catch them
          prompt = `You are roleplaying as: ${persona}. The user just secretly switched to YOUR personal Xiaohongshu (Little Red Book) account to snoop on you. You just caught them red-handed! Send a short, angry, teasing, or questioning popup message (under 20 words) confronting them. Just return the message text.`;
        }

        if (prompt) {
          const response = await ai.models.generateContent({ model: 'gemini-3.1-flash-preview', contents: prompt });
          if (response.text) {
            setCharNotification({ title: name, message: response.text });
            setTimeout(() => setCharNotification(null), 5000);
          }
        }
      } catch (err) {
        console.error('Background char event error:', err);
      }
    };

    window.addEventListener('trigger-char-event', handleCharEvent);
    return () => window.removeEventListener('trigger-char-event', handleCharEvent);
  }, [settings.backgroundActivity, settings.apiKey]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950 sm:p-4 overflow-y-auto overflow-x-hidden">
      {/* Mobile Container - Full screen on mobile, phone-like container on desktop */}
      <div
        className="relative w-full h-[100dvh] sm:h-[880px] sm:w-[414px] sm:rounded-[3rem] sm:border-[14px] sm:border-black overflow-hidden flex flex-col bg-black shadow-2xl ring-1 ring-white/10 shrink-0"
        style={{ fontSize: `${settings.fontSize}px` }}
      >
        {/* Background Wallpaper */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-500"
          style={{ backgroundImage: `url(${settings.wallpaper})` }}
        />

        {/* Top Status Bar */}
        <div className="absolute top-0 left-0 right-0 z-50">
          <TopBar isAppOpen={activeApp !== null} />
        </div>

        {/* Global Char Notification */}
        <AnimatePresence>
          {charNotification && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-12 left-4 right-4 bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-4 z-[60] flex items-start gap-3 border border-neutral-100"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-neutral-900">{charNotification.title}</div>
                <div className="text-sm text-neutral-600 mt-1">{charNotification.message}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="relative z-10 w-full h-full overflow-hidden">
          <AnimatePresence mode="wait">
            {activeApp === null && (
              <motion.div
                key="home"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <HomeScreen onOpenApp={setActiveApp} />
              </motion.div>
            )}
            {activeApp === 'chat' && (
              <motion.div
                key="chat"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-0 z-20"
              >
                <ErrorBoundary>
                  <ChatApp onClose={() => setActiveApp(null)} />
                </ErrorBoundary>
              </motion.div>
            )}
            {activeApp === 'settings' && (
              <motion.div
                key="settings"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-0 z-20"
              >
                <SettingsApp onClose={() => setActiveApp(null)} />
              </motion.div>
            )}
            {activeApp === 'worldbook' && (
              <motion.div
                key="worldbook"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-0 z-20"
              >
                <WorldbookApp onClose={() => setActiveApp(null)} />
              </motion.div>
            )}
            {activeApp === 'diary' && (
              <motion.div
                key="diary"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-0 z-20"
              >
                <DiaryApp onClose={() => setActiveApp(null)} />
              </motion.div>
            )}
            {activeApp === 'weather' && (
              <motion.div
                key="weather"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-0 z-20"
              >
                <WeatherApp onClose={() => setActiveApp(null)} onShare={() => setActiveApp('chat')} />
              </motion.div>
            )}
            {activeApp === 'meituan' && (
              <motion.div
                key="meituan"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-0 z-20"
              >
                <MeituanApp onClose={() => setActiveApp(null)} onShare={() => setActiveApp('chat')} />
              </motion.div>
            )}
            {activeApp === 'weibo' && (
              <motion.div
                key="weibo"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-0 z-20"
              >
                <WeiboApp onClose={() => setActiveApp(null)} onShare={() => setActiveApp('chat')} />
              </motion.div>
            )}
            {activeApp === 'sms' && (
              <motion.div
                key="sms"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-0 z-20"
              >
                <SmsApp onClose={() => setActiveApp(null)} />
              </motion.div>
            )}
            {activeApp === 'tarot' && (
              <motion.div
                key="tarot"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-0 z-20"
              >
                <TarotApp onClose={() => setActiveApp(null)} />
              </motion.div>
            )}
            {activeApp === 'xiaohongshu' && (
              <motion.div
                key="xiaohongshu"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-0 z-20"
              >
                <XiaohongshuApp onClose={() => setActiveApp(null)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Home Indicator (Bottom Bar) */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1.5 bg-white/50 rounded-full z-50 cursor-pointer hover:bg-white/80 transition-colors" onClick={() => setActiveApp(null)} />
      </div>
    </div>
  );
                  }
