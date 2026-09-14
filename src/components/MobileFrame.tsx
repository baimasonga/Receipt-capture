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
  const [osType, setOsType] = useState<'ANDROID' | 'IOS'>('ANDROID');

  return (
    <div className="py-6 flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] bg-slate-950/90 px-4">
      
      {/* Device Switcher Controls */}
      <div className="mb-4 flex items-center space-x-3 bg-slate-800 p-1.5 rounded-xl border border-slate-700 shadow-md">
        <button
          onClick={() => setOsType('ANDROID')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
            osType === 'ANDROID' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Google Android (Pixel 9 Pro) — Capture Terminal</span>
        </button>
        <button
          onClick={() => setOsType('IOS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            osType === 'IOS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Apple iOS (iPhone 16)
        </button>
        <button
          onClick={onExitMobile}
          className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white border-l border-slate-700 pl-3"
          title="Return to Bursary Web Dashboard"
        >
          Exit to Web Dashboard
        </button>
      </div>

      {/* Hardware Shell */}
      <div className={`relative w-full max-w-[420px] bg-black rounded-[48px] p-3 shadow-2xl border-4 ${
        osType === 'ANDROID' ? 'border-slate-800 shadow-emerald-950/20' : 'border-slate-700'
      }`}>
        
        {/* Screen Bezel and Display Area */}
        <div className="relative bg-slate-50 rounded-[40px] overflow-hidden flex flex-col h-[800px] shadow-inner">
          
          {/* Android / iOS Status Bar */}
          <div className="h-11 bg-slate-950 text-white px-6 flex items-center justify-between text-xs select-none z-20 shrink-0 border-b border-slate-900">
            <span className="font-semibold text-[11px] tracking-tight font-mono">
              10:24
            </span>

            {/* Dynamic Island for iOS or Camera Punch hole for Android */}
            {osType === 'IOS' ? (
              <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500/80 mr-1" />
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <div className="w-3.5 h-3.5 bg-black rounded-full ring-1 ring-slate-800" />
              </div>
            )}

            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="text-[10px] font-bold text-emerald-400 font-mono">5G</span>
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <div className="flex items-center space-x-0.5">
                <span className="text-[9px] font-mono">98%</span>
                <Battery className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>

          {/* Android App Bar */}
          <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between z-20 shrink-0 border-b border-slate-800 shadow-xs">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white">
                <Camera className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold leading-none">UniAudit Field Capture</div>
                <div className="text-[9px] text-emerald-400 font-mono mt-0.5">Android APK v2.4 • Offline Ready</div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono">
                CAMERA READY
              </span>
            </div>
          </div>

          {/* App Screen Content Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-3.5 bg-slate-100">
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
              <span className="text-[10px]">Pass &amp; Fees</span>
            </button>

            <button
              onClick={() => onChangeTab('SCAN')}
              className={`flex flex-col items-center justify-center space-y-0.5 ${
                activeTab === 'SCAN' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <div className="w-11 h-11 -mt-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg ring-4 ring-white">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-emerald-700 font-bold">Field OCR</span>
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

          {/* Android 3-Button Navigation Bar or iOS Home Bar */}
          {osType === 'ANDROID' ? (
            <div className="h-7 bg-black text-slate-400 flex items-center justify-around px-12 shrink-0 select-none">
              {/* Android Back (Triangle) */}
              <button 
                onClick={() => onChangeTab('HOME')} 
                className="hover:text-white p-1"
                title="Android Back"
              >
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[8px] border-r-current" />
              </button>
              {/* Android Home (Circle) */}
              <button 
                onClick={() => onChangeTab('SCAN')} 
                className="hover:text-white p-1"
                title="Android Home"
              >
                <div className="w-2.5 h-2.5 rounded-full border-2 border-current" />
              </button>
              {/* Android Overview / Recents (Square) */}
              <button 
                onClick={onExitMobile} 
                className="hover:text-white p-1"
                title="Android Overview (Switch to Web Dashboard)"
              >
                <div className="w-2.5 h-2.5 rounded-[1px] border-2 border-current" />
              </button>
            </div>
          ) : (
            <div className="h-4 bg-white flex items-center justify-center shrink-0">
              <div className="w-32 h-1 bg-slate-300 rounded-full" />
            </div>
          )}

        </div>
      </div>
      
      <p className="text-xs text-slate-400 mt-3 text-center">
        📱 Android Mobile Field Capture App (Standalone capture client for bank queues, field bursars &amp; student onboarding)
      </p>
    </div>
  );
};
