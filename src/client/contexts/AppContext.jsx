import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [flash, setFlash] = useState({ success: null, error: null });

    const refreshUser = useCallback(async () => {
        try {
            const data = await api.get('/auth/me');
            setUser(data.user);
            return data.user;
        } catch (error) {
            if (error.status !== 401) throw error;
            setUser(null);
            return null;
        } finally {
            setAuthReady(true);
        }
    }, []);

    useEffect(() => { refreshUser().catch(() => setAuthReady(true)); }, [refreshUser]);

    const value = useMemo(() => ({
        user, setUser, authReady, refreshUser, flash,
        setFlash: (next) => setFlash({ success: next?.success ?? null, error: next?.error ?? null }),
    }), [user, authReady, refreshUser, flash]);
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const value = useContext(AppContext);
    if (!value) throw new Error('useApp must be used inside AppProvider.');
    return value;
}
