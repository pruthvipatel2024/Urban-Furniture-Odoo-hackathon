import React, { useState } from 'react';
import { Menu, Search, Bell, Plus, ShieldCheck, ChevronDown, UserCheck } from 'lucide-react';

export default function Navbar({ 
  setSidebarOpen, 
  userRole, 
  setUserRole, 
  onOpenNewInvoice, 
  onOpenNewBill, 
  onOpenPaymentModal,
  searchQuery,
  setSearchQuery
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <div className="relative w-64 md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoices, contacts, accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Quick Action Button Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Action</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {showQuickMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => { setShowQuickMenu(false); onOpenNewInvoice(); }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center space-x-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>New Customer Invoice</span>
              </button>
              <button
                onClick={() => { setShowQuickMenu(false); onOpenNewBill(); }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center space-x-2"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>New Vendor Bill</span>
              </button>
              <button
                onClick={() => { setShowQuickMenu(false); onOpenPaymentModal(); }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center space-x-2 border-t border-slate-100"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>Register Payment</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl relative transition-all"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="font-semibold text-xs text-slate-800">Notifications</span>
                <span className="text-[10px] text-indigo-600 bg-indigo-50 font-medium px-2 py-0.5 rounded-full">2 New</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition-colors">
                  <p className="font-medium text-slate-800">Invoice INV-2024-001 Paid</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Nimesh Pathak paid ₹35,397.64 via HDFC</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition-colors">
                  <p className="font-medium text-slate-800">Auto Journal Entry Created</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">JE-INV-001 synced with Ledger</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-slate-200 my-auto"></div>

        {/* Role Switcher */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-slate-100 px-2.5 py-1 rounded-xl text-xs">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-slate-500 hidden sm:inline">Role:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              <option value="Admin">Admin (Owner)</option>
              <option value="Accountant">Accountant</option>
              <option value="Contact">Contact (Customer)</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
