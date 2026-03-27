import { useState, useEffect } from 'react';
import { Wifi, Signal, Zap } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export function TopBar({ isAppOpen = false }: { isAppOpen?: boolean }) {
  const [time, setTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState<number>(1);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const { settings } = useSettings();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let battery: any = null;

    const updateBattery = () => {
      if (battery) {
        setBatteryLevel(battery.level);
        setIsCharging(battery.charging);
      }
    };

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((b: any) => {
        battery = b;
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      });
    }

    return () => {
      if (battery) {
        battery.removeEventListener('levelchange', updateBattery);
        battery.removeEventListener('chargingchange', updateBattery);
      }
    };
  }, []);

  // When an app is open, force text color to adapt to light/dark mode (black in light, white in dark)
  // Otherwise, use the user's selected status bar color for the home screen
  const isBlackText = isAppOpen ? false : settings.statusBarColor === 'black';
  
  const textColor = isAppOpen ? 'text-black dark:text-white' : (isBlackText ? 'text-black' : 'text-white');
  const borderColor = isAppOpen ? 'border-black/80 dark:border-white/80' : (isBlackText ? 'border-black/80' : 'border-white/80');
  const bgColor = isAppOpen ? 'bg-black dark:bg-white' : (isBlackText ? 'bg-black' : 'bg-white');
  const zapColor = isAppOpen ? 'text-white fill-black dark:text-black dark:fill-white' : (isBlackText ? 'text-white fill-black' : 'text-black fill-white');
  const tipColor = isAppOpen ? 'bg-black/80 dark:bg-white/80' : (isBlackText ? 'bg-black/80' : 'bg-white/80');

  return (
    <div className={`w-full h-12 flex items-center justify-between px-6 z-50 relative pointer-events-none ${textColor} ${isAppOpen ? '' : 'drop-shadow-md'}`}>
      <span className={`text-sm font-medium ${isAppOpen ? '' : 'drop-shadow-md'}`}>
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
      <div className={`flex items-center gap-2 ${isAppOpen ? '' : 'drop-shadow-md'}`}>
        <Signal size={16} />
        <Wifi size={16} />
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium">{Math.round(batteryLevel * 100)}%</span>
          <div className={`relative w-[22px] h-[11px] border ${borderColor} rounded-[4px] p-[1px] flex items-center`}>
            <div 
              className={`h-full rounded-[2px] transition-all duration-300 ${batteryLevel <= 0.2 && !isCharging ? 'bg-red-500' : bgColor}`}
              style={{ width: `${batteryLevel * 100}%` }}
            />
            {isCharging && <Zap size={10} className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-sm ${zapColor}`} />}
            <div className={`absolute -right-[3px] top-1/2 -translate-y-1/2 w-[2px] h-[4px] rounded-r-sm ${tipColor}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

