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
  ShieldCheck,
  X
} from 'lucide-react';

export default function JournalEntriesView() {
  const {
    journalEntries,
    chartOfAccounts,
    journals,
    createManualJournalEntry,
    getAccountLedger,
    trialBalanceReport,
    formatCurrency,
    userRole
  } = useAccounting();

  // Internal Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState('entries'); // 'entries' | 'ledger' | 'trial-balance'
  const [filterJournal, setFilterJournal] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccountForLedger, setSelectedAccountForLedger] = useState(chartOfAccounts[0]?.name || 'Debtors');

  // Manual Journal Entry Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualRef, setManualRef] = useState('');
  const [manualLines, setManualLines] = useState([
    { accountId: 1, debit: 0, credit: 0, description: '' },
    { accountId: 2, debit: 0, credit: 0, description: '' }
  ]);
  const [manualError, setManualError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Overall Ledger Balance Totals
  const grandTotalDebits = journalEntries.reduce((sum, entry) => {
    return sum + (entry.lines || []).reduce((lSum, l) => lSum + Number(l.debit || 0), 0);
  }, 0);

  const grandTotalCredits = journalEntries.reduce((sum, entry) => {
    return sum + (entry.lines || []).reduce((lSum, l) => lSum + Number(l.credit || 0), 0);
  }, 0);

  const isLedgerGloballyBalanced = Math.abs(grandTotalDebits - grandTotalCredits) < 0.01;

  // Filtered Journal Entries
  const filteredEntries = journalEntries.filter(entry => {
    const matchJournal = filterJournal === 'All' || entry.journalType === filterJournal;
    const matchSearch = (entry.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.lines || []).some(l => (l.account || '').toLowerCase().includes(searchTerm.toLowerCase()));
    return matchJournal && matchSearch;
  });

  // Manual Line Handlers
  const handleLineChange = (index, field, value) => {
    const updated = [...manualLines];
    if (field === 'accountId') {
      updated[index].accountId = Number(value);
    } else if (field === 'description') {
      updated[index].description = value;
    } else {
      updated[index][field] = Number(value || 0);
    }
    setManualLines(updated);
  };

  const handleAddLine = () => {
    const defaultAccId = chartOfAccounts[0]?.backendId || 1;
    setManualLines([...manualLines, { accountId: defaultAccId, debit: 0, credit: 0, description: '' }]);
  };

  const handleRemoveLine = (index) => {
    if (manualLines.length <= 2) return;
    setManualLines(manualLines.filter((_, i) => i !== index));
  };

  const manualTotalDebits = manualLines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const manualTotalCredits = manualLines.reduce((s, l) => s + Number(l.credit || 0), 0);
  const isManualBalanced = Math.abs(manualTotalDebits - manualTotalCredits) < 0.01 && manualTotalDebits > 0;

  const handlePostManualEntry = async (e) => {
    e.preventDefault();
    setManualError('');

    if (!isManualBalanced) {
      setManualError(`Unbalanced Entry: Total Debits (${formatCurrency(manualTotalDebits)}) must equal Total Credits (${formatCurrency(manualTotalCredits)}).`);
      return;
    }

    setIsSubmitting(true);
    try {
      await createManualJournalEntry({
        date: manualDate,
        reference: manualRef || 'Manual Adjusting Entry',
        lines: manualLines
      });

      setShowCreateModal(false);
      setManualRef('');
      setManualLines([
        { accountId: 1, debit: 0, credit: 0, description: '' },
        { accountId: 2, debit: 0, credit: 0, description: '' }
      ]);
    } catch (err) {
      setManualError(err.message || 'Failed to post manual journal entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Account Ledger view
  const ledgerItems = getAccountLedger(selectedAccountForLedger);

  return (
    <div className="space-y-6">
      {/* Top Header & Double-Entry Health Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">General Ledger System</span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center space-x-1 ${
              isLedgerGloballyBalanced
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isLedgerGloballyBalanced ? 'Double-Entry Balanced (Dr = Cr)' : 'Ledger Unbalanced'}</span>
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 font-display">Authoritative Financial Ledger</h2>
          <p className="text-xs text-slate-500">
            Debits: <strong className="text-slate-900 font-mono">{formatCurrency(grandTotalDebits)}</strong> • Credits: <strong className="text-slate-900 font-mono">{formatCurrency(grandTotalCredits)}</strong>
          </p>
        </div>

        {userRole !== 'Contact' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 bg-[#C6E7FF] hover:bg-[#9BD5FF] active:bg-[#64B9FF] text-slate-900 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs border border-[#9BD5FF]/40 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Adjusting Entry</span>
          </button>
        )}
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('entries')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'entries'
                ? 'bg-[#C6E7FF] text-slate-900 border border-[#9BD5FF]/40 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>All Journal Entries</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200">
              {journalEntries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'ledger'
                ? 'bg-[#C6E7FF] text-slate-900 border border-[#9BD5FF]/40 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Account-Wise Ledger</span>
          </button>

          <button
            onClick={() => setActiveSubTab('trial-balance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'trial-balance'
                ? 'bg-[#C6E7FF] text-slate-900 border border-[#9BD5FF]/40 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Trial Balance</span>
          </button>
        </div>

        {activeSubTab === 'entries' && (
          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, account..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#FBFBFB] rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#3095EB]"
            />
          </div>
        )}
      </div>

      {/* SUB-VIEW 1: JOURNAL ENTRIES LIST */}
      {activeSubTab === 'entries' && (
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
              <ListOrdered className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No journal entries found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Sales invoices, vendor bills, and payment settlements automatically post double-entry records here.
              </p>
            </div>
          ) : (
            filteredEntries.map((je) => {
              const entryTotalDebit = (je.lines || []).reduce((s, l) => s + Number(l.debit || 0), 0);
              const entryTotalCredit = (je.lines || []).reduce((s, l) => s + Number(l.credit || 0), 0);
              const isEntryBalanced = Math.abs(entryTotalDebit - entryTotalCredit) < 0.01;

              return (
                <div key={je.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="bg-[#FBFBFB] px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-slate-900 font-mono text-sm">{je.id}</span>
                      <span className="font-semibold text-slate-700">{je.reference}</span>
                      <span className="text-[10px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                        {je.journalType}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="text-slate-500">{je.date}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isEntryBalanced ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {isEntryBalanced ? 'Balanced' : 'Unbalanced'}
                      </span>
                    </div>
                  </div>

                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-5">Account Name</th>
                        <th className="py-2.5 px-5">Line Description</th>
                        <th className="py-2.5 px-5 text-right">Debit (₹)</th>
                        <th className="py-2.5 px-5 text-right">Credit (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(je.lines || []).map((line, idx) => (
                        <tr key={idx} className="hover:bg-[#D4F6FF]/10">
                          <td className="py-2.5 px-5 font-semibold text-slate-800">{line.account}</td>
                          <td className="py-2.5 px-5 text-slate-500">{line.description || je.reference}</td>
                          <td className="py-2.5 px-5 text-right font-mono font-bold text-slate-800">
                            {line.debit > 0 ? formatCurrency(line.debit) : '—'}
                          </td>
                          <td className="py-2.5 px-5 text-right font-mono font-bold text-slate-800">
                            {line.credit > 0 ? formatCurrency(line.credit) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-[#FBFBFB] border-t border-slate-200 font-bold text-xs">
                      <tr>
                        <td colSpan="2" className="py-2.5 px-5 text-right text-slate-500">Total:</td>
                        <td className="py-2.5 px-5 text-right font-mono text-slate-900">{formatCurrency(entryTotalDebit)}</td>
                        <td className="py-2.5 px-5 text-right font-mono text-slate-900">{formatCurrency(entryTotalCredit)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SUB-VIEW 2: ACCOUNT-WISE LEDGER */}
      {activeSubTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Individual Account General Ledger</h3>
              <p className="text-xs text-slate-500">Track debit, credit, and running balance for specific accounts</p>
            </div>

            <div className="sm:w-64">
              <select
                value={selectedAccountForLedger}
                onChange={(e) => setSelectedAccountForLedger(e.target.value)}
                className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#3095EB]"
              >
                {chartOfAccounts.map(a => (
                  <option key={a.id} value={a.name}>{a.name} ({a.type})</option>
                ))}
              </select>
            </div>
          </div>

          {ledgerItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-600">No journal postings for "{selectedAccountForLedger}" yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#FBFBFB] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Entry Ref</th>
                    <th className="py-3 px-4">Journal</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Debit (₹)</th>
                    <th className="py-3 px-4 text-right">Credit (₹)</th>
                    <th className="py-3 px-4 text-right">Running Balance (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#D4F6FF]/20">
                      <td className="py-3 px-4 text-slate-600">{item.date}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.jeId}</td>
                      <td className="py-3 px-4 text-slate-500">{item.journalType}</td>
                      <td className="py-3 px-4 text-slate-700">{item.description}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                        {item.debit > 0 ? formatCurrency(item.debit) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                        {item.credit > 0 ? formatCurrency(item.credit) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#145B9D]">
                        {formatCurrency(item.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 3: TRIAL BALANCE */}
      {activeSubTab === 'trial-balance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Trial Balance Verification</h3>
              <p className="text-xs text-slate-500">Summary of all debit and credit balances across active accounts</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              isLedgerGloballyBalanced ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {isLedgerGloballyBalanced ? 'System 100% Balanced' : 'Discrepancy Detected'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#FBFBFB] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Account Code</th>
                  <th className="py-3 px-4">Account Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Debit Total (₹)</th>
                  <th className="py-3 px-4 text-right">Credit Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trialBalanceReport?.rows && trialBalanceReport.rows.length > 0 ? (
                  trialBalanceReport.rows.map((row) => (
                    <tr key={row.id} className="hover:bg-[#D4F6FF]/20">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{String(row.id).startsWith('COA') ? row.id : `COA-100${row.id}`}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{row.account_name}</td>
                      <td className="py-3.5 px-4 text-slate-500 capitalize">{row.account_type}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {row.total_debit > 0 ? formatCurrency(row.total_debit) : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {row.total_credit > 0 ? formatCurrency(row.total_credit) : '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  chartOfAccounts.map((acc) => {
                    const accEntries = getAccountLedger(acc.name);
                    const totalDr = accEntries.reduce((s, e) => s + Number(e.debit || 0), 0);
                    const totalCr = accEntries.reduce((s, e) => s + Number(e.credit || 0), 0);

                    return (
                      <tr key={acc.id} className="hover:bg-[#D4F6FF]/20">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{acc.id}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{acc.name}</td>
                        <td className="py-3.5 px-4 text-slate-500">{acc.type}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          {totalDr > 0 ? formatCurrency(totalDr) : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          {totalCr > 0 ? formatCurrency(totalCr) : '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot className="bg-[#FBFBFB] border-t-2 border-slate-300 font-bold text-xs">
                <tr>
                  <td colSpan="3" className="py-3 px-4 text-right text-slate-700">Grand Total:</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-900 text-sm">
                    {formatCurrency(trialBalanceReport?.grandTotalDebit !== undefined ? trialBalanceReport.grandTotalDebit : grandTotalDebits)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-900 text-sm">
                    {formatCurrency(trialBalanceReport?.grandTotalCredit !== undefined ? trialBalanceReport.grandTotalCredit : grandTotalCredits)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* MANUAL JOURNAL ENTRY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-[#C6E7FF] text-slate-900">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-display">New Adjusting Journal Entry</h3>
                  <p className="text-[11px] text-slate-500">Post balanced double-entry adjustments to the General Ledger</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {manualError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{manualError}</span>
              </div>
            )}

            <form onSubmit={handlePostManualEntry} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Entry Date *</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Entry Reference / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Month-End Depreciation Adjustment"
                    value={manualRef}
                    onChange={(e) => setManualRef(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Lines Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Journal Lines (Debits must equal Credits)</label>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-[11px] font-bold text-[#1B76C7] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Line</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {manualLines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-[#FBFBFB] p-2.5 rounded-xl border border-slate-200">
                      <div className="col-span-5">
                        <select
                          required
                          value={line.accountId}
                          onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-800 text-xs outline-none"
                        >
                          {chartOfAccounts.map(a => (
                            <option key={a.id} value={a.backendId || a.id}>{a.name} ({a.type})</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Debit (₹)"
                          value={line.debit}
                          onChange={(e) => handleLineChange(idx, 'debit', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-800 text-xs text-right font-mono outline-none"
                        />
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Credit (₹)"
                          value={line.credit}
                          onChange={(e) => handleLineChange(idx, 'credit', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-800 text-xs text-right font-mono outline-none"
                        />
                      </div>

                      <div className="col-span-1 text-right">
                        {manualLines.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Balance Summary Bar */}
              <div className={`p-3 rounded-xl border flex justify-between items-center text-xs ${
                isManualBalanced
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="space-x-4">
                  <span>Debits: <strong>{formatCurrency(manualTotalDebits)}</strong></span>
                  <span>Credits: <strong>{formatCurrency(manualTotalCredits)}</strong></span>
                </div>
                <span className="font-bold">
                  {isManualBalanced ? '✓ Balanced' : `Discrepancy: ${formatCurrency(Math.abs(manualTotalDebits - manualTotalCredits))}`}
                </span>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isManualBalanced || isSubmitting}
                  className="px-5 py-2 bg-[#C6E7FF] hover:bg-[#9BD5FF] active:bg-[#64B9FF] text-slate-900 rounded-xl font-bold border border-[#9BD5FF]/40 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Post to Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
