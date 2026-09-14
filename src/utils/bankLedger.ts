import { BankLedgerRecord, StudentAccount, ReceiptData, AuditLogEntry, NotificationPayload } from '../types';
import { computeSHA256, simulateAES256Encrypt, RECEIPTS_STORAGE_KEY, STUDENTS_STORAGE_KEY, AUDIT_LOGS_STORAGE_KEY, NOTIFICATIONS_STORAGE_KEY, OFFLINE_STORAGE_KEY } from './crypto';

// Initial Student database
export const INITIAL_STUDENTS: StudentAccount[] = [
  {
    studentId: 'ENG/2024/0912',
    fullName: 'Amadu S. Bangura',
    email: 'amadu.bangura@univ.edu',
    phone: '+232 78 492019',
    program: 'B.Eng. Computer Engineering (Year 2)',
    faculty: 'Faculty of Engineering & Technology',
    academicYear: '2024/2025',
    totalTuitionBilled: 3500.00,
    totalPaid: 0,
    outstandingBalance: 3500.00,
    status: 'OVERDUE',
    receipts: [],
  },
  {
    studentId: 'MED/2023/0418',
    fullName: 'Fatima K. Mansaray',
    email: 'fatima.mansaray@univ.edu',
    phone: '+232 76 819203',
    program: 'MBChB Medicine & Surgery (Year 4)',
    faculty: 'College of Medicine & Allied Health Sciences',
    academicYear: '2024/2025',
    totalTuitionBilled: 5000.00,
    totalPaid: 1200.00,
    outstandingBalance: 3800.00,
    status: 'PARTIAL',
    receipts: [],
  },
  {
    studentId: 'PG/2024/1102',
    fullName: 'David O. Adeleke',
    email: 'david.adeleke@univ.edu',
    phone: '+232 79 332810',
    program: 'M.Sc. Project Management & Housing',
    faculty: 'School of Postgraduate Studies',
    academicYear: '2024/2025',
    totalTuitionBilled: 2650.00,
    totalPaid: 1000.00,
    outstandingBalance: 1650.00,
    status: 'PARTIAL',
    receipts: [],
  },
  {
    studentId: 'SCI/2024/0359',
    fullName: 'Amina Zainab Conteh',
    email: 'amina.conteh@univ.edu',
    phone: '+232 77 114920',
    program: 'B.Sc. Data Science & AI (Year 1)',
    faculty: 'Faculty of Pure & Applied Sciences',
    academicYear: '2024/2025',
    totalTuitionBilled: 2400.00,
    totalPaid: 1200.00,
    outstandingBalance: 1200.00,
    status: 'PARTIAL',
    receipts: [],
  },
  {
    studentId: 'LAW/2023/0081',
    fullName: 'Ibrahim Hassan Sesay',
    email: 'ibrahim.sesay@univ.edu',
    phone: '+232 30 551928',
    program: 'LL.B. Faculty of Law (Year 3)',
    faculty: 'Faculty of Law & Jurisprudence',
    academicYear: '2024/2025',
    totalTuitionBilled: 3200.00,
    totalPaid: 3200.00,
    outstandingBalance: 0,
    status: 'CLEARED',
    receipts: [],
  },
];

