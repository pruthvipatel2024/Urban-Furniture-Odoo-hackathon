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
    const matchMethod = filterMethod === 'All' || (p.method && p.method.toLowerCase().includes(filterMethod.toLowerCase()));
    const matchSearch = (p.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.contactName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.docId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchMethod && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 uppercase font-semibold">Total Customer Receipts</span>
            <h3 className="text-xl font-bold text-emerald-700 mt-1 font-mono">{formatCurrency(totalCustomerReceipts)}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Inflows from Invoices</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 uppercase font-semibold">Total Vendor Outflows</span>
            <h3 className="text-xl font-bold text-amber-700 mt-1 font-mono">{formatCurrency(totalVendorOutflows)}</h3>
            <span className="text-[11px] text-amber-600 font-medium">Payments for Vendor Bills</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 uppercase font-semibold">Net Cash Settlement</span>
            <h3 className={`text-xl font-bold mt-1 font-mono ${netCashFlow >= 0 ? 'text-[#145B9D]' : 'text-rose-700'}`}>
              {formatCurrency(netCashFlow)}
            </h3>
            <span className="text-[11px] text-slate-500">Liquid Movement</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#D4F6FF] text-[#145B9D] flex items-center justify-center border border-[#ACEEFF]">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Action Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter Buttons */}
          <div className="flex items-center space-x-1 bg-[#FBFBFB] p-1 rounded-xl border border-slate-200">
            {['All', 'Customer Payment', 'Vendor Payment'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filterType === t
                    ? 'bg-[#C6E7FF] text-slate-900 border border-[#9BD5FF]/40 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Method Filter */}
          <div className="flex items-center space-x-1 bg-[#FBFBFB] p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 pl-2">Method:</span>
            {['All', 'Bank', 'Cash'].map((m) => (
              <button
                key={m}
                onClick={() => setFilterMethod(m)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filterMethod === m
                    ? 'bg-[#C6E7FF] text-slate-900 border border-[#9BD5FF]/40 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#FBFBFB] rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#3095EB]"
            />
          </div>

          <button
            onClick={() => {
              setPaymentTargetDoc(null);
              setShowPaymentModal(true);
            }}
            className="flex items-center space-x-1.5 bg-[#C6E7FF] hover:bg-[#9BD5FF] text-slate-900 text-xs font-bold px-3.5 py-1.5 rounded-xl border border-[#9BD5FF]/40 transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Payment</span>
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">Settled Payments Ledger</h3>
            <p className="text-xs text-slate-500">Atomic settlements connected to customer invoices and vendor bills</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">{filteredPayments.length} Records</span>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No payment transactions found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Settle invoices or vendor bills to record cash and bank transaction history.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#FBFBFB] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Payment #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Party Name</th>
                  <th className="py-3 px-4">Linked Document</th>
                  <th className="py-3 px-4">Payment Source</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p) => {
                  const isInflow = p.type === 'Customer Payment';
                  return (
                    <tr key={p.id} className="hover:bg-[#D4F6FF]/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">{p.id}</td>
                      <td className="py-3.5 px-4 text-slate-600">{p.date}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isInflow
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {isInflow ? 'Inflow (Customer)' : 'Outflow (Vendor)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{p.contactName}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 font-semibold">{p.docId}</td>
                      <td className="py-3.5 px-4 text-slate-600">{p.method}</td>
                      <td className={`py-3.5 px-4 text-right font-mono font-bold ${
                        isInflow ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {isInflow ? '+' : '-'}{formatCurrency(p.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedVoucherForPrint(p)}
                          className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer inline-flex items-center justify-center"
                          title="Print Payment Voucher"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PRINTABLE PAYMENT VOUCHER MODAL */}
      {selectedVoucherForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-200 shadow-xs shrink-0">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-display">Official Payment Voucher</h3>
                  <p className="text-[11px] text-slate-500 font-mono">Urban Furniture ERP • Transaction Record</p>
                </div>
              </div>
              <button onClick={() => setSelectedVoucherForPrint(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#FBFBFB] p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Voucher Ref:</span>
                <span className="font-mono font-bold text-slate-900">{selectedVoucherForPrint.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Transaction Date:</span>
                <span className="font-semibold text-slate-800">{selectedVoucherForPrint.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Party Name:</span>
                <span className="font-semibold text-slate-800">{selectedVoucherForPrint.contactName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Linked Document:</span>
                <span className="font-mono font-semibold text-[#145B9D]">{selectedVoucherForPrint.docId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-semibold text-slate-800">{selectedVoucherForPrint.method}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center font-bold">
                <span className="text-slate-700">Settled Amount:</span>
                <span className="font-mono text-emerald-700 text-base">{formatCurrency(selectedVoucherForPrint.amount)}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedVoucherForPrint(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#C6E7FF] hover:bg-[#9BD5FF] text-slate-900 text-xs font-bold rounded-xl border border-[#9BD5FF]/40 cursor-pointer shadow-xs inline-flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
