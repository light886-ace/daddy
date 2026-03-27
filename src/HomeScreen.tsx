import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Settings, Book, Image as ImageIcon, Music, Camera, Map, Mail, Headphones, User, Bot, Heart, Play, Pause, Upload, Calendar, BookOpen, CloudSun, ShoppingBag, MessageCircle, MessageSquareText, MoonStar, BookHeart } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useMusic } from '../context/MusicContext';
import { resizeImage } from '../utils/image';
import { PhotoWidget } from './PhotoWidget';

const APPS = [
  // Page 1
  { id: 'chat', name: '聊天', icon: MessageSquare, color: 'bg-green-500', page: 0 },
  { id: 'worldbook', name: '世界书', icon: Book, color: 'bg-blue-500', page: 0 },
  { id: 'diary', name: '日记', icon: BookOpen, color: 'bg-indigo-500', page: 0 },
  { id: 'weather', name: '天气', icon: CloudSun, color: 'bg-sky-500', page: 0 },
  { id: 'meituan', name: '美团', icon: ShoppingBag, color: 'bg-[#FFD100]', page: 0 },
  { id: 'settings', name: '设置', icon: Settings, color: 'bg-neutral-600', page: 0 },
  // Page 2 (Dummy apps for visual completion)
  { id: 'weibo', name: '微博', icon: MessageCircle, color: 'bg-orange-500', page: 1 },
  { id: 'tarot', name: '塔罗', icon: MoonStar, color: 'bg-purple-900', page: 1 },
  { id: 'xiaohongshu', name: '小红书', icon: BookHeart, color: 'bg-red-500', page: 1 },
  { id: 'map', name: '地图', icon: Map, color: 'bg-emerald-500', page: 1 },
  { id: 'sms', name: '信息', icon: MessageSquareText, color: 'bg-green-500', page: 1 },
];

