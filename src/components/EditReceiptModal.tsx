import React, { useState } from 'react';
import { 
  X, 
  Edit3, 
  Building2, 
  User, 
  Hash, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { ReceiptData } from '../types';

interface EditReceiptModalProps {
  receipt: ReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedReceipt: ReceiptData) => Promise<void>;
}

export const EditReceiptModal: React.FC<EditReceiptModalProps> = ({
  receipt,
  isOpen,
  onClose,
  onUpdate,
}) => {
  if (!isOpen || !receipt) return null;

  const [studentName, setStudentName] = useState<string>(receipt.studentName);
  const [studentId, setStudentId] = useState<string>(receipt.studentId);
  const [bankName, setBankName] = useState<string>(receipt.bankName);
  const [bankBranch, setBankBranch] = useState<string>(receipt.bankBranch);
  const [transactionRef, setTransactionRef] = useState<string>(receipt.transactionRef);
  const [amount, setAmount] = useState<number>(receipt.amount);
  const [paymentDate, setPaymentDate] = useState<string>(receipt.paymentDate);
  const [reconciliationStatus, setReconciliationStatus] = useState<'RECONCILED' | 'PENDING_AUDIT' | 'FLAGGED_DISCREPANCY' | 'REJECTED'>(
    receipt.reconciliationStatus
  );
  const [notes, setNotes] = useState<string>(receipt.notes || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount <= 0) {
      setError('Amount must be positive.');
      return;
    }
    if (!transactionRef.trim()) {
      setError('Transaction reference cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated: ReceiptData = {
        ...receipt,
        studentName: studentName.trim(),
        studentId: studentId.trim().toUpperCase(),
        bankName,
        bankBranch,
        transactionRef: transactionRef.trim().toUpperCase(),
        amount,
        paymentDate,
        reconciliationStatus,
        notes,
      };

      await onUpdate(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update receipt.');
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
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Edit Audit Record (CRUD - Update)</h3>
              <p className="text-xs text-slate-400">
                Receipt ID: <span className="font-mono text-indigo-300">{receipt.id}</span>
              </p>
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
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              {error}
            </div>
          )}

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Modifying financial records triggers an automated audit trail log with your Bursar credentials and updates the student's tuition account balance accordingly.
            </p>
          </div>

          {/* Student ID & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Student ID</span>
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student Full Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Bank Name & Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Bank Name</span>
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bank Branch
              </label>
              <input
                type="text"
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Ref & Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <Hash className="w-3.5 h-3.5 text-slate-500" />
                <span>Transaction Ref</span>
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                <span>Amount ($)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Status & Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reconciliation Audit Status
            </label>
            <select
              value={reconciliationStatus}
              onChange={(e) => setReconciliationStatus(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="RECONCILED">RECONCILED (Approved &amp; Ledger Credited)</option>
              <option value="PENDING_AUDIT">PENDING_AUDIT (Awaiting Verification)</option>
              <option value="FLAGGED_DISCREPANCY">FLAGGED_DISCREPANCY (Discrepancy Detected)</option>
              <option value="REJECTED">REJECTED (Invalid or Voided)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bursar Correction Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Reason for editing or ledger correction details..."
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-mono">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              <span>Cryptographically logged</span>
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
                className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving Changes...' : 'Save Audit Updates'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