// University Interbank Settlement Clearing House database
export const INTERBANK_CLEARING_LEDGER: BankLedgerRecord[] = [
  {
    transactionRef: 'ZB-REV-892410-ENG',
    accountNumber: '1004928104',
    accountName: 'Metropolitan University Bursary Zenith Main',
    amount: 2450.00,
    currency: 'USD',
    bankName: 'Zenith Bank Plc',
    branch: 'Main Campus Towers, Sector 4',
    depositedBy: 'Amadu S. Bangura',
    studentMatricNo: 'ENG/2024/0912',
    depositDate: '2025-01-14T09:42:10Z',
    clearingStatus: 'SETTLED',
    isClaimed: false,
  },
  {
    transactionRef: 'SCB-MED-994102-HOSP',
    accountNumber: '2084910395',
    accountName: 'Metropolitan University Medical College Collections',
    amount: 3800.00,
    currency: 'USD',
    bankName: 'Standard Chartered Bank',
    branch: 'University Hospital Branch',
    depositedBy: 'Fatima K. Mansaray',
    studentMatricNo: 'MED/2023/0418',
    depositDate: '2025-01-16T11:15:30Z',
    clearingStatus: 'SETTLED',
    isClaimed: false,
  },
  {
    transactionRef: 'FNB-HST-552918-RES',
    accountNumber: '3099201948',
    accountName: 'University Student Housing & Hostel Fund',
    amount: 1650.00,
    currency: 'USD',
    bankName: 'First National Bank',
    branch: 'University Boulevard North',
    depositedBy: 'David O. Adeleke',
    studentMatricNo: 'PG/2024/1102',
    depositDate: '2025-01-18T14:22:05Z',
    clearingStatus: 'SETTLED',
    isClaimed: false,
  },
  {
    transactionRef: 'ECO-SCI-771923-ICT',
    accountNumber: '4019283719',
    accountName: 'Metropolitan University ICT & Lab Revenue Account',
    amount: 1200.00,
    currency: 'USD',
    bankName: 'EcoBank Pan-Africa',
    branch: 'Campus Science Quadrangle',
    depositedBy: 'Amina Zainab Conteh',
    studentMatricNo: 'SCI/2024/0359',
    depositDate: '2025-01-20T10:05:45Z',
    clearingStatus: 'SETTLED',
    isClaimed: false,
  },
];

export class UniversityLedgerManager {
  private static instance: UniversityLedgerManager;

  public static getInstance(): UniversityLedgerManager {
    if (!UniversityLedgerManager.instance) {
      UniversityLedgerManager.instance = new UniversityLedgerManager();
    }
    return UniversityLedgerManager.instance;
  }

