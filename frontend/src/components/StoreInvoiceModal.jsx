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
    <div className="fixed inset-0 z-50 bg-[#0B2A4A]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white text-[#17212B] rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 border border-[#E3E7EA]">
        
        {/* ========================================================= */}
        {/* 1. HEADER ROW: [ LOGO ]   NAME   GST No. */}
        {/* ========================================================= */}
        <div className="border-b-2 border-[#0B2A4A] pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* LOGO + STORE NAME */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-xl bg-white p-1 flex items-center justify-center border-2 border-[#0B2A4A] shadow-xs shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Urban Furniture Logo" 
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#0B2A4A] tracking-tight font-display uppercase">
                  Urban Furniture
                </h1>
                <p className="text-xs font-semibold text-[#667482]">Store & Showroom Invoice</p>
                <p className="text-[11px] text-[#8A96A3]">Bhiwandi Furniture Park, Mumbai, Maharashtra - 421302</p>
              </div>
            </div>

            {/* GST No. & TAX INVOICE BADGE */}
            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E3E7EA]">
              <span className="text-xs font-mono font-bold bg-[#0B2A4A] text-white px-3 py-1 rounded-md uppercase tracking-wider">
                Tax Invoice / Bill
              </span>
              <div className="mt-2 text-xs font-mono font-bold text-[#17212B]">
                <span>GST No: </span>
                <span className="text-[#0B2A4A]">27AABCU1234F1Z8</span>
              </div>
              <p className="text-[10px] text-[#8A96A3] font-mono">CIN: U36100MH2024PTC123456</p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. SUB-HEADER: CUSTOMER INFO  |  DATE */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border border-[#E3E7EA] rounded-xl p-4 bg-[#FAFAF8]">
          {/* CUSTOMER INFO */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#667482] block border-b border-[#E3E7EA] pb-1">
              Customer Info
            </span>
            <p className="font-extrabold text-[#0B2A4A] text-sm">{invoice.customerName || 'Walk-in Customer'}</p>
            <p className="text-[#667482]">{invoice.customerAddress || 'Mumbai, Maharashtra'}</p>
            
            {/* CUSTOMER CONTACT NUMBER */}
            <div className="flex items-center space-x-1.5 text-xs text-[#17212B] font-semibold pt-0.5">
              <Phone className="w-3.5 h-3.5 text-[#0B2A4A] shrink-0" />
              <span>Contact No:</span>
              <span className="font-mono font-bold text-[#0B2A4A] bg-[#EEF4F8] px-1.5 py-0.5 rounded border border-[#D8E1E8]">
                {invoice.customerPhone || invoice.mobile || invoice.phone || invoice.customerContact || '+91 98123 45678'}
              </span>
            </div>

            <p className="text-[#8A96A3] text-[11px]">{invoice.customerEmail || 'customer@urbanfurniture.in'}</p>
          </div>

          {/* DATE & BILL INFO */}
          <div className="space-y-1 sm:text-right">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#667482] block border-b border-[#E3E7EA] pb-1">
              Date & Bill Details
            </span>
            <p className="font-mono font-bold text-[#0B2A4A] text-sm">
              Bill No: <span className="text-[#0B2A4A]">{invoice.id}</span>
            </p>
            <p className="text-[#667482]">Date: <strong className="font-mono text-[#17212B]">{invoice.date}</strong></p>
            <p className="text-[#667482]">Due Date: <strong className="font-mono text-[#17212B]">{invoice.dueDate}</strong></p>
            <div className="pt-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                invoice.status === 'Paid' 
                  ? 'bg-[#EAF7F0] text-[#18794E] border-[#A3E6C0]' 
                  : invoice.status === 'Partially Paid'
                    ? 'bg-[#FFF6DF] text-[#B7791F] border-[#FDE3A7]'
                    : 'bg-[#FDECEC] text-[#B42318] border-[#F8B4B4]'
              }`}>
                Status: {invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. PRODUCT TABLE & CONNECTED TOTALS SUMMARY */}
        {/* ========================================================= */}
        <div className="border border-[#E3E7EA] rounded-xl overflow-hidden shadow-xs bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0B2A4A] text-white font-bold uppercase tracking-wider">
                <th className="py-3 px-4 border-r border-[#163B63]">Product Detail</th>
                <th className="py-3 px-4 text-center border-r border-[#163B63] w-24">Qty</th>
                <th className="py-3 px-4 text-right w-44">Price (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E7EA]">
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, index) => (
                  <tr key={index} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="py-3.5 px-4 border-r border-[#E3E7EA]">
                      <p className="font-bold text-[#17212B]">{item.productName}</p>
                      {item.description && (
                        <p className="text-[11px] text-[#8A96A3] mt-0.5">{item.description}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-[#17212B] border-r border-[#E3E7EA]">
                      {item.qty}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#17212B]">
                      {formatCurrency(item.total || (item.qty * item.unitPrice))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-4 text-center text-[#8A96A3]">
                    No products listed.
                  </td>
                </tr>
              )}

              {/* TWO BLANK LINES UNDER PURCHASED PRODUCTS */}
              <tr className="h-8">
                <td className="border-r border-[#E3E7EA]">&nbsp;</td>
                <td className="border-r border-[#E3E7EA]">&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
              <tr className="h-8">
                <td className="border-r border-[#E3E7EA]">&nbsp;</td>
                <td className="border-r border-[#E3E7EA]">&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            </tbody>

            {/* CONNECTED SUMMARY FOOTER */}
            <tfoot className="border-t-2 border-[#0B2A4A] bg-[#FAFAF8] divide-y divide-[#E3E7EA] text-xs">
              <tr>
                <td colSpan="2" className="py-2.5 px-4 text-right font-bold uppercase text-[11px] text-[#667482] border-r border-[#E3E7EA]">
                  Sum (Subtotal):
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-[#17212B]">
                  {formatCurrency(subtotal)}
                </td>
              </tr>

              {tax > 0 && (
                <tr>
                  <td colSpan="2" className="py-2.5 px-4 text-right font-bold uppercase text-[11px] text-[#667482] border-r border-[#E3E7EA]">
                    GST (18%):
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-[#17212B]">
                    {formatCurrency(tax)}
                  </td>
                </tr>
              )}

              <tr className="bg-[#EEF4F8]">
                <td colSpan="2" className="py-3 px-4 text-right uppercase text-xs font-black tracking-wider text-[#0B2A4A] border-r border-[#D8E1E8]">
                  Total:
                </td>
                <td className="py-3 px-4 text-right font-mono text-[#0B2A4A] text-base font-black">
                  {formatCurrency(grandTotal)}
                </td>
              </tr>

              <tr>
                <td colSpan="2" className="py-2 px-4 text-right text-[11px] text-[#667482] border-r border-[#E3E7EA]">
                  Paid Amount:
                </td>
                <td className="py-2 px-4 text-right font-mono font-bold text-[#18794E] text-xs">
                  {formatCurrency(paidAmount)}
                </td>
              </tr>

              <tr>
                <td colSpan="2" className="py-2 px-4 text-right text-[11px] font-bold text-[#B42318] border-r border-[#E3E7EA]">
                  Outstanding Balance:
                </td>
                <td className="py-2 px-4 text-right font-mono font-bold text-[#B42318] text-xs">
                  {formatCurrency(balance)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ========================================================= */}
        {/* 5. FOOTER BLOCK: [ FOOTER ] (Terms, Bank Info, Signature) */}
        {/* ========================================================= */}
        <div className="border border-[#E3E7EA] rounded-xl p-4 bg-[#FAFAF8] text-xs space-y-3">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#667482] block border-b border-[#E3E7EA] pb-1">
            Footer / Store Terms & Signatory
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* TERMS & BANK DETAILS */}
            <div className="space-y-1 text-[11px] text-[#667482]">
              <p className="font-bold text-[#17212B]">Terms & Conditions:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                <li>Goods once sold can be returned within 7 days with original bill.</li>
                <li>1 Year Warranty against structural manufacturing defects.</li>
              </ul>
              <p className="font-bold text-[#17212B] pt-1">Bank Payment Details:</p>
              <p className="text-[10px]">HDFC Bank A/C: 50200012345678 | IFSC: HDFC0000123</p>
            </div>

            {/* SIGNATURE & STAMP BOX */}
            <div className="flex flex-col justify-between text-right space-y-4">
              <p className="text-[11px] font-bold text-[#17212B]">For Urban Furniture Ltd.</p>
              <div className="pt-6 border-t border-dashed border-[#8A96A3] w-48 ml-auto text-center">
                <span className="text-[10px] font-semibold text-[#8A96A3] uppercase">Authorized Signatory & Stamp</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-center border-t border-[#E3E7EA]">
            <p className="text-[11px] font-bold text-[#0B2A4A]">Thank you for choosing Urban Furniture!</p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 6. MODAL ACTION BUTTONS */}
        {/* ========================================================= */}
        <div className="flex justify-between items-center pt-2 border-t border-[#E3E7EA] no-print">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-2 bg-[#0B2A4A] hover:bg-[#163B63] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Bill (PDF)</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#EEF4F8] hover:bg-[#E2ECF2] text-[#0B2A4A] rounded-xl text-xs font-bold transition-all border border-[#D8E1E8] cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
