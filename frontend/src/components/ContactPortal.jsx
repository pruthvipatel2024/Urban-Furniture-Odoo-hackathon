import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  Users,
  Receipt,
  FileText,
  CreditCard,
  Building2,
  CheckCircle2,
  Printer,
  ArrowDownLeft,
  ExternalLink,
  ShieldCheck,
  DollarSign
} from 'lucide-react';

export default function ContactPortal() {
  const {
    contacts,
    activeContactId,
    setActiveContactId,
    getContactHistory,
    setPaymentTargetDoc,
    setShowPaymentModal,
    formatCurrency
  } = useAccounting();

  const activeContact = contacts.find(c => c.id === activeContactId) || contacts[1]; // default Nimesh
  const history = getContactHistory(activeContact.id);

  const [activePortalTab, setActivePortalTab] = useState(activeContact.type === 'Vendor' ? 'bills' : 'invoices');

  return (
    <div className="space-y-6">
      {/* Contact Switcher & Profile Card */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-indigo-500/30">
        <div className="flex items-center space-x-4">
          <img
            src={activeContact.profileImage}
            alt={activeContact.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500/50 shadow-md"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-100">{activeContact.name}</h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  activeContact.type === 'Customer'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {activeContact.type} Portal
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{activeContact.email} • {activeContact.mobile}</p>
            <p className="text-xs text-slate-400">{activeContact.address?.city}, {activeContact.address?.state}</p>
          </div>
        </div>

        {/* Portal Switcher for Demo */}
        <div className="flex items-center space-x-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Simulate As:</span>
          <select
            value={activeContact.id}
            onChange={(e) => setActiveContactId(e.target.value)}
            className="bg-slate-900 text-indigo-300 font-bold px-3 py-1.5 rounded-lg border border-slate-700 outline-none cursor-pointer"
          >
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Account Balances Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {activeContact.type !== 'Vendor' && (
          <div className="glass-panel p-5 rounded-2xl">
            <span className="text-xs text-slate-400 uppercase font-semibold">My Invoiced Purchases</span>
            <h3 className="text-2xl font-bold text-slate-100 mt-1 font-mono">{formatCurrency(history.totalInvoiced)}</h3>
            <span className="text-[11px] text-slate-500">Cumulative order billing</span>
          </div>
        )}

        {activeContact.type !== 'Vendor' && (
          <div className="glass-panel p-5 rounded-2xl">
            <span className="text-xs text-slate-400 uppercase font-semibold">My Outstanding Due</span>
            <h3 className={`text-2xl font-bold mt-1 font-mono ${history.totalReceivable > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {formatCurrency(history.totalReceivable)}
            </h3>
            <span className="text-[11px] text-slate-400">
              {history.totalReceivable > 0 ? 'Payment required' : 'All invoices fully settled'}
            </span>
          </div>
        )}

        {activeContact.type !== 'Customer' && (
          <div className="glass-panel p-5 rounded-2xl">
            <span className="text-xs text-slate-400 uppercase font-semibold">My Vendor Supplies</span>
            <h3 className="text-2xl font-bold text-amber-400 mt-1 font-mono">{formatCurrency(history.totalBilled)}</h3>
            <span className="text-[11px] text-slate-500">Total bills generated</span>
          </div>
        )}

        {activeContact.type !== 'Customer' && (
          <div className="glass-panel p-5 rounded-2xl">
            <span className="text-xs text-slate-400 uppercase font-semibold">Pending Vendor Payout</span>
            <h3 className="text-2xl font-bold text-indigo-400 mt-1 font-mono">{formatCurrency(history.totalPayable)}</h3>
            <span className="text-[11px] text-slate-400">Awaiting Urban Furniture settlement</span>
          </div>
        )}
      </div>

      {/* Transactions Table for this Contact */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-indigo-400" />
            <span>My Documents & Invoices</span>
          </h3>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Statement</span>
          </button>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Document ID</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Remaining Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {history.invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{inv.id}</td>
                  <td className="py-3.5 px-4 text-slate-400">{inv.date}</td>
                  <td className="py-3.5 px-4 text-slate-400">{inv.dueDate}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-100 font-mono">
                    {formatCurrency(inv.totalAmount)}
                  </td>
                  <td className="py-3.5 px-4 font-bold font-mono text-emerald-400">
                    {formatCurrency(inv.balance)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {inv.balance > 0 ? (
                      <button
                        onClick={() => {
                          setPaymentTargetDoc({ ...inv, type: 'Customer Invoice' });
                          setShowPaymentModal(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1 rounded-xl text-xs transition-all shadow-md"
                      >
                        Pay Online Now
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-400 flex items-center justify-end space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Paid</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {history.vendorBills.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{b.id}</td>
                  <td className="py-3.5 px-4 text-slate-400">{b.date}</td>
                  <td className="py-3.5 px-4 text-slate-400">{b.dueDate}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-100 font-mono">
                    {formatCurrency(b.totalAmount)}
                  </td>
                  <td className="py-3.5 px-4 font-bold font-mono text-amber-400">
                    {formatCurrency(b.balance)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'Paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-slate-400 text-xs font-mono">Bill Settled by UF</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
