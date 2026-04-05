import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type AuthContextType = {
    user: User | null;
    profile: any | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const lastFetchedUserId = useRef<string | null>(null);
    const navigate = useNavigate();

    const fetchProfile = async (userId: string) => {
        if (!userId || lastFetchedUserId.current === userId) return;

        try {
            console.log('AuthContext: Fetching profile for', userId);
            lastFetchedUserId.current = userId;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.warn('AuthContext: Profile fetch error:', error.message);
                setProfile(null);
            } else {
                console.log('AuthContext: Profile loaded successfully');
                setProfile(data);
            }
        } catch (e) {
            console.error('AuthContext: Profile fetch exception:', e);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        // 1. Initial Session Check
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!mounted) return;

            if (session?.user) {
                setUser(session.user);
                await fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        };
        init();

        // 2. Auth State Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;
            console.log('AuthContext: Auth event:', event);

            const currentUser = session?.user ?? null;

            if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfile(null);
                lastFetchedUserId.current = null;
                setLoading(false);
                navigate('/');
                return;
            }

            if (currentUser) {
                setUser(currentUser);
                // We fetch profile but don't await it here to avoid blocking the listener thread
                fetchProfile(currentUser.id);
            } else {
                setUser(null);
                setProfile(null);
                lastFetchedUserId.current = null;
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, profile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
