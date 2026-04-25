import React, { useState, useEffect, useContext } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Clock, Loader2, Search, History, Trophy, LayoutDashboard } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { AuctionContext } from '@/components/AuctionSlugRoute';

type Tab = 'Home' | 'Confirm' | 'Draft' | 'Summary';

export const DraftAuctionPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const auctionContext = useContext(AuctionContext);
    const id = auctionContext?.id || slug;

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<Tab>('Home');

    // Team Auth State
    // Team Auth State - checks for token OR username to keep session alive
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
        !!localStorage.getItem('team_token') || !!localStorage.getItem('team_username')
    );
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const [resolvedId, setResolvedId] = useState<string | null>(() =>
        localStorage.getItem('auction_id')
    );
    const [sessionId, setSessionId] = useState<string | null>(searchParams.get('session'));
    const [availableSessions, setAvailableSessions] = useState<any[]>([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);

    // Data State
    const [session, setSession] = useState<any>(null);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [draftSummary, setDraftSummary] = useState<any>(null);
    const [allGroupCandidates, setAllGroupCandidates] = useState<any[]>([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [draftState, setDraftState] = useState<any>(null);
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [isSubmittingPick, setIsSubmittingPick] = useState(false);

    // Resolve ID logic is now partially handled by context, 
    // but we keep a fallback if accessed directly without wrapper
    useEffect(() => {
        if (!auctionContext && id) {
            const resolveId = async () => {
                const token = localStorage.getItem('token') || localStorage.getItem('team_token');
                const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
                try {
                    const res = await axios.get(`${baseUrl}/auction`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const auctions = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                    const matched = auctions.find((a: any) => a.subdomain === id || a.id === id);
                    if (matched) {
                        setResolvedId(matched.id);
                        localStorage.setItem('auction_id', matched.id);
                    }
                } catch (e) {
                    console.error("Failed to resolve auction ID:", e);
                }
            };
            resolveId();
        } else if (auctionContext) {
            setResolvedId(auctionContext.id);
        }
    }, [id, auctionContext]);

    useEffect(() => {
        if (isAuthenticated && resolvedId) {
            if (sessionId) {
                fetchData();
                fetchDraftState();

                // Start polling for real-time updates (draft state and session status)
                const interval = setInterval(() => {
                    fetchDraftState();

                    // Also check session metadata periodically to detect status changes (PENDING -> STARTED)
                    const token = localStorage.getItem('token') || localStorage.getItem('team_token');
                    const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
                    axios.get(`${baseUrl}/auction/${resolvedId}/session/${sessionId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'x-auction-id': resolvedId
                        }
                    }).then(res => {
                        const sData = res.data?.data || res.data;
                        if (sData) setSession(sData);
                    }).catch(() => { });
                }, 5000);

                return () => clearInterval(interval);
            } else {
                fetchAvailableSessions();
            }
        }
    }, [isAuthenticated, resolvedId, sessionId]);

    const handleLogout = () => {
        localStorage.removeItem('team_token');
        localStorage.removeItem('team_username');
        localStorage.removeItem('team_id');
        localStorage.removeItem('team_details');
        setIsAuthenticated(false);
        setSessionId(null);
        navigate(`/art-fest/draft-auction`);
    };

    useEffect(() => {
        if (session && session.status === 'ACTIVE') {
            const interval = setInterval(() => {
                fetchDraftState();
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [session?.status]);

    useEffect(() => {
        if (session && session.status === 'ACTIVE') {
            const interval = setInterval(() => {
                fetchData(true); // silent update
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [session?.id, session?.status]);

    const fetchDraftState = async () => {
        const token = localStorage.getItem('token') || localStorage.getItem('team_token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        const targetId = resolvedId || id;

        try {
            // 1. Fetch ACTIVE STATE (Whose turn is it right now?)
            const stateRes = await axios.get(`${baseUrl}/draft/sessions/${sessionId}/state`, {
                headers: { 'Authorization': `Bearer ${token}`, 'x-auction-id': targetId }
            });
            const stateData = stateRes.data?.data || stateRes.data;
            setDraftState(stateData);

            // 2. Fetch SUMMARY (History of picks for filtering)
            const summaryRes = await axios.get(`${baseUrl}/draft/sessions/${sessionId}/summary`, {
                headers: { 'Authorization': `Bearer ${token}`, 'x-auction-id': targetId }
            });
            const summaryData = summaryRes.data?.data || summaryRes.data;
            setDraftSummary(summaryData);

            console.log("DEBUG: Updated State & Summary", { stateData, summaryData });
        } catch (error) {
            console.error("Draft Update Error:", error);
        }
    };

    const fetchAvailableSessions = async () => {
        const token = localStorage.getItem('token') || localStorage.getItem('team_token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        const targetId = resolvedId || id;
        try {
            setIsLoadingSessions(true);
            const response = await axios.get(`${baseUrl}/auction/${targetId}/session`, {
                headers: { 'Authorization': `Bearer ${token}`, 'x-auction-id': targetId }
            });
            const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
            setAvailableSessions(data);
        } catch (error) {
            console.error("Error fetching sessions:", error);
            toast.error("Failed to load sessions");
        } finally {
            setIsLoadingSessions(false);
        }
    };

    const fetchData = async (silent = false) => {
        const token = localStorage.getItem('token') || localStorage.getItem('team_token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        const targetId = resolvedId || id;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'x-auction-id': targetId
        };

        try {
            if (!silent) setIsLoadingData(true);

            // 1. Fetch Session Details
            const sessRes = await axios.get(`${baseUrl}/auction/${targetId}/session/${sessionId}`, { headers });
            const sessionData = sessRes.data?.data || sessRes.data;
            setSession(sessionData);

            // 2. Fetch Group Candidates
            let candidatesList: any[] = [];
            if (sessionData?.group_id) {
                try {
                    const studentGroupRes = await axios.get(`${baseUrl}/student-group`, { headers });
                    const allAssoc = studentGroupRes.data?.data || studentGroupRes.data;
                    const studentIds = (Array.isArray(allAssoc) ? allAssoc : [])
                        .filter((a: any) => a.group_id === sessionData.group_id)
                        .map((a: any) => a.student_id);

                    const studentRes = await axios.get(`${baseUrl}/student`, { headers });
                    const allStudents = studentRes.data?.data || studentRes.data;
                    candidatesList = (Array.isArray(allStudents) ? allStudents : [])
                        .filter((s: any) => studentIds.includes(s.id));

                    setAllGroupCandidates(candidatesList);
                } catch (err) {
                    console.error("Failed to fetch group candidates:", err);
                }
            }

            // 3. Update candidates list with filtering
            filterAvailableCandidates(candidatesList, draftSummary);

        } catch (error: any) {
            console.error("Data fetch failed:", error);
            if (!silent) toast.error("Failed to load some session data");
        } finally {
            if (!silent) setIsLoadingData(false);
        }
    };

    const filterAvailableCandidates = (fullList: any[], summary: any) => {
        if (!summary) {
            setCandidates(fullList);
            return;
        }

        // Logic 1: Use unpickedStudents if provided by API (preferred)
        if (summary.unpickedStudents && Array.isArray(summary.unpickedStudents)) {
            const unpickedIds = summary.unpickedStudents.map((s: any) => s.id);
            const available = fullList.filter(c => unpickedIds.includes(c.id));
            setCandidates(available);
            return;
        }

        // Logic 2: Flatten all picks across all teams + flat picks/turns
        const pickedIdsFromTeams = (summary.teams || []).flatMap((t: any) =>
            (t.picks || []).map((p: any) => p.studentId || p.student_id || p.student?.id)
        );
        const pickedIdsFromPicks = (summary.picks || []).map((p: any) => p.studentId || p.student_id || p.student?.id);
        const pickedIdsFromTurns = (summary.turns || [])
            .filter((t: any) => !!t.studentId || !!t.student_id || !!t.student?.id)
            .map((t: any) => t.studentId || t.student_id || t.student?.id);

        const allPickedIds = [...new Set([...pickedIdsFromTeams, ...pickedIdsFromPicks, ...pickedIdsFromTurns])];
        const available = fullList.filter(c => !allPickedIds.includes(c.id));
        setCandidates(available);
    };

    // Re-filter candidates whenever summary changes
    useEffect(() => {
        filterAvailableCandidates(allGroupCandidates, draftSummary);
    }, [draftSummary, allGroupCandidates]);

    // Hardcoded for now based on UI design
    const sessionName = session?.name || "Session Name";

    const teams = [
        { name: 'Team A', color: 'bg-[#F25A5A]' },
        { name: 'Team B', color: 'bg-[#5BCA28]' },
        { name: 'Team C', color: 'bg-[#DC388A]' },
        { name: 'Team D', color: 'bg-[#C233AD]' },
    ];

    const teamGrid = [
        ['Team A', 'Team B', 'Team C', 'Team D'],
        ['Team D', 'Team C', 'Team B', 'Team A'],
        ['Team B', 'Team D', 'Team A', 'Team C'],
        ['Team C', 'Team A', 'Team D', 'Team B']
    ];

    const handleConfirmPick = async () => {
        if (!selectedCandidate) {
            toast.error("Please select a candidate first");
            return;
        }

        // Robust resolution of active turn ID
        const activeTurnObj = draftState?.activeTurn || draftState?.active_turn;
        const activeTurnId =
            (typeof activeTurnObj === 'object' ? activeTurnObj?.id : null) ||
            draftState?.activeTurnId ||
            draftState?.active_turn_id;

        if (!activeTurnId) {
            toast.error("It's not your turn or draft is not active");
            return;
        }

        const token = localStorage.getItem('team_token') || localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        const targetId = resolvedId || id;

        if (!token) {
            toast.error("You must be logged in to make a pick");
            return;
        }

        // IDENTITY DEBUGGING
        const activeTurnTeamId = activeTurnObj?.teamId || activeTurnObj?.team_id;

        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));
            console.log("PICK DEBUG - Token sub:", payload.sub);
            console.log("PICK DEBUG - Turn teamId:", activeTurnTeamId);

            if (String(payload.sub) !== String(activeTurnTeamId)) {
                toast.error("UI Sync Error: It is actually someone else's turn.");
                return;
            }
        } catch (e) {
            console.warn("Failed to decode token for debug:", e);
        }

        console.log("STD id:", selectedCandidate.id);
        try {
            setIsSubmittingPick(true);
            const targetPickTurnId = activeTurnId;
            console.log(`Submitting pick on turn: ${targetPickTurnId} for Team: ${activeTurnTeamId}`);

            const response = await axios.post(`${baseUrl}/draft/turns/${targetPickTurnId}/pick`, {
                studentId: selectedCandidate.id
            }, {
                headers: { 'Authorization': `Bearer ${token}`, 'x-auction-id': targetId }
            });

            console.log("Pick Response Data:", response.data);
            toast.success(`${selectedCandidate.name} picked successfully!`);
            console.log(`${selectedCandidate.name} picked successfully!`);

            setSelectedCandidate(null);
            fetchData();
            fetchDraftState();
        } catch (error: any) {
            console.error("Pick error details:", error.response?.data || error.message);
            const msg = error.response?.data?.message || "Failed to make pick";
            toast.error(msg);

            if (error.response?.status === 401) {
                setTimeout(() => handleLogout(), 2000);
            }
        } finally {
            setIsSubmittingPick(false);
        }
    };

    const getTeamColor = (name: string) => {
        const hardcoded = teams.find(t => t.name.toLowerCase() === name?.toLowerCase());
        if (hardcoded) return hardcoded.color;

        // Dynamic fallback colors based on name hash
        const colors = [
            'bg-[#F25A5A]', 'bg-[#5BCA28]', 'bg-[#DC388A]', 'bg-[#673AC4]',
            'bg-[#F2994A]', 'bg-[#2D9CDB]', 'bg-[#9B51E0]', 'bg-[#27AE60]'
        ];
        const hash = name ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
        return colors[hash % colors.length];
    };

    const renderHomeTab = () => {
        const filteredCandidates = candidates.filter(c =>
        (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.reg_no.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        if (session?.status === 'PENDING') {
            return (
                <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-700">
                    <div className="w-24 h-24 bg-[#FEF9C3] rounded-3xl border-[1.5px] border-black flex items-center justify-center mb-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <Clock className="w-10 h-10 animate-pulse" />
                    </div>
                    <h2 className="text-4xl font-black mb-4">Draft is Pending</h2>
                    <p className="text-black/40 font-medium italic max-w-sm">Please wait for the administrator to start the draft session. This page will refresh once the session begins.</p>
                </div>
            );
        }
        // Strictly resolve active turn details from the same object to prevent mismatches
        const activeTurnObj = draftState?.activeTurn || draftState?.active_turn;

        // Determine if it's currently this team's turn - Strictly use the Turn's owner
        const currentTeamId = localStorage.getItem('team_id');
        const activeTurnTeamId = activeTurnObj?.teamId || activeTurnObj?.team_id;
        const isMyTurn = currentTeamId && activeTurnTeamId && String(currentTeamId) === String(activeTurnTeamId);

        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mt-8 lg:mt-12 animate-in fade-in duration-500">
                {/* Left Column - Profile/Info */}
                <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">
                    <div className="mb-2 w-full text-center lg:text-left">
                        <div className="flex flex-col lg:items-start items-center space-y-1">
                            {/* <p className="text-[12px] font-medium text-black/30 mb-0">
                                {localStorage.getItem('team_id') || 'No Team ID'}
                            </p>
                            <p className="text-[12px] font-medium text-black/50">{sessionId}</p>
                            <div className="flex flex-col gap-1 mt-1 opacity-40">
                                <p className="text-[10px] font-bold">LS ID: {currentTeamId}</p>
                                <p className="text-[10px] font-bold">TURN ID: {activeTurnTeamId}</p>
                            </div> */}
                            {!isMyTurn && activeTurnTeamId && (
                                <div className="mt-2 px-3 py-1 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-tighter">
                                        Waiting for: {activeTurnObj?.teamName || activeTurnObj?.team_name || 'Other Team'}
                                    </p>
                                </div>
                            )}
                            {isMyTurn && (
                                <div className="mt-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg animate-pulse">
                                    <p className="text-[10px] font-black text-green-600 uppercase tracking-tighter">
                                        Your Turn Now!
                                    </p>
                                </div>
                            )}
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black tracking-tighter my-4 leading-tight">{sessionName}</h1>

                        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border-[1.5px] border-[#D9A55B]/40 bg-[#FFF5D1] shadow-sm mb-6 lg:mb-12">
                            <Clock className="w-4 h-4 text-[#8C6010]" />
                            <span className="text-[14px] font-bold text-[#8C6010]">02:00</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center text-center w-full max-w-[320px]">
                        {/* Avatar Placeholder */}
                        <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-[#DADADA] mb-6 shadow-sm overflow-hidden flex items-center justify-center border-[1.5px] border-black/5">
                            {selectedCandidate ? (
                                <span className="text-4xl font-black text-black/20">{selectedCandidate.name.charAt(0)}</span>
                            ) : (
                                <div className="w-full h-full bg-[#DADADA]"></div>
                            )}
                        </div>

                        <h2 className="text-[28px] font-black text-black leading-none mb-1">
                            {selectedCandidate?.name || 'Candidate Name'}
                        </h2>
                        <p className="text-[15px] font-medium text-black/70 italic mb-4">
                            {selectedCandidate?.reg_no || 'Select from list'}
                        </p>
                    </div>
                </div>

                {/* Right Column - Draft UI */}
                <div className="lg:col-span-8 flex flex-col items-center lg:items-end mt-0 lg:mt-6 pr-0 lg:pr-10 order-1 lg:order-2">
                    {/* Team Colors Grid */}
                    {/* <div className="w-full max-w-[500px] mb-8 lg:mb-12 space-y-2">
                        {teamGrid.map((row, rIdx) => (
                            <div key={rIdx} className="grid grid-cols-4 gap-1.5 sm:gap-2">
                                {row.map((tn, cIdx) => (
                                    <div key={cIdx} className={`h-[28px] sm:h-[30px] rounded-[6px] flex items-center justify-center text-white text-[9px] sm:text-[11px] font-medium ${getTeamColor(tn)}`}>
                                        {tn}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div> */}

                    {/* Recent Picks Feed */}
                    {(() => {
                        const picks = draftSummary?.picks ||
                            (draftSummary?.turns || []).filter((t: any) => !!t.studentId || !!t.student_id);

                        if (picks.length === 0) return null;

                        return (
                            <div className="w-full max-w-[500px] bg-white border-[1.5px] border-black rounded-[2.5rem] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <History className="w-4 h-4 text-black/30" />
                                    <h3 className="text-xs font-black uppercase tracking-widest italic">Recent Picks</h3>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                                    {[...picks].reverse().slice(0, 5).map((pick: any, idx: number) => (
                                        <div key={idx} className="flex-shrink-0 bg-gray-50 border border-black/5 rounded-2xl p-4 min-w-[180px] flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center shrink-0">
                                                <Trophy className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-black text-black/30 uppercase truncate leading-none mb-1">{pick.teamName || pick.team_name}</p>
                                                <p className="text-xs font-black truncate italic leading-none">{pick.studentName || pick.student_name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Form Box */}
                    <div className="w-full max-w-[500px] bg-white border-[1.5px] border-black rounded-[32px] sm:rounded-[48px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.06)] relative overflow-hidden flex flex-col items-center">

                        <div className="w-full p-6 sm:p-8 pb-4 flex justify-end mb-2 sm:mb-4">
                            <div className="w-full sm:w-[50%] relative">
                                <Search className="w-4 h-4 text-black/20 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search candidates..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-[38px] rounded-full border-[1.5px] border-black/80 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-black/10 font-medium text-[13px] text-black"
                                />
                            </div>
                        </div>

                        <div className="w-full flex-1 max-h-[300px] overflow-y-auto">
                            {filteredCandidates.map((candidate) => (
                                <div
                                    key={candidate.id}
                                    onClick={() => setSelectedCandidate(candidate)}
                                    className={`w-full border-t border-black/10 px-6 sm:px-8 py-3 flex items-center justify-between hover:bg-black/5 transition-all cursor-pointer group ${selectedCandidate?.id === candidate.id ? 'bg-black/5' : ''}`}
                                >
                                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                        <span className="text-[10px] sm:text-[11px] font-black text-black/20 shrink-0">{candidate.reg_no}</span>
                                        <span className="text-[13px] sm:text-[14px] font-bold text-black group-hover:pl-1 transition-all truncate">{candidate.name}</span>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full border shrink-0 transition-all ${selectedCandidate?.id === candidate.id ? 'bg-black border-black' : 'border-black/20 group-hover:bg-black'}`}></div>
                                </div>
                            ))}
                            {filteredCandidates.length === 0 && !isLoadingData && (
                                <div className="p-10 text-center opacity-20 font-black uppercase text-[10px] tracking-widest">
                                    {searchQuery ? "No matching candidates" : "No more candidates available"}
                                </div>
                            )}
                            {isLoadingData && (
                                <div className="p-10 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto opacity-20" /></div>
                            )}
                        </div>

                        <div className="w-full p-6 pt-2 flex justify-center mt-2 border-t border-black/20 bg-white">
                            <button
                                onClick={handleConfirmPick}
                                disabled={!selectedCandidate || isSubmittingPick || !isMyTurn}
                                className="w-full sm:w-auto px-14 py-3 bg-black hover:bg-black/80 text-white font-bold text-[15px] tracking-wide rounded-full shadow-lg transition-all active:translate-y-[2px] disabled:opacity-50 disabled:bg-black/40 flex items-center justify-center gap-2"
                            >
                                {isSubmittingPick && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isMyTurn ? 'Confirm Pick' : 'Waiting for Turn...'}
                            </button>
                        </div>
                    </div>

                    {/* Detailed Turn Summary (Full History) */}
                    <div className="w-full max-w-[500px] mt-12 mb-20">
                        <div className="flex items-center gap-3 mb-6">
                            <LayoutDashboard className="w-5 h-5 text-black/30" />
                            <h3 className="text-sm font-black uppercase tracking-widest italic">Draft Turn Summary</h3>
                        </div>

                        {(() => {
                            // Normalize turns data from different possible API structures
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
                                    <div className="p-10 border-[1.5px] border-black border-dashed rounded-[2.5rem] text-center opacity-20">
                                        <p className="text-[10px] font-black uppercase tracking-widest">No Turns Logged Yet</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="space-y-4">
                                    {turnsToRender.map((turn: any, idx: number) => {
                                        const isPicked = !!turn.student_id || !!turn.studentId || !!turn.student?.id;
                                        return (
                                            <div
                                                key={turn.id || turn.pickId || idx}
                                                className={`p-5 rounded-[2rem] border-[1.5px] border-black transition-all ${isPicked ? 'bg-[#e8f7ec] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-gray-50 border-dashed opacity-60'}`}
                                            >
                                                <div className="flex justify-between items-center gap-4">
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border border-black shadow-sm shrink-0 ${isPicked ? 'bg-white' : 'bg-gray-100'}`}>
                                                            <span className="text-[10px] font-black">{turn.turn_index || turn.turnIndex || '-'}</span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[9px] font-black text-black/20 uppercase tracking-widest leading-none mb-1">TEAM</p>
                                                            <h4 className="text-xs font-black truncate uppercase italic leading-none">{turn.team_name || turn.teamName || 'Unknown Team'}</h4>
                                                        </div>
                                                    </div>

                                                    {isPicked ? (
                                                        <div className="flex items-center gap-3 bg-white/50 py-1.5 px-3 rounded-xl border border-black/5 min-w-0">
                                                            <div className="min-w-0 text-right">
                                                                <p className="text-[8px] font-black text-black/40 uppercase tracking-tighter truncate leading-none mb-0.5">PICKED</p>
                                                                <p className="text-[10px] font-black truncate italic leading-none">{turn.student_name || turn.studentName || turn.candidate_name || turn.student?.name}</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 pr-2">
                                                            <Loader2 className="w-2.5 h-2.5 animate-spin text-black/10" />
                                                            <span className="text-[9px] font-black text-black/10 uppercase italic">Pending...</span>
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
        );
    };

    const renderConfirmTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mt-8 lg:mt-12 mb-12 lg:mb-20 animate-in fade-in duration-500 max-w-5xl mx-auto px-4">
            {/* Left Column - Profile/Info */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="mb-2 w-full text-center lg:text-left">
                    <p className="text-[12px] font-medium text-black/50 mb-1">{sessionId}</p>
                    <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tighter mb-4">{sessionName}</h1>

                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border-[1.5px] border-[#D9A55B]/40 bg-[#FFF5D1] shadow-sm mb-8 lg:mb-12">
                        <Clock className="w-4 h-4 text-[#8C6010]" />
                        <span className="text-[14px] font-bold text-[#8C6010]">09:00</span>
                    </div>
                </div>

                <div className="flex flex-col items-center text-center max-w-[300px]">
                    <div className="w-48 h-48 sm:w-64 lg:w-80 sm:h-64 lg:h-80 rounded-full bg-[#F2F1CA] mb-6 shadow-sm flex items-center justify-center border-[1.5px] border-black/5">
                        {selectedCandidate ? (
                            <span className="text-4xl sm:text-6xl font-black text-black/10">{selectedCandidate.name.charAt(0)}</span>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Right Column - Confirm Card */}
            <div className="flex flex-col justify-center items-center lg:items-end mt-0 lg:mt-32">
                <div className="w-full lg:max-w-[480px] bg-white border-[1.5px] border-black rounded-[32px] p-8 sm:p-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)] relative flex flex-col items-center text-center">
                    <h2 className="text-[24px] sm:text-[28px] font-black text-black leading-none mb-4">
                        {selectedCandidate?.name || 'No Candidate'}
                    </h2>
                    <p className="text-[15px] sm:text-[16px] font-medium text-black/70 italic mb-6">
                        {selectedCandidate?.reg_no || 'Please select a candidate first'}
                    </p>

                    <button
                        onClick={handleConfirmPick}
                        disabled={!selectedCandidate || isSubmittingPick}
                        className="w-full sm:max-w-[220px] h-[50px] sm:h-[54px] bg-black hover:bg-black/80 text-white font-bold text-[16px] sm:text-[18px] tracking-wide rounded-[20px] shadow-lg transition-all active:translate-y-[2px] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {isSubmittingPick && <Loader2 className="w-4 h-4 animate-spin" />}
                        Confirmed
                    </button>
                </div>
            </div>
        </div>
    );

    const renderDraftTab = () => {
        // Normalize picks data from teams array
        const allPicks = (draftSummary?.teams || []).flatMap((t: any) =>
            (t.picks || []).map((p: any) => ({
                ...p,
                teamName: t.teamName || t.team_name,
                studentName: p.student?.name || p.studentName || p.student_name,
                studentReg: p.student?.regNo || p.student?.reg_no || p.regNo || p.reg_no
            }))
        ).sort((a: any, b: any) =>
            new Date(b.pickedAt || b.picked_at).getTime() - new Date(a.pickedAt || a.picked_at).getTime()
        );

        return (
            <div className="mt-8 lg:mt-12 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20 px-4">
                <h1 className="text-[32px] sm:text-[40px] lg:text-[48px] font-black leading-none mb-8 lg:mb-12">Auction<br />Summary</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {allPicks.length === 0 ? (
                        <div className="col-span-full py-20 text-center opacity-20 font-black uppercase tracking-widest italic">
                            No picks have been made yet
                        </div>
                    ) : (
                        allPicks.map((pick: any, idx: number) => (
                            <div key={pick.pickId || idx} className="bg-white border-[1.5px] border-black/80 rounded-[12px] p-4 flex flex-col gap-3 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all">
                                <div className="flex items-center">
                                    <div className={`px-2 py-0.5 rounded-full ${getTeamColor(pick.teamName)} flex items-center gap-1.5`}>
                                        <div className="w-2 h-2 rounded-full bg-white opacity-90"></div>
                                        <span className="text-white text-[10px] font-bold tracking-wide">{pick.teamName}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col mt-1 sm:mt-2">
                                    <span className="text-[16px] sm:text-[18px] font-bold text-black leading-none mb-1">{pick.studentName}</span>
                                    <span className="text-[12px] sm:text-[13px] font-medium text-black/40">
                                        {pick.pickedAt ? new Date(pick.pickedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    const renderSummaryTab = () => {
        const currentTeamId = localStorage.getItem('team_id');
        const myTeamData = (draftSummary?.teams || []).find((t: any) => String(t.id || t.teamId) === String(currentTeamId));
        const myPicks = myTeamData?.picks || [];

        return (
            <div className="mt-8 lg:mt-16 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20 px-4">
                {/* Top Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-12 lg:mb-20">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-[#F2F1CA] border border-black/10 flex items-center justify-center shadow-sm shrink-0">
                            <span className="text-lg sm:text-2xl lg:text-[32px] font-black text-black">{myPicks.length}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[13px] sm:text-[15px] lg:text-[17px] font-medium text-black leading-tight truncate">Selected</span>
                            <span className="text-[13px] sm:text-[15px] lg:text-[17px] font-medium text-black leading-tight truncate">Candidates</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 opacity-30">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-[#F2F1CA] border border-black/10 flex items-center justify-center shadow-sm shrink-0">
                            <span className="text-lg sm:text-2xl lg:text-[32px] font-black text-black">-</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[13px] sm:text-[15px] lg:text-[17px] font-medium text-black leading-tight truncate">Budget</span>
                            <span className="text-[13px] sm:text-[15px] lg:text-[17px] font-medium text-black leading-tight truncate">Locked</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-[#F2F1CA] border border-black/10 flex items-center justify-center shadow-sm shrink-0">
                            <span className="text-lg sm:text-2xl lg:text-[32px] font-black text-black">{draftSummary?.totalPicked || 0}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[13px] sm:text-[15px] lg:text-[17px] font-medium text-black leading-tight truncate">Global</span>
                            <span className="text-[13px] sm:text-[15px] lg:text-[17px] font-medium text-black leading-tight truncate">Picks</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-[#F2F1CA] border border-black/10 flex items-center justify-center shadow-sm shrink-0">
                            <span className="text-lg sm:text-2xl lg:text-[32px] font-black text-black">{draftSummary?.totalRemaining || 0}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[13px] sm:text-[15px] lg:text-[17px] font-medium text-black leading-tight truncate">Remaining</span>
                            <span className="text-[13px] sm:text-[15px] lg:text-[17px] font-medium text-black leading-tight truncate">Players</span>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div>
                    <h3 className="text-[20px] sm:text-[24px] font-black text-black mb-6">Your Team's Picks</h3>

                    <div className="space-y-3 sm:space-y-4">
                        {myPicks.length === 0 ? (
                            <div className="p-10 text-center opacity-20 font-black uppercase tracking-widest italic bg-white border border-black/5 rounded-[2rem]">
                                You haven't picked anyone yet
                            </div>
                        ) : (
                            myPicks.map((pick: any, idx: number) => (
                                <div key={pick.pickId || idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full min-h-[64px] py-4 sm:py-0 px-6 sm:px-8 bg-white border-[1.5px] border-black rounded-[24px] sm:rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.08)] transition-all cursor-default gap-2 sm:gap-0">
                                    <span className="text-[13px] sm:text-[15px] font-semibold text-black/50 sm:text-black sm:w-1/4">
                                        {pick.student?.regNo || pick.student?.reg_no || pick.regNo || pick.reg_no || 'N/A'}
                                    </span>
                                    <span className="text-[15px] sm:text-[16px] font-black text-black uppercase sm:w-2/4 sm:text-center tracking-wide italic">
                                        {pick.student?.name || pick.studentName || pick.student_name}
                                    </span>
                                    <div className="flex items-center gap-2 sm:w-1/4 justify-end">
                                        <span className="text-[11px] font-black uppercase text-black/30 tracking-widest">ROUND {pick.round}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoggingIn(true);
            const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

            const response = await axios.post(`${baseUrl}/auth/team/login`, {
                username,
                password,
                auction_id: resolvedId || id
            });

            console.log("Team Login Response:", response.data);

            const data = response.data?.data || response.data;
            const token = response.data?.token || response.data?.access_token || response.data?.data?.token || response.data?.data?.access_token;
            const teamData = response.data?.team || response.data?.data?.team || data;

            // Proper authentication success path
            if (token || teamData) {
                if (token) {
                    localStorage.setItem('team_token', token);
                }

                // Always store the username/details for persistence
                const displayName = teamData?.name || teamData?.username || username;
                let teamId = teamData?.id || teamData?.team_id || teamData?.uuid || data?.id || data?.team_id || response.data?.team_id || response.data?.id;

                // Fallback: Robust JWT decode to get the team ID (sub)
                if (!teamId && token) {
                    try {
                        const base64Url = token.split('.')[1];
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                        }).join(''));
                        const payload = JSON.parse(jsonPayload);
                        teamId = payload.sub;
                    } catch (e) {
                        console.error("Failed to decode JWT for teamId:", e);
                    }
                }

                localStorage.setItem('team_username', displayName);
                localStorage.setItem('team_id', teamId || '');
                localStorage.setItem('team_details', JSON.stringify(teamData));

                // Try to capture and store auction_id from the login response
                const auctionId = teamData?.auction_id || data?.auction_id || teamData?.auctionId || data?.auctionId;
                if (auctionId) {
                    localStorage.setItem('auction_id', auctionId);
                    setResolvedId(auctionId);
                }

                toast.success("Team authenticated successfully!");
                setIsAuthenticated(true);
            } else {
                console.log('Login failed: Invalid response structure', response.data);
                toast.error("Login failed: Could not verify team details.");
            }
        } catch (error: any) {
            console.error("Team Login Error:", error);
            const errMsg = error.response?.data?.message || 'Invalid team credentials or auction not found.';
            toast.error(errMsg);
        } finally {
            setIsLoggingIn(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 font-['Clash_Grotesk',sans-serif]">
                <Toaster position="top-right" />
                <div className="w-full max-w-[460px] bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">

                    <div className="relative z-10 flex flex-col text-center items-center">
                        {/* Logo */}
                        <div className="mb-6 flex justify-center">
                            <img src="/Logo+name.png" alt="Logo" className="h-10 sm:h-12 object-contain" />
                        </div>

                        <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-2 tracking-tight">Team Access</h1>
                        <p className="text-[14px] font-medium text-gray-500 mb-8 max-w-[90%]">Enter your team credentials to join the draft.</p>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-1.5 text-left">
                                <label className="text-[13px] font-medium text-gray-700">Username *</label>
                                <input
                                    type="text"
                                    placeholder="Enter team username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFFF12] focus:ring-1 focus:ring-[#FFFF12] transition-colors text-[14px] placeholder:text-gray-400"
                                />
                            </div>

                            <div className="space-y-1.5 text-left">
                                <label className="text-[13px] font-medium text-gray-700">Password *</label>
                                <input
                                    type="password"
                                    placeholder="Enter team password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFFF12] focus:ring-1 focus:ring-[#FFFF12] transition-colors text-[14px] placeholder:text-gray-400"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoggingIn}
                                    className="w-full h-11 bg-[#FFFF12] text-black font-[600] text-[15px] rounded-xl hover:bg-[#FFFF12]/90 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                                >
                                    {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter Draft Room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <p className="mt-8 text-[12px] font-bold uppercase tracking-widest text-[#198754]">
                    Draft Auction Mode • <span className="text-[#C6A75E]">Live</span>
                </p>
            </div>
        );
    }

    if (!sessionId) {
        return (
            <div className="min-h-screen bg-[#FFFDF8] flex flex-col items-center pt-20 px-4 font-['Clash_Grotesk',sans-serif]">
                <Toaster position="top-right" />
                <div className="w-full max-w-2xl">
                    <h1 className="text-5xl font-black text-black tracking-tighter mb-2">Select Session</h1>
                    <p className="text-black/40 font-medium mb-12 italic">Choose an active session to participate in the draft.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {availableSessions.map((s) => (
                            <div
                                key={s.id}
                                onClick={() => {
                                    setSessionId(s.id);
                                    // Optionally update URL
                                    const newParams = new URLSearchParams(window.location.search);
                                    newParams.set('session', s.id);
                                    navigate(`${window.location.pathname}?${newParams.toString()}`, { replace: true });
                                }}
                                className="bg-white border-[1.5px] border-black p-6 rounded-[24px] cursor-pointer hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center group-hover:bg-[#FF6B6B] transition-colors">
                                        <Clock className="w-5 h-5 text-black group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-black/20">{s.id.slice(0, 8)}</span>
                                </div>
                                <h3 className="text-xl font-black text-black mb-1">{s.name}</h3>
                                <p className="text-sm font-medium text-black/40 uppercase tracking-wide">{s.type || 'Draft'}</p>
                            </div>
                        ))}
                    </div>

                    {isLoadingSessions && (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-black/10" />
                        </div>
                    )}

                    {!isLoadingSessions && availableSessions.length === 0 && (
                        <div className="text-center py-20 bg-black/5 rounded-[32px] border-[1.5px] border-dashed border-black/10">
                            <p className="text-sm font-black uppercase tracking-widest text-black/20">No active sessions found</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-[#FFFDF8] font-['Clash_Grotesk',sans-serif] selection:bg-[#FF6B6B] selection:text-white overflow-x-hidden">

            <Toaster position="top-right" />

            {/* Top Header */}
            <header className="px-4 sm:px-12 py-4 lg:py-5 flex flex-col md:flex-row justify-between items-center gap-4 max-w-[1400px] mx-auto border-b border-black/5 md:border-none">

                {/* Left Toggle Tabs - Scrollable on mobile */}
                <div className="w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                    <div className="flex items-center bg-white border-[1.5px] border-black/10 rounded-full p-1 shadow-sm min-w-max">
                        {(['Home', 'Confirm', 'Draft', 'Summary'] as Tab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 sm:px-6 py-1.5 rounded-full text-[12px] sm:text-[13px] font-bold transition-all whitespace-nowrap ${activeTab === tab
                                    ? 'bg-[#FF6B6B] text-white shadow-sm'
                                    : 'text-black/60 hover:text-black'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right User Area */}
                <div className="flex items-center gap-3 self-end md:self-auto">
                    <div
                        onClick={() => {
                            if (window.confirm("Are you sure you want to log out from this team session?")) {
                                handleLogout();
                            }
                        }}
                        className="flex items-center gap-3 bg-white border-[1.5px] border-black/10 rounded-full py-1.5 pl-4 pr-1.5 shadow-sm hover:border-black/30 transition-all cursor-pointer group"
                    >
                        <div className="flex flex-col items-end">
                            <span className="text-[11px] font-black text-black/40 leading-none">TEAM</span>
                            <span className="text-[13px] font-black text-black leading-none">{localStorage.getItem('team_username') || 'Guest'}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#E8F7EC] border border-black/5 flex items-center justify-center group-hover:bg-[#FFD6D6] transition-colors">
                            <span className="text-[11px] font-black text-[#199D5A] group-hover:text-[#FF6B6B]">
                                {localStorage.getItem('team_username')?.charAt(0).toUpperCase() || 'G'}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="px-4 sm:px-12 max-w-[1400px] mx-auto min-h-[calc(100vh-100px)]">
                {activeTab === 'Home' && renderHomeTab()}
                {activeTab === 'Confirm' && renderConfirmTab()}
                {activeTab === 'Draft' && renderDraftTab()}
                {activeTab === 'Summary' && renderSummaryTab()}
            </main>
        </div>
    );
};
