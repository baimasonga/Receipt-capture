import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Mail, 
  Bell, 
  Send, 
  CheckCircle2, 
  Clock, 
  Smartphone, 
  Building2, 
  ShieldCheck, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { NotificationPayload, StudentAccount } from '../types';

interface AlertCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationPayload[];
  students: StudentAccount[];
  onDispatchAlert: (payload: Omit<NotificationPayload, 'id' | 'sentAt' | 'status'>) => void;
}

export const AlertCenterModal: React.FC<AlertCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  students,
  onDispatchAlert,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'PREVIEW' | 'DISPATCH' | 'HISTORY'>('PREVIEW');
  const [selectedChannel, setSelectedChannel] = useState<'WHATSAPP' | 'EMAIL' | 'PUSH'>('WHATSAPP');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.studentId || '');
  const [customSubject, setCustomSubject] = useState<string>('Bursary Outstanding Balance Notice');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const currentStudent = students.find(s => s.studentId === selectedStudentId) || students[0];

  const handleSend = async () => {
    setIsSending(true);
    const message = customMessage || (
      selectedChannel === 'WHATSAPP'
        ? `🏛️ *METROPOLITAN UNIVERSITY BURSARY*\n\nDear *${currentStudent.fullName}* (${currentStudent.studentId}),\n\n📌 *Outstanding Balance Update:*\n• Billed Tuition: $${currentStudent.totalTuitionBilled.toFixed(2)}\n• Total Paid: $${currentStudent.totalPaid.toFixed(2)}\n• Remaining Balance: *${currentStudent.outstandingBalance <= 0 ? 'CLEARED ($0.00) 🎓' : `$${currentStudent.outstandingBalance.toFixed(2)}`}*\n\nPlease ensure full reconciliation prior to the upcoming semester examination registration deadline.\n\n📄 Student Portal: https://bursary.univ.edu/portal`
        : `Official University Bursary statement for ${currentStudent.fullName}. Remaining balance: $${currentStudent.outstandingBalance.toFixed(2)}.`
    );

    onDispatchAlert({
      studentId: currentStudent.studentId,
      studentName: currentStudent.fullName,
      recipientContact: selectedChannel === 'WHATSAPP' ? currentStudent.phone : currentStudent.email,
      channel: selectedChannel,
      subject: customSubject,
      message,
      balanceRemaining: currentStudent.outstandingBalance,
    });

    setIsSending(false);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
    setCustomMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>Automated WhatsApp &amp; Email Student Alert Dispatcher</span>
              </h3>
              <p className="text-xs text-slate-400">
                Real-time multi-channel alerts for bank deposit confirmations and balance status
              </p>
            </div>
          </div>

          <button
            id="btn-close-alert-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex space-x-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('PREVIEW')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'PREVIEW'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interactive Preview (WhatsApp &amp; Email)
            </button>
            <button
              onClick={() => setActiveTab('DISPATCH')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'DISPATCH'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Send New Alert
            </button>
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'HISTORY'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dispatch Log ({notifications.length})
            </button>
          </div>

          {successToast && (
            <div className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center space-x-1 animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Alert dispatched successfully!</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: INTERACTIVE PREVIEW */}
          {activeTab === 'PREVIEW' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* WhatsApp Mockup Preview */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp Automated Alert</span>
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    Verified Green Badge
                  </span>
                </div>

                <div className="bg-[#EFEAE2] rounded-2xl p-4 border border-slate-300 flex-1 flex flex-col justify-between shadow-inner min-h-[420px]">
                  {/* WhatsApp chat header */}
                  <div className="bg-[#005E54] text-white p-2.5 rounded-t-xl -m-4 mb-4 flex items-center space-x-2.5 shadow-xs">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                      🏛️
                    </div>
                    <div>
                      <div className="font-bold text-xs flex items-center space-x-1">
                        <span>UniBursar Official</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                      </div>
                      <div className="text-[10px] text-emerald-200">
                        Official Institutional Account
                      </div>
                    </div>
                  </div>

                  {/* Message Bubble */}
                  <div className="bg-white rounded-lg p-3.5 shadow-sm text-xs text-slate-800 space-y-2 border-l-4 border-emerald-600">
                    <div className="font-bold text-emerald-800 text-[11px]">
                      METROPOLITAN UNIVERSITY BURSARY
                    </div>
                    <p>
                      Dear <strong>{currentStudent.fullName}</strong> ({currentStudent.studentId}),
                    </p>
                    <p className="bg-slate-50 p-2 rounded border border-slate-200">
                      ✅ Your bank teller deposit slip has been reconciled into the institutional financial ledger.
                    </p>
                    <div className="space-y-1 text-[11px]">
                      <div>• Total Billed Tuition: <strong>${currentStudent.totalTuitionBilled.toFixed(2)}</strong></div>
                      <div>• Total Paid to Date: <strong className="text-emerald-700">${currentStudent.totalPaid.toFixed(2)}</strong></div>
                      <div>
                        • Outstanding Balance: <strong className={currentStudent.outstandingBalance > 0 ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                          {currentStudent.outstandingBalance <= 0 ? 'CLEARED ($0.00) 🎓' : `$${currentStudent.outstandingBalance.toFixed(2)}`}
                        </strong>
                      </div>
                      <div>• Status: <strong>{currentStudent.status}</strong></div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex flex-col space-y-1">
                      <button className="w-full py-1 px-2 bg-emerald-50 text-emerald-800 rounded font-semibold text-[10px] flex items-center justify-center space-x-1">
                        <span>View Electronic Receipt Voucher</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <div className="text-[9px] text-slate-400 text-right">
                      Delivered • 10:42 AM
                    </div>
                  </div>

                  {/* WhatsApp Quick Actions Footer */}
                  <div className="mt-4 pt-2 border-t border-slate-300/60 text-center text-[10px] text-slate-500">
                    Automated webhook response via Institutional Twilio/Meta API
                  </div>
                </div>
              </div>

              {/* Official Email Letterhead Preview */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <span>Official Institutional Email</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    bursary@univ.edu
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 flex-1 flex flex-col shadow-xs text-left min-h-[420px]">
                  {/* Letterhead */}
                  <div className="border-b-2 border-slate-900 pb-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-black text-sm text-slate-900 tracking-tight">
                          METROPOLITAN UNIVERSITY
                        </h4>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase">
                          Directorate of Bursary &amp; Internal Audit
                        </p>
                      </div>
                      <div className="text-right text-[10px] text-slate-400 font-mono">
                        REF: BUR/2025/REC-092
                      </div>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="space-y-3 text-xs text-slate-700 flex-1">
                    <p>
                      <strong>To:</strong> {currentStudent.fullName} &lt;{currentStudent.email}&gt;
                    </p>
                    <p>
                      <strong>Subject:</strong> Official University Bursary Receipt &amp; Account Clearance Statement
                    </p>
                    <p>
                      This official communication confirms that your commercial bank payment has been verified by the Central Interbank Settlement Switch and credited to your student ledger.
                    </p>
                    
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] space-y-1">
                      <div className="flex justify-between font-medium">
                        <span>Student ID:</span>
                        <span className="font-mono">{currentStudent.studentId}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Academic Program:</span>
                        <span>{currentStudent.program}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Current Outstanding Balance:</span>
                        <span className="font-bold text-slate-900">${currentStudent.outstandingBalance.toFixed(2)} USD</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {currentStudent.outstandingBalance <= 0
                        ? 'Your financial clearance is complete. You may proceed to print your semester examination admit cards.'
                        : 'Please settle any remaining balance prior to the close of registration to prevent examination holds.'}
                    </p>
                  </div>

                  {/* Digital Signature */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <div>
                      <div className="font-bold text-slate-800">University Bursar &amp; Chief Financial Officer</div>
                      <div>Certified Cryptographic Timestamp: {new Date().toLocaleDateString()}</div>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DISPATCH NEW ALERT */}
          {activeTab === 'DISPATCH' && (
            <div className="max-w-xl mx-auto text-left space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Recipient Student:
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  {students.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.fullName} ({s.studentId}) - Outstanding: ${s.outstandingBalance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Alert Delivery Channel:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('WHATSAPP')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                      selectedChannel === 'WHATSAPP'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedChannel('EMAIL')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                      selectedChannel === 'EMAIL'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedChannel('PUSH')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                      selectedChannel === 'PUSH'
                        ? 'border-purple-600 bg-purple-50 text-purple-800 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5 text-purple-600" />
                    <span>Mobile Push</span>
                  </button>
                </div>
              </div>

              {selectedChannel === 'EMAIL' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Subject:
                  </label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Custom Alert Message (Leave blank for automated template):
                </label>
                <textarea
                  rows={5}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Enter custom reminder notes, bank reference updates, or enrollment deadline notices..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                id="btn-dispatch-alert-now"
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch {selectedChannel} Alert to {currentStudent.fullName}</span>
              </button>
            </div>
          )}

          {/* TAB 3: DISPATCH LOG / HISTORY */}
          {activeTab === 'HISTORY' && (
            <div className="text-left space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Real-time Multi-channel Notification Telemetry
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No automated alerts dispatched yet. Reconcile receipts or send test alerts to see telemetry here.
                </div>
              ) : (
                <div className="divide-y divide-slate-200 bg-slate-50 rounded-xl border border-slate-200">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3.5 flex items-start justify-between gap-3 text-xs">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-white border border-slate-200 mt-0.5">
                          {n.channel === 'WHATSAPP' ? (
                            <MessageSquare className="w-4 h-4 text-emerald-600" />
                          ) : n.channel === 'EMAIL' ? (
                            <Mail className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Bell className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900">{n.studentName}</span>
                            <span className="font-mono text-[10px] text-slate-500">({n.studentId})</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-200 text-slate-700">
                              {n.channel}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1 line-clamp-2 text-[11px]">
                            {n.message}
                          </p>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Recipient: {n.recipientContact} • Timestamp: {new Date(n.sentAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center space-x-1 text-emerald-600 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>DELIVERED</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