  // Load students from storage or seed defaults
  public getStudents(): StudentAccount[] {
    if (typeof window === 'undefined') return INITIAL_STUDENTS;
    try {
      const stored = localStorage.getItem(STUDENTS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    this.saveStudents(INITIAL_STUDENTS);
    return INITIAL_STUDENTS;
  }

  public saveStudents(students: StudentAccount[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
    } catch (e) {
      console.warn('Failed saving students to localStorage', e);
    }
  }

  // Load all reconciled receipts
  public getReceipts(): ReceiptData[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(RECEIPTS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    return [];
  }

  public saveReceipts(receipts: ReceiptData[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(receipts));
    } catch (e) {
      console.warn('Failed saving receipts to localStorage', e);
    }
  }

  // Offline queue
  public getOfflineQueue(): ReceiptData[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    return [];
  }

  public saveOfflineQueue(queue: ReceiptData[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed saving offline queue', e);
    }
  }

  // Audit logs
  public getAuditLogs(): AuditLogEntry[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    return [];
  }

  public async appendAuditLog(entry: Omit<AuditLogEntry, 'id' | 'checksum'>): Promise<AuditLogEntry> {
    const id = `AUD-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const rawData = `${id}|${entry.timestamp}|${entry.actor}|${entry.role}|${entry.action}|${entry.details}`;
    const checksum = await computeSHA256(rawData);
    const newEntry: AuditLogEntry = {
      ...entry,
      id,
      checksum,
    };
    if (typeof window !== 'undefined') {
      const logs = this.getAuditLogs();
      logs.unshift(newEntry);
      try {
        localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(logs.slice(0, 200)));
      } catch (e) {
        console.warn('Error saving audit log', e);
      }
    }
    return newEntry;
  }

  // Notifications
  public getNotifications(): NotificationPayload[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    return [];
  }

  public addNotification(notification: NotificationPayload): void {
    if (typeof window === 'undefined') return;
    const items = this.getNotifications();
    items.unshift(notification);
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items.slice(0, 100)));
    } catch (e) {
      console.warn('Error saving notification', e);
    }
  }

  // Real-time interbank validation
  public validateWithInterbankAPI(
    transactionRef: string,
    amount: number,
    studentId: string
  ): {
    isValid: boolean;
    status: 'MATCH_VERIFIED' | 'AMOUNT_MISMATCH' | 'REF_NOT_FOUND' | 'DUPLICATE_DETECTED';
    bankRecord?: BankLedgerRecord;
    message: string;
    settlementRef: string;
  } {
    // Normalize ref
    const cleanRef = transactionRef.trim().toUpperCase();

    // 1. Check if already reconciled in our university ledger (duplicate detection!)
    const existingReceipts = this.getReceipts();
    const duplicate = existingReceipts.find(
      r => r.transactionRef.toUpperCase() === cleanRef && r.reconciliationStatus === 'RECONCILED'
    );
    if (duplicate) {
      return {
        isValid: false,
        status: 'DUPLICATE_DETECTED',
        settlementRef: `IB-DUP-${cleanRef}`,
        message: `FRAUD PREVENTION ALERT: Transaction reference #${cleanRef} was ALREADY claimed and reconciled on ${duplicate.createdAt} by student ${duplicate.studentId}!`,
      };
    }

    // 2. Check Interbank Clearing House records
    const bankRecord = INTERBANK_CLEARING_LEDGER.find(
      r => r.transactionRef.toUpperCase() === cleanRef
    );

    if (!bankRecord) {
      // If reference not in known mock bank switch, allow soft match or flag
      return {
        isValid: false,
        status: 'REF_NOT_FOUND',
        settlementRef: `IB-UNKNOWN-${Date.now().toString(36)}`,
        message: `Bank Switch Status: Transaction reference '${cleanRef}' not yet reflected in the central clearing house. Flagged for manual teller confirmation with the bank branch.`,
      };
    }

    // 3. Check amount match
    const diff = Math.abs(bankRecord.amount - amount);
    if (diff > 0.01) {
      return {
        isValid: false,
        status: 'AMOUNT_MISMATCH',
        bankRecord,
        settlementRef: `IB-MISMATCH-${bankRecord.transactionRef}`,
        message: `Discrepancy detected! Receipt states $${amount.toFixed(2)}, but bank clearing statement records $${bankRecord.amount.toFixed(2)}. Requires Bursar audit approval.`,
      };
    }

    // 4. Perfect Match
    return {
      isValid: true,
      status: 'MATCH_VERIFIED',
      bankRecord,
      settlementRef: `IB-CLEARED-${bankRecord.transactionRef}-093`,
      message: `Verified by Interbank Switch. Bank clearance confirmed at ${bankRecord.bankName} (${bankRecord.branch}). Funds settled in institutional revenue account.`,
    };
  }

