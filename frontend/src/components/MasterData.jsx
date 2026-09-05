import React, { useState } from 'react';
import { 
  Users, 
  Package, 
  BookOpen, 
  Plus, 
  Search, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle,
  Tag,
  DollarSign
} from 'lucide-react';

export default function MasterData({ 
  contacts, 
  setContacts, 
  products, 
  setProducts, 
  chartOfAccounts, 
  setChartOfAccounts,
  activeSubTab,
  setActiveSubTab
}) {
  // Modal States
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // New Contact Form State
  const [newContact, setNewContact] = useState({
    name: '',
    type: 'Customer',
    email: '',
    phone: '',
    city: ''
  });

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    type: 'Goods',
    salesPrice: '',
    costPrice: '',
    category: 'Furniture',
    stock: 10
  });

  // Handlers
  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.email) return;

    const contactObj = {
      id: `CNT-00${contacts.length + 1}`,
      name: newContact.name,
      type: newContact.type,
      email: newContact.email,
      phone: newContact.phone || '+91 90000 00000',
      city: newContact.city || 'Mumbai',
      status: 'Active'
    };

    setContacts([contactObj, ...contacts]);
    setNewContact({ name: '', type: 'Customer', email: '', phone: '', city: '' });
    setShowAddContactModal(false);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.salesPrice) return;

    const productObj = {
      id: `PRD-10${products.length + 1}`,
      name: newProduct.name,
      type: newProduct.type,
      salesPrice: Number(newProduct.salesPrice),
      costPrice: Number(newProduct.costPrice || 0),
      category: newProduct.category,
      stock: Number(newProduct.stock || 0)
    };

    setProducts([productObj, ...products]);
    setNewProduct({ name: '', type: 'Goods', salesPrice: '', costPrice: '', category: 'Furniture', stock: 10 });
    setShowAddProductModal(false);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Sub Tab Selector Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('contacts')}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all
              ${activeSubTab === 'contacts' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                : 'text-slate-600 hover:bg-slate-100'
              }
            `}
          >
            <Users className="w-4 h-4" />
            <span>Contacts Master ({contacts.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('products')}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all
              ${activeSubTab === 'products' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                : 'text-slate-600 hover:bg-slate-100'
              }
            `}
          >
            <Package className="w-4 h-4" />
            <span>Products Master ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('coa')}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all
              ${activeSubTab === 'coa' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                : 'text-slate-600 hover:bg-slate-100'
              }
            `}
          >
            <BookOpen className="w-4 h-4" />
            <span>Chart of Accounts ({chartOfAccounts.length})</span>
          </button>
        </div>

        {/* Add Actions */}
        {activeSubTab === 'contacts' && (
          <button
            onClick={() => setShowAddContactModal(true)}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        )}

        {activeSubTab === 'products' && (
          <button
            onClick={() => setShowAddProductModal(true)}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* 1. CONTACTS TAB VIEW */}
      {activeSubTab === 'contacts' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                <th className="py-3.5 px-4">Contact ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">City</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-500">{c.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3.5 px-4">
                    <span className={`
                      px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${c.type === 'Customer' ? 'bg-emerald-100 text-emerald-700' : ''}
                      ${c.type === 'Vendor' ? 'bg-amber-100 text-amber-700' : ''}
                      ${c.type === 'Both' ? 'bg-purple-100 text-purple-700' : ''}
                    `}>
                      {c.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{c.email}</td>
                  <td className="py-3.5 px-4 text-slate-600">{c.phone}</td>
                  <td className="py-3.5 px-4 text-slate-600">{c.city}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center space-x-1 text-emerald-600 font-semibold text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{c.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. PRODUCTS TAB VIEW */}
      {activeSubTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">{p.id}</span>
                  <span className={`
                    px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase
                    ${p.type === 'Goods' ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'}
                  `}>
                    {p.type}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 mt-2">{p.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">Category: {p.category}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Sales Price</span>
                  <p className="font-extrabold text-emerald-600 text-sm">{formatCurrency(p.salesPrice)}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Cost Price</span>
                  <p className="font-bold text-slate-700">{formatCurrency(p.costPrice)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. CHART OF ACCOUNTS TAB VIEW */}
      {activeSubTab === 'coa' && (
        <div className="space-y-6">
          {['Asset', 'Liability', 'Capital', 'Income', 'Expense'].map((type) => {
            const accountsGrouped = chartOfAccounts.filter(acc => acc.type === type);
            if (accountsGrouped.length === 0) return null;

            return (
              <div key={type} className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider">{type} Accounts</h4>
                  <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                    {accountsGrouped.length} Accounts
                  </span>
                </div>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Account Name</th>
                      <th className="py-3 px-4">Sub Category</th>
                      <th className="py-3 px-4 text-right">Current Ledger Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {accountsGrouped.map((acc) => (
                      <tr key={acc.code} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-600">{acc.code}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{acc.name}</td>
                        <td className="py-3 px-4 text-slate-500">{acc.subCategory}</td>
                        <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                          {formatCurrency(acc.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD CONTACT MODAL */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">Create New Contact</h3>
            <form onSubmit={handleAddContact} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Furniture Co."
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Contact Type</label>
                  <select
                    value={newContact.type}
                    onChange={(e) => setNewContact({...newContact, type: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={newContact.city}
                    onChange={(e) => setNewContact({...newContact, city: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="contact@company.com"
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">Add New Product</h3>
            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Bookshelf"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Type</label>
                  <select
                    value={newProduct.type}
                    onChange={(e) => setNewProduct({...newProduct, type: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Goods">Goods</option>
                    <option value="Service">Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="Storage"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Sales Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="12000"
                    value={newProduct.salesPrice}
                    onChange={(e) => setNewProduct({...newProduct, salesPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    placeholder="7500"
                    value={newProduct.costPrice}
                    onChange={(e) => setNewProduct({...newProduct, costPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
