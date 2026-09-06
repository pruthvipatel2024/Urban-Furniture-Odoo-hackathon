import React, { useState, useRef, useEffect } from "react";
import { useAccounting } from "../context/AccountingContext";
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
  Briefcase,
  Users,
  Package,
  FolderTree,
  BookOpen,
  Layers,
  FileText,
  Scale,
  ListOrdered,
  LayoutDashboard,
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
    searchQuery,
    setSearchQuery,
    activeTab,
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
    logout,
  } = useAccounting();

  const [showNotifications, setShowNotifications] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // 'sales' | 'purchase' | 'master' | 'analyticals' | 'journals' | 'reports' | null
  const navRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdown(null);
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setOpenDropdown(null);
  };

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-30 bg-white border-b border-[#E3E7EA] px-4 lg:px-8 shadow-xs select-none"
    >
      <div className="h-16 lg:h-[72px] flex items-center justify-between gap-3">
        {/* Left: Mobile Menu & Brand */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-[#667482] hover:text-[#0B2A4A] hover:bg-[#EEF4F8] rounded-lg lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleNavClick("dashboard")}
            className="flex items-center space-x-3 group cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-white p-1 border border-[#E3E7EA] shadow-xs flex items-center justify-center shrink-0 group-hover:border-[#0B2A4A] transition-colors">
              <img
                src="/logo.png"
                alt="Urban Furniture Logo"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-display font-bold text-[#0B2A4A] text-base tracking-tight leading-tight group-hover:text-[#163B63] transition-colors">
                Urban Furniture
              </span>
              <span className="text-[10px] font-mono font-semibold text-[#8A96A3] uppercase tracking-wider">
                ERP Accounting
              </span>
            </div>
          </button>
        </div>

        {/* Center: Excalidraw Horizontal Top Navigation Menu */}
        {userRole !== "Contact" ? (
          <nav className="hidden lg:flex items-center space-x-1 font-medium text-xs">
            {/* 1. Dashboard */}
            <button
              onClick={() => handleNavClick("dashboard")}
              className={`px-3.5 py-2 rounded-xl transition-all font-bold cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-[#EEF4F8] text-[#0B2A4A] border border-[#D8E1E8] shadow-xs"
                  : "text-[#667482] hover:bg-[#EEF4F8] hover:text-[#0B2A4A]"
              }`}
            >
              Dashboard
            </button>

            {/* 2. Sales Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("sales")}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all font-bold cursor-pointer ${
                  activeTab.startsWith("sales")
                    ? "bg-[#EEF4F8] text-[#0B2A4A] border border-[#D8E1E8] shadow-xs"
                    : "text-[#667482] hover:bg-[#EEF4F8] hover:text-[#0B2A4A]"
                }`}
              >
                <span>Sales</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {openDropdown === "sales" && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl py-1.5 z-50 text-xs border border-[#E3E7EA] animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => handleNavClick("sales-orders")}
                    className="w-full text-left px-4 py-2 hover:bg-[#EEF4F8] text-[#17212B] font-semibold flex items-center space-x-2.5 cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4 text-[#18794E]" />
                    <span>Sales Order</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("sales-invoices")}
                    className="w-full text-left px-4 py-2 hover:bg-[#EEF4F8] text-[#17212B] font-semibold flex items-center space-x-2.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#0B2A4A]" />
                    <span>Sale Invoice</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("sales-receipts")}
                    className="w-full text-left px-4 py-2 hover:bg-[#EEF4F8] text-[#17212B] font-semibold flex items-center space-x-2.5 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-[#C98232]" />
                    <span>Receipt</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Purchase Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("purchase")}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all font-bold cursor-pointer ${
                  activeTab.startsWith("purchase")
                    ? "bg-[#EEF4F8] text-[#0B2A4A] border border-[#D8E1E8] shadow-xs"
                    : "text-[#667482] hover:bg-[#EEF4F8] hover:text-[#0B2A4A]"
                }`}
              >
                <span>Purchase</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {openDropdown === "purchase" && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl py-1.5 z-50 text-xs border border-[#E3E7EA] animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => handleNavClick("purchase-orders")}
                    className="w-full text-left px-4 py-2 hover:bg-[#EEF4F8] text-[#17212B] font-semibold flex items-center space-x-2.5 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-[#C98232]" />
                    <span>Purchase Order</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("purchase-bills")}
                    className="w-full text-left px-4 py-2 hover:bg-[#EEF4F8] text-[#17212B] font-semibold flex items-center space-x-2.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#0B2A4A]" />
                    <span>Purchase Bill</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("purchase-payments")}
                    className="w-full text-left px-4 py-2 hover:bg-[#EEF4F8] text-[#17212B] font-semibold flex items-center space-x-2.5 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-[#163B63]" />
                    <span>Payment</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. Master Data Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("master")}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all font-bold cursor-pointer ${
                  activeTab === "master-contacts" ||
                  activeTab === "master-products"
                    ? "bg-[#EEF4F8] text-[#0B2A4A] border border-[#D8E1E8] shadow-xs"
                    : "text-[#667482] hover:bg-[#EEF4F8] hover:text-[#0B2A4A]"
                }`}
              >
                <span>Master Data</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {openDropdown === "master" && (
                <div className="absolute left-0 mt-2 w-44 bg-white rounded-2xl shadow-xl py-1.5 z-50 text-xs border border-[#E3E7EA] animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => handleNavClick("master-contacts")}
                    className="w-full text-left px-4 py-2 hover:bg-[#EEF4F8] text-[#17212B] font-semibold flex items-center space-x-2.5 cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-[#0B2A4A]" />
                    <span>Contact</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("master-products")}
                    className="w-full text-left px-4 py-2 hover:bg-[#EEF4F8] text-[#17212B] font-semibold flex items-center space-x-2.5 cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-[#C98232]" />
                    <span>Product</span>
                  </button>
                </div>
              )}
            </div>

            {/* 5. Analyticals Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("analyticals")}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all font-bold cursor-pointer ${
                  activeTab === "master-analytics" || activeTab === "budgets"
                    ? "bg-[#EEF4F8] text-[#0B2A4A] border border-[#D8E1E8] shadow-xs"
                    : "text-[#667482] hover:bg-[#EEF4F8] hover:text-[#0B2A4A]"
                }`}
              >
                <span>Analyticals</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {openDropdown === "analyticals" && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl py-1.5 z-50 text-xs border border-[#E3E7EA] animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => handleNavClick("master-analytics")}
                    className="w-full text-left px-4 py-2 hover:bg-[#EEF4F8] text-[#17212B] font-semibold flex items-center space-x-2.5 cursor-pointer"
                  >
                    <FolderTree className="w-4 h-4 text-[#0B2A4A]" />
                    <span>Analytical Accounts</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("budgets")}
                    className="w-full text-left px-4 py-2 hover:bg-[#EEF4F8] text-[#17212B] font-semibold flex items-center space-x-2.5 cursor-pointer"
                  >
                    <PieChart className="w-4 h-4 text-[#C98232]" />
                    <span>Budget</span>
                  </button>
                </div>
              )}
            </div>

            {/* 6. Chart of Accounts */}
            <button
              onClick={() => handleNavClick("master-coa")}
              className={`px-3.5 py-2 rounded-xl transition-all font-bold cursor-pointer ${
                activeTab === "master-coa"
                  ? "bg-[#EEF4F8] text-[#0B2A4A] border border-[#D8E1E8] shadow-xs"
                  : "text-[#667482] hover:bg-[#EEF4F8] hover:text-[#0B2A4A]"
              }`}
            >
              Chart of Account
            </button>

            {/* 7. Journals Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("journals")}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all font-bold cursor-pointer ${
                  activeTab === "master-journals" ||
                  activeTab === "journal-entries"
                    ? "bg-[#EEF4F8] text-[#0B2A4A] border border-[#D8E1E8] shadow-xs"
                    : "text-[#667482] hover:bg-[#EEF4F8] hover:text-[#0B2A4A]"
                }`}
              >
                <span>Journals</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {openDropdown === "journals" && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl py-1.5 z-50 text-xs border border-[#E3E7EA] animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => handleNavClick("master-journals")}
                    className="w-full text-left px-4 py-2 hover:bg-[#EEF4F8] text-[#17212B] font-semibold flex items-center space-x-2.5 cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-[#0B2A4A]" />
                    <span>Journals Master</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("journal-entries")}
                    className="w-full text-left px-4 py-2 hover:bg-[#EEF4F8] text-[#17212B] font-semibold flex items-center space-x-2.5 cursor-pointer"
                  >
                    <ListOrdered className="w-4 h-4 text-[#163B63]" />
                    <span>Journal Entries</span>
                  </button>
                </div>
              )}
            </div>

            {/* 8. Reports Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("reports")}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all font-bold cursor-pointer ${
                  activeTab.startsWith("reports")
                    ? "bg-[#EEF4F8] text-[#0B2A4A] border border-[#D8E1E8] shadow-xs"
                    : "text-[#667482] hover:bg-[#EEF4F8] hover:text-[#0B2A4A]"
                }`}
              >
                <span>Reports</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {openDropdown === "reports" && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl py-1.5 z-50 text-xs border border-[#E3E7EA] animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => handleNavClick("reports-balancesheet")}
                    className="w-full text-left px-4 py-2 hover:bg-[#EEF4F8] text-[#17212B] font-semibold flex items-center space-x-2.5 cursor-pointer"
                  >
                    <Scale className="w-4 h-4 text-[#18794E]" />
                    <span>Balance Sheet</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("reports-pnl")}
                    className="w-full text-left px-4 py-2 hover:bg-[#EEF4F8] text-[#17212B] font-semibold flex items-center space-x-2.5 cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4 text-[#0B2A4A]" />
                    <span>Profit and Loss</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("reports-budget")}
                    className="w-full text-left px-4 py-2 hover:bg-[#EEF4F8] text-[#17212B] font-semibold flex items-center space-x-2.5 cursor-pointer"
                  >
                    <PieChart className="w-4 h-4 text-[#C98232]" />
                    <span>Budget Report</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        ) : (
          <div className="text-xs font-bold text-[#0B2A4A]">
            Customer Self-Service Portal
          </div>
        )}

        {/* Right Section: Status Pill, Notifications, User Profile */}
        <div className="flex items-center space-x-3">
          {/* Live Backend Connection Status Pill */}
          <button
            onClick={() => refreshFromBackend()}
            disabled={syncing}
            title={
              backendOnline
                ? "Connected to Express & MySQL - Click to synchronize"
                : "Connecting to Backend - Click to retry"
            }
            className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-mono font-semibold transition-all cursor-pointer ${
              backendOnline
                ? "bg-[#EAF7F0] border-[#E3E7EA] text-[#18794E] hover:bg-[#D6F0E1]"
                : "bg-[#FFF6DF] border-[#E3E7EA] text-[#B7791F] hover:bg-[#FEEFC3]"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="flex items-center space-x-1.5">
              <span
                className={`w-2 h-2 rounded-full ${backendOnline ? "bg-[#18794E] animate-pulse" : "bg-[#B7791F]"}`}
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
              className={`w-3 h-3 ml-0.5 opacity-70 ${syncing ? "animate-spin" : "hover:opacity-100"}`}
            />
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-[#667482] hover:text-[#0B2A4A] hover:bg-[#EEF4F8] rounded-xl relative transition-all cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#C98232] text-[9px] font-extrabold text-white shadow-xs ring-2 ring-white animate-pulse">
                  {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 border border-[#E3E7EA]">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#E3E7EA] mb-3">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-[#0B2A4A]" />
                    <span className="font-bold text-xs text-[#17212B] font-display">
                      Activity Stream
                    </span>
                    {unreadNotificationCount > 0 && (
                      <span className="text-[10px] text-[#C98232] bg-[#F8F0E6] font-bold px-2 py-0.5 rounded-full font-mono">
                        {unreadNotificationCount} Unread
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-[11px]">
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[#0B2A4A] hover:text-[#C98232] font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>Mark all read</span>
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-[#8A96A3] hover:text-[#B42318] font-medium transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2 text-xs pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-[#667482] space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-[#D8E1E8] mx-auto" />
                      <p className="text-xs font-medium text-[#17212B]">
                        No activity yet
                      </p>
                      <p className="text-[11px] text-[#8A96A3]">
                        Live actions will log updates here.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                          notif.read
                            ? "bg-[#FAFAF8] border-[#E3E7EA] opacity-80"
                            : "bg-[#EEF4F8] border-[#D8E1E8] shadow-xs"
                        }`}
                      >
                        <div className="p-2 rounded-xl bg-white border border-[#E3E7EA] shrink-0 text-[#0B2A4A]">
                          <Bell className="w-4 h-4 text-[#0B2A4A]" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-[12px] text-[#17212B] truncate">
                              {notif.title}
                            </h4>
                            <span className="text-[10px] text-[#8A96A3] shrink-0 ml-2">
                              {formatTimeAgo(notif.timestamp)}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#667482] leading-snug">
                            {notif.message}
                          </p>
                        </div>

                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-[#C98232] shrink-0 mt-1"></span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-[#E3E7EA] my-auto"></div>

          {/* Authenticated User Profile Badge */}
          <div className="flex items-center space-x-2 pl-1">
            {currentUser && (
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-[#F8F0E6] border border-[#E5B875] flex items-center justify-center text-[#0B2A4A] font-bold text-xs shadow-xs">
                  {currentUser.name
                    ? currentUser.name.charAt(0).toUpperCase()
                    : "U"}
                </div>
                <div className="hidden xl:flex flex-col text-left leading-tight">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-[#17212B] truncate max-w-[110px]">
                      {currentUser.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                        userRole === "Admin"
                          ? "bg-[#EEF4F8] text-[#0B2A4A]"
                          : userRole === "Accountant"
                            ? "bg-[#F8F0E6] text-[#C98232]"
                            : "bg-[#EAF7F0] text-[#18794E]"
                      }`}
                    >
                      {userRole}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#667482] truncate max-w-[110px]">
                    {currentUser.email}
                  </span>
                </div>
              </div>
            )}

            {/* Sign Out Button */}
            <button
              onClick={logout}
              title="Sign out of system"
              className="p-2 text-[#8A96A3] hover:text-[#B42318] hover:bg-[#FDECEC] border border-transparent hover:border-[#B42318]/20 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
