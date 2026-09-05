import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  PieChart as PieChartIcon,
  Plus,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  X,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Layers,
  FileText,
  User,
  DollarSign,
  ArrowUpRight,
  ExternalLink,
  RotateCcw,
  LayoutList,
  LayoutGrid,
  Ban,
  Search
} from 'lucide-react';

export default function BudgetsView() {
  const {
    budgets,
    analyticAccounts,
    contacts,
    addBudget,
    confirmBudget,
    cancelBudget,
    reviseBudget,
    getBudgetTransactions,
    formatCurrency,
    userRole
  } = useAccounting();

  // Navigation & View Mode: 'list' | 'kanban' | 'chart' | 'form'
  const [viewMode, setViewMode] = useState('list');
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form State for Create/Edit
  const [isNewBudget, setIsNewBudget] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    periodStart: new Date().toISOString().split('T')[0],
    periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    responsiblePerson: contacts[0]?.name || 'Admin',
    plannedAmount: '',
    analyticAccountId: analyticAccounts[0]?.id || '',
    type: 'expense'
  });

  // Revision Modal State
  const [showReviseModal, setShowReviseModal] = useState(false);
  const [revisedAmount, setRevisedAmount] = useState('');

  // Drill-down Modal State (Contributing Invoices/Bills)
  const [showDrilldownModal, setShowDrilldownModal] = useState(false);
  const [drilldownData, setDrilldownData] = useState(null);
  const [loadingDrilldown, setLoadingDrilldown] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync selected analytic account type
  const handleAnalyticChange = (analyticId) => {
    const analytic = analyticAccounts.find(a => String(a.id) === String(analyticId) || String(a.backendId) === String(analyticId));
    setFormState(prev => ({
      ...prev,
      analyticAccountId: analyticId,
      type: analytic ? analytic.type.toLowerCase() : prev.type
    }));
  };

  // Open Blank Form (New)
  const handleOpenNewForm = () => {
    setIsNewBudget(true);
    setSelectedBudget(null);
    setFormState({
      name: '',
      periodStart: new Date().toISOString().split('T')[0],
      periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      responsiblePerson: contacts[0]?.name || 'Admin',
      plannedAmount: '',
      analyticAccountId: analyticAccounts[0]?.id || (analyticAccounts[0]?.backendId ? String(analyticAccounts[0].backendId) : ''),
      type: analyticAccounts[0]?.type ? analyticAccounts[0].type.toLowerCase() : 'expense'
    });
    setErrorMessage('');
    setViewMode('form');
  };

  // Open Form for Existing Record
  const handleOpenExistingBudget = (budget) => {
    setSelectedBudget(budget);
    setIsNewBudget(false);
    setFormState({
      name: budget.name,
      periodStart: budget.periodStart || budget.period_start,
      periodEnd: budget.periodEnd || budget.period_end,
      responsiblePerson: budget.responsiblePerson || budget.responsible_person || 'Admin',
      plannedAmount: String(budget.committedAmount || budget.plannedAmount || 0),
      analyticAccountId: String(budget.analyticAccountId || budget.analytic_account_id || ''),
      type: budget.type || 'expense'
    });
    setErrorMessage('');
    setViewMode('form');
  };

  // Submit New Budget (creates in draft state)
  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!formState.name.trim() || !formState.plannedAmount) {
      setErrorMessage('Please enter budget name and committed amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await addBudget({
        name: formState.name.trim(),
        periodStart: formState.periodStart,
        periodEnd: formState.periodEnd,
        responsiblePerson: formState.responsiblePerson,
        plannedAmount: Number(formState.plannedAmount),
        analyticAccountId: formState.analyticAccountId,
        status: 'draft'
      });
      setIsNewBudget(false);
      setSelectedBudget(created);
      setViewMode('list');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save budget.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Budget (Draft -> Confirmed)
  const handleConfirmBudget = async () => {
    if (!selectedBudget) return;
    setIsSubmitting(true);
    try {
      const updated = await confirmBudget(selectedBudget.backendId || selectedBudget.id);
      setSelectedBudget(updated);
      setViewMode('list');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to confirm budget.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel Budget
  const handleCancelBudget = async () => {
    if (!selectedBudget) return;
    setIsSubmitting(true);
    try {
      const updated = await cancelBudget(selectedBudget.backendId || selectedBudget.id);
      setSelectedBudget(updated);
      setViewMode('list');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to cancel budget.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Revise Budget (Confirmed -> Original becomes Revised, New Budget created)
  const handleReviseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBudget) return;
    setIsSubmitting(true);
    try {
      const newBudget = await reviseBudget(selectedBudget.backendId || selectedBudget.id, {
        newPlannedAmount: Number(revisedAmount)
      });
      setShowReviseModal(false);
      setRevisedAmount('');
      setSelectedBudget(newBudget);
      setViewMode('list');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to revise budget.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Achieved Amount Drill-down Popup
  const handleOpenDrilldown = async (budgetId) => {
    setLoadingDrilldown(true);
    setShowDrilldownModal(true);
    try {
      const data = await getBudgetTransactions(budgetId);
      setDrilldownData(data);
    } catch (err) {
      setDrilldownData(null);
    } finally {
      setLoadingDrilldown(false);
    }
  };

  // Metrics summary
  const totalCommitted = budgets.reduce((sum, b) => sum + Number(b.committedAmount || b.plannedAmount || 0), 0);
  const totalAchieved = budgets.reduce((sum, b) => sum + Number(b.achievedAmount || 0), 0);
  const totalRemaining = Math.max(0, totalCommitted - totalAchieved);

  // Status Counts
  const draftCount = budgets.filter(b => (b.normalizedStatus || (b.status || '').toLowerCase()) === 'draft').length;
  const confirmedCount = budgets.filter(b => (b.normalizedStatus || (b.status || '').toLowerCase()) === 'confirmed').length;
  const revisedCount = budgets.filter(b => (b.normalizedStatus || (b.status || '').toLowerCase()) === 'revised').length;
  const cancelledCount = budgets.filter(b => (b.normalizedStatus || (b.status || '').toLowerCase()) === 'cancelled').length;

  // Filtered Budgets
  const filteredBudgets = budgets.filter(b => {
    const normStatus = b.normalizedStatus || (b.status || '').toLowerCase();
    const matchesStatus = statusFilter === 'All' || normStatus === statusFilter.toLowerCase();
    const matchesSearch = (b.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.analyticAccountName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.responsiblePerson || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.status || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E3E7EA] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#667482] uppercase font-semibold">Total Committed Budget</span>
            <h3 className="text-xl font-bold text-[#0B2A4A] mt-1 font-mono">{formatCurrency(totalCommitted)}</h3>
            <span className="text-[11px] text-[#8A96A3]">Across {budgets.length} Budget Center(s)</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EEF4F8] text-[#0B2A4A] flex items-center justify-center border border-[#D8E1E8]">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E7EA] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#667482] uppercase font-semibold">Total Achieved / Incurred</span>
            <h3 className="text-xl font-bold text-[#C98232] mt-1 font-mono">{formatCurrency(totalAchieved)}</h3>
            <span className="text-[11px] text-[#C98232] font-medium">From Live Invoices & Bills</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F8F0E6] text-[#C98232] flex items-center justify-center border border-[#E5B875]/40">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E7EA] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#667482] uppercase font-semibold">Amount To Achieve / Cushion</span>
            <h3 className="text-xl font-bold mt-1 font-mono text-[#18794E]">{formatCurrency(totalRemaining)}</h3>
            <span className="text-[11px] text-[#667482]">Unutilized Appropriation</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EAF7F0] text-[#18794E] flex items-center justify-center border border-[#A3E6C0]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. HEADER BAR & VIEW SWITCHER */}
      <div className="bg-white p-5 rounded-2xl border border-[#E3E7EA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#EEF4F8] border border-[#D8E1E8] text-[#0B2A4A] flex items-center justify-center shadow-xs shrink-0">
            <PieChartIcon className="w-5 h-5 text-[#0B2A4A]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-base text-[#17212B] font-display">
                {viewMode === 'form' ? (isNewBudget ? 'New Analytical Budget' : `Budget: ${selectedBudget?.name || ''}`) : 'Analytical Budgets'}
              </h2>
              {viewMode !== 'form' && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#EEF4F8] text-[#0B2A4A] font-bold border border-[#D8E1E8]">
                  {budgets.length} Budgets
                </span>
              )}
            </div>
            <p className="text-xs text-[#667482] mt-0.5">
              {viewMode === 'form' ? 'Configure appropriation limits, responsible partner, and analytic account' : 'Track committed limit vs dynamic achieved amounts across invoices and bills'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {viewMode !== 'form' && (
            <div className="flex items-center bg-[#FAFAF8] p-1 rounded-xl border border-[#E3E7EA]">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-[#0B2A4A] shadow-xs font-bold border border-[#E3E7EA]' : 'text-[#667482] hover:text-[#0B2A4A]'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'kanban' ? 'bg-white text-[#0B2A4A] shadow-xs font-bold border border-[#E3E7EA]' : 'text-[#667482] hover:text-[#0B2A4A]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Card</span>
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'chart' ? 'bg-white text-[#0B2A4A] shadow-xs font-bold border border-[#E3E7EA]' : 'text-[#667482] hover:text-[#0B2A4A]'
                }`}
              >
                <PieChartIcon className="w-3.5 h-3.5" />
                <span>Breakdown</span>
              </button>
            </div>
          )}

          {viewMode !== 'form' && userRole !== 'Contact' && (
            <button
              onClick={handleOpenNewForm}
              className="flex items-center space-x-1.5 bg-[#0B2A4A] hover:bg-[#163B63] active:bg-[#0B2A4A] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Budget</span>
            </button>
          )}

          {viewMode === 'form' && (
            <button
              onClick={() => { setViewMode('list'); setErrorMessage(''); }}
              className="flex items-center space-x-1.5 bg-[#EEF4F8] hover:bg-[#E2ECF2] text-[#0B2A4A] text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer border border-[#D8E1E8]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
        </div>
      </div>

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="p-3 bg-[#FDECEC] border border-[#F8B4B4] rounded-xl text-xs text-[#B42318] flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-[#B42318] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3. VIEW: FORM VIEW */}
      {viewMode === 'form' && (
        <div className="bg-white rounded-2xl border border-[#E3E7EA] shadow-xs overflow-hidden">
          {/* Form Header Action Bar & Status */}
          <div className="p-4 border-b border-[#E3E7EA] bg-[#FAFAF8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              {isNewBudget ? (
                <button
                  type="button"
                  onClick={handleSaveBudget}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-[#0B2A4A] hover:bg-[#163B63] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Save Draft
                </button>
              ) : (
                <>
                  {/* State Actions */}
                  {selectedBudget?.rawStatus === 'draft' && (
                    <>
                      <button
                        type="button"
                        onClick={handleConfirmBudget}
                        disabled={isSubmitting}
                        className="px-4 py-1.5 bg-[#0B2A4A] hover:bg-[#163B63] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelBudget}
                        disabled={isSubmitting}
                        className="px-3.5 py-1.5 bg-[#EEF4F8] hover:bg-[#E2ECF2] text-[#0B2A4A] font-semibold text-xs rounded-xl cursor-pointer border border-[#D8E1E8]"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {selectedBudget?.rawStatus === 'confirmed' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setRevisedAmount(String(selectedBudget.committedAmount || selectedBudget.plannedAmount || ''));
                          setShowReviseModal(true);
                        }}
                        className="px-4 py-1.5 bg-[#F8F0E6] hover:bg-[#F3E5D4] text-[#C98232] font-bold text-xs rounded-xl shadow-xs border border-[#E5B875]/60 cursor-pointer flex items-center space-x-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Revise</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelBudget}
                        disabled={isSubmitting}
                        className="px-3.5 py-1.5 bg-[#EEF4F8] hover:bg-[#E2ECF2] text-[#0B2A4A] font-semibold text-xs rounded-xl cursor-pointer border border-[#D8E1E8]"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Status Chevrons / Badge */}
            {!isNewBudget && selectedBudget && (
              <div className="flex items-center space-x-1 text-xs font-semibold">
                <span className={`px-3 py-1 rounded-l-lg border ${
                  selectedBudget.rawStatus === 'draft' ? 'bg-[#EEF4F8] text-[#0B2A4A] border-[#D8E1E8] font-bold' : 'bg-[#FAFAF8] text-[#8A96A3] border-[#E3E7EA]'
                }`}>
                  Draft
                </span>
                <span className={`px-3 py-1 border-t border-b ${
                  selectedBudget.rawStatus === 'confirmed' ? 'bg-[#EAF7F0] text-[#18794E] font-bold border-[#A3E6C0]' : 'bg-[#FAFAF8] text-[#8A96A3] border-[#E3E7EA]'
                }`}>
                  Confirmed
                </span>
                <span className={`px-3 py-1 border-t border-b ${
                  selectedBudget.rawStatus === 'revised' ? 'bg-[#F8F0E6] text-[#C98232] font-bold border-[#E5B875]/60' : 'bg-[#FAFAF8] text-[#8A96A3] border-[#E3E7EA]'
                }`}>
                  Revised
                </span>
                <span className={`px-3 py-1 rounded-r-lg border ${
                  selectedBudget.rawStatus === 'cancelled' ? 'bg-[#FDECEC] text-[#B42318] font-bold border-[#F8B4B4]' : 'bg-[#FAFAF8] text-[#8A96A3] border-[#E3E7EA]'
                }`}>
                  Cancelled
                </span>
              </div>
            )}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSaveBudget} className="p-6 space-y-6">
            {/* Revision Relationship Links if present */}
            {selectedBudget?.revisionOfId && (
              <div className="p-3 bg-[#F8F0E6] border border-[#E5B875]/50 rounded-xl flex items-center justify-between text-xs text-[#C98232]">
                <span className="font-semibold">This budget is a revision of an earlier budget.</span>
                <span className="font-mono font-bold">Revision of ID #{selectedBudget.revisionOfId}</span>
              </div>
            )}

            {selectedBudget?.revisedBudgetId && (
              <div className="p-3 bg-[#EEF4F8] border border-[#D8E1E8] rounded-xl flex items-center justify-between text-xs text-[#0B2A4A]">
                <span className="font-semibold">This budget was revised and superseded by active version.</span>
                <span className="font-mono font-bold">Active Revision: #{selectedBudget.revisedBudgetId}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block text-[#17212B] font-semibold mb-1">Budget Name * <span className="text-[#8A96A3] font-normal">(Alpha Numeric)</span></label>
                <input
                  type="text"
                  required
                  disabled={!isNewBudget && selectedBudget?.rawStatus !== 'draft'}
                  placeholder="e.g. Q1 FY26 Furniture Procurement Budget"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-[#E3E7EA] text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-[#17212B] font-semibold mb-1">Responsible Person *</label>
                <select
                  disabled={!isNewBudget && selectedBudget?.rawStatus !== 'draft'}
                  value={formState.responsiblePerson}
                  onChange={(e) => setFormState({ ...formState, responsiblePerson: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-[#E3E7EA] text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] transition-all"
                >
                  {contacts.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.type})</option>
                  ))}
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-[#17212B] font-semibold mb-1">Budget Period Start</label>
                <input
                  type="date"
                  required
                  disabled={!isNewBudget && selectedBudget?.rawStatus !== 'draft'}
                  value={formState.periodStart}
                  onChange={(e) => setFormState({ ...formState, periodStart: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-[#E3E7EA] text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] transition-all"
                />
              </div>

              <div>
                <label className="block text-[#17212B] font-semibold mb-1">Budget Period End</label>
                <input
                  type="date"
                  required
                  disabled={!isNewBudget && selectedBudget?.rawStatus !== 'draft'}
                  value={formState.periodEnd}
                  onChange={(e) => setFormState({ ...formState, periodEnd: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-[#E3E7EA] text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] transition-all"
                />
              </div>

              <div>
                <label className="block text-[#17212B] font-semibold mb-1">Analytic Account *</label>
                <select
                  disabled={!isNewBudget && selectedBudget?.rawStatus !== 'draft'}
                  value={formState.analyticAccountId}
                  onChange={(e) => handleAnalyticChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-[#E3E7EA] text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] font-medium transition-all"
                >
                  {analyticAccounts.map(a => (
                    <option key={a.id} value={a.id || a.backendId}>
                      {a.name} ({a.type ? a.type.toUpperCase() : 'EXPENSE'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#17212B] font-semibold mb-1">Type</label>
                <input
                  type="text"
                  readOnly
                  value={formState.type.toUpperCase()}
                  className="w-full px-3.5 py-2.5 bg-[#EEF4F8] rounded-xl border border-[#D8E1E8] text-[#0B2A4A] font-bold outline-none uppercase"
                />
              </div>
            </div>

            {/* Dynamic Financial Metrics Box */}
            <div className="pt-4 border-t border-[#E3E7EA]">
              <h4 className="text-xs font-bold text-[#17212B] uppercase tracking-wider mb-3 font-display">
                Budget Financial Performance & Calculations
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-[#FAFAF8] rounded-xl border border-[#E3E7EA]">
                  <span className="text-[11px] text-[#667482] font-semibold block mb-1">Committed Amount (Limit)</span>
                  {isNewBudget || selectedBudget?.rawStatus === 'draft' ? (
                    <input
                      type="number"
                      required
                      step="0.01"
                      placeholder="e.g. 200000"
                      value={formState.plannedAmount}
                      onChange={(e) => setFormState({ ...formState, plannedAmount: e.target.value })}
                      className="w-full font-mono font-bold text-[#0B2A4A] text-sm bg-white border border-[#E3E7EA] rounded-lg px-2 py-1 outline-none focus:border-[#0B2A4A]"
                    />
                  ) : (
                    <span className="text-sm font-bold font-mono text-[#0B2A4A]">
                      {formatCurrency(selectedBudget?.committedAmount || selectedBudget?.plannedAmount || 0)}
                    </span>
                  )}
                </div>

                <div className="p-3.5 bg-[#F8F0E6] rounded-xl border border-[#E5B875]/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-[#C98232] font-semibold">Achieved Amount</span>
                    {selectedBudget && (
                      <button
                        type="button"
                        onClick={() => handleOpenDrilldown(selectedBudget.backendId || selectedBudget.id)}
                        className="text-[10px] text-[#C98232] hover:underline font-bold flex items-center space-x-0.5 cursor-pointer"
                      >
                        <span>Drill-down</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <span className="text-sm font-bold font-mono text-[#17212B]">
                    {formatCurrency(selectedBudget?.achievedAmount || 0)}
                  </span>
                </div>

                <div className="p-3.5 bg-[#FAFAF8] rounded-xl border border-[#E3E7EA]">
                  <span className="text-[11px] text-[#667482] font-semibold block mb-1">Achieved %</span>
                  <span className="text-sm font-bold font-mono text-[#0B2A4A]">
                    {selectedBudget?.achievedPercentage || 0}%
                  </span>
                </div>

                <div className="p-3.5 bg-[#FAFAF8] rounded-xl border border-[#E3E7EA]">
                  <span className="text-[11px] text-[#667482] font-semibold block mb-1">Amount To Achieve</span>
                  <span className="text-sm font-bold font-mono text-[#18794E]">
                    {formatCurrency(selectedBudget?.amountToAchieve || (Number(formState.plannedAmount || 0)))}
                  </span>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 4. VIEW: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-[#E3E7EA] shadow-xs overflow-hidden">
          {/* Search & Status Filter Bar */}
          <div className="p-4 border-b border-[#E3E7EA] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A96A3]" />
              <input
                type="text"
                placeholder="Search budgets by name, analytic, responsible..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white text-xs text-[#17212B] border border-[#E3E7EA] rounded-xl outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] transition-all"
              />
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="flex items-center space-x-1 bg-[#FAFAF8] p-1 rounded-xl border border-[#E3E7EA] text-xs shrink-0 overflow-x-auto">
              {[
                { id: 'All', label: 'All', count: budgets.length },
                { id: 'Draft', label: 'Draft', count: draftCount },
                { id: 'Confirmed', label: 'Confirmed', count: confirmedCount },
                { id: 'Revised', label: 'Revised', count: revisedCount },
                { id: 'Cancelled', label: 'Cancelled', count: cancelledCount }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-white text-[#0B2A4A] border border-[#E3E7EA] shadow-xs font-bold'
                      : 'text-[#667482] hover:text-[#0B2A4A]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab.id ? 'bg-[#EEF4F8] text-[#0B2A4A] font-bold' : 'bg-[#E3E7EA]/60 text-[#667482]'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {filteredBudgets.length === 0 ? (
            <div className="p-12 text-center text-[#667482] space-y-3">
              <PieChartIcon className="w-10 h-10 text-[#8A96A3] mx-auto" />
              <p className="text-sm font-semibold text-[#17212B]">No analytical budgets match your search</p>
              <p className="text-xs text-[#8A96A3] max-w-sm mx-auto">
                Try a different keyword or click "New Budget" above to create one.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#EEF4F8] border-b border-[#E3E7EA] text-[#667482] font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Budget Name</th>
                    <th className="py-3.5 px-4">Analytic Account</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Period</th>
                    <th className="py-3.5 px-4 text-right">Committed</th>
                    <th className="py-3.5 px-4 text-right">Achieved</th>
                    <th className="py-3.5 px-4 text-right">Achieved %</th>
                    <th className="py-3.5 px-4 text-right">To Achieve</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E7EA]/60">
                  {filteredBudgets.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => handleOpenExistingBudget(b)}
                      className="hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#0B2A4A] flex items-center space-x-2">
                        <span>{b.name}</span>
                        {b.revisionOfId && (
                          <span className="text-[10px] bg-[#F8F0E6] text-[#C98232] border border-[#E5B875]/50 px-1.5 py-0.5 rounded-full font-mono">
                            Rev
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#17212B]">{b.analyticAccountName || 'General'}</td>
                      <td className="py-3.5 px-4 text-[#667482] font-semibold uppercase text-[10px]">
                        <span className={`px-2 py-0.5 rounded-full ${b.type === 'income' ? 'bg-[#EAF7F0] text-[#18794E] border border-[#A3E6C0]' : 'bg-[#F8F0E6] text-[#C98232] border border-[#E5B875]/40'}`}>
                          {b.type || 'expense'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#667482] font-mono text-[11px]">
                        {b.periodStart} to {b.periodEnd}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-[#0B2A4A]">
                        {formatCurrency(b.committedAmount || b.plannedAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-[#C98232]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDrilldown(b.backendId || b.id);
                          }}
                          className="hover:underline text-[#C98232] font-bold"
                        >
                          {formatCurrency(b.achievedAmount || 0)}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-[#17212B]">
                        {b.achievedPercentage || 0}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-[#18794E]">
                        {formatCurrency(b.amountToAchieve || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          b.rawStatus === 'confirmed' ? 'bg-[#EAF7F0] text-[#18794E] border-[#A3E6C0]' :
                          b.rawStatus === 'revised' ? 'bg-[#F8F0E6] text-[#C98232] border-[#E5B875]/50' :
                          b.rawStatus === 'cancelled' ? 'bg-[#FDECEC] text-[#B42318] border-[#F8B4B4]' :
                          'bg-[#EEF4F8] text-[#0B2A4A] border-[#D8E1E8]'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. VIEW: KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E3E7EA] shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A96A3]" />
              <input
                type="text"
                placeholder="Search budgets by name, analytic, responsible..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white text-xs text-[#17212B] border border-[#E3E7EA] rounded-xl outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBudgets.map((b) => (
              <div
                key={b.id}
                onClick={() => handleOpenExistingBudget(b)}
                className="bg-white p-5 rounded-2xl border border-[#E3E7EA] shadow-xs space-y-4 hover:border-[#0B2A4A]/40 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#17212B]">{b.name}</h4>
                    <p className="text-[11px] text-[#667482] mt-0.5">{b.analyticAccountName || 'General'} ({b.type})</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    b.rawStatus === 'confirmed' ? 'bg-[#EAF7F0] text-[#18794E] border-[#A3E6C0]' :
                    b.rawStatus === 'revised' ? 'bg-[#F8F0E6] text-[#C98232] border-[#E5B875]/50' :
                    b.rawStatus === 'cancelled' ? 'bg-[#FDECEC] text-[#B42318] border-[#F8B4B4]' :
                    'bg-[#EEF4F8] text-[#0B2A4A] border-[#D8E1E8]'
                  }`}>
                    {b.status}
                  </span>
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[#667482]">
                    <span>Achieved: <strong className="font-mono text-[#C98232]">{formatCurrency(b.achievedAmount || 0)}</strong></span>
                    <span>Limit: <strong className="font-mono text-[#0B2A4A]">{formatCurrency(b.committedAmount || b.plannedAmount)}</strong></span>
                  </div>
                  <div className="w-full h-2 bg-[#EEF4F8] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0B2A4A] transition-all duration-300"
                      style={{ width: `${Math.min(100, Number(b.achievedPercentage || 0))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#667482]">
                    <span>Achieved: {b.achievedPercentage || 0}%</span>
                    <span>To Achieve: <strong className="text-[#18794E]">{formatCurrency(b.amountToAchieve || 0)}</strong></span>
                  </div>
                </div>

                <div className="text-[11px] text-[#8A96A3] border-t border-[#E3E7EA] pt-2 flex items-center justify-between">
                  <span>{b.periodStart} to {b.periodEnd}</span>
                  <span className="font-medium text-[#17212B]">{b.responsiblePerson}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. VIEW: PIE CHART BREAKDOWN */}
      {viewMode === 'chart' && (
        <div className="bg-white rounded-2xl border border-[#E3E7EA] shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3E7EA] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#17212B] font-display">Budget Commitment vs Achieved Breakdown</h3>
              <p className="text-xs text-[#667482]">Proportional allocation of appropriations across cost centers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* SVG Pie Chart */}
            <div className="flex justify-center p-4">
              <svg width="220" height="220" viewBox="0 0 100 100" className="transform -rotate-90">
                {/* Background circle */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#EEF4F8" strokeWidth="16" />
                {/* Achieved segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#C98232"
                  strokeWidth="16"
                  strokeDasharray={`${totalCommitted > 0 ? (totalAchieved / totalCommitted) * 251.2 : 0} 251.2`}
                  strokeDashoffset="0"
                />
              </svg>
            </div>

            {/* Legend & Breakdown */}
            <div className="space-y-4">
              <div className="p-4 bg-[#FAFAF8] rounded-xl border border-[#E3E7EA] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-[#C98232]"></span>
                    <span className="font-semibold text-[#17212B]">Achieved Expenditure / Revenue</span>
                  </span>
                  <span className="font-mono font-bold text-[#0B2A4A]">{formatCurrency(totalAchieved)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-[#D8E1E8]"></span>
                    <span className="font-semibold text-[#17212B]">Remaining Cushion</span>
                  </span>
                  <span className="font-mono font-bold text-[#18794E]">{formatCurrency(totalRemaining)}</span>
                </div>
              </div>

              <div className="text-xs text-[#667482] space-y-1">
                <p><strong>Overall Achievement Rate:</strong> {totalCommitted > 0 ? ((totalAchieved / totalCommitted) * 100).toFixed(1) : 0}%</p>
                <p>Dynamic calculations derived from balanced MySQL ledger invoices and vendor bills.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. REVISION MODAL */}
      {showReviseModal && (
        <div className="fixed inset-0 z-50 bg-[#0B2A4A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E3E7EA] animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#E3E7EA] pb-3">
              <h3 className="font-bold text-sm text-[#0B2A4A] font-display">Revise Confirmed Budget</h3>
              <button onClick={() => setShowReviseModal(false)} className="text-[#8A96A3] hover:text-[#17212B] p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#F8F0E6] border border-[#E5B875]/60 rounded-xl text-xs text-[#C98232] space-y-1">
              <p>Revising: <strong>{selectedBudget?.name}</strong></p>
              <p className="text-[11px]">
                The original budget will move to <strong>Revised</strong> state. A new active budget with <strong>(Revised)</strong> name will be created.
              </p>
            </div>

            <form onSubmit={handleReviseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#17212B] font-semibold mb-1">New Committed Limit (₹) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="e.g. 350000"
                  value={revisedAmount}
                  onChange={(e) => setRevisedAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-[#E3E7EA] text-[#17212B] font-mono font-bold text-sm outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowReviseModal(false)}
                  className="px-4 py-2 bg-[#EEF4F8] text-[#0B2A4A] rounded-xl font-semibold border border-[#D8E1E8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#0B2A4A] hover:bg-[#163B63] text-white rounded-xl font-bold cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Revising...' : 'Create Revised Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. DRILL-DOWN POPUP MODAL (CONTRIBUTING INVOICES / BILLS) */}
      {showDrilldownModal && (
        <div className="fixed inset-0 z-50 bg-[#0B2A4A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-[#E3E7EA] animate-in fade-in max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E3E7EA] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#0B2A4A] font-display">Contributing Records Drill-Down</h3>
                <p className="text-xs text-[#667482]">
                  {drilldownData ? `${drilldownData.budget} (${drilldownData.analyticAccount}) — ${drilldownData.period}` : 'Loading...'}
                </p>
              </div>
              <button onClick={() => setShowDrilldownModal(false)} className="text-[#8A96A3] hover:text-[#17212B] p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {loadingDrilldown ? (
                <div className="p-8 text-center text-[#667482] text-xs">Loading contributing transactions...</div>
              ) : !drilldownData?.records || drilldownData.records.length === 0 ? (
                <div className="p-8 text-center text-[#667482] text-xs">
                  No invoices or vendor bills recorded with this Analytic Account during this budget period.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#EEF4F8] border-b border-[#E3E7EA] text-[#667482] font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Document #</th>
                      <th className="py-2.5 px-3">Partner</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3E7EA]/60">
                    {drilldownData.records.map((r, i) => (
                      <tr key={i} className="hover:bg-[#FAFAF8]">
                        <td className="py-2.5 px-3 font-mono text-[#667482]">{r.date}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#17212B]">{r.type}</td>
                        <td className="py-2.5 px-3 font-bold text-[#0B2A4A]">{r.number}</td>
                        <td className="py-2.5 px-3 text-[#17212B]">{r.partner}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#17212B]">{formatCurrency(r.amount)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            r.status === 'paid' ? 'bg-[#EAF7F0] text-[#18794E] border-[#A3E6C0]' : 'bg-[#FFF6DF] text-[#B7791F] border-[#FDE3A7]'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-3 border-t border-[#E3E7EA] flex items-center justify-between text-xs">
              <span className="font-semibold text-[#667482]">Total Calculated Achieved Amount:</span>
              <span className="font-bold font-mono text-[#0B2A4A] text-sm">{formatCurrency(drilldownData?.totalAchieved || 0)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
