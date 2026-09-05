import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  CreditCard,
  Plus,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Printer,
  Calendar,
  Eye,
  X,
  BookOpen,
  CheckCircle2
} from 'lucide-react';

export default function PaymentRegister() {
  const {
    payments,
    formatCurrency,
    setShowPaymentModal,
    setPaymentTargetDoc
  } = useAccounting();

  const [filterType, setFilterType] = useState('All'); // 'All' | 'Customer Payment' | 'Vendor Payment'
  const [filterMethod, setFilterMethod] = useState('All'); // 'All' | 'Bank' | 'Cash'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVoucherForPrint, setSelectedVoucherForPrint] = useState(null);

  // Summary Metrics
  const totalCustomerReceipts = payments
    .filter(p => p.type === 'Customer Payment')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalVendorOutflows = payments
    .filter(p => p.type === 'Vendor Payment')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const netCashFlow = totalCustomerReceipts - totalVendorOutflows;

  // Filtered Payments
  const filteredPayments = payments.filter(p => {
    const matchType = filterType === 'All' || p.type === filterType;
    const matchMethod = filterMethod === 'All' || p.method.toLowerCase().includes(filterMethod.toLowerCase());
    const matchSearch = p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.docId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.notes.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchMethod && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Total Customer Receipts</span>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{formatCurrency(totalCustomerReceipts)}</h3>
            <span className="text-[11px] text-emerald-500/80 font-medium">Inflows from Invoices</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Total Vendor Outflows</span>
            <h3 className="text-2xl font-bold text-amber-400 mt-1 font-mono">{formatCurrency(totalVendorOutflows)}</h3>
            <span className="text-[11px] text-amber-500/80 font-medium">Payments for Vendor Bills</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Net Settlement Balance</span>
            <h3 className={`text-2xl font-bold mt-1 font-mono ${netCashFlow >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
              {formatCurrency(netCashFlow)}
            </h3>
            <span className="text-[11px] text-slate-400">Total Liquid Flow</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Action Header */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            {['All', 'Customer Payment', 'Vendor Payment'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filterType === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'All' ? 'All Transactions' : t === 'Customer Payment' ? 'Customer Receipts' : 'Vendor Payments'}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            {['All', 'Bank', 'Cash'].map((m) => (
              <button
                key={m}
                onClick={() => setFilterMethod(m)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filterMethod === m ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900/90 text-xs rounded-xl border border-slate-700 focus:border-indigo-500 outline-none text-slate-200"
            />
          </div>

          <button
            onClick={() => {
              setPaymentTargetDoc(null);
              setShowPaymentModal(true);
            }}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-indigo-600/25 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Register Payment</span>
          </button>
        </div>
      </div>

      {/* Payment Transactions Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Flow Type</th>
                <th className="py-3 px-4">Source Document</th>
                <th className="py-3 px-4">Party / Contact</th>
                <th className="py-3 px-4">Payment Account</th>
                <th className="py-3 px-4">Journal Ref</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-right">Voucher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{p.id}</td>
                  <td className="py-3.5 px-4 text-slate-400">{p.date}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.type === 'Customer Payment'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {p.type === 'Customer Payment' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      <span>{p.type}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-300">{p.docId}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-100">{p.contactName}</td>
                  <td className="py-3.5 px-4 text-slate-400">{p.method}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[10px] bg-slate-950 text-indigo-300 px-2 py-0.5 rounded border border-slate-800">
                      {p.journalEntryId}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-100 font-mono text-sm">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedVoucherForPrint(p)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 transition-colors"
                      title="View Payment Voucher"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PRINTABLE PAYMENT VOUCHER MODAL */}
      {/* ========================================================= */}
      {selectedVoucherForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl printable-document animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Official Payment Voucher</h3>
                <p className="text-xs text-slate-500 font-mono">Urban Furniture ERP • {selectedVoucherForPrint.id}</p>
              </div>
              <button onClick={() => setSelectedVoucherForPrint(null)} className="text-slate-400 hover:text-slate-600 no-print">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Date:</span>
                  <span className="font-bold">{selectedVoucherForPrint.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Voucher Category:</span>
                  <span className="font-bold">{selectedVoucherForPrint.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Party / Contact:</span>
                  <span className="font-bold text-slate-900">{selectedVoucherForPrint.contactName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Linked Document:</span>
                  <span className="font-mono font-bold text-indigo-600">{selectedVoucherForPrint.docId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Settlement Method:</span>
                  <span className="font-bold">{selectedVoucherForPrint.method}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                  <span>Amount Settled:</span>
                  <span className="font-mono text-emerald-700">{formatCurrency(selectedVoucherForPrint.amount)}</span>
                </div>
              </div>

              {selectedVoucherForPrint.notes && (
                <p className="text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px]">
                  Note: {selectedVoucherForPrint.notes}
                </p>
              )}

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1">
                <span className="font-bold text-indigo-950 flex items-center space-x-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Double-Entry Reference: {selectedVoucherForPrint.journalEntryId}</span>
                </span>
                <p className="text-[10px] text-indigo-800">
                  Transaction immutable and synchronized with the General Accounting Ledger.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200 no-print">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>

              <button
                onClick={() => setSelectedVoucherForPrint(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
