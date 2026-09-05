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
        <div className="bg-white p-5 rounded-2xl border border-[#E3E7EA] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#667482] uppercase font-semibold">Total Customer Receipts</span>
            <h3 className="text-xl font-bold text-[#18794E] mt-1 font-mono">{formatCurrency(totalCustomerReceipts)}</h3>
            <span className="text-[11px] text-[#18794E] font-medium">Inflows from Invoices</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EAF7F0] text-[#18794E] flex items-center justify-center border border-[#A3E6C0]">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E7EA] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#667482] uppercase font-semibold">Total Vendor Outflows</span>
            <h3 className="text-xl font-bold text-[#C98232] mt-1 font-mono">{formatCurrency(totalVendorOutflows)}</h3>
            <span className="text-[11px] text-[#C98232] font-medium">Payments for Vendor Bills</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F8F0E6] text-[#C98232] flex items-center justify-center border border-[#E5B875]/40">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E7EA] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#667482] uppercase font-semibold">Net Cash Settlement</span>
            <h3 className={`text-xl font-bold mt-1 font-mono ${netCashFlow >= 0 ? 'text-[#0B2A4A]' : 'text-[#B42318]'}`}>
              {formatCurrency(netCashFlow)}
            </h3>
            <span className="text-[11px] text-[#667482]">Liquid Movement</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EEF4F8] text-[#0B2A4A] flex items-center justify-center border border-[#D8E1E8]">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3E7EA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
          {/* Left-aligned search input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A96A3]" />
            <input
              type="text"
              placeholder="Search payments by contact, doc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-[#E3E7EA] text-xs text-[#17212B] placeholder:text-[#8A96A3] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter Buttons */}
            <div className="flex items-center space-x-1 bg-[#FAFAF8] p-1 rounded-xl border border-[#E3E7EA]">
              {['All', 'Customer Payment', 'Vendor Payment'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    filterType === t
                      ? 'bg-white text-[#0B2A4A] border border-[#E3E7EA] shadow-xs font-bold'
                      : 'text-[#667482] hover:text-[#0B2A4A]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Method Filter */}
            <div className="flex items-center space-x-1 bg-[#FAFAF8] p-1 rounded-xl border border-[#E3E7EA] text-xs">
              <span className="text-[#667482] pl-2">Method:</span>
              {['All', 'Bank', 'Cash'].map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMethod(m)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    filterMethod === m
                      ? 'bg-white text-[#0B2A4A] border border-[#E3E7EA] shadow-xs font-bold'
                      : 'text-[#667482] hover:text-[#0B2A4A]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setPaymentTargetDoc(null);
            setShowPaymentModal(true);
          }}
          className="flex items-center space-x-1.5 bg-[#0B2A4A] hover:bg-[#163B63] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Payment</span>
        </button>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-[#E3E7EA] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E3E7EA] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#17212B] font-display">Settled Payments Ledger</h3>
            <p className="text-xs text-[#667482]">Atomic settlements connected to customer invoices and vendor bills</p>
          </div>
          <span className="text-xs font-mono font-bold text-[#667482]">{filteredPayments.length} Records</span>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-[#667482] space-y-3">
            <CreditCard className="w-10 h-10 text-[#8A96A3] mx-auto" />
            <p className="text-sm font-semibold text-[#17212B]">No payment transactions found</p>
            <p className="text-xs text-[#8A96A3] max-w-sm mx-auto">
              Settle invoices or vendor bills to record cash and bank transaction history.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#17212B]">
              <thead className="bg-[#EEF4F8] text-[#667482] font-semibold uppercase tracking-wider border-b border-[#E3E7EA]">
                <tr>
                  <th className="py-3.5 px-4">Payment #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Party Name</th>
                  <th className="py-3.5 px-4">Linked Document</th>
                  <th className="py-3.5 px-4">Payment Source</th>
                  <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                  <th className="py-3.5 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E7EA]/60">
                {filteredPayments.map((p) => {
                  const isInflow = p.type === 'Customer Payment';
                  return (
                    <tr key={p.id} className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#0B2A4A] font-mono">{p.id}</td>
                      <td className="py-3.5 px-4 text-[#667482]">{p.date}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isInflow
                            ? 'bg-[#EAF7F0] text-[#18794E] border-[#A3E6C0]'
                            : 'bg-[#F8F0E6] text-[#C98232] border-[#E5B875]/40'
                        }`}>
                          {isInflow ? 'Inflow (Customer)' : 'Outflow (Vendor)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#17212B]">{p.contactName}</td>
                      <td className="py-3.5 px-4 font-mono text-[#0B2A4A] font-semibold">{p.docId}</td>
                      <td className="py-3.5 px-4 text-[#667482]">{p.method}</td>
                      <td className={`py-3.5 px-4 text-right font-mono font-bold ${
                        isInflow ? 'text-[#18794E]' : 'text-[#C98232]'
                      }`}>
                        {isInflow ? '+' : '-'}{formatCurrency(p.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedVoucherForPrint(p)}
                          className="p-1.5 bg-white hover:bg-[#EEF4F8] text-[#0B2A4A] rounded-lg border border-[#E3E7EA] transition-colors cursor-pointer inline-flex items-center justify-center"
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
        <div className="fixed inset-0 z-50 bg-[#0B2A4A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-[#E3E7EA] animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#E3E7EA] pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white p-1 border border-[#E3E7EA] shadow-xs shrink-0">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0B2A4A] font-display">Official Payment Voucher</h3>
                  <p className="text-[11px] text-[#667482] font-mono">Urban Furniture ERP • Transaction Record</p>
                </div>
              </div>
              <button onClick={() => setSelectedVoucherForPrint(null)} className="text-[#8A96A3] hover:text-[#17212B] p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#FAFAF8] p-4 rounded-xl border border-[#E3E7EA] space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#667482]">Voucher Ref:</span>
                <span className="font-mono font-bold text-[#0B2A4A]">{selectedVoucherForPrint.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#667482]">Transaction Date:</span>
                <span className="font-semibold text-[#17212B]">{selectedVoucherForPrint.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#667482]">Party Name:</span>
                <span className="font-semibold text-[#17212B]">{selectedVoucherForPrint.contactName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#667482]">Linked Document:</span>
                <span className="font-mono font-semibold text-[#0B2A4A]">{selectedVoucherForPrint.docId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#667482]">Payment Method:</span>
                <span className="font-semibold text-[#17212B]">{selectedVoucherForPrint.method}</span>
              </div>
              <div className="border-t border-[#E3E7EA] pt-2 flex justify-between items-center font-bold">
                <span className="text-[#17212B]">Settled Amount:</span>
                <span className="font-mono text-[#18794E] text-base">{formatCurrency(selectedVoucherForPrint.amount)}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedVoucherForPrint(null)}
                className="px-4 py-2 bg-[#EEF4F8] hover:bg-[#E2ECF2] text-[#0B2A4A] text-xs font-semibold rounded-xl border border-[#D8E1E8]"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#0B2A4A] hover:bg-[#163B63] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs inline-flex items-center space-x-1.5"
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
