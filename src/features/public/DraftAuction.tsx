
import { Clock } from 'lucide-react';

export const AuctionUI = () => {
    const teams = [
        { name: 'Team A', color: 'bg-[#f06261]' },
        { name: 'Team B', color: 'bg-[#6cc62c]' },
        { name: 'Team C', color: 'bg-[#d63384]' },
        { name: 'Team D', color: 'bg-[#c026d3]' },
    ];

    return (
        <div className="min-h-screen bg-white p-8 font-sans text-gray-900">
            {/* Top Header - User Profile Only */}
            <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2 cursor-pointer">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">LT</div>
                    <span className="font-bold text-lg">Student Name</span>
                    <span className="text-xs">▼</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                {/* Left Section: Player Info */}
                <div className="space-y-6">
                    <div>
                        <p className="text-gray-500 text-sm tracking-widest mb-1">564fd54f5df45</p>
                        <h1 className="text-5xl font-black mb-4">Session Name</h1>

                        {/* Timer Pill */}
                        <div className="inline-flex items-center gap-2 bg-[#fef9c3] px-4 py-2 rounded-full border border-[#fde047]">
                            <Clock size={20} />
                            <span className="text-xl font-bold">09:00</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center lg:items-start pt-10">
                        {/* Player Avatar */}
                        <div className="w-64 h-64 bg-gray-300 rounded-full mb-8 shadow-inner"></div>

                        <div className="text-center lg:text-left">
                            <h2 className="text-5xl font-extrabold mb-2">Lukman</h2>
                            <p className="text-2xl italic text-gray-600 mb-4">Degree Final Year</p>
                            <p className="text-3xl font-bold">
                                Base Price : <span className="text-black">20 Crore</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Section: Team Selection & Confirm */}
                <div className="flex flex-col gap-8">

                    {/* Main Action Card */}
                    <div className="border-2 border-gray-900 rounded-[40px] p-10 h-[600px] flex flex-col justify-between shadow-xl">

                        {/* Enlarged Team Selection Area */}
                        <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-2">
                            {teams.map((team, index) => (
                                <button
                                    key={index}
                                    className={`${team.color} text-white text-3xl font-bold py-8 rounded-2xl shadow-md transform transition active:scale-95 hover:brightness-110`}
                                >
                                    {team.name}
                                </button>
                            ))}
                        </div>

                        {/* Confirm Button */}
                        <button className="w-full bg-black text-white text-2xl font-bold py-6 rounded-full mt-8 shadow-lg hover:bg-gray-800 transition">
                            Confirm
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AuctionUI;