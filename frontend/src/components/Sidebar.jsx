import React from 'react';
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
  ListOrdered
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Main' },
    { id: 'master-contacts', label: 'Contacts', icon: Users, category: 'Master Data' },
    { id: 'master-products', label: 'Products', icon: Package, category: 'Master Data' },
    { id: 'master-coa', label: 'Chart of Accounts', icon: BookOpen, category: 'Master Data' },
    { id: 'purchases', label: 'Purchase Orders & Bills', icon: ShoppingCart, category: 'Transactions' },
    { id: 'sales', label: 'Sales Orders & Invoices', icon: TrendingUp, category: 'Transactions' },
    { id: 'payments', label: 'Payments', icon: CreditCard, category: 'Transactions' },
    { id: 'journals', label: 'Journal Entries (Ledger)', icon: ListOrdered, category: 'Accounting' },
    { id: 'reports', label: 'Financial Reports', icon: FileText, category: 'Accounting' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-slate-800
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-white tracking-wide text-base">Urban Furniture</h1>
              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/50">ERP Accounting</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {['Main', 'Master Data', 'Transactions', 'Accounting'].map((category) => {
            const filteredItems = navItems.filter(item => item.category === category);
            if (filteredItems.length === 0) return null;

            return (
              <div key={category} className="space-y-1">
                <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {category}
                </p>
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold' 
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                        }
                      `}
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
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center space-x-3 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
              UF
            </div>
            <div className="text-xs">
              <p className="font-medium text-slate-200">Urban Furniture Ltd.</p>
              <p className="text-slate-500">FY 2026-2027</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
