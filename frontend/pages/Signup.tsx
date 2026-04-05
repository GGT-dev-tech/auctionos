import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { API_URL } from '../services/httpClient';

export const Signup: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            // Assuming register endpoint exists. Adjust according to actual backend API route for registration.
            // Usually, this would hit POST /api/v1/users (or auth/register) and return the new user or a standard token payload
            const payload = {
                email: formData.email,
                password: formData.password,
                full_name: formData.fullName,
                role: "client" // Enforce client role on signup
            };

            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Registration failed");
            }

            // Auto-login after successful registration
            const { access_token } = await AuthService.login(formData.email, formData.password);
            localStorage.setItem('token', access_token);

            const user = await AuthService.getMe();
            localStorage.setItem('user', JSON.stringify(user));

            navigate('/client');

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background-light dark:bg-background-dark relative overflow-hidden">
            {/* Abstract Background */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100 dark:bg-blue-900/20 blur-3xl"></div>
                <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-slate-200 dark:bg-slate-800/30 blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="px-8 pt-10 pb-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6 text-slate-900 dark:text-white cursor-pointer" onClick={() => navigate('/')}>
                        <div className="size-8 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-[32px]">gavel</span>
                        </div>
                        <h2 className="text-2xl font-bold leading-tight tracking-tight">GoAuct</h2>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Join to access exclusive property auctions.</p>
                </div>

                <div className="px-8 pb-8">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {error && <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/10 p-2 rounded">{error}</div>}

                        <label className="flex flex-col">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal pb-1">Full Name</span>
                            <input
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white h-11 px-4 focus:ring-primary focus:border-primary"
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                            />
                        </label>

                        <label className="flex flex-col">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal pb-1">Email Address</span>
                            <input
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white h-11 px-4 focus:ring-primary focus:border-primary"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                                required
                            />
                        </label>

                        <label className="flex flex-col">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal pb-1">Password</span>
                            <input
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white h-11 px-4 focus:ring-primary focus:border-primary"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                minLength={8}
                            />
                        </label>

                        <label className="flex flex-col">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal pb-1">Confirm Password</span>
                            <input
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white h-11 px-4 focus:ring-primary focus:border-primary"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                minLength={8}
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
                        >
                            <span>{isLoading ? 'Creating account...' : 'Sign Up'}</span>
                            {!isLoading && <span className="material-symbols-outlined text-[18px]">person_add</span>}
                        </button>

                        <div className="text-center mt-2">
                            <span className="text-slate-600 dark:text-slate-400 text-sm">Already have an account? </span>
                            <Link to="/login" className="text-primary text-sm font-bold hover:underline">Log in</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
