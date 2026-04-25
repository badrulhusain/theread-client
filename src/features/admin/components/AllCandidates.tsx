import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Plus,
    Search,
    Filter,
    Download,
    Upload,
    MoreHorizontal,
    X,
    ChevronDown,
    Loader2,
    Trash2,
    Edit3,
    Check,
    Table,
    LayoutGrid,
    ListFilter
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Candidate {
    id: string;
    name: string;
    reg_no: string;
    is_active: boolean;
}

interface AllCandidatesProps {
    auctionId?: string;
}

const AllCandidates: React.FC<AllCandidatesProps> = ({ auctionId: propAuctionId }) => {
    const { id: paramAuctionId } = useParams();
    const auctionId = propAuctionId || paramAuctionId;
    // UI State
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const [isCandidateDrawerOpen, setIsCandidateDrawerOpen] = useState(false);
    const [isFetchingCandidates, setIsFetchingCandidates] = useState(false);
    const [isSubmittingCandidate, setIsSubmittingCandidate] = useState(false);

    // Data State
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);

    // Form State
    const [candidateName, setCandidateName] = useState('');
    const [candidateRegNo, setCandidateRegNo] = useState('');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (auctionId) {
            fetchCandidates();
        }
    }, [auctionId]);

    const fetchCandidates = async () => {
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        const token = localStorage.getItem('token');
        try {
            setIsFetchingCandidates(true);
            const response = await axios.get(`${baseUrl}/student`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-auction-id': auctionId
                }
            });
            const allCandidates = Array.isArray(response.data) ? response.data : [];
            const auctionCandidates = allCandidates.filter((c: any) => c.auction_id === auctionId);
            setCandidates(auctionCandidates);
        } catch (error) {
            console.error("Error fetching candidates:", error);
        } finally {
            setIsFetchingCandidates(false);
        }
    };

    const handleOpenCreateDrawer = () => {
        setEditingCandidate(null);
        setCandidateName('');
        setCandidateRegNo('');
        setIsActive(true);
        setIsCandidateDrawerOpen(true);
    };

    const handleOpenEditDrawer = (candidate: Candidate) => {
        setEditingCandidate(candidate);
        setCandidateName(candidate.name);
        setCandidateRegNo(candidate.reg_no);
        setIsActive(candidate.is_active);
        setIsCandidateDrawerOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        const token = localStorage.getItem('token');

        try {
            setIsSubmittingCandidate(true);

            const payload: any = {
                name: candidateName,
                reg_no: candidateRegNo,
                is_active: isActive
            };

            if (editingCandidate) {
                // Update existing
                await axios.patch(`${baseUrl}/student/${editingCandidate.id}`, payload, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-auction-id': auctionId
                    }
                });
                toast.success('Candidate Updated Successfully!');
            } else {
                // Create new
                payload.auction_id = auctionId;
                await axios.post(`${baseUrl}/student`, payload, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-auction-id': auctionId
                    }
                });
                toast.success('Candidate Created Successfully!');
            }

            setIsCandidateDrawerOpen(false);
            setCandidateName('');
            setCandidateRegNo('');
            setIsActive(true);
            fetchCandidates();
        } catch (error: any) {
            console.error("Failed to save candidate", error);
            const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to save candidate';
            toast.error(`Error: ${errorMsg}`);
        } finally {
            setIsSubmittingCandidate(false);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === candidates.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(candidates.map(c => c.id));
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} candidates?`)) return;

        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        const token = localStorage.getItem('token');

        try {
            // Processing deletions one by one for now as per common student rest APIs
            // If the backend supports bulk delete, that would be better
            await Promise.all(selectedIds.map(id =>
                axios.delete(`${baseUrl}/student/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-auction-id': auctionId
                    }
                })
            ));

            setSelectedIds([]);
            fetchCandidates();
        } catch (error) {
            console.error("Error deleting candidates:", error);
            alert("Some candidates could not be deleted.");
        }
    };

    const handleDeleteSingle = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this candidate?")) return;

        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        const token = localStorage.getItem('token');

        try {
            await axios.delete(`${baseUrl}/student/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-auction-id': auctionId
                }
            });
            fetchCandidates();
        } catch (error) {
            console.error("Error deleting candidate:", error);
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            <Toaster position="top-center" />
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 gap-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-1 text-black">Candidates</h2>
                    <p className="text-sm text-gray-500 font-medium text-left">Manage your candidates</p>
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
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-all flex items-center gap-2 text-gray-700">
                        <MoreHorizontal className="w-4 h-4" /> More
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-all flex items-center gap-2 text-gray-700">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-all flex items-center gap-2 text-gray-700">
                        <Upload className="w-4 h-4" /> Import
                    </button>
                    <button
                        onClick={handleOpenCreateDrawer}
                        className="px-5 py-2 bg-[#198754] rounded-full text-sm font-medium hover:bg-[#157347] transition-all flex items-center gap-2 text-white"
                    >
                        <Plus className="w-4 h-4" strokeWidth={3} /> Add Candidate
                    </button>
                </div>
            </div>

            {/* View Controls & Search */}
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex gap-2 p-1">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${viewMode === 'table' ? 'bg-[#198754] text-white' : 'bg-gray-100 text-gray-500 hover:text-black hover:bg-gray-200'}`}
                        >
                            <Table className="w-4 h-4" /> Table
                        </button>
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${viewMode === 'cards' ? 'bg-[#198754] text-white' : 'bg-gray-100 text-gray-500 hover:text-black hover:bg-gray-200'}`}
                        >
                            <LayoutGrid className="w-4 h-4" /> Cards
                        </button>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400">
                        <div className="relative group hidden sm:block border-gray-200 border rounded-full px-3 py-1 flex items-center">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search candidates..."
                                className="pl-6 py-1 bg-transparent border-none outline-none text-sm w-40 focus:ring-0 text-black placeholder:text-gray-400"
                            />
                        </div>
                        <Search className="w-5 h-5 cursor-pointer hover:text-gray-600 sm:hidden" />
                        <Filter className="w-5 h-5 cursor-pointer hover:text-gray-600" />
                        <ListFilter className="w-5 h-5 cursor-pointer hover:text-gray-600" />
                    </div>
                </div>

                {isFetchingCandidates ? (
                    <div className="py-32 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
                        <p className="text-sm font-medium text-gray-400 tracking-wide">Fetching Data...</p>
                    </div>
                ) : candidates.length > 0 ? (
                    viewMode === 'table' ? (
                        /* Table View */
                        <div className="overflow-x-auto text-left min-h-[300px]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-sm font-semibold text-black">
                                        <th className="px-8 py-4 w-14">
                                            <button
                                                onClick={toggleSelectAll}
                                                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${selectedIds.length === candidates.length && candidates.length > 0 ? 'bg-[#198754] border border-[#157347]' : 'border border-gray-300 hover:border-gray-400'}`}
                                            >
                                                {selectedIds.length === candidates.length && candidates.length > 0 && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                            </button>
                                        </th>
                                        <th className="px-6 py-4">Candidate</th>
                                        <th className="px-6 py-4">Team</th>
                                        <th className="px-6 py-4">Section</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {candidates.map((candidate) => (
                                        <tr
                                            key={candidate.id}
                                            className={`border-b last:border-0 border-gray-100 hover:bg-gray-50/50 transition-all ${selectedIds.includes(candidate.id) ? 'bg-gray-50' : ''}`}
                                        >
                                            <td className="px-8 py-4 w-14">
                                                <button
                                                    onClick={() => toggleSelection(candidate.id)}
                                                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${selectedIds.includes(candidate.id) ? 'bg-[#198754] border border-[#157347]' : 'border border-gray-300 hover:border-gray-400'}`}
                                                >
                                                    {selectedIds.includes(candidate.id) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-black">{candidate.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-500">Not Assigned</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-500">-</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-3 text-gray-400">
                                                    <button
                                                        onClick={() => handleOpenEditDrawer(candidate)}
                                                        className="hover:text-black transition-all"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSingle(candidate.id)}
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
                    ) : (
                        /* Cards View */
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                            {candidates.map((candidate) => (
                                <div
                                    key={candidate.id}
                                    className={`relative group bg-white border border-gray-200 rounded-3xl p-6 transition-all hover:shadow-lg ${selectedIds.includes(candidate.id) ? 'bg-gray-50' : ''}`}
                                >
                                    {/* Select Toggle for Card */}
                                    <button
                                        onClick={() => toggleSelection(candidate.id)}
                                        className={`absolute top-4 left-4 w-5 h-5 rounded-full flex items-center justify-center transition-all z-10 ${selectedIds.includes(candidate.id) ? 'bg-[#198754] border border-[#146c43]' : 'border border-gray-300 bg-white hover:border-gray-400'}`}
                                    >
                                        {selectedIds.includes(candidate.id) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                    </button>

                                    {/* Action Buttons for Card */}
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button
                                            onClick={() => handleOpenEditDrawer(candidate)}
                                            className="p-1.5 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all text-gray-500 hover:text-black shadow-sm"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSingle(candidate.id)}
                                            className="p-1.5 bg-white border border-gray-200 rounded-full hover:bg-red-50 hover:text-red-500 transition-all text-gray-500 shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            className="p-1.5 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all text-gray-500 hover:text-black shadow-sm"
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="mt-6 flex flex-col justify-center items-center">
                                        <div className="w-16 h-16 rounded-full border-[2.5px] border-[#198754] p-[1.5px] mb-3">
                                            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-lg font-bold text-gray-600">
                                                {candidate.name.charAt(0)}
                                            </div>
                                        </div>
                                        <h4 className="text-[17px] font-bold tracking-tight text-center">{candidate.name}</h4>
                                        <div className="flex items-center justify-center gap-2 mt-1">
                                            <span className="text-xs font-bold text-gray-400">#{candidate.reg_no}</span>
                                            <span className="text-[10px] font-medium px-2 py-0.5 border border-gray-200 rounded-full text-gray-600">
                                                General
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3 text-xs">
                                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                            <span className="font-medium text-gray-500">Not Joined</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    /* Empty State */
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                        <p className="text-sm font-medium text-black">No candidates found</p>
                    </div>
                )}

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <span>Showing 1 to {candidates.length} of {candidates.length} results</span>
                        <span>â€¢</span>
                        <div className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-1 cursor-pointer">
                            15 <ChevronDown className="w-3 h-3" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-left">
                        <button className="p-1 hover:text-black transition-colors"><ChevronDown className="w-4 h-4 rotate-90" /></button>
                        <span className="font-medium text-black">Page 1 of {Math.ceil(candidates.length / 15) || 1}</span>
                        <button className="p-1 hover:text-black transition-colors"><ChevronDown className="w-4 h-4 -rotate-90" /></button>
                    </div>
                </div>
            </div>

            {/* Candidate Side Drawer (Create/Edit) */}
            {isCandidateDrawerOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-end">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsCandidateDrawerOpen(false)}
                    />
                    <div className="relative w-full max-w-[500px] bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col p-8 rounded-l-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-[20px] font-bold text-gray-900">
                                {editingCandidate ? 'Edit Candidate' : 'Add Candidate'}
                            </h2>
                            <button
                                onClick={() => setIsCandidateDrawerOpen(false)}
                                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form className="flex flex-col flex-1" onSubmit={handleSubmit}>
                            <div className="space-y-6 flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[13px] font-medium text-gray-800 flex items-center gap-1">
                                            Chest Number *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter chest number"
                                            value={candidateRegNo}
                                            onChange={(e) => setCandidateRegNo(e.target.value)}
                                            required
                                            className="w-full px-4 py-2 border border-[#7C3AED]/30 rounded-full outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all text-[14px] placeholder:text-gray-400 shadow-[0_0_0_1px_rgba(124,58,237,0.15)]"
                                        />
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[13px] font-medium text-gray-800 flex items-center gap-1">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter candidate name"
                                            value={candidateName}
                                            onChange={(e) => setCandidateName(e.target.value)}
                                            required
                                            className="w-full px-4 py-2 border border-gray-200 rounded-full outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all text-[14px] placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsActive(!isActive)}
                                        className={`w-11 h-6 rounded-full relative transition-colors ${isActive ? 'bg-[#7C3AED]' : 'bg-gray-200'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-[4px] transition-transform duration-300 shadow-sm ${isActive ? 'translate-x-[22px]' : 'translate-x-[4px]'}`} />
                                    </button>
                                    <span className="text-[13px] font-medium text-gray-800">
                                        Active Candidate
                                    </span>
                                </div>
                            </div>

                            <div className="mt-auto pt-6 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmittingCandidate}
                                    className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white px-6 py-2.5 rounded-full font-semibold text-[13px] transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                                >
                                    {isSubmittingCandidate && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingCandidate ? 'Update Candidate' : 'Add Candidate'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllCandidates;
