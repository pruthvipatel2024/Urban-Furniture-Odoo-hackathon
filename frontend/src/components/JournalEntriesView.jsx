import React from 'react';
import { ListOrdered, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';

export default function JournalEntriesView({ journalEntries }) {
  const totalDebits = journalEntries.reduce((sum, entry) => {
    return sum + entry.lines.reduce((lSum, l) => lSum + Number(l.debit || 0), 0);
  }, 0);

  const totalCredits = journalEntries.reduce((sum, entry) => {
    return sum + entry.lines.reduce((lSum, l) => lSum + Number(l.credit || 0), 0);
  }, 0);

  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">General Accounting Ledger & Journal Entries</h3>
            <p className="text-xs text-slate-500">Immutable double-entry transaction trail satisfying accounting equation.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold ${isBalanced ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>Ledger Status: {isBalanced ? 'Strictly Balanced' : 'Unbalanced Warning'}</span>
          </div>
        </div>
      </div>

      {/* Journal Entries List */}
      <div className="space-y-4">
        {journalEntries.map((entry) => {
          const entryDebits = entry.lines.reduce((s, l) => s + Number(l.debit || 0), 0);
          const entryCredits = entry.lines.reduce((s, l) => s + Number(l.credit || 0), 0);

          return (
            <div key={entry.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200">{entry.id}</span>
                  <span className="font-semibold text-slate-700">Ref: {entry.reference}</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-500">{entry.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded text-[10px] uppercase">
                    {entry.journalType || 'General'} Journal
                  </span>
                </div>
              </div>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="py-2.5 px-5">Account Description</th>
                    <th className="py-2.5 px-5 text-right w-36">Debit (₹)</th>
                    <th className="py-2.5 px-5 text-right w-36">Credit (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entry.lines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className={`py-2.5 px-5 font-medium ${line.debit > 0 ? 'text-slate-900 font-semibold' : 'text-slate-600 pl-10'}`}>
                        {line.account}
                      </td>
                      <td className="py-2.5 px-5 text-right font-mono font-semibold text-emerald-600">
                        {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                      </td>
                      <td className="py-2.5 px-5 text-right font-mono font-semibold text-indigo-600">
                        {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/80 font-bold border-t border-slate-200 text-slate-800">
                    <td className="py-2 px-5 text-right text-slate-500 font-medium">Entry Totals:</td>
                    <td className="py-2 px-5 text-right font-mono text-emerald-700">{formatCurrency(entryDebits)}</td>
                    <td className="py-2 px-5 text-right font-mono text-indigo-700">{formatCurrency(entryCredits)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
