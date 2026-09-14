import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  Building2, 
  User, 
  Hash, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  ShieldCheck, 
  Layers,
  AlertCircle
} from 'lucide-react';
import { StudentAccount, ReceiptData, ProjectCategory } from '../types';

interface CreateReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentAccount[];
  onCreate: (receipt: Omit<ReceiptData, 'id' | 'auditChecksum'>) => Promise<void>;
}

const DEFAULT_BANKS = [
  'Zenith Bank PLC',
  'Standard Chartered Bank',
  'First National Bank',
  'EcoBank Pan-Africa',
  'Guaranty Trust Bank (GTBank)',
  'Access Bank International',
  'Sierra Leone Commercial Bank',
  'Rokel Commercial Bank',
];

const DEFAULT_PROJECTS: ProjectCategory[] = [
  {
    id: 'proj-1',
    code: 'GL-4101-ENG',
    name: 'Faculty of Engineering Tuition Fund',
    allocatedAmount: 1800,
    department: 'Faculty of Engineering',
    percentage: 75,
  },
  {
    id: 'proj-2',
    code: 'GL-4102-ICT',
    name: 'Campus High-Speed ICT & Fiber Levy',
    allocatedAmount: 360,
    department: 'Directorate of ICT & Computing',
    percentage: 15,
  },
  {
    id: 'proj-3',
    code: 'GL-4103-LIB',
    name: 'Central Research Library & Digital Journals',
    allocatedAmount: 240,
    department: 'University Research Libraries',
    percentage: 10,
  },
];

export const CreateReceiptModal: React.FC<CreateReceiptModalProps> = ({
  isOpen,
  onClose,
  students,
  onCreate,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.studentId || '');
  const [studentName, setStudentName] = useState<string>(students[0]?.fullName || '');
  const [bankName, setBankName] = useState<string>(DEFAULT_BANKS[0]);
  const [bankBranch, setBankBranch] = useState<string>('Main Campus Branch, Sector 4');
  const [transactionRef, setTransactionRef] = useState<string>(`MAN-${Date.now().toString(36).toUpperCase().slice(-6)}`);
  const [amount, setAmount] = useState<number>(2400.00);
  const [currency, setCurrency] = useState<string>('USD');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [academicSession, setAcademicSession] = useState<string>('2024/2025');
  const [semester, setSemester] = useState<string>('Harmattan / First Semester');
  const [reconciliationStatus, setReconciliationStatus] = useState<'RECONCILED' | 'PENDING_AUDIT'>('RECONCILED');
  const [notes, setNotes] = useState<string>('Manual bursary teller voucher entry verified against bank deposit slip.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStudentSelect = (sId: string) => {
    setSelectedStudentId(sId);
    const found = students.find(s => s.studentId === sId);
    if (found) {
      setStudentName(found.fullName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!studentName.trim() || !selectedStudentId.trim()) {
      setError('Please select or specify student details.');
      return;
    }
    if (!transactionRef.trim()) {
      setError('Transaction reference number is required.');
      return;
    }
    if (amount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    setIsSubmitting(true);

    try {
      const student = students.find(s => s.studentId === selectedStudentId);
      const studentEmail = student?.email || `${selectedStudentId.toLowerCase()}@univ.edu`;
      const studentPhone = student?.phone || '+232 78 000000';

      // Allocate project categories proportional to amount
      const allocatedProjects: ProjectCategory[] = DEFAULT_PROJECTS.map(p => ({
        ...p,
        allocatedAmount: Number(((amount * p.percentage) / 100).toFixed(2)),
      }));

      const newReceipt: Omit<ReceiptData, 'id' | 'auditChecksum'> = {
        studentId: selectedStudentId.toUpperCase(),
        studentName: studentName.trim(),
        studentEmail,
        studentPhone,
        bankName,
        bankBranch,
        transactionRef: transactionRef.trim().toUpperCase(),
        paymentDate,
        amount,
        currency,
        academicSession,
        semester,
        tellerStampDetected: true,
        tellerSignaturePresent: true,
        ocrConfidenceScore: 100, // Manual verified
        projectCategories: allocatedProjects,
        bankValidation: {
          isValid: reconciliationStatus === 'RECONCILED',
          bankMatchStatus: reconciliationStatus === 'RECONCILED' ? 'MATCH_VERIFIED' : 'REF_NOT_FOUND',
          settlementRef: `IB-MAN-${transactionRef.trim().toUpperCase()}`,
          clearingBank: bankName,
          clearedAmount: amount,
          clearedTimestamp: new Date().toISOString(),
          message: 'Manually authenticated and committed to Institutional General Ledger by Bursary Officer.',
          interbankSwitchCode: 'SWITCH-CENTRAL-MANUAL',
        },
        reconciliationStatus,
        isEncryptedInCloud: true,
        cloudStoragePath: `s3://univ-bursary-encrypted-vault-2025/receipts/manual/${selectedStudentId}_${transactionRef}.enc.aes256`,
        syncStatus: 'SYNCED',
        createdAt: new Date().toISOString(),
        verifiedBy: 'Bursary Manual Desk',
        notes,
      };

      await onCreate(newReceipt);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create manual receipt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 text-left animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Create Direct Receipt (CRUD - Create)</h3>
              <p className="text-xs text-slate-400">Manual voucher &amp; bank draft entry into institutional audit ledger</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Select Enrolled Student</span>
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => handleStudentSelect(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {students.map(s => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.studentId} — {s.fullName} ({s.faculty})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student Full Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Bank & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Deposit Bank</span>
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {DEFAULT_BANKS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <Hash className="w-3.5 h-3.5 text-slate-500" />
                <span>Transaction Reference #</span>
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                <span>Payment Amount</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Payment Date</span>
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reconciliation Status
              </label>
              <select
                value={reconciliationStatus}
                onChange={(e) => setReconciliationStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="RECONCILED">Reconciled (Auto-Credit Student)</option>
                <option value="PENDING_AUDIT">Pending Internal Audit</option>
              </select>
            </div>
          </div>

          {/* Branch & Session */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bank Branch Location</label>
              <input
                type="text"
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Session</label>
              <input
                type="text"
                value={academicSession}
                onChange={(e) => setAcademicSession(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Audit Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Auditor Remarks / Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. Physical bank deposit slip submitted to bursary counter..."
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Generates SHA-256 tamper-proof ledger checksum</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Committing...' : 'Commit to General Ledger'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
