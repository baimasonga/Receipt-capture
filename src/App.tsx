/**
 * Metropolitan University - Institutional Financial Audit & Receipt OCR Reconciler
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ReceiptScanner } from './components/ReceiptScanner';
import { ExtractionReviewModal } from './components/ExtractionReviewModal';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentPortalView } from './components/StudentPortalView';
import { AuditTrailView } from './components/AuditTrailView';
import { AlertCenterModal } from './components/AlertCenterModal';
import { MobileFrame } from './components/MobileFrame';
import { ReceiptData, StudentAccount, AuditLogEntry, NotificationPayload } from './types';
import { UniversityLedgerManager, INITIAL_STUDENTS } from './utils/bankLedger';
import { SAMPLE_RECEIPTS } from './data/sampleReceipts';
import { computeSHA256 } from './utils/crypto';

export default function App() {
  const ledgerManager = UniversityLedgerManager.getInstance();

  // App Global State
  const [activeRole, setActiveRole] = useState<'BURSAR' | 'AUDITOR' | 'STUDENT'>('BURSAR');
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'HOME' | 'SCAN' | 'HISTORY' | 'ALERTS'>('HOME');

  // Core Data
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentAccount>(INITIAL_STUDENTS[0]);
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<ReceiptData[]>([]);

  // Modals
  const [reviewReceipt, setReviewReceipt] = useState<Partial<ReceiptData> | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize data and seed initial receipts if empty
  useEffect(() => {
    const loadedStudents = ledgerManager.getStudents();
    setStudents(loadedStudents);
    setSelectedStudent(loadedStudents[0]);

    let loadedReceipts = ledgerManager.getReceipts();
    const loadedOffline = ledgerManager.getOfflineQueue();
    setOfflineQueue(loadedOffline);

    // If no receipts, seed 2 pre-reconciled sample receipts so dashboard is lively immediately
    if (loadedReceipts.length === 0) {
      const sample1 = SAMPLE_RECEIPTS[0];
      const sample2 = SAMPLE_RECEIPTS[1];

      const seed1: ReceiptData = {
        id: `REC-SEED-${sample1.transactionRef}`,
        studentId: sample1.studentId,
        studentName: sample1.studentName,
        studentEmail: `${sample1.studentId.toLowerCase().replace(/[^a-z0-9]/g, '.')}@univ.edu`,
        studentPhone: '+232 78 492019',
        bankName: sample1.bankName,
        bankBranch: 'Main Campus Towers, Sector 4',
        transactionRef: sample1.transactionRef,
        paymentDate: sample1.dateStr,
        amount: sample1.amount,
        currency: sample1.currency,
        academicSession: '2024/2025',
        semester: 'Harmattan / First Semester',
        tellerStampDetected: true,
        tellerSignaturePresent: true,
        ocrConfidenceScore: 99,
        receiptImageUrl: sample1.svgDataUri,
        projectCategories: sample1.projectAllocations.map(p => ({
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
          settlementRef: `IB-CLEARED-${sample1.transactionRef}-093`,
          clearingBank: sample1.bankName,
          clearedAmount: sample1.amount,
          clearedTimestamp: '2025-01-14T09:42:10Z',
          message: 'Verified by Interbank Switch. Funds settled in institutional revenue account.',
          interbankSwitchCode: 'SWIFT-ZB-NG-CAMPUS-94',
        },
        reconciliationStatus: 'RECONCILED',
        auditChecksum: 'sha256-e91840219bf4801ac94829104fae890281b',
        isEncryptedInCloud: true,
        cloudStoragePath: `s3://univ-bursary-encrypted-vault-2025/receipts/2024_2025/${sample1.studentId}_${sample1.transactionRef}.enc.aes256`,
        syncStatus: 'SYNCED',
        createdAt: '2025-01-14T10:00:00Z',
        verifiedBy: 'System Interbank Reconciler',
      };

      const seed2: ReceiptData = {
        id: `REC-SEED-${sample2.transactionRef}`,
        studentId: sample2.studentId,
        studentName: sample2.studentName,
        studentEmail: `${sample2.studentId.toLowerCase().replace(/[^a-z0-9]/g, '.')}@univ.edu`,
        studentPhone: '+232 76 819203',
        bankName: sample2.bankName,
        bankBranch: 'University Hospital Branch',
        transactionRef: sample2.transactionRef,
        paymentDate: sample2.dateStr,
        amount: sample2.amount,
        currency: sample2.currency,
        academicSession: '2024/2025',
        semester: 'Harmattan / First Semester',
        tellerStampDetected: true,
        tellerSignaturePresent: true,
        ocrConfidenceScore: 97,
        receiptImageUrl: sample2.svgDataUri,
        projectCategories: sample2.projectAllocations.map(p => ({
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
          settlementRef: `IB-CLEARED-${sample2.transactionRef}-093`,
          clearingBank: sample2.bankName,
          clearedAmount: sample2.amount,
          clearedTimestamp: '2025-01-16T11:15:30Z',
          message: 'Verified by Interbank Switch. Funds settled into Medical College account.',
          interbankSwitchCode: 'SWIFT-SCB-SL-MED-02',
        },
        reconciliationStatus: 'RECONCILED',
        auditChecksum: 'sha256-49021a8f9021948ba98103cba0194812a',
        isEncryptedInCloud: true,
        cloudStoragePath: `s3://univ-bursary-encrypted-vault-2025/receipts/2024_2025/${sample2.studentId}_${sample2.transactionRef}.enc.aes256`,
        syncStatus: 'SYNCED',
        createdAt: '2025-01-16T12:00:00Z',
        verifiedBy: 'System Interbank Reconciler',
      };

      loadedReceipts = [seed1, seed2];
      ledgerManager.saveReceipts(loadedReceipts);

      // Update student paid totals for seeds
      const st1 = loadedStudents.find(s => s.studentId === sample1.studentId);
      if (st1) {
        st1.totalPaid = sample1.amount;
        st1.outstandingBalance = Math.max(0, st1.totalTuitionBilled - sample1.amount);
        st1.status = st1.outstandingBalance <= 0 ? 'CLEARED' : 'PARTIAL';
        st1.receipts = [seed1.id];
      }
      const st2 = loadedStudents.find(s => s.studentId === sample2.studentId);
      if (st2) {
        st2.totalPaid = sample2.amount;
        st2.outstandingBalance = Math.max(0, st2.totalTuitionBilled - sample2.amount);
        st2.status = st2.outstandingBalance <= 0 ? 'CLEARED' : 'PARTIAL';
        st2.receipts = [seed2.id];
      }
      ledgerManager.saveStudents(loadedStudents);
      setStudents([...loadedStudents]);

      // Seed audit entries
      ledgerManager.appendAuditLog({
        timestamp: '2025-01-14T10:00:00Z',
        actor: 'Interbank API Gateway',
        role: 'SYSTEM_API',
        action: 'BATCH_RECONCILIATION_SYNC',
        details: `Auto-reconciled slip ${sample1.transactionRef} for student ${sample1.studentId}. Credited $${sample1.amount}.`,
        receiptId: seed1.id,
        studentId: sample1.studentId,
        ipAddress: '10.204.14.1 (Bank Clearing Switch)',
      });
      ledgerManager.appendAuditLog({
        timestamp: '2025-01-16T12:00:00Z',
        actor: 'Interbank API Gateway',
        role: 'SYSTEM_API',
        action: 'BATCH_RECONCILIATION_SYNC',
        details: `Auto-reconciled slip ${sample2.transactionRef} for student ${sample2.studentId}. Credited $${sample2.amount}.`,
        receiptId: seed2.id,
        studentId: sample2.studentId,
        ipAddress: '10.204.14.1 (Bank Clearing Switch)',
      });
    }

    setReceipts(loadedReceipts);
    setAuditLogs(ledgerManager.getAuditLogs());
    setNotifications(ledgerManager.getNotifications());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Triggered when OCR scan finishes
  const handleScanComplete = (extractedReceipt: Partial<ReceiptData>, rawImage: string) => {
    setReviewReceipt(extractedReceipt);
  };

  // Reconcile and commit receipt to General Ledger
  const handleCommitReceipt = async (finalReceipt: ReceiptData) => {
    if (isOffline) {
      // Offline mode: store in local offline queue
      const queue = ledgerManager.getOfflineQueue();
      queue.unshift({
        ...finalReceipt,
        syncStatus: 'OFFLINE_PENDING',
        isEncryptedInCloud: false,
      });
      ledgerManager.saveOfflineQueue(queue);
      setOfflineQueue(queue);

      await ledgerManager.appendAuditLog({
        timestamp: new Date().toISOString(),
        actor: activeRole === 'BURSAR' ? 'Bursary Admin' : 'Student Offline Terminal',
        role: activeRole,
        action: 'OFFLINE_RECEIPT_STAGED',
        details: `Slip ${finalReceipt.transactionRef} cached locally in encrypted offline vault. Pending cloud uplink.`,
        receiptId: finalReceipt.id,
        studentId: finalReceipt.studentId,
        ipAddress: '127.0.0.1 (Local Client Storage)',
      });

      setAuditLogs(ledgerManager.getAuditLogs());
      setReviewReceipt(null);
      showToast(`Slip #${finalReceipt.transactionRef} safely stored in Offline Vault. Sync when back online!`);
      return;
    }

    // Online reconciliation
    const result = await ledgerManager.reconcileAndCommit(
      finalReceipt,
      activeRole === 'BURSAR' ? 'Bursar Director' : 'Student Mobile Portal'
    );

    // Refresh state
    setReceipts(ledgerManager.getReceipts());
    setStudents(ledgerManager.getStudents());
    setAuditLogs(ledgerManager.getAuditLogs());
    setNotifications(ledgerManager.getNotifications());
    setOfflineQueue(ledgerManager.getOfflineQueue());

    if (result.student) {
      setSelectedStudent(result.student);
    }

    setReviewReceipt(null);
    showToast(
      `Receipt ${finalReceipt.transactionRef} reconciled! Billed balance updated & automated WhatsApp/Email alerts dispatched.`
    );
  };

  // Synchronize offline queue with cloud
  const handleSyncOfflineQueue = async () => {
    if (isOffline || offlineQueue.length === 0) return;
    setIsSyncing(true);

    try {
      for (const item of offlineQueue) {
        await ledgerManager.reconcileAndCommit(item, 'Offline Background Sync Engine');
      }
      ledgerManager.saveOfflineQueue([]);
      setOfflineQueue([]);
      setReceipts(ledgerManager.getReceipts());
      setStudents(ledgerManager.getStudents());
      setAuditLogs(ledgerManager.getAuditLogs());
      setNotifications(ledgerManager.getNotifications());

      showToast(`Synchronized ${offlineQueue.length} offline receipts into the central institutional database!`);
    } catch (err) {
      console.error('Error syncing offline queue', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Dispatch manual or automated notification
  const handleDispatchNotification = (payload: Omit<NotificationPayload, 'id' | 'sentAt' | 'status'>) => {
    const newNotification: NotificationPayload = {
      ...payload,
      id: `NOTIF-MANUAL-${Date.now().toString(36)}`,
      status: 'DELIVERED',
      sentAt: new Date().toISOString(),
    };
    ledgerManager.addNotification(newNotification);
    setNotifications(ledgerManager.getNotifications());
    showToast(`Dispatched ${payload.channel} alert to ${payload.studentName}!`);
  };

  // Render view content based on activeRole or mobileTab
  const renderMainContent = () => {
    if (activeRole === 'STUDENT') {
      return (
        <div className="space-y-6">
          <StudentPortalView
            student={selectedStudent}
            receipts={receipts}
            onOpenScanner={() => {
              if (isMobileFrame) setMobileTab('SCAN');
              else {
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }
            }}
            onViewReceiptDetail={(rec) => setReviewReceipt(rec)}
            onOpenAlerts={() => setIsAlertModalOpen(true)}
          />

          <ReceiptScanner
            onScanComplete={handleScanComplete}
            isOffline={isOffline}
          />
        </div>
      );
    }

    if (activeRole === 'AUDITOR') {
      return (
        <div className="space-y-6">
          <AuditTrailView auditLogs={auditLogs} />
        </div>
      );
    }

    // Default: BURSAR
    return (
      <div className="space-y-8">
        <ReceiptScanner
          onScanComplete={handleScanComplete}
          isOffline={isOffline}
        />

        <AdminDashboard
          receipts={receipts}
          students={students}
          onInspectReceipt={(rec) => setReviewReceipt(rec)}
          onSendAlert={(rec) => {
            const st = students.find(s => s.studentId === rec.studentId) || selectedStudent;
            setSelectedStudent(st);
            setIsAlertModalOpen(true);
          }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      
      {/* Universal Header */}
      <Header
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        isOffline={isOffline}
        onToggleOffline={() => {
          const next = !isOffline;
          setIsOffline(next);
          if (!next && offlineQueue.length > 0) {
            handleSyncOfflineQueue();
          }
        }}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        offlineQueueCount={offlineQueue.length}
        onSyncOfflineQueue={handleSyncOfflineQueue}
        isSyncing={isSyncing}
        students={students}
        selectedStudent={selectedStudent}
        onSelectStudent={setSelectedStudent}
        onOpenNotifications={() => setIsAlertModalOpen(true)}
        unreadNotificationsCount={notifications.length}
      />

      {/* Floating Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area: Switch between Desktop View and Mobile Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {isMobileFrame ? (
          <MobileFrame
            onExitMobile={() => setIsMobileFrame(false)}
            activeTab={mobileTab}
            onChangeTab={(t) => {
              setMobileTab(t);
              if (t === 'ALERTS') setIsAlertModalOpen(true);
            }}
          >
            {mobileTab === 'SCAN' ? (
              <ReceiptScanner
                onScanComplete={handleScanComplete}
                isOffline={isOffline}
              />
            ) : (
              <StudentPortalView
                student={selectedStudent}
                receipts={receipts}
                onOpenScanner={() => setMobileTab('SCAN')}
                onViewReceiptDetail={(rec) => setReviewReceipt(rec)}
                onOpenAlerts={() => setIsAlertModalOpen(true)}
              />
            )}
          </MobileFrame>
        ) : (
          renderMainContent()
        )}
      </main>

      {/* Side-by-Side OCR Extraction Review Modal */}
      {reviewReceipt && (
        <ExtractionReviewModal
          receipt={reviewReceipt}
          onClose={() => setReviewReceipt(null)}
          onCommit={handleCommitReceipt}
          isOffline={isOffline}
        />
      )}

      {/* Automated WhatsApp & Email Alert Center Modal */}
      <AlertCenterModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        notifications={notifications}
        students={students}
        onDispatchAlert={handleDispatchNotification}
      />

      {/* Institutional Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Metropolitan University Directorate of Bursary &amp; Internal Audit</strong> • All Financial Transactions Encrypted (AES-256-GCM / SHA-256)
          </div>
          <div className="font-mono text-slate-500 text-[11px]">
            Interbank API Switch Status: CONNECTED • Peak Enrollment Accelerated
          </div>
        </div>
      </footer>

    </div>
  );
}
