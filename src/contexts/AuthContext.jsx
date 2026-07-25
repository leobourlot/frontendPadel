import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// const API_URL = 'https://api.turnos.bourderweb.com.ar';
const API_URL = 'https://backendpadel-n3u9.onrender.com';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [club, setClub] = useState(null); // ← nuevo: info del club actual
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        const storedClub = localStorage.getItem('club');

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            if (storedClub) setClub(JSON.parse(storedClub));
            verifyToken(storedToken);
        }
        setLoading(false);
    }, []);

    // Headers base (incluye club slug en desarrollo)
    const getHeaders = () => {
        const headers = { 'Content-Type': 'application/json' };
        const devSlug = localStorage.getItem('dev_club_slug');
        if (devSlug && window.location.hostname === 'localhost') {
            headers['X-Club-Slug'] = devSlug;
        }
        return headers;
    };

    const verifyToken = async (token) => {
        try {
            const response = await fetch(`${API_URL}/auth/profile`, {
                headers: { ...getHeaders(), Authorization: `Bearer ${token}` },
            });
            if (!response.ok) logout();
        } catch {
            logout();
        }
    };

    const login = async (dni, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ dni, password }),
        });

        const textResponse = await response.text();

        if (!response.ok) {
            let error;
            try { error = JSON.parse(textResponse); } catch { throw new Error(textResponse || 'Error al iniciar sesión'); }
            throw new Error(error.message || 'Error al iniciar sesión');
        }

        const data = JSON.parse(textResponse);

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.usuario));
        localStorage.setItem('club', JSON.stringify(data.club));
        setUser(data.usuario);
        setClub(data.club);

        return data.usuario;
    };

    const register = async (userData) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al registrarse');
        }

        const data = await response.json();

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.usuario));
        localStorage.setItem('club', JSON.stringify(data.club));
        setUser(data.usuario);
        setClub(data.club);

        return data.usuario;
    };

    const logout = () => {
        setUser(null);
        setClub(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('club');
    };

    const getToken = () => localStorage.getItem('token');

    const fetchWithAuth = async (url, options = {}) => {
        const token = getToken();
        return fetch(`${API_URL}${url}`, {
            ...options,
            headers: {
                ...getHeaders(),
                ...options.headers,
                Authorization: `Bearer ${token}`,
            },
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{
            user,
            club,        // ← disponible en toda la app
            login,
            register,
            logout,
            getToken,
            fetchWithAuth,
            isAuthenticated: !!user,
        }}>
            {children}
        </AuthContext.Provider>
    );
};