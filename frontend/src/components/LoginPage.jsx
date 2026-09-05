import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Database,
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
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
      setErrorMessage(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-slate-800 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans selection:bg-[#C6E7FF] selection:text-slate-900">
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#C6E7FF]/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#D4F6FF]/50 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto">
        
        {/* Left Column: Brand Hero & System Overview */}
        <div className="lg:col-span-5 flex flex-col justify-between p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            {/* Brand Logo & Title */}
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-md border border-slate-200 flex items-center justify-center">
                <img src="/logo.png" alt="Urban Furniture Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900 font-display">Urban Furniture</h1>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide">Enterprise ERP & Accounting</p>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="space-y-3 pt-2">
              <h2 className="text-xl font-bold text-slate-900 font-display leading-snug">
                Precision Double-Entry Financial Management
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seamless real-time transactions, automated sales and purchase workflows, inventory tracking, and balanced financial ledger reports.
              </p>
            </div>

            {/* System Highlights */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3 text-xs text-slate-700 bg-[#FBFBFB] p-2.5 rounded-xl border border-slate-200/60">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">Strict Double-Entry Balanced Ledger</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-700 bg-[#FBFBFB] p-2.5 rounded-xl border border-slate-200/60">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-medium">Real-Time Inventory & Stock Movement</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-700 bg-[#FBFBFB] p-2.5 rounded-xl border border-slate-200/60">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-medium">Simulated Payments with Balance Validation</span>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-8 mt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-mono">MySQL Database</span>
            </div>
            <span className="font-medium">v1.0.0 Enterprise</span>
          </div>
        </div>

        {/* Right Column: Clean Authentication Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col justify-between space-y-6">
          
          {/* Form Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-display">Sign In to Your Account</h3>
              <p className="text-xs text-slate-500 mt-0.5">Enter your organizational credentials to continue</p>
            </div>
            
            {/* Live Backend Badge */}
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold border ${
              backendOnline
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span>{backendOnline ? 'Backend Live' : 'Connecting...'}</span>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@urbanfurniture.com"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FBFBFB] border border-slate-200 focus:border-[#3095EB] focus:bg-white rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-[#FBFBFB] border border-slate-200 focus:border-[#3095EB] focus:bg-white rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#C6E7FF] hover:bg-[#9BD5FF] active:bg-[#64B9FF] text-slate-900 text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer border border-[#9BD5FF]/40"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="w-4 h-4 text-slate-900" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* System Security Notice */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-center space-x-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Secure session authenticated via JWT and MySQL role-based access control.</span>
          </div>

        </div>

      </div>
    </div>
  );
}
