import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserCheck, 
  GraduationCap, 
  DollarSign, 
  Edit2, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Search,
  Check
} from 'lucide-react';
import { StudentAccount } from '../types';

interface StudentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentAccount[];
  onSaveStudent: (student: StudentAccount) => Promise<void>;
}

export const StudentManagerModal: React.FC<StudentManagerModalProps> = ({
  isOpen,
  onClose,
  students,
  onSaveStudent,
}) => {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingStudent, setEditingStudent] = useState<StudentAccount | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filtered = students.filter(s =>
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.faculty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (s: StudentAccount) => {
    setEditingStudent({ ...s });
    setSuccessMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setIsSaving(true);
    try {
      // Recalculate status and balance
      const newBal = Math.max(0, editingStudent.totalTuitionBilled - editingStudent.totalPaid);
      const newStatus = newBal <= 0 ? 'CLEARED' : editingStudent.totalPaid > 0 ? 'PARTIAL' : 'OVERDUE';
      const updated: StudentAccount = {
        ...editingStudent,
        outstandingBalance: newBal,
        status: newStatus,
      };

      await onSaveStudent(updated);
      setSuccessMsg(`Updated student ${updated.fullName} (${updated.studentId}) successfully!`);
      setEditingStudent(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 text-left animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Student Account &amp; Tuition Directory (CRUD)</h3>
              <p className="text-xs text-slate-400">Institutional fee assessment, program billing &amp; exam clearance</p>
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

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Search bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search students by name, matric ID, or faculty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total: {students.length} Enrolled
            </span>
          </div>

          {/* Edit Form if selected */}
          {editingStudent && (
            <form onSubmit={handleSave} className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900">
                  Editing Student Record: {editingStudent.fullName} ({editingStudent.studentId})
                </span>
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="text-xs text-purple-700 hover:text-purple-900 font-semibold"
                >
                  Cancel Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={editingStudent.fullName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 mt-0.5"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Program / Degree</label>
                  <input
                    type="text"
                    value={editingStudent.program}
                    onChange={(e) => setEditingStudent({ ...editingStudent, program: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 mt-0.5"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Faculty</label>
                  <input
                    type="text"
                    value={editingStudent.faculty}
                    onChange={(e) => setEditingStudent({ ...editingStudent, faculty: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 mt-0.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="font-bold text-slate-700">Total Billed Tuition ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingStudent.totalTuitionBilled}
                    onChange={(e) => setEditingStudent({ ...editingStudent, totalTuitionBilled: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 mt-0.5 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Phone (WhatsApp Alerts)</label>
                  <input
                    type="text"
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 mt-0.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Institutional Email</label>
                  <input
                    type="email"
                    value={editingStudent.email}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 mt-0.5"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-700"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold"
                >
                  {isSaving ? 'Saving...' : 'Save Student Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Students Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 sticky top-0 text-slate-600 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Student &amp; Matric</th>
                  <th className="py-2.5 px-3">Faculty / Program</th>
                  <th className="py-2.5 px-3">Billed Tuition</th>
                  <th className="py-2.5 px-3">Reconciled Paid</th>
                  <th className="py-2.5 px-3">Balance</th>
                  <th className="py-2.5 px-3">Clearance</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map(s => (
                  <tr key={s.studentId} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{s.fullName}</div>
                      <div className="font-mono text-[10px] text-slate-500">{s.studentId}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800">{s.faculty}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{s.program}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                      ${s.totalTuitionBilled.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                      ${s.totalPaid.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      <span className={s.outstandingBalance <= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                        ${s.outstandingBalance.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'CLEARED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'PARTIAL'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleEditClick(s)}
                        className="p-1 rounded text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition"
                        title="Edit Student Tuition Assessment"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition"
            >
              Close Directory
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
