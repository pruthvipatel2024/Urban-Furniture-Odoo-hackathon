import React, { useState, useEffect } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { CreditCard, DollarSign, AlertCircle, CheckCircle2, X, BookOpen } from 'lucide-react';

export default function PaymentModal({
  isOpen,
  onClose,
  targetDoc
}) {
  const {
    invoices,
    vendorBills,
    recordPayment,
    formatCurrency
  } = useAccounting();

  const [selectedDocId, setSelectedDocId] = useState('');
  const [docType, setDocType] = useState('Customer Invoice');
  const [paymentMethod, setPaymentMethod] = useState('Bank Account (HDFC)');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (targetDoc) {
      setSelectedDocId(targetDoc.id);
      const isBill = targetDoc.id.startsWith('BILL') || targetDoc.type === 'Vendor Bill';
      setDocType(isBill ? 'Vendor Bill' : 'Customer Invoice');
      setAmount(targetDoc.balance);
    }
  }, [targetDoc]);

  if (!isOpen) return null;

  // Active document object
  const activeDoc = docType === 'Customer Invoice'
    ? invoices.find(i => i.id === selectedDocId)
    : vendorBills.find(b => b.id === selectedDocId);

  const maxBalance = activeDoc ? activeDoc.balance : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const payAmt = Number(amount);
    if (!payAmt || payAmt <= 0) {
      setErrorMsg('Payment amount must be greater than 0.');
      return;
    }

    if (payAmt > maxBalance + 0.01) {
      setErrorMsg(`Payment amount (${formatCurrency(payAmt)}) cannot exceed remaining balance (${formatCurrency(maxBalance)}).`);
      return;
    }

    if (!activeDoc) {
      setErrorMsg('Please select a valid document to settle.');
      return;
    }

    try {
      recordPayment({
        docId: activeDoc.id,
        docType,
        contactName: activeDoc.customerName || activeDoc.vendorName,
        method: paymentMethod,
        amount: payAmt,
        notes
      });

      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-navy-950 p-1 border border-teak-500/30 shadow-sm shrink-0">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Register Accounting Payment</h3>
              <p className="text-[10px] text-teak-400">Urban Furniture Automated Double-Entry</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Transaction Category Selector */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Transaction Category</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setDocType('Customer Invoice');
                  setSelectedDocId('');
                  setAmount('');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                  docType === 'Customer Invoice'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Customer Receipt (Inflow)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDocType('Vendor Bill');
                  setSelectedDocId('');
                  setAmount('');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                  docType === 'Vendor Bill'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Vendor Payout (Outflow)
              </button>
            </div>
          </div>

          {/* Document Dropdown */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Select Document to Settle *</label>
            <select
              required
              value={selectedDocId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedDocId(id);
                const doc = docType === 'Customer Invoice'
                  ? invoices.find(i => i.id === id)
                  : vendorBills.find(b => b.id === id);
                if (doc) setAmount(doc.balance);
              }}
              className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 outline-none focus:border-indigo-500 font-bold"
            >
              <option value="">-- Choose Unsettled Document --</option>
              {docType === 'Customer Invoice' ? (
                invoices.filter(i => i.balance > 0).map(i => (
                  <option key={i.id} value={i.id}>
                    {i.id} - {i.customerName} (Due: ₹{i.balance})
                  </option>
                ))
              ) : (
                vendorBills.filter(b => b.balance > 0).map(b => (
                  <option key={b.id} value={b.id}>
                    {b.id} - {b.vendorName} (Due: ₹{b.balance})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Active Balance Indicator */}
          {activeDoc && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Current Outstanding:</span>
              <span className="font-extrabold text-indigo-400 text-sm font-mono">{formatCurrency(maxBalance)}</span>
            </div>
          )}

          {/* Payment Account */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Payment Method / Ledger Account</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 outline-none"
            >
              <option value="Bank Account (HDFC)">Bank Account (HDFC Current A/C)</option>
              <option value="Cash on Hand">Cash on Hand (Petty Cash)</option>
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Settlement Amount (₹) *</label>
            <input
              type="number"
              required
              step="0.01"
              max={maxBalance}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-emerald-400 font-bold font-mono text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Payment Notes & Reference</label>
            <input
              type="text"
              placeholder="e.g. UTR #9821389123 / IMPS Reference"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/25"
            >
              Confirm & Post to Ledger
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
