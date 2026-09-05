import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  ListOrdered,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Plus,
  Search,
  Trash2,
  Scale,
  Calendar,
  Layers,
  FileCheck,
  ShieldCheck,
  X
} from 'lucide-react';

export default function JournalEntriesView() {
  const {
    journalEntries,
    chartOfAccounts,
    journals,
    analyticAccounts,
    createManualJournalEntry,
    getAccountLedger,
    formatCurrency,
    userRole
  } = useAccounting();

  // Internal Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState('entries'); // 'entries' | 'ledger' | 'trial-balance'
  const [filterJournal, setFilterJournal] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccountForLedger, setSelectedAccountForLedger] = useState('Bank Account (HDFC)');

  // Manual Journal Entry Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualRef, setManualRef] = useState('');
  const [manualJournalType, setManualJournalType] = useState('General');
  const [manualAnalyticId, setManualAnalyticId] = useState('');
  const [manualLines, setManualLines] = useState([
    { account: 'Bank Account (HDFC)', debit: 0, credit: 0 },
    { account: "Owner's Capital", debit: 0, credit: 0 }
  ]);
  const [manualError, setManualError] = useState('');

  // Overall Ledger Balance Totals
  const grandTotalDebits = journalEntries.reduce((sum, entry) => {
    return sum + entry.lines.reduce((lSum, l) => lSum + Number(l.debit || 0), 0);
  }, 0);

  const grandTotalCredits = journalEntries.reduce((sum, entry) => {
    return sum + entry.lines.reduce((lSum, l) => lSum + Number(l.credit || 0), 0);
  }, 0);

  const isLedgerGloballyBalanced = Math.abs(grandTotalDebits - grandTotalCredits) < 0.01;

  // Filtered Journal Entries
  const filteredEntries = journalEntries.filter(entry => {
    const matchJournal = filterJournal === 'All' || entry.journalType === filterJournal;
    const matchSearch = entry.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.lines.some(l => l.account.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchJournal && matchSearch;
  });

  // Manual Line Handlers
  const handleLineChange = (index, field, value) => {
    const updated = [...manualLines];
    updated[index][field] = field === 'account' ? value : Number(value || 0);
    setManualLines(updated);
  };

  const handleAddLine = () => {
    setManualLines([...manualLines, { account: 'Cash on Hand', debit: 0, credit: 0 }]);
  };

  const handleRemoveLine = (index) => {
    if (manualLines.length <= 2) return;
    setManualLines(manualLines.filter((_, i) => i !== index));
  };

  const manualTotalDebits = manualLines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const manualTotalCredits = manualLines.reduce((s, l) => s + Number(l.credit || 0), 0);
  const isManualBalanced = Math.abs(manualTotalDebits - manualTotalCredits) < 0.01 && manualTotalDebits > 0;

  const handlePostManualEntry = (e) => {
    e.preventDefault();
    setManualError('');

    if (!isManualBalanced) {
      setManualError(`Unbalanced Entry: Total Debits (${formatCurrency(manualTotalDebits)}) must equal Total Credits (${formatCurrency(manualTotalCredits)}).`);
      return;
    }

    try {
      createManualJournalEntry({
        date: manualDate,
        reference: manualRef || 'Manual Adjusting Entry',
        journalType: manualJournalType,
        analyticAccountId: manualAnalyticId || null,
        lines: manualLines
      });

      setShowCreateModal(false);
      setManualRef('');
      setManualLines([
        { account: 'Bank Account (HDFC)', debit: 0, credit: 0 },
        { account: "Owner's Capital", debit: 0, credit: 0 }
      ]);
    } catch (err) {
      setManualError(err.message);
    }
  };

  // Account Ledger Statement Data
  const currentAccountLedger = getAccountLedger(selectedAccountForLedger);

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg border border-teak-500/40 shrink-0">
            <img src="/logo.png" alt="Urban Furniture Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 font-display">Double-Entry Accounting Ledger & Journals</h3>
            <p className="text-xs text-slate-400">Strict mathematical integrity: every debit equals credit across all operations.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border ${
              isLedgerGloballyBalanced
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              Accounting Health: {isLedgerGloballyBalanced ? 'Strictly Balanced (0.00 Discrepancy)' : 'Imbalance Detected'}
            </span>
          </div>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('entries')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'entries'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Journal Entries Stream ({journalEntries.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'ledger'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Account Ledger Drilldown</span>
          </button>

          <button
            onClick={() => setActiveSubTab('trial-balance')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'trial-balance'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Trial Balance Sheet</span>
          </button>
        </div>

        {userRole === 'Admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Manual Journal Entry</span>
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. JOURNAL ENTRIES STREAM */}
      {/* ========================================================= */}
      {activeSubTab === 'entries' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              {['All', 'Sales', 'Purchase', 'Bank', 'Cash', 'General'].map((j) => (
                <button
                  key={j}
                  onClick={() => setFilterJournal(j)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    filterJournal === j ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {j}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search reference, account..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900/90 text-xs rounded-xl border border-slate-700 focus:border-indigo-500 outline-none text-slate-200"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredEntries.map((entry) => {
              const entryDebits = entry.lines.reduce((s, l) => s + Number(l.debit || 0), 0);
              const entryCredits = entry.lines.reduce((s, l) => s + Number(l.credit || 0), 0);

              return (
                <div key={entry.id} className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
                  <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-indigo-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                        {entry.id}
                      </span>
                      <span className="font-semibold text-slate-200">Ref: {entry.reference}</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-slate-400">{entry.date}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 font-semibold rounded-full text-[10px] uppercase border border-indigo-500/30">
                        {entry.journalType || 'General'} Journal
                      </span>
                    </div>
                  </div>

                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800/60 text-slate-400 text-[11px]">
                        <th className="py-2.5 px-5">Accounting Chart Line</th>
                        <th className="py-2.5 px-5 text-right w-40">Debit (₹)</th>
                        <th className="py-2.5 px-5 text-right w-40">Credit (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {entry.lines.map((line, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className={`py-2.5 px-5 ${line.debit > 0 ? 'text-slate-100 font-bold' : 'text-slate-300 pl-10'}`}>
                            {line.debit === 0 && <span className="text-slate-500 mr-2">To</span>}
                            {line.account}
                          </td>
                          <td className="py-2.5 px-5 text-right font-mono font-semibold text-emerald-400">
                            {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                          </td>
                          <td className="py-2.5 px-5 text-right font-mono font-semibold text-indigo-400">
                            {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-950/60 font-bold border-t border-slate-800 text-slate-300">
                        <td className="py-2 px-5 text-right text-slate-400 font-medium">Balanced Totals:</td>
                        <td className="py-2 px-5 text-right font-mono text-emerald-400">{formatCurrency(entryDebits)}</td>
                        <td className="py-2 px-5 text-right font-mono text-indigo-400">{formatCurrency(entryCredits)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ACCOUNT LEDGER DRILLDOWN */}
      {/* ========================================================= */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Select Chart of Account to Inspect:</span>
              <select
                value={selectedAccountForLedger}
                onChange={(e) => setSelectedAccountForLedger(e.target.value)}
                className="mt-1 px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 font-bold text-xs outline-none focus:border-indigo-500"
              >
                {chartOfAccounts.map((acc) => (
                  <option key={acc.id || acc.code} value={acc.name}>
                    {acc.code} - {acc.name} ({acc.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Ledger Statement</span>
              <p className="font-bold text-slate-200 text-xs">{selectedAccountForLedger}</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">JE Number</th>
                    <th className="py-3 px-4">Particulars / Description</th>
                    <th className="py-3 px-4">Journal</th>
                    <th className="py-3 px-4 text-right">Debit (+)</th>
                    <th className="py-3 px-4 text-right">Credit (−)</th>
                    <th className="py-3 px-4 text-right">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {currentAccountLedger.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-400">{item.date}</td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">{item.jeId}</td>
                      <td className="py-3 px-4 font-semibold text-slate-200">{item.reference}</td>
                      <td className="py-3 px-4 text-slate-400">{item.journalType}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        {item.debit > 0 ? formatCurrency(item.debit) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-indigo-400">
                        {item.credit > 0 ? formatCurrency(item.credit) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-100">
                        {formatCurrency(item.balance)}
                      </td>
                    </tr>
                  ))}
                  {currentAccountLedger.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-500 italic">
                        No transactions recorded for this account yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TRIAL BALANCE SHEET */}
      {/* ========================================================= */}
      {activeSubTab === 'trial-balance' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>Trial Balance:</strong> Summarizes the debits and credits of all ledger accounts to prove mathematical equality in double-entry bookkeeping.
              </span>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Account Title</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4 text-right w-44">Debit Balance (₹)</th>
                  <th className="py-3 px-4 text-right w-44">Credit Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {chartOfAccounts.map((acc) => {
                  const isDebitNormal = acc.type === 'Asset' || acc.type === 'Expense';
                  return (
                    <tr key={acc.id || acc.code} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">{acc.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-100">{acc.name}</td>
                      <td className="py-3 px-4 text-slate-400">{acc.type}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        {isDebitNormal ? formatCurrency(Math.max(0, acc.balance)) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-indigo-400">
                        {!isDebitNormal ? formatCurrency(Math.max(0, acc.balance)) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-950 font-extrabold text-sm border-t-2 border-indigo-500/50 text-slate-100">
                  <td colSpan="3" className="py-3 px-4 text-right uppercase tracking-wider">
                    Trial Balance Totals:
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400">
                    {formatCurrency(grandTotalDebits)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-indigo-400">
                    {formatCurrency(grandTotalCredits)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: MANUAL JOURNAL ENTRY BUILDER */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-100">Create Manual Journal Entry</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {manualError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{manualError}</span>
              </div>
            )}

            <form onSubmit={handlePostManualEntry} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Journal Date *</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Journal Category</label>
                  <select
                    value={manualJournalType}
                    onChange={(e) => setManualJournalType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 outline-none"
                  >
                    <option value="General">General Journal</option>
                    <option value="Bank">Bank Journal</option>
                    <option value="Cash">Cash Journal</option>
                    <option value="Sales">Sales Journal</option>
                    <option value="Purchase">Purchase Journal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Analytic Cost Center</label>
                  <select
                    value={manualAnalyticId}
                    onChange={(e) => setManualAnalyticId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 outline-none"
                  >
                    <option value="">-- None (General) --</option>
                    {analyticAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Transaction Reference / Narration *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Month-end depreciation on showroom display fixtures"
                  value={manualRef}
                  onChange={(e) => setManualRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 outline-none"
                />
              </div>

              {/* Dynamic Debit / Credit Rows */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Journal Item Lines (Debit & Credit)</span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Line</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {manualLines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 items-center">
                      <div className="col-span-5">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Account</label>
                        <select
                          required
                          value={line.account}
                          onChange={(e) => handleLineChange(idx, 'account', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-900 rounded-lg border border-slate-700 text-slate-100 text-xs"
                        >
                          {chartOfAccounts.map((a) => (
                            <option key={a.id || a.code} value={a.name}>
                              {a.name} ({a.type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Debit Amount (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={line.debit || ''}
                          onChange={(e) => handleLineChange(idx, 'debit', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-900 rounded-lg border border-slate-700 text-emerald-400 font-mono font-bold text-xs"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Credit Amount (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={line.credit || ''}
                          onChange={(e) => handleLineChange(idx, 'credit', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-900 rounded-lg border border-slate-700 text-indigo-400 font-mono font-bold text-xs"
                        />
                      </div>

                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Equality Verification Card */}
              <div
                className={`p-4 rounded-xl border flex justify-between items-center ${
                  isManualBalanced
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}
              >
                <div>
                  <span className="font-bold block">
                    Double-Entry Rule Check: {isManualBalanced ? 'Balanced ✅' : 'Out of Balance ❌'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Total Debits ({formatCurrency(manualTotalDebits)}) must equal Total Credits ({formatCurrency(manualTotalCredits)})
                  </span>
                </div>
                <div className="font-mono font-extrabold text-sm">
                  Diff: {formatCurrency(Math.abs(manualTotalDebits - manualTotalCredits))}
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isManualBalanced}
                  className={`px-5 py-2 rounded-xl font-semibold shadow-lg transition-all ${
                    isManualBalanced
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Post Journal Entry to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
