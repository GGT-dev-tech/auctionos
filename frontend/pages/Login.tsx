import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuctionService } from '../services/api';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@auctionpro.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Login to get token
      const { access_token } = await AuctionService.login(email, password);
      localStorage.setItem('token', access_token);

      // 2. Fetch User Profile
      const user = await AuctionService.getMe();
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Invalid credentials. Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-light dark:bg-background-dark relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100 dark:bg-blue-900/20 blur-3xl"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-slate-200 dark:bg-slate-800/30 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="px-8 pt-10 pb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6 text-slate-900 dark:text-white">
            <div className="size-8 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px]">gavel</span>
            </div>
            <h2 className="text-2xl font-bold leading-tight tracking-tight">AuctionPro</h2>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Please enter your details to sign in.</p>
        </div>

        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

            <label className="flex flex-col">
              <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal pb-2">Email Address</span>
              <input
                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white h-12 px-4 focus:ring-primary focus:border-primary"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="flex flex-col">
              <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal pb-2">Password</span>
              <input
                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white h-12 px-4 focus:ring-primary focus:border-primary"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
                <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-primary text-sm font-bold hover:underline">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <span>{isLoading ? 'Logging in...' : 'Log In'}</span>
              {!isLoading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </form>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase tracking-wider">Or continue with</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button type="button" className="flex items-center justify-center h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors gap-3">
              <span className="text-slate-700 dark:text-slate-200 text-sm font-semibold">Google</span>
            </button>
            <button type="button" className="flex items-center justify-center h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors gap-3">
              <span className="text-slate-700 dark:text-slate-200 text-sm font-semibold">Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};