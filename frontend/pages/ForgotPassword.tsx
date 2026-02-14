import React from 'react';
import { Link } from 'react-router-dom';

export const ForgotPassword: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-light dark:bg-background-dark font-display">
       <div className="w-full max-w-[480px]">
          <div className="mb-6">
             <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span> Back to Login
             </Link>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 sm:p-10">
             <div className="flex flex-col items-center text-center mb-8">
                <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                   <span className="material-symbols-outlined text-[32px]">lock_reset</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Forgot Password?</h1>
                <p className="text-slate-500 dark:text-slate-400">Enter your email to receive a password reset link.</p>
             </div>
             <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-2">
                   <label className="text-slate-900 dark:text-white text-sm font-semibold">Email Address</label>
                   <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                         <span className="material-symbols-outlined text-[20px]">mail</span>
                      </span>
                      <input className="w-full rounded-lg pl-10 h-12 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50" type="email" placeholder="name@company.com" required />
                   </div>
                </div>
                <button className="w-full h-12 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm">Send Reset Link</button>
             </form>
          </div>
       </div>
    </div>
  );
};