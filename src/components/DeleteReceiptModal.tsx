import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  AlertTriangle, 
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { ReceiptData } from '../types';

interface DeleteReceiptModalProps {
  receipt: ReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (receiptId: string, reason: string) => Promise<void>;
}

export const DeleteReceiptModal: React.FC<DeleteReceiptModalProps> = ({
  receipt,
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen || !receipt) return null;

  const [reason, setReason] = useState<string>('Erroneous duplicate entry / Bank request to cancel');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>('');

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirmDelete(receipt.id, reason);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const isConfirmed = confirmText.trim().toUpperCase() === 'VOID';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-rose-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Void / Delete Ledger Record (CRUD - Delete)</h3>
              <p className="text-xs text-rose-200">Irreversible accounting ledger action</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 text-rose-300 hover:text-white rounded-lg hover:bg-rose-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
            <div className="text-xs font-bold text-rose-900">
              Receipt Reference: <span className="font-mono text-rose-700">{receipt.transactionRef}</span>
            </div>
            <div className="text-xs text-rose-800">
              Student: <strong>{receipt.studentName}</strong> ({receipt.studentId})
            </div>
            <div className="text-xs text-rose-800">
              Amount Credited: <strong>${receipt.amount.toFixed(2)}</strong> via {receipt.bankName}
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Deleting this record will <strong>roll back ${receipt.amount.toFixed(2)}</strong> from student {receipt.studentId}'s paid balance, increasing their outstanding fees. A SHA-256 tamper-evident void log will be permanently appended to the Audit Trail.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Cancellation / Voiding Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Type <span className="font-mono font-black text-rose-600">VOID</span> to confirm:
            </label>
            <input
              type="text"
              placeholder="VOID"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!isConfirmed || isDeleting}
              onClick={handleDelete}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold shadow-md transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'Voiding...' : 'Confirm Void & Delete'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
