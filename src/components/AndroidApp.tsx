import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  QrCode, 
  Download, 
  Share2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  Battery, 
  Signal, 
  Smartphone, 
  Home, 
  Bell, 
  Settings, 
  Search, 
  Filter, 
  RotateCcw, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  ArrowLeft, 
  Send, 
  Sparkles, 
  Zap, 
  MessageSquare, 
  Printer, 
  Eye, 
  Upload, 
  FileText, 
  User, 
  Building2, 
  Layers, 
  RefreshCw, 
  Lock, 
  Check, 
  DollarSign, 
  SlidersHorizontal,
  Cloud,
  FileSpreadsheet,
  Trash2,
  Edit3,
  Github,
  Focus,
  History
} from 'lucide-react';
import { ReceiptData, StudentAccount, NotificationPayload, AuditLogEntry } from '../types';
import { SAMPLE_RECEIPTS, PreloadedSampleReceipt } from '../data/sampleReceipts';
import { computeSHA256 } from '../utils/crypto';

interface AndroidAppProps {
  students: StudentAccount[];
  selectedStudent: StudentAccount;
  onSelectStudent: (student: StudentAccount) => void;
  receipts: ReceiptData[];
  onCommitReceipt: (receipt: ReceiptData) => Promise<void>;
  onInspectReceipt: (receipt: ReceiptData) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  offlineQueueCount: number;
  onSyncOfflineQueue: () => Promise<void>;
  isSyncing: boolean;
  notifications: NotificationPayload[];
  onDispatchNotification: (payload: Omit<NotificationPayload, 'id' | 'sentAt' | 'status'>) => void;
  onSwitchToWebDashboard: () => void;
  viewMode: 'DEVICE_SHELL' | 'FULL_SCREEN';
  onToggleViewMode: () => void;
  onOpenGitHubBuildModal?: () => void;
}