  // Reconcile and commit receipt to ledger
  public async reconcileAndCommit(receipt: ReceiptData, actor: string = 'Bursary Admin'): Promise<{
    success: boolean;
    student: StudentAccount | undefined;
    receipt: ReceiptData;
    notifications: NotificationPayload[];
  }> {
    // 1. Mark as verified in receipts store
    const receipts = this.getReceipts();
    const existingIndex = receipts.findIndex(r => r.id === receipt.id);
    const updatedReceipt: ReceiptData = {
      ...receipt,
      reconciliationStatus: receipt.bankValidation.isValid ? 'RECONCILED' : 'PENDING_AUDIT',
      syncStatus: 'SYNCED',
      isEncryptedInCloud: true,
      cloudStoragePath: `s3://univ-bursary-encrypted-vault-2025/receipts/${receipt.academicSession.replace(/[^a-zA-Z0-9]/g, '_')}/${receipt.studentId.replace(/[^a-zA-Z0-9]/g, '_')}_${receipt.transactionRef}.enc.aes256`,
      verifiedBy: actor,
    };

    if (existingIndex >= 0) {
      receipts[existingIndex] = updatedReceipt;
    } else {
      receipts.unshift(updatedReceipt);
    }
    this.saveReceipts(receipts);

    // Also remove from offline queue if present
    const offlineQueue = this.getOfflineQueue();
    const filteredOffline = offlineQueue.filter(r => r.id !== receipt.id);
    this.saveOfflineQueue(filteredOffline);

    // 2. Update Student Account Ledger
    const students = this.getStudents();
    let updatedStudent: StudentAccount | undefined;
    const studentIndex = students.findIndex(s => s.studentId.toUpperCase() === receipt.studentId.toUpperCase());
    
    if (studentIndex >= 0) {
      const student = students[studentIndex];
      const newTotalPaid = student.totalPaid + receipt.amount;
      const newBalance = Math.max(0, student.totalTuitionBilled - newTotalPaid);
      const newStatus = newBalance <= 0 ? 'CLEARED' : newTotalPaid > 0 ? 'PARTIAL' : 'OVERDUE';
      
      updatedStudent = {
        ...student,
        totalPaid: newTotalPaid,
        outstandingBalance: newBalance,
        status: newStatus,
        receipts: Array.from(new Set([...student.receipts, receipt.id])),
      };
      students[studentIndex] = updatedStudent;
      this.saveStudents(students);
    }

    // 3. Generate Audit Log Entry with Cryptographic Hash
    await this.appendAuditLog({
      timestamp: new Date().toISOString(),
      actor,
      role: 'BURSAR',
      action: 'LEDGER_RECONCILIATION_COMMIT',
      details: `Reconciled ${receipt.currency} ${receipt.amount.toFixed(2)} for student ${receipt.studentId} (${receipt.studentName}). Interbank Ref: ${receipt.transactionRef}. Status: ${updatedReceipt.reconciliationStatus}. Cryptographic Checksum: ${receipt.auditChecksum.slice(0, 16)}...`,
      receiptId: receipt.id,
      studentId: receipt.studentId,
      ipAddress: '10.204.14.88 (Bursary Internal Subnet)',
    });

    // 4. Generate Automated WhatsApp and Email Notifications
    const notifications: NotificationPayload[] = [];
    const remainingBal = updatedStudent ? updatedStudent.outstandingBalance : 0;
    const studentPhone = updatedStudent ? updatedStudent.phone : receipt.studentPhone || '+232 78 492019';
    const studentEmail = updatedStudent ? updatedStudent.email : receipt.studentEmail || `${receipt.studentId.toLowerCase()}@univ.edu`;

    // WhatsApp Notification
    const whatsappMsg: NotificationPayload = {
      id: `NOTIF-WA-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId: receipt.studentId,
      studentName: receipt.studentName,
      recipientContact: studentPhone,
      channel: 'WHATSAPP',
      message: `🏛️ *METROPOLITAN UNIVERSITY BURSARY*\n\nDear *${receipt.studentName}* (${receipt.studentId}),\n\n✅ Your bank payment of *${receipt.currency} ${receipt.amount.toFixed(2)}* (Ref: *${receipt.transactionRef}*) at *${receipt.bankName}* has been successfully reconciled into the university financial ledger.\n\n📊 *Current Account Status:*\n• Billed Tuition: $${updatedStudent ? updatedStudent.totalTuitionBilled.toFixed(2) : '3,500.00'}\n• Total Paid to Date: $${updatedStudent ? updatedStudent.totalPaid.toFixed(2) : receipt.amount.toFixed(2)}\n• Outstanding Balance: *${remainingBal <= 0 ? 'CLEAR (Fully Paid - $0.00) 🎓' : `$${remainingBal.toFixed(2)}`}*\n• Clearance: *${remainingBal <= 0 ? 'ELIGIBLE FOR EXAM CARDS & ENROLLMENT' : 'PENDING BALANCE CLEARANCE'}*\n\n📄 Verified Electronic Receipt: https://bursary.univ.edu/receipts/${receipt.id}\n\n_This is an automated institutional audit notification._`,
      status: 'DELIVERED',
      sentAt: new Date().toISOString(),
      receiptId: receipt.id,
      amount: receipt.amount,
      balanceRemaining: remainingBal,
    };
    this.addNotification(whatsappMsg);
    notifications.push(whatsappMsg);

    // Email Notification
    const emailMsg: NotificationPayload = {
      id: `NOTIF-EM-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId: receipt.studentId,
      studentName: receipt.studentName,
      recipientContact: studentEmail,
      channel: 'EMAIL',
      subject: `Official University Bursary Receipt & Financial Status: ${receipt.transactionRef} - [${remainingBal <= 0 ? 'FULLY CLEARED' : 'PARTIAL'}]`,
      message: `Dear ${receipt.studentName},\n\nThe University Bursary Directorate has validated and reconciled your bank deposit slip via the automated OCR clearing pipeline.\n\nTransaction Reference: ${receipt.transactionRef}\nBank: ${receipt.bankName} (${receipt.bankBranch})\nAmount Credited: ${receipt.currency} ${receipt.amount.toFixed(2)}\nAllocated Project/Faculty: ${receipt.projectCategories.map(p => `${p.name} ($${p.allocatedAmount.toFixed(2)})`).join(', ')}\nRemaining Outstanding Tuition Balance: $${remainingBal.toFixed(2)}\n\nYour student portal profile has been updated in real-time.\n\nDirector of University Bursary & Internal Audit\nMetropolitan University Administration`,
      status: 'DELIVERED',
      sentAt: new Date().toISOString(),
      receiptId: receipt.id,
      amount: receipt.amount,
      balanceRemaining: remainingBal,
    };
    this.addNotification(emailMsg);
    notifications.push(emailMsg);

    // Push Notification
    const pushMsg: NotificationPayload = {
      id: `NOTIF-PSH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId: receipt.studentId,
      studentName: receipt.studentName,
      recipientContact: 'Campus Mobile App Push ID',
      channel: 'PUSH',
      subject: 'Payment Verified',
      message: `Payment of $${receipt.amount.toFixed(2)} reconciled. Outstanding balance: $${remainingBal.toFixed(2)}.`,
      status: 'DELIVERED',
      sentAt: new Date().toISOString(),
      receiptId: receipt.id,
      amount: receipt.amount,
      balanceRemaining: remainingBal,
    };
    this.addNotification(pushMsg);
    notifications.push(pushMsg);

    return {
      success: true,
      student: updatedStudent,
      receipt: updatedReceipt,
      notifications,
    };
  }

