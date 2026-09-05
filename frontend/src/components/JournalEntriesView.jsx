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
  X,
  User,
  ArrowRight,
  Filter
} from 'lucide-react';

export default function JournalEntriesView() {
  const {
    journalEntries,
    chartOfAccounts,
    journals,
    contacts,
    createManualJournalEntry,
    getAccountLedger,
    trialBalanceReport,
    formatCurrency,
    userRole
  } = useAccounting();

  // Internal Sub-tabs
  const [filterJournal, setFilterJournal] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Manual Journal Entry Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualRef, setManualRef] = useState('');
  const [manualLines, setManualLines] = useState([
    { accountId: 1, partnerId: '', debit: 0, credit: 0, description: '' },
    { accountId: 2, partnerId: '', debit: 0, credit: 0, description: '' }
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
    } else if (field === 'partnerId') {
      updated[index].partnerId = value ? Number(value) : '';
    } else if (field === 'description') {
      updated[index].description = value;
    } else {
      updated[index][field] = Number(value || 0);
    }
    setManualLines(updated);
  };

  const handleAddLine = () => {
    const defaultAccId = chartOfAccounts[0]?.backendId || 1;
    setManualLines([...manualLines, { accountId: defaultAccId, partnerId: '', debit: 0, credit: 0, description: '' }]);
  };

  const handleRemoveLine = (index) => {
    if (manualLines.length <= 2) return;
    setManualLines(manualLines.filter((_, i) => i !== index));
  };

  const manualTotalDebits = manualLines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const manualTotalCredits = manualLines.reduce((s, l) => s + Number(l.credit || 0), 0);
  const manualDifference = Math.abs(manualTotalDebits - manualTotalCredits);
  const isManualBalanced = manualDifference < 0.01 && manualTotalDebits > 0;

  const handlePostManualEntry = async (e) => {
    e.preventDefault();
    setManualError('');

    if (!isManualBalanced) {
      setManualError(`Difference: ${formatCurrency(manualDifference)} (Total Debit and Total Credit must be equal!)`);
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
        { accountId: 1, partnerId: '', debit: 0, credit: 0, description: '' },
        { accountId: 2, partnerId: '', debit: 0, credit: 0, description: '' }
      ]);
    } catch (err) {
      setManualError(err.message || 'Failed to post manual journal entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#E3E7EA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#EEF4F8] border border-[#D8E1E8] text-[#0B2A4A] flex items-center justify-center shadow-xs shrink-0">
            <ListOrdered className="w-5 h-5 text-[#0B2A4A]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-base text-[#17212B] font-display">Journal Entries & General Ledger</h2>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center space-x-1 border ${
                isLedgerGloballyBalanced
                  ? 'bg-[#EAF7F0] text-[#18794E] border-[#A3E6C0]'
                  : 'bg-[#FDECEC] text-[#B42318] border-[#F8B4B4]'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isLedgerGloballyBalanced ? 'Double-Entry Balanced' : 'Ledger Unbalanced'}</span>
              </span>
            </div>
            <p className="text-xs text-[#667482] mt-0.5">
              Total Debits: <strong className="text-[#0B2A4A] font-mono">{formatCurrency(grandTotalDebits)}</strong> • Total Credits: <strong className="text-[#0B2A4A] font-mono">{formatCurrency(grandTotalCredits)}</strong> • {journalEntries.length} Recorded Entries
            </p>
          </div>
        </div>

        {userRole !== 'Contact' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 bg-[#0B2A4A] hover:bg-[#163B63] active:bg-[#0B2A4A] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Journal Entry</span>
          </button>
        )}
      </div>

      {/* JOURNAL ENTRIES REGISTER */}
      <div className="bg-white rounded-2xl border border-[#E3E7EA] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E3E7EA] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A96A3]" />
            <input
              type="text"
              placeholder="Search entries, reference, or account..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-[#E3E7EA] text-xs text-[#17212B] placeholder:text-[#8A96A3] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] transition-all"
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs font-semibold text-[#667482]">Filter Journal:</span>
            <select
              value={filterJournal}
              onChange={(e) => setFilterJournal(e.target.value)}
              className="px-3 py-1.5 bg-white rounded-xl border border-[#E3E7EA] text-xs font-semibold text-[#17212B] outline-none focus:border-[#0B2A4A]"
            >
              <option value="All">All Journals</option>
              {journals.map(j => (
                <option key={j.id} value={j.name}>{j.name}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-[#667482] space-y-3">
            <ListOrdered className="w-10 h-10 text-[#8A96A3] mx-auto" />
            <p className="text-sm font-semibold text-[#17212B]">No journal entries found</p>
            <p className="text-xs text-[#8A96A3] max-w-sm mx-auto">
              Generate invoices, bills, payments, or manual entries to record balanced accounting entries.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E3E7EA]/60">
            {filteredEntries.map((entry) => {
              const totalDebit = (entry.lines || []).reduce((s, l) => s + Number(l.debit || 0), 0);
              const totalCredit = (entry.lines || []).reduce((s, l) => s + Number(l.credit || 0), 0);
              const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

              return (
                <div key={entry.id} className="p-5 hover:bg-[#FAFAF8] transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-[#0B2A4A] text-sm">{entry.id}</span>
                      <span className="text-xs text-[#667482]">{entry.date}</span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EEF4F8] text-[#0B2A4A] border border-[#D8E1E8]">
                        {entry.journalType}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-[#667482] font-semibold truncate max-w-xs">{entry.reference}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isBalanced ? 'bg-[#EAF7F0] text-[#18794E] border-[#A3E6C0]' : 'bg-[#FDECEC] text-[#B42318] border-[#F8B4B4]'
                      }`}>
                        {isBalanced ? 'Balanced' : 'Unbalanced'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#FAFAF8] rounded-xl border border-[#E3E7EA] overflow-hidden">
                    <table className="w-full text-left text-xs text-[#17212B]">
                      <thead className="bg-[#EEF4F8] text-[#667482] font-semibold border-b border-[#E3E7EA] text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3">Account</th>
                          <th className="py-2.5 px-3">Partner / Contact</th>
                          <th className="py-2.5 px-3">Description</th>
                          <th className="py-2.5 px-3 text-right">Debit (₹)</th>
                          <th className="py-2.5 px-3 text-right">Credit (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E3E7EA]/60">
                        {(entry.lines || []).map((line, idx) => (
                          <tr key={idx} className="hover:bg-white transition-colors">
                            <td className="py-2 px-3 font-semibold text-[#17212B]">{line.account}</td>
                            <td className="py-2 px-3 text-[#667482]">{line.partnerName || '—'}</td>
                            <td className="py-2 px-3 text-[#8A96A3]">{line.description || '—'}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-[#17212B]">
                              {line.debit > 0 ? formatCurrency(line.debit) : '—'}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-[#17212B]">
                              {line.credit > 0 ? formatCurrency(line.credit) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-[#EEF4F8]/70 font-bold border-t border-[#E3E7EA] text-[11px]">
                        <tr>
                          <td colSpan="3" className="py-2 px-3 text-right text-[#667482]">Total:</td>
                          <td className="py-2 px-3 text-right font-mono text-[#0B2A4A]">{formatCurrency(totalDebit)}</td>
                          <td className="py-2 px-3 text-right font-mono text-[#0B2A4A]">{formatCurrency(totalCredit)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MANUAL JOURNAL ENTRY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#0B2A4A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-xl border border-[#E3E7EA] max-h-[90vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#E3E7EA] pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-[#EEF4F8] text-[#0B2A4A] border border-[#D8E1E8]">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0B2A4A] font-display">New Adjusting Journal Entry</h3>
                  <p className="text-[11px] text-[#667482]">Post balanced double-entry adjustments to the General Ledger</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[#8A96A3] hover:text-[#17212B] p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Red Alert Banner if unbalanced or error */}
            {!isManualBalanced && manualTotalDebits > 0 && (
              <div className="p-3 bg-[#FDECEC] border border-[#F8B4B4] rounded-xl text-xs text-[#B42318] flex items-center justify-between font-semibold">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#B42318]" />
                  <span>Difference: {formatCurrency(manualDifference)} (Total Debit and Total Credit must be equal!)</span>
                </div>
              </div>
            )}

            {manualError && (
              <div className="p-3 bg-[#FDECEC] border border-[#F8B4B4] rounded-xl text-xs text-[#B42318] flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#B42318]" />
                <span>{manualError}</span>
              </div>
            )}

            <form onSubmit={handlePostManualEntry} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Entry Date *</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-[#E3E7EA] text-[#17212B] outline-none focus:border-[#0B2A4A]"
                  />
                </div>
                <div>
                  <label className="block text-[#17212B] font-semibold mb-1">Entry Reference / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Month-End Depreciation Adjustment"
                    value={manualRef}
                    onChange={(e) => setManualRef(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-[#E3E7EA] text-[#17212B] outline-none focus:border-[#0B2A4A]"
                  />
                </div>
              </div>

              {/* Lines Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#17212B]">Journal Lines (Debits must equal Credits)</label>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-[11px] font-bold text-[#0B2A4A] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Line</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {manualLines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-[#FAFAF8] p-2.5 rounded-xl border border-[#E3E7EA]">
                      {/* Account Selector (4 cols) */}
                      <div className="col-span-4">
                        <label className="text-[10px] text-[#8A96A3] block mb-0.5">Account *</label>
                        <select
                          required
                          value={line.accountId}
                          onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-[#E3E7EA] text-[#17212B] text-xs outline-none focus:border-[#0B2A4A]"
                        >
                          {chartOfAccounts.map(a => (
                            <option key={a.id} value={a.backendId || a.id}>{a.name} ({a.type})</option>
                          ))}
                        </select>
                      </div>

                      {/* Partner Selector (3 cols) */}
                      <div className="col-span-3">
                        <label className="text-[10px] text-[#8A96A3] block mb-0.5">Partner (Optional)</label>
                        <select
                          value={line.partnerId}
                          onChange={(e) => handleLineChange(idx, 'partnerId', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white rounded-lg border border-[#E3E7EA] text-[#17212B] text-xs outline-none focus:border-[#0B2A4A]"
                        >
                          <option value="">None / Company</option>
                          {contacts.map(c => (
                            <option key={c.id} value={c.backendId || c.id}>{c.name} ({c.type})</option>
                          ))}
                        </select>
                      </div>

                      {/* Debit (2 cols) */}
                      <div className="col-span-2">
                        <label className="text-[10px] text-[#8A96A3] block mb-0.5">Debit (₹)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          value={line.debit}
                          onChange={(e) => handleLineChange(idx, 'debit', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white rounded-lg border border-[#E3E7EA] text-[#17212B] text-xs text-right font-mono outline-none focus:border-[#0B2A4A]"
                        />
                      </div>

                      {/* Credit (2 cols) */}
                      <div className="col-span-2">
                        <label className="text-[10px] text-[#8A96A3] block mb-0.5">Credit (₹)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          value={line.credit}
                          onChange={(e) => handleLineChange(idx, 'credit', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white rounded-lg border border-[#E3E7EA] text-[#17212B] text-xs text-right font-mono outline-none focus:border-[#0B2A4A]"
                        />
                      </div>

                      {/* Remove Line (1 col) */}
                      <div className="col-span-1 text-right pt-3">
                        {manualLines.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(idx)}
                            className="p-1 text-[#8A96A3] hover:text-[#B42318] transition-colors cursor-pointer"
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
                  ? 'bg-[#EAF7F0] border-[#A3E6C0] text-[#18794E]'
                  : 'bg-[#FDECEC] border-[#F8B4B4] text-[#B42318]'
              }`}>
                <div className="space-x-4">
                  <span>Debits: <strong>{formatCurrency(manualTotalDebits)}</strong></span>
                  <span>Credits: <strong>{formatCurrency(manualTotalCredits)}</strong></span>
                </div>
                <span className="font-bold">
                  {isManualBalanced ? '✓ Balanced' : `Discrepancy: ${formatCurrency(manualDifference)}`}
                </span>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-[#EEF4F8] text-[#0B2A4A] rounded-xl font-semibold border border-[#D8E1E8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isManualBalanced || isSubmitting}
                  className="px-5 py-2 bg-[#0B2A4A] hover:bg-[#163B63] text-white rounded-xl font-bold cursor-pointer shadow-xs disabled:opacity-50"
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
