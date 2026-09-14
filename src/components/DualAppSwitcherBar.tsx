import React from 'react';
import { Smartphone, Monitor, ShieldCheck, Wifi, WifiOff, Cloud, ArrowRightLeft } from 'lucide-react';

interface DualAppSwitcherBarProps {
  currentApp: 'ANDROID_APP' | 'WEB_APP';
  onSwitchApp: (app: 'ANDROID_APP' | 'WEB_APP') => void;
  isOffline: boolean;
  offlineQueueCount: number;
  totalReceiptsCount: number;
  onOpenGitHubBuildModal?: () => void;
}

export const DualAppSwitcherBar: React.FC<DualAppSwitcherBarProps> = ({
  currentApp,
  onSwitchApp,
  isOffline,
  offlineQueueCount,
  totalReceiptsCount,
  onOpenGitHubBuildModal,
}) => {
  return (
    <div className="bg-slate-950 border-b border-slate-800/90 text-slate-300 py-2 px-3 sm:px-6 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        
        {/* Left: Architecture Badge */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700/80 font-mono text-[11px] text-slate-300">
            <ArrowRightLeft className="w-3 h-3 text-emerald-400" />
            <span className="font-semibold text-slate-200">Dual-App Architecture:</span>
            <span className="text-emerald-400">Isolated Android &amp; Web Suites</span>
          </div>

          <div className="hidden md:flex items-center space-x-1 text-[11px] text-slate-400">
            <span>•</span>
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Shared Real-Time Ledger ({totalReceiptsCount} Vouchers)</span>
          </div>
        </div>

        {/* Center: The Two Distinct App Selectors */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700/80 shadow-inner">
          {/* App 1: Android Mobile Application */}
          <button
            id="btn-select-android-app"
            onClick={() => onSwitchApp('ANDROID_APP')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentApp === 'ANDROID_APP'
                ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Switch to standalone Google Android Mobile Application"
          >
            <Smartphone className="w-4 h-4" />
            <span>Android Mobile App</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
              currentApp === 'ANDROID_APP' ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-800 text-slate-400'
            }`}>
              Pixel 9 Pro
            </span>
          </button>

          {/* App 2: Web Management Portal */}
          <button
            id="btn-select-web-app"
            onClick={() => onSwitchApp('WEB_APP')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentApp === 'WEB_APP'
                ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Switch to standalone Bursary Web Management Dashboard"
          >
            <Monitor className="w-4 h-4" />
            <span>Bursary Web Portal</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
              currentApp === 'WEB_APP' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
            }`}>
              Desktop Suite
            </span>
          </button>
        </div>

        {/* Right: GitHub APK Builder & Sync Indicator */}
        <div className="flex items-center space-x-2.5 text-xs">
          {onOpenGitHubBuildModal && (
            <button
              id="btn-open-github-actions-build"
              onClick={onOpenGitHubBuildModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-700 hover:border-emerald-500/50 shadow-sm transition group"
              title="Build Android Mobile APK via GitHub Actions to download and test on phone"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Build Mobile via GitHub</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                APK CI/CD
              </span>
            </button>
          )}

          <div className="hidden lg:flex items-center space-x-2">
            {isOffline ? (
              <span className="inline-flex items-center space-x-1 text-amber-400 text-[11px] font-mono">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline Cache ({offlineQueueCount})</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 text-emerald-400 text-[11px] font-mono">
                <Wifi className="w-3.5 h-3.5" />
                <span>Gateway Live</span>
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
