import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Monitor, 
  Cloud, 
  Bell, 
  UserCheck, 
  FileText,
  Clock,
  Layers
} from 'lucide-react';
import { StudentAccount } from '../types';

interface HeaderProps {
  activeRole: 'BURSAR' | 'AUDITOR' | 'STUDENT';
  onRoleChange: (role: 'BURSAR' | 'AUDITOR' | 'STUDENT') => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  offlineQueueCount: number;
  onSyncOfflineQueue: () => void;
  isSyncing: boolean;
  students: StudentAccount[];
  selectedStudent: StudentAccount;
  onSelectStudent: (s: StudentAccount) => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeRole,
  onRoleChange,
  isOffline,
  onToggleOffline,
  isMobileFrame,
  onToggleMobileFrame,
  offlineQueueCount,
  onSyncOfflineQueue,
  isSyncing,
  students,
  selectedStudent,
  onSelectStudent,
  onOpenNotifications,
  unreadNotificationsCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & University Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-slate-100">
                  UniAudit
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  OCR Reconciler
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Metropolitan University Bursary &amp; Interbank Ledger Audit
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Offline/Online Toggle with Queue Badge */}
            <div className="flex items-center space-x-1.5">
              <button
                id="btn-toggle-offline-mode"
                onClick={onToggleOffline}
                title={isOffline ? 'Offline Mode Active (Cached Locally)' : 'Connected to Cloud Vault'}
                className={`flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors border ${
                  isOffline
                    ? 'bg-amber-950/80 border-amber-600/60 text-amber-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {isOffline ? (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span className="hidden md:inline">Offline Vault</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden md:inline">Cloud Synced</span>
                  </>
                )}
              </button>

              {offlineQueueCount > 0 && (
                <button
                  id="btn-sync-offline-queue"
                  onClick={onSyncOfflineQueue}
                  disabled={isOffline || isSyncing}
                  className="flex items-center space-x-1 text-xs px-2 py-1.5 rounded-md font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition"
                  title="Sync local receipts to cloud storage"
                >
                  <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync ({offlineQueueCount})</span>
                </button>
              )}
            </div>

            {/* Mobile View Toggle */}
            <button
              id="btn-toggle-mobile-frame"
              onClick={onToggleMobileFrame}
              title={isMobileFrame ? 'Exit Mobile Frame Preview' : 'Preview Mobile App (Android/iOS)'}
              className={`flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors border ${
                isMobileFrame
                  ? 'bg-indigo-900/80 border-indigo-500 text-indigo-200'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {isMobileFrame ? (
                <>
                  <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Desktop View</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Mobile App View</span>
                </>
              )}
            </button>

            {/* Notifications Button */}
            <button
              id="btn-open-alerts"
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition"
              title="View WhatsApp & Email Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-[10px] font-bold rounded-full flex items-center justify-center text-white">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Role Switcher */}
            <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex items-center space-x-1">
              <button
                id="role-btn-bursar"
                onClick={() => onRoleChange('BURSAR')}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
                  activeRole === 'BURSAR'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Bursar Admin
              </button>
              <button
                id="role-btn-auditor"
                onClick={() => onRoleChange('AUDITOR')}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
                  activeRole === 'AUDITOR'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Internal Audit
              </button>
              <button
                id="role-btn-student"
                onClick={() => onRoleChange('STUDENT')}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
                  activeRole === 'STUDENT'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Student Portal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-header status bar for student selection when in student mode */}
      {activeRole === 'STUDENT' && (
        <div className="bg-slate-950 border-t border-slate-800/80 px-4 py-2 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold text-slate-200">Active Student:</span>
            <select
              id="select-active-student"
              value={selectedStudent.studentId}
              onChange={(e) => {
                const found = students.find(s => s.studentId === e.target.value);
                if (found) onSelectStudent(found);
              }}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              {students.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.fullName} ({s.studentId}) - {s.program}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-3">
            <span>
              Outstanding: <strong className={selectedStudent.outstandingBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                ${selectedStudent.outstandingBalance.toFixed(2)}
              </strong>
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              selectedStudent.status === 'CLEARED'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {selectedStudent.status}
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
