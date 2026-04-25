import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

interface FieldProps {
    label: React.ReactNode;
    helper?: React.ReactNode;
    theme: 'red' | 'yellow';
    type?: string;
    labelSize?: string;
    helperSize?: string;
    [x: string]: any;
}


const Field = ({
    label,
    helper,
    theme,
    type = "text",
    labelSize = "text-[11px]",
    helperSize = "text-[11px]",
    ...props
}: FieldProps) => (
    <div className="mb-6 text-left">
        <label className={`block mb-2 font-black tracking-widest uppercase ${labelSize} text-black/80 flex items-center gap-2`}>
            {label}
        </label>
        <input
            type={type}
            className={`w-full rounded-[14px] px-5 py-4 outline-none font-medium transition-all text-[15px]
             text-black bg-white border-2 border-black/10 focus:border-black focus:ring-0 placeholder:-black/30 hover:border-black/30`}
            {...props}
        />
        {helper && (
            <p className={`mt-2 ${helperSize} font-medium text-black/40`}>
                {helper}
            </p>
        )}
    </div>
);

const CreateBidspheres: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {

    }, []);

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [formData, setFormData] = useState<FormData>({
        auctionName: '',
        auctionType: null,
        numTeams: '',
        playersPerTeam: '',
        budgetPerTeam: '',
        institutionName: '',
        contactEmail: '',
        contactPhone: '',
        subdomain: '',
        venue: '',
        startDate: '',
        endDate: '',
    });



    const isEnglish = formData.auctionType === 'English';

    const steps = [
        { id: 'name', theme: 'red' as const },
        { id: 'type', theme: 'yellow' as const },
        ...(isEnglish ? [{ id: 'config', theme: 'yellow' as const }] : []),
        { id: 'inst1', theme: 'red' as const },
        { id: 'subdomain', theme: 'yellow' as const },
        { id: 'inst2', theme: 'red' as const },
    ];

    const totalSteps = steps.length;
    const currentStepDef = steps[currentStepIndex];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        const { value, name } = e.target;


        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const setAuctionType = (type: AuctionType) => {
        setFormData((prev) => ({ ...prev, auctionType: type }));
    };

    const nextStep = () => {
        if (currentStepIndex < totalSteps - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {

            // SUBMIT HERE



            navigate("/admin/dashboard")



        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };



    const renderCurrentStep = () => {
        switch (currentStepDef.id) {
            case 'name':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                        <h2 className="text-[36px] sm:text-[42px] font-black text-black mb-1 tracking-tight leading-none">The Identity.</h2>
                        <p className="text-black/50 text-[14px] font-medium mb-10">What shall we call this grand event? Make it memorable.</p>

                        <Field
                            theme="yellow"
                            label={<><span className="text-[12px]">📦</span> AUCTION NAME</>}
                            name="auctionName"
                            placeholder="e.g. Premier League 2024"
                            value={formData.auctionName}
                            onChange={handleInputChange}
                            helper="This is the primary name participants will see."
                        />
                    </div>
                );
            case 'type':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                        <h2 className="text-[36px] sm:text-[42px] font-black text-black mb-1 tracking-tight leading-none">The Format.</h2>
                        <p className="text-black/50 text-[14px] font-medium mb-10">Select the category that best describes your auction's environment.</p>

                        <div className="flex flex-col sm:flex-row gap-5">
                            <div
                                onClick={() => setAuctionType('Draft')}
                                className={`flex-1 bg-white p-8 rounded-[20px] cursor-pointer border-[2.5px] transition-all flex flex-col items-start justify-center min-h-[160px] relative overflow-hidden group
                  ${formData.auctionType === 'Draft' ? 'border-black shadow-[4px_4px_0_0_#000]' : 'border-black/10 hover:border-black/30 hover:shadow-sm'}`}
                            >
                                <div className={`w-4 h-4 rounded-full border-[2.5px] mb-4 
                                    ${formData.auctionType === 'Draft' ? 'border-black bg-[#198754]' : 'border-black/20 bg-transparent group-hover:border-black/40'}`} />
                                <h3 className="font-black text-black text-[20px] mb-2 leading-tight">Draft Auction</h3>
                                <p className="text-[13px] font-medium text-black/50 leading-relaxed">
                                    Bidding for team members in standard cultural & generic events.
                                </p>
                            </div>
                            <div
                                onClick={() => setAuctionType('English')}
                                className={`flex-1 bg-white p-8 rounded-[20px] cursor-pointer border-[2.5px] transition-all flex flex-col items-start justify-center min-h-[160px] relative overflow-hidden group
                  ${formData.auctionType === 'English' ? 'border-black shadow-[4px_4px_0_0_#000]' : 'border-black/10 hover:border-black/30 hover:shadow-sm'}`}
                            >
                                <div className={`w-4 h-4 rounded-full border-[2.5px] mb-4 
                                    ${formData.auctionType === 'English' ? 'border-black bg-[#198754]' : 'border-black/20 bg-transparent group-hover:border-black/40'}`} />
                                <h3 className="font-black text-black text-[20px] mb-2 leading-tight">English Auction</h3>
                                <p className="text-[13px] font-medium text-black/50 leading-relaxed">
                                    Player bidding exclusively focused for sports teams (IPL-style)
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 'config':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                        <h2 className="text-[36px] sm:text-[42px] font-black text-black mb-1 tracking-tight leading-none">The Limits.</h2>
                        <p className="text-black/50 text-[14px] font-medium mb-10">Configure your team limits and operational budgets for the season.</p>

                        <div className="space-y-2">
                            <Field
                                theme="yellow"
                                label="NUMBER OF TEAMS"
                                name="numTeams"
                                type="number"
                                placeholder="e.g. 8"
                                value={formData.numTeams}
                                onChange={handleInputChange}
                            />
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Field
                                        theme="yellow"
                                        label="PLAYERS PER TEAM"
                                        name="playersPerTeam"
                                        type="number"
                                        placeholder="e.g. 15"
                                        value={formData.playersPerTeam}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Field
                                        theme="yellow"
                                        label="BUDGET PER TEAM"
                                        name="budgetPerTeam"
                                        type="number"
                                        placeholder="e.g. 100000"
                                        value={formData.budgetPerTeam}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'inst1':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                        <h2 className="text-[36px] sm:text-[42px] font-black text-black mb-1 tracking-tight leading-none">The Operator.</h2>
                        <p className="text-black/50 text-[14px] font-medium mb-10">Tell us about the institution running this event.</p>

                        <div className="space-y-2">
                            <Field
                                theme="yellow"
                                label="INSTITUTION NAME"
                                name="institutionName"
                                placeholder="e.g. MIT University"
                                value={formData.institutionName}
                                onChange={handleInputChange}
                                helper="This name will be formally displayed on your auction website."
                            />
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Field
                                        theme="yellow"
                                        label="CONTACT EMAIL"
                                        name="contactEmail"
                                        type="email"
                                        placeholder="contact@yourfest.com"
                                        value={formData.contactEmail}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Field
                                        theme="yellow"
                                        label="CONTACT PHONE"
                                        name="contactPhone"
                                        placeholder="+91 7365 489 256"
                                        value={formData.contactPhone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'subdomain':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                        <h2 className="text-[36px] sm:text-[42px] font-black text-black mb-1 tracking-tight leading-none">The Domain.</h2>
                        <p className="text-black/50 text-[14px] font-medium mb-10">Choose your unique site subdomain link for public access.</p>

                        <div className="mx-auto mt-6">
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-black/40 font-bold text-[15px] pointer-events-none">
                                    https://
                                </span>
                                <input
                                    type="text"
                                    name="subdomain"
                                    placeholder="your-auction"
                                    value={formData.subdomain}
                                    onChange={handleInputChange}
                                    className="w-full rounded-[14px] pl-20 pr-32 py-4 outline-none font-bold transition-all text-[15px] text-black bg-white border-2 border-black/10 focus:border-black focus:ring-0 placeholder:-black/30 hover:border-black/30"
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-black/40 font-bold text-[15px] pointer-events-none">
                                    .bidsphere.in
                                </span>
                            </div>
                            <p className="mt-4 text-[12px] font-medium text-black/40 text-left">
                                This will be the direct URL link to your portal. Only lowercase letters and hyphens allowed.
                            </p>
                        </div>
                    </div>
                );
            case 'inst2':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                        <h2 className="text-[36px] sm:text-[42px] font-black text-black mb-1 tracking-tight leading-none">The Details.</h2>
                        <p className="text-black/50 text-[14px] font-medium mb-10">Finalize the schedule and location of your action event.</p>

                        <div className="space-y-2">
                            <Field
                                theme="yellow"
                                label="VENUE / PLACE"
                                name="venue"
                                placeholder="Auditorium / Ground / Online"
                                value={formData.venue}
                                onChange={handleInputChange}
                            />
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Field
                                        theme="yellow"
                                        label="START DATE"
                                        name="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Field
                                        theme="yellow"
                                        label="END DATE"
                                        name="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#fafaf8] flex flex-col items-center justify-center p-6 sm:p-12 font-['Clash Grotesk',sans-serif] selection:bg-[#198754] selection:text-white">

            {/* Logo and Badge Row */}
            <div className="flex flex-col items-center mb-8 gap-4">
                <div className="w-14 h-14 bg-[#198754] border-4 border-black rounded-[14px] shadow-[4px_4px_0_0_#000] flex flex-col items-center justify-center">
                    <div className="w-6 h-1 bg-black rounded-full mb-1"></div>
                    <div className="w-6 h-1 bg-black rounded-full mb-1"></div>
                    <div className="w-6 h-1 bg-black rounded-full"></div>
                </div>
                <div className="px-5 py-1.5 border-[1.5px] border-black rounded-full bg-transparent">
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-black">
                        Create Bidsphere
                    </span>
                </div>
            </div>

            {/* Main Brutalist Card */}
            <div className="w-full max-w-[600px] bg-white rounded-[32px] border-[3px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col pt-12 pb-8 px-6 sm:px-12 relative z-10 overflow-hidden">

                {/* Decorative highlight bg */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#ff5b5b]/5 to-transparent rounded-bl-full pointer-events-none" />

                {/* Steps Indicator Inside the Card */}
                <div className="flex items-center justify-between w-full max-w-[400px] mb-12 self-start relative z-10 opacity-90">
                    {steps.map((s, i) => {
                        const stepNum = i + 1;
                        const isActive = i === currentStepIndex;
                        const isPast = i < currentStepIndex;

                        let circleClasses = 'bg-white border-[1.5px] border-black/15 text-black/30 font-bold';
                        if (isActive) {
                            circleClasses = 'bg-[#198754] border-[3px] border-black text-white font-black shadow-[3px_3px_0_0_#000] scale-110';
                        } else if (isPast) {
                            circleClasses = 'bg-black border-[3px] border-black text-white font-bold opacity-30';
                        }

                        return (
                            <React.Fragment key={s.id}>
                                <div className={`w-[36px] h-[36px] rounded-full flex items-center justify-center text-[13px] z-10 transition-all duration-300 ${circleClasses}`}>
                                    {stepNum}
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={`flex-1 h-[2px] mx-1 transition-colors ${i < currentStepIndex ? 'bg-black/20' : 'bg-black/5'}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Dynamic Content */}
                <div className="relative z-10 flex-1 min-h-[320px]">
                    {renderCurrentStep()}
                </div>

                {/* Card Footer Buttons */}
                <div className="flex items-center justify-between mt-8 pt-8 border-t-[1.5px] border-black/5 relative z-10">
                    <button
                        onClick={prevStep}
                        className={`flex items-center gap-2 font-bold px-5 py-3 rounded-full text-[13px] border-[2px] transition-all
                            ${currentStepIndex === 0 ? 'opacity-0 pointer-events-none' : 'border-black/10 text-black/60 hover:border-black/30 hover:bg-black/5'}
                        `}
                    >
                        <span>&times;</span> Cancel
                    </button>

                    <button
                        onClick={nextStep}
                        className="flex items-center justify-center gap-3 font-black px-12 py-[16px] rounded-[16px] bg-black text-white transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_0_rgba(0,0,0,0.3)] shadow-[0_4px_10px_0_rgba(0,0,0,0.2)]"
                    >
                        <span className="text-[14px] tracking-wide">{currentStepIndex === totalSteps - 1 ? 'Finish & Create' : 'Next Step \u2192'}</span>
                    </button>
                </div>
            </div>

            {/* Bottom Tagline */}
            <div className="mt-8 text-center">
                <p className="text-[9px] font-black tracking-[0.3em] uppercase text-black/30">
                    Powered By Bidsphere - Professional Auction Management
                </p>
            </div>
        </div>
    );
};

export default CreateBidspheres;