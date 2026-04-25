/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    X,
    ArrowLeft,
    ArrowRight,
    Check,
    Calendar,
    Users,
    Globe,
    Loader2,
    Layers,
    DollarSign,
    Building2,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';

type AuctionType = 'Draft' | 'English' | null;

interface FormData {
    auctionName: string;
    auctionType: AuctionType;
    numTeams: string;
    playersPerTeam: string;
    budgetPerTeam: string;
    institutionName: string;
    contactEmail: string;
    contactPhone: string;
    subdomain: string;
    venue: string;
    startDate: string;
    endDate: string;
}

const Field = ({
    label,
    helper,
    icon: Icon,
    type = "text",
    ...props
}: {
    label: string;
    helper?: string;
    icon?: any;
    type?: string;
    [x: string]: any;
}) => (
    <div className="mb-6 text-left group">
        <label className="block mb-2 text-[11px] font-black uppercase tracking-wider text-black flex items-center gap-2">
            {Icon && <Icon className="w-3 h-3" />} {label}
        </label>
        <div className="relative">
            <input
                type={type}
                className="w-full px-5 py-4 bg-white border border-black/10 rounded-2xl outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all font-medium text-[15px] placeholder:text-black/30 shadow-sm"
                {...props}
            />
        </div>
        {helper && (
            <p className="mt-2 text-[10px] font-medium text-black/40 italic">
                {helper}
            </p>
        )}
    </div>
);

