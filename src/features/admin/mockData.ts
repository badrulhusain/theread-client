export interface Auction {
    id: string;
    name: string;
    auction_type: string;
    status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
    date: string;
}

export const mockAuctions: Auction[] = [
    {
        id: '1',
        name: 'Summer Premier League',
        auction_type: 'English',
        status: 'ACTIVE',
        date: '2024-06-15'
    },
    {
        id: '2',
        name: 'Winter Cultural Gala',
        auction_type: 'Draft',
        status: 'PENDING',
        date: '2024-12-01'
    },
    {
        id: '3',
        name: 'Tech Innovators Auction',
        auction_type: 'English',
        status: 'INACTIVE',
        date: '2024-03-10'
    }
];
