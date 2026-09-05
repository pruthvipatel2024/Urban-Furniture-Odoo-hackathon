import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  PieChart,
  Plus,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  X,
  AlertCircle
} from 'lucide-react';

export default function BudgetsView() {
  const {
    budgets,
    budgetReportData,
    addBudget,
    formatCurrency,
    userRole
  } = useAccounting();

  const [showCreateBudgetModal, setShowCreateBudgetModal] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    name: '',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-30',
    responsiblePerson: 'Finance Department',
    plannedAmount: ''
  });
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPlannedBudget = budgetReportData.reduce((s, b) => s + Number(b.plannedAmount || 0), 0);
  const totalActualSpent = budgetReportData.reduce((s, b) => s + Number(b.actualSpent || 0), 0);
  const totalVariance = totalPlannedBudget - totalActualSpent;

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!budgetForm.name.trim() || !budgetForm.plannedAmount) {
      setModalError('Please enter budget name and planned appropriation.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addBudget(budgetForm);
      setBudgetForm({
        name: '',
        periodStart: '2026-09-01',
        periodEnd: '2026-09-30',
        responsiblePerson: 'Finance Department',
        plannedAmount: ''
      });
      setShowCreateBudgetModal(false);
    } catch (err) {
      setModalError(err.message || 'Failed to create budget.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 uppercase font-semibold">Total Planned Budget</span>
            <h3 className="text-xl font-bold text-slate-900 mt-1 font-mono">{formatCurrency(totalPlannedBudget)}</h3>
            <span className="text-[11px] text-slate-400">Allocated across {budgets.length} Cost Centers</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#D4F6FF] text-[#145B9D] flex items-center justify-center border border-[#ACEEFF]">
            <PieChart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 uppercase font-semibold">Actual Expenditure</span>
            <h3 className="text-xl font-bold text-amber-700 mt-1 font-mono">{formatCurrency(totalActualSpent)}</h3>
            <span className="text-[11px] text-amber-600 font-medium">From General Ledger Postings</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 uppercase font-semibold">Remaining Variance</span>
            <h3 className={`text-xl font-bold mt-1 font-mono ${totalVariance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatCurrency(totalVariance)}
            </h3>
            <span className="text-[11px] text-slate-500">Unutilized Cushion</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Header & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-[#1B76C7]" />
          <div>
            <h2 className="font-bold text-sm text-slate-900 font-display">Department Budgets & Variance Analysis</h2>
            <p className="text-xs text-slate-500">Track appropriation thresholds across operational cost centers</p>
          </div>
        </div>

        {userRole !== 'Contact' && (
          <button
            onClick={() => setShowCreateBudgetModal(true)}
            className="flex items-center space-x-1.5 bg-[#C6E7FF] hover:bg-[#9BD5FF] active:bg-[#64B9FF] text-slate-900 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs border border-[#9BD5FF]/40 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Budget</span>
          </button>
        )}
      </div>

      {/* Budgets Grid */}
      {budgetReportData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <PieChart className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No departmental budgets registered</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Set up departmental expenditure limits to monitor budget variance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetReportData.map((b) => (
            <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-[#C6E7FF] transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{b.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Responsible: {b.responsiblePerson}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  b.isOverBudget
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {b.isOverBudget ? 'Over Budget' : 'On Track'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Spent: <strong className="font-mono text-slate-900">{formatCurrency(b.actualSpent)}</strong></span>
                  <span>Limit: <strong className="font-mono text-slate-900">{formatCurrency(b.plannedAmount)}</strong></span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      b.isOverBudget ? 'bg-rose-500' : 'bg-[#1B76C7]'
                    }`}
                    style={{ width: `${Math.min(100, b.usagePercent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Usage: {b.usagePercent}%</span>
                  <span>Variance: <strong className={b.variance >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{formatCurrency(b.variance)}</strong></span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                Period: {b.periodStart} to {b.periodEnd}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE BUDGET MODAL */}
      {showCreateBudgetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 font-display">New Department Budget</h3>
              <button onClick={() => setShowCreateBudgetModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBudget} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Budget / Cost Center Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Factory Machinery & Tooling"
                  value={budgetForm.name}
                  onChange={(e) => setBudgetForm({ ...budgetForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-[#3095EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Period Start</label>
                  <input
                    type="date"
                    required
                    value={budgetForm.periodStart}
                    onChange={(e) => setBudgetForm({ ...budgetForm, periodStart: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Period End</label>
                  <input
                    type="date"
                    required
                    value={budgetForm.periodEnd}
                    onChange={(e) => setBudgetForm({ ...budgetForm, periodEnd: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Responsible Person / Head</label>
                <input
                  type="text"
                  placeholder="e.g. Operations Manager"
                  value={budgetForm.responsiblePerson}
                  onChange={(e) => setBudgetForm({ ...budgetForm, responsiblePerson: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Planned Budget Amount (₹) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="e.g. 150000"
                  value={budgetForm.plannedAmount}
                  onChange={(e) => setBudgetForm({ ...budgetForm, plannedAmount: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 font-mono font-bold outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateBudgetModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#C6E7FF] hover:bg-[#9BD5FF] text-slate-900 rounded-xl font-bold border border-[#9BD5FF]/40 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