export function HomeScreen({ onOpenApp }: { onOpenApp: (id: string) => void }) {
  const [currentPage, setCurrentPage] = useState(0);
  const { settings } = useSettings();

  const handleDragEnd = (e: any, info: any) => {
    const swipeThreshold = 20;
    const velocityThreshold = 200;
    
    if ((info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) && currentPage === 0) {
      setCurrentPage(1);
    } else if ((info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) && currentPage === 1) {
      setCurrentPage(0);
    }
  };

  return (
    <div className="relative w-full h-full">
      <motion.div
        className="w-full h-full flex"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={{ x: `${-currentPage * 100}%` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {[0, 1].map((pageIndex) => (
          <div key={pageIndex} className="min-w-full h-full p-6 pt-14 pb-36 flex flex-col overflow-y-auto hide-scrollbar">
            {pageIndex === 0 ? (
              <>
                <ClockWidget />
                <ListenTogetherWidget />
                <div className="flex-1 flex flex-row w-full mt-2 gap-4">
                  <div className="flex-1 max-w-[160px]">
                    <CountdownWidget />
                  </div>
                  <div className="flex-1 flex justify-end">
                    <div className="grid grid-cols-2 gap-x-5 gap-y-6 content-start">
                      {APPS.filter(app => app.page === 0).map(app => (
                        <AppIcon key={app.id} app={app} onOpenApp={onOpenApp} />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <PhotoWidget />
                <div className="grid grid-cols-4 gap-x-4 gap-y-6 content-start">
                  {APPS.filter(app => app.page === 1).map(app => (
                    <AppIcon key={app.id} app={app} onOpenApp={onOpenApp} />
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </motion.div>

      {/* Page Indicators */}
      <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-3 z-50">
        {[0, 1].map(idx => (
          <div
            key={idx}
            onClick={() => setCurrentPage(idx)}
            className="p-2 cursor-pointer"
          >
            <div className={`w-2 h-2 rounded-full transition-colors ${currentPage === idx ? 'bg-white' : 'bg-white/40'}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function AppIcon({ app, onOpenApp }: any) {
  const { settings } = useSettings();
  const customIcon = settings.icons[app.id];
  
  return (
    <div 
      className="flex flex-col items-center gap-1.5 cursor-pointer relative z-50"
      onClick={() => onOpenApp(app.id)}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm overflow-hidden ${app.color}`}>
        {customIcon ? (
          <img src={customIcon} alt={app.name} className="w-full h-full object-cover pointer-events-none" />
        ) : (
          <app.icon size={28} strokeWidth={1.5} />
        )}
      </div>
      <span className="text-xs text-white font-medium drop-shadow-md">{app.name}</span>
    </div>
  );
}

function ClockWidget() {
  const [time, setTime] = useState(new Date());
  const { settings } = useSettings();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateString = time.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

  const textColor = settings.statusBarColor === 'black' ? 'text-black' : 'text-white';

  return (
    <div className={`w-full flex flex-col items-center justify-center drop-shadow-lg mb-4 mt-0 ${textColor}`}>
      <div className="text-6xl font-extralight tracking-tight">{timeString}</div>
      <div className="text-base font-medium mt-1">{dateString}</div>
    </div>
  );
}

function ListenTogetherWidget() {
  const { settings, updateSettings } = useSettings();
  const { trackName, isPlaying, setTrack, togglePlay } = useMusic();

  const handleAvatarUpload = async (type: 'user' | 'char', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await resizeImage(file, 200, 200);
        updateSettings(type === 'user' ? { userAvatar: base64 } : { charAvatar: base64 });
      } catch (err) {
        console.error("Failed to resize avatar", err);
      }
    }
  };

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTrack(file);
    }
  };

  return (
    <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-4 mb-6 border border-white/20 shadow-lg flex items-center justify-between">
      {/* Avatars & Heart */}
      <div className="flex justify-center items-center gap-4 shrink-0">
        <label className="relative cursor-pointer group">
          <div className="w-12 h-12 rounded-full border border-white/50 overflow-hidden bg-white/20 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
            {settings.userAvatar ? (
              <img src={settings.userAvatar} alt="User" className="w-full h-full object-cover" />
            ) : (
              <User size={24} className="text-white/80 drop-shadow-md" />
            )}
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarUpload('user', e)} />
        </label>

        <div className="relative flex flex-col items-center justify-center w-8">
          <div className="absolute -top-5 flex items-center gap-1 text-white whitespace-nowrap">
            <span className="font-medium text-[11px] drop-shadow-md">一起听</span>
            {isPlaying && (
              <div className="flex gap-[1.5px] items-end h-2.5">
                <div className="w-[2px] bg-white rounded-full animate-pulse h-full" />
                <div className="w-[2px] bg-white rounded-full animate-pulse h-2/3" style={{ animationDelay: '0.1s' }} />
                <div className="w-[2px] bg-white rounded-full animate-pulse h-full" style={{ animationDelay: '0.2s' }} />
              </div>
            )}
          </div>
          <div className="text-white/60 drop-shadow-md">
            <Heart size={18} className={isPlaying ? "text-pink-400 animate-pulse" : ""} fill={isPlaying ? "currentColor" : "none"} />
          </div>
        </div>

        <label className="relative cursor-pointer group">
          <div className="w-12 h-12 rounded-full border border-white/50 overflow-hidden bg-white/20 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
            {settings.charAvatar ? (
              <img src={settings.charAvatar} alt="Char" className="w-full h-full object-cover" />
            ) : (
              <Bot size={24} className="text-white/80 drop-shadow-md" />
            )}
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarUpload('char', e)} />
        </label>
      </div>

      {/* Music Controls */}
      <div className="flex-1 min-w-0 flex items-center gap-3 bg-black/20 rounded-full p-2 pl-5 border border-white/10 ml-3">
        <div className="flex-1 min-w-0 overflow-hidden whitespace-nowrap text-ellipsis text-white text-sm drop-shadow-md">
          {trackName || "未播放"}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label className="cursor-pointer p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors shadow-sm">
            <Upload size={14} />
            <input type="file" accept="audio/*" className="hidden" onChange={handleMusicUpload} />
          </label>
          <button 
            onClick={togglePlay}
            disabled={!trackName}
            className="p-2 bg-white text-black rounded-full disabled:opacity-50 transition-colors shadow-sm"
          >
            {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function CountdownWidget() {
  const { settings } = useSettings();

  const targetDate = new Date(settings.countdownDate || '2027-01-01');
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="w-full aspect-square rounded-3xl overflow-hidden relative shadow-lg border border-white/20">
      {settings.countdownBg ? (
        <img src={settings.countdownBg} alt="bg" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-400/40 to-purple-500/40 backdrop-blur-md" />
      )}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 p-4 flex flex-col items-center justify-center text-white gap-2">
        <div className="text-sm font-medium drop-shadow-md opacity-90">{settings.countdownText || '跨年'}</div>
        <div className="flex items-baseline gap-1 drop-shadow-lg">
          <span className="text-5xl font-bold tracking-tighter">{diffDays > 0 ? diffDays : 0}</span>
          <span className="text-sm font-medium opacity-90">天</span>
        </div>
      </div>
    </div>
  );
                }