  // UPDATE: Edit an existing receipt in the Ledger (CRUD - Update)
  public async updateReceipt(updatedReceipt: ReceiptData, actor: string = 'Bursary Admin'): Promise<ReceiptData> {
    const receipts = this.getReceipts();
    const idx = receipts.findIndex(r => r.id === updatedReceipt.id);
    if (idx === -1) {
      throw new Error(`Receipt #${updatedReceipt.id} not found in database.`);
    }

    const oldReceipt = receipts[idx];
    receipts[idx] = {
      ...updatedReceipt,
      verifiedBy: actor,
    };
    this.saveReceipts(receipts);

    // If amount changed and was reconciled, adjust student account
    if (oldReceipt.reconciliationStatus === 'RECONCILED' && oldReceipt.amount !== updatedReceipt.amount) {
      const amountDiff = updatedReceipt.amount - oldReceipt.amount;
      const students = this.getStudents();
      const sIdx = students.findIndex(s => s.studentId.toUpperCase() === updatedReceipt.studentId.toUpperCase());
      if (sIdx >= 0) {
        const student = students[sIdx];
        const newPaid = Math.max(0, student.totalPaid + amountDiff);
        const newBal = Math.max(0, student.totalTuitionBilled - newPaid);
        students[sIdx] = {
          ...student,
          totalPaid: newPaid,
          outstandingBalance: newBal,
          status: newBal <= 0 ? 'CLEARED' : newPaid > 0 ? 'PARTIAL' : 'OVERDUE',
        };
        this.saveStudents(students);
      }
    }

    await this.appendAuditLog({
      timestamp: new Date().toISOString(),
      actor,
      role: 'BURSAR',
      action: 'LEDGER_RECORD_UPDATED',
      details: `Updated Receipt #${updatedReceipt.transactionRef} (${updatedReceipt.studentName}). Modified fields saved with cryptographic tracking.`,
      receiptId: updatedReceipt.id,
      studentId: updatedReceipt.studentId,
      ipAddress: '10.204.14.88 (Bursary Web Terminal)',
    });

    return receipts[idx];
  }

