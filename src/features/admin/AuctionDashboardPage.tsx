import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    LayoutDashboard,
    Plus,
    ArrowRight,
    ChevronDown,
    LogOut,
    User,
    Settings,
    Loader2,
    Clock,
    Mail,
    Phone,
    Menu,
    X,
    Users,
    Calendar,
    Trophy
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import AllCandidates from './components/AllCandidates';
import AllTeam from './components/AllTeam';
import AllGroups from './components/AllGroups';
import GroupDetails from './components/GroupDetails';
import AllSessions from './components/AllSessions';
import DraftAuction from './session/DraftAuction';
import EnglishAuction from './session/EnglishAuction';

interface Auction {
    id: string;
    name: string;
    auction_type: string;
    status: string;
    venue?: string;
    institution_name?: string;
    contact_email?: string;
    contact_phone?: string;
    start_date?: string;
    end_date?: string;
    budget_per_team?: string;
    num_teams?: string;
    players_per_team?: string;
    subdomain?: string;
    createdAt?: string;
}

export const AuctionDashboardPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [userName, setUserName] = useState('Admin User');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [auction, setAuction] = useState<Auction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [selectedSessionType, setSelectedSessionType] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCandidateMenuOpen, setIsCandidateMenuOpen] = useState(false);

    const [teams, setTeams] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setIsSidebarOpen(false);
    };

    const fetchSessionsPreview = async (resolvedId?: string) => {
        const targetId = resolvedId || id;
        if (!targetId) return;
        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        try {
            const response = await axios.get(`${baseUrl}/auction/${targetId}/session`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-auction-id': targetId
                }
            });
            const allSessions = Array.isArray(response.data) ? response.data :
                (Array.isArray(response.data?.data) ? response.data.data : []);
            setSessions(allSessions);
        } catch (error) {
            console.error("Error fetching sessions preview:", error);
        }
    };

    const fetchTeamsPreview = async (resolvedId?: string) => {
        const targetId = resolvedId || id;
        if (!targetId) return;
        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        try {
            const response = await axios.get(`${baseUrl}/team`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-auction-id': targetId
                }
            });
            const allTeams = Array.isArray(response.data) ? response.data : [];
            const auctionTeams = allTeams.filter((t: any) => t.auction_id === targetId);
            setTeams(auctionTeams);
        } catch (error) {
            console.error("Error fetching teams preview:", error);
        }
    };

    const fetchGroupsPreview = async (resolvedId?: string) => {
        const targetId = resolvedId || id;
        if (!targetId) return;
        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        try {
            const response = await axios.get(`${baseUrl}/group`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-auction-id': targetId
                }
            });
            const allGroups = Array.isArray(response.data) ? response.data : [];
            const auctionGroups = allGroups.filter((g: any) => g.auction_id === targetId);
            setGroups(auctionGroups);
        } catch (error) {
            console.error("Error fetching groups preview:", error);
        }
    };

    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        if (storedName) setUserName(storedName);

        const fetchAuction = async () => {
            const token = localStorage.getItem('token');
            const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

            try {
                setIsLoading(true);
                // Try fetching by ID first
                try {
                    const response = await axios.get(`${baseUrl}/auction/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'x-auction-id': id
                        }
                    });
                    const auctionData = response.data;
                    setAuction(auctionData);

                    // If it has a subdomain and we're currently using the technical ID, redirect to slug URL
                    if (auctionData.subdomain && id === auctionData.id) {
                        navigate(`/admin/auction/${auctionData.subdomain}`, { replace: true });
                        return; // Let the next cycle handle fetches
                    }

                    // After success, we can trigger other fetches with the ACTUAL UUID
                    const uuid = auctionData.id;
                    fetchTeamsPreview(uuid);
                    fetchGroupsPreview(uuid);
                    fetchSessionsPreview(uuid);
                } catch (err) {
                    // If fetching by ID fails, it might be a subdomain/slug
                    console.log("Fetching by ID failed, trying subdomain search...");
                    const allRes = await axios.get(`${baseUrl}/auction`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const allAuctions = Array.isArray(allRes.data) ? allRes.data : (allRes.data?.data || []);
                    const matched = allAuctions.find((a: any) => a.subdomain === id || a.id === id);

                    if (matched) {
                        setAuction(matched);

                        // If we are currently on the technical UUID but a subdomain exists, handle redirect
                        // Or if we found it by subdomain, we are already good.
                        if (matched.subdomain && id === matched.id) {
                            navigate(`/admin/auction/${matched.subdomain}`, { replace: true });
                            return;
                        }

                        // Use the ACTUAL UUID for further API calls to be safe
                        fetchTeamsPreview(matched.id);
                        fetchGroupsPreview(matched.id);
                        fetchSessionsPreview(matched.id);
                    } else {
                        throw new Error("Auction not found");
                    }
                }
            } catch (error) {
                console.error("Error fetching auction details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchAuction();
        }
    }, [id]);

    const handleSignOut = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFEFEF] flex-col gap-4 font-['Clash Grotesk']">
                <Loader2 className="w-10 h-10 animate-spin text-[#E76F6F]" />
                <p className="text-sm font-black uppercase tracking-widest text-black/40">Loading Auction Details...</p>
            </div>
        );
    }

    if (!auction) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFEFEF] flex-col gap-4 font-['Clash Grotesk']">
                <h1 className="text-2xl font-black">Auction Not Found</h1>
                <Link to="/admin/dashboard" className="text-[#E76F6F] font-bold underline">Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="flex min-h-[100dvh] bg-[#f8f9fa] font-['Clash Grotesk',sans-serif] relative overflow-hidden text-left">
            <Toaster position="top-center" />

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white flex flex-col p-6 border-r border-black/5 z-50 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FFFF12]/20 rounded-full flex items-center justify-center text-black font-bold text-sm">
                            {auction.name.charAt(0)}
                        </div>
                        <div className="text-left">
                            <h1 className="text-[15px] font-bold tracking-tight leading-none text-gray-900 uppercase">{auction.name}</h1>
                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-0.5 block">{auction.auction_type}</span>
                        </div>
                    </div>
                    <button className="lg:hidden p-1 text-black/40 hover:text-black" onClick={() => setIsSidebarOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                    <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] mb-6 pl-2 text-left">Menu</p>
                    <ul className="space-y-6">
                        <li>
                            <button
                                onClick={() => handleTabChange('Dashboard')}
                                className={`flex items-center gap-3 px-2 text-sm font-bold transition-all ${activeTab === 'Dashboard' ? 'text-black' : 'text-black/40 hover:text-black'}`}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </button>
                        </li>

                        <li className="space-y-4">
                            <div
                                className="flex items-center justify-between px-2 text-sm font-bold text-black cursor-pointer"
                                onClick={() => setIsCandidateMenuOpen(!isCandidateMenuOpen)}
                            >
                                <div className="flex items-center gap-3">
                                    <User className="w-4 h-4" />
                                    Candidate
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isCandidateMenuOpen ? 'rotate-180' : ''}`} />
                            </div>
                            {isCandidateMenuOpen && (
                                <ul className="pl-9 space-y-4 text-left animate-in slide-in-from-top-2 fade-in duration-200">
                                    {['All Candidates', 'Teams', 'Groups'].map(item => (
                                        <li key={item}>
                                            <button
                                                onClick={() => handleTabChange(item)}
                                                className={`text-[13px] font-bold block transition-all ${activeTab === item ? 'text-black' : 'text-black/40 hover:text-black'}`}
                                            >
                                                {item}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                        <li>
                            <button
                                onClick={() => handleTabChange('Sessions')}
                                className={`flex items-center gap-3 px-2 text-sm font-bold transition-all ${activeTab === 'Sessions' ? 'text-black' : 'text-black/40 hover:text-black'}`}
                            >
                                <Clock className="w-4 h-4" />
                                Sessions
                            </button>
                        </li>
                    </ul>
                </nav>

                <div className="mt-auto pt-6 border-t border-black/5 space-y-4">
                    <button className="flex items-center gap-3 px-2 text-sm font-bold text-black/40 hover:text-black transition-all">
                        <Settings className="w-4 h-4" />
                        Go to Settings
                    </button>
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="flex items-center gap-3 px-2 text-sm font-bold text-black hover:text-[#E76F6F] transition-all"
                    >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                        Exit to main
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 bg-gray-50/30 overflow-y-auto max-w-full">
                {/* Top Sticky Bar */}
                <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-4 border-b border-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] font-black text-black/30">
                        <button
                            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 mr-1 text-black"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-4 h-4" />
                        </button>
                        <LayoutDashboard className="w-3 h-3 hidden sm:block" />
                        <span className="hidden sm:block">Admin</span>
                        <ChevronDown className="w-3 h-3 -rotate-90 hidden sm:block" />
                        <span className="text-black/80">{activeTab}</span>
                    </div>

                    <div className="flex items-center gap-4 relative">
                        <div
                            className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-black/10 cursor-pointer group"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white text-[13px] font-bold uppercase transition-transform group-hover:scale-105 shadow-sm">
                                {userName.charAt(0)}
                            </div>
                            <ChevronDown className={`w-4 h-4 text-black/40 group-hover:text-black transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute top-10 right-0 w-40 bg-white border border-black shadow-xl rounded-xl overflow-hidden py-1 z-50">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#E76F6F] hover:bg-[#FFEFEF] transition-all"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dynamic Content */}
                <div className="p-4 sm:p-8 lg:p-12 text-left">
                    {activeTab === 'Dashboard' ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-in slide-in-from-bottom-8 duration-500">
                            {/* Sessions */}
                            <div className="bg-[#ffffff] border border-gray-100 rounded-[2rem] p-8 flex flex-col shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow min-h-[300px] relative overflow-hidden group">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Sessions</h3>
                                    <button
                                        onClick={() => setActiveTab('Sessions')}
                                        className="text-[11px] font-bold uppercase text-[#7C3AED] hover:underline transition-colors"
                                    >
                                        View All
                                    </button>
                                </div>

                                {sessions.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                                        <h4 className="text-[15px] font-bold text-gray-400 mb-2 uppercase tracking-wider">No Active Sessions</h4>
                                        <p className="text-[12px] text-gray-400 font-medium max-w-[200px] mb-6 leading-relaxed">
                                            Create your first session to start organizing candidates
                                        </p>
                                        <button
                                            onClick={() => setActiveTab('Sessions')}
                                            className="bg-[#FFFF12] px-6 py-2.5 rounded-[1.5rem] font-bold text-black border-[1.5px] border-black/10 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.05)] hover:scale-105 transition-all flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" strokeWidth={3} />
                                            CREATE SESSION
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                                        {sessions.map((session: any) => (
                                            <div
                                                key={session.id}
                                                onClick={() => {
                                                    setSelectedSessionId(session.id);
                                                    setSelectedSessionType(auction.auction_type);
                                                    setActiveTab('Sessions');
                                                }}
                                                className="flex items-center justify-between p-4 bg-[#ffffff] rounded-[1.5rem] border-[1.5px] border-gray-100 hover:border-[#7C3AED]/30 shadow-sm hover:shadow-md transition-all cursor-pointer group/item"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover/item:bg-[#7C3AED]/10 transition-colors">
                                                        <Clock className="w-5 h-5 text-gray-400 group-hover/item:text-[#7C3AED] transition-colors" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[15px] font-bold text-gray-800 block mb-0.5 group-hover/item:text-[#7C3AED] transition-colors">{session.name}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Session #{session.session_number}</span>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase ${session.status === 'ACTIVE' ? 'bg-[#198754]/10 text-[#198754]' : 'bg-gray-100 text-gray-500'}`}>
                                                    {session.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Auction Details */}
                            <div className="bg-[#ffffff] border border-gray-100 rounded-[2rem] p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Auction Details</h3>
                                </div>
                                <div className="space-y-5">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">Institution Full Name</span>
                                        <span className="text-[15px] font-bold text-gray-800 bg-gray-50/50 px-3 py-2 rounded-xl border border-gray-100">{auction.institution_name || 'Not Specified'}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">Start Date</span>
                                            <span className="text-[14px] font-bold text-[#7C3AED] bg-[#7C3AED]/5 px-3 py-2 rounded-xl border border-[#7C3AED]/10">{auction.start_date ? new Date(auction.start_date).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">End Date</span>
                                            <span className="text-[14px] font-bold text-[#C6A75E] bg-[#C6A75E]/5 px-3 py-2 rounded-xl border border-[#C6A75E]/10">{auction.end_date ? new Date(auction.end_date).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">Contact Phone</span>
                                            <span className="text-[13px] font-bold text-gray-600 bg-gray-50/50 px-3 py-2 rounded-xl border border-gray-100">{auction.contact_phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">Support Email</span>
                                            <span className="text-[13px] font-bold text-gray-600 bg-gray-50/50 px-3 py-2 rounded-xl border border-gray-100 truncate" title={auction.contact_email}>{auction.contact_email || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Public Auction Link</span>
                                            <a
                                                href={`${window.location.origin}/auction/${auction.subdomain || auction.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[13px] font-bold text-[#7C3AED] underline underline-offset-4 decoration-[#7C3AED]/30 hover:decoration-[#7C3AED] truncate block bg-[#7C3AED]/5 px-3 py-2 rounded-xl border border-[#7C3AED]/10 transition-all flex items-center gap-2 w-fit"
                                            >
                                                {window.location.origin}/auction/{auction.subdomain || auction.id}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Auction Config (if ENGLISH) */}
                            {auction.auction_type === 'ENGLISH' && (
                                <div className="bg-[#ffffff] xl:col-span-2 border border-gray-100 rounded-[2rem] p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="text-xl font-bold mb-6 text-gray-900 border-b border-gray-50 pb-4">Auction Config</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="p-5 bg-gradient-to-br from-[#198754]/5 to-[#198754]/10 border border-[#198754]/20 rounded-[1.5rem] flex flex-col items-center justify-center text-center">
                                            <span className="text-[10px] font-bold text-[#198754]/70 uppercase tracking-widest mb-1.5">Budget / Team</span>
                                            <span className="text-[22px] font-black text-[#198754]">₹{Number(auction.budget_per_team || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-[1.5rem] flex flex-col items-center justify-center text-center">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Players / Team</span>
                                            <span className="text-[22px] font-black text-gray-800">{auction.players_per_team || '0'}</span>
                                        </div>
                                        <div className="p-5 bg-gradient-to-br from-[#7C3AED]/5 to-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-[1.5rem] flex flex-col items-center justify-center text-center">
                                            <span className="text-[10px] font-bold text-[#7C3AED]/70 uppercase tracking-widest mb-1.5">Total Teams</span>
                                            <span className="text-[22px] font-black text-[#7C3AED]">{auction.num_teams || '0'}</span>
                                        </div>
                                        <div className="p-5 bg-gradient-to-br from-[#FFFF12]/10 to-[#FFFF12]/20 border border-[#FFFF12]/30 rounded-[1.5rem] flex flex-col items-center justify-center text-center">
                                            <span className="text-[10px] font-bold text-yellow-700 uppercase tracking-widest mb-1.5">Status</span>
                                            <span className="text-sm font-black uppercase text-yellow-800">{auction.status}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Teams */}
                            <div className="bg-[#ffffff] border border-gray-100 rounded-[2rem] p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Teams</h3>
                                    <button
                                        onClick={() => setActiveTab('Teams')}
                                        className="text-[11px] font-bold uppercase text-[#7C3AED] hover:underline transition-colors"
                                    >
                                        Manage
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {teams.length === 0 ? (
                                        <div className="text-[13px] font-medium text-gray-400 py-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">No teams added yet</div>
                                    ) : (
                                        teams.slice(0, 4).map((team: any) => (
                                            <div
                                                key={team.id}
                                                onClick={() => handleTabChange('Teams')}
                                                className="flex flex-col gap-2 p-4 bg-[#ffffff] rounded-[1.2rem] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#198754]/30 hover:shadow-md transition-all cursor-pointer group/item relative overflow-hidden"
                                            >
                                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#198754] scale-y-50 group-hover/item:scale-y-100 transition-transform origin-center"></div>
                                                <div className="flex items-center justify-between pl-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-[#198754]/10 flex items-center justify-center group-hover/item:bg-[#198754]/20 transition-colors">
                                                            <Users className="w-4 h-4 text-[#198754]" />
                                                        </div>
                                                        <span className="text-[15px] font-bold text-gray-800">{team.name}</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase bg-[#FFFF12]/30 text-yellow-800 px-2.5 py-1 rounded-full">{team.status || 'Active'}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Groups */}
                            <div className="bg-[#ffffff] border border-gray-100 rounded-[2rem] p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                                    <h3 className="text-[16px] font-bold text-[#001736]">Groups / Categories</h3>
                                    <button
                                        onClick={() => setActiveTab('Groups')}
                                        className="text-[11px] font-bold uppercase text-[#7C3AED] hover:underline transition-colors"
                                    >
                                        Manage
                                    </button>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {groups.length === 0 ? (
                                        <div className="text-[13px] font-medium text-gray-400 py-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">No groups added yet</div>
                                    ) : (
                                        groups.slice(0, 5).map((group: any) => (
                                            <div
                                                key={group.id}
                                                onClick={() => { setSelectedGroupId(group.id); handleTabChange('Groups'); }}
                                                className="flex items-center justify-between p-3.5 px-4 bg-gray-50 rounded-[1rem] border border-transparent hover:border-[#C6A75E]/30 hover:bg-[#C6A75E]/5 transition-all cursor-pointer group/item"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[#ffffff] border border-gray-200 flex items-center justify-center group-hover/item:border-[#C6A75E]/30">
                                                        <Trophy className="w-4 h-4 text-[#C6A75E]" />
                                                    </div>
                                                    <span className="text-[14px] font-bold text-gray-800 group-hover/item:text-[#C6A75E]">{group.value}</span>
                                                </div>
                                                <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                    <ChevronDown className="w-3 h-3 -rotate-90 text-gray-400" />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'All Candidates' ? (
                        <AllCandidates auctionId={auction?.id || id || ''} />
                    ) : activeTab === 'Teams' ? (
                        <AllTeam auctionId={auction?.id || id || ''} auctionType={auction.auction_type || 'Draft'} />
                    ) : activeTab === 'Groups' ? (
                        selectedGroupId ? (
                            <GroupDetails
                                groupId={selectedGroupId}
                                auctionId={auction?.id || id || ''}
                                onBack={() => setSelectedGroupId(null)}
                            />
                        ) : (
                            <AllGroups auctionId={auction?.id || id || ''} onGroupClick={(groupId) => setSelectedGroupId(groupId)} />
                        )
                    ) : activeTab === 'Sessions' ? (
                        selectedSessionId ? (
                            selectedSessionType?.toLowerCase() === 'draft' ? (
                                <DraftAuction
                                    sessionId={selectedSessionId}
                                    auctionId={auction?.id || id || ''}
                                    subdomain={auction?.subdomain}
                                    onBack={() => setSelectedSessionId(null)}
                                />
                            ) : (
                                <EnglishAuction
                                    sessionId={selectedSessionId}
                                    auctionId={auction?.id || id || ''}
                                    onBack={() => setSelectedSessionId(null)}
                                />
                            )
                        ) : (
                            <AllSessions
                                auctionId={auction?.id || id || ''}
                                auctionType={auction.auction_type || 'Draft'}
                                onSessionClick={(sessionId, type) => {
                                    setSelectedSessionId(sessionId);
                                    setSelectedSessionType(type);
                                }}
                            />
                        )
                    ) : (
                        <div className="animate-in fade-in duration-500 py-20 text-center">
                            <h2 className="text-2xl font-black text-black/20 italic">{activeTab} Section</h2>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AuctionDashboardPage;
