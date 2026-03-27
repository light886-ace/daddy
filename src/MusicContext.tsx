import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface MusicContextType {
  trackName: string;
  isPlaying: boolean;
  setTrack: (file: File) => void;
  togglePlay: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [trackName, setTrackName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const setTrack = (file: File) => {
    if (audioRef.current) {
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
      setTrackName(file.name.replace(/\.[^/.]+$/, ""));
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (audioRef.current && audioRef.current.src) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <MusicContext.Provider value={{ trackName, isPlaying, setTrack, togglePlay }}>
      {children}
    </MusicContext.Provider>
  );
}

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within MusicProvider');
  return context;
};
