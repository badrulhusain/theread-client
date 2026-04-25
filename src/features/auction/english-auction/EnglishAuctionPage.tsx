import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronDown } from 'lucide-react';
import axios from 'axios';

type Tab = 'Home' | 'Confirm' | 'Summary';

export const EnglishAuction: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [resolvedId, setResolvedId] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<Tab>('Home');
    const [totalBid, setTotalBid] = useState<number | null>(null);

    useEffect(() => {
        const resolveId = async () => {
            if (!id) return;
            const token = localStorage.getItem('token') || localStorage.getItem('team_token');
            const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

            try {
                // Try fetching directly first
                const response = await axios.get(`${baseUrl}/auction/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'x-auction-id': id }
                });
                const auctionData = response.data;
                setResolvedId(id);
                // If we're on the UUID URL but a subdomain exists, redirect to slug URL
                if (auctionData.subdomain && id === auctionData.id) {
                    navigate(`/admin/auction/${auctionData.subdomain}/english-auction${window.location.search}`, { replace: true });
                }
            } catch (err) {
                // Not a UUID or not found, try slug match
                try {
                    const res = await axios.get(`${baseUrl}/auction`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const auctions = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                    const matched = auctions.find((a: any) => a.subdomain === id || a.id === id);
                    if (matched) {
                        setResolvedId(matched.id);
                        // If we're on the UUID URL but a subdomain exists, redirect to slug URL
                        if (matched.subdomain && id === matched.id) {
                            navigate(`/admin/auction/${matched.subdomain}/english-auction${window.location.search}`, { replace: true });
                        }
                    }
                } catch (e) {
                    console.error("Failed to resolve auction ID:", e);
                }
            }
        };
        resolveId();
    }, [id]);

    // Hardcoded for now based on UI design
    const sessionName = "Session Name";
    const sessionId = "564fd54f5df45";
    const basePrice = 20;

    const handlePercentageClick = (percentage: number) => {
        const increase = basePrice * (percentage / 100);
        setTotalBid(basePrice + increase);
    };

    const renderHomeTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-12 animate-in fade-in duration-500">
            {/* Left Column - Profile/Info */}
            <div className="lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="mb-2 w-full text-left">
                    <p className="text-[12px] font-medium text-black/50 mb-1">{sessionId}</p>
                    <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter mb-4">{sessionName}</h1>

                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border-[1.5px] border-[#D9A55B]/40 bg-[#FFF5D1] shadow-sm mb-12">
                        <Clock className="w-4 h-4 text-[#8C6010]" />
                        <span className="text-[14px] font-bold text-[#8C6010]">09:00</span>
                    </div>
                </div>

                <div className="flex flex-col items-center text-center">
                    {/* Large Yellow Circle Avatar */}
                    <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-[#F2F1CA] mb-6 shadow-sm"></div>

                    <h2 className="text-[28px] font-black text-black leading-none mb-1">Lukuman</h2>
                    <p className="text-[15px] font-medium text-black/70 italic mb-4">Degree Final Year</p>
                    <p className="text-[16px] font-bold text-black border-t-[1.5px] border-black/10 pt-4 px-4">
                        Base Price : <span className="font-black">{basePrice} Crore</span>
                    </p>
                </div>
            </div>

            {/* Middle Column - Form */}
            <div className="lg:col-span-5 flex flex-col justify-center items-center mt-20 lg:mt-32">
                <div className="w-full max-w-[420px] bg-white border-[1.5px] border-black rounded-[32px] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.06)] relative">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <button
                            onClick={() => handlePercentageClick(5)}
                            className="h-[48px] rounded-full border-[1px] border-black/20 bg-[#F2F1CA] hover:bg-[#e8e7ba] transition-colors text-black font-bold text-[18px] focus:outline-none"
                        >
                            5%
                        </button>
                        <button
                            onClick={() => handlePercentageClick(10)}
                            className="h-[48px] rounded-full border-[1px] border-black/20 bg-[#F2F1CA] hover:bg-[#e8e7ba] transition-colors text-black font-bold text-[18px] focus:outline-none"
                        >
                            10%
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <button
                            onClick={() => handlePercentageClick(15)}
                            className="h-[48px] rounded-full border-[1px] border-black/20 bg-[#F2F1CA] hover:bg-[#e8e7ba] transition-colors text-black font-bold text-[18px] focus:outline-none"
                        >
                            15%
                        </button>
                        <button
                            onClick={() => handlePercentageClick(20)}
                            className="h-[48px] rounded-full border-[1px] border-black/20 bg-[#F2F1CA] hover:bg-[#e8e7ba] transition-colors text-black font-bold text-[18px] focus:outline-none"
                        >
                            20%
                        </button>
                    </div>
                    <div className="mb-6">
                        <div className="flex justify-center items-center w-full h-[54px] rounded-full border-[1.5px] border-black bg-white text-black font-medium text-[18px]">
                            {totalBid !== null ? `${totalBid} Crore` : 'total'}
                        </div>
                    </div>

                    <button className="w-full h-[58px] bg-[#FF6B6B] hover:bg-[#ff5252] text-white font-semibold text-[18px] tracking-wide rounded-[20px] shadow-[0_8px_20px_rgba(255,107,107,0.3)] transition-all active:translate-y-[2px]">
                        Confirm Bid
                    </button>
                </div>
            </div>

            {/* Right Column - Bids */}
            <div className="lg:col-span-4 mt-12 lg:mt-48">
                <div className="flex justify-between items-center px-4 mb-4">
                    <span className="text-[14px] font-bold text-black uppercase tracking-wide">Bid</span>
                    <span className="text-[14px] font-bold text-black uppercase tracking-wide">Current Highest Bid</span>
                </div>

                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex justify-between items-center w-full h-[54px] px-6 bg-white border-[1.5px] border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.08)] transition-all cursor-default">
                            <span className="text-[14px] font-semibold text-black w-1/3">Team</span>
                            <span className="text-[14px] font-semibold text-black w-1/3 text-center">Name</span>
                            <span className="text-[14px] font-semibold text-black/60 w-1/3 text-right">Bid amount</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderConfirmTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12 mb-20 animate-in fade-in duration-500 max-w-5xl mx-auto">
            {/* Left Column - Profile/Info */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="mb-2 w-full text-left">
                    <p className="text-[12px] font-medium text-black/50 mb-1">{sessionId}</p>
                    <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter mb-4">{sessionName}</h1>

                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border-[1.5px] border-[#D9A55B]/40 bg-[#FFF5D1] shadow-sm mb-12">
                        <Clock className="w-4 h-4 text-[#8C6010]" />
                        <span className="text-[14px] font-bold text-[#8C6010]">09:00</span>
                    </div>
                </div>

                <div className="flex flex-col items-center text-center max-w-[300px]">
                    {/* Large Yellow Circle Avatar */}
                    <div className="w-48 h-48 sm:w-80 sm:h-80 rounded-full bg-[#F2F1CA] mb-6 shadow-sm"></div>
                </div>
            </div>

            {/* Right Column - Confirm Card */}
            <div className="flex flex-col justify-center items-center lg:items-end mt-12 lg:mt-32">
                <div className="w-full max-w-[480px] bg-white border-[1.5px] border-black rounded-[32px] p-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)] relative flex flex-col items-center text-center">
                    <h2 className="text-[28px] font-black text-black leading-none mb-4">Lukuman</h2>
                    <p className="text-[16px] font-medium text-black/70 italic mb-6">Degree Final Year</p>

                    <p className="text-[16px] font-medium text-black mb-1">Base Price :</p>
                    <p className="text-[24px] font-black text-black mb-8">20 Crore</p>

                    <button className="w-full max-w-[220px] h-[54px] bg-black hover:bg-black/80 text-white font-bold text-[18px] tracking-wide rounded-[20px] shadow-lg transition-all active:translate-y-[2px]">
                        Confirmed
                    </button>
                </div>
            </div>
        </div>
    );

    const renderSummaryTab = () => (
        <div className="mt-16 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">

            {/* Top Stats */}
            <div className="flex flex-wrap justify-between items-start gap-8 mb-20">

                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F2F1CA] border border-black/10 flex items-center justify-center shadow-sm">
                        <span className="text-2xl sm:text-[32px] font-black text-black">20</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[15px] sm:text-[17px] font-medium text-black leading-tight">Selected</span>
                        <span className="text-[15px] sm:text-[17px] font-medium text-black leading-tight">Candidates</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F2F1CA] border border-black/10 flex items-center justify-center shadow-sm">
                        <span className="text-2xl sm:text-[32px] font-black text-black">48</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[15px] sm:text-[17px] font-medium text-black leading-tight">Current</span>
                        <span className="text-[15px] sm:text-[17px] font-medium text-black leading-tight">Budget</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F2F1CA] border border-black/10 flex items-center justify-center shadow-sm">
                        <span className="text-2xl sm:text-[32px] font-black text-black">50</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[15px] sm:text-[17px] font-medium text-black leading-tight">Spent</span>
                        <span className="text-[15px] sm:text-[17px] font-medium text-black leading-tight">Budget</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F2F1CA] border border-black/10 flex items-center justify-center shadow-sm">
                        <span className="text-2xl sm:text-[32px] font-black text-black">50</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[15px] sm:text-[17px] font-medium text-black leading-tight">Total</span>
                        <span className="text-[15px] sm:text-[17px] font-medium text-black leading-tight">Players</span>
                    </div>
                </div>

            </div>

            {/* Table Section */}
            <div>
                <h3 className="text-[20px] sm:text-[24px] font-black text-black mb-6">Selected Candidates</h3>

                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex justify-between items-center w-full h-[64px] px-8 bg-white border-[1.5px] border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.08)] transition-all cursor-default">
                            <span className="text-[15px] font-semibold text-black w-1/3">Reg no</span>
                            <span className="text-[15px] font-bold text-black uppercase w-1/3 text-center tracking-wide">CONTESTANT Name</span>
                            <span className="text-[15px] font-semibold text-black/80 w-1/3 text-right">Bid Amount</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );

    return (
        <div className="min-h-screen bg-[#FFFDF8] font-['Clash Grotesk',sans-serif] selection:bg-[#FF6B6B] selection:text-white overflow-x-hidden">

            {/* Top Header */}
            <header className="px-6 sm:px-12 py-5 flex justify-between items-center max-w-[1400px] mx-auto">

                {/* Left Toggle Tabs */}
                <div className="flex items-center bg-white border-[1px] border-black/20 rounded-full p-1 shadow-sm">
                    <button
                        onClick={() => setActiveTab('Home')}
                        className={`px-5 py-1.5 rounded-full text-[13px] font-bold transition-all ${activeTab === 'Home'
                            ? 'bg-[#FF6B6B] text-white shadow-sm'
                            : 'text-black/60 hover:text-black'
                            }`}
                    >
                        Home
                    </button>
                    <button
                        onClick={() => setActiveTab('Confirm')}
                        className={`px-5 py-1.5 rounded-full text-[13px] font-bold transition-all ${activeTab === 'Confirm'
                            ? 'bg-[#FF6B6B] text-white shadow-sm'
                            : 'text-black/60 hover:text-black'
                            }`}
                    >
                        Confirm
                    </button>
                    <button
                        onClick={() => setActiveTab('Summary')}
                        className={`px-5 py-1.5 rounded-full text-[13px] font-bold transition-all ${activeTab === 'Summary'
                            ? 'bg-[#FF6B6B] text-white shadow-sm'
                            : 'text-black/60 hover:text-black'
                            }`}
                    >
                        Summary
                    </button>
                </div>

                {/* Right User Area */}
                <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center border border-black/10">
                        <span className="text-[11px] font-black text-black">LT</span>
                    </div>
                    <span className="text-[14px] font-bold text-black">Lukuman</span>
                    <ChevronDown className="w-5 h-5 text-black group-hover:translate-y-0.5 transition-transform" />
                </div>

            </header>

            {/* Main Content Area */}
            <main className="px-6 sm:px-12 max-w-[1400px] mx-auto">
                {activeTab === 'Home' && renderHomeTab()}
                {activeTab === 'Confirm' && renderConfirmTab()}
                {activeTab === 'Summary' && renderSummaryTab()}
            </main>

        </div>
    );
};
