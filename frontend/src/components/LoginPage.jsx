import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Eye,
  EyeOff,
  Database,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  UserPlus,
  ArrowLeft
} from 'lucide-react';

export default function LoginPage() {
  const { login, signup, forgotPassword, resetPassword, backendOnline } = useAccounting();

  // Mode: 'signin' | 'signup' | 'forgot' | 'reset'
  const [authMode, setAuthMode] = useState('signin');

  // Sign In Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up Form State
  const [signupForm, setSignupForm] = useState({
    loginId: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Forgot / Reset Password State
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [resetForm, setResetForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password validation helper
  const validatePasswordRules = (pwd) => {
    return {
      length: pwd.length > 8,
      lower: /[a-z]/.test(pwd),
      upper: /[A-Z]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>_\-]/.test(pwd),
    };
  };

  const currentPwdRules = validatePasswordRules(
    authMode === 'signup' ? signupForm.password : (authMode === 'reset' ? resetForm.newPassword : '')
  );

  // 1. Handle Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginIdentifier.trim() || !password.trim()) {
      setErrorMessage('Please enter both your Login ID / Email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(loginIdentifier.trim(), password);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid Login Id or Password');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanLoginId = signupForm.loginId.trim();
    const cleanEmail = signupForm.email.trim();

    if (!cleanLoginId || cleanLoginId.length < 6 || cleanLoginId.length > 12) {
      setErrorMessage('Login ID must be between 6 and 12 characters.');
      return;
    }

    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setErrorMessage('Password and Re-entered Password do not match.');
      return;
    }

    const rules = validatePasswordRules(signupForm.password);
    if (!rules.length || !rules.lower || !rules.upper || !rules.special) {
      setErrorMessage('Password must be >8 characters and include uppercase, lowercase, and special characters.');
      return;
    }

    setIsLoading(true);
    try {
      await signup({
        loginId: cleanLoginId,
        email: cleanEmail,
        password: signupForm.password,
        confirmPassword: signupForm.confirmPassword,
      });
    } catch (err) {
      setErrorMessage(err.message || 'Signup failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Forgot Password (Verify account)
  const handleVerifyAccount = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!forgotIdentifier.trim()) {
      setErrorMessage('Please enter your Login ID or registered Email ID.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await forgotPassword(forgotIdentifier.trim());
      setVerifiedUser(user);
      setSuccessMessage('Account verified. Please set your new password.');
      setAuthMode('reset');
    } catch (err) {
      setErrorMessage(err.message || 'No user account found matching this identifier.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Handle Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setErrorMessage('New Password and Re-entered Password do not match.');
      return;
    }

    const rules = validatePasswordRules(resetForm.newPassword);
    if (!rules.length || !rules.lower || !rules.upper || !rules.special) {
      setErrorMessage('Password must be >8 characters and include uppercase, lowercase, and special characters.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({
        identifier: forgotIdentifier.trim(),
        newPassword: resetForm.newPassword,
        confirmPassword: resetForm.confirmPassword,
      });
      setSuccessMessage('Password has been reset successfully! You can now sign in with your new password.');
      setAuthMode('signin');
      setPassword('');
      setResetForm({ newPassword: '', confirmPassword: '' });
      setVerifiedUser(null);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#17212B] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans selection:bg-[#F8F0E6] selection:text-[#0B2A4A]">
      {/* Subtle Background Warm Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#EEF4F8] rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#F8F0E6] rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto">
        
        {/* Left Column: Brand Hero & System Overview */}
        <div className="lg:col-span-5 flex flex-col justify-between p-8 rounded-3xl bg-white border border-[#E3E7EA] shadow-xs relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            {/* Brand Logo & Title */}
            <div className="flex items-center space-x-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shadow-xs border border-[#E3E7EA] flex items-center justify-center">
                <img src="/logo.png" alt="Urban Furniture Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#0B2A4A] font-display">Urban Furniture</h1>
                <p className="text-xs text-[#667482] font-medium tracking-wide">Enterprise ERP & Accounting</p>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="space-y-3 pt-2">
              <h2 className="text-xl font-bold text-[#0B2A4A] font-display leading-snug">
                Precision Double-Entry Financial Management
              </h2>
              <p className="text-xs text-[#667482] leading-relaxed">
                Seamless real-time transactions, automated sales and purchase workflows, dynamic budget tracking, and balanced financial ledger reports.
              </p>
            </div>

            {/* System Highlights */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3 text-xs text-[#17212B] bg-[#FAFAF8] p-3 rounded-xl border border-[#E3E7EA]">
                <ShieldCheck className="w-4 h-4 text-[#18794E] shrink-0" />
                <span className="font-medium">Strict Double-Entry Balanced Ledger</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-[#17212B] bg-[#FAFAF8] p-3 rounded-xl border border-[#E3E7EA]">
                <CheckCircle2 className="w-4 h-4 text-[#0B2A4A] shrink-0" />
                <span className="font-medium">Real-Time Inventory & Stock Movement</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-[#17212B] bg-[#FAFAF8] p-3 rounded-xl border border-[#E3E7EA]">
                <CheckCircle2 className="w-4 h-4 text-[#C98232] shrink-0" />
                <span className="font-medium">Dynamic Budgets & Analytic Accounts</span>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-8 mt-6 border-t border-[#E3E7EA] flex items-center justify-between text-xs text-[#8A96A3]">
            <div className="flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-[#18794E]" />
              <span className="font-mono">MySQL Database</span>
            </div>
            <span className="font-medium">v1.0.0 Enterprise</span>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-7 bg-white border border-[#E3E7EA] rounded-3xl p-6 sm:p-10 shadow-xs flex flex-col justify-between space-y-6">
          
          {/* Form Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#0B2A4A] font-display">
                {authMode === 'signin' && 'Sign In to Your Account'}
                {authMode === 'signup' && 'Create Your Account'}
                {authMode === 'forgot' && 'Reset Password'}
                {authMode === 'reset' && 'Set New Password'}
              </h3>
              <p className="text-xs text-[#667482] mt-0.5">
                {authMode === 'signin' && 'Enter your Login ID or Email to continue'}
                {authMode === 'signup' && 'Register a new user in the system database'}
                {authMode === 'forgot' && 'Enter your Login ID or registered Email ID'}
                {authMode === 'reset' && 'Choose a secure password for your account'}
              </p>
            </div>
            
            {/* Live Backend Badge */}
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold border ${
              backendOnline
                ? 'bg-[#EAF7F0] border-[#E3E7EA] text-[#18794E]'
                : 'bg-[#FFF6DF] border-[#E3E7EA] text-[#B7791F]'
            }`}>
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-[#18794E] animate-pulse' : 'bg-[#B7791F]'}`}></span>
              <span>{backendOnline ? 'Backend Live' : 'Connecting...'}</span>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 bg-[#FDECEC] border border-[#B42318]/30 rounded-xl flex items-center space-x-2.5 text-xs text-[#B42318]">
              <AlertCircle className="w-4 h-4 text-[#B42318] shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="p-3.5 bg-[#EAF7F0] border border-[#18794E]/30 rounded-xl flex items-center space-x-2.5 text-xs text-[#18794E]">
              <CheckCircle2 className="w-4 h-4 text-[#18794E] shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17212B] block">Login ID / Email</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A96A3]" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Enter Login ID or Email"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FFFFFF] border border-[#E3E7EA] focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] rounded-xl text-xs text-[#17212B] placeholder:text-[#8A96A3] outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17212B] block">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A96A3]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-[#FFFFFF] border border-[#E3E7EA] focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] rounded-xl text-xs text-[#17212B] placeholder:text-[#8A96A3] outline-none transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A96A3] hover:text-[#17212B] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#0B2A4A] hover:bg-[#163B63] active:bg-[#071B31] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>SIGN IN</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </>
                  )}
                </button>
              </div>

              {/* Action Links: Forgot Password | Sign Up */}
              <div className="flex items-center justify-center space-x-3 pt-2 text-xs font-semibold text-[#667482]">
                <button
                  type="button"
                  onClick={() => { setAuthMode('forgot'); setErrorMessage(''); setSuccessMessage(''); }}
                  className="hover:text-[#0B2A4A] underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Forgot Password
                </button>
                <span className="text-[#E3E7EA]">|</span>
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setErrorMessage(''); setSuccessMessage(''); }}
                  className="text-[#0B2A4A] hover:text-[#C98232] underline underline-offset-2 font-bold transition-colors cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            </form>
          )}

          {/* 2. SIGN UP FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17212B] block">Login ID <span className="text-[#8A96A3] font-normal">(6–12 characters)</span></label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A96A3]" />
                  <input
                    type="text"
                    value={signupForm.loginId}
                    onChange={(e) => setSignupForm({ ...signupForm, loginId: e.target.value })}
                    placeholder="e.g. john_doe"
                    required
                    minLength={6}
                    maxLength={12}
                    className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] border border-[#E3E7EA] focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] rounded-xl text-xs text-[#17212B] placeholder:text-[#8A96A3] outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17212B] block">Email ID <span className="text-[#8A96A3] font-normal">(Unique in database)</span></label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A96A3]" />
                  <input
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    placeholder="name@company.com"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] border border-[#E3E7EA] focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] rounded-xl text-xs text-[#17212B] placeholder:text-[#8A96A3] outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#17212B] block">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A96A3]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      placeholder="Password"
                      required
                      className="w-full pl-10 pr-9 py-2 bg-[#FFFFFF] border border-[#E3E7EA] focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] rounded-xl text-xs text-[#17212B] placeholder:text-[#8A96A3] outline-none transition-all shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A96A3] hover:text-[#17212B]"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#17212B] block">Re-enter Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A96A3]" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      placeholder="Confirm"
                      required
                      className="w-full pl-10 pr-9 py-2 bg-[#FFFFFF] border border-[#E3E7EA] focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] rounded-xl text-xs text-[#17212B] placeholder:text-[#8A96A3] outline-none transition-all shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A96A3] hover:text-[#17212B]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Password Rules Indicator */}
              <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E3E7EA] space-y-1 text-[11px] text-[#667482]">
                <div className="font-semibold text-[#17212B]">Password Requirements:</div>
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <span className={`flex items-center space-x-1.5 ${currentPwdRules.length ? 'text-[#18794E] font-semibold' : 'text-[#8A96A3]'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> <span>&gt; 8 characters</span>
                  </span>
                  <span className={`flex items-center space-x-1.5 ${currentPwdRules.lower ? 'text-[#18794E] font-semibold' : 'text-[#8A96A3]'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> <span>Lowercase (a-z)</span>
                  </span>
                  <span className={`flex items-center space-x-1.5 ${currentPwdRules.upper ? 'text-[#18794E] font-semibold' : 'text-[#8A96A3]'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> <span>Uppercase (A-Z)</span>
                  </span>
                  <span className={`flex items-center space-x-1.5 ${currentPwdRules.special ? 'text-[#18794E] font-semibold' : 'text-[#8A96A3]'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> <span>Special char (!@#$)</span>
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#0B2A4A] hover:bg-[#163B63] active:bg-[#071B31] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>SIGN UP</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setErrorMessage(''); setSuccessMessage(''); }}
                  className="text-xs text-[#667482] hover:text-[#0B2A4A] underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Already have an account? <strong>Sign In</strong>
                </button>
              </div>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM (VERIFY ACCOUNT) */}
          {authMode === 'forgot' && (
            <form onSubmit={handleVerifyAccount} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17212B] block">Login ID or Email ID</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A96A3]" />
                  <input
                    type="text"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="Enter your Login ID or registered Email ID"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FFFFFF] border border-[#E3E7EA] focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] rounded-xl text-xs text-[#17212B] placeholder:text-[#8A96A3] outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#0B2A4A] hover:bg-[#163B63] active:bg-[#071B31] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying Account...</span>
                    </>
                  ) : (
                    <>
                      <span>VERIFY ACCOUNT</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setErrorMessage(''); setSuccessMessage(''); }}
                  className="text-xs text-[#667482] hover:text-[#0B2A4A] inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* 4. SET NEW PASSWORD FORM */}
          {authMode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3 bg-[#EEF4F8] border border-[#D8E1E8] rounded-xl text-xs text-[#0B2A4A]">
                Resetting password for: <strong>{verifiedUser?.name || forgotIdentifier}</strong>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17212B] block">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A96A3]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={resetForm.newPassword}
                    onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    required
                    autoFocus
                    className="w-full pl-10 pr-10 py-2.5 bg-[#FFFFFF] border border-[#E3E7EA] focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] rounded-xl text-xs text-[#17212B] placeholder:text-[#8A96A3] outline-none transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A96A3] hover:text-[#17212B]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17212B] block">Re-enter New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A96A3]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={resetForm.confirmPassword}
                    onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-[#FFFFFF] border border-[#E3E7EA] focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] rounded-xl text-xs text-[#17212B] placeholder:text-[#8A96A3] outline-none transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A96A3] hover:text-[#17212B]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#0B2A4A] hover:bg-[#163B63] active:bg-[#071B31] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>UPDATE PASSWORD</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setErrorMessage(''); setSuccessMessage(''); }}
                  className="text-xs text-[#667482] hover:text-[#0B2A4A] inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* System Security Notice */}
          <div className="pt-4 border-t border-[#E3E7EA] flex items-center justify-center space-x-2 text-xs text-[#8A96A3]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8A96A3]" />
            <span>Secure session authenticated via JWT and MySQL role-based access control.</span>
          </div>

        </div>

      </div>
    </div>
  );
}

