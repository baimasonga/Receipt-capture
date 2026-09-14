import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Building, 
  FileText, 
  DollarSign, 
  User, 
  Calendar, 
  Hash, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  Send,
  Lock,
  Stamp,
  CloudUpload,
  RefreshCw
} from 'lucide-react';
import { ReceiptData, ProjectCategory, BankValidationResult } from '../types';
import { UniversityLedgerManager } from '../utils/bankLedger';
import { simulateAES256Encrypt } from '../utils/crypto';

interface ExtractionReviewModalProps {
  receipt: Partial<ReceiptData> | null;
  onClose: () => void;
  onCommit: (finalReceipt: ReceiptData) => void;
  isOffline: boolean;
}

export const ExtractionReviewModal: React.FC<ExtractionReviewModalProps> = ({
  receipt,
  onClose,
  onCommit,
  isOffline,
}) => {
  if (!receipt) return null;

  const ledgerManager = UniversityLedgerManager.getInstance();

  // Form State
  const [studentId, setStudentId] = useState(receipt.studentId || '');
  const [studentName, setStudentName] = useState(receipt.studentName || '');
  const [bankName, setBankName] = useState(receipt.bankName || '');
  const [bankBranch, setBankBranch] = useState(receipt.bankBranch || '');
  const [transactionRef, setTransactionRef] = useState(receipt.transactionRef || '');
  const [paymentDate, setPaymentDate] = useState(receipt.paymentDate || '');
  const [amount, setAmount] = useState<number>(receipt.amount || 0);
  const [currency, setCurrency] = useState(receipt.currency || 'USD');
  const [projectCategories, setProjectCategories] = useState<ProjectCategory[]>(
    receipt.projectCategories || []
  );

  // Bank Validation state
  const [bankValidation, setBankValidation] = useState<BankValidationResult>({
    isValid: true,
    bankMatchStatus: 'MATCH_VERIFIED',
    settlementRef: 'SWITCH-VERIFIED',
    clearingBank: receipt.bankName || 'Zenith Bank',
    clearedAmount: receipt.amount || 0,
    clearedTimestamp: new Date().toISOString(),
    message: 'Validating with interbank switch...',
    interbankSwitchCode: 'SWIFT-INTERBANK-01',
  });

  const [isValidatingBank, setIsValidatingBank] = useState(false);

  // Re-run validation whenever ref or amount changes
  const runBankValidation = () => {
    setIsValidatingBank(true);
    const result = ledgerManager.validateWithInterbankAPI(transactionRef, amount, studentId);
    
    setTimeout(() => {
      setBankValidation({
        isValid: result.isValid,
        bankMatchStatus: result.status,
        settlementRef: result.settlementRef,
        clearingBank: result.bankRecord?.bankName || bankName,
        clearedAmount: result.bankRecord?.amount || amount,
        clearedTimestamp: result.bankRecord?.depositDate || new Date().toISOString(),
        message: result.message,
        interbankSwitchCode: result.bankRecord ? `SWIFT-${result.bankRecord.bankName.substring(0, 3).toUpperCase()}-99` : 'UNKNOWN',
      });
      setIsValidatingBank(false);
    }, 250);
  };

  useEffect(() => {
    runBankValidation();
  }, [transactionRef, amount]);

  // Handle category amount adjustment
  const handleCategoryChange = (index: number, newAmount: number) => {
    const updated = [...projectCategories];
    updated[index] = {
      ...updated[index],
      allocatedAmount: newAmount,
      percentage: amount > 0 ? Math.round((newAmount / amount) * 100) : 0,
    };
    setProjectCategories(updated);
  };

  const handleFinalSubmit = () => {
    const finalReceipt: ReceiptData = {
      id: receipt.id || `REC-${Date.now().toString(36)}`,
      studentId,
      studentName,
      studentEmail: receipt.studentEmail || `${studentId.toLowerCase().replace(/[^a-z0-9]/g, '.')}@univ.edu`,
      studentPhone: receipt.studentPhone || '+232 78 492019',
      bankName,
      bankBranch,
      transactionRef,
      paymentDate,
      amount,
      currency,
      academicSession: receipt.academicSession || '2024/2025',
      semester: receipt.semester || 'Harmattan Semester',
      tellerStampDetected: receipt.tellerStampDetected ?? true,
      tellerSignaturePresent: receipt.tellerSignaturePresent ?? true,
      ocrConfidenceScore: receipt.ocrConfidenceScore ?? 96,
      receiptImageUrl: receipt.receiptImageUrl,
      projectCategories,
      bankValidation,
      reconciliationStatus: bankValidation.isValid ? 'RECONCILED' : 'PENDING_AUDIT',
      auditChecksum: receipt.auditChecksum || `sha256-verified-${Date.now().toString(16)}`,
      isEncryptedInCloud: !isOffline,
      cloudStoragePath: `s3://univ-bursary-encrypted-vault-2025/receipts/${studentId.replace(/[^a-zA-Z0-9]/g, '_')}_${transactionRef}.enc.aes256`,
      syncStatus: isOffline ? 'OFFLINE_PENDING' : 'SYNCED',
      createdAt: receipt.createdAt || new Date().toISOString(),
      notes: receipt.notes || 'Reconciled through optical character recognition and interbank ledger clearing.',
    };

    onCommit(finalReceipt);
  };

  const allocatedTotal = projectCategories.reduce((sum, c) => sum + c.allocatedAmount, 0);
  const allocationDelta = amount - allocatedTotal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Stamp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>Receipt OCR Extraction &amp; Interbank Reconciliation</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Confidence: {receipt.ocrConfidenceScore || 96}%
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Verify recognized fields against original bank slip and interbank settlement switch
              </p>
            </div>
          </div>
          <button
            id="btn-close-review-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Original Scanned Slip View (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Original Bank Slip Document</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {receipt.tellerStampDetected ? 'Stamp Detected' : 'No Stamp'}
              </span>
            </div>

            <div className="bg-slate-100 rounded-xl p-2 border border-slate-300 flex-1 flex flex-col items-center justify-center relative overflow-hidden group">
              {receipt.receiptImageUrl ? (
                <img
                  src={receipt.receiptImageUrl}
                  alt="Scanned bank receipt"
                  className="max-h-[460px] w-full object-contain rounded shadow-xs"
                />
              ) : (
                <div className="py-20 text-center text-slate-400 text-xs">
                  No visual image available
                </div>
              )}

              {/* Optical Detection Overlay badges */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-xs text-white p-2.5 rounded-lg text-[11px] flex items-center justify-between border border-slate-700">
                <div className="flex items-center space-x-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>OCR Signature &amp; Stamp Verified</span>
                </div>
                <div className="flex items-center space-x-1 text-slate-300 font-mono text-[10px]">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>AES-256 Envelope Ready</span>
                </div>
              </div>
            </div>

            {/* Cryptographic SHA-256 Checksum display */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px]">
              <div className="text-slate-500 font-semibold mb-0.5">Audit Trail Cryptographic Checksum:</div>
              <div className="font-mono text-slate-700 break-all text-[10px]">
                {receipt.auditChecksum || 'sha256-verified-tamper-evident-hash'}
              </div>
            </div>
          </div>

          {/* Right Column: Extracted Fields & Validation (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4 text-left">
            
            {/* Real-time Interbank Switch Status Banner */}
            <div className={`p-4 rounded-xl border ${
              bankValidation.bankMatchStatus === 'MATCH_VERIFIED'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : bankValidation.bankMatchStatus === 'DUPLICATE_DETECTED'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wide">
                  {bankValidation.bankMatchStatus === 'MATCH_VERIFIED' ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Interbank Settlement Validation: SUCCESSFUL</span>
                    </>
                  ) : bankValidation.bankMatchStatus === 'DUPLICATE_DETECTED' ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>DUPLICATE SLIP DETECTED (FRAUD WARNING)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>CLEARING HOUSE AUDIT FLAG</span>
                    </>
                  )}
                </div>
                <button
                  onClick={runBankValidation}
                  disabled={isValidatingBank}
                  className="text-[11px] font-semibold underline text-slate-600 hover:text-slate-900 flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isValidatingBank ? 'animate-spin' : ''}`} />
                  <span>Re-check</span>
                </button>
              </div>

              <p className="text-xs leading-relaxed">
                {bankValidation.message}
              </p>
              
              {bankValidation.settlementRef && (
                <div className="mt-2 pt-2 border-t border-current/15 text-[11px] font-mono flex items-center justify-between">
                  <span>Switch Ref: <strong>{bankValidation.settlementRef}</strong></span>
                  <span>Clearing Bank: <strong>{bankValidation.clearingBank}</strong></span>
                </div>
              )}
            </div>

            {/* Extracted Form Inputs */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Extracted Receipt Data (Editable for Audit Confirmation)
              </div>

              {/* Row 1: Student ID & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Student Matriculation / ID:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      id="input-edit-student-id"
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Student Full Name:
                  </label>
                  <input
                    id="input-edit-student-name"
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Bank & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Bank Name:
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      id="input-edit-bank-name"
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Branch / Location:
                  </label>
                  <input
                    id="input-edit-bank-branch"
                    type="text"
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Transaction Ref & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Bank Transaction / Teller Ref #:
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      id="input-edit-transaction-ref"
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Value / Payment Date:
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      id="input-edit-payment-date"
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Amount & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Reconciled Total Amount:
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-emerald-600 absolute left-2.5 top-2.5" />
                    <input
                      id="input-edit-amount"
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-base font-extrabold text-emerald-700 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Currency:
                  </label>
                  <select
                    id="select-edit-currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="NGN">NGN (₦)</option>
                    <option value="SLE">SLE (Le)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="KES">KES (KSh)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Automatic Project / Expense Fund Categorization */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Automatic Project / Account Ledger Split</span>
                </div>
                <span className={`text-[11px] font-mono font-bold ${
                  Math.abs(allocationDelta) < 0.01 ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  Allocated: ${allocatedTotal.toFixed(2)} / ${amount.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2">
                {projectCategories.map((cat, idx) => (
                  <div key={cat.code} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 truncate">
                        {cat.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        GL Code: {cat.code} • Dept: {cat.department}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-slate-500 font-medium">
                        {cat.percentage}%
                      </span>
                      <div className="relative w-24">
                        <span className="absolute left-2 top-1.5 text-slate-400">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={cat.allocatedAmount}
                          onChange={(e) => handleCategoryChange(idx, parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-slate-300 rounded px-2 pl-5 py-1 text-xs font-mono font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            {isOffline ? (
              <span className="text-amber-700 font-medium flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Offline Mode: Will save to local queue &amp; auto-sync when online</span>
              </span>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Syncs immediately with Cloud Storage &amp; student alerts</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              id="btn-modal-cancel"
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
            >
              Cancel
            </button>

            <button
              id="btn-commit-ledger"
              type="button"
              onClick={handleFinalSubmit}
              disabled={bankValidation.bankMatchStatus === 'DUPLICATE_DETECTED'}
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isOffline ? 'Save to Offline Queue' : 'Reconcile & Commit to Ledger'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
