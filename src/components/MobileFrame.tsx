import React, { useState } from 'react';
import { 
  Wifi, 
  Battery, 
  Signal, 
  Smartphone, 
  Camera, 
  Home, 
  Clock, 
  Bell, 
  User, 
  ChevronLeft,
  RotateCcw
} from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  onExitMobile: () => void;
  activeTab: 'HOME' | 'SCAN' | 'HISTORY' | 'ALERTS';
  onChangeTab: (tab: 'HOME' | 'SCAN' | 'HISTORY' | 'ALERTS') => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  onExitMobile,
  activeTab,
  onChangeTab,
}) => {
  const [osType, setOsType] = useState<'IOS' | 'ANDROID'>('IOS');

  return (
    <div className="py-6 flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] bg-slate-950/90 px-4">
      
      {/* Device Switcher Controls */}
      <div className="mb-4 flex items-center space-x-3 bg-slate-800 p-1.5 rounded-xl border border-slate-700 shadow-md">
        <button
          onClick={() => setOsType('IOS')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
            osType === 'IOS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Apple iOS (iPhone 16 Pro)
        </button>
        <button
          onClick={() => setOsType('ANDROID')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
            osType === 'ANDROID' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Google Android (Pixel 9 Pro)
        </button>
        <button
          onClick={onExitMobile}
          className="px-3 py-1 rounded-lg text-xs font-bold text-slate-400 hover:text-white border-l border-slate-700 pl-3"
        >
          Exit Mobile Frame
        </button>
      </div>

      {/* Hardware Shell */}
      <div className={`relative w-full max-w-[410px] bg-black rounded-[48px] p-3 shadow-2xl border-4 ${
        osType === 'IOS' ? 'border-slate-700' : 'border-slate-800'
      }`}>
        
        {/* Screen Bezel and Display Area */}
        <div className="relative bg-slate-50 rounded-[40px] overflow-hidden flex flex-col h-[780px] shadow-inner">
          
          {/* Status Bar */}
          <div className="h-11 bg-slate-900 text-white px-6 flex items-center justify-between text-xs select-none z-20 shrink-0">
            <span className="font-semibold text-[11px] tracking-tight">
              9:41
            </span>

            {/* Dynamic Island for iOS or Camera Punch hole for Android */}
            {osType === 'IOS' ? (
              <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500/80 mr-1" />
              </div>
            ) : (
              <div className="w-3.5 h-3.5 bg-black rounded-full" />
            )}

            <div className="flex items-center space-x-1.5 text-slate-300">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* App Screen Content Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
            {children}
          </div>

          {/* Bottom Native Mobile Navigation Bar */}
          <div className="h-16 bg-white border-t border-slate-200 px-6 flex items-center justify-around text-slate-500 shrink-0 z-20 shadow-md">
            <button
              onClick={() => onChangeTab('HOME')}
              className={`flex flex-col items-center justify-center space-y-0.5 ${
                activeTab === 'HOME' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px]">Dashboard</span>
            </button>

            <button
              onClick={() => onChangeTab('SCAN')}
              className={`flex flex-col items-center justify-center space-y-0.5 ${
                activeTab === 'SCAN' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <div className="w-10 h-10 -mt-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-emerald-700 font-bold">Scan Slip</span>
            </button>

            <button
              onClick={() => onChangeTab('ALERTS')}
              className={`flex flex-col items-center justify-center space-y-0.5 ${
                activeTab === 'ALERTS' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Bell className="w-5 h-5" />
              <span className="text-[10px]">Alerts</span>
            </button>
          </div>

          {/* Home Indicator Bar */}
          <div className="h-4 bg-white flex items-center justify-center shrink-0">
            <div className="w-32 h-1 bg-slate-300 rounded-full" />
          </div>

        </div>
      </div>
      
      <p className="text-xs text-slate-400 mt-3 text-center">
        PWA &amp; Native Mobile App Simulator (Responsive touch design for bank queues &amp; off-campus verification)
      </p>
    </div>
  );
};
