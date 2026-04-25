import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Loader2,
    Clock,
    Users,
    ArrowLeft,
    Play,
    Trophy,
    History,
    Settings,
    LayoutDashboard,
    ArrowUp,
    ArrowDown,
    X,
    Eye,
    EyeOff,
    Copy
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Team {
    id: string;
    name: string;
    owner_name?: string;
    budget?: number;
    username?: string;
    plain_password?: string;
    password_hash?: string;
}

interface DraftAuctionProps {
    sessionId: string;
    auctionId: string;
    onBack: () => void;
    subdomain?: string;
}

const DraftAuction: React.FC<DraftAuctionProps> = ({ sessionId, auctionId, onBack, subdomain }) => {
    const [session, setSession] = useState<any>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [teamOrder, setTeamOrder] = useState<string[]>([]);
    const [groupName, setGroupName] = useState<string>('All Candidates');
    const [isTeamCredsModalOpen, setIsTeamCredsModalOpen] = useState(false);
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
    const [draftSummary, setDraftSummary] = useState<any>(null);

    const togglePasswordVisibility = (teamId: string) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [teamId]: !prev[teamId]
        }));
    };

    const copyCredentials = (username: string, password?: string) => {
        const text = `Username: ${username}\nPassword: ${password || 'N/A'}`;
        navigator.clipboard.writeText(text);
        toast.success("Credentials copied!");
    };

    useEffect(() => {
        fetchSessionDetails();
        fetchTeams();
        fetchSummary();

        // Poll summary if session is active
        const interval = setInterval(() => {
            if (session?.status === 'ACTIVE') {
                fetchSummary();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [sessionId, session?.status]);

    // Move calculation up so functions can use them if needed
    const orderedTeams = teamOrder.map((id: string) => teams.find((t: any) => t.id === id)).filter(Boolean) as Team[];
    const unorderedTeams = teams.filter((t: any) => !teamOrder.includes(t.id));
    const fullTeamList = [...orderedTeams, ...unorderedTeams];

    const fetchSessionDetails = async () => {
        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        try {
            setIsLoading(true);
            const response = await axios.get(`${baseUrl}/auction/${auctionId}/session/${sessionId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-auction-id': auctionId
                }
            });

            // Handle both wrapped and unwrapped response data
            const currentSession = response.data?.data || response.data;
            console.log("Fetched session data:", currentSession);

            if (!currentSession || typeof currentSession !== 'object') {
                throw new Error("Invalid session data received");
            }

            setSession(currentSession);

            try {
                const groupRes = await axios.get(`${baseUrl}/group`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-auction-id': auctionId
                    }
                });
                const allGroups = Array.isArray(groupRes.data?.data) ? groupRes.data.data :
                    (Array.isArray(groupRes.data) ? groupRes.data : []);

                const matchedGroup = allGroups.find((g: any) => g.id === currentSession.group_id);
                if (matchedGroup) {
                    setGroupName(`${matchedGroup.key}: ${matchedGroup.value}`);
                }
            } catch (err) {
                console.error("Failed to fetch groups for session", err);
            }

            // Handle base_team_order if it's a string or array
            let order = currentSession?.base_team_order || currentSession?.baseTeamOrder;
            if (order) {
                if (typeof order === 'string') {
                    try {
                        order = JSON.parse(order);
                    } catch (e) {
                        order = order.split(',').filter(Boolean);
                    }
                }

                if (Array.isArray(order)) {
                    const cleanedOrder = order.map(id => String(id).trim()).filter(Boolean);
                    console.log("Setting team order to:", cleanedOrder);
                    setTeamOrder(cleanedOrder);
                }
            }
        } catch (error) {
            console.error("Error fetching session:", error);
            toast.error("Failed to load session details");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTeams = async () => {
        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        try {
            const response = await axios.get(`${baseUrl}/team`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-auction-id': auctionId
                }
            });
            const allTeams = Array.isArray(response.data?.data) ? response.data.data :
                (Array.isArray(response.data) ? response.data : []);

            const auctionTeams = allTeams.filter((t: any) => t.auction_id === auctionId);
            setTeams(auctionTeams);
        } catch (error) {
            console.error("Error fetching teams:", error);
        }
    };

    const fetchSummary = async () => {
        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        try {
            const response = await axios.get(`${baseUrl}/draft/sessions/${sessionId}/summary`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-auction-id': auctionId
                }
            });
            console.log("Draft summary updated:", response.data);
            setDraftSummary(response.data?.data || response.data);
        } catch (error) {
            console.error("Error fetching summary:", error);
        }
    };

    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
    const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

    const updateTeamOrder = (oldIndex: number, newIndex: number) => {
        const currentIds = fullTeamList.map(t => t.id);
        const newOrder = [...currentIds];
        const [removed] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, removed);
        setTeamOrder(newOrder);
    };

    const handleMoveTeam = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= fullTeamList.length) return;
        updateTeamOrder(index, targetIndex);
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDropTargetIndex(index);
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedItemIndex !== null && draggedItemIndex !== index) {
            updateTeamOrder(draggedItemIndex, index);
        }
        setDraggedItemIndex(null);
        setDropTargetIndex(null);
    };

    const handleSaveOrder = async () => {
        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

        // Always save the FULL list of IDs to ensure the order is exactly as seen on screen
        const finalOrderIds = fullTeamList.map(t => String(t.id));

        console.log("Saving final sequence of team IDs:", finalOrderIds);

        try {
            toast.loading("Persisting team order...", { id: 'save-order-toast' });

            const payload = {
                auction_id: auctionId,
                name: session.name,
                session_number: session.session_number,
                group_id: session.group_id,
                // Shotgun approach: send many variants of the order field to see which one sticks
                base_team_order: finalOrderIds,
                // baseTeamOrder: finalOrderIds,
                // team_order: finalOrderIds,
                // teamOrder: finalOrderIds,
                // order: finalOrderIds
            };

            console.log("Sending PATCH payload to persistent storage:", payload);

            const response = await axios.patch(`${baseUrl}/auction/${auctionId}/session/${sessionId}`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-auction-id': auctionId
                }
            });

            console.log("PATCH Response Details:", {
                status: response.status,
                data: response.data,
                updatedAt: (response.data?.data || response.data)?.updated_at
            });

            toast.success("Team order saved successfully", { id: 'save-order-toast' });

            // Force local state update for immediate reflecting
            setTeamOrder(finalOrderIds);
            const updatedSession = response.data?.data || response.data || payload;
            setSession((prev: any) => ({ ...prev, ...updatedSession }));

            // Re-fetch from server after a short delay to verify persistence
            setTimeout(() => {
                fetchSessionDetails();
            }, 500);

        } catch (error: any) {
            console.error("Error saving team order:", error);
            const errorMsg = error.response?.data?.message || error.message || "Failed to save team order";
            toast.error(errorMsg, { id: 'save-order-toast' });
        }
    };

    const handleStartDraft = async () => {
        // Force use of Admin token if available, otherwise fallback
        const adminToken = localStorage.getItem('token');
        const token = adminToken || localStorage.getItem('team_token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

        if (!token) {
            toast.error("No authentication token found. Please log in as Admin.");
            return;
        }

        if (teams.length === 0) {
            toast.error("Cannot start draft: No teams are assigned to this auction.");
            return;
        }

        try {
            toast.loading("Activating Draft Session...", { id: 'start-draft' });

            // 1. Initialize turns via engine endpoint FIRST while session is still PENDING
            // The engine throws 409 if we mark it ACTIVE before this call
            console.log(`Starting draft engine for session: ${sessionId}, auction: ${auctionId}`);
            const engineRes = await axios.post(`${baseUrl}/draft/sessions/${sessionId}/start`, {
                auction_id: auctionId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-auction-id': auctionId,
                    'Content-Type': 'application/json'
                }
            });

            console.log("Draft Engine Start SUCCESS:", engineRes.data);
            const engineData = engineRes.data?.data || engineRes.data;
            if (engineData?.current_turn_id) {
                console.log(`DRAFT STARTED: Initial Turn ID is ${engineData.current_turn_id}`);
            }

            // 2. Mark status as ACTIVE now that turns are prepared
            console.log(`Updating status to ACTIVE for session: ${sessionId}`);
            const statusRes = await axios.patch(`${baseUrl}/auction/${auctionId}/session/${sessionId}`, {
                status: 'ACTIVE'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-auction-id': auctionId
                }
            });
            console.log("Status Update Response:", statusRes.data);

            toast.success("Draft started successfully!", { id: 'start-draft' });
            fetchSessionDetails();

        } catch (error: any) {
            console.error("Start Draft Failed:", error.response?.data || error);
            const msg = error.response?.data?.message || error.message || "Failed to start draft engine";

            // If it's already active, just refresh and show error
            if (error.response?.status === 409) {
                toast.error("Session already active or engine state conflict.", { id: 'start-draft' });
                fetchSessionDetails();
            } else {
                toast.error(msg, { id: 'start-draft' });
            }
        }
    };

    if (isLoading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#E76F6F]" />
                <p className="text-sm font-black uppercase tracking-widest text-black/20">Loading Session...</p>
            </div>
        );
    }

    if (!session) return <div className="p-20 text-center font-black">Session not found</div>;

    return (
        <div className="animate-in fade-in duration-500 text-left bg-[#ffffff] min-h-[100dvh] pt-4 px-2 sm:px-6">
            <Toaster position="top-center" />

            {/* Top: Session Details Area */}
            <div className="flex flex-col gap-6 mb-8 max-w-[1400px] mx-auto">
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            onClick={onBack}
                            className="p-1.5 sm:p-2 hover:bg-gray-50 rounded-full transition-colors shrink-0 text-gray-400"
                        >
                            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                        </button>

                        <div className="w-10 h-10 sm:w-11 sm:h-11 border border-[#FFFF12] rounded-full flex flex-col items-center justify-center shrink-0">
                            <Clock className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-[#FFFF12]" strokeWidth={2.5} />
                        </div>

                        <div className="flex flex-col justify-center">
                            <h1 className="text-[20px] sm:text-[22px] font-[900] text-gray-900 tracking-tight leading-none mb-1">{session.name}</h1>
                            <p className="text-[11px] text-gray-400 font-[900] leading-none mb-1">Draft Mode Session</p>
                            <div className="flex items-center text-gray-400 font-[900] mt-0.5">
                                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest">
                                    <span className="text-[#3B82F6] text-[10px]">❖</span> #{session.session_number} · <span className="capitalize">{groupName.toLowerCase()}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
                        <div className="px-5 py-1.5 bg-white border border-[#198754]/40 rounded-full shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                            <span className="text-[10px] font-[900] text-[#198754] uppercase tracking-widest">{session.status}</span>
                        </div>
                        {session.status === 'PENDING' && (
                            <button
                                onClick={handleStartDraft}
                                className="px-5 sm:px-6 py-2 bg-[#198754] rounded-full text-[11px] text-white font-[900] shadow-[0_4px_12px_rgba(25,135,84,0.15)] hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2"
                            >
                                <Play className="w-3.5 h-3.5 fill-white" /> Start Draft
                            </button>
                        )}
                        <button
                            onClick={() => setIsTeamCredsModalOpen(true)}
                            className="px-5 sm:px-6 py-2 bg-[#FFFF12] rounded-full text-[11px] text-black font-[900] shadow-[0_4px_12px_rgba(255,255,18,0.15)] hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2"
                        >
                            <Users className="w-3.5 h-3.5 text-black" strokeWidth={3} /> Team Details
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-2">
                    {[
                        { label: 'RULE TYPE', value: session.rule || 'CUSTOM', icon: Settings, color: '#C6A75E' },
                        { label: 'CURRENT ROUND', value: draftSummary?.current_round ? `${draftSummary.current_round} / ${draftSummary.total_rounds || 10}` : '1 / 10', icon: History, color: '#198754' },
                        { label: 'TOTAL TEAMS', value: teams.length, icon: Users, color: '#7C3AED' },
                        { label: 'ACTIVE TURN', value: draftSummary?.current_turn?.team_name || 'Idle', icon: Play, color: '#3B82F6' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-[1.2rem] p-5 sm:p-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-gray-200 transition-colors h-[110px]">
                            <div className="flex justify-between items-start gap-4">
                                <span className="text-[9px] sm:text-[10px] font-[900] text-[#2c3e50]/40 uppercase tracking-widest leading-none mt-1">{stat.label}</span>
                                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
                                    <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} strokeWidth={2.5} />
                                </div>
                            </div>
                            <span className="text-[22px] sm:text-[26px] font-[900] tracking-tight text-gray-900 leading-none truncate">{stat.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-6 max-w-[1400px] mx-auto">
                {/* Left: Draft Turn Summary (Takes 2/3 space) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-100 rounded-[1.2rem] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)] min-h-[400px] sm:min-h-[480px] flex flex-col relative">
                        <div className="p-5 sm:px-8 sm:py-6 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <LayoutDashboard className="w-4 h-4 text-gray-400" strokeWidth={2} />
                                <h3 className="text-[11px] font-[900] uppercase tracking-widest text-[#2c3e50]/40">Draft Turn Summary</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="px-3.5 py-1.5 bg-white border border-[#198754]/30 rounded-full flex items-center gap-2 shadow-sm">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse mr-1" />
                                    <span className="text-[9px] font-[900] uppercase tracking-widest text-[#198754] leading-none pt-[1px]">Auto Mode: OFF</span>
                                </div>
                            </div>
                        </div>

                        {/* Summary Content */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                            {(() => {
                                // Normalize turns data from different possible API structures for Admin View
                                let turnsToRender = draftSummary?.turns || [];

                                // If no flat 'turns', derive from teams[].picks
                                if (turnsToRender.length === 0 && draftSummary?.teams) {
                                    turnsToRender = draftSummary.teams.flatMap((t: any) =>
                                        (t.picks || []).map((p: any) => ({
                                            ...p,
                                            team_name: t.teamName || t.team_name,
                                            student_name: p.student?.name || p.studentName || p.student_name,
                                            turn_index: p.round
                                        }))
                                    ).sort((a: any, b: any) =>
                                        new Date(b.pickedAt || b.picked_at).getTime() - new Date(a.pickedAt || a.picked_at).getTime()
                                    );
                                }

                                if (turnsToRender.length === 0) {
                                    return (
                                        <div className="h-full flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-6 shadow-sm shadow-gray-100/50">
                                                <Trophy className="w-6 h-6 text-gray-300" strokeWidth={2} />
                                            </div>
                                            <h4 className="text-[13px] font-[900] mb-2 text-gray-400 uppercase tracking-widest">No Picks Yet</h4>
                                            <p className="text-[10px] text-gray-300 font-bold max-w-[220px] uppercase tracking-widest leading-relaxed">Once the session starts, the live draft summary will appear here.</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="space-y-3 pb-4">
                                        {turnsToRender.map((turn: any, idx: number) => {
                                            const isPicked = !!turn.student_id || !!turn.studentId || !!turn.student?.id;
                                            return (
                                                <div
                                                    key={turn.id || turn.pickId || idx}
                                                    className={`p-4 rounded-[1rem] border transition-all ${isPicked ? 'bg-[#198754]/5 border-[#198754]/20' : 'bg-gray-50 border-dashed border-gray-200 opacity-60'}`}
                                                >
                                                    <div className="flex justify-between items-center gap-4">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${isPicked ? 'bg-white border-[#198754]/30' : 'bg-gray-100 border-gray-200'}`}>
                                                                <span className="text-[10px] font-[900] text-gray-600">{turn.turn_index || turn.turnIndex || idx + 1}</span>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[8px] font-[900] text-gray-400 uppercase tracking-widest leading-none mb-1">TEAM PICK</p>
                                                                <h4 className="text-[12px] font-[900] truncate uppercase leading-none text-gray-900">{turn.team_name || turn.teamName || 'Unknown Team'}</h4>
                                                            </div>
                                                        </div>

                                                        {isPicked ? (
                                                            <div className="flex items-center gap-3 bg-white py-2 px-3 rounded-lg border border-gray-100 min-w-0 max-w-[50%]">
                                                                <div className="w-6 h-6 rounded-md bg-[#7C3AED] flex items-center justify-center shrink-0">
                                                                    <Users className="w-3 h-3 text-white" strokeWidth={2.5} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-[8px] font-[900] text-gray-400 uppercase tracking-tighter truncate leading-none mb-0.5">SELECTED</p>
                                                                    <p className="text-[10px] font-[900] truncate italic leading-none text-gray-900">{turn.student_name || turn.studentName || turn.candidate_name || turn.student?.name}</p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 pr-2">
                                                                <Loader2 className="w-3 h-3 animate-spin text-gray-300" />
                                                                <span className="text-[8px] font-[900] text-gray-300 uppercase tracking-widest italic">Waiting...</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                {/* Right: Team Bidding Order (Takes 1/3 space) */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="bg-white border border-gray-100 rounded-[1.2rem] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col h-full sm:min-h-[480px]">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-5">
                            <div className="flex items-center gap-3">
                                <Users className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={2} />
                                <h3 className="text-[11px] font-[900] uppercase tracking-widest text-[#2c3e50]/40 leading-none pt-1 mt-0.5">Team Order</h3>
                            </div>
                            <button
                                onClick={handleSaveOrder}
                                className="px-4 py-1.5 sm:px-5 sm:py-2 bg-[#FFFF12] text-black rounded-full text-[9px] sm:text-[10px] font-[900] transition-transform shadow-sm flex items-center truncate shrink-0 tracking-widest uppercase hover:-translate-y-0.5"
                            >
                                Save Order
                            </button>
                        </div>

                        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                            {fullTeamList.length === 0 ? (
                                <p className="text-[11px] font-[900] text-gray-300 text-center py-10 uppercase tracking-widest">No teams added</p>
                            ) : (
                                fullTeamList.map((team, index) => {
                                    return (
                                        <div
                                            key={team.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragLeave={() => setDropTargetIndex(null)}
                                            onDrop={(e) => handleDrop(e, index)}
                                            onDragEnd={() => {
                                                setDraggedItemIndex(null);
                                                setDropTargetIndex(null);
                                            }}
                                            className={`p-3.5 border transition-all cursor-move rounded-[0.8rem] flex items-center justify-between group bg-white border-gray-100 hover:border-gray-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.03)]
                                                ${draggedItemIndex === index ? 'opacity-40 border-dashed scale-[0.98]' : ''}
                                                ${dropTargetIndex === index && draggedItemIndex !== index ? 'border-[#7C3AED] border-[1.5px] -translate-y-1 shadow-sm' : ''}
                                            `}
                                        >
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div className="w-6 h-6 rounded-md bg-gray-50/50 border border-gray-100 text-gray-400 flex items-center justify-center text-[10px] font-[900] shrink-0">
                                                    {index + 1}
                                                </div>
                                                <div className="flex flex-col min-w-0 pt-0.5">
                                                    <span className="text-[12px] font-[900] truncate text-gray-900 leading-tight mb-0.5">{team.name}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 truncate leading-none">Username: {team.username || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-20 sm:opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleMoveTeam(index, 'up'); }}
                                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-[#7C3AED] transition-colors"
                                                    disabled={index === 0}
                                                >
                                                    <ArrowUp className="w-3.5 h-3.5" strokeWidth={2.5} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleMoveTeam(index, 'down'); }}
                                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-[#7C3AED] transition-colors"
                                                    disabled={index === fullTeamList.length - 1}
                                                >
                                                    <ArrowDown className="w-3.5 h-3.5" strokeWidth={2.5} />
                                                </button>
                                                <div className="ml-1 p-1 cursor-grab">
                                                    <GripVertical className="w-3.5 h-3.5 text-gray-300" strokeWidth={2} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="mt-4 pt-5 border-t border-gray-50 text-center shrink-0">
                            <p className="text-[9px] font-[900] text-[#2c3e50]/30 uppercase tracking-widest pt-1">Drag or use arrows to reorder</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Credentials Sidebar */}
            {isTeamCredsModalOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40 animate-in fade-in duration-300"
                        onClick={() => setIsTeamCredsModalOpen(false)}
                    />
                    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[460px] bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.05)] flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-100">

                        {/* Sidebar Header */}
                        <div className="flex justify-between items-start p-6 sm:px-8 sm:py-7 border-b border-gray-100 bg-white">
                            <div>
                                <h2 className="text-[22px] font-[900] tracking-tight text-gray-900 leading-none mb-1.5">Team Credentials</h2>
                                <p className="text-[12px] font-bold text-gray-400 italic tracking-tight">Access information for all teams.</p>
                            </div>
                            <button
                                onClick={() => setIsTeamCredsModalOpen(false)}
                                className="p-2 hover:bg-[#7c3aed]/10 hover:text-[#7c3aed] rounded-full transition-all shrink-0 text-gray-400"
                            >
                                <X className="w-5 h-5" strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Sidebar Body */}
                        <div className="flex-1 overflow-y-auto p-6 sm:px-8 sm:py-6 bg-slate-50">
                            {fullTeamList.length === 0 ? (
                                <div className="text-center py-20 opacity-60">
                                    <Users className="w-10 h-10 mx-auto mb-3 opacity-20 text-gray-900" />
                                    <p className="text-[11px] font-[900] uppercase tracking-widest text-gray-500">No Teams Found</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {fullTeamList.map((team) => {
                                        const passToUse = team.plain_password || team.password_hash || 'No Password Set';
                                        const isVisible = visiblePasswords[team.id];

                                        return (
                                            <div key={team.id} className="p-5 border border-gray-200 rounded-[1rem] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative group transition-all hover:border-[#7c3aed]/40 hover:shadow-[0_4px_16px_rgba(124,58,237,0.08)]">
                                                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => copyCredentials(team.username || 'N/A', passToUse)}
                                                        className="p-1.5 bg-gray-50 hover:bg-[#7c3aed] hover:text-white rounded-lg transition-all text-gray-500"
                                                        title="Copy Credentials"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <div className="mb-3 pr-8 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#7c3aed]/10 flex items-center justify-center shrink-0">
                                                        <Users className="w-4 h-4 text-[#7c3aed]" strokeWidth={2.5} />
                                                    </div>
                                                    <h3 className="text-[14px] font-[900] text-gray-900 truncate">{team.name}</h3>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 mt-4">
                                                    <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1 border border-gray-100">
                                                        <span className="text-[9px] font-[900] uppercase tracking-widest text-gray-400">Username</span>
                                                        <span className="text-[12px] font-bold text-gray-800 truncate">{team.username || 'N/A'}</span>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1 border border-gray-100 relative pr-8">
                                                        <span className="text-[9px] font-[900] uppercase tracking-widest text-gray-400">Password</span>
                                                        <span className="text-[12px] font-bold font-mono text-gray-800 truncate tracking-wider">
                                                            {isVisible ? passToUse : '••••••••'}
                                                        </span>
                                                        <button
                                                            onClick={() => togglePasswordVisibility(team.id)}
                                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#7c3aed] transition-colors"
                                                        >
                                                            {isVisible ? <EyeOff className="w-3.5 h-3.5" strokeWidth={2.5} /> : <Eye className="w-3.5 h-3.5" strokeWidth={2.5} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Sidebar Footer */}
                        <div className="p-6 sm:px-8 border-t border-gray-100 bg-white flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    const link = `${window.location.origin}/${subdomain || auctionId}/draft-auction`;
                                    navigator.clipboard.writeText(link);
                                    toast.success("Team page link copied!");
                                }}
                                className="w-full py-3.5 bg-[#7c3aed] text-white hover:bg-[#7c3aed]/90 font-[900] text-[11px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#7c3aed]/20"
                            >
                                <Copy className="w-4 h-4 text-white" strokeWidth={2.5} /> Copy Team Page Link
                            </button>
                            <button
                                onClick={() => setIsTeamCredsModalOpen(false)}
                                className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-500 font-[900] text-[11px] uppercase tracking-widest rounded-xl transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DraftAuction;