import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus,
    Loader2,
    Layers,
    Play,

    Clock,
    TrendingUp,
    X
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useParams } from 'react-router-dom';

interface Session {
    id: string;
    name: string;
    session_number: number;
    status: 'ACTIVE' | 'PENDING' | 'COMPLETED';
    group_id: string;
    auction_id: string;
    // Specific fields
    rule?: string;
    hike?: number;
}

interface AllSessionsProps {
    auctionId: string;
    auctionType: string;
    onSessionClick: (sessionId: string, sessionType: string) => void;
}

const AllSessions: React.FC<AllSessionsProps> = ({ auctionId, auctionType, onSessionClick }) => {
    // We can still keep the URL param for fallback, but prop is preferred
    const { id: urlId } = useParams();
    const effectiveAuctionId = auctionId || urlId;
    const [isSessionDrawerOpen, setIsSessionDrawerOpen] = useState(false);
    const [isFetchingSessions, setIsFetchingSessions] = useState(false);
    const [isSubmittingSession, setIsSubmittingSession] = useState(false);
    const [groups, setGroups] = useState<any[]>([]);

    // Data State
    const [sessions, setSessions] = useState<Session[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        session_number: '',
        group_id: '',
        // Draft specific
        rule: 'CUSTOM',
        // English specific
        hike: '',
        hike_per_bid: '',
        base_price: '',
        price_for_teams: ''
    });

    useEffect(() => {
        if (effectiveAuctionId) {
            fetchSessions();
            fetchGroups();
        }
    }, [effectiveAuctionId]);

    const fetchSessions = async () => {
        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        try {
            setIsFetchingSessions(true);
            const response = await axios.get(`${baseUrl}/auction/${effectiveAuctionId}/session`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-auction-id': effectiveAuctionId
                }
            });
            const auctionSessions = Array.isArray(response.data) ? response.data :
                (Array.isArray(response.data?.data) ? response.data.data : []);
            setSessions(auctionSessions);
        } catch (error) {
            console.error("Error fetching sessions:", error);
        } finally {
            setIsFetchingSessions(false);
        }
    };

    const fetchGroups = async () => {
        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        try {
            const response = await axios.get(`${baseUrl}/group`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-auction-id': effectiveAuctionId
                }
            });
            const allGroups = Array.isArray(response.data) ? response.data :
                (Array.isArray(response.data?.data) ? response.data.data : []);
            const auctionGroups = allGroups.filter((g: any) => g.auction_id === effectiveAuctionId);
            setGroups(auctionGroups);
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

        try {
            setIsSubmittingSession(true);
            const payload: any = {
                auction_id: effectiveAuctionId,
                name: formData.name,
                session_number: parseInt(formData.session_number),
                group_id: formData.group_id
            };

            if (auctionType.toLowerCase() === 'draft') {
                payload.rule = formData.rule;
            } else {
                payload.hike = parseFloat(formData.hike);
                // Schema provided doesn't have hike_per_bid etc yet, but we'll include if possible or just log them
            }

            await axios.post(`${baseUrl}/auction/${effectiveAuctionId}/session`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-auction-id': effectiveAuctionId
                }
            });

            toast.success('Session Created Successfully!');
            setIsSessionDrawerOpen(false);
            fetchSessions();
        } catch (error: any) {
            console.error("Failed to save session", error);
            const msg = error.response?.data?.message || "Failed to save session";
            toast.error(msg);
        } finally {
            setIsSubmittingSession(false);
        }
    };

    const filteredSessions = sessions;

    return (
        <div className="animate-in fade-in duration-500 text-left">
            <Toaster position="top-center" />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 gap-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-1 text-black">Auction Sessions</h2>
                    <p className="text-sm text-gray-500 font-medium">Configure and manage your auction events ({sessions.length} total)</p>
                </div>
                <button
                    onClick={() => setIsSessionDrawerOpen(true)}
                    className="px-5 py-2 bg-[#198754] rounded-full text-sm font-medium hover:bg-[#157347] transition-all flex items-center gap-2 text-white"
                >
                    <Plus className="w-4 h-4" /> Create Session
                </button>
            </div>

            {/* Sessions Grid */}
            {isFetchingSessions ? (
                <div className="py-32 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
                    <p className="text-sm font-medium text-gray-400 tracking-wide">Fetching Sessions...</p>
                </div>
            ) : sessions.length === 0 ? (
                <div className="py-24 bg-white flex flex-col items-center justify-center text-center px-6">
                    <p className="text-sm font-medium text-black mb-4">No Sessions Found</p>
                    <button
                        onClick={() => setIsSessionDrawerOpen(true)}
                        className="px-5 py-2 bg-[#198754] rounded-full text-sm font-medium hover:bg-[#157347] transition-all flex items-center gap-2 text-white"
                    >
                        <Plus className="w-4 h-4" /> Create First Session
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredSessions.map((session) => (
                        <div
                            key={session.id}
                            onClick={() => onSessionClick(session.id, auctionType)}
                            className="bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-lg transition-all group cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-gray-50 rounded-2xl">
                                    <Clock className="w-6 h-6 text-gray-500" />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${session.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {session.status}
                                </span>
                            </div>
                            <h4 className="text-xl font-bold mb-1 group-hover:text-black transition-all line-clamp-1 text-black">{session.name}</h4>
                            <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-8">
                                <Layers className="w-4 h-4" />
                                <span>Session #{session.session_number}</span>
                            </div>
                            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 font-medium">Group</span>
                                    <span className="text-sm font-bold text-black">{groups.find(g => g.id === session.group_id)?.value || 'General'}</span>
                                </div>
                                <button className="p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all">
                                    <Play className="w-4 h-4" fill="currentColor" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Session Side Drawer */}
            {isSessionDrawerOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-end">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsSessionDrawerOpen(false)}
                    />
                    <div className="relative w-full max-w-xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col p-8 sm:p-10">
                        <div className="flex justify-between items-start mb-8">
                            <div className="text-left">
                                <h2 className="text-2xl font-bold tracking-tight mb-2">Create Session</h2>
                                <p className="text-sm text-gray-500 font-medium">Configure the auction parameters for this session</p>
                            </div>
                            <button
                                onClick={() => setIsSessionDrawerOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-500 hover:text-black"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form className="space-y-6 flex-1 overflow-y-auto pr-4 scrollbar-hide" onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                {/* Common Fields */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-wider text-black">Session Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="e.g. Opening Round"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-5 py-3 bg-gray-50 border border-black/10 rounded-xl outline-none focus:border-black transition-all font-bold text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-wider text-black">Session Number</label>
                                        <input
                                            type="number"
                                            name="session_number"
                                            placeholder="1"
                                            value={formData.session_number}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-5 py-3 bg-gray-50 border border-black/10 rounded-xl outline-none focus:border-black transition-all font-bold text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-wider text-black">Student Group</label>
                                        <select
                                            name="group_id"
                                            value={formData.group_id}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-5 py-3 bg-gray-50 border border-black/10 rounded-xl outline-none focus:border-black transition-all font-bold text-sm appearance-none cursor-pointer"
                                        >
                                            <option value="">Select Group</option>
                                            {groups.map(g => (
                                                <option key={g.id} value={g.id}>{g.value} ({g.key})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Conditional Fields based on Auction Type */}
                                {auctionType.toLowerCase() === 'draft' ? (
                                    <div className="">

                                        {/* <div className="flex items-center gap-2 mb-2"> space-y-6 p-6 bg-gray-50 rounded-[2rem] border border-black/5
                                            <Settings2 className="w-4 h-4 text-black/40" />
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-black">Draft Settings</h3>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-wider text-black">Pick Rules</label>
                                            <select
                                                name="rule"
                                                value={formData.rule}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-3 bg-white border border-black/10 rounded-xl outline-none focus:border-black transition-all font-bold text-sm"
                                            >
                                                 <option value="SEQUENTIAL">Sequential Order</option>
                                                 <option value="SNAKE">Snake Draft</option>
                                                 <option value="CUSTOM">Custom Order</option>
                                            </select>
                                        </div> */}
                                    </div>
                                ) : (
                                    <div className="space-y-6 p-6 bg-[#FEF9C3]/10 rounded-[2.5rem] border border-[#FEF9C3]/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-4 h-4 text-[#199d5a]" />
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-black">English Auction Setup</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2 relative">
                                                <label className="text-[11px] font-black uppercase tracking-wider text-black">Hike %</label>
                                                <input
                                                    type="number"
                                                    name="hike"
                                                    placeholder="10"
                                                    value={formData.hike}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-3 bg-white border border-black/10 rounded-xl outline-none focus:border-black transition-all font-bold text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-wider text-black">Hike Per Bid</label>
                                                <input
                                                    type="number"
                                                    name="hike_per_bid"
                                                    placeholder="500"
                                                    value={formData.hike_per_bid}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-3 bg-white border border-black/10 rounded-xl outline-none focus:border-black transition-all font-bold text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-wider text-black">Base Price</label>
                                                <input
                                                    type="number"
                                                    name="base_price"
                                                    placeholder="1000"
                                                    value={formData.base_price}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-3 bg-white border border-black/10 rounded-xl outline-none focus:border-black transition-all font-bold text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-wider text-black">Price for Teams</label>
                                                <input
                                                    type="number"
                                                    name="price_for_teams"
                                                    placeholder="2000"
                                                    value={formData.price_for_teams}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-3 bg-white border border-black/10 rounded-xl outline-none focus:border-black transition-all font-bold text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto pt-10 border-t border-black/5 space-y-4">
                                <button
                                    type="submit"
                                    disabled={isSubmittingSession}
                                    className="w-full py-4 bg-black text-white rounded-2xl font-black text-sm shadow-[6px_6px_0px_0px_#FEF9C3] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#FEF9C3] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmittingSession ? <Loader2 className="w-4 h-4 animate-spin text-[#FEF9C3]" /> : <Plus className="w-4 h-4" strokeWidth={4} />}
                                    Create Auction Session
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsSessionDrawerOpen(false)}
                                    className="w-full py-4 bg-white border-[1.5px] border-black rounded-2xl font-black text-xs hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllSessions;
