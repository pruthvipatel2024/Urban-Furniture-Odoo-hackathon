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
    <div className="fixed inset-0 z-50 bg-[#0B2A4A]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E3E7EA] animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[#E3E7EA] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#EEF4F8] text-[#0B2A4A] border border-[#D8E1E8]">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0B2A4A] font-display">Register Accounting Payment</h3>
              <p className="text-[11px] text-[#667482]">Atomic Double-Entry General Ledger Posting</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8A96A3] hover:text-[#17212B] p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#FDECEC] border border-[#F8B4B4] rounded-xl text-xs text-[#B42318] font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#B42318]" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Transaction Category Selector */}
          <div>
            <label className="block text-[#17212B] font-semibold mb-1">Transaction Category</label>
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
                    ? 'bg-[#EAF7F0] border-[#A3E6C0] text-[#18794E] shadow-xs'
                    : 'bg-[#FAFAF8] border-[#E3E7EA] text-[#667482] hover:bg-[#EEF4F8]'
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
                    ? 'bg-[#F8F0E6] border-[#E5B875]/60 text-[#C98232] shadow-xs'
                    : 'bg-[#FAFAF8] border-[#E3E7EA] text-[#667482] hover:bg-[#EEF4F8]'
                }`}
              >
                Vendor Payout (Outflow)
              </button>
            </div>
          </div>

          {/* Document Dropdown */}
          <div>
            <label className="block text-[#17212B] font-semibold mb-1">Select Document to Settle *</label>
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
              className="w-full px-3 py-2 bg-white rounded-xl border border-[#E3E7EA] text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] font-bold"
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
            <div className="p-3 bg-[#EEF4F8] rounded-xl border border-[#D8E1E8] space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#667482]">Document Outstanding:</span>
                <span className="font-extrabold text-[#0B2A4A] text-sm font-mono">{formatCurrency(maxBalance)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] border-t border-[#D8E1E8] pt-1 text-[#667482]">
                <span>Available {paymentMethod === 'bank' ? 'Bank' : 'Cash'} Reserves:</span>
                <span className="font-mono font-bold text-[#17212B]">{formatCurrency(availableFunds)}</span>
              </div>
            </div>
          )}

          {/* Simulated Payment Method Selector */}
          <div>
            <label className="block text-[#17212B] font-semibold mb-1">Simulated Payment Source</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                  paymentMethod === 'bank'
                    ? 'bg-[#EEF4F8] border-[#0B2A4A] text-[#0B2A4A] shadow-xs'
                    : 'bg-[#FAFAF8] border-[#E3E7EA] text-[#667482] hover:bg-[#EEF4F8]'
                }`}
              >
                <Landmark className="w-4 h-4 text-[#0B2A4A] shrink-0" />
                <div>
                  <p className="font-bold text-xs">Pay Online / Bank</p>
                  <p className="text-[10px] text-[#667482] font-mono">Reserves: {formatCurrency(liquidBalances.bank)}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'bg-[#EEF4F8] border-[#0B2A4A] text-[#0B2A4A] shadow-xs'
                    : 'bg-[#FAFAF8] border-[#E3E7EA] text-[#667482] hover:bg-[#EEF4F8]'
                }`}
              >
                <Wallet className="w-4 h-4 text-[#18794E] shrink-0" />
                <div>
                  <p className="font-bold text-xs">Cash on Hand</p>
                  <p className="text-[10px] text-[#667482] font-mono">Reserves: {formatCurrency(liquidBalances.cash)}</p>
                </div>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-[#17212B] font-semibold mb-1">Settlement Amount (₹) *</label>
            <input
              type="number"
              required
              step="0.01"
              max={maxBalance}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-[#E3E7EA] text-[#0B2A4A] font-bold font-mono text-sm outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[#17212B] font-semibold mb-1">Payment Reference & Notes</label>
            <input
              type="text"
              placeholder="e.g. UTR #9821389123 / Simulated IMPS Ref"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-[#E3E7EA] text-[#17212B] outline-none focus:border-[#0B2A4A]"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#EEF4F8] hover:bg-[#E2ECF2] text-[#0B2A4A] rounded-xl font-semibold border border-[#D8E1E8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#0B2A4A] hover:bg-[#163B63] text-white rounded-xl font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>{isSubmitting ? 'Posting Ledger...' : 'Confirm & Post to Ledger'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
