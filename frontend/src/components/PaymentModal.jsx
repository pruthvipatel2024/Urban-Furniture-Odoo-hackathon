import React, { useState, useEffect } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { CreditCard, AlertCircle, X, CheckCircle2, ShieldCheck, Wallet, Landmark } from 'lucide-react';

export default function PaymentModal({
  isOpen,
  onClose,
  targetDoc
}) {
  const {
    invoices,
    vendorBills,
    recordPayment,
    liquidBalances,
    formatCurrency
  } = useAccounting();

  const [selectedDocId, setSelectedDocId] = useState('');
  const [docType, setDocType] = useState('Customer Invoice');
  const [paymentMethod, setPaymentMethod] = useState('bank'); // 'bank' | 'cash'
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    ? invoices.find(i => i.id === selectedDocId || i.backendId === Number(selectedDocId))
    : vendorBills.find(b => b.id === selectedDocId || b.backendId === Number(selectedDocId));

  const maxBalance = activeDoc ? Number(activeDoc.balance || 0) : 0;
  const isVendorPayment = docType === 'Vendor Bill';

  // Simulated available funds for the chosen method
  const availableFunds = paymentMethod === 'bank' ? liquidBalances.bank : liquidBalances.cash;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const payAmt = Number(amount);
    if (!payAmt || payAmt <= 0) {
      setErrorMsg('Payment amount must be greater than 0.');
      return;
    }

    if (payAmt > maxBalance + 0.01) {
      setErrorMsg(`Overpayment rejected! Payment of ${formatCurrency(payAmt)} exceeds remaining balance of ${formatCurrency(maxBalance)}.`);
      return;
    }

    if (!activeDoc) {
      setErrorMsg('Please select a valid unsettled document to process.');
      return;
    }

    // For Vendor Outflow: Validate that we have sufficient simulated funds
    if (isVendorPayment && payAmt > availableFunds) {
      setErrorMsg(`Insufficient ${paymentMethod === 'bank' ? 'Bank' : 'Cash'} Balance! Available: ${formatCurrency(availableFunds)}, Required: ${formatCurrency(payAmt)}. Please choose another payment method or deposit funds.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await recordPayment({
        docId: activeDoc.id,
        docType,
        contactName: activeDoc.customerName || activeDoc.vendorName,
        method: paymentMethod === 'bank' ? 'bank' : 'cash',
        amount: payAmt,
        notes
      });

      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Payment transaction failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#C6E7FF] text-slate-900">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-display">Register Accounting Payment</h3>
              <p className="text-[11px] text-slate-500">Atomic Double-Entry General Ledger Posting</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Transaction Category Selector */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Transaction Category</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setDocType('Customer Invoice');
                  setSelectedDocId('');
                  setAmount('');
                  setErrorMsg('');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  docType === 'Customer Invoice'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                    : 'bg-[#FBFBFB] border-slate-200 text-slate-600 hover:bg-slate-100'
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
                  setErrorMsg('');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  docType === 'Vendor Bill'
                    ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs'
                    : 'bg-[#FBFBFB] border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Vendor Payout (Outflow)
              </button>
            </div>
          </div>

          {/* Document Dropdown */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Document to Settle *</label>
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
              className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-[#3095EB] font-bold"
            >
              <option value="">-- Choose Unsettled Document --</option>
              {docType === 'Customer Invoice' ? (
                invoices.filter(i => i.balance > 0).map(i => (
                  <option key={i.id} value={i.id}>
                    {i.id} - {i.customerName} (Due: {formatCurrency(i.balance)})
                  </option>
                ))
              ) : (
                vendorBills.filter(b => b.balance > 0).map(b => (
                  <option key={b.id} value={b.id}>
                    {b.id} - {b.vendorName} (Due: {formatCurrency(b.balance)})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Active Balance & Simulated Funds Info Panel */}
          {activeDoc && (
            <div className="p-3 bg-[#D4F6FF]/30 rounded-xl border border-[#C6E7FF] space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Document Outstanding:</span>
                <span className="font-extrabold text-[#10497D] text-sm font-mono">{formatCurrency(maxBalance)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] border-t border-[#ACEEFF]/60 pt-1 text-slate-500">
                <span>Available {paymentMethod === 'bank' ? 'Bank' : 'Cash'} Reserves:</span>
                <span className="font-mono font-bold text-slate-800">{formatCurrency(availableFunds)}</span>
              </div>
            </div>
          )}

          {/* Simulated Payment Method Selector */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Simulated Payment Source</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                  paymentMethod === 'bank'
                    ? 'bg-[#C6E7FF] border-[#9BD5FF] text-slate-900 shadow-xs'
                    : 'bg-[#FBFBFB] border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Landmark className="w-4 h-4 text-[#1B76C7] shrink-0" />
                <div>
                  <p className="font-bold text-xs">Pay Online / Bank</p>
                  <p className="text-[10px] text-slate-500 font-mono">Reserves: {formatCurrency(liquidBalances.bank)}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'bg-[#C6E7FF] border-[#9BD5FF] text-slate-900 shadow-xs'
                    : 'bg-[#FBFBFB] border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-xs">Cash on Hand</p>
                  <p className="text-[10px] text-slate-500 font-mono">Reserves: {formatCurrency(liquidBalances.cash)}</p>
                </div>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Settlement Amount (₹) *</label>
            <input
              type="number"
              required
              step="0.01"
              max={maxBalance}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-900 font-bold font-mono text-sm outline-none focus:border-[#3095EB]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Payment Reference & Notes</label>
            <input
              type="text"
              placeholder="e.g. UTR #9821389123 / Simulated IMPS Ref"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#C6E7FF] hover:bg-[#9BD5FF] active:bg-[#64B9FF] text-slate-900 rounded-xl font-bold shadow-xs border border-[#9BD5FF]/40 cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-slate-900" />
              <span>{isSubmitting ? 'Posting Ledger...' : 'Confirm & Post to Ledger'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
