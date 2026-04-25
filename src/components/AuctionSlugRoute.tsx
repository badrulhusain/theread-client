import { useState, useEffect } from 'react';
import axios from 'axios';
import { DraftAuctionPage } from '@/features/auction/draft-auction/DraftAuctionPage';
import { EnglishAuction } from '@/features/auction/english-auction/EnglishAuctionPage';
import { Loader2 } from 'lucide-react';
import { createContext, useContext } from 'react';

// Simple context to provide auction data if needed by components
export const AuctionContext = createContext<any>(null);
export const useAuction = () => useContext(AuctionContext);

export const AuctionSlugRoute = ({ children }: { children: React.ReactNode }) => {
    const [auction, setAuction] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Get slug and sub-route from pathname
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const slug = pathParts[0];
    const subRoute = pathParts[1];

    useEffect(() => {
        const fetchAuctionBySlug = async () => {
            // Ignore common system routes
            if (!slug || ['login', 'register', 'admin', 'create-bidsphere'].includes(slug.toLowerCase())) {
                setLoading(false);
                return;
            }

            try {
                const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
                const response = await axios.get(`${baseUrl}/auction`);
                const allAuctions = Array.isArray(response.data) ? response.data : (response.data?.data || []);

                // Find by subdomain/slug OR by technical ID
                const matchedAuction = allAuctions.find((a: any) =>
                    a.subdomain === slug || a.id === slug
                );

                if (matchedAuction) {
                    setAuction(matchedAuction);
                }
            } catch (err) {
                console.error("Error fetching auction by slug:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAuctionBySlug();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF8] font-['Clash_Grotesk']">
                <Loader2 className="w-10 h-10 animate-spin text-black/20 mb-4" />
                <p className="text-sm font-black uppercase tracking-widest text-black/40">Searching for Bidsphere...</p>
            </div>
        );
    }

    if (auction) {
        // Handle specific sub-routes OR automatic type-based rendering
        const isEnglish = subRoute === 'english-auction' || (auction.auction_type?.toUpperCase() === 'ENGLISH' && !subRoute);

        return (
            <AuctionContext.Provider value={auction}>
                {isEnglish ? (
                    <EnglishAuction />
                ) : (
                    <DraftAuctionPage />
                )}
            </AuctionContext.Provider>
        );
    }

    return <>{children}</>;
};
