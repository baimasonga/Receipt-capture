import React, { useState } from 'react';
import { 
  GraduationCap, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  Camera, 
  QrCode, 
  Building2, 
  FileText, 
  ShieldCheck, 
  MessageSquare,
  ArrowUpRight,
  Printer
} from 'lucide-react';
import { StudentAccount, ReceiptData } from '../types';

interface StudentPortalViewProps {
  student: StudentAccount;
  receipts: ReceiptData[];
  onOpenScanner: () => void;
  onViewReceiptDetail: (receipt: ReceiptData) => void;
  onOpenAlerts: () => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  student,
  receipts,
  onOpenScanner,
  onViewReceiptDetail,
  onOpenAlerts,
}) => {
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<ReceiptData | null>(null);

  const studentReceipts = receipts.filter(
    r => r.studentId.toUpperCase() === student.studentId.toUpperCase()
  );

  const isCleared = student.outstandingBalance <= 0;

  return (
    <div className="space-y-6 text-left">
      
      {/* Student Welcome & Financial Health Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-inner">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight">
                  {student.fullName}
                </h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                  {student.studentId}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {student.program} • {student.faculty}
              </p>
            </div>
          </div>

          {/* Quick Action: Scan My Bank Slip */}
          <div className="flex items-center space-x-3">
            <button
              id="btn-student-scan-slip"
              onClick={onOpenScanner}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Bank Deposit Slip</span>
            </button>
          </div>
        </div>

        {/* Financial Progress Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-700/60">
          
          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Billed Tuition
            </span>
            <div className="text-xl font-black text-slate-100 mt-0.5">
              ${student.totalTuitionBilled.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Session 2024/2025 Approved Fees
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Reconciled by Bank
            </span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              ${student.totalPaid.toFixed(2)}
            </div>
            <div className="text-[11px] text-emerald-300/80 mt-1 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{studentReceipts.length} verified slip(s)</span>
            </div>
          </div>

          <div className={`rounded-xl p-3.5 border ${
            isCleared
              ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
              : 'bg-amber-950/60 border-amber-600 text-amber-200'
          }`}>
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
              Outstanding Balance
            </span>
            <div className="text-xl font-black mt-0.5">
              ${student.outstandingBalance.toFixed(2)}
            </div>
            <div className="text-[11px] font-bold mt-1">
              {isCleared ? 'CLEARED FOR EXAMS & REGISTRATION 🎓' : 'PARTIAL - SETTLE BEFORE ENROLLMENT DEADLINE'}
            </div>
          </div>

        </div>
      </div>

      {/* Official Electronic Clearance Certificate preview if cleared */}
      {isCleared && (
        <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-900">
                Official Bursary Financial Clearance Active
              </h4>
              <p className="text-xs text-emerald-700">
                All institutional dues for the 2024/2025 academic session have been cleared. Examination admit cards and semester registration are unlocked.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (studentReceipts.length > 0) setSelectedReceiptForPrint(studentReceipts[0]);
            }}
            className="shrink-0 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition inline-flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download Clearance Slip</span>
          </button>
        </div>
      )}

      {/* My Submitted Bank Receipts */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              My Bank Payment Slips &amp; Reconciliation History
            </h3>
            <p className="text-xs text-slate-500">
              Scanned bank counter receipts matched against central university accounts
            </p>
          </div>
          <button
            onClick={onOpenAlerts}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center space-x-1"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp / Email Alert Log</span>
          </button>
        </div>

        {studentReceipts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">
              No bank payment receipts recorded yet
            </h4>
            <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
              After paying tuition or dues at any commercial bank branch, use the camera scanner to upload your teller slip for instant optical validation.
            </p>
            <button
              onClick={onOpenScanner}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Bank Receipt Now</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {studentReceipts.map((rec) => (
              <div key={rec.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition">
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold shrink-0">
                    <Building2 className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">
                        {rec.bankName}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        Ref: {rec.transactionRef}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Branch: {rec.bankBranch} • Paid: {rec.paymentDate}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {rec.projectCategories?.map(p => (
                        <span key={p.code} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                          {p.name}: ${p.allocatedAmount.toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4">
                  <div className="text-right">
                    <div className="text-base font-black text-emerald-700">
                      ${rec.amount.toFixed(2)} {rec.currency}
                    </div>
                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Interbank Verified</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewReceiptDetail(rec)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      View Slip
                    </button>
                    <button
                      onClick={() => setSelectedReceiptForPrint(rec)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      title="Print Official Bursary Slip"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Printable Electronic Clearance Slip Modal */}
      {selectedReceiptForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-lg w-full p-6 text-slate-900 relative">
            <button
              onClick={() => setSelectedReceiptForPrint(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>

            <div className="text-center pb-4 border-b border-slate-200 mb-4">
              <h3 className="font-extrabold text-base tracking-tight text-slate-900">
                METROPOLITAN UNIVERSITY
              </h3>
              <p className="text-xs text-slate-600 font-semibold">
                DIRECTORATE OF BURSARY &amp; INTERNAL AUDIT
              </p>
              <div className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold">
                OFFICIAL ELECTRONIC PAYMENT CLEARANCE VOUCHER
              </div>
            </div>

            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Student Name:</span>
                <span className="font-bold">{selectedReceiptForPrint.studentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Matriculation ID:</span>
                <span className="font-mono font-bold">{selectedReceiptForPrint.studentId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Bank / Branch:</span>
                <span className="font-semibold">{selectedReceiptForPrint.bankName} ({selectedReceiptForPrint.bankBranch})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Bank Transaction Ref:</span>
                <span className="font-mono font-bold text-slate-800">{selectedReceiptForPrint.transactionRef}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Amount Reconciled:</span>
                <span className="font-black text-emerald-700 text-sm">${selectedReceiptForPrint.amount.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Audit Checksum:</span>
                <span className="font-mono text-[9px] text-slate-600 break-all">{selectedReceiptForPrint.auditChecksum}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-[11px] text-slate-600 mb-4">
              <div>
                <div className="font-bold text-slate-800">Bursar Digital Seal Verified</div>
                <div>Status: Ledger Reconciled</div>
              </div>
              <QrCode className="w-10 h-10 text-slate-800" />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
