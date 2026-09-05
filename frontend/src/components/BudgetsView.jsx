import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  PieChart,
  Plus,
  Calendar,
  User,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  X,
  Layers
} from 'lucide-react';

export default function BudgetsView() {
  const {
    budgets,
    analyticAccounts,
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
    responsiblePerson: '',
    plannedAmount: '',
    analyticAccountId: analyticAccounts[0]?.id || ''
  });

  const totalPlannedBudget = budgetReportData.reduce((s, b) => s + Number(b.plannedAmount || 0), 0);
  const totalActualSpent = budgetReportData.reduce((s, b) => s + Number(b.actualSpent || 0), 0);
  const totalVariance = totalPlannedBudget - totalActualSpent;

  const handleCreateBudget = (e) => {
    e.preventDefault();
    if (!budgetForm.name || !budgetForm.plannedAmount || !budgetForm.analyticAccountId) return;

    addBudget(budgetForm);
    setBudgetForm({
      name: '',
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
      responsiblePerson: '',
      plannedAmount: '',
      analyticAccountId: analyticAccounts[0]?.id || ''
    });
    setShowCreateBudgetModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Total Planned Budget</span>
            <h3 className="text-2xl font-bold text-slate-100 mt-1 font-mono">{formatCurrency(totalPlannedBudget)}</h3>
            <span className="text-[11px] text-slate-400">Allocated across {budgets.length} Cost Centers</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
            <PieChart className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Total Actual Expenditure</span>
            <h3 className="text-2xl font-bold text-amber-400 mt-1 font-mono">{formatCurrency(totalActualSpent)}</h3>
            <span className="text-[11px] text-amber-500/80 font-medium">Derived from Live Ledger Bills</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Remaining Budget Variance</span>
            <h3 className={`text-2xl font-bold mt-1 font-mono ${totalVariance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(totalVariance)}
            </h3>
            <span className="text-[11px] text-slate-400">Unutilized Budget Cushion</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <h2 className="font-bold text-base text-slate-100">Budget Management & Cost Center Tracking</h2>
        </div>

        {userRole === 'Admin' && (
          <button
            onClick={() => setShowCreateBudgetModal(true)}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Department Budget</span>
          </button>
        )}
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgetReportData.map((b) => {
          const isOver = b.actualSpent > b.plannedAmount;
          const isNear = b.usagePercent >= 80 && !isOver;

          return (
            <div key={b.id} className="glass-panel p-5 rounded-2xl space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {b.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isOver
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : isNear
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {isOver ? 'Over Budget' : `${b.usagePercent}% Utilized`}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-100 mt-2.5">{b.name}</h4>
                <p className="text-xs text-indigo-300 mt-0.5 flex items-center space-x-1">
                  <Layers className="w-3 h-3" />
                  <span>{b.analyticAccountName}</span>
                </p>

                <div className="mt-3 space-y-1 text-xs text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>Lead: <strong className="text-slate-200">{b.responsiblePerson}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[11px]">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>Period: {b.periodStart} to {b.periodEnd}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar & Numerical Metrics */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Budget Progress</span>
                    <span className="font-mono font-bold text-slate-200">{b.usagePercent}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isOver ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, b.usagePercent)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-medium">Planned</span>
                    <p className="font-bold text-slate-200 font-mono">{formatCurrency(b.plannedAmount)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-medium">Actual</span>
                    <p className="font-bold text-amber-400 font-mono">{formatCurrency(b.actualSpent)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-medium">Remaining</span>
                    <p className={`font-bold font-mono ${b.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(b.variance)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* MODAL: CREATE NEW BUDGET */}
      {/* ========================================================= */}
      {showCreateBudgetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100">Create New Department Budget</h3>
              <button onClick={() => setShowCreateBudgetModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Budget Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Modern Showroom Expansion"
                  value={budgetForm.name}
                  onChange={(e) => setBudgetForm({ ...budgetForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Analytic Cost Center *</label>
                  <select
                    required
                    value={budgetForm.analyticAccountId}
                    onChange={(e) => setBudgetForm({ ...budgetForm, analyticAccountId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 outline-none"
                  >
                    {analyticAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Planned Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="100000"
                    value={budgetForm.plannedAmount}
                    onChange={(e) => setBudgetForm({ ...budgetForm, plannedAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-emerald-400 font-mono font-bold text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Responsible Lead / Manager</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma (Operations Head)"
                  value={budgetForm.responsiblePerson}
                  onChange={(e) => setBudgetForm({ ...budgetForm, responsiblePerson: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Period Start</label>
                  <input
                    type="date"
                    value={budgetForm.periodStart}
                    onChange={(e) => setBudgetForm({ ...budgetForm, periodStart: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Period End</label>
                  <input
                    type="date"
                    value={budgetForm.periodEnd}
                    onChange={(e) => setBudgetForm({ ...budgetForm, periodEnd: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateBudgetModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-md"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
