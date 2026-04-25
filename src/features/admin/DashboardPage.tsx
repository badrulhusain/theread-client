import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ListFilter, LogOut, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Auction {
  id: string;
  _id?: string;
  name: string;
  auction_type: string;
  status: string;
  date?: string;
  createdAt?: string;
  created_at?: string;
  created_by?: string;
  subdomain?: string;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Guest User');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedName = localStorage.getItem('userName');

    if (!token) {
      navigate('/login');
      return;
    }

    let currentAdminId = '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentAdminId = payload.id || payload.sub || '';

      if (storedName) {
        setUserName(storedName);
      } else if (payload.name) {
        setUserName(payload.name);
      } else if (payload.username) {
        setUserName(payload.username.split('@')[0]);
      }
    } catch (e) {
      console.error("Could not decode token", e);
      navigate('/login');
      return;
    }

    const fetchAuctions = async () => {
      try {
        setIsLoading(true);
        const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        const response = await fetch(`${baseUrl}/auction`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const allAuctions = Array.isArray(data) ? data : data.data || [];

          // Filter auctions to only show those created by current admin
          const filtered = allAuctions.filter((a: any) =>
            (a.created_by === currentAdminId) ||
            (a.admin_id === currentAdminId) ||
            (!a.created_by && !a.admin_id)
          );

          setAuctions(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch Bidspheres", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAuctions();
  }, [navigate]);

  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'G';

  return (
    <div className="min-h-[100dvh] bg-[#ffffff] font-['Clash Grotesk',sans-serif] p-4 sm:px-8 sm:py-6">
      {/* Top Navigation Bar */}
      <header className="max-w-6xl mx-auto px-1 flex flex-row justify-between items-center mb-10 sm:mb-14">
        {/* Left Side: Logo */}
        <div className="flex items-center gap-2">
          <img src="/Logo+name.png" alt="Logo" className="h-10 sm:h-12 object-contain" />
        </div>

        {/* Right Side: Profile */}
        <div className="flex items-center gap-4 relative">
          <div
            className="flex items-center gap-3 p-1.5 pr-4 lg:pr-5 bg-white border border-gray-50 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.04)] cursor-pointer hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)] transition-all"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="w-9 h-9 bg-[#FFFF12] rounded-full flex items-center justify-center shadow-sm">
              <span className="text-[14px] font-black text-black uppercase">{userInitial}</span>
            </div>
            <span className="text-[15px] font-[900] text-black tracking-tight truncate hidden sm:block">
              {userName.substring(0, 2).toLowerCase() || 'ui'}
            </span>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-12 right-0 mt-2 w-48 bg-white border border-black/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden z-50 py-1">
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-[#E76F6F] font-bold hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-1 mt-4 text-left">
        <div className="flex justify-between items-center mb-8 text-left">
          <div className="flex flex-col gap-1 text-left">
            <h1 className="text-[24px] sm:text-[28px] font-black tracking-tight text-black leading-none">My Auction</h1>
            <p className="text-[12px] text-black/50 font-medium">{auctions.length} of {auctions.length} Auctions</p>
          </div>
          <button
            onClick={() => navigate('/create-bidsphere')}
            className="rounded-[2rem] px-5 py-2 text-[12px] bg-[#FFFF12] hover:bg-[#FFFF12]/90 text-black shadow-sm font-[900] flex items-center gap-2 transition-all w-fit"
          >
            <Plus className="w-3.5 h-3.5 text-[#7C3AED]" strokeWidth={4} />
            Add New
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          {/* Top filter row / Desktop left side */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 border border-gray-100 rounded-[2rem] p-[3px] bg-white shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <button className="px-5 py-1.5 rounded-full bg-[#FFFF12] text-[11.5px] font-[900] flex items-center justify-center gap-1.5 shadow-sm w-[90px] text-black transition-all">
                <div className="w-[6px] h-[6px] rounded-full bg-[#198754]" /> All
              </button>
              <button className="px-5 py-1.5 rounded-full bg-transparent text-[11.5px] font-bold text-black/40 flex items-center justify-center gap-1.5 hover:bg-gray-50 hover:text-black w-[90px] transition-colors">
                <div className="w-[6px] h-[6px] rounded-full bg-[#C6A75E]/50" /> Inactive
              </button>
            </div>
          </div>

          {/* Search bar + filter icons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7C3AED]" />
              <Input
                className="w-full pl-9 h-[40px] rounded-[12px] sm:rounded-full bg-[#ffffff] border border-gray-100 text-[13px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] placeholder:text-black/30 placeholder:font-medium focus-visible:ring-2 focus-visible:border-[#7C3AED] focus-visible:ring-[#7C3AED]/20 transition-all font-medium"
                placeholder="Search..."
              />
            </div>

            <div className="flex gap-2 shrink-0">
              <button className="h-[40px] w-[40px] flex items-center justify-center rounded-[12px] sm:rounded-full bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-[#7C3AED]/30 hover:bg-[#7C3AED]/5 transition-colors group">
                <Filter className="w-4 h-4 text-black/60 group-hover:text-[#7C3AED]" />
              </button>
              <button className="h-[40px] w-[40px] flex items-center justify-center rounded-[12px] sm:rounded-full bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-[#7C3AED]/30 hover:bg-[#7C3AED]/5 transition-colors group">
                <ListFilter className="w-4 h-4 text-black/60 group-hover:text-[#7C3AED]" />
              </button>
            </div>
          </div>
        </div>

        {/* Auctions Grid / Empty State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#7C3AED]/20 animate-spin mb-4" />
            <p className="text-[13px] font-bold text-black/40 uppercase tracking-widest leading-none">Fetching Auctions...</p>
          </div>
        ) : auctions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <h2 className="text-[20px] font-black tracking-tight text-black mb-3">No Active Auctions</h2>
            <p className="text-[12px] text-black/60 max-w-[280px] mb-8 leading-[1.6] font-medium">
              Create your first Auctions to get started with<br />managing events, participating, and more.
            </p>
            <button
              onClick={() => navigate('/create-bidsphere')}
              className="px-6 py-2.5 rounded-full bg-[#FFFF12] text-black font-[900] text-[13px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#7C3AED]" strokeWidth={4} />
              Create Auction
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500 fade-in py-2">
            {auctions.map((auction: Auction, idx: number) => {
              const statusText = (auction.status || "ACTIVE").toUpperCase();

              // Map status to specific color palette #198754, #C6A75E, #7C3AED
              let statusBg = "bg-[#198754]/10 border-[#198754]/20";
              let statusTextCol = "text-[#198754]";
              let statusDot = "bg-[#198754]";

              if (statusText === "PENDING") {
                statusBg = "bg-[#C6A75E]/10 border-[#C6A75E]/20";
                statusTextCol = "text-[#C6A75E]";
                statusDot = "bg-[#C6A75E]";
              } else if (statusText !== "ACTIVE") {
                statusBg = "bg-gray-100 border-gray-200";
                statusTextCol = "text-gray-500";
                statusDot = "bg-gray-400";
              }

              const auctionId = auction.id || auction._id;

              return (
                <div
                  key={auctionId || idx}
                  onClick={() => navigate(`/admin/auction/${auctionId}`)}
                  className="bg-[#ffffff] rounded-[20px] p-5 border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(124,58,237,0.08)] hover:-translate-y-1 hover:border-[#7C3AED]/40 transition-all duration-300 flex flex-col justify-between cursor-pointer group min-h-[150px]"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-[46px] h-[46px] rounded-full bg-[#7C3AED]/5 flex items-center justify-center shrink-0 border border-[#7C3AED]/10 mt-0.5 group-hover:bg-[#7C3AED]/10 transition-colors">
                      <span className="text-[16px] font-[900] text-[#7C3AED] uppercase">{auction.name?.charAt(0) || 'A'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] font-black text-gray-800 truncate leading-tight mb-2 group-hover:text-[#7C3AED] transition-colors">
                        {auction.name || `Auction ${idx + 1}`}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold mb-1.5">
                        <span className="truncate">{auction.subdomain || auctionId?.substring(0, 8) || 'admin'}.bidsphere.app</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <div className={`px-2.5 py-1.5 rounded-full border flex items-center gap-1.5 ${statusBg}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${statusDot} shrink-0`} />
                      <span className={`text-[10px] uppercase font-[900] tracking-wide ${statusTextCol} leading-none mb-px`}>{statusText}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-bold text-gray-400">
                        {auction.date || auction.created_at ? new Date((auction.date || auction.created_at) as string).toISOString().split('T')[0] : '2024-06-15'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
