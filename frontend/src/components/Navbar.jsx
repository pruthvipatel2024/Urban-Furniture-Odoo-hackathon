import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  Menu,
  Search,
  Bell,
  Plus,
  ChevronDown,
  UserCheck,
  Sparkles,
  ShieldCheck,
  CreditCard,
  ShoppingCart,
  TrendingUp,
  BookOpen,
  PieChart
} from 'lucide-react';

export default function Navbar({
  onOpenNewInvoice,
  onOpenNewBill,
  onOpenPaymentModal
}) {
  const {
    setSidebarOpen,
    userRole,
    setUserRole,
    searchQuery,
    setSearchQuery,
    setShowDemoTourModal,
    journalEntries,
    setActiveTab
  } = useAccounting();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const recentEntries = journalEntries.slice(0, 4);

  return (
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-[#1e3e62]/40 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-slate-400 hover:text-white hover:bg-navy-900 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand preview on mobile or header */}
        <div className="flex items-center space-x-2.5 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-white p-0.5 border border-teak-500/40">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain rounded" />
          </div>
          <span className="font-display font-bold text-white text-sm">Urban Furniture</span>
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden sm:block w-64 md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-teak-400/70" />
          <input
            type="text"
            placeholder="Search accounts, invoices, products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-[#080e1e]/90 hover:bg-[#080e1e] focus:bg-[#080e1e] text-xs border border-[#1e3e62]/60 focus:border-teak-500 rounded-xl outline-none transition-all placeholder:text-slate-500 text-slate-200 font-sans"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Demo Tour Button */}
        <button
          onClick={() => setShowDemoTourModal(true)}
          className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-teak-500/20 via-navy-800/40 to-teak-500/20 border border-teak-500/40 hover:border-teak-400 text-teak-300 text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-teak-400" />
          <span>Demo Guide</span>
        </button>

        {/* Quick Action Button Dropdown */}
        {userRole !== 'Contact' && (
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-teak-600 to-teak-500 hover:from-teak-500 hover:to-teak-400 active:bg-teak-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg shadow-teak-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Quick Action</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {showQuickMenu && (
              <div className="absolute right-0 mt-2 w-56 glass-dropdown rounded-2xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 border border-teak-500/30">
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    setActiveTab('sales');
                    onOpenNewInvoice();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-navy-900 text-slate-200 font-medium flex items-center space-x-2.5"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>New Sales Order</span>
                </button>

                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    setActiveTab('purchases');
                    onOpenNewBill();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-navy-900 text-slate-200 font-medium flex items-center space-x-2.5"
                >
                  <ShoppingCart className="w-4 h-4 text-amber-400" />
                  <span>New Purchase Order</span>
                </button>

                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenPaymentModal();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-navy-900 text-slate-200 font-medium flex items-center space-x-2.5"
                >
                  <CreditCard className="w-4 h-4 text-teak-400" />
                  <span>Register Payment</span>
                </button>

                <div className="my-1 border-t border-[#1e3e62]/40"></div>

                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    setActiveTab('budgets');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-navy-900 text-slate-200 font-medium flex items-center space-x-2.5"
                >
                  <PieChart className="w-4 h-4 text-teak-300" />
                  <span>Department Budgets</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-400 hover:text-white hover:bg-navy-900 rounded-xl relative transition-all"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teak-500 rounded-full ring-2 ring-[#0b1329]"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-dropdown rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 border border-teak-500/30">
              <div className="flex items-center justify-between pb-2 border-b border-[#1e3e62]/40 mb-2">
                <span className="font-bold text-xs text-slate-100 font-display">Live Double-Entry Activity</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/20 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Balanced
                </span>
              </div>
              <div className="space-y-2 text-xs">
                {recentEntries.map((je) => (
                  <div key={je.id} className="p-2.5 rounded-xl bg-[#080e1e] border border-[#1e3e62]/40">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-teak-400 text-[11px]">{je.id}</span>
                      <span className="text-[10px] text-slate-500">{je.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium mt-0.5">{je.reference}</p>
                    <p className="text-[10px] text-emerald-400 font-mono mt-1">
                      Posted to {je.journalType} Journal
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-[#1e3e62]/40 my-auto"></div>

        {/* Role Switcher */}
        <div className="flex items-center space-x-2 bg-[#080e1e] px-3 py-1.5 rounded-xl border border-[#1e3e62]/50 text-xs">
          <UserCheck className="w-3.5 h-3.5 text-teak-400" />
          <span className="text-slate-400 hidden sm:inline">Role:</span>
          <select
            value={userRole}
            onChange={(e) => {
              const role = e.target.value;
              setUserRole(role);
              if (role === 'Contact') {
                setActiveTab('portal');
              } else if (activeTab === 'portal') {
                setActiveTab('dashboard');
              }
            }}
            className="bg-transparent font-bold text-teak-300 focus:outline-none cursor-pointer text-xs"
          >
            <option value="Admin" className="bg-[#080e1e] text-slate-100">Admin (Owner)</option>
            <option value="Accountant" className="bg-[#080e1e] text-slate-100">Accountant</option>
            <option value="Contact" className="bg-[#080e1e] text-slate-100">Contact (Customer / Vendor)</option>
          </select>
        </div>
      </div>
    </header>
  );
}
