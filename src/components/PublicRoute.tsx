import React from 'react';
import { Navigate } from 'react-router-dom';

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('token');

    if (token) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return <>{children}</>;
};
