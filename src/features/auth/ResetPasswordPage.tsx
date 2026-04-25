import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

export const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        const token = searchParams.get('token');
        if (!token) {
            toast.error('Invalid or missing reset token.');
            return;
        }

        try {
            setIsLoading(true);
            const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

            const response = await fetch(`${baseUrl}/auth/admin/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword: password }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to reset password');
            }

            toast.success('message-password changed');
            setTimeout(() => {
                navigate('/login');
            }, 1000);
        } catch (error: any) {
            toast.error(error.message || 'Error changing password');
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

                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-bold text-black tracking-wide">
                            New Password
                        </h2>
                        <p className="mt-2 text-black/60 text-[14px]">
                            Please create a new password that you don't use on any other site.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleResetPassword}>
                        {/* New Password Field */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[14px] font-semibold text-black pl-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full h-[52px] pl-6 pr-12 bg-white focus:bg-white rounded-full text-[15px] font-medium text-black placeholder:text-black/40 focus:outline-none border border-black/10 focus:border-black/30 transition-all shadow-sm"
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
                        <div className="flex flex-col gap-2">
                            <label className="text-[14px] font-semibold text-black pl-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full h-[52px] pl-6 pr-12 bg-white focus:bg-white rounded-full text-[15px] font-medium text-black placeholder:text-black/40 focus:outline-none border border-black/10 focus:border-black/30 transition-all shadow-sm"
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-[52px] mt-4 bg-[#E76F6F] hover:bg-[#d45d5d] text-white font-bold text-[16px] rounded-full active:translate-y-0 transition-all duration-300 flex justify-center items-center disabled:opacity-75"
                        >
                            {isLoading ? 'Changing..' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
