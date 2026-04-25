import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus,
    Search,
    Loader2,
    Layers,
    Trash2,
    Edit3,
    X,
    CheckCircle2,
    Calendar
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useParams } from 'react-router-dom';

interface Group {
    id: string;
    key: string;
    value: string;
    auction_id: string;
}

interface AllGroupsProps {
    auctionId: string;
    onGroupClick: (groupId: string) => void;
}

const AllGroups: React.FC<AllGroupsProps> = ({ auctionId, onGroupClick }) => {
    const { id: urlId } = useParams();
    const effectiveAuctionId = auctionId || urlId;
    const [isGroupDrawerOpen, setIsGroupDrawerOpen] = useState(false);
    const [isFetchingGroups, setIsFetchingGroups] = useState(false);
    const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);

    // Data State
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [groupKey, setGroupKey] = useState('');
    const [groupValue, setGroupValue] = useState('');

    useEffect(() => {
        if (effectiveAuctionId) {
            fetchGroups();
        }
    }, [effectiveAuctionId]);

    const fetchGroups = async () => {
        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        try {
            setIsFetchingGroups(true);
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
        } finally {
            setIsFetchingGroups(false);
        }
    };

    const handleOpenCreateDrawer = () => {
        setEditingGroup(null);
        setGroupKey('');
        setGroupValue('');
        setIsGroupDrawerOpen(true);
    };

    const handleOpenEditDrawer = (group: Group) => {
        setEditingGroup(group);
        setGroupKey(group.key);
        setGroupValue(group.value);
        setIsGroupDrawerOpen(true);
    };

    const handleDeleteSingle = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this group?")) return;
        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        try {
            await axios.delete(`${baseUrl}/group/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-auction-id': effectiveAuctionId
                }
            });
            toast.success('Group Deleted!');
            fetchGroups();
            setSelectedIds(prev => prev.filter(i => i !== id));
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete group");
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Delete ${selectedIds.length} groups?`)) return;

        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

        try {
            await Promise.all(selectedIds.map(id =>
                axios.delete(`${baseUrl}/group/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-auction-id': effectiveAuctionId
                    }
                })
            ));
            toast.success(`${selectedIds.length} Groups Deleted!`);
            setSelectedIds([]);
            fetchGroups();
        } catch (error) {
            console.error("Bulk delete failed", error);
            toast.error("Some groups could not be deleted");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

        try {
            setIsSubmittingGroup(true);
            const payload = {
                key: groupKey,
                value: groupValue,
                auction_id: effectiveAuctionId
            };

            if (editingGroup) {
                await axios.patch(`${baseUrl}/group/${editingGroup.id}`, payload, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-auction-id': effectiveAuctionId
                    }
                });
                toast.success('Group Updated Successfully!');
            } else {
                await axios.post(`${baseUrl}/group`, payload, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-auction-id': effectiveAuctionId
                    }
                });
                toast.success('Group Created Successfully!');
            }

            setIsGroupDrawerOpen(false);
            fetchGroups();
        } catch (error: any) {
            console.error("Failed to save group", error);
            const msg = error.response?.data?.message || "Failed to save group";
            toast.error(msg);
        } finally {
            setIsSubmittingGroup(false);
        }
    };

    const filteredGroups = groups.filter(g =>
        g.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.value.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const existingKeys = Array.from(new Set(groups.map(g => g.key)));

    return (
        <div className="animate-in fade-in duration-500">
            <Toaster position="top-center" />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 gap-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-1 text-black">Groups</h2>
                    <p className="text-sm text-gray-500 font-medium text-left">Classification types and their values ({groups.length} total)</p>
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
                        <Plus className="w-4 h-4" /> Add Group
                    </button>
                </div>
            </div>

            {/* Table UI or Empty State */}
            {groups.length === 0 && !isFetchingGroups ? (
                <div className="py-24 bg-white flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-medium text-black mb-4">No groups found</p>
                    <button
                        onClick={handleOpenCreateDrawer}
                        className="px-5 py-2 bg-[#198754] rounded-full text-sm font-medium hover:bg-[#157347] transition-all flex items-center gap-2 text-white"
                    >
                        <Plus className="w-4 h-4" /> Create First Group
                    </button>
                </div>
            ) : (
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
                                    placeholder="Search groups..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-6 py-1 bg-transparent border-none outline-none text-sm w-40 focus:ring-0 text-black placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {isFetchingGroups ? (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center">
                                    <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
                                    <p className="text-[13px] font-medium text-gray-400 mt-2">Fetching Data...</p>
                                </div>
                            ) : filteredGroups.length === 0 ? (
                                <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
                                    <p className="text-[13px] font-medium text-gray-500">
                                        {searchQuery ? "No matching groups found" : "No Groups Created Yet"}
                                    </p>
                                </div>
                            ) : (
                                filteredGroups.map((group) => {
                                    // Dummy Date since we don't have created_at on model in UI
                                    const dummyDate = new Date();
                                    const dateString = `${dummyDate.getMonth() + 1}/${dummyDate.getDate()}/${dummyDate.getFullYear()}`;

                                    return (
                                        <div
                                            key={group.id}
                                            onClick={() => onGroupClick(group.id)}
                                            className="relative bg-[#fdfdfd] border border-gray-100 rounded-[1.2rem] p-4 flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-[#fef08a] transition-all group/card overflow-hidden h-[100px]"
                                        >
                                            {/* Left Accent Bar */}
                                            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#fef08a]/60"></div>

                                            <div className="flex items-start justify-between pl-2">
                                                <div className="flex items-center gap-2.5">
                                                    <CheckCircle2 className="w-5 h-5 text-[#bbf7d0] stroke-[#22c55e] stroke-2" />
                                                    <span className="text-[18px] font-bold text-gray-900 leading-none">{group.value}</span>
                                                </div>
                                                <div className="flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                                    <button onClick={(e) => { e.stopPropagation(); handleOpenEditDrawer(group); }} className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-700">
                                                        <Edit3 className="w-[14px] h-[14px]" />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteSingle(group.id); }} className="p-1 hover:bg-red-50 rounded-md text-gray-400 hover:text-red-500">
                                                        <Trash2 className="w-[14px] h-[14px]" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pl-2 mt-auto">
                                                <div className="flex items-center gap-1.5 text-gray-500 text-[13px] font-medium">
                                                    <Calendar className="w-4 h-4" strokeWidth={1.5} />
                                                    <span>{dateString}</span>
                                                </div>
                                                <span className="px-3.5 py-1 bg-[#FACC15] rounded-full text-[11px] font-bold text-[#422006] tracking-wide">
                                                    Active
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Group Side Drawer */}
            {isGroupDrawerOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-end">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsGroupDrawerOpen(false)}
                    />
                    <div className="relative w-full max-w-[500px] bg-white h-full shadow-xl animate-in slide-in-from-right duration-500 flex flex-col p-8 md:p-10 rounded-l-2xl">
                        <div className="flex justify-between items-start mb-10">
                            <div className="text-left">
                                <h2 className="text-[26px] font-bold tracking-tight leading-none mb-2 text-gray-900">
                                    {editingGroup ? 'Edit Group' : 'Create Group'}
                                </h2>
                                <p className="text-[13px] text-gray-400 font-medium italic">
                                    {editingGroup ? `Updating details for ${editingGroup.key}` : 'Define a new candidate classification and its value'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsGroupDrawerOpen(false)}
                                className="p-1.5 hover:bg-gray-100 rounded-full transition-all text-gray-500"
                            >
                                <X className="w-5 h-5" strokeWidth={2} />
                            </button>
                        </div>

                        <form className="flex-1 flex flex-col overflow-y-auto scrollbar-hide" onSubmit={handleSubmit}>
                            <div className="space-y-6 flex-1 pr-2">
                                <div className="space-y-2 text-left">
                                    <label className="text-[13px] font-medium text-gray-800 flex items-center gap-1">
                                        Classification Key <span className="text-red-400">*</span>
                                    </label>

                                    {!editingGroup && existingKeys.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {existingKeys.map(key => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setGroupKey(key)}
                                                    className={`px-4 py-1.5 rounded-full border text-[12px] font-semibold transition-all ${groupKey === key ? 'bg-[#7C3AED] text-white border-[#7C3AED]' : 'bg-transparent text-gray-500 border-gray-200 hover:border-gray-300'}`}
                                                >
                                                    {key}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setGroupKey('');
                                                }}
                                                className={`px-4 py-1.5 rounded-full border text-[12px] font-semibold transition-all ${!existingKeys.includes(groupKey) && groupKey !== '' ? 'bg-[#7C3AED] text-white border-[#7C3AED]' : 'bg-transparent text-gray-500 border-gray-200 hover:border-gray-300'}`}
                                            >
                                                + New Key
                                            </button>
                                        </div>
                                    )}

                                    <input
                                        type="text"
                                        placeholder="e.g. Classification Type, Category..."
                                        value={groupKey}
                                        onChange={(e) => setGroupKey(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 hover:bg-white bg-transparent border border-black/10 rounded-full outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all text-[14px] text-gray-900 placeholder:text-gray-400"
                                    />
                                    <p className="text-[11px] text-gray-400 font-medium italic pl-1">This is the label for the grouping (e.g., 'Grade')</p>
                                </div>

                                <div className="space-y-2 text-left">
                                    <label className="text-[13px] font-medium text-gray-800 flex items-center gap-1">
                                        Value <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Junior, Senior, Professional..."
                                        value={groupValue}
                                        onChange={(e) => setGroupValue(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 hover:bg-white bg-transparent border border-black/10 rounded-full outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all text-[14px] text-gray-900 placeholder:text-gray-400"
                                    />
                                    <p className="text-[11px] text-gray-400 font-medium italic pl-1">This is the actual value for the classification (e.g., 'Junior')</p>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmittingGroup}
                                    className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white px-6 py-2.5 rounded-full font-semibold text-[13px] transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                                >
                                    {isSubmittingGroup ? <Loader2 className="w-4 h-4 animate-spin" /> : editingGroup ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" strokeWidth={3} />}
                                    {editingGroup ? 'Update Group' : 'Create Group'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllGroups;
