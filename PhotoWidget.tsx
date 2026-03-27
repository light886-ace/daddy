import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { resizeImage } from '../utils/image';

export function PhotoWidget() {
  const [photo, setPhoto] = useState<string>('');

  useEffect(() => {
    const savedPhoto = localStorage.getItem('widget_single_photo');
    if (savedPhoto) {
      setPhoto(savedPhoto);
    }
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await resizeImage(file, 800, 800);
        setPhoto(base64);
        localStorage.setItem('widget_single_photo', base64);
      } catch (err) {
        console.error("Failed to resize photo", err);
      }
    }
  };

  const triggerUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handlePhotoUpload as any;
    input.click();
  };

  return (
    <div 
      className="w-full bg-[#BDBDBD] rounded-[32px] relative overflow-hidden shadow-sm mb-6 aspect-[2/1] flex flex-col items-center justify-center cursor-pointer hover:opacity-95 transition-opacity"
      onClick={triggerUpload}
    >
      {photo ? (
        <img src={photo} alt="Widget Background" className="w-full h-full object-cover absolute inset-0" />
      ) : (
        <>
          {/* Decorative Stars for empty state */}
          <div className="absolute inset-0 pointer-events-none opacity-60">
            <div className="absolute top-3 left-6 text-white text-lg">★</div>
            <div className="absolute top-8 left-16 text-white text-sm">★</div>
            <div className="absolute top-2 left-32 text-white text-xl">★</div>
            <div className="absolute top-10 left-48 text-white text-sm">★</div>
            <div className="absolute top-4 right-24 text-white text-lg">★</div>
            <div className="absolute top-8 right-8 text-white text-xl">★</div>
            
            <div className="absolute bottom-5 left-10 text-white text-xl">★</div>
            <div className="absolute bottom-10 left-28 text-white text-sm">★</div>
            <div className="absolute bottom-4 left-44 text-white text-lg">★</div>
            <div className="absolute bottom-8 right-36 text-white text-sm">★</div>
            <div className="absolute bottom-4 right-16 text-white text-xl">★</div>
          </div>
          <div className="flex flex-col items-center gap-2 text-white/80 z-10">
            <Camera size={32} />
          </div>
        </>
      )}
    </div>
  );
}