const CreateBidspheres: React.FC = () => {
    const navigate = useNavigate();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        auctionName: '',
        auctionType: null,
        numTeams: '8',
        playersPerTeam: '15',
        budgetPerTeam: '1000000',
        institutionName: '',
        contactEmail: '',
        contactPhone: '',
        subdomain: '',
        venue: '',
        startDate: '',
        endDate: '',
    });

    const steps = [
        { id: 'name', title: 'Identity', theme: 'red' as const },
        { id: 'type', title: 'Format', theme: 'yellow' as const },
        ...(formData.auctionType === 'Draft' ? [] : [{ id: 'config', title: 'Rules', theme: 'yellow' as const }]),
        { id: 'inst1', title: 'Contact', theme: 'red' as const },
        { id: 'subdomain', title: 'Launch', theme: 'yellow' as const },
        { id: 'inst2', title: 'Schedule', theme: 'red' as const },
    ];

    const totalSteps = steps.length;
    const currentStepDef = steps[currentStepIndex];

    const [isSubdomainManual, setIsSubdomainManual] = useState(false);
    const [isSubdomainTaken, setIsSubdomainTaken] = useState(false);
    const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);

    const checkSubdomain = async (slug: string) => {
        if (!slug || slug.length < 3) {
            setIsSubdomainTaken(false);
            return;
        }

        setIsCheckingSubdomain(true);
        try {
            const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
            const response = await axios.get(`${baseUrl}/auction`);
            const auctions = Array.isArray(response.data) ? response.data : (response.data?.data || []);

            // Case-insensitive check for subdomain/slug
            const taken = auctions.some((a: any) =>
                (a.subdomain && a.subdomain.toLowerCase() === slug.toLowerCase()) ||
                (a.slug && a.slug.toLowerCase() === slug.toLowerCase())
            );

            setIsSubdomainTaken(taken);
        } catch (error) {
            console.error("Error checking subdomain:", error);
        } finally {
            setIsCheckingSubdomain(false);
        }
    };

    // Debounce subdomain check
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.subdomain) {
                checkSubdomain(formData.subdomain);
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [formData.subdomain]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === 'subdomain') setIsSubdomainManual(true);
    };

    useEffect(() => {
        if (!isSubdomainManual && formData.auctionName) {
            const slug = formData.auctionName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setFormData(prev => ({ ...prev, subdomain: slug }));
        }
    }, [formData.auctionName, isSubdomainManual]);

    const setAuctionType = (type: AuctionType) => {
        setFormData((prev) => ({ ...prev, auctionType: type }));
    };

    const nextStep = async () => {
        if (currentStepIndex < totalSteps - 1) {
            // Basic validation
            if (currentStepDef.id === 'name' && !formData.auctionName) {
                toast.error("Please enter an auction name");
                return;
            }
            if (currentStepDef.id === 'type' && !formData.auctionType) {
                toast.error("Please select an auction type");
                return;
            }
            if (currentStepDef.id === 'subdomain') {
                if (!formData.subdomain) {
                    toast.error("Please enter a slug for your auction");
                    return;
                }
                if (isSubdomainTaken) {
                    toast.error("This slug is already taken. Please choose another one.");
                    return;
                }
                if (isCheckingSubdomain) {
                    toast.error("Still checking slug availability...");
                    return;
                }
            }
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            try {
                setIsLoading(true);
                const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
                const token = localStorage.getItem('token') || '';

                let adminId = '717b657b-529a-4d62-a675-2ab58c4f779e';
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    if (payload.sub || payload.id) adminId = payload.sub || payload.id;
                } catch (e) { }

                const payload = {
                    name: formData.auctionName,
                    auction_type: formData.auctionType ? formData.auctionType.toUpperCase() : 'DRAFT',
                    status: 'PENDING',
                    created_by: adminId,
                    num_teams: formData.numTeams || null,
                    players_per_team: formData.playersPerTeam || null,
                    budget_per_team: formData.budgetPerTeam || null,
                    institution_name: formData.institutionName || null,
                    contact_email: formData.contactEmail || null,
                    contact_phone: formData.contactPhone || null,
                    subdomain: formData.subdomain || null,
                    venue: formData.venue || null,
                    start_date: formData.startDate || null,
                    end_date: formData.endDate || null
                };

                console.log("Creating auction with payload:", payload);

                await axios.post(`${baseUrl}/auction`, payload, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                toast.success('BidSphere Created Successfully!');
                setTimeout(() => navigate('/admin/dashboard'), 1500);

            } catch (error: any) {
                const errorMsg = error.response?.data?.message || error.message || 'Failed to create auction';
                toast.error(errorMsg);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        } else {
            navigate('/admin/dashboard');
        }
    };

    const renderCurrentStep = () => {
        switch (currentStepDef.id) {
            case 'name':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                        <div className="mb-10">
                            <h2 className="text-[32px] font-black tracking-tight leading-none mb-3">The Identity.</h2>
                            <p className="text-sm text-black/40 font-medium">What shall we call this grand event? Make it memorable.</p>
                        </div>

                        <Field
                            label="Auction Name"
                            name="auctionName"
                            placeholder="e.g. Premier League 2024"
                            value={formData.auctionName}
                            onChange={handleInputChange}
                            helper="This is the primary name participants will see."
                            icon={Layers}
                        />
                    </div>
                );
            case 'type':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                        <div className="mb-10">
                            <h2 className="text-[32px] font-black tracking-tight leading-none mb-3">The Format.</h2>
                            <p className="text-sm text-black/40 font-medium">Drafting talent or bidding for glory? Choose your path.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { id: 'Draft', title: 'Draft Auction', desc: 'Bidding for team members in art and cultural events' },
                                { id: 'English', title: 'English Auction', desc: 'Player bidding for sports teams (IPL-style)' }
                            ].map((type) => (
                                <div
                                    key={type.id}
                                    onClick={() => setAuctionType(type.id as AuctionType)}
                                    className={`relative p-8 bg-white border-[2px] rounded-[2rem] cursor-pointer transition-all group overflow-hidden
                                        ${formData.auctionType === type.id
                                            ? 'border-[#7C3AED] shadow-[0_8px_30px_rgb(124,58,237,0.12)] -translate-y-1'
                                            : 'border-black/5 hover:border-[#7C3AED]/30 hover:shadow-md'}`}
                                >
                                    {formData.auctionType === type.id && (
                                        <div className="absolute top-6 right-6 w-6 h-6 bg-[#7C3AED] rounded-full flex items-center justify-center shadow-md">
                                            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                    <h3 className="font-extrabold text-[20px] mb-2">{type.title}</h3>
                                    <p className="text-[13px] leading-relaxed text-black/50 font-medium">{type.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'config':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                        <div className="mb-10">
                            <h2 className="text-[32px] font-black tracking-tight leading-none mb-3">The Rules.</h2>
                            <p className="text-sm text-black/40 font-medium">Fine-tune the mechanics of your bidding session.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                            <div className="sm:col-span-2">
                                <Field
                                    label="Number of Teams"
                                    name="numTeams"
                                    type="number"
                                    placeholder="8"
                                    value={formData.numTeams}
                                    onChange={handleInputChange}
                                    icon={Users}
                                />
                            </div>
                            <Field
                                label="Players Per Team"
                                name="playersPerTeam"
                                type="number"
                                placeholder="15"
                                value={formData.playersPerTeam}
                                onChange={handleInputChange}
                                icon={Layers}
                            />
                            <Field
                                label="Budget Per Team"
                                name="budgetPerTeam"
                                type="number"
                                placeholder="1000000"
                                value={formData.budgetPerTeam}
                                onChange={handleInputChange}
                                icon={DollarSign}
                                helper="Amount in INR"
                            />
                        </div>
                    </div>
                );
            case 'inst1':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                        <div className="mb-10">
                            <h2 className="text-[32px] font-black tracking-tight leading-none mb-3">The Contact.</h2>
                            <p className="text-sm text-black/40 font-medium">Where is this happening and who can we talk to?</p>
                        </div>

                        <div className="space-y-2">
                            <Field
                                label="Institution Name"
                                name="institutionName"
                                placeholder="e.g. Global Tech University"
                                value={formData.institutionName}
                                onChange={handleInputChange}
                                icon={Building2}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Field
                                    label="Contact Email"
                                    name="contactEmail"
                                    type="email"
                                    placeholder="admin@fest.com"
                                    value={formData.contactEmail}
                                    onChange={handleInputChange}
                                    icon={Mail}
                                />
                                <Field
                                    label="Contact Phone"
                                    name="contactPhone"
                                    placeholder="+91 XXXXX XXXXX"
                                    value={formData.contactPhone}
                                    onChange={handleInputChange}
                                    icon={Phone}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'subdomain':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                        <div className="mb-10">
                            <h2 className="text-[32px] font-black tracking-tight leading-none mb-3">The Launch.</h2>
                            <p className="text-sm text-black/40 font-medium">Secure your unique digital space for the auction.</p>
                        </div>

                        <div className="relative group">
                            <label className="block mb-4 text-[11px] font-black uppercase tracking-wider text-black flex items-center gap-2">
                                <Globe className="w-3 h-3" /> Auction Slug
                            </label>
                            <div className={`flex items-center gap-2 p-2 bg-white border rounded-[2rem] transition-all
                                ${isSubdomainTaken 
                                    ? 'border-red-500 ring-4 ring-red-500/10' 
                                    : 'border-black/10 focus-within:border-[#7C3AED] focus-within:ring-4 focus-within:ring-[#7C3AED]/10'
                                }`}>
                                <span className="pl-6 text-[15px] font-medium text-black/40 select-none">https://</span>
                                <input
                                    type="text"
                                    name="subdomain"
                                    placeholder="your-slug"
                                    value={formData.subdomain}
                                    onChange={handleInputChange}
                                    className={`flex-1 py-3 outline-none font-bold text-[15px] placeholder:text-black/20 bg-transparent
                                        ${isSubdomainTaken ? 'text-red-600' : 'text-[#7C3AED]'}`}
                                />
                                <span className="pr-6 text-[15px] font-medium text-black/40 select-none">.bidsphere.in</span>
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <p className="text-[11px] font-medium text-black/40 italic">This will be the web address where your bidders and viewers can join the session.</p>
                                {formData.subdomain && !isCheckingSubdomain && (
                                    <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-[1.5px] ml-4 shrink-0
                                        ${isSubdomainTaken 
                                            ? 'border-red-500 text-red-500 bg-red-50' 
                                            : 'border-[#198754] text-[#198754] bg-[#e8f7ec]'
                                        }`}>
                                        {isCheckingSubdomain ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : isSubdomainTaken ? 'Taken' : 'Available'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'inst2':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                        <div className="mb-10">
                            <h2 className="text-[32px] font-black tracking-tight leading-none mb-3">The Schedule.</h2>
                            <p className="text-sm text-black/40 font-medium">Pin down the location and timeline of the event.</p>
                        </div>

                        <Field
                            label="Venue / Place"
                            name="venue"
                            placeholder="e.g. Main Auditorium"
                            value={formData.venue}
                            onChange={handleInputChange}
                            icon={MapPin}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Field
                                label="Start Date"
                                name="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                icon={Calendar}
                            />
                            <Field
                                label="End Date"
                                name="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                icon={Calendar}
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen md:h-screen w-full bg-white flex flex-col items-center justify-start md:justify-center p-4 sm:p-6 font-['Clash Grotesk',sans-serif] selection:bg-[#198754] selection:text-white overflow-y-auto">
            <Toaster position="top-center" />

            {/* Logo & Header Top Level */}
            <div className="flex flex-col items-center mb-6 sm:mb-8 pointer-events-none mt-4 sm:mt-0">
                <img src="/Logo+name.png" alt="BidSphere" className="h-[35px] sm:h-[45px] object-contain mb-4 sm:mb-6 mix-blend-multiply opacity-90" />
            </div>

            <div className="w-full max-w-3xl flex flex-col items-center z-10 mb-8 sm:mb-0">
                {/* Main Setup Card Container */}
                <div className="w-full bg-white border border-black/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 md:p-14 shadow-[0_20px_60px_rgb(0,0,0,0.05)] relative overflow-hidden ring-1 ring-black/5">

                    {/* Background Soft Accents */}
                    <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-bl from-[#7C3AED]/5 to-transparent rounded-bl-full pointer-events-none" />

                    {/* Progress Dots */}
                    <div className="mb-10 sm:mb-14 relative z-10 w-full max-w-[340px] sm:max-w-[420px] mx-auto">
                        <div className="flex items-center justify-between relative">
                            {steps.map((s, i) => {
                                const isCompleted = i < currentStepIndex;
                                const isActive = i === currentStepIndex;
                                return (
                                    <React.Fragment key={s.id}>
                                        <div className="relative group flex flex-col items-center z-20">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm
                                                ${isCompleted ? 'bg-[#198754] text-white border-none' : isActive ? 'bg-[#198754] text-white border-2 border-transparent scale-110 shadow-md ring-4 ring-[#198754]/20' : 'bg-white text-black/30 border border-black/10'}`}>
                                                {isCompleted ? <Check className="w-5 h-5" strokeWidth={3} /> : <span className="text-[14px] font-bold">{i + 1}</span>}
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })}

                            {/* Track Line */}
                            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-black/5 -translate-y-1/2 z-0 rounded-full">
                                <div
                                    className="absolute left-0 top-0 bottom-0 bg-[#198754] rounded-full transition-all duration-700 ease-in-out"
                                    style={{ width: `${(currentStepIndex / (totalSteps - 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="relative z-10">
                        {renderCurrentStep()}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 pt-6 sm:pt-8 border-t border-black/5 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 relative z-10">
                        <button
                            onClick={prevStep}
                            className={`flex items-center justify-center sm:justify-start gap-2 px-8 py-4 rounded-full font-bold text-[14px] border border-black/10 text-black/60 hover:bg-black/5 hover:text-black transition-all`}
                        >
                            {currentStepIndex === 0 ? <X className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                            {currentStepIndex === 0 ? 'Cancel' : 'Back'}
                        </button>

                        <div className="flex-1 hidden sm:block"></div>

                        <button
                            onClick={nextStep}
                            disabled={isLoading}
                            className={`flex items-center justify-center gap-3 px-10 py-4 bg-[#7C3AED] text-white rounded-full font-bold text-[15px] shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] hover:shadow-[0_6px_20px_0_rgba(124,58,237,0.23)] hover:-translate-y-[2px] transition-all disabled:opacity-50 w-full sm:w-auto`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {currentStepIndex === totalSteps - 1 ? 'Finish & Create' : 'Continue'}
                                    {currentStepIndex === totalSteps - 1 ? <Check className="w-5 h-5" strokeWidth={2.5} /> : <ArrowRight className="w-5 h-5" />}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer Quote */}
                <p className="mt-8 sm:mt-10 text-[10px] sm:text-[11px] font-bold text-black/30 text-center uppercase tracking-[0.2em] sm:tracking-[0.3em] pb-8 sm:pb-0">
                    Powered by Bidsphere
                </p>
            </div>
        </div>
    );
};

export default CreateBidspheres;