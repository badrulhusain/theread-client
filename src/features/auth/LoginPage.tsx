import { useState } from 'react';
import { Link, useNavigate, BrowserRouter } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';



export const LoginPage = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
            const response = await fetch(`${baseUrl}/auth/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json().catch(() => null);
            if (data?.token) {
                localStorage.setItem('token', data.token); // Optionally save a token if returned
            } else if (data?.access_token) {
                localStorage.setItem('token', data.access_token);
            }

            if (data?.user?.name) {
                localStorage.setItem('userName', data.user.name);
            } else if (data?.admin?.name) {
                localStorage.setItem('userName', data.admin.name);
            } else if (data?.name) {
                localStorage.setItem('userName', data.name);
            } else {
                if (data?.access_token) {
                    try {
                        const payload = JSON.parse(atob(data.access_token.split('.')[1]));
                        if (payload.name) {
                            localStorage.setItem('userName', payload.name);
                        } else if (payload.sub) {
                            try {
                                const profileRes = await fetch(`${baseUrl}/admin/${payload.sub}`, {
                                    headers: { 'Authorization': `Bearer ${data.access_token}` },
                                });
                                if (profileRes.ok) {
                                    const profileData = await profileRes.json();
                                    if (profileData?.name) {
                                        localStorage.setItem('userName', profileData.name);
                                    } else {
                                        localStorage.setItem('userName', payload.username || 'Admin');
                                    }
                                } else {
                                    localStorage.setItem('userName', payload.username || 'Admin');
                                }
                            } catch (err) {
                                console.error('Error fetching profile', err);
                                localStorage.setItem('userName', payload.username || 'Admin');
                            }
                        } else if (payload.username) {
                            localStorage.setItem('userName', payload.username);
                        }
                    } catch (e) {
                        console.error("Could not decode token", e);
                    }
                }
            }

            toast.success('Login successful! Redirecting...');

            setTimeout(() => {
                navigate('/admin/dashboard');
            }, 1000);

        } catch (error: any) {
            toast.error(error.message || 'An error occurred during login');
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
            <div className="w-full lg:w-[35%] bg-[#FFFFff] shadow-[-10px_0_40px_rgba(0,0,0,0.2)] flex flex-col justify-center items-center relative z-10 px-8 py-16 lg:py-0 min-h-screen lg:min-h-0 overflow-hidden transition-all duration-500">
                {/* Decorative Sparkle */}


                <div className="w-full max-w-[380px] mx-auto z-10 flex flex-col pt-8 lg:pt-0">
                    {/* Logo Section */}
                    <div className="mb-10 text-center flex justify-center">
                        <img src="/Logo+name.png" alt="Logo" className="h-[60px] object-contain drop-shadow-sm" />
                    </div>

                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-bold text-black tracking-wide">
                            Sign In
                        </h2>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div className="flex flex-col gap-2">
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
                        <div className="flex flex-col gap-2">
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

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-[52px] mt-4 bg-[#198754] hover:bg-[#146c43] text-white font-bold text-[16px] rounded-full active:translate-y-0 transition-all duration-300 flex justify-center items-center shadow-[0_4px_14px_0_rgba(25,135,84,0.39)] hover:shadow-[0_6px_20px_0_rgba(25,135,84,0.23)] disabled:opacity-75"
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-8 flex items-center justify-center gap-4">
                        <div className="h-px bg-black/15 flex-1"></div>
                        <span className="text-[11px] font-semibold text-black/50 tracking-[0.05em] uppercase">
                            Or Continue With
                        </span>
                        <div className="h-px bg-black/15 flex-1"></div>
                    </div>

                    {/* Google Button */}
                    <button className="w-full h-[52px] bg-transparent border-[1.5px] border-black text-black  text-[15px] rounded-full hover:bg-black/5 transition-colors flex justify-center items-center gap-3">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <p className="text-center text-black mt-8 text-[14px] font-medium">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-[#198754] font-semibold hover:text-[#146c43] transition-colors hover:underline underline-offset-4">
                            Register Here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

// Default export wrapper required for the preview environment to render properly,
// while keeping your named `export const LoginPage` intact for your local router.tsx
export default function App() {
    return (
        <BrowserRouter>
            <LoginPage />
        </BrowserRouter>
    );
}