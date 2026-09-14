export interface ProjectCategory {
  id: string;
  code: string; // e.g., "GL-4101-ENG"
  name: string; // e.g., "Faculty of Engineering Tuition Fund"
  allocatedAmount: number;
  department: string;
  percentage: number;
}

export interface BankValidationResult {
  isValid: boolean;
  bankMatchStatus: 'MATCH_VERIFIED' | 'AMOUNT_MISMATCH' | 'REF_NOT_FOUND' | 'DUPLICATE_DETECTED';
  settlementRef: string;
  clearingBank: string;
  clearedAmount: number;
  clearedTimestamp: string;
  message: string;
  interbankSwitchCode: string;
}

export interface ReceiptData {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  bankName: string;
  bankBranch: string;
  transactionRef: string;
  paymentDate: string;
  amount: number;
  currency: string;
  academicSession: string;
  semester: string;
  tellerStampDetected: boolean;
  tellerSignaturePresent: boolean;
  ocrConfidenceScore: number; // 0 - 100
  receiptImageUrl?: string;
  projectCategories: ProjectCategory[];
  bankValidation: BankValidationResult;
  reconciliationStatus: 'RECONCILED' | 'PENDING_AUDIT' | 'FLAGGED_DISCREPANCY' | 'REJECTED';
  auditChecksum: string; // SHA-256
  isEncryptedInCloud: boolean;
  cloudStoragePath: string;
  syncStatus: 'SYNCED' | 'OFFLINE_PENDING' | 'SYNCING' | 'CONFLICT';
  createdAt: string;
  verifiedBy?: string;
  notes?: string;
}

export interface StudentAccount {
  studentId: string;
  fullName: string;
  email: string;
  phone: string;
  program: string;
  faculty: string;
  academicYear: string;
  totalTuitionBilled: number;
  totalPaid: number;
  outstandingBalance: number;
  status: 'CLEARED' | 'PARTIAL' | 'OVERDUE' | 'PROBATION';
  receipts: string[]; // receipt IDs
  lastAlertSent?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: 'BURSAR' | 'AUDITOR' | 'SYSTEM_API' | 'STUDENT';
  action: string;
  details: string;
  receiptId?: string;
  studentId?: string;
  checksum: string;
  ipAddress: string;
}

export interface NotificationPayload {
  id: string;
  studentId: string;
  studentName: string;
  recipientContact: string;
  channel: 'WHATSAPP' | 'EMAIL' | 'PUSH';
  subject?: string;
  message: string;
  status: 'DELIVERED' | 'PENDING' | 'FAILED';
  sentAt: string;
  receiptId?: string;
  amount?: number;
  balanceRemaining?: number;
}

export interface BankLedgerRecord {
  transactionRef: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  currency: string;
  bankName: string;
  branch: string;
  depositedBy: string;
  studentMatricNo: string;
  depositDate: string;
  clearingStatus: 'SETTLED' | 'PENDING' | 'REVERSED';
  isClaimed: boolean;
  claimedByReceiptId?: string;
}
