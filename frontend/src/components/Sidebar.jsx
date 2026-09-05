import React from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  LayoutDashboard,
  Users,
  Package,
  BookOpen,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  FileText,
  Building2,
  ListOrdered,
  Layers,
  PieChart,
  Sparkles,
  UserCheck
} from 'lucide-react';

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    setShowDemoTourModal,
    userRole
  } = useAccounting();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Main', roles: ['Admin', 'Accountant'] },
    
    // Master Data
    { id: 'master-contacts', label: 'Contacts Master', icon: Users, category: 'Master Data', roles: ['Admin', 'Accountant'] },
    { id: 'master-products', label: 'Products & Stock', icon: Package, category: 'Master Data', roles: ['Admin', 'Accountant'] },
    { id: 'master-coa', label: 'Chart of Accounts', icon: BookOpen, category: 'Master Data', roles: ['Admin', 'Accountant'] },
    { id: 'master-journals', label: 'Journals Master', icon: Layers, category: 'Master Data', roles: ['Admin'] },
    
    // Transactions
    { id: 'purchases', label: 'Purchases & Bills', icon: ShoppingCart, category: 'Transactions', roles: ['Admin', 'Accountant'] },
    { id: 'sales', label: 'Sales & Invoices', icon: TrendingUp, category: 'Transactions', roles: ['Admin', 'Accountant'] },
    { id: 'payments', label: 'Payments Register', icon: CreditCard, category: 'Transactions', roles: ['Admin', 'Accountant'] },
    
    // Accounting
    { id: 'journals', label: 'General Ledger', icon: ListOrdered, category: 'Accounting', roles: ['Admin', 'Accountant'] },
    { id: 'budgets', label: 'Department Budgets', icon: PieChart, category: 'Accounting', roles: ['Admin', 'Accountant'] },
    { id: 'reports', label: 'Financial Reports', icon: FileText, category: 'Accounting', roles: ['Admin', 'Accountant'] },

    // External Portal
    { id: 'portal', label: 'My Invoices & Balance', icon: UserCheck, category: 'Customer / Vendor Portal', roles: ['Contact'] }
  ];

  const categories = userRole === 'Contact'
    ? ['Customer / Vendor Portal']
    : ['Main', 'Master Data', 'Transactions', 'Accounting'];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0b1329]/80 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#080e1e] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-[#1e3e62]/40 shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with Official Logo */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-[#1e3e62]/40 bg-[#060a17]">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg border border-[#c58940]/40 shrink-0">
              <img
                src="/logo.png"
                alt="Urban Furniture Logo"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-white tracking-wide text-base leading-tight">
                Urban Furniture
              </h1>
              <span className="text-[10px] text-teak-400 font-semibold uppercase tracking-wider bg-[#132b4f]/80 px-2 py-0.5 rounded-full border border-teak-500/30">
                ERP Accounting
              </span>
            </div>
          </div>
        </div>

        {/* Demo Tour Assistant Banner */}
        <div className="p-3 border-b border-[#1e3e62]/30">
          <button
            onClick={() => {
              setShowDemoTourModal(true);
              setSidebarOpen(false);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-teak-600/20 via-navy-800/40 to-teak-600/20 border border-teak-500/40 hover:border-teak-400 text-teak-300 text-xs font-bold transition-all shadow-sm group"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-teak-400 group-hover:scale-110 transition-transform" />
              <span>14-Step Demo Tour</span>
            </div>
            <span className="text-[10px] bg-teak-500/30 text-teak-200 px-1.5 py-0.5 rounded font-mono font-bold">
              Guide
            </span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {categories.map((category) => {
            const items = navItems.filter(item => item.category === category && item.roles.includes(userRole));
            if (items.length === 0) return null;

            return (
              <div key={category} className="space-y-1">
                <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {category}
                </p>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id || (item.id.startsWith('master') && activeTab.startsWith('master') && activeTab === item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-teak-600 to-teak-500 text-white shadow-lg shadow-teak-600/30 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-[#132b4f]/50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#1e3e62]/40 bg-[#060a17] text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center border border-teak-500/40 shrink-0">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain rounded" />
            </div>
            <div>
              <p className="font-bold text-slate-200">Urban Furniture Ltd.</p>
              <p className="text-[10px] text-teak-400/80 font-mono">FY 2026-2027 • Double-Entry</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
