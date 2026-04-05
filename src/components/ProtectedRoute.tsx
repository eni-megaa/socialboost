import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

export const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
    const { user, profile, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            if (requireAdmin && profile?.role !== 'admin') {
                console.warn('ProtectedRoute: Admin access denied. User:', user.id, 'Role:', profile?.role);
            }
        }
    }, [loading, user, profile, requireAdmin]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 font-display font-medium text-brand">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && profile?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};
