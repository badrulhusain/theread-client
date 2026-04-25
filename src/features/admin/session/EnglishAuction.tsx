import React from 'react';
import { ArrowLeft, Clock, Loader2, Play } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

interface EnglishAuctionProps {
    sessionId: string;
    auctionId: string;
    onBack: () => void;
}

const EnglishAuction: React.FC<EnglishAuctionProps> = ({ sessionId, onBack }) => {
    return (
        <div className="animate-in fade-in duration-500 text-left">
            <Toaster position="top-center" />

            <div className="flex flex-col gap-8 mb-10">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-between items-start sm:items-center">
                    <div className="flex items-start sm:items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-3 bg-white border border-black/10 rounded-2xl hover:bg-gray-50 transition-all shadow-sm shrink-0"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FEF9C3] border-[1.5px] border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0">
                                    <Clock className="w-5 h-5 sm:w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-[24px] sm:text-[32px] font-black tracking-tight leading-none break-all">English Auction</h1>
                                    <p className="text-xs sm:text-sm text-black/40 font-medium italic">#{sessionId} â€¢ Live Bidding Session</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
                        <button className="px-4 sm:px-6 py-2.5 bg-black text-white border-[1.5px] border-black rounded-xl text-[11px] sm:text-xs font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 flex-1 sm:flex-none justify-center">
                            <Play className="w-3 h-3 sm:w-4 sm:h-4 fill-white" /> Start Live Bidding
                        </button>
                    </div>
                </div>
            </div>

            <div className="py-20 sm:py-32 flex flex-col items-center justify-center gap-4 bg-white border-[1.5px] border-black rounded-[2.5rem] sm:rounded-[3rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] mx-4 sm:mx-0">
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-black/10" />
                <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-black/20 text-center px-4">English Auction Dashboard Coming Soon...</p>
            </div>
        </div>
    );
};

export default EnglishAuction;