  // DELETE: Void or delete a receipt from the ledger (CRUD - Delete)
  public async deleteReceipt(receiptId: string, actor: string = 'Bursary Admin', reason: string = 'Administrative cancellation / corrupted voucher'): Promise<boolean> {
    const receipts = this.getReceipts();
    const idx = receipts.findIndex(r => r.id === receiptId);
    if (idx === -1) return false;

    const receipt = receipts[idx];

    // Rollback student paid amount if was reconciled
    if (receipt.reconciliationStatus === 'RECONCILED') {
      const students = this.getStudents();
      const sIdx = students.findIndex(s => s.studentId.toUpperCase() === receipt.studentId.toUpperCase());
      if (sIdx >= 0) {
        const student = students[sIdx];
        const newPaid = Math.max(0, student.totalPaid - receipt.amount);
        const newBal = Math.max(0, student.totalTuitionBilled - newPaid);
        students[sIdx] = {
          ...student,
          totalPaid: newPaid,
          outstandingBalance: newBal,
          status: newBal <= 0 ? 'CLEARED' : newPaid > 0 ? 'PARTIAL' : 'OVERDUE',
          receipts: student.receipts.filter(id => id !== receiptId),
        };
        this.saveStudents(students);
      }
    }

    receipts.splice(idx, 1);
    this.saveReceipts(receipts);

    await this.appendAuditLog({
      timestamp: new Date().toISOString(),
      actor,
      role: 'BURSAR',
      action: 'LEDGER_RECORD_DELETED',
      details: `Voided/Deleted Receipt #${receipt.transactionRef} ($${receipt.amount.toFixed(2)}) for student ${receipt.studentId}. Reason: ${reason}`,
      receiptId,
      studentId: receipt.studentId,
      ipAddress: '10.204.14.88 (Bursary Web Terminal)',
    });

    return true;
  }

  // CREATE: Add a manual receipt entry without OCR (CRUD - Create)
  public async createManualReceipt(data: Omit<ReceiptData, 'id' | 'auditChecksum'>, actor: string = 'Bursary Admin'): Promise<ReceiptData> {
    const id = `REC-MAN-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const rawData = `${id}|${data.studentId}|${data.amount}|${data.transactionRef}|${data.paymentDate}`;
    const auditChecksum = await computeSHA256(rawData);

    const fullReceipt: ReceiptData = {
      ...data,
      id,
      auditChecksum,
      syncStatus: 'SYNCED',
      isEncryptedInCloud: true,
      verifiedBy: actor,
    };

    return (await this.reconcileAndCommit(fullReceipt, actor)).receipt;
  }

  // Student Account CRUD: Update student billing or profile
  public async updateStudentAccount(updated: StudentAccount, actor: string = 'Bursary Admin'): Promise<StudentAccount> {
    const students = this.getStudents();
    const idx = students.findIndex(s => s.studentId === updated.studentId);
    if (idx === -1) {
      students.push(updated);
    } else {
      students[idx] = updated;
    }
    this.saveStudents(students);

    await this.appendAuditLog({
      timestamp: new Date().toISOString(),
      actor,
      role: 'BURSAR',
      action: 'STUDENT_LEDGER_MODIFIED',
      details: `Updated financial profile for ${updated.fullName} (${updated.studentId}). Billed: $${updated.totalTuitionBilled.toFixed(2)}, Paid: $${updated.totalPaid.toFixed(2)}, Status: ${updated.status}.`,
      studentId: updated.studentId,
      ipAddress: '10.204.14.88 (Bursary Web Terminal)',
    });

    return updated;
  }
}
