import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  Menu,
  Search,
  Bell,
  Plus,
  ChevronDown,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  PieChart,
  CheckCircle2,
  CheckCheck,
  Database,
  RefreshCw,
  LogOut,
  User,
  Shield,
  Briefcase
} from 'lucide-react';

const formatTimeAgo = (isoString) => {
  if (!isoString) return 'Recently';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
};

export default function Navbar({
  onOpenNewInvoice,
  onOpenNewBill,
  onOpenPaymentModal,
}) {
  const {
    setSidebarOpen,
    userRole,
    searchQuery,
    setSearchQuery,
    setActiveTab,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    backendOnline,
    syncing,
    refreshFromBackend,
    currentUser,
    logout
  } = useAccounting();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand Preview */}
        <div className="flex items-center space-x-2.5 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-white p-0.5 border border-slate-200">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-contain rounded"
            />
          </div>
          <span className="font-display font-bold text-slate-900 text-sm">
            Urban Furniture
          </span>
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden sm:block w-64 md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search accounts, invoices, products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-[#FBFBFB] hover:bg-white focus:bg-white text-xs border border-slate-200 focus:border-[#3095EB] rounded-xl outline-none transition-all placeholder:text-slate-400 text-slate-800 font-sans shadow-inner"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Live Backend Connection Status Pill */}
        <button
          onClick={() => refreshFromBackend()}
          disabled={syncing}
          title={
            backendOnline
              ? 'Connected to Express & MySQL - Click to synchronize'
              : 'Connecting to Backend - Click to retry'
          }
          className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-mono font-semibold transition-all cursor-pointer ${
            backendOnline
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span className="flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}
            ></span>
            <span>
              {syncing
                ? 'Syncing...'
                : backendOnline
                  ? 'Backend Live'
                  : 'Connecting...'}
            </span>
          </span>
          <RefreshCw
            className={`w-3 h-3 ml-1 opacity-70 ${syncing ? 'animate-spin' : 'hover:opacity-100'}`}
          />
        </button>

        {/* Quick Action Button Dropdown */}
        {userRole !== 'Contact' && (
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="flex items-center space-x-1.5 bg-[#C6E7FF] hover:bg-[#9BD5FF] active:bg-[#64B9FF] text-slate-900 text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer border border-[#9BD5FF]/40"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Quick Action</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {showQuickMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 border border-slate-200">
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    setActiveTab('sales');
                    onOpenNewInvoice();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#D4F6FF]/50 text-slate-700 font-medium flex items-center space-x-2.5 transition-colors cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>New Sales Order</span>
                </button>

                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    setActiveTab('purchases');
                    onOpenNewBill();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#D4F6FF]/50 text-slate-700 font-medium flex items-center space-x-2.5 transition-colors cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-amber-600" />
                  <span>New Purchase Order</span>
                </button>

                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenPaymentModal();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#D4F6FF]/50 text-slate-700 font-medium flex items-center space-x-2.5 transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Register Payment</span>
                </button>

                <div className="my-1 border-t border-slate-100"></div>

                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    setActiveTab('budgets');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#D4F6FF]/50 text-slate-700 font-medium flex items-center space-x-2.5 transition-colors cursor-pointer"
                >
                  <PieChart className="w-4 h-4 text-indigo-600" />
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
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl relative transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-extrabold text-white shadow-sm ring-2 ring-white animate-pulse">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 border border-slate-200">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-slate-600" />
                  <span className="font-bold text-xs text-slate-900 font-display">
                    Activity Stream
                  </span>
                  {unreadNotificationCount > 0 && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full font-mono">
                      {unreadNotificationCount} Unread
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-[11px]">
                  {unreadNotificationCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[#1B76C7] hover:underline font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>Mark all read</span>
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-slate-400 hover:text-rose-600 font-medium transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 text-xs pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-medium text-slate-600">No activity yet</p>
                    <p className="text-[11px] text-slate-400">
                      Creating orders, invoices, or registering payments will log live updates here.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        notif.read
                          ? 'bg-[#FBFBFB] border-slate-200/60 opacity-80'
                          : 'bg-[#D4F6FF]/30 border-[#C6E7FF] shadow-xs'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-white border border-slate-200 shrink-0 text-slate-700">
                        <Bell className="w-4 h-4 text-[#1B76C7]" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[12px] text-slate-900 truncate">
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                            {formatTimeAgo(notif.timestamp)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          {notif.message}
                        </p>
                      </div>

                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1"></span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-slate-200 my-auto"></div>

        {/* Authenticated User Profile Badge */}
        <div className="flex items-center space-x-3 pl-1">
          {currentUser && (
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#D4F6FF] border border-[#C6E7FF] flex items-center justify-center text-slate-800 font-bold text-xs">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden xl:flex flex-col text-left leading-tight">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{currentUser.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    userRole === 'Admin' ? 'bg-purple-100 text-purple-800' :
                    userRole === 'Accountant' ? 'bg-blue-100 text-blue-800' :
                    'bg-teal-100 text-teal-800'
                  }`}>
                    {userRole}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{currentUser.email}</span>
              </div>
            </div>
          )}

          {/* Sign Out Button */}
          <button
            onClick={logout}
            title="Sign out of system"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
