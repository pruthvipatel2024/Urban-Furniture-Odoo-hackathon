import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function PaymentModal({
  isOpen,
  onClose,
  targetDoc, // { id, totalAmount, balance, vendorName, customerName, type: 'Vendor Bill' | 'Customer Invoice' }
  invoices,
  vendorBills,
  onRecordPayment
}) {
  const [selectedDocId, setSelectedDocId] = useState('');
  const [docType, setDocType] = useState('Customer Invoice');
  const [paymentMethod, setPaymentMethod] = useState('Bank Account (HDFC)');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (targetDoc) {
      setSelectedDocId(targetDoc.id);
      setDocType(targetDoc.type || (targetDoc.id.startsWith('BILL') ? 'Vendor Bill' : 'Customer Invoice'));
      setAmount(targetDoc.balance);
    }
  }, [targetDoc]);

  if (!isOpen) return null;

  // Find active doc
  const activeDoc = docType === 'Customer Invoice' 
    ? invoices.find(i => i.id === selectedDocId) 
    : vendorBills.find(b => b.id === selectedDocId);

  const maxBalance = activeDoc ? activeDoc.balance : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const payAmt = Number(amount);
    if (!payAmt || payAmt <= 0) {
      setErrorMsg('Payment amount must be greater than 0');
      return;
    }

    if (payAmt > maxBalance + 0.01) {
      setErrorMsg(`Payment amount (₹${payAmt}) cannot exceed remaining balance (₹${maxBalance})`);
      return;
    }

    if (!activeDoc) {
      setErrorMsg('Please select a valid document to pay');
      return;
    }

    onRecordPayment({
      docId: activeDoc.id,
      docType,
      contactName: activeDoc.customerName || activeDoc.vendorName,
      paymentMethod,
      amount: payAmt,
      notes
    });

    onClose();
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Register Payment</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Document Type Selector */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">Transaction Category</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setDocType('Customer Invoice'); setSelectedDocId(''); setAmount(''); }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold ${docType === 'Customer Invoice' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                Customer Receipt
              </button>
              <button
                type="button"
                onClick={() => { setDocType('Vendor Bill'); setSelectedDocId(''); setAmount(''); }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold ${docType === 'Vendor Bill' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                Vendor Outflow
              </button>
            </div>
          </div>

          {/* Document Dropdown */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">Select Document *</label>
            <select
              required
              value={selectedDocId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedDocId(id);
                const doc = docType === 'Customer Invoice' ? invoices.find(i => i.id === id) : vendorBills.find(b => b.id === id);
                if (doc) setAmount(doc.balance);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">-- Choose Unpaid Document --</option>
              {docType === 'Customer Invoice' ? (
                invoices.filter(i => i.balance > 0).map(i => (
                  <option key={i.id} value={i.id}>{i.id} - {i.customerName} (Bal: ₹{i.balance})</option>
                ))
              ) : (
                vendorBills.filter(b => b.balance > 0).map(b => (
                  <option key={b.id} value={b.id}>{b.id} - {b.vendorName} (Bal: ₹{b.balance})</option>
                ))
              )}
            </select>
          </div>

          {/* Active Balance Indicator */}
          {activeDoc && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-500">Outstanding Balance:</span>
              <span className="font-extrabold text-indigo-600 text-sm">{formatCurrency(maxBalance)}</span>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">Payment Method / Account</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="Bank Account (HDFC)">Bank Account (HDFC)</option>
              <option value="Cash on Hand">Cash on Hand</option>
            </select>
          </div>

          {/* Payment Amount */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">Payment Amount (₹) *</label>
            <input
              type="number"
              required
              step="0.01"
              max={maxBalance}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Reference Notes</label>
            <input
              type="text"
              placeholder="e.g. UTR #9821389123 / Cheque #004"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md"
            >
              Confirm & Post Ledger Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
