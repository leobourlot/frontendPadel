import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_URL = 'http://localhost:3000';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (dni, password) => {
        // TODO: Conectar con tu backend NestJS
        // const response = await fetch('YOUR_BACKEND_URL/auth/login', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ dni, clave: password })
        // });

        // Simulación temporal
        const mockUser = {
            idUsuario: 1,
            dni,
            email: `${dni}@example.com`,
            nombre: 'Usuario',
            apellido: 'Demo',
            rol: 'jugador'
        };

        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return mockUser;
    };

    const register = async (userData) => {
        // TODO: Conectar con tu backend NestJS
        // const response = await fetch('YOUR_BACKEND_URL/auth/register', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(userData)
        // });

        const mockUser = {
            idUsuario: Date.now(),
            ...userData,
            rol: 'jugador'
        };

        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return mockUser;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};