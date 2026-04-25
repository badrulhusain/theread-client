import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { DashboardPage } from '@/features/admin/DashboardPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PublicRoute } from '@/components/PublicRoute';
import CreateBidsphere from '@/features/auction/CreateBidsphere';
import { AuctionDashboardPage } from '@/features/admin/AuctionDashboardPage';
import { EnglishAuction } from '@/features/auction/english-auction/EnglishAuctionPage';
import { DraftAuctionPage } from '@/features/auction/draft-auction/DraftAuctionPage';
import { AuctionSlugRoute } from '@/components/AuctionSlugRoute';
import { AuctionUI } from '@/features/public/DraftAuction';
import { TheReadApp } from '@/features/the-read/TheReadApp';
export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/login" replace />,
    },
    {
        path: '/login',
        element: (
            <PublicRoute>
                <LoginPage />
            </PublicRoute>
        ),
    },
    {
        path: '/register',
        element: (
            <PublicRoute>
                <RegisterPage />
            </PublicRoute>
        ),
    },
    {
        path: '/admin/dashboard',
        element: (
            <ProtectedRoute>
                <DashboardPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/auction/:id',
        element: (
            <ProtectedRoute>
                <AuctionDashboardPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/create-bidsphere',
        element: (
            <ProtectedRoute>
                <CreateBidsphere />
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/auction/:id/english-auction',
        element: (
            <ProtectedRoute>
                <EnglishAuction />
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/auction/:id/draft-auction',
        element: (
            <ProtectedRoute>
                <DraftAuctionPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/:slug',
        element: <AuctionSlugRoute children={null} />
    },
    {
        path: '/:slug/:type',
        element: <AuctionSlugRoute children={null} />
    },
    {
        path: '/public',
        element: <AuctionUI />
    },
    {
        path: '/the-read',
        element: <TheReadApp />,
    },
]);