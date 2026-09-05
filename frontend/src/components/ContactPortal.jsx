import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  Users,
  Receipt,
  CreditCard,
  Building2,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Package
} from 'lucide-react';

export default function ContactPortal() {
  const {
    contacts,
    activeContactId,
    setActiveContactId,
    getContactHistory,
    setPaymentTargetDoc,
    setShowPaymentModal,
    formatCurrency,
    currentUser,
    userRole
  } = useAccounting();

  const activeContact = contacts.find(c => 
    (currentUser?.contact_id && c.backendId === currentUser.contact_id) ||
    c.id === activeContactId || 
    c.backendId === Number(activeContactId)
  ) || contacts[0] || null;
  
  const history = activeContact ? getContactHistory(activeContact.id || activeContact.backendId) : {
    invoices: [],
    vendorBills: [],
    totalInvoiced: 0,
    totalReceivable: 0,
    totalBilled: 0,
    totalPayable: 0
  };

  const [activePortalTab, setActivePortalTab] = useState(activeContact?.type === 'Vendor' ? 'bills' : 'invoices');

  if (!activeContact) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
        <Users className="w-10 h-10 text-slate-300 mx-auto" />
        <p className="text-sm font-semibold text-slate-700">No contact profile found</p>
        <p className="text-xs text-slate-400">Please create a customer or vendor contact first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contact Profile Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-[#D4F6FF] border border-[#C6E7FF] flex items-center justify-center text-slate-900 font-extrabold text-lg">
            {activeContact.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">{activeContact.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                activeContact.type === 'Customer'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {activeContact.type}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeContact.email || 'No email registered'} • {activeContact.mobile || 'No mobile registered'}
            </p>
            <p className="text-xs text-slate-400">
              {activeContact.address?.city || 'Mumbai'}, {activeContact.address?.state || 'Maharashtra'}
            </p>
          </div>
        </div>

        {/* Contact Selector for Admin / Accountant role */}
        {userRole !== 'Contact' && contacts.length > 1 && (
          <div className="flex items-center space-x-2 bg-[#FBFBFB] p-2 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-semibold">Viewing Contact:</span>
            <select
              value={activeContact.id}
              onChange={(e) => setActiveContactId(e.target.value)}
              className="bg-white text-slate-900 font-bold px-3 py-1.5 rounded-lg border border-slate-200 outline-none cursor-pointer"
            >
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Account Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Customer Receivable */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 uppercase font-semibold">Outstanding Due Balance</span>
            <h3 className="text-2xl font-bold text-[#145B9D] mt-1 font-mono">{formatCurrency(history.totalReceivable)}</h3>
            <span className="text-[11px] text-slate-400">Total Billed: {formatCurrency(history.totalInvoiced)}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#D4F6FF] text-[#145B9D]">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Vendor Payable */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 uppercase font-semibold">Vendor Payable Balance</span>
            <h3 className="text-2xl font-bold text-amber-700 mt-1 font-mono">{formatCurrency(history.totalPayable)}</h3>
            <span className="text-[11px] text-slate-400">Total Procured: {formatCurrency(history.totalBilled)}</span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Portal Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActivePortalTab('invoices')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePortalTab === 'invoices'
                  ? 'bg-[#C6E7FF] text-slate-900 border border-[#9BD5FF]/40 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Invoices ({history.invoices.length})
            </button>
            <button
              onClick={() => setActivePortalTab('bills')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePortalTab === 'bills'
                  ? 'bg-[#C6E7FF] text-slate-900 border border-[#9BD5FF]/40 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Bills ({history.vendorBills.length})
            </button>
          </div>
        </div>

        {activePortalTab === 'invoices' && (
          history.invoices.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-600">No invoices on file for this account</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#FBFBFB] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 text-right">Total (₹)</th>
                    <th className="py-3 px-4 text-right">Balance Due (₹)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Online Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#D4F6FF]/20">
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">{inv.id}</td>
                      <td className="py-3.5 px-4 text-slate-600">{inv.date}</td>
                      <td className="py-3.5 px-4 text-slate-600">{inv.dueDate}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(inv.totalAmount)}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#145B9D]">{formatCurrency(inv.balance)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          inv.status === 'Partially Paid' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {inv.balance > 0 && (
                          <button
                            onClick={() => {
                              setPaymentTargetDoc(inv);
                              setShowPaymentModal(true);
                            }}
                            className="px-3 py-1 bg-[#C6E7FF] hover:bg-[#9BD5FF] text-slate-900 font-bold text-[11px] rounded-lg border border-[#9BD5FF]/40 cursor-pointer inline-flex items-center space-x-1"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Pay Online</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {activePortalTab === 'bills' && (
          history.vendorBills.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-600">No vendor bills on file for this account</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#FBFBFB] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Bill #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 text-right">Total (₹)</th>
                    <th className="py-3 px-4 text-right">Balance Due (₹)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.vendorBills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-[#D4F6FF]/20">
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">{bill.id}</td>
                      <td className="py-3.5 px-4 text-slate-600">{bill.date}</td>
                      <td className="py-3.5 px-4 text-slate-600">{bill.dueDate}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(bill.totalAmount)}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-700">{formatCurrency(bill.balance)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          bill.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          bill.status === 'Partially Paid' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {bill.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
