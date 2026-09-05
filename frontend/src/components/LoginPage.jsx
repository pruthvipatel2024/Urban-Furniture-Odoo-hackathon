import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  Database,
  Building2,
  Receipt,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const { login, backendOnline } = useAccounting();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
    setIsLoading(true);
    try {
      await login(demoEmail, demoPassword);
    } catch (err) {
      setErrorMessage(err.message || 'Demo login failed. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans selection:bg-teak-500 selection:text-white">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teak-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-800/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto">
        
        {/* Left Column: Brand Hero & Value Prop */}
        <div className="lg:col-span-5 flex flex-col justify-between p-8 rounded-3xl bg-gradient-to-b from-[#0e172e]/90 to-[#091122]/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Building2 className="w-48 h-48 text-teak-400" />
          </div>

          <div className="space-y-6 relative z-10">
            {/* Logo & System Badge */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teak-600 to-amber-500 p-0.5 shadow-lg shadow-teak-500/30 flex items-center justify-center">
                <div className="w-full h-full bg-[#080e1e] rounded-[14px] flex items-center justify-center p-2">
                  <img src="/logo.png" alt="Urban Furniture Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white font-display">Urban Furniture</h1>
                <p className="text-[11px] text-teak-400 font-medium tracking-wide">Enterprise ERP & Double-Entry Accounting</p>
              </div>
            </div>

            {/* Value Highlights */}
            <div className="space-y-3 pt-2">
              <h2 className="text-xl font-bold text-slate-100 font-display leading-snug">
                Smart Accounting Built for High-Volume Furniture Retail
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Streamlined double-entry ledger, automated stock synchronisation, vendor bill validation, and real-time P&L reporting.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center space-x-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Strict Double-Entry Engine (Debits = Credits)</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Automated PO to Bill and SO to Invoice Workflows</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Role-Based Access Control & Customer Portal</span>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-8 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>MySQL 8.0</span>
            </div>
            <span className="text-slate-500">v1.0.0 Production</span>
          </div>
        </div>

        {/* Right Column: Login Card & Demo Selector */}
        <div className="lg:col-span-7 bg-[#0b1426]/95 border border-[#1e3458]/70 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl flex flex-col justify-between space-y-6">
          
          {/* Header & Status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white font-display">Sign In to Workspace</h3>
              <p className="text-xs text-slate-400">Enter your credentials or choose a quick demo profile</p>
            </div>
            
            {/* Live Backend Badge */}
            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border ${
              backendOnline
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{backendOnline ? 'Backend Connected' : 'Connecting API...'}</span>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl flex items-center space-x-2.5 text-xs text-rose-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@urbanfurniture.com"
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-[#070e1c] border border-slate-700/80 focus:border-teak-500 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-[#070e1c] border border-slate-700/80 focus:border-teak-500 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-teak-600 via-teak-500 to-amber-600 hover:from-teak-500 hover:to-amber-500 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-lg shadow-teak-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to System</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Roles */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant Demo Access (Click to Sign In)</span>
              </span>
              <span className="text-[10px] text-teak-400 font-mono">Evaluation Mode</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Admin Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@urbanfurniture.com', 'admin123')}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-[#080f1e] hover:bg-teak-950/30 border border-[#1e3458] hover:border-teak-500/60 transition-all text-left group flex flex-col justify-between space-y-1.5 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="p-1 rounded-lg bg-teak-500/20 text-teak-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[9px] font-bold text-teak-400 bg-teak-500/10 px-1.5 py-0.5 rounded">All Access</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-teak-300 transition-colors">Urban Admin</h4>
                  <p className="text-[10px] text-slate-400">admin@urbanfurniture.com</p>
                </div>
              </button>

              {/* Accountant Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('accountant@urbanfurniture.com', 'accountant123')}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-[#080f1e] hover:bg-indigo-950/30 border border-[#1e3458] hover:border-indigo-500/60 transition-all text-left group flex flex-col justify-between space-y-1.5 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-300">
                    <Receipt className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">Finance</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">Pooja Mehta</h4>
                  <p className="text-[10px] text-slate-400">accountant@urbanfurniture.com</p>
                </div>
              </button>

              {/* Contact / Portal User Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('nimesh.pathak@techspace.io', 'contact123')}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-[#080f1e] hover:bg-teal-950/30 border border-[#1e3458] hover:border-teal-500/60 transition-all text-left group flex flex-col justify-between space-y-1.5 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="p-1 rounded-lg bg-teal-500/20 text-teal-300">
                    <UserCheck className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[9px] font-bold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">Portal</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-teal-300 transition-colors">Nimesh Pathak</h4>
                  <p className="text-[10px] text-slate-400">nimesh.pathak@techspace.io</p>
                </div>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
