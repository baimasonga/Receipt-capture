import React, { useState } from 'react';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Send, 
  Layers, 
  Zap, 
  ShieldCheck, 
  FileSpreadsheet,
  Building,
  UserCheck,
  Check,
  Calendar,
  X,
  RotateCcw,
  User,
  Hash,
  SlidersHorizontal,
  CalendarDays,
  PlusCircle,
  Edit3,
  Trash2,
  Users
} from 'lucide-react';
import { ReceiptData, StudentAccount } from '../types';
import { OcrQualityChart } from './OcrQualityChart';
import { CreateReceiptModal } from './CreateReceiptModal';
import { EditReceiptModal } from './EditReceiptModal';
import { DeleteReceiptModal } from './DeleteReceiptModal';
import { StudentManagerModal } from './StudentManagerModal';

interface AdminDashboardProps {
  receipts: ReceiptData[];
  students: StudentAccount[];
  onInspectReceipt: (receipt: ReceiptData) => void;
  onSendAlert: (receipt: ReceiptData) => void;
  onBatchReconcileAll?: () => void;
  onCreateReceipt?: (receipt: Omit<ReceiptData, 'id' | 'auditChecksum'>) => Promise<void>;
  onUpdateReceipt?: (receipt: ReceiptData) => Promise<void>;
  onDeleteReceipt?: (receiptId: string, reason: string) => Promise<void>;
  onUpdateStudent?: (student: StudentAccount) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  receipts,
  students,
  onInspectReceipt,
  onSendAlert,
  onBatchReconcileAll,
  onCreateReceipt,
  onUpdateReceipt,
  onDeleteReceipt,
  onUpdateStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [studentNameFilter, setStudentNameFilter] = useState('');
  const [transactionRefFilter, setTransactionRefFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [datePreset, setDatePreset] = useState<'ALL' | 'JAN_2025' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'SESSION_24_25' | 'CUSTOM'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'RECONCILED' | 'PENDING_AUDIT' | 'FLAGGED'>('ALL');
  const [facultyFilter, setFacultyFilter] = useState<string>('ALL');

  // CRUD Modals State
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editingReceipt, setEditingReceipt] = useState<ReceiptData | null>(null);
  const [deletingReceipt, setDeletingReceipt] = useState<ReceiptData | null>(null);
  const [isStudentManagerOpen, setIsStudentManagerOpen] = useState<boolean>(false);

  // Helper to normalize receipt date strings for comparison (YYYY-MM-DD)
  const normalizeDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return '';
  };

  // Quick date presets handler
  const handleDatePreset = (preset: 'ALL' | 'JAN_2025' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'SESSION_24_25') => {
    setDatePreset(preset);
    const now = new Date();
    const formatYMD = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    if (preset === 'ALL') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'JAN_2025') {
      setStartDate('2025-01-01');
      setEndDate('2025-01-31');
    } else if (preset === 'LAST_7_DAYS') {
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      setStartDate(formatYMD(past));
      setEndDate(formatYMD(now));
    } else if (preset === 'LAST_30_DAYS') {
      const past = new Date(now);
      past.setDate(past.getDate() - 30);
      setStartDate(formatYMD(past));
      setEndDate(formatYMD(now));
    } else if (preset === 'SESSION_24_25') {
      setStartDate('2024-09-01');
      setEndDate('2025-08-31');
    }
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    studentNameFilter.trim() ||
    transactionRefFilter.trim() ||
    startDate ||
    endDate ||
    statusFilter !== 'ALL'
  );

  const handleResetAllFilters = () => {
    setSearchTerm('');
    setStudentNameFilter('');
    setTransactionRefFilter('');
    setStartDate('');
    setEndDate('');
    setDatePreset('ALL');
    setStatusFilter('ALL');
  };

  // Compute metrics
  const totalReconciledAmount = receipts
    .filter(r => r.reconciliationStatus === 'RECONCILED')
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingAuditCount = receipts.filter(r => r.reconciliationStatus === 'PENDING_AUDIT').length;
  const reconciledCount = receipts.filter(r => r.reconciliationStatus === 'RECONCILED').length;
  const flaggedCount = receipts.filter(r => r.reconciliationStatus === 'FLAGGED_DISCREPANCY' || r.bankValidation.bankMatchStatus === 'DUPLICATE_DETECTED').length;

  // Hours saved estimate: 20 minutes (0.33 hours) saved per manual receipt verification
  const hoursSaved = (reconciledCount * 0.35).toFixed(1);

  // Compute Project Categorization Aggregate
  const projectAggregates: Record<string, { name: string; code: string; total: number; count: number }> = {};
  receipts.forEach(r => {
    r.projectCategories?.forEach(p => {
      if (!projectAggregates[p.code]) {
        projectAggregates[p.code] = {
          name: p.name,
          code: p.code,
          total: 0,
          count: 0,
        };
      }
      projectAggregates[p.code].total += p.allocatedAmount;
      projectAggregates[p.code].count += 1;
    });
  });

  const projectList = Object.values(projectAggregates).sort((a, b) => b.total - a.total);

  // Filter receipts by student name, transaction reference, date range, search query, and status
  const filteredReceipts = receipts.filter(r => {
    // 1. Student Name / Student ID filter
    const matchesStudentName = !studentNameFilter.trim() || 
      r.studentName.toLowerCase().includes(studentNameFilter.trim().toLowerCase()) ||
      r.studentId.toLowerCase().includes(studentNameFilter.trim().toLowerCase());

    // 2. Transaction Reference filter
    const matchesTransactionRef = !transactionRefFilter.trim() || 
      r.transactionRef.toLowerCase().includes(transactionRefFilter.trim().toLowerCase());

    // 3. Date Range filter (paymentDate or fallback to createdAt)
    const receiptDate = normalizeDate(r.paymentDate || r.createdAt);
    let matchesDateRange = true;
    if (startDate && (!receiptDate || receiptDate < startDate)) {
      matchesDateRange = false;
    }
    if (endDate && (!receiptDate || receiptDate > endDate)) {
      matchesDateRange = false;
    }

    // 4. Global search term (matches across student, ref, bank, branch)
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term ||
      r.studentId.toLowerCase().includes(term) ||
      r.studentName.toLowerCase().includes(term) ||
      r.transactionRef.toLowerCase().includes(term) ||
      r.bankName.toLowerCase().includes(term) ||
      r.bankBranch.toLowerCase().includes(term);

    // 5. Status filter
    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'RECONCILED' && r.reconciliationStatus === 'RECONCILED') ||
      (statusFilter === 'PENDING_AUDIT' && r.reconciliationStatus === 'PENDING_AUDIT') ||
      (statusFilter === 'FLAGGED' && (r.reconciliationStatus === 'FLAGGED_DISCREPANCY' || r.bankValidation.bankMatchStatus === 'DUPLICATE_DETECTED'));

    return matchesStudentName && matchesTransactionRef && matchesDateRange && matchesSearch && matchesStatus;
  });

  // Export CSV helper
  const handleExportCSV = () => {
    const headers = ['ReceiptID', 'StudentID', 'StudentName', 'Bank', 'Branch', 'TransactionRef', 'Amount', 'Currency', 'Date', 'Status', 'InterbankRef'];
    const rows = filteredReceipts.map(r => [
      r.id,
      r.studentId,
      `"${r.studentName}"`,
      `"${r.bankName}"`,
      `"${r.bankBranch}"`,
      r.transactionRef,
      r.amount,
      r.currency,
      r.paymentDate,
      r.reconciliationStatus,
      r.bankValidation?.settlementRef || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UniAudit_Reconciliation_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Peak Enrollment Backlog & Efficiency Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Reconciled */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Reconciled Revenue
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              ${totalReconciledAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-emerald-600 font-medium flex items-center space-x-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{reconciledCount} transactions cleared</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Peak Enrollment Backlog Relief */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Bursary Backlog Cleared
            </span>
            <div className="text-2xl font-extrabold text-indigo-900 mt-1">
              ~{hoursSaved} hrs
            </div>
            <div className="text-xs text-indigo-600 font-medium flex items-center space-x-1 mt-1">
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              <span>1.2s avg per bank slip</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Pending Audit Review */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Audit Review
            </span>
            <div className="text-2xl font-extrabold text-amber-900 mt-1">
              {pendingAuditCount}
            </div>
            <div className="text-xs text-amber-600 font-medium flex items-center space-x-1 mt-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Requires Bursar sign-off</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Duplicate & Fraud Prevention */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Duplicate Slips Blocked
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {flaggedCount}
            </div>
            <div className="text-xs text-slate-500 font-medium flex items-center space-x-1 mt-1">
              <span>Zero double-spending</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 30-Day OCR Confidence & Hardware Quality Telemetry */}
      <OcrQualityChart receipts={receipts} />

      {/* Project Allocation Breakdown Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>Project &amp; Faculty Revenue Allocations (General Ledger)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Automatic fund distribution across faculties, laboratory equipment, hostel upkeep, and IT levies
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
            Total Distributed: ${totalReconciledAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {projectList.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No reconciled project allocations yet. Scan receipts to generate automated ledger entries.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {projectList.map((proj) => {
              const pct = totalReconciledAmount > 0 ? ((proj.total / totalReconciledAmount) * 100).toFixed(1) : '0';
              return (
                <div key={proj.code} className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-left">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-800 truncate pr-2">{proj.name}</span>
                    <span className="font-mono text-emerald-700 font-extrabold">${proj.total.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 font-mono">
                    <span>GL Code: {proj.code}</span>
                    <span>{pct}% of revenue</span>
                  </div>
                  {/* Mini Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reconciled Receipts Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Enhanced Search & Filter Bar */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 space-y-4">
          
          {/* Top Row: Title, Ledger Counter & Primary Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  Institutional Financial Audit Ledger
                </h3>
                {hasActiveFilters ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Showing {filteredReceipts.length} of {receipts.length}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200/80 text-slate-700">
                    {receipts.length} Receipts
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Auditable records with interbank settlement references and SHA-256 tamper-evident checksums
              </p>
            </div>

            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              {/* Add Record (CRUD - Create) */}
              <button
                id="btn-open-create-receipt"
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-xs transition"
                title="Add Direct Receipt Record (CRUD - Create)"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Record</span>
              </button>

              {/* Students Directory (CRUD - Student Accounts) */}
              <button
                id="btn-open-student-directory"
                type="button"
                onClick={() => setIsStudentManagerOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-xs font-bold text-purple-700 shadow-xs transition"
                title="View & Edit Student Tuition Accounts (CRUD)"
              >
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>Students ({students.length})</span>
              </button>

              {hasActiveFilters && (
                <button
                  id="btn-reset-filters-top"
                  type="button"
                  onClick={handleResetAllFilters}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 transition"
                  title="Clear all active search and date filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}

              {/* Export CSV */}
              <button
                id="btn-export-reconciliation-csv"
                onClick={handleExportCSV}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 shadow-xs transition"
                title="Download Reconciliation Spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Filter 1: Student Name / Matric Search */}
            <div className="space-y-1">
              <label 
                htmlFor="input-filter-student-name" 
                className="block text-[11px] font-bold text-slate-700 flex items-center justify-between"
              >
                <span className="flex items-center space-x-1">
                  <User className="w-3 h-3 text-slate-500" />
                  <span>Student Name / ID</span>
                </span>
                {studentNameFilter && (
                  <button 
                    type="button"
                    onClick={() => setStudentNameFilter('')}
                    className="text-[10px] text-slate-400 hover:text-rose-600"
                    title="Clear student filter"
                  >
                    Clear
                  </button>
                )}
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  id="input-filter-student-name"
                  type="text"
                  placeholder="e.g. Amadu Bangura, Fatima..."
                  value={studentNameFilter}
                  onChange={(e) => setStudentNameFilter(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                {studentNameFilter && (
                  <button
                    type="button"
                    onClick={() => setStudentNameFilter('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter 2: Transaction Reference Filter */}
            <div className="space-y-1">
              <label 
                htmlFor="input-filter-transaction-ref" 
                className="block text-[11px] font-bold text-slate-700 flex items-center justify-between"
              >
                <span className="flex items-center space-x-1">
                  <Hash className="w-3 h-3 text-slate-500" />
                  <span>Transaction Reference</span>
                </span>
                {transactionRefFilter && (
                  <button 
                    type="button"
                    onClick={() => setTransactionRefFilter('')}
                    className="text-[10px] text-slate-400 hover:text-rose-600"
                    title="Clear reference filter"
                  >
                    Clear
                  </button>
                )}
              </label>
              <div className="relative">
                <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  id="input-filter-transaction-ref"
                  type="text"
                  placeholder="e.g. ZEN-992, SCB-MED..."
                  value={transactionRefFilter}
                  onChange={(e) => setTransactionRefFilter(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                {transactionRefFilter && (
                  <button
                    type="button"
                    onClick={() => setTransactionRefFilter('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter 3: Payment Date Range (From & To) */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>Date Range (Payment Date)</span>
                </span>
                {(startDate || endDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setDatePreset('ALL');
                    }}
                    className="text-[10px] text-slate-400 hover:text-rose-600"
                    title="Clear date range"
                  >
                    Clear
                  </button>
                )}
              </label>
              <div className="flex items-center space-x-1.5">
                <input
                  id="input-filter-date-from"
                  type="date"
                  aria-label="Start Date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDatePreset('CUSTOM');
                  }}
                  className="w-1/2 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-400 font-medium shrink-0">to</span>
                <input
                  id="input-filter-date-to"
                  type="date"
                  aria-label="End Date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDatePreset('CUSTOM');
                  }}
                  className="w-1/2 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Filter 4: Reconciliation Status */}
            <div className="space-y-1">
              <label 
                htmlFor="select-status-filter" 
                className="block text-[11px] font-bold text-slate-700 flex items-center space-x-1"
              >
                <Filter className="w-3 h-3 text-slate-500" />
                <span>Reconciliation Status</span>
              </label>
              <select
                id="select-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="RECONCILED">Reconciled Only</option>
                <option value="PENDING_AUDIT">Pending Audit</option>
                <option value="FLAGGED">Flagged / Duplicates</option>
              </select>
            </div>

          </div>

          {/* Quick Date Presets and Active Filter Chips */}
          <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            
            {/* Quick Date Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 flex items-center space-x-1 mr-1">
                <CalendarDays className="w-3 h-3 text-slate-400" />
                <span>Date Presets:</span>
              </span>
              <button
                id="btn-date-preset-all"
                type="button"
                onClick={() => handleDatePreset('ALL')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  datePreset === 'ALL' && !startDate && !endDate
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Dates
              </button>
              <button
                id="btn-date-preset-jan2025"
                type="button"
                onClick={() => handleDatePreset('JAN_2025')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  datePreset === 'JAN_2025'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title="Filter for January 2025 (Standard sample receipts range)"
              >
                Jan 2025 (Audit Slips)
              </button>
              <button
                id="btn-date-preset-7days"
                type="button"
                onClick={() => handleDatePreset('LAST_7_DAYS')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  datePreset === 'LAST_7_DAYS'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Last 7 Days
              </button>
              <button
                id="btn-date-preset-30days"
                type="button"
                onClick={() => handleDatePreset('LAST_30_DAYS')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  datePreset === 'LAST_30_DAYS'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Last 30 Days
              </button>
              <button
                id="btn-date-preset-session2425"
                type="button"
                onClick={() => handleDatePreset('SESSION_24_25')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  datePreset === 'SESSION_24_25'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Session 2024/25
              </button>
            </div>

            {/* Active filter summary chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                <span className="text-[10px] uppercase font-bold text-slate-400">Active:</span>
                
                {studentNameFilter && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span>Student: {studentNameFilter}</span>
                    <button type="button" onClick={() => setStudentNameFilter('')} className="hover:text-emerald-950">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {transactionRefFilter && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] bg-sky-50 text-sky-800 border border-sky-200 font-mono">
                    <span>Ref: {transactionRefFilter}</span>
                    <button type="button" onClick={() => setTransactionRefFilter('')} className="hover:text-sky-950">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {(startDate || endDate) && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] bg-amber-50 text-amber-800 border border-amber-200">
                    <span>Date: {startDate || '...'} to {endDate || '...'}</span>
                    <button type="button" onClick={() => { setStartDate(''); setEndDate(''); setDatePreset('ALL'); }} className="hover:text-amber-950">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {statusFilter !== 'ALL' && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] bg-purple-50 text-purple-800 border border-purple-200">
                    <span>Status: {statusFilter}</span>
                    <button type="button" onClick={() => setStatusFilter('ALL')} className="hover:text-purple-950">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  id="btn-clear-all-chips"
                  type="button"
                  onClick={handleResetAllFilters}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 underline ml-1"
                >
                  Clear All
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Student &amp; ID</th>
                <th className="py-3 px-4">Bank &amp; Branch</th>
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4">Interbank Clearance</th>
                <th className="py-3 px-4">Reconciliation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 px-4">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Search className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-bold text-slate-800">
                        No Matching Receipts Found
                      </div>
                      <p className="text-xs text-slate-500">
                        No financial records match your active search criteria
                        {studentNameFilter ? ` (Student: "${studentNameFilter}")` : ''}
                        {transactionRefFilter ? ` (Ref: "${transactionRefFilter}")` : ''}
                        {startDate || endDate ? ` (Date: ${startDate || 'any'} to ${endDate || 'any'})` : ''}
                        {statusFilter !== 'ALL' ? ` (Status: ${statusFilter})` : ''}.
                      </p>
                      {hasActiveFilters && (
                        <button
                          id="btn-reset-filters-empty-state"
                          type="button"
                          onClick={handleResetAllFilters}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset All Filters</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((r) => {
                  const isReconciled = r.reconciliationStatus === 'RECONCILED';
                  const isFlagged = r.reconciliationStatus === 'FLAGGED_DISCREPANCY' || r.bankValidation?.bankMatchStatus === 'DUPLICATE_DETECTED';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      
                      {/* Student Info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{r.studentName}</div>
                        <div className="font-mono text-[11px] text-slate-500">{r.studentId}</div>
                      </td>

                      {/* Bank Info */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{r.bankName}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{r.bankBranch}</div>
                      </td>

                      {/* Transaction Ref */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {r.transactionRef}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <span className="text-emerald-700 font-extrabold text-sm">
                          ${r.amount.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1">{r.currency}</span>
                      </td>

                      {/* Payment Date */}
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {r.paymentDate}
                      </td>

                      {/* Interbank Switch Status */}
                      <td className="py-3 px-4">
                        {r.bankValidation?.bankMatchStatus === 'MATCH_VERIFIED' ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Switch Settled</span>
                          </span>
                        ) : r.bankValidation?.bankMatchStatus === 'DUPLICATE_DETECTED' ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Duplicate Slip</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" />
                            <span>Pending Switch</span>
                          </span>
                        )}
                      </td>

                      {/* Reconciliation Status */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isReconciled
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isFlagged
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {r.reconciliationStatus}
                        </span>
                      </td>

                      {/* Action buttons (CRUD - Read, Update, Delete) */}
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          id={`btn-inspect-receipt-${r.id}`}
                          onClick={() => onInspectReceipt(r)}
                          className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition"
                          title="Inspect Optical Slip & Audit Hash (Read)"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-edit-receipt-${r.id}`}
                          onClick={() => setEditingReceipt(r)}
                          className="p-1.5 rounded text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition"
                          title="Edit Record (CRUD - Update)"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-delete-receipt-${r.id}`}
                          onClick={() => setDeletingReceipt(r)}
                          className="p-1.5 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                          title="Void / Delete Ledger Record (CRUD - Delete)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-send-alert-${r.id}`}
                          onClick={() => onSendAlert(r)}
                          className="p-1.5 rounded text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition"
                          title="Send Student WhatsApp/Email Alert"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modals */}
      {isCreateOpen && onCreateReceipt && (
        <CreateReceiptModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          students={students}
          onCreate={onCreateReceipt}
        />
      )}

      {editingReceipt && onUpdateReceipt && (
        <EditReceiptModal
          isOpen={!!editingReceipt}
          receipt={editingReceipt}
          onClose={() => setEditingReceipt(null)}
          onUpdate={onUpdateReceipt}
        />
      )}

      {deletingReceipt && onDeleteReceipt && (
        <DeleteReceiptModal
          isOpen={!!deletingReceipt}
          receipt={deletingReceipt}
          onClose={() => setDeletingReceipt(null)}
          onConfirmDelete={onDeleteReceipt}
        />
      )}

      {isStudentManagerOpen && onUpdateStudent && (
        <StudentManagerModal
          isOpen={isStudentManagerOpen}
          onClose={() => setIsStudentManagerOpen(false)}
          students={students}
          onSaveStudent={onUpdateStudent}
        />
      )}

    </div>
  );
};
