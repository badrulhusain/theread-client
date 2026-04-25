import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search,
    ArrowLeft,
    Loader2,
    Users,
    Check,
    ChevronDown,

    UserPlus,
    X,
    Trash2,
    BarChart2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Group {
    id: string;
    key: string;
    value: string;
    auction_id: string;
}

interface Candidate {
    id: string;
    name: string;
    reg_no: string;
    team_name?: string;
    section?: string;
    gender?: string;
    status?: string;
    is_active: boolean;
    group_id?: string;
}

interface GroupDetailsProps {
    groupId: string;
    auctionId: string;
    onBack: () => void;
}

const GroupDetails: React.FC<GroupDetailsProps> = ({ groupId, auctionId, onBack }) => {
    const [group, setGroup] = useState<Group | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [allAuctionCandidates, setAllAuctionCandidates] = useState<Candidate[]>([]);
    const [associations, setAssociations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchGroupAndCandidates();
    }, [groupId]);

    const fetchGroupAndCandidates = async () => {
        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        const headers = {
            'Authorization': `Bearer ${token}`,
            'x-auction-id': auctionId
        };

        try {
            setIsLoading(true);

            // 1. Fetch Group Details
            try {
                const groupRes = await axios.get(`${baseUrl}/group`, { headers });
                const groupData = groupRes.data?.data || groupRes.data;
                const currentGroup = Array.isArray(groupData) ? groupData.find((g: any) => g.id === groupId) : null;
                setGroup(currentGroup);
            } catch (err) {
                console.error("Error fetching group:", err);
            }

            // 2. Fetch All Students for this Auction
            let allStudents: Candidate[] = [];
            try {
                const candidateRes = await axios.get(`${baseUrl}/student`, { headers });
                const studentData = candidateRes.data?.data || candidateRes.data;
                allStudents = (Array.isArray(studentData) ? studentData : [])
                    .filter((s: any) => s.auction_id === auctionId || s.auctionId === auctionId);
                setAllAuctionCandidates(allStudents);
            } catch (err) {
                console.error("Error fetching students:", err);
            }

            // 3. Fetch Associations
            let currentAssociations: any[] = [];
            try {
                const studentGroupRes = await axios.get(`${baseUrl}/student-group`, { headers });
                const associationData = studentGroupRes.data?.data || studentGroupRes.data;
                currentAssociations = (Array.isArray(associationData) ? associationData : [])
                    .filter((a: any) => a.auction_id === auctionId || a.auctionId === auctionId);
                setAssociations(currentAssociations);
            } catch (err) {
                console.error("Error fetching student-group associations:", err);
                // Don't throw here, just leave associations empty
            }

            // 4. Map students to this group
            const groupStudentIds = currentAssociations
                .filter((a: any) => a.group_id === groupId || a.groupId === groupId)
                .map((a: any) => a.student_id || a.studentId);

            const groupStudents = allStudents.filter((s: any) => groupStudentIds.includes(s.id));
            setCandidates(groupStudents);

        } catch (error) {
            console.error("Critical error in fetchGroupAndCandidates:", error);
            toast.error("Failed to load group details");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssignCandidates = async (candidateIds: string[]) => {
        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        const headers = {
            'Authorization': `Bearer ${token}`,
            'x-auction-id': auctionId
        };

        try {
            setIsSubmitting(true);

            // Log payload for debugging Internal Server Errors
            console.log("Assigning candidates to group:", {
                candidateIds,
                groupId,
                auctionId
            });

            await Promise.all(candidateIds.map(id => {
                const payload = {
                    student_id: id,
                    studentId: id,
                    group_id: groupId,
                    groupId: groupId,
                    auction_id: auctionId,
                    auctionId: auctionId
                };
                return axios.post(`${baseUrl}/student-group`, payload, { headers });
            }));

            toast.success("Candidates assigned successfully");
            setIsAssignModalOpen(false);
            fetchGroupAndCandidates();
        } catch (error: any) {
            console.error("Assignment failed:", error);
            const serverMessage = error.response?.data?.message || error.response?.data?.error || error.message;
            toast.error(`Assignment Error: ${serverMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveCandidate = async (studentId: string) => {
        if (!window.confirm("Remove this candidate from the group?")) return;

        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        try {
            setIsSubmitting(true);
            // We need the ID of the StudentGroup record
            const record = associations.find((a: any) => a.student_id === studentId && a.group_id === groupId);

            if (record) {
                await axios.delete(`${baseUrl}/student-group/${record.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-auction-id': auctionId
                    }
                });
                toast.success("Candidate removed from group");
                fetchGroupAndCandidates();
            }
        } catch (error) {
            console.error("Error removing candidate:", error);
            toast.error("Failed to remove candidate");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#E76F6F]" />
                <p className="text-sm font-black uppercase tracking-widest text-black/20">Loading Group...</p>
            </div>
        );
    }

    if (!group) return <div>Group not found</div>;

    const filteredCandidates = candidates.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.reg_no.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="animate-in fade-in duration-500 text-left">
            <Toaster position="top-center" />

            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-8 pl-1">
                <div className="flex items-center gap-4 sm:gap-6">
                    <button
                        onClick={onBack}
                        className="p-2.5 hover:bg-gray-100 rounded-full transition-colors shrink-0 -ml-2"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-800" strokeWidth={1.5} />
                    </button>

                    <div className="flex items-center gap-4 sm:gap-5">
                        <div className="w-14 h-14 sm:w-[60px] sm:h-[60px] bg-[#FFFdf0] border border-[#fef08a]/60 rounded-[1.2rem] sm:rounded-[1.4rem] flex items-center justify-center shrink-0">
                            <BarChart2 className="w-6 h-6 sm:w-7 sm:h-7 text-[#eab308]" strokeWidth={2.5} />
                        </div>

                        <div className="flex flex-col justify-center gap-1.5">
                            <h1 className="text-[22px] sm:text-[26px] font-bold text-gray-900 tracking-tight leading-none">{group.value}</h1>
                            <p className="text-[13px] text-[#64748b] font-medium leading-none">Group analytics and candidate overview</p>
                            <div className="flex items-center text-[#64748b] font-medium mt-0.5">
                                <span className="flex items-center gap-1.5 text-[12px]">
                                    <span className="text-[13px] opacity-70">â™‚</span> {group.key || group.value}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0 justify-end">
                    <div className="px-5 py-1.5 bg-[#f0fdf4] border border-[#198754]/20 rounded-full shrink-0">
                        <span className="text-[10px] font-bold text-[#198754] uppercase tracking-wide">Active</span>
                    </div>
                    <button
                        onClick={() => setIsAssignModalOpen(true)}
                        disabled={isSubmitting}
                        className={`px-5 sm:px-6 py-2.5 bg-[#FFFF12] rounded-full text-[12px] text-[#1c2b27] font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all flex items-center gap-2 flex-1 sm:flex-none justify-center ${isSubmitting ? 'opacity-50' : ''}`}
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-[#1c2b27]" /> : <UserPlus className="w-4 h-4 text-[#1c2b27]" strokeWidth={2.5} />}
                        {isSubmitting ? 'Assigning...' : 'Add Candidates'}
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-6 sm:gap-8">
                {/* Main Candidates Table */}
                <div className="w-full space-y-6">
                    <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-5 sm:p-6 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3 w-full sm:w-auto mt-1">
                                <Users className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                                <h3 className="text-[14px] font-bold uppercase tracking-wide text-gray-800">Candidates in Group</h3>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="relative group flex-1 sm:flex-none">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-11 pr-4 py-2 bg-white border border-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] rounded-full outline-none focus:border-gray-200 transition-all font-medium text-[12px] w-full sm:w-56 text-gray-700"
                                    />
                                </div>
                                <button className="px-5 py-2 bg-white border border-gray-100 rounded-full text-[12px] font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm shrink-0 text-gray-700">
                                    View All
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto min-h-[300px]">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold text-gray-500 group">
                                        <th className="px-6 sm:px-8 py-4 w-12 text-center">
                                            <div className="w-4 h-4 border-2 border-yellow-300 rounded-full inline-block" />
                                        </th>
                                        <th className="px-6 py-4 text-left">Chest No</th>
                                        <th className="px-6 py-4 text-left">Candidate</th>
                                        <th className="px-6 py-4 text-left">Team</th>
                                        <th className="px-6 py-4 text-left">Section</th>
                                        <th className="px-6 py-4 text-left">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredCandidates.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Users className="w-12 h-12 text-gray-200" strokeWidth={1.5} />
                                                    <p className="text-[13px] font-medium text-gray-400">No candidates found in this group</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCandidates.map((c) => (
                                            <tr key={c.id} className="hover:bg-gray-50/50 transition-all">
                                                <td className="px-6 sm:px-8 py-4 text-center">
                                                    <div className="w-4 h-4 border-2 border-yellow-300 rounded-full inline-block" />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[13px] font-bold text-gray-800">{c.reg_no}</span>
                                                </td>
                                                <td className="px-6 py-4 text-left">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-200">
                                                            {c.name.charAt(0)}
                                                        </div>
                                                        <span className="text-[14px] font-bold text-gray-900">{c.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[13px] font-medium text-gray-500">{c.team_name || 'Not Joined'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[13px] font-bold text-gray-700">{c.section || '---'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${c.is_active ? 'bg-[#FFFF12]/20 text-gray-800' : 'bg-gray-100 text-gray-500'}`}>
                                                        {c.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleRemoveCandidate(c.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="p-4 sm:p-6 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center justify-between sm:justify-start gap-4 text-[12px] font-medium text-gray-500 w-full sm:w-auto">
                                <span>Showing {filteredCandidates.length === 0 ? '0' : '1'} to {filteredCandidates.length} of {candidates.length} results</span>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200 text-gray-800">
                                    10 <ChevronDown className="w-3 h-3" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0">
                                <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                                <span className="text-[12px] font-medium text-gray-600">Page 1 of {Math.max(1, Math.ceil(filteredCandidates.length / 10))}</span>
                                <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isAssignModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsAssignModalOpen(false)} />
                    <div className="relative w-full max-w-2xl bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in duration-300">
                        <div className="p-6 sm:p-8 border-b border-gray-100 flex items-start sm:items-center justify-between gap-4 bg-[#fcfcfd]">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-tight">Add Candidates</h2>
                                <p className="text-[13px] sm:text-[14px] font-medium text-gray-500 mt-1">Select candidates to assign to {group.value}</p>
                            </div>
                            <button onClick={() => setIsAssignModalOpen(false)} className="p-2 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-colors shrink-0">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-3">
                            {allAuctionCandidates.filter(c =>
                                !associations.some(a => (a.student_id || a.studentId) === c.id)
                            ).map(candidate => (
                                <div
                                    key={candidate.id}
                                    onClick={() => handleAssignCandidates([candidate.id])}
                                    className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between hover:border-[#198754]/50 hover:shadow-sm transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-gray-700 font-bold text-sm">
                                            {candidate.reg_no}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{candidate.name}</h4>
                                            <p className="text-[11px] font-bold text-gray-400 mt-0.5">{candidate.section || 'Unassigned Section'}</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-[#198754] group-hover:border-[#198754] transition-all">
                                        <Check className="w-4 h-4 text-transparent group-hover:text-white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupDetails;
