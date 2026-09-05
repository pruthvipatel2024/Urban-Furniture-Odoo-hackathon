import React from 'react';
import { Printer, X, CheckCircle2, Building2, ShieldCheck, Phone } from 'lucide-react';

export default function StoreInvoiceModal({ invoice, onClose, formatCurrency }) {
  if (!invoice) return null;

  const subtotal = invoice.subtotal || invoice.totalAmount || 0;
  const tax = invoice.tax || 0;
  const grandTotal = invoice.totalAmount || 0;
  const paidAmount = invoice.paidAmount || 0;
  const balance = invoice.balance ?? (grandTotal - paidAmount);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 border border-slate-300">
        
        {/* ========================================================= */}
        {/* 1. HEADER ROW: [ LOGO ]   NAME   GST No. */}
        {/* ========================================================= */}
        <div className="border-b-2 border-slate-900 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* LOGO + STORE NAME */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-xl bg-white p-1 flex items-center justify-center border-2 border-slate-900 shadow-sm shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Urban Furniture Logo" 
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display uppercase">
                  Urban Furniture
                </h1>
                <p className="text-xs font-semibold text-slate-600">Store & Showroom Invoice</p>
                <p className="text-[11px] text-slate-500">Bhiwandi Furniture Park, Mumbai, Maharashtra - 421302</p>
              </div>
            </div>

            {/* GST No. & TAX INVOICE BADGE */}
            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
              <span className="text-xs font-mono font-bold bg-slate-900 text-white px-3 py-1 rounded-md uppercase tracking-wider">
                Tax Invoice / Bill
              </span>
              <div className="mt-2 text-xs font-mono font-bold text-slate-800">
                <span>GST No: </span>
                <span className="text-indigo-700">27AABCU1234F1Z8</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">CIN: U36100MH2024PTC123456</p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. SUB-HEADER: CUSTOMER INFO  |  DATE */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border border-slate-300 rounded-xl p-4 bg-slate-50/80">
          {/* CUSTOMER INFO */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block border-b border-slate-200 pb-1">
              Customer Info
            </span>
            <p className="font-extrabold text-slate-900 text-sm">{invoice.customerName || 'Walk-in Customer'}</p>
            <p className="text-slate-700">{invoice.customerAddress || 'Mumbai, Maharashtra'}</p>
            
            {/* CUSTOMER CONTACT NUMBER */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-800 font-semibold pt-0.5">
              <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Contact No:</span>
              <span className="font-mono font-bold text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                {invoice.customerPhone || invoice.mobile || invoice.phone || invoice.customerContact || '+91 98123 45678'}
              </span>
            </div>

            <p className="text-slate-600 text-[11px]">{invoice.customerEmail || 'customer@urbanfurniture.in'}</p>
          </div>

          {/* DATE & BILL INFO */}
          <div className="space-y-1 sm:text-right">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block border-b border-slate-200 pb-1">
              Date & Bill Details
            </span>
            <p className="font-mono font-bold text-slate-900 text-sm">
              Bill No: <span className="text-indigo-800">{invoice.id}</span>
            </p>
            <p className="text-slate-700">Date: <strong className="font-mono">{invoice.date}</strong></p>
            <p className="text-slate-600">Due Date: <strong className="font-mono">{invoice.dueDate}</strong></p>
            <div className="pt-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                invoice.status === 'Paid' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : invoice.status === 'Partially Paid'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}>
                Status: {invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. PRODUCT TABLE: PRODUCT DETAIL | QTY | PRICE */}
        {/* ========================================================= */}
        <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                <th className="py-3 px-4 border-r border-slate-800">Product Detail</th>
                <th className="py-3 px-4 text-center border-r border-slate-800 w-24">Qty</th>
                <th className="py-3 px-4 text-right w-36">Price (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 border-r border-slate-200">
                      <p className="font-bold text-slate-900">{item.productName}</p>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 border-r border-slate-200">
                      {item.qty}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.total || (item.qty * item.unitPrice))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-4 text-center text-slate-400">
                    No products listed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ========================================================= */}
        {/* 4. TOTALS BLOCK: SUM | GST (18%) | TOTAL */}
        {/* ========================================================= */}
        <div className="flex justify-start">
          <div className="w-full sm:w-80 border border-slate-300 rounded-xl p-4 bg-slate-50/90 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-semibold uppercase text-[11px]">Sum (Subtotal):</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            
            {tax > 0 && (
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold uppercase text-[11px]">GST (18%):</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(tax)}</span>
              </div>
            )}

            <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-center text-slate-900 font-black text-sm">
              <span className="uppercase tracking-wider">Total:</span>
              <span className="font-mono text-emerald-700 text-base">{formatCurrency(grandTotal)}</span>
            </div>

            <div className="pt-1 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-600">
              <span>Paid Amount:</span>
              <span className="font-mono font-bold text-emerald-600">{formatCurrency(paidAmount)}</span>
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-rose-700">
              <span>Outstanding Balance:</span>
              <span className="font-mono">{formatCurrency(balance)}</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. FOOTER BLOCK: [ FOOTER ] (Terms, Bank Info, Signature) */}
        {/* ========================================================= */}
        <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/60 text-xs space-y-3">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block border-b border-slate-200 pb-1">
            Footer / Store Terms & Signatory
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* TERMS & BANK DETAILS */}
            <div className="space-y-1 text-[11px] text-slate-600">
              <p className="font-bold text-slate-800">Terms & Conditions:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                <li>Goods once sold can be returned within 7 days with original bill.</li>
                <li>1 Year Warranty against structural manufacturing defects.</li>
              </ul>
              <p className="font-bold text-slate-800 pt-1">Bank Payment Details:</p>
              <p className="text-[10px]">HDFC Bank A/C: 50200012345678 | IFSC: HDFC0000123</p>
            </div>

            {/* SIGNATURE & STAMP BOX */}
            <div className="flex flex-col justify-between text-right space-y-4">
              <p className="text-[11px] font-bold text-slate-800">For Urban Furniture Ltd.</p>
              <div className="pt-6 border-t border-dashed border-slate-400 w-48 ml-auto text-center">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Authorized Signatory & Stamp</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-center border-t border-slate-200">
            <p className="text-[11px] font-bold text-slate-700">Thank you for shopping with Urban Furniture!</p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 6. MODAL ACTION BUTTONS */}
        {/* ========================================================= */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-200 no-print">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Bill (PDF)</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
