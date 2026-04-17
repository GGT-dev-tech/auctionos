import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { API_URL } from '../services/httpClient';

type SignupMode = 'investor' | 'consultant';

export const Signup: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const defaultMode = (searchParams.get('role') === 'consultant' ? 'consultant' : 'investor') as SignupMode;

    const [mode, setMode] = useState<SignupMode>(defaultMode);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const role = mode === 'consultant' ? 'consultant' : 'client';
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    full_name: formData.fullName,
                    role,
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || 'Registration failed');
            }

            // Auto-login after registration
            const loginFn = mode === 'consultant' ? AuthService.loginConsultant : AuthService.login;
            const { access_token } = await loginFn(formData.email, formData.password);
            localStorage.setItem('token', access_token);

            const user = await AuthService.getMe();
            localStorage.setItem('user', JSON.stringify(user));

            if (mode === 'consultant') {
                navigate('/consultant');
            } else {
                navigate('/client');
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const isConsultant = mode === 'consultant';
    const gradientClass = isConsultant
        ? 'from-emerald-500 to-teal-600'
        : 'from-blue-600 to-indigo-600';
    const btnClass = isConsultant
        ? 'bg-emerald-600 hover:bg-emerald-700'
        : 'bg-primary hover:bg-blue-700';

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#070d1a] relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className={`absolute top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-3xl opacity-25 ${isConsultant ? 'bg-emerald-200 dark:bg-emerald-900' : 'bg-blue-100 dark:bg-blue-900/20'}`} />
                <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-slate-200 dark:bg-slate-800/30 blur-3xl opacity-40" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">

                    {/* Header Gradient */}
                    <div className={`px-8 pt-8 pb-5 bg-gradient-to-br ${gradientClass} text-center cursor-pointer`} onClick={() => navigate('/')}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-white text-[28px]">
                                {isConsultant ? 'handshake' : 'gavel'}
                            </span>
                            <span className="text-white font-extrabold text-xl">GoAuct</span>
                        </div>
                        <h1 className="text-white font-bold text-lg">
                            {isConsultant ? 'Consultant Partner Registration' : 'Create Your Investor Account'}
                        </h1>
                        <p className="text-white/70 text-xs mt-1">
                            {isConsultant
                                ? 'Join the partner network — access listings, tasks & commissions'
                                : 'Access tax deed auctions and AI-powered deal intelligence'}
                        </p>
                    </div>

                    {/* Mode Tabs */}
                    <div className="flex border-b border-slate-100 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={() => { setMode('investor'); setError(''); }}
                            className={`flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-1.5 ${
                                mode === 'investor'
                                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[15px]">trending_up</span>
                            Investor
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode('consultant'); setError(''); }}
                            className={`flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-1.5 ${
                                mode === 'consultant'
                                    ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[15px]">handshake</span>
                            Consultant Partner
                        </button>
                    </div>

                    <div className="px-8 py-7">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {error && (
                                <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 p-3 rounded-xl">
                                    {error}
                                </div>
                            )}

                            {/* Full Name */}
                            <label className="flex flex-col gap-1.5">
                                <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Full Name</span>
                                <input
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white h-11 px-4 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder={isConsultant ? 'Your full name' : 'John Doe'}
                                    required
                                />
                            </label>

                            {/* Email */}
                            <label className="flex flex-col gap-1.5">
                                <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Email Address</span>
                                <input
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white h-11 px-4 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={isConsultant ? 'partner@email.com' : 'john@example.com'}
                                    required
                                />
                            </label>

                            {/* Password */}
                            <label className="flex flex-col gap-1.5">
                                <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Password</span>
                                <input
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white h-11 px-4 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                />
                            </label>

                            {/* Confirm Password */}
                            <label className="flex flex-col gap-1.5">
                                <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Confirm Password</span>
                                <input
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white h-11 px-4 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                />
                            </label>

                            {/* Consultant Info Banner */}
                            {isConsultant && (
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 flex gap-2">
                                    <span className="material-symbols-outlined text-emerald-600 text-[18px] mt-0.5 shrink-0">info</span>
                                    <p className="text-xs text-emerald-800 dark:text-emerald-300">
                                        Your account will be created with <strong>Consultant role</strong>. After registration, your profile will be reviewed and you'll be verified as a GoAuct Partner.
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full h-11 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 mt-1 disabled:opacity-70 ${btnClass}`}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                        Creating account…
                                    </>
                                ) : (
                                    <>
                                        {isConsultant ? 'Register as Consultant' : 'Create Investor Account'}
                                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                                    </>
                                )}
                            </button>

                            <div className="text-center mt-1">
                                <span className="text-slate-500 dark:text-slate-400 text-sm">Already have an account? </span>
                                <Link
                                    to={isConsultant ? '/login?mode=consultant' : '/login'}
                                    className={`text-sm font-bold hover:underline ${isConsultant ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'}`}
                                >
                                    Sign in
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
