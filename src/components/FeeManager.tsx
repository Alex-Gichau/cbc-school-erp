import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  PlusCircle,
  Search,
  CheckCircle2,
  Printer,
  Receipt,
  Download,
  X,
  Building2,
  DollarSign,
  AlertCircle,
  FileText,
  Calendar,
  RotateCcw,
  TrendingUp,
  Wallet,
  ArrowUpDown
} from 'lucide-react';
import { Student, FeePayment, UserRole } from '../types';
import { StudentFeeStatementModal } from './StudentFeeStatementModal';
import { DateRangeFilter } from './DateRangeFilter';

interface FeeManagerProps {
  students: Student[];
  payments: FeePayment[];
  onRecordPayment: (data: {
    studentId: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
    recordedBy: string;
  }) => Promise<void>;
  userRole: UserRole;
}

export const FeeManager: React.FC<FeeManagerProps> = ({
  students,
  payments,
  onRecordPayment,
  userRole
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'cleared' | 'pending'>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<FeePayment | null>(null);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [statementStudentId, setStatementStudentId] = useState<string>('');

  // Payment form state
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [paymentAmount, setPaymentAmount] = useState('12000');
  const [paymentMethod, setPaymentMethod] = useState<'Mobile Money' | 'Bank Transfer' | 'Cash' | 'Card'>('Mobile Money');
  const [paymentNotes, setPaymentNotes] = useState('Term 1 Tuition installment');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'ledger' | 'transactions' | 'structure'>('ledger');

  // Transactions date range and filter states
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [transactionSearchQuery, setTransactionSearchQuery] = useState('');

  const handleOpenStatement = (studentId: string) => {
    setStatementStudentId(studentId);
    setShowStatementModal(true);
  };

  // Metrics
  const totalBilled = students.reduce((acc, s) => acc + s.totalFeesBilled, 0);
  const totalCollected = students.reduce((acc, s) => acc + s.totalFeesPaid, 0);
  const totalOutstanding = Math.max(0, totalBilled - totalCollected);
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  // Filtered Payments (historical transaction logs within date range)
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (filterStartDate && p.paymentDate < filterStartDate) return false;
      if (filterEndDate && p.paymentDate > filterEndDate) return false;
      if (filterPaymentMethod !== 'all' && p.paymentMethod.toLowerCase() !== filterPaymentMethod.toLowerCase()) {
        return false;
      }
      if (filterGrade !== 'all' && p.grade.toLowerCase() !== filterGrade.toLowerCase()) {
        return false;
      }
      if (transactionSearchQuery.trim()) {
        const q = transactionSearchQuery.toLowerCase().trim();
        const matchName = p.studentName.toLowerCase().includes(q);
        const matchAdm = p.admissionNumber.toLowerCase().includes(q);
        const matchRec = p.receiptNumber.toLowerCase().includes(q);
        const matchNotes = (p.notes || '').toLowerCase().includes(q);
        const matchCollector = (p.recordedBy || '').toLowerCase().includes(q);
        if (!matchName && !matchAdm && !matchRec && !matchNotes && !matchCollector) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
  }, [payments, filterStartDate, filterEndDate, filterPaymentMethod, filterGrade, transactionSearchQuery]);

  // Period Financial Analytics for Selected Date Range
  const periodTotalCollected = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments]);

  const periodTransactionCount = filteredPayments.length;
  const periodAvgReceipt = periodTransactionCount > 0 ? Math.round(periodTotalCollected / periodTransactionCount) : 0;

  // Channel breakdown within filtered period
  const methodTotals = useMemo(() => {
    const map: Record<string, number> = {
      'Mobile Money': 0,
      'Bank Transfer': 0,
      'Cash': 0,
      'Card': 0
    };
    filteredPayments.forEach((p) => {
      if (map[p.paymentMethod] !== undefined) {
        map[p.paymentMethod] += p.amount;
      } else {
        map[p.paymentMethod] = p.amount;
      }
    });
    return map;
  }, [filteredPayments]);

  const handleResetPaymentFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterPaymentMethod('all');
    setFilterGrade('all');
    setTransactionSearchQuery('');
  };

  const handleExportPaymentsCSV = () => {
    const headers = [
      'Receipt Number',
      'Date',
      'Admission No',
      'Student Name',
      'Grade',
      'Payment Method',
      'Amount (KES)',
      'Academic Term',
      'Notes',
      'Recorded By'
    ];
    const rows = filteredPayments.map((p) => [
      p.receiptNumber,
      p.paymentDate,
      p.admissionNumber,
      `"${p.studentName}"`,
      p.grade,
      p.paymentMethod,
      p.amount,
      `"${p.term}"`,
      `"${p.notes || ''}"`,
      `"${p.recordedBy || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fee_payments_${filterStartDate || 'all'}_to_${filterEndDate || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintTransactions = () => {
    window.print();
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'cleared' && s.feeBalance === 0) ||
      (statusFilter === 'pending' && s.feeBalance > 0);

    return matchesSearch && matchesStatus;
  });

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || Number(paymentAmount) <= 0) return;

    try {
      setIsSubmitting(true);
      await onRecordPayment({
        studentId: selectedStudentId,
        amount: Number(paymentAmount),
        paymentMethod,
        notes: paymentNotes,
        recordedBy: 'Accounts Bursar'
      });
      setShowPaymentModal(false);
      // Auto open newest receipt
      if (payments.length > 0) {
        setSelectedReceipt(payments[0]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              Learner Fee & Financial Accounts
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Term fee packages, collection ledgers, payment receipt generation, and outstanding arrears monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenStatement(filteredStudents[0]?.id || students[0]?.id || '')}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-xs transition-all cursor-pointer"
            title="Generate official printable PDF-style student fee statement"
          >
            <FileText className="w-4 h-4 text-orange-500" />
            <span>Generate Student Statement</span>
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/15 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Fee Payment</span>
          </button>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Fees Billed
          </span>
          <div className="text-2xl font-black text-slate-900 mt-2">
            KES {totalBilled.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">Full term expected fees</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Fees Banked
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            KES {totalCollected.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">Received in school accounts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Outstanding Arrears
          </span>
          <div className="text-2xl font-black text-rose-700 mt-2">
            KES {totalOutstanding.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">Due before end-of-term</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Collection Rate
          </span>
          <div className="text-2xl font-black text-orange-600 mt-2">
            {collectionRate}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-orange-500 h-full rounded-full"
              style={{ width: `${collectionRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: Student Ledger, Transactions, Fee Structure */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'ledger'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Learner Fee Ledger
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'transactions'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Payment Transactions Log</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            activeTab === 'transactions' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-800'
          }`}>
            {filteredPayments.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('structure')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'structure'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Standard Fee Structure Packages
        </button>
      </div>

      {activeTab === 'ledger' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student or admission number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium">Filter:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-orange-50 text-orange-700 border border-orange-200'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Learners
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                  statusFilter === 'pending'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Pending Balance
              </button>
              <button
                onClick={() => setStatusFilter('cleared')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                  statusFilter === 'cleared'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Fully Cleared
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Adm No.</th>
                    <th className="py-3 px-4">Learner Name</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Total Billed</th>
                    <th className="py-3 px-4">Total Paid</th>
                    <th className="py-3 px-4">Balance Remaining</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => {
                    const isPaid = s.feeBalance === 0;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                          {s.admissionNumber}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {s.firstName} {s.lastName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">{s.grade}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          KES {s.totalFeesBilled.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700">
                          KES {s.totalFeesPaid.toLocaleString()}
                        </td>
                        <td
                          className={`py-3.5 px-4 font-black ${
                            isPaid ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          KES {s.feeBalance.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          {isPaid ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Cleared
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Part Payment
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenStatement(s.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer border border-slate-200"
                              title={`Generate Statement for ${s.firstName} ${s.lastName}`}
                            >
                              <FileText className="w-3.5 h-3.5 text-slate-600" />
                              <span>Statement</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedStudentId(s.id);
                                setShowPaymentModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs transition-colors cursor-pointer border border-orange-200/60"
                            >
                              + Pay Fee
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab with Date Range Filter and Period Audit */}
      {activeTab === 'transactions' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Reusable Date Range Picker Filter Component */}
          <DateRangeFilter
            startDate={filterStartDate}
            endDate={filterEndDate}
            onDateRangeChange={(start, end) => {
              setFilterStartDate(start);
              setFilterEndDate(end);
            }}
            label="Payment Date-Range Picker & Financial Audit Filter"
            helperText="Filter fee receipt logs across specific billing windows, weeks, months, or select pre-configured presets."
            matchedCount={filteredPayments.length}
            totalCount={payments.length}
            entityLabel="payment logs"
          />

          {/* Secondary Filter Bar: Search, Grade, Channel, and Export/Print */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search receipt, learner, adm..."
                  value={transactionSearchQuery}
                  onChange={(e) => setTransactionSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Class Filter */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                  Grade:
                </label>
                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                >
                  <option value="all">All Grades</option>
                  <option value="Grade 9-A">Grade 9-A</option>
                  <option value="Grade 9-B">Grade 9-B</option>
                  <option value="Grade 10-A">Grade 10-A</option>
                  <option value="Grade 10-B">Grade 10-B</option>
                  <option value="Grade 11-A">Grade 11-A</option>
                  <option value="Grade 12-A">Grade 12-A</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                  Method:
                </label>
                <select
                  value={filterPaymentMethod}
                  onChange={(e) => setFilterPaymentMethod(e.target.value)}
                  className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                >
                  <option value="all">All Methods</option>
                  <option value="Mobile Money">Mobile Money (M-Pesa)</option>
                  <option value="Bank Transfer">Bank Transfer / Wire</option>
                  <option value="Cash">Cash (Bursar Office)</option>
                  <option value="Card">Card (POS Terminal)</option>
                </select>
              </div>
            </div>

            {/* Quick Actions: Export CSV and Print */}
            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
              <button
                type="button"
                onClick={handleExportPaymentsCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                title="Export filtered transactions to CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={handlePrintTransactions}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                title="Print official transaction ledger sheet"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print Ledger</span>
              </button>
            </div>
          </div>

          {/* Period Financial Metrics Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Period Banked
              </span>
              <div className="text-xl font-black text-emerald-700 mt-1">
                KES {periodTotalCollected.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {periodTransactionCount} verified receipts
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Average Receipt
              </span>
              <div className="text-xl font-black text-slate-900 mt-1">
                KES {periodAvgReceipt.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Per transaction</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Mobile Money (M-Pesa)
              </span>
              <div className="text-xl font-black text-emerald-600 mt-1">
                KES {(methodTotals['Mobile Money'] || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {periodTotalCollected > 0
                  ? Math.round(((methodTotals['Mobile Money'] || 0) / periodTotalCollected) * 100)
                  : 0}
                % of period volume
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Bank Wire & Card
              </span>
              <div className="text-xl font-black text-indigo-600 mt-1">
                KES {((methodTotals['Bank Transfer'] || 0) + (methodTotals['Card'] || 0)).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Cash: KES {(methodTotals['Cash'] || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {filteredPayments.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Receipt className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  No payment transactions found in this time frame
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting the start or end dates, choosing a broader preset (such as "Last 30 Days" or "All Records"), or clearing filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetPaymentFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs transition-colors cursor-pointer border border-orange-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Receipt No.</th>
                      <th className="py-3 px-4">Payment Date</th>
                      <th className="py-3 px-4">Learner Details</th>
                      <th className="py-3 px-4">Grade</th>
                      <th className="py-3 px-4">Channel</th>
                      <th className="py-3 px-4">Amount Paid</th>
                      <th className="py-3 px-4">Notes / Purpose</th>
                      <th className="py-3 px-4">Recorded By</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                          {p.receiptNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-medium">
                          {p.paymentDate}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{p.studentName}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {p.admissionNumber}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          {p.grade}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                              p.paymentMethod === 'Mobile Money'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : p.paymentMethod === 'Bank Transfer'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : p.paymentMethod === 'Card'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-black text-emerald-700 whitespace-nowrap">
                          KES {p.amount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {p.notes || <span className="text-slate-300">—</span>}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {p.recordedBy}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedReceipt(p)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors cursor-pointer"
                              title="View Official Receipt Slip"
                            >
                              <Receipt className="w-3.5 h-3.5 text-slate-500" />
                              <span>Slip</span>
                            </button>
                            <button
                              onClick={() => handleOpenStatement(p.studentId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold text-xs transition-colors cursor-pointer border border-orange-200/50"
                              title="Generate PDF-style Printable Statement"
                            >
                              <FileText className="w-3.5 h-3.5 text-orange-600" />
                              <span>Statement</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fee Structure Package Overview */}
      {activeTab === 'structure' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-serif">
                  Standard Secondary Term Package (Grade 9 & 10)
                </h3>
                <p className="text-xs text-slate-500">Applicable for Term 1, 2026</p>
              </div>
              <span className="text-lg font-black text-slate-900">KES 48,000</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-600">Core Tuition & Instruction:</span>
                <span className="font-semibold text-slate-900">KES 28,000</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-600">Science Laboratory & Computer Lab Consumables:</span>
                <span className="font-semibold text-slate-900">KES 6,500</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-600">Library & Digital Learning Resources:</span>
                <span className="font-semibold text-slate-900">KES 3,500</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-600">Sports & Co-Curricular Activities:</span>
                <span className="font-semibold text-slate-900">KES 4,000</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-600">Mid-Term & End-Term Examination Printing:</span>
                <span className="font-semibold text-slate-900">KES 2,000</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">School Daily Mid-Day Meal:</span>
                <span className="font-semibold text-slate-900">KES 4,000</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-serif">
                  Senior Secondary Term Package (Grade 11 & 12)
                </h3>
                <p className="text-xs text-slate-500">Applicable for Term 1, 2026</p>
              </div>
              <span className="text-lg font-black text-slate-900">KES 52,000 - 55,000</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-600">Advanced Core Tuition:</span>
                <span className="font-semibold text-slate-900">KES 32,000</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-600">Advanced Science & Engineering Practicals:</span>
                <span className="font-semibold text-slate-900">KES 8,000</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-600">National Exam Prep & Mock Papers:</span>
                <span className="font-semibold text-slate-900">KES 4,000</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">Activities, Library & Meals:</span>
                <span className="font-semibold text-slate-900">KES 8,000</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Fee Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-serif">
                  Record Learner Fee Payment
                </h2>
                <p className="text-xs text-slate-500">
                  Issues official payment receipt and updates learner balance ledger immediately.
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Learner *</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.admissionNumber} - {s.grade}) • Balance: KES{' '}
                      {s.feeBalance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Amount Paid (KES) *
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    step="100"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none"
                  >
                    <option value="Mobile Money">Mobile Money (M-Pesa)</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash Cashier</option>
                    <option value="Card">Credit / Debit Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Transaction Remarks</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Bank Ref #992812 or Tuition installment"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Generate Receipt & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Printable Slip Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Official School Receipt
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs transition-colors cursor-pointer border border-orange-200"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="mt-4 p-6 border-2 border-slate-200 rounded-xl bg-slate-50/50 space-y-4 text-xs font-serif">
              {/* School Header */}
              <div className="text-center pb-3 border-b border-slate-300">
                <h2 className="text-lg font-black text-slate-900 tracking-wider">
                  PCEA ST ANDREWS KINDERGARTEN
                </h2>
                <p className="text-[11px] text-slate-600 font-sans">
                  PCEA St. Andrews Campus • State House Road, Nairobi • Tel: +254 20 272 3505
                </p>
                <div className="inline-block mt-2 px-3 py-0.5 bg-slate-900 text-white text-[10px] font-sans font-bold uppercase tracking-widest rounded-full">
                  OFFICIAL FEE PAYMENT RECEIPT
                </div>
              </div>

              {/* Receipt Meta */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
                <div>
                  <span className="text-slate-400 block">Receipt Number:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedReceipt.receiptNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Date of Payment:</span>
                  <span className="font-semibold text-slate-900">{selectedReceipt.paymentDate}</span>
                </div>
              </div>

              {/* Student Details */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 font-sans text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Learner Name:</span>
                  <span className="font-bold text-slate-900">{selectedReceipt.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Admission Number:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {selectedReceipt.admissionNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Grade / Class:</span>
                  <span className="font-semibold text-slate-900">{selectedReceipt.grade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Term & Year:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedReceipt.term} ({selectedReceipt.academicYear})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Channel:</span>
                  <span className="font-semibold text-slate-900">{selectedReceipt.paymentMethod}</span>
                </div>
              </div>

              {/* Amount Box */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl font-sans text-center">
                <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">
                  Amount Received in Full
                </span>
                <div className="text-2xl font-black text-emerald-900 mt-1">
                  KES {selectedReceipt.amount.toLocaleString()}
                </div>
                <div className="text-[11px] italic text-emerald-700 mt-1">
                  "{selectedReceipt.notes || 'Tuition and academic services'}"
                </div>
              </div>

              {/* Sign-off */}
              <div className="pt-4 border-t border-slate-300 flex justify-between items-end font-sans text-[11px]">
                <div>
                  <span className="text-slate-400 block">Receiving Cashier / Bursar:</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.recordedBy}</span>
                </div>
                <div className="text-right">
                  <div className="w-24 border-b border-slate-400 mb-1"></div>
                  <span className="text-slate-500 font-serif italic text-[10px]">Official School Stamp</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable PDF-Style Student Fee Statement Modal */}
      <StudentFeeStatementModal
        isOpen={showStatementModal}
        onClose={() => setShowStatementModal(false)}
        students={students}
        payments={payments}
        initialStudentId={statementStudentId}
        onRecordPayment={(stId) => {
          setSelectedStudentId(stId);
          setShowPaymentModal(true);
        }}
      />
    </div>
  );
};
