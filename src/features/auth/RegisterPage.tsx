import React, { useState } from 'react';
import { Link, useNavigate, BrowserRouter } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        try {
            setIsLoading(true);
            const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
            const response = await fetch(`${baseUrl}/auth/admin/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, username: email, email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Registration failed');
            }

            // Login immediately after successful registration
            const loginResponse = await fetch(`${baseUrl}/auth/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: email, password }),
            });

            if (loginResponse.ok) {
                const loginData = await loginResponse.json().catch(() => null);
                if (loginData?.token) {
                    localStorage.setItem('token', loginData.token);
                } else if (loginData?.access_token) {
                    localStorage.setItem('token', loginData.access_token);
                }
            }

            localStorage.setItem('userName', name);

            toast.success('Registration successful! Redirecting...');

            setTimeout(() => {
                navigate('/admin/dashboard');
            }, 1500);
            const data = await response.json().catch(() => null);
            let token = data?.token || data?.access_token;

            if (!token) {
                // Auto-login if no token in register response
                try {
                    const loginResponse = await fetch(`${baseUrl}/auth/admin/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: email, password }),
                    });

                    if (loginResponse.ok) {
                        const loginData = await loginResponse.json();
                        token = loginData?.token || loginData?.access_token;
                    }
                } catch (loginError) {
                    console.error("Auto-login failed:", loginError);
                }
            }

            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('userName', name);
                toast.success('Registration and Login successful!');
                setTimeout(() => {
                    navigate('/admin/dashboard');
                }, 1000);
            } else {
                // If even auto-login fails, we must ask them to login
                toast.success('Registration successful! Please login.');
                localStorage.setItem('userName', name);
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            }

        } catch (error: any) {
            toast.error(error.message || 'An error occurred during registration');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-['Clash Grotesk',sans-serif] selection:bg-[#198754] selection:text-white">
            <Toaster position="top-center" />
            {/* Left Side - Brand Area */}
            <div
                className="hidden lg:flex lg:w-[65%] flex-col justify-center items-center relative p-12 overflow-hidden bg-white bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/Bg-artic.png')" }}
            >
            </div>

            {/* Right Side - Form Panel */}
            <div className="w-full lg:w-[35%] bg-[#FFFF12]  shadow-[-10px_0_40px_rgba(0,0,0,0.2)] flex flex-col justify-center items-center relative z-10 px-8 py-10 lg:py-0 min-h-screen lg:min-h-0 overflow-hidden transition-all duration-500">
                <div className="w-full max-w-[380px] mx-auto z-10 flex flex-col pt-4 lg:pt-0">
                    {/* Logo Section */}
                    <div className="mb-6 text-center flex justify-center">
                        <img src="/Logo+name.png" alt="Logo" className="h-[60px] object-contain drop-shadow-sm" />
                    </div>

                    <div className="mb-6 text-center">
                        <h2 className="text-3xl font-bold text-black tracking-wide uppercase">
                            Sign Up
                        </h2>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* Full Name Field */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[14px] font-semibold text-black pl-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full h-[52px] px-6 bg-white focus:bg-white rounded-full text-[15px] font-medium text-black placeholder:text-black/40 focus:outline-none border border-black/10 focus:border-[#198754] focus:ring-2 focus:ring-[#C6A75E]/20 transition-all shadow-sm"
                            />
                        </div>

                        {/* Email Field */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[14px] font-semibold text-black pl-1">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full h-[52px] px-6 bg-white focus:bg-white rounded-full text-[15px] font-medium text-black placeholder:text-black/40 focus:outline-none border border-black/10 focus:border-[#198754] focus:ring-2 focus:ring-[#C6A75E]/20 transition-all shadow-sm"
                            />
                        </div>

                        {/* Password Field */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[14px] font-semibold text-black pl-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full h-[52px] pl-6 pr-12 bg-white focus:bg-white rounded-full text-[15px] font-medium text-black placeholder:text-black/40 focus:outline-none border border-black/10 focus:border-[#198754] focus:ring-2 focus:ring-[#C6A75E]/20 transition-all shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-black/50 hover:text-black transition-colors"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                                            <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[14px] font-semibold text-black pl-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full h-[52px] pl-6 pr-12 bg-white focus:bg-white rounded-full text-[15px] font-medium text-black placeholder:text-black/40 focus:outline-none border border-black/10 focus:border-[#198754] focus:ring-2 focus:ring-[#C6A75E]/20 transition-all shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-black/50 hover:text-black transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                                            <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Register Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-[52px] mt-6 bg-[#198754] hover:bg-[#146c43] text-white font-bold text-[16px] rounded-full shadow-[0_4px_14px_0_rgba(25,135,84,0.39)] hover:shadow-[0_6px_20px_0_rgba(25,135,84,0.23)] active:translate-y-0 transition-all duration-300 flex justify-center items-center disabled:opacity-75 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                        >
                            {isLoading ? 'Registering...' : 'Register'}
                        </button>
                    </form>

                    <p className="text-center text-black mt-6 text-[14px] font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="text-[#198754] font-semibold hover:text-[#146c43] transition-colors hover:underline underline-offset-4">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

// Default export wrapper required for the preview environment to render properly,
// while keeping your named `export const RegisterPage` intact for your local router.tsx
export default function App() {
    return (
        <BrowserRouter>
            <RegisterPage />
        </BrowserRouter>
    );
}