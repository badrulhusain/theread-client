import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus,
    Search,
    X,
    Loader2,
    User,
    Layers,
    Trash2,
    Edit3,
    Check
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useParams } from 'react-router-dom';

interface AllTeamProps {
    auctionId: string;
    auctionType?: string;
}

const AllTeam: React.FC<AllTeamProps> = ({ auctionId, auctionType }) => {
    const { id: urlId } = useParams();
    const effectiveAuctionId = auctionId || urlId;
    const [isTeamDrawerOpen, setIsTeamDrawerOpen] = useState(false);
    const [isFetchingTeams, setIsFetchingTeams] = useState(false);
    const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);

    // Data State
    const [teams, setTeams] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [editingTeam, setEditingTeam] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [teamName, setTeamName] = useState('');
    const [teamUsername, setTeamUsername] = useState('');
    const [teamPassword, setTeamPassword] = useState('');
    const [teamBudget, setTeamBudget] = useState('1000000');
    const [teamStatus, setTeamStatus] = useState('ACTIVE');

    useEffect(() => {
        if (effectiveAuctionId) {
            fetchTeams();
        }
    }, [effectiveAuctionId]);

    const fetchTeams = async () => {
        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        try {
            setIsFetchingTeams(true);
            const response = await axios.get(`${baseUrl}/team`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-auction-id': effectiveAuctionId
                }
            });
            const allTeams = Array.isArray(response.data) ? response.data :
                (Array.isArray(response.data?.data) ? response.data.data : []);
            const auctionTeams = allTeams.filter((t: any) => t.auction_id === effectiveAuctionId);
            setTeams(auctionTeams);
        } catch (error) {
            console.error("Error fetching teams:", error);
        } finally {
            setIsFetchingTeams(false);
        }
    };

    const handleOpenCreateDrawer = () => {
        setEditingTeam(null);
        setTeamName('');
        setTeamUsername('');
        setTeamPassword('');
        setTeamBudget('1000000');
        setTeamStatus('ACTIVE');
        setIsTeamDrawerOpen(true);
    };

    const handleOpenEditDrawer = (team: any) => {
        setEditingTeam(team);
        setTeamName(team.name);
        setTeamUsername(team.username);
        setTeamPassword(''); // Don't show password hash
        setTeamBudget(team.total_budget.toString());
        setTeamStatus(team.status || 'ACTIVE');
        setIsTeamDrawerOpen(true);
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const filtered = teams.filter(t =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (selectedIds.length === filtered.length && filtered.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filtered.map(t => t.id));
        }
    };

    const handleDeleteSingle = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this team?")) return;
        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        try {
            await axios.delete(`${baseUrl}/team/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-auction-id': effectiveAuctionId
                }
            });
            toast.success('Team Deleted!');
            fetchTeams();
            setSelectedIds(prev => prev.filter(i => i !== id));
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete team");
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Delete ${selectedIds.length} teams?`)) return;

        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

        try {
            await Promise.all(selectedIds.map(id =>
                axios.delete(`${baseUrl}/team/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-auction-id': effectiveAuctionId
                    }
                })
            ));
            toast.success(`${selectedIds.length} Teams Deleted!`);
            setSelectedIds([]);
            fetchTeams();
        } catch (error) {
            console.error("Bulk delete failed", error);
            toast.error("Some teams could not be deleted");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

        try {
            setIsSubmittingTeam(true);
            const payload: any = {
                name: teamName,
                username: teamUsername,
                auction_id: effectiveAuctionId,
                total_budget: Number(teamBudget),
                status: teamStatus
            };

            if (teamPassword) {
                payload.password_hash = teamPassword;
            }

            if (editingTeam) {
                await axios.patch(`${baseUrl}/team/${editingTeam.id}`, payload, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-auction-id': effectiveAuctionId
                    }
                });
                toast.success('Team Updated Successfully!');
            } else {
                await axios.post(`${baseUrl}/team`, payload, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-auction-id': effectiveAuctionId
                    }
                });
                toast.success('Team Created Successfully!');
            }

            setIsTeamDrawerOpen(false);
            fetchTeams();
        } catch (error: any) {
            console.error("Failed to save team", error);
            const msg = error.response?.data?.message || "Failed to save team";
            toast.error(msg);
        } finally {
            setIsSubmittingTeam(false);
        }
    };

    const filteredTeams = teams.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="animate-in fade-in duration-500">
            <Toaster position="top-center" />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 gap-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-1 text-black">Teams</h2>
                    <p className="text-sm text-gray-500 font-medium text-left">Manage candidate teams ({teams.length} total)</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleDeleteSelected}
                            className="px-4 py-2 bg-red-50 border border-red-200 rounded-full text-sm font-medium text-red-600 hover:bg-red-100 transition-all flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" /> Delete ({selectedIds.length})
                        </button>
                    )}
                    <button
                        onClick={handleOpenCreateDrawer}
                        className="px-5 py-2 bg-[#198754] rounded-full text-sm font-medium hover:bg-[#157347] transition-all flex items-center gap-2 text-white"
                    >
                        <Plus className="w-4 h-4" /> Add Team
                    </button>
                </div>
            </div>

            {/* Table UI */}
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex gap-2 p-1">
                        <button className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium bg-[#198754] text-white transition-all">
                            <Layers className="w-4 h-4" /> Table
                        </button>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400">
                        <div className="relative group hidden sm:flex items-center border border-gray-200 rounded-full px-3 py-1">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search teams..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-6 py-1 bg-transparent border-none outline-none text-sm w-40 focus:ring-0 text-black placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-sm font-semibold text-black">
                                <th className="px-8 py-4 w-14">
                                    <button
                                        onClick={toggleSelectAll}
                                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${filteredTeams.length > 0 && selectedIds.length === filteredTeams.length ? 'bg-[#198754] border border-[#157347]' : 'border border-gray-300 hover:border-gray-400'}`}
                                    >
                                        {filteredTeams.length > 0 && selectedIds.length === filteredTeams.length && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                    </button>
                                </th>
                                <th className="px-6 py-4">Team</th>
                                {auctionType === 'ENGLISH' && <th className="px-6 py-4">Budget</th>}
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isFetchingTeams ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center">
                                        <Loader2 className="w-10 h-10 animate-spin mx-auto text-gray-400" />
                                        <p className="text-sm font-medium text-gray-400 tracking-wide mt-2">Fetching Data...</p>
                                    </td>
                                </tr>
                            ) : filteredTeams.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center">
                                        <p className="text-sm font-medium text-black">
                                            {searchQuery ? "No matching teams found" : "No Teams Created Yet"}
                                        </p>
                                    </td>
                                </tr>
                            ) : filteredTeams.map((team) => (
                                <tr key={team.id} className={`border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-all ${selectedIds.includes(team.id) ? 'bg-gray-50' : ''}`}>
                                    <td className="px-8 py-4 w-14">
                                        <button
                                            onClick={() => toggleSelection(team.id)}
                                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${selectedIds.includes(team.id) ? 'bg-[#198754] border border-[#157347]' : 'border border-gray-300 hover:border-gray-400'}`}
                                        >
                                            {selectedIds.includes(team.id) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-black">{team.name}</span>
                                                <span className="text-xs font-medium text-gray-400">{team.username}</span>
                                            </div>
                                        </div>
                                    </td>
                                    {auctionType === 'ENGLISH' && (
                                        <td className="px-6 py-4 text-left">
                                            <span className="text-sm font-medium text-black">
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(team.total_budget)}
                                            </span>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-left">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${team.status === 'ACTIVE' || !team.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {team.status || 'ACTIVE'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-3 text-gray-400">
                                            <button
                                                onClick={() => handleOpenEditDrawer(team)}
                                                className="hover:text-black transition-all"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSingle(team.id)}
                                                className="hover:text-red-500 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Team Side Drawer */}
            {isTeamDrawerOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-end">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsTeamDrawerOpen(false)}
                    />
                    <div className="relative w-full max-w-[500px] bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col p-8 rounded-l-2xl">
                        <div className="flex justify-between items-start mb-8">
                            <h2 className="text-[20px] font-bold text-gray-900 leading-none pt-1">
                                {editingTeam ? 'Edit Team' : 'Create Team'}
                            </h2>
                            <button
                                onClick={() => setIsTeamDrawerOpen(false)}
                                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            >
                                <X className="w-5 h-5" strokeWidth={1.5} />
                            </button>
                        </div>

                        <form className="flex flex-col flex-1 overflow-y-auto scrollbar-hide" onSubmit={handleSubmit}>
                            <div className="space-y-6 flex-1 pr-2">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-[13px] font-medium text-gray-800 flex items-center gap-1">
                                        Team Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter team name"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-black/10 rounded-full outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all text-[14px] placeholder:text-gray-400"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[13px] font-medium text-gray-800 flex items-center gap-1">
                                            Username *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter username"
                                            value={teamUsername}
                                            onChange={(e) => setTeamUsername(e.target.value)}
                                            required
                                            className="w-full px-4 py-2 border border-black/10 rounded-full outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all text-[14px] placeholder:text-gray-400"
                                        />
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[13px] font-medium text-gray-800 flex items-center gap-1">
                                            Password *
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                            value={teamPassword}
                                            onChange={(e) => setTeamPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-2 border border-black/10 rounded-full outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all text-[14px] placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>

                                {auctionType === 'ENGLISH' && <div className="space-y-1.5 text-left">
                                    <label className="text-[13px] font-medium text-gray-800 flex items-center gap-1">
                                        Total Budget *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">₹</span>
                                        <input
                                            type="number"
                                            placeholder="10,00,000"
                                            value={teamBudget}
                                            onChange={(e) => setTeamBudget(e.target.value)}
                                            required
                                            className="w-full pl-9 pr-4 py-2 border border-black/10 rounded-full outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all text-[14px] placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>}

                                <div className="flex items-center gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setTeamStatus(teamStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                                        className={`w-11 h-6 rounded-full relative transition-colors ${teamStatus === 'ACTIVE' || !teamStatus ? 'bg-[#7C3AED]' : 'bg-gray-200'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-[4px] transition-transform duration-300 shadow-sm ${teamStatus === 'ACTIVE' || !teamStatus ? 'translate-x-[22px]' : 'translate-x-[4px]'}`} />
                                    </button>
                                    <span className="text-[13px] font-medium text-gray-800">
                                        Active Team
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmittingTeam}
                                    className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white px-6 py-2.5 rounded-full font-semibold text-[13px] transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                                >
                                    {isSubmittingTeam && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingTeam ? 'Update Team' : 'Create Team'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllTeam;
