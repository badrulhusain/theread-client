import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSendLink = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

            // Request backend to generate and send a reset token
            const response = await fetch(`${baseUrl}/auth/admin/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error('account not registered');
            }

            // Email sent successfully
            setIsSent(true);
            toast.success('Reset link sent to your email!');
        } catch (error: any) {
            toast.error(error.message || 'account not registered');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-['Clash_Grotesk',sans-serif] selection:bg-[#FF8A8A] selection:text-white">
            <Toaster position="top-center" />
            {/* Left Side - Brand Area */}
            <div className="hidden lg:flex lg:w-[65%] flex-col justify-center items-center relative p-12 overflow-hidden bg-white">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-50 rounded-full blur-3xl opacity-50"></div>
            </div>

            {/* Right Side - Form Panel */}
            <div className="w-full lg:w-[35%] bg-[#F2F3D9] lg:rounded-tl-[8rem] lg:rounded-bl-[8rem] shadow-[-10px_0_40px_rgba(0,0,0,0.03)] flex flex-col justify-center items-center relative z-10 px-8 py-16 lg:py-0 min-h-screen lg:min-h-0 overflow-hidden transition-all duration-500">
                <div className="w-full max-w-[380px] mx-auto z-10 flex flex-col pt-8 lg:pt-0">
                    {/* Mobile Header */}
                    <div className="lg:hidden mb-10 text-center">
                        <h1 className="text-4xl font-black text-black tracking-tighter">
                            BidSphere<span className="text-[#FF8A8A]">.</span>
                        </h1>
                    </div>

                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-bold text-black tracking-wide">
                            Reset Password
                        </h2>
                    </div>

                    {!isSent ? (
                        <form className="space-y-5" onSubmit={handleSendLink}>
                            {/* Email Field */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[14px] font-semibold text-black pl-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full h-[52px] px-6 bg-white focus:bg-white rounded-full text-[15px] font-medium text-black placeholder:text-black/40 focus:outline-none border border-black/10 focus:border-black/30 transition-all shadow-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-[52px] mt-4 bg-[#E76F6F] hover:bg-[#d45d5d] text-white font-bold text-[16px] rounded-full active:translate-y-0 transition-all duration-300 flex justify-center items-center disabled:opacity-75"
                            >
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center bg-white/50 p-6 rounded-3xl border border-black/5">
                            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-black mb-2">Check your email</h3>
                            <p className="text-black/60 text-[15px] leading-relaxed">
                                We've sent a password reset link to <span className="font-semibold text-black">{email}</span>. Please check your inbox.
                            </p>
                        </div>
                    )}

                    <p className="text-center text-black mt-8 text-[14px] font-medium">
                        Remember your password?{' '}
                        <Link to="/login" className="text-[#E76F6F] font-semibold hover:text-[#d45d5d] transition-colors hover:underline underline-offset-4">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
