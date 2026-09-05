import React, { useState } from "react";
import { useAccounting } from "../context/AccountingContext";
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
  PieChart,
  Receipt,
  CheckCircle2,
  CheckCheck,
  Database,
  RefreshCw,
  LogOut,
} from "lucide-react";

const formatTimeAgo = (isoString) => {
  if (!isoString) return "Recently";
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";
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
    setUserRole,
    searchQuery,
    setSearchQuery,
    setShowDemoTourModal,
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
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-contain rounded"
            />
          </div>
          <span className="font-display font-bold text-white text-sm">
            Urban Furniture
          </span>
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
        {/* Live Backend Connection Status Pill */}
        <button
          onClick={() => refreshFromBackend()}
          disabled={syncing}
          title={
            backendOnline
              ? "Connected to Express & MySQL (Port 5000) - Click to re-sync"
              : "Connecting to MySQL Backend - Click to retry"
          }
          className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-mono font-medium transition-all ${
            backendOnline
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:border-emerald-400"
              : "bg-amber-950/40 border-amber-500/40 text-amber-300 hover:border-amber-400"
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span className="flex items-center space-x-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${backendOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}
            ></span>
            <span>
              {syncing
                ? "Syncing..."
                : backendOnline
                  ? "MySQL Live"
                  : "Connecting..."}
            </span>
          </span>
          <RefreshCw
            className={`w-3 h-3 ml-1 opacity-70 ${syncing ? "animate-spin" : "hover:opacity-100"}`}
          />
        </button>

        {/* Demo Tour Button */}
        <button
          onClick={() => setShowDemoTourModal(true)}
          className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-teak-500/20 via-navy-800/40 to-teak-500/20 border border-teak-500/40 hover:border-teak-400 text-teak-300 text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-teak-400" />
          <span>Demo Guide</span>
        </button>

        {/* Quick Action Button Dropdown */}
        {userRole !== "Contact" && (
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
                    setActiveTab("sales");
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
                    setActiveTab("purchases");
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
                    setActiveTab("budgets");
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
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-extrabold text-slate-950 shadow-lg ring-2 ring-[#0b1329] animate-pulse">
                {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-dropdown rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 border border-teak-500/30">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#1e3e62]/40 mb-3">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-teak-400" />
                  <span className="font-bold text-xs text-slate-100 font-display">
                    Notifications
                  </span>
                  {unreadNotificationCount > 0 && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/20 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                      {unreadNotificationCount} Unread
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-[11px]">
                  {unreadNotificationCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-teak-300 hover:text-teak-200 font-semibold transition-colors flex items-center space-x-1"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>Read All</span>
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-slate-400 hover:text-rose-400 font-medium transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 text-xs pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs font-medium">No notifications yet</p>
                    <p className="text-[11px] text-slate-500">
                      Creating a Sales Order or Customer Invoice will log live
                      activity here.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    let IconComponent = Bell;
                    let iconBgClass =
                      "bg-teak-500/20 text-teak-300 border-teak-500/30";

                    if (notif.type === "sales") {
                      IconComponent = TrendingUp;
                      iconBgClass =
                        "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
                    } else if (notif.type === "invoice") {
                      IconComponent = Receipt;
                      iconBgClass =
                        "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
                    } else if (
                      notif.type === "purchase" ||
                      notif.type === "bill"
                    ) {
                      IconComponent = ShoppingCart;
                      iconBgClass =
                        "bg-amber-500/20 text-amber-400 border-amber-500/30";
                    } else if (notif.type === "payment") {
                      IconComponent = CreditCard;
                      iconBgClass =
                        "bg-teal-500/20 text-teal-300 border-teal-500/30";
                    }

                    return (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                          notif.read
                            ? "bg-[#080e1e]/60 border-[#1e3e62]/20 opacity-75 hover:opacity-100"
                            : "bg-[#080e1e] border-teak-500/40 shadow-sm hover:border-teak-400"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-xl border shrink-0 ${iconBgClass}`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-[12px] text-slate-100 truncate">
                              {notif.title}
                            </h4>
                            <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                              {formatTimeAgo(notif.timestamp)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug">
                            {notif.message}
                          </p>
                        </div>

                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1"></span>
                        )}
                      </div>
                    );
                  })
                )}
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
              if (role === "Contact") {
                setActiveTab("portal");
              } else if (activeTab === "portal") {
                setActiveTab("dashboard");
              }
            }}
            className="bg-transparent font-bold text-teak-300 focus:outline-none cursor-pointer text-xs"
          >
            <option value="Admin" className="bg-[#080e1e] text-slate-100">
              Admin (Owner)
            </option>
            <option value="Accountant" className="bg-[#080e1e] text-slate-100">
              Accountant
            </option>
            <option value="Contact" className="bg-[#080e1e] text-slate-100">
              Contact (Customer / Vendor)
            </option>
          </select>
        </div>

        {/* User Profile & Sign Out */}
        <div className="flex items-center space-x-2 pl-1">
          {currentUser && (
            <div className="hidden xl:flex flex-col text-right leading-tight">
              <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{currentUser.email}</span>
            </div>
          )}

          <button
            onClick={logout}
            title="Sign out of system"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-500/30 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