export const AndroidApp: React.FC<AndroidAppProps> = ({
  students,
  selectedStudent,
  onSelectStudent,
  receipts,
  onCommitReceipt,
  onInspectReceipt,
  isOffline,
  onToggleOffline,
  offlineQueueCount,
  onSyncOfflineQueue,
  isSyncing,
  notifications,
  onDispatchNotification,
  onSwitchToWebDashboard,
  viewMode,
  onToggleViewMode,
  onOpenGitHubBuildModal,
}) => {
  // Mobile App Navigation Tab: HOME | SCAN | VAULT | ALERTS | SETTINGS
  const [activeTab, setActiveTab] = useState<'HOME' | 'SCAN' | 'VAULT' | 'ALERTS' | 'SETTINGS'>('HOME');
  
  // Android System Overlays
  const [isNotificationShadeOpen, setIsNotificationShadeOpen] = useState<boolean>(false);
  const [isRecentsOpen, setIsRecentsOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [selectedReceiptDetail, setSelectedReceiptDetail] = useState<ReceiptData | null>(null);
  const [showStudentPicker, setShowStudentPicker] = useState<boolean>(false);

  // Quick Settings states
  const [flashlightOn, setFlashlightOn] = useState<boolean>(false);
  const [batterySaver, setBatterySaver] = useState<boolean>(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(true);
  const [cameraResolution, setCameraResolution] = useState<'1080P' | '4K_UHD'>('4K_UHD');

  // Scanner Tab States
  const [selectedSample, setSelectedSample] = useState<PreloadedSampleReceipt>(SAMPLE_RECEIPTS[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStep, setScanStep] = useState<string>('');
  const [scannedResult, setScannedResult] = useState<ReceiptData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulated Auto-Focus State for Camera Viewfinder
  const [autoFocus, setAutoFocus] = useState<{
    isActive: boolean;
    status: 'HUNTING' | 'LOCKED' | 'IDLE';
    x: number; // percentage (0-100)
    y: number; // percentage (0-100)
    key: number;
    sharpness: number;
  }>({
    isActive: false,
    status: 'IDLE',
    x: 50,
    y: 50,
    key: 0,
    sharpness: 99.4,
  });

  const afTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const afLockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAutoFocus = useCallback((targetX = 50, targetY = 50) => {
    if (afTimeoutRef.current) clearTimeout(afTimeoutRef.current);
    if (afLockTimeoutRef.current) clearTimeout(afLockTimeoutRef.current);

    const sharpnessScore = +(98.9 + Math.random() * 0.9).toFixed(1);

    // Step 1: Start Hunting/Pulsing at target position
    setAutoFocus({
      isActive: true,
      status: 'HUNTING',
      x: Math.max(15, Math.min(85, targetX)),
      y: Math.max(15, Math.min(85, targetY)),
      key: Date.now(),
      sharpness: sharpnessScore,
    });

    // Step 2: Lock focus after 550ms
    afTimeoutRef.current = setTimeout(() => {
      setAutoFocus(prev => ({
        ...prev,
        status: 'LOCKED',
      }));

      // Step 3: Transition to subtle IDLE/standby after 1600ms
      afLockTimeoutRef.current = setTimeout(() => {
        setAutoFocus(prev => ({
          ...prev,
          status: 'IDLE',
        }));
      }, 1600);
    }, 550);
  }, []);

  // Trigger simulated auto-focus pulse-centering when camera starts (activeTab becomes 'SCAN')
  useEffect(() => {
    if (activeTab === 'SCAN') {
      const t = setTimeout(() => {
        triggerAutoFocus(50, 50);
      }, 150);
      return () => clearTimeout(t);
    } else {
      if (afTimeoutRef.current) clearTimeout(afTimeoutRef.current);
      if (afLockTimeoutRef.current) clearTimeout(afLockTimeoutRef.current);
      setAutoFocus(prev => ({ ...prev, isActive: false, status: 'IDLE' }));
    }
  }, [activeTab, triggerAutoFocus]);

  // Also trigger auto-focus pulse when switching receipt sample or uploading photo while in SCAN tab
  useEffect(() => {
    if (activeTab === 'SCAN') {
      triggerAutoFocus(50, 50);
    }
  }, [selectedSample, uploadedImage, triggerAutoFocus]);

  // Handle tap-to-focus on camera viewfinder
  const handleViewfinderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;
    triggerAutoFocus(clickX, clickY);
  };

  // Vault Tab States
  const [vaultSearch, setVaultSearch] = useState<string>('');
  const [vaultFilter, setVaultFilter] = useState<'ALL' | 'RECONCILED' | 'PENDING' | 'FLAGGED'>('ALL');

  // WhatsApp Alert Form
  const [customAlertMsg, setCustomAlertMsg] = useState<string>('');
  const [sendingAlert, setSendingAlert] = useState<boolean>(false);

  // Time display
  const [currentTime, setCurrentTime] = useState<string>('10:24');
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const h = d.getHours().toString().padStart(2, '0');
      const m = d.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filtered receipts for selected student
  const studentReceipts = receipts.filter(
    r => r.studentId.toUpperCase() === selectedStudent.studentId.toUpperCase()
  );

  const isCleared = selectedStudent.outstandingBalance <= 0;

  // Handle Photo / File Pick for Scanner
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Run Android OCR Scan Simulation
  const handleStartScan = async () => {
    // Micro auto-focus pulse lock before OCR laser initiates
    triggerAutoFocus(50, 50);
    await new Promise(r => setTimeout(r, 400));

    setIsScanning(true);
    setScanProgress(10);
    setScanStep('Aligning Optical Frame & Enhancing Contrast...');
    setScannedResult(null);

    await new Promise(r => setTimeout(r, 600));
    setScanProgress(35);
    setScanStep('Reading Micro-Characters (MICR & Ref ID)...');

    await new Promise(r => setTimeout(r, 700));
    setScanProgress(65);
    setScanStep('Authenticating Bank Teller Stamp & Watermark...');

    await new Promise(r => setTimeout(r, 600));
    setScanProgress(90);
    setScanStep('Validating with Interbank Gateway Switch...');

    await new Promise(r => setTimeout(r, 500));
    setScanProgress(100);
    setScanStep('OCR Extraction Complete (Confidence: 99.4%)');

    const sample = selectedSample;
    const finalReceipt: ReceiptData = {
      id: `REC-${Date.now().toString(36).toUpperCase()}`,
      studentId: selectedStudent.studentId,
      studentName: selectedStudent.fullName,
      studentEmail: selectedStudent.email,
      studentPhone: selectedStudent.phone,
      bankName: sample.bankName,
      bankBranch: 'Main Campus Branch',
      transactionRef: sample.transactionRef,
      paymentDate: sample.dateStr,
      amount: sample.amount,
      currency: sample.currency,
      academicSession: '2024/2025',
      semester: 'First Semester',
      tellerStampDetected: true,
      tellerSignaturePresent: true,
      ocrConfidenceScore: 99,
      receiptImageUrl: uploadedImage || sample.svgDataUri,
      projectCategories: sample.projectAllocations.map(p => ({
        id: `cat-${p.code}`,
        code: p.code,
        name: p.name,
        allocatedAmount: p.amount,
        department: p.department,
        percentage: p.percentage,
      })),
      bankValidation: {
        isValid: true,
        bankMatchStatus: 'MATCH_VERIFIED',
        settlementRef: `IB-SETTLE-${sample.transactionRef}-99`,
        clearingBank: sample.bankName,
        clearedAmount: sample.amount,
        clearedTimestamp: new Date().toISOString(),
        message: 'Settlement confirmed by Interbank Automated Clearing House.',
        interbankSwitchCode: 'SWIFT-CAMPUS-NG-24',
      },
      reconciliationStatus: 'RECONCILED',
      auditChecksum: await computeSHA256(`SLIP-${sample.transactionRef}-${sample.amount}-${Date.now()}`),
      isEncryptedInCloud: !isOffline,
      cloudStoragePath: `s3://univ-bursary-encrypted-vault-2025/receipts/2024_2025/${selectedStudent.studentId}_${sample.transactionRef}.enc.aes256`,
      syncStatus: isOffline ? 'OFFLINE_PENDING' : 'SYNCED',
      createdAt: new Date().toISOString(),
      verifiedBy: 'UniAudit Android Mobile Scanner v2.4',
    };

    setScannedResult(finalReceipt);
    setIsScanning(false);
  };

  // Commit Scanned Receipt
  const handleConfirmAndCommit = async () => {
    if (!scannedResult) return;
    await onCommitReceipt(scannedResult);
    setScannedResult(null);
    setUploadedImage(null);
    setActiveTab('HOME');
  };

  // Android Back Button Handler
  const handleAndroidBack = () => {
    if (isNotificationShadeOpen) {
      setIsNotificationShadeOpen(false);
      return;
    }
    if (isRecentsOpen) {
      setIsRecentsOpen(false);
      return;
    }
    if (isQrModalOpen) {
      setIsQrModalOpen(false);
      return;
    }
    if (selectedReceiptDetail) {
      setSelectedReceiptDetail(null);
      return;
    }
    if (scannedResult) {
      setScannedResult(null);
      return;
    }
    if (activeTab !== 'HOME') {
      setActiveTab('HOME');
      return;
    }
  };

  // Android Home Button Handler
  const handleAndroidHome = () => {
    setIsNotificationShadeOpen(false);
    setIsRecentsOpen(false);
    setIsQrModalOpen(false);
    setSelectedReceiptDetail(null);
    setScannedResult(null);
    setActiveTab('HOME');
  };

  // Vault filtered list
  const filteredVault = receipts.filter(r => {
    const matchSearch = 
      r.studentName.toLowerCase().includes(vaultSearch.toLowerCase()) ||
      r.studentId.toLowerCase().includes(vaultSearch.toLowerCase()) ||
      r.transactionRef.toLowerCase().includes(vaultSearch.toLowerCase()) ||
      r.bankName.toLowerCase().includes(vaultSearch.toLowerCase());
    
    if (!matchSearch) return false;
    if (vaultFilter === 'RECONCILED') return r.reconciliationStatus === 'RECONCILED';
    if (vaultFilter === 'PENDING') return r.reconciliationStatus === 'PENDING_AUDIT';
    if (vaultFilter === 'FLAGGED') return r.reconciliationStatus === 'FLAGGED_DISCREPANCY';
    return true;
  });

  return (
    <div className={`flex flex-col items-center justify-center ${
      viewMode === 'FULL_SCREEN' 
        ? 'w-full min-h-screen bg-slate-950 p-0' 
        : 'py-6 px-4 min-h-[calc(100vh-4rem)] bg-slate-950/95'
    }`}>

      {/* Top Controls Bar: Viewport mode & Web Dashboard link */}
      <div className="mb-3 w-full max-w-[430px] flex items-center justify-between px-2 text-xs font-semibold text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1 text-emerald-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Android 15 (Pixel 9 Pro)</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="btn-toggle-viewmode"
            onClick={onToggleViewMode}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition text-[11px]"
            title="Toggle between Edge-to-Edge and Phone Shell"
          >
            {viewMode === 'FULL_SCREEN' ? 'Show Phone Shell' : 'Edge-to-Edge'}
          </button>

          <button
            id="btn-nav-to-web-dashboard"
            onClick={onSwitchToWebDashboard}
            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition text-[11px] shadow-sm flex items-center space-x-1"
            title="Open Bursary Desktop Web Dashboard"
          >
            <span>Web Dashboard</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Hardware Shell (Only if DEVICE_SHELL) */}
      <div className={`relative w-full ${
        viewMode === 'FULL_SCREEN' 
          ? 'max-w-none h-screen rounded-none p-0 border-0' 
          : 'max-w-[420px] bg-black rounded-[50px] p-3 shadow-2xl border-4 border-slate-800 shadow-emerald-950/20'
      }`}>

        {/* Screen Container */}
        <div className={`relative bg-slate-100 flex flex-col overflow-hidden select-none ${
          viewMode === 'FULL_SCREEN' 
            ? 'h-screen rounded-none' 
            : 'h-[820px] rounded-[42px] shadow-inner'
        }`}>

          {/* Android Status Bar (Clickable to pull down Notification Shade) */}
          <div 
            onClick={() => setIsNotificationShadeOpen(!isNotificationShadeOpen)}
            className="h-9 bg-slate-950 text-white px-5 flex items-center justify-between text-xs z-40 shrink-0 cursor-pointer border-b border-slate-900 active:bg-slate-900 transition"
            title="Tap to pull down Android Notification Shade"
          >
            <span className="font-semibold text-[11px] tracking-tight font-mono text-slate-200">
              {currentTime}
            </span>

            {/* Android Camera Punch Hole */}
            <div className="w-3.5 h-3.5 bg-black rounded-full ring-1 ring-slate-800 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-slate-900" />
            </div>

            <div className="flex items-center space-x-1.5 text-slate-300">
              {offlineQueueCount > 0 && (
                <span className="text-[9px] font-mono px-1 rounded bg-amber-500/20 text-amber-300">
                  {offlineQueueCount} queued
                </span>
              )}
              {flashlightOn && (
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              )}
              <span className="text-[10px] font-bold text-emerald-400 font-mono">5G</span>
              <Signal className="w-3 h-3" />
              {isOffline ? (
                <WifiOff className="w-3 h-3 text-amber-400" />
              ) : (
                <Wifi className="w-3 h-3 text-emerald-400" />
              )}
              <div className="flex items-center space-x-0.5">
                <span className="text-[9px] font-mono">98%</span>
                <Battery className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>

          {/* Android Top App Bar */}
          <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between z-30 shrink-0 border-b border-slate-800 shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xs font-bold tracking-tight leading-none text-slate-100">
                  UniAudit Mobile
                </h1>
                <p className="text-[9px] text-emerald-400 font-mono mt-0.5">
                  Bursary Field Terminal • APK v2.4
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Student Switcher Chip */}
              <button
                id="btn-mobile-student-picker"
                onClick={() => setShowStudentPicker(!showStudentPicker)}
                className="px-2 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono font-bold flex items-center space-x-1 border border-slate-700"
                title="Switch Active Enrolled Student"
              >
                <User className="w-3 h-3 text-purple-400" />
                <span className="truncate max-w-[80px]">{selectedStudent.studentId}</span>
              </button>

              {/* Notification Bell Badge */}
              <button
                id="btn-mobile-alerts-header"
                onClick={() => setActiveTab('ALERTS')}
                className="p-1 rounded-lg text-slate-300 hover:text-white relative"
                title="View WhatsApp Alerts"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                )}
              </button>
            </div>
          </div>

          {/* Student Picker Dropdown Sheet */}
          {showStudentPicker && (
            <div className="bg-slate-900 border-b border-slate-800 p-3 z-30 animate-in slide-in-from-top duration-150 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-300">
                  Select Enrolled Student Account:
                </span>
                <button
                  onClick={() => setShowStudentPicker(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                {students.map(s => (
                  <button
                    key={s.studentId}
                    onClick={() => {
                      onSelectStudent(s);
                      setShowStudentPicker(false);
                    }}
                    className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between transition ${
                      selectedStudent.studentId === s.studentId
                        ? 'bg-purple-950/80 text-purple-200 border border-purple-500/50'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[11px]">{s.fullName}</div>
                      <div className="font-mono text-[9px] text-slate-400">{s.studentId} • {s.faculty}</div>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      s.status === 'CLEARED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {s.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pull-down Android Notification Shade / Quick Settings */}
          {isNotificationShadeOpen && (
            <div className="absolute inset-x-0 top-9 bottom-0 bg-slate-950/95 backdrop-blur-md z-50 p-4 flex flex-col text-left text-white animate-in slide-in-from-top-6 duration-200 overflow-y-auto">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="text-xl font-bold font-mono text-slate-100">{currentTime}</div>
                  <div className="text-xs text-slate-400 font-medium">Monday, September 14, 2026</div>
                </div>
                <button
                  onClick={() => setIsNotificationShadeOpen(false)}
                  className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Settings Grid */}
              <div className="grid grid-cols-4 gap-2 my-4">
                
                {/* Wi-Fi */}
                <button
                  onClick={onToggleOffline}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center space-y-1 text-center transition ${
                    !isOffline ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {!isOffline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                  <span className="text-[10px] font-bold">{!isOffline ? 'Campus Wi-Fi' : 'Offline'}</span>
                </button>

                {/* Torch / Flashlight */}
                <button
                  onClick={() => setFlashlightOn(!flashlightOn)}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center space-y-1 text-center transition ${
                    flashlightOn ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Zap className={`w-5 h-5 ${flashlightOn ? 'fill-current' : ''}`} />
                  <span className="text-[10px] font-bold">{flashlightOn ? 'Torch ON' : 'Flashlight'}</span>
                </button>

                {/* Battery Saver */}
                <button
                  onClick={() => setBatterySaver(!batterySaver)}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center space-y-1 text-center transition ${
                    batterySaver ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Battery className="w-5 h-5" />
                  <span className="text-[10px] font-bold">98% Save</span>
                </button>

                {/* Biometrics */}
                <button
                  onClick={() => setBiometricsEnabled(!biometricsEnabled)}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center space-y-1 text-center transition ${
                    biometricsEnabled ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  <span className="text-[10px] font-bold">Biometrics</span>
                </button>

              </div>

              {/* Sync Action if offline receipts queued */}
              {offlineQueueCount > 0 && (
                <div className="p-3 bg-blue-950/80 border border-blue-600/50 rounded-xl mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cloud className="w-5 h-5 text-blue-400 animate-pulse" />
                    <div>
                      <div className="text-xs font-bold text-blue-200">
                        {offlineQueueCount} Receipts Staged in Local SQLite
                      </div>
                      <div className="text-[10px] text-blue-300">
                        Pending automatic upload to Cloud Vault
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onSyncOfflineQueue();
                      setIsNotificationShadeOpen(false);
                    }}
                    disabled={isOffline || isSyncing}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow transition"
                  >
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>
              )}

              {/* Android Notification Feed */}
              <div className="flex-1 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Notifications</span>
                  <span className="text-[10px] font-normal text-slate-500">Material 3 Notification Hub</span>
                </div>

                {notifications.slice(0, 5).map(n => (
                  <div 
                    key={n.id}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1 shadow-xs hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp • {n.channel}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(n.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-xs text-slate-200 font-medium line-clamp-2">
                      {n.message}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <span>To: {n.studentPhone || n.studentEmail}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">DELIVERED ✓✓</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Close Shade Button */}
              <div className="pt-3 border-t border-slate-800 mt-3 flex justify-center">
                <button
                  onClick={() => setIsNotificationShadeOpen(false)}
                  className="px-5 py-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
                >
                  Close Notification Drawer
                </button>
              </div>

            </div>
          )}

          {/* Android Recents / Multitasking Switcher Overlay */}
          {isRecentsOpen && (
            <div className="absolute inset-x-0 top-9 bottom-12 bg-slate-950/95 backdrop-blur-md z-40 p-4 flex flex-col justify-between text-left text-white animate-in zoom-in-95 duration-150">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">Android Recent Tasks</span>
                </div>
                <button
                  onClick={() => setIsRecentsOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Task Cards Carousel */}
              <div className="my-auto space-y-3">
                {/* Card 1: Camera Scanner */}
                <div 
                  onClick={() => { setActiveTab('SCAN'); setIsRecentsOpen(false); }}
                  className="p-3.5 bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-2xl shadow-xl cursor-pointer transition transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center space-x-2 mb-1.5">
                    <div className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center text-white">
                      <Camera className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-slate-100">UniAudit Optical Scanner</span>
                  </div>
                  <div className="h-20 bg-slate-950 rounded-lg p-2 border border-slate-800 flex items-center justify-center text-xs text-slate-400">
                    Active Viewfinder • Ready to scan bank teller stamps
                  </div>
                </div>

                {/* Card 2: Tuition Pass */}
                <div 
                  onClick={() => { setActiveTab('HOME'); setIsRecentsOpen(false); }}
                  className="p-3.5 bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-2xl shadow-xl cursor-pointer transition transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center space-x-2 mb-1.5">
                    <div className="w-5 h-5 rounded bg-purple-600 flex items-center justify-center text-white">
                      <QrCode className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-slate-100">Digital Examination Clearance Pass</span>
                  </div>
                  <div className="h-20 bg-slate-950 rounded-lg p-2 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div>
                      <div className="font-bold text-white">{selectedStudent.fullName}</div>
                      <div className="font-mono text-[10px] text-purple-300">{selectedStudent.studentId}</div>
                    </div>
                    <div className="font-mono font-bold text-emerald-400 text-sm">
                      ${selectedStudent.totalPaid.toFixed(2)} Paid
                    </div>
                  </div>
                </div>

                {/* Card 3: Web Dashboard */}
                <div 
                  onClick={() => { setIsRecentsOpen(false); onSwitchToWebDashboard(); }}
                  className="p-3.5 bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-2xl shadow-xl cursor-pointer transition transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center space-x-2 mb-1.5">
                    <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white">
                      <Building2 className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-slate-100">Bursary Management Web Suite</span>
                  </div>
                  <div className="h-16 bg-slate-950 rounded-lg p-2 border border-slate-800 flex items-center justify-center text-xs text-indigo-300 font-bold">
                    Full CRUD Ledger, Search &amp; Quality Telemetry
                  </div>
                </div>
              </div>

              {/* Clear All Tasks */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => { setActiveTab('HOME'); setIsRecentsOpen(false); }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setActiveTab('HOME'); setIsRecentsOpen(false); }}
                  className="px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                >
                  Clear All
                </button>
              </div>

            </div>
          )}

          {/* MAIN SCROLLABLE APP BODY BY TAB */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-left">
            
            {/* ========================================================= */}
            {/* TAB 1: HOME (Student ID & Digital Exam Clearance Pass)   */}
            {/* ========================================================= */}
            {activeTab === 'HOME' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Digital Student ID & Exam Pass Card */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-4 rounded-2xl border border-slate-700/80 shadow-lg relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-purple-300">
                        Official Exam Clearance Pass
                      </div>
                      <h2 className="text-base font-bold text-white mt-0.5">
                        {selectedStudent.fullName}
                      </h2>
                      <div className="font-mono text-xs text-slate-300 mt-0.5">
                        {selectedStudent.studentId}
                      </div>
                    </div>

                    {/* QR Code trigger */}
                    <button
                      id="btn-open-student-qr"
                      onClick={() => setIsQrModalOpen(true)}
                      className="p-1.5 bg-white text-slate-900 rounded-xl shadow hover:bg-slate-100 transition flex flex-col items-center"
                      title="Enlarge Exam Hall Scannable QR Pass"
                    >
                      <QrCode className="w-8 h-8" />
                      <span className="text-[8px] font-bold mt-0.5">PASS QR</span>
                    </button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[9px] text-slate-400">Faculty &amp; Department</div>
                      <div className="font-semibold text-slate-200 text-[11px] truncate max-w-[170px]">
                        {selectedStudent.faculty}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] text-slate-400 text-right">Hall Eligibility</div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCleared
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-amber-500 text-slate-950 font-black'
                      }`}>
                        {selectedStudent.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Balance Summary Card */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      2024/2025 Tuition Assessment
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      Harmattan Term
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-500">Total Billed</div>
                      <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
                        ${selectedStudent.totalTuitionBilled.toFixed(2)}
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                      <div className="text-[10px] text-emerald-700">Reconciled</div>
                      <div className="text-xs font-bold font-mono text-emerald-700 mt-0.5">
                        ${selectedStudent.totalPaid.toFixed(2)}
                      </div>
                    </div>

                    <div className={`p-2 rounded-xl border ${
                      isCleared ? 'bg-slate-50 border-slate-100' : 'bg-rose-50 border-rose-100'
                    }`}>
                      <div className="text-[10px] text-slate-500">Outstanding</div>
                      <div className={`text-xs font-bold font-mono mt-0.5 ${
                        isCleared ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        ${selectedStudent.outstandingBalance.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-semibold mb-1">
                      <span>Fee Settlement Progress</span>
                      <span>
                        {Math.min(100, Math.round((selectedStudent.totalPaid / (selectedStudent.totalTuitionBilled || 1)) * 100))}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min(100, (selectedStudent.totalPaid / (selectedStudent.totalTuitionBilled || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    id="btn-home-quick-scan"
                    onClick={() => setActiveTab('SCAN')}
                    className="p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-md font-bold flex flex-col items-center justify-center space-y-1 transition active:scale-98"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-xs">Scan Bank Slip</span>
                    <span className="text-[9px] text-emerald-100 font-normal">On-Device OCR &amp; Laser</span>
                  </button>

                  <button
                    id="btn-home-quick-vault"
                    onClick={() => setActiveTab('VAULT')}
                    className="p-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-md font-bold flex flex-col items-center justify-center space-y-1 transition active:scale-98"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-xs">Receipt Wallet</span>
                    <span className="text-[9px] text-indigo-100 font-normal">
                      {studentReceipts.length} Slips Reconciled
                    </span>
                  </button>
                </div>

                {/* Recent Verified Receipts for Student */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Recent Bank Ingestions</span>
                    <button
                      onClick={() => setActiveTab('VAULT')}
                      className="text-indigo-600 hover:text-indigo-800 text-[11px]"
                    >
                      View all ({receipts.length})
                    </button>
                  </div>

                  {studentReceipts.length === 0 ? (
                    <div className="p-4 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                      No receipts logged yet for this student. Tap <strong>Scan Bank Slip</strong> to ingest a teller voucher.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {studentReceipts.slice(0, 3).map(r => (
                        <div
                          key={r.id}
                          onClick={() => setSelectedReceiptDetail(r)}
                          className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs hover:border-emerald-300 transition cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200">
                              {r.bankName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900">{r.bankName}</div>
                              <div className="font-mono text-[10px] text-slate-500">Ref: {r.transactionRef}</div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-emerald-700">
                              +${r.amount.toFixed(2)}
                            </div>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-800">
                              {r.reconciliationStatus}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: SCANNER (Android Camera & OCR Optical Engine)     */}
            {/* ========================================================= */}
            {activeTab === 'SCAN' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                
                {/* Camera Viewfinder Box */}
                <div 
                  id="android-camera-viewfinder"
                  onClick={handleViewfinderClick}
                  className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl aspect-4/3 flex flex-col items-center justify-center text-white cursor-crosshair select-none group"
                  title="Tap anywhere on slip to auto-focus"
                >
                  
                  {/* Viewfinder background preview with optical lens focusing blur transition */}
                  <img
                    src={uploadedImage || selectedSample.svgDataUri}
                    alt="Bank Deposit Slip Viewfinder"
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      autoFocus.status === 'HUNTING' ? 'blur-[1.5px] scale-[1.01] opacity-75' : 'blur-0 scale-100 opacity-85'
                    }`}
                  />

                  {/* Simulated Auto-Focus Animation Overlay that pulse-centers when camera starts or when tapped */}
                  {autoFocus.isActive && (
                    <div 
                      key={`af-container-${autoFocus.key}`}
                      className="absolute inset-0 pointer-events-none z-30 overflow-hidden"
                    >
                      {/* Pulse Ring (expanding wave) */}
                      <div 
                        className="absolute w-28 h-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/60 animate-af-ping pointer-events-none"
                        style={{ left: `${autoFocus.x}%`, top: `${autoFocus.y}%` }}
                      />

                      {/* Main Auto-Focus Reticle */}
                      <div 
                        className={`absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                          autoFocus.status === 'HUNTING' 
                            ? 'w-20 h-20 animate-af-contract' 
                            : autoFocus.status === 'LOCKED'
                              ? 'w-16 h-16 animate-af-lock'
                              : 'w-14 h-14 opacity-35'
                        }`}
                        style={{ left: `${autoFocus.x}%`, top: `${autoFocus.y}%` }}
                      >
                        <div className={`w-full h-full relative rounded-lg border transition-all duration-200 ${
                          autoFocus.status === 'LOCKED'
                            ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(52,211,153,0.5)]'
                            : autoFocus.status === 'HUNTING'
                              ? 'border-amber-300/90 bg-amber-400/5 shadow-[0_0_10px_rgba(251,191,36,0.35)]'
                              : 'border-white/30'
                        }`}>
                          {/* 4 Corner Bracket Accents */}
                          <div className={`absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 transition-colors duration-200 ${
                            autoFocus.status === 'LOCKED' ? 'border-emerald-300' : 'border-amber-300'
                          }`} />
                          <div className={`absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 transition-colors duration-200 ${
                            autoFocus.status === 'LOCKED' ? 'border-emerald-300' : 'border-amber-300'
                          }`} />
                          <div className={`absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 transition-colors duration-200 ${
                            autoFocus.status === 'LOCKED' ? 'border-emerald-300' : 'border-amber-300'
                          }`} />
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 transition-colors duration-200 ${
                            autoFocus.status === 'LOCKED' ? 'border-emerald-300' : 'border-amber-300'
                          }`} />

                          {/* Center Optical Crosshair & Focal Pip */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`w-3.5 h-[1.5px] rounded transition-colors duration-200 ${
                              autoFocus.status === 'LOCKED' ? 'bg-emerald-300' : 'bg-amber-300/80'
                            }`} />
                            <div className={`h-3.5 w-[1.5px] rounded absolute transition-colors duration-200 ${
                              autoFocus.status === 'LOCKED' ? 'bg-emerald-300' : 'bg-amber-300/80'
                            }`} />
                            <div className={`w-1.5 h-1.5 rounded-full absolute transition-all duration-200 ${
                              autoFocus.status === 'LOCKED' 
                                ? 'bg-emerald-300 ring-2 ring-emerald-400/80 shadow-[0_0_8px_#34d399]' 
                                : 'bg-amber-400 animate-ping'
                            }`} />
                          </div>

                          {/* Status Badge above reticle */}
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            {autoFocus.status === 'HUNTING' && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-950/90 text-amber-300 font-mono text-[9px] font-bold border border-amber-400/60 shadow flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                <span>AF HUNTING...</span>
                              </span>
                            )}
                            {autoFocus.status === 'LOCKED' && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-950/90 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-400 shadow flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span>AF LOCKED [{autoFocus.sharpness}%]</span>
                              </span>
                            )}
                          </div>

                          {/* Optical info below reticle when locked */}
                          {autoFocus.status === 'LOCKED' && (
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                              <span className="px-1.5 py-0.2 rounded bg-slate-950/80 text-emerald-400 font-mono text-[8px] font-medium border border-emerald-500/30">
                                26mm • f/1.8 • ISO 100
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Laser Scan Line when scanning */}
                  {isScanning && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400/80 animate-bounce z-20" />
                  )}

                  {/* Camera Corner Brackets */}
                  <div className="absolute inset-4 pointer-events-none z-10">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-emerald-400" />
                  </div>

                  {/* Flashlight simulated glare */}
                  {flashlightOn && (
                    <div className="absolute inset-0 bg-white/10 backdrop-brightness-125 pointer-events-none z-10" />
                  )}

                  {/* Viewfinder Overlays */}
                  <div className="absolute top-2 left-2 z-20 flex items-center space-x-1.5">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-900/80 text-emerald-300 border border-emerald-500/50">
                      {cameraResolution} • OCR ACTIVE
                    </span>
                    {flashlightOn && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold">
                        FLASH ON
                      </span>
                    )}
                  </div>

                  {/* Viewfinder Controls & Telemetry (Top Right) */}
                  <div className="absolute top-2 right-2 z-20 flex items-center space-x-1.5">
                    <button
                      id="btn-refocus-viewfinder"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerAutoFocus(50, 50);
                      }}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border transition flex items-center space-x-1 shadow-sm ${
                        autoFocus.status === 'LOCKED'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                          : autoFocus.status === 'HUNTING'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-500/50 animate-pulse'
                            : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                      title="Tap to trigger auto-focus pulse"
                    >
                      <Focus className="w-3 h-3" />
                      <span>{autoFocus.status === 'HUNTING' ? 'FOCUSING' : 'AF-C'}</span>
                    </button>
                  </div>

                  <div className="absolute bottom-2 left-2 z-20 text-[10px] font-mono bg-slate-900/80 px-2 py-0.5 rounded text-slate-300">
                    {selectedSample.bankName} • ${selectedSample.amount.toFixed(2)}
                  </div>

                  {/* Tap to focus hint on bottom right */}
                  <div className="absolute bottom-2 right-2 z-20 text-[9px] font-mono bg-slate-900/80 px-2 py-0.5 rounded text-slate-400 pointer-events-none opacity-80">
                    Tap slip to focus
                  </div>
                </div>

                {/* Progress bar during scanning */}
                {isScanning && (
                  <div className="p-3 bg-slate-900 rounded-xl text-white space-y-1.5 border border-emerald-500/40">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-emerald-400 font-bold">{scanStep}</span>
                      <span>{scanProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Scanned Result Confirmation Card */}
                {scannedResult && !isScanning && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 animate-in slide-in-from-bottom-2 text-xs">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Optical Character Extraction Succeeded!</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 font-mono">
                      <div>Bank: <strong>{scannedResult.bankName}</strong></div>
                      <div>Ref: <strong>{scannedResult.transactionRef}</strong></div>
                      <div>Amount: <strong className="text-emerald-700">${scannedResult.amount.toFixed(2)}</strong></div>
                      <div>Confidence: <strong className="text-indigo-600">99.4% Match</strong></div>
                    </div>
                    <div className="pt-2 flex space-x-2">
                      <button
                        onClick={() => setScannedResult(null)}
                        className="flex-1 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold"
                      >
                        Retake
                      </button>
                      <button
                        id="btn-confirm-commit-slip"
                        onClick={handleConfirmAndCommit}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow"
                      >
                        Commit to Ledger
                      </button>
                    </div>
                  </div>
                )}

                {/* Camera Shutter & Pickers */}
                {!scannedResult && (
                  <div className="space-y-2.5">
                    {/* Shutter Button */}
                    <div className="flex items-center justify-center py-1">
                      <button
                        id="btn-android-camera-shutter"
                        disabled={isScanning}
                        onClick={handleStartScan}
                        className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white flex items-center justify-center shadow-lg ring-4 ring-emerald-200 transition active:scale-95"
                        title="Trigger Android Optical Scan"
                      >
                        <Camera className="w-7 h-7" />
                      </button>
                    </div>

                    <div className="text-center text-[10px] text-slate-500 font-medium">
                      Tap Shutter to execute OCR parsing &amp; Interbank validation
                    </div>

                    {/* Choose Bank Deposit Slip Preset */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Select Real Bank Slip Sample:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {SAMPLE_RECEIPTS.map(s => (
                          <button
                            key={s.id}
                            onClick={() => {
                              setSelectedSample(s);
                              setUploadedImage(null);
                              setScannedResult(null);
                            }}
                            className={`p-2 rounded-xl text-left border text-[10px] transition ${
                              selectedSample.id === s.id && !uploadedImage
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="truncate">{s.bankName}</div>
                            <div className="text-[9px] text-slate-500 font-mono">${s.amount.toFixed(2)} • {s.transactionRef}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Or Upload actual file from Phone */}
                    <div className="pt-1 flex items-center justify-between">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border border-slate-300"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose Photo from Device Storage</span>
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* RECENT SCANS MINI-GALLERY WIDGET (Last 3 Captures)        */}
                {/* Quick preview before final audit approval                 */}
                {/* ========================================================= */}
                {(() => {
                  const recentScans = [...receipts]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 3);

                  return (
                    <div 
                      id="android-recent-scans-widget"
                      className="p-3 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-2.5 mt-1"
                    >
                      {/* Widget Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                            <History className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <h4 className="text-xs font-bold text-slate-900">Recent Scans</h4>
                              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold">
                                Last 3 Captures
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500">
                              Quick preview before final audit approval
                            </p>
                          </div>
                        </div>

                        <button
                          id="btn-recent-scans-view-vault"
                          onClick={() => setActiveTab('VAULT')}
                          className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center space-x-0.5 transition"
                          title="View all receipts in Vault"
                        >
                          <span>Vault ({receipts.length})</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* 3-Card Mini-Gallery Grid */}
                      {recentScans.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {recentScans.map((item, idx) => {
                            const statusBadge = item.reconciliationStatus === 'RECONCILED'
                              ? { label: 'Reconciled', bg: 'bg-emerald-600/90 text-white', icon: CheckCircle2 }
                              : item.reconciliationStatus === 'FLAGGED_DISCREPANCY'
                                ? { label: 'Flagged', bg: 'bg-rose-600/90 text-white', icon: AlertTriangle }
                                : { label: 'Pending', bg: 'bg-amber-600/90 text-white', icon: Clock };

                            const BadgeIcon = statusBadge.icon;

                            return (
                              <div
                                key={item.id || idx}
                                id={`recent-scan-card-${idx}`}
                                onClick={() => setSelectedReceiptDetail(item)}
                                className="bg-slate-50 hover:bg-slate-100/90 rounded-xl border border-slate-200 overflow-hidden cursor-pointer transition-all duration-150 hover:shadow-sm hover:border-emerald-400 flex flex-col text-left group"
                                title="Tap for Quick Preview"
                              >
                                {/* Thumbnail Image */}
                                <div className="aspect-4/3 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                                  {item.receiptImageUrl ? (
                                    <img
                                      src={item.receiptImageUrl}
                                      alt={`Scan #${item.transactionRef}`}
                                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200 opacity-90 group-hover:opacity-100"
                                    />
                                  ) : (
                                    <FileText className="w-6 h-6 text-slate-600" />
                                  )}

                                  {/* Status Badge floating on top */}
                                  <div className="absolute top-1 left-1 z-10">
                                    <span className={`px-1 py-0.2 rounded text-[8px] font-bold tracking-tight shadow-xs flex items-center space-x-0.5 ${statusBadge.bg}`}>
                                      <BadgeIcon className="w-2 h-2 shrink-0" />
                                      <span className="truncate max-w-[42px]">{statusBadge.label}</span>
                                    </span>
                                  </div>

                                  {/* Hover/Tap Quick Preview Eye */}
                                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="px-1.5 py-0.5 rounded-full bg-white/95 text-slate-900 text-[8px] font-bold flex items-center space-x-1 shadow">
                                      <Eye className="w-2.5 h-2.5 text-emerald-600" />
                                      <span>Preview</span>
                                    </span>
                                  </div>

                                  {/* Recency sequence */}
                                  <div className="absolute bottom-1 right-1 px-1 rounded bg-black/60 text-slate-300 font-mono text-[7px]">
                                    #{idx + 1}
                                  </div>
                                </div>

                                {/* Metadata & Action */}
                                <div className="p-1.5 flex flex-col justify-between flex-1 space-y-1">
                                  <div>
                                    <div className="text-[10px] font-bold text-slate-900 truncate leading-tight">
                                      {item.bankName}
                                    </div>
                                    <div className="text-[9px] font-mono text-slate-400 truncate">
                                      {item.transactionRef}
                                    </div>
                                  </div>

                                  <div className="pt-0.5 border-t border-slate-200 flex items-center justify-between">
                                    <span className="font-mono font-bold text-[10px] text-emerald-700">
                                      ${item.amount.toFixed(2)}
                                    </span>
                                    <span className="text-[8px] font-mono text-indigo-600 font-bold">
                                      {item.ocrConfidenceScore}%
                                    </span>
                                  </div>

                                  {/* Quick Audit Approval trigger */}
                                  <button
                                    type="button"
                                    id={`btn-recent-scan-audit-${idx}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onInspectReceipt(item);
                                    }}
                                    className="w-full py-0.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 rounded text-[9px] font-bold transition flex items-center justify-center space-x-0.5 border border-emerald-200 hover:border-emerald-600"
                                    title="Open for final audit approval"
                                  >
                                    <ShieldCheck className="w-2.5 h-2.5" />
                                    <span>Audit</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center space-y-1">
                          <Camera className="w-4 h-4 text-slate-400 mx-auto" />
                          <p className="text-[10px] font-bold text-slate-600">No Captures Yet</p>
                          <p className="text-[9px] text-slate-400">
                            Tap the shutter button above to scan and ingest your first bank deposit slip.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: VAULT (Receipt Ledger & Digital Wallet)            */}
            {/* ========================================================= */}
            {activeTab === 'VAULT' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                
                {/* Search & Filter Header */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search receipts by ref, student, or bank..."
                      value={vaultSearch}
                      onChange={(e) => setVaultSearch(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
                    />
                  </div>

                  {/* Filter Chips */}
                  <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[10px] font-bold">
                    <button
                      onClick={() => setVaultFilter('ALL')}
                      className={`px-2.5 py-1 rounded-full whitespace-nowrap ${
                        vaultFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      All ({receipts.length})
                    </button>
                    <button
                      onClick={() => setVaultFilter('RECONCILED')}
                      className={`px-2.5 py-1 rounded-full whitespace-nowrap ${
                        vaultFilter === 'RECONCILED' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      Reconciled
                    </button>
                    <button
                      onClick={() => setVaultFilter('PENDING')}
                      className={`px-2.5 py-1 rounded-full whitespace-nowrap ${
                        vaultFilter === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-white text-amber-700 border border-amber-200'
                      }`}
                    >
                      Pending Audit
                    </button>
                  </div>
                </div>

                {/* Receipts Count Badge */}
                <div className="text-[11px] font-semibold text-slate-500 flex justify-between items-center px-1">
                  <span>Showing {filteredVault.length} transactions</span>
                  <span className="font-mono text-emerald-600 font-bold">
                    Total: ${filteredVault.reduce((sum, r) => sum + r.amount, 0).toFixed(2)}
                  </span>
                </div>

                {/* List of Receipts */}
                <div className="space-y-2">
                  {filteredVault.map(r => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedReceiptDetail(r)}
                      className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-indigo-400 transition cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            {r.bankName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{r.studentName}</div>
                            <div className="font-mono text-[9px] text-slate-400">{r.studentId} • {r.bankName}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-slate-900">
                            ${r.amount.toFixed(2)}
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            r.reconciliationStatus === 'RECONCILED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {r.reconciliationStatus}
                          </span>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>Ref: {r.transactionRef}</span>
                        <span>{r.paymentDate}</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 4: ALERTS (WhatsApp Messenger Simulation)             */}
            {/* ========================================================= */}
            {activeTab === 'ALERTS' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                
                {/* WhatsApp Chat Header */}
                <div className="bg-[#075E54] text-white p-3 rounded-2xl shadow-md flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs border border-emerald-400">
                      MU
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center space-x-1">
                        <span>University Bursary Alerts</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 fill-emerald-300 text-slate-900" />
                      </div>
                      <div className="text-[9px] text-emerald-200">Official Institutional Notification Bot</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200">
                    ONLINE
                  </span>
                </div>

                {/* Simulated Chat Feed */}
                <div className="bg-[#EFEAE2] p-3 rounded-2xl border border-slate-300 min-h-[300px] max-h-[380px] overflow-y-auto space-y-3 shadow-inner">
                  
                  <div className="text-center my-1">
                    <span className="text-[9px] bg-white/80 text-slate-600 px-2 py-0.5 rounded-full shadow-xs">
                      End-to-end encrypted notification channel
                    </span>
                  </div>

                  {notifications.map(n => (
                    <div key={n.id} className="flex flex-col items-start max-w-[88%]">
                      <div className="bg-white p-2.5 rounded-2xl rounded-tl-none shadow-xs border border-slate-200 text-xs text-slate-800 space-y-1">
                        <div className="font-bold text-[10px] text-[#075E54]">
                          {n.studentName} ({n.studentId})
                        </div>
                        <div className="text-[11px] leading-relaxed">
                          {n.message}
                        </div>
                        <div className="flex items-center justify-end space-x-1 text-[9px] text-slate-400 font-mono pt-0.5">
                          <span>{new Date(n.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-blue-500 font-bold">✓✓</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {notifications.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-500">
                      No WhatsApp messages yet. Commit a bank slip to trigger automated payment notifications!
                    </div>
                  )}

                </div>

                {/* Test Alert Sender Composer */}
                <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-[11px] font-bold text-slate-700">
                    Dispatch Instant Alert to {selectedStudent.fullName}
                  </span>
                  <div className="flex space-x-1.5">
                    <input
                      type="text"
                      placeholder="Custom bursary advisory message..."
                      value={customAlertMsg}
                      onChange={(e) => setCustomAlertMsg(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                    <button
                      id="btn-dispatch-mobile-alert"
                      disabled={!customAlertMsg.trim() || sendingAlert}
                      onClick={async () => {
                        setSendingAlert(true);
                        await new Promise(r => setTimeout(r, 400));
                        onDispatchNotification({
                          studentId: selectedStudent.studentId,
                          studentName: selectedStudent.fullName,
                          studentPhone: selectedStudent.phone,
                          studentEmail: selectedStudent.email,
                          channel: 'WHATSAPP',
                          message: customAlertMsg,
                        });
                        setCustomAlertMsg('');
                        setSendingAlert(false);
                      }}
                      className="px-3 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 5: SETTINGS (Android Material 3 Device Diagnostics)    */}
            {/* ========================================================= */}
            {activeTab === 'SETTINGS' && (
              <div className="space-y-3 animate-in fade-in duration-200 text-xs text-slate-800">
                
                {/* Device Info Card */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-700 font-bold">
                    <Smartphone className="w-4 h-4" />
                    <span>Android Terminal Hardware Profile</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-mono">
                    <div>Model: <strong>Google Pixel 9 Pro</strong></div>
                    <div>OS: <strong>Android 15 (Material You)</strong></div>
                    <div>Camera Engine: <strong>50MP Dual PDAF</strong></div>
                    <div>Security Patch: <strong>Sept 2026 Level</strong></div>
                  </div>
                </div>

                {/* Offline SQLite Room DB Diagnostics */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                      <Cloud className="w-4 h-4 text-blue-600" />
                      <span>Offline SQLite Storage (Room DB)</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                      {offlineQueueCount} Staged
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Offline Vault enables bank queue capture even during severe campus cellular network blackout. Slips are stored with AES-256 local encryption.
                  </p>
                  <div className="pt-1 flex space-x-2">
                    <button
                      onClick={onToggleOffline}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition border ${
                        isOffline 
                          ? 'bg-amber-100 border-amber-300 text-amber-900' 
                          : 'bg-slate-100 border-slate-300 text-slate-700'
                      }`}
                    >
                      {isOffline ? 'Simulate Online' : 'Simulate Offline'}
                    </button>
                    <button
                      onClick={onSyncOfflineQueue}
                      disabled={isOffline || offlineQueueCount === 0 || isSyncing}
                      className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-bold text-xs shadow transition"
                    >
                      {isSyncing ? 'Syncing...' : 'Sync Cloud Vault'}
                    </button>
                  </div>
                </div>

                {/* Resolution & OCR Configuration */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2.5">
                  <span className="font-bold text-slate-800 block">
                    Optical Engine Settings
                  </span>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">Camera Optical Resolution</span>
                    <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg">
                      <button
                        onClick={() => setCameraResolution('1080P')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cameraResolution === '1080P' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                        }`}
                      >
                        1080p
                      </button>
                      <button
                        onClick={() => setCameraResolution('4K_UHD')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cameraResolution === '4K_UHD' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500'
                        }`}
                      >
                        4K UHD
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">Biometric Lock Verification</span>
                    <input
                      type="checkbox"
                      checked={biometricsEnabled}
                      onChange={(e) => setBiometricsEnabled(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                  </div>
                </div>

                {/* GitHub Actions Mobile APK Build & Phone Download Card */}
                <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700 rounded-2xl space-y-2.5 text-white shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center space-x-2 text-emerald-300">
                      <Github className="w-4 h-4" />
                      <span>Android APK CI/CD (GitHub Actions)</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Gradle 8.13
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Build and download the native <code className="text-emerald-300 font-mono">uniaudit-mobile-debug.apk</code> via automated GitHub Actions to install and test on your physical Android phone.
                  </p>
                  <button
                    id="btn-settings-open-github-build"
                    onClick={onOpenGitHubBuildModal}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition flex items-center justify-center space-x-2"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Open APK Build &amp; Phone Test Center</span>
                  </button>
                </div>

                {/* Switch to Web Dashboard Button */}
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2 text-center">
                  <span className="text-xs font-bold text-indigo-900 block">
                    Institutional Bursar Desktop Suite
                  </span>
                  <p className="text-[11px] text-indigo-700">
                    Switch to the desktop dashboard for high-volume audit reconciliations, full CRUD ledger entries, and 30-day OCR quality analytics.
                  </p>
                  <button
                    id="btn-settings-open-dashboard"
                    onClick={onSwitchToWebDashboard}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow transition"
                  >
                    Open Bursary Web Dashboard
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* ========================================================= */}
          {/* ANDROID BOTTOM NAVIGATION BAR (Material 3)                */}
          {/* ========================================================= */}
          <div className="h-14 bg-white border-t border-slate-200 px-3 flex items-center justify-around text-slate-500 shrink-0 z-20 shadow-md">
            
            {/* Tab: Home */}
            <button
              id="btn-mobile-tab-home"
              onClick={() => setActiveTab('HOME')}
              className={`flex flex-col items-center justify-center space-y-0.5 transition ${
                activeTab === 'HOME' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-[9px]">Pass</span>
            </button>

            {/* Tab: Vault */}
            <button
              id="btn-mobile-tab-vault"
              onClick={() => setActiveTab('VAULT')}
              className={`flex flex-col items-center justify-center space-y-0.5 transition ${
                activeTab === 'VAULT' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-[9px]">Wallet</span>
            </button>

            {/* Tab: Scanner (Prominent Center Button) */}
            <button
              id="btn-mobile-tab-scan"
              onClick={() => setActiveTab('SCAN')}
              className="flex flex-col items-center justify-center -mt-5"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white transition active:scale-95 ${
                activeTab === 'SCAN' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-emerald-400'
              }`}>
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold text-emerald-700 mt-0.5">Scan</span>
            </button>

            {/* Tab: Alerts */}
            <button
              id="btn-mobile-tab-alerts"
              onClick={() => setActiveTab('ALERTS')}
              className={`flex flex-col items-center justify-center space-y-0.5 relative transition ${
                activeTab === 'ALERTS' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              )}
              <span className="text-[9px]">Alerts</span>
            </button>

            {/* Tab: Settings */}
            <button
              id="btn-mobile-tab-settings"
              onClick={() => setActiveTab('SETTINGS')}
              className={`flex flex-col items-center justify-center space-y-0.5 transition ${
                activeTab === 'SETTINGS' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="text-[9px]">Settings</span>
            </button>

          </div>

          {/* ========================================================= */}
          {/* ANDROID 3-BUTTON SYSTEM NAVIGATION BAR                    */}
          {/* ========================================================= */}
          <div className="h-7 bg-black text-slate-400 flex items-center justify-around px-12 shrink-0 select-none border-t border-slate-900">
            {/* Android Back Button (Triangle ◀) */}
            <button 
              id="btn-android-back-triangle"
              onClick={handleAndroidBack} 
              className="hover:text-white p-1 transition active:scale-90"
              title="Android System Back"
            >
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[8px] border-r-current" />
            </button>

            {/* Android Home Button (Circle ●) */}
            <button 
              id="btn-android-home-circle"
              onClick={handleAndroidHome} 
              className="hover:text-white p-1 transition active:scale-90"
              title="Android System Home"
            >
              <div className="w-2.5 h-2.5 rounded-full border-2 border-current" />
            </button>

            {/* Android Recents Button (Square ■) */}
            <button 
              id="btn-android-recents-square"
              onClick={() => setIsRecentsOpen(!isRecentsOpen)} 
              className="hover:text-white p-1 transition active:scale-90"
              title="Android Task Manager / Recents"
            >
              <div className="w-2.5 h-2.5 rounded-[1px] border-2 border-current" />
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: FULL SCREEN SCANNABLE QR EXAM HALL PASS         */}
      {/* ========================================================= */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs text-left animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">
                Official Hall Invigilator Scanner
              </span>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-inner">
              <QrCode className="w-44 h-44 mx-auto text-slate-900" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm">{selectedStudent.fullName}</h3>
              <p className="font-mono text-xs text-purple-700 font-bold">{selectedStudent.studentId}</p>
              <div className="mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${
                  isCleared ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {selectedStudent.status} FOR EXAMINATION
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              SHA-256 cryptographically stamped by Metropolitan University Directorate of Bursary.
            </p>

            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Dismiss Pass
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: RECEIPT DETAIL BOTTOM SHEET                     */}
      {/* ========================================================= */}
      {selectedReceiptDetail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs text-left animate-in fade-in duration-150">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold">
                  Verified Ingestion Slip
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Ref: {selectedReceiptDetail.transactionRef}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReceiptDetail(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Thumbnail */}
            <div className="aspect-16/9 bg-slate-950 rounded-xl overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center">
              <img
                src={selectedReceiptDetail.receiptImageUrl}
                alt="Receipt Slip"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded-xl">
                <div className="text-[10px] text-slate-500">Student Name</div>
                <div className="font-bold text-slate-900">{selectedReceiptDetail.studentName}</div>
                <div className="font-mono text-[9px] text-slate-500">{selectedReceiptDetail.studentId}</div>
              </div>

              <div className="p-2 bg-emerald-50 rounded-xl">
                <div className="text-[10px] text-emerald-700">Settled Amount</div>
                <div className="font-bold font-mono text-emerald-800 text-sm">
                  ${selectedReceiptDetail.amount.toFixed(2)}
                </div>
                <div className="text-[9px] text-emerald-600 font-bold">{selectedReceiptDetail.bankName}</div>
              </div>
            </div>

            {/* Checksum & Cloud Storage */}
            <div className="p-2.5 bg-slate-50 rounded-xl text-[10px] space-y-1 font-mono text-slate-600 border border-slate-200">
              <div className="truncate">
                <strong>Checksum:</strong> {selectedReceiptDetail.auditChecksum}
              </div>
              <div className="truncate">
                <strong>Vault Path:</strong> {selectedReceiptDetail.cloudStoragePath}
              </div>
              <div>
                <strong>Interbank Status:</strong> {selectedReceiptDetail.bankValidation?.bankMatchStatus}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                id="btn-bottomsheet-final-audit-approval"
                onClick={() => {
                  const target = selectedReceiptDetail;
                  setSelectedReceiptDetail(null);
                  onInspectReceipt(target);
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Open Final Audit Approval</span>
              </button>
              <button
                onClick={() => {
                  alert(`Official Bursary Receipt for #${selectedReceiptDetail.transactionRef} ready for print or sharing!`);
                }}
                className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF</span>
              </button>
              <button
                onClick={() => setSelectedReceiptDetail(null)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
