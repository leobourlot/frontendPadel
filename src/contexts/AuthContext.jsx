import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// URL del backend - ajusta según tu configuración
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
        // Verificar si hay un usuario guardado al cargar la app
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            // Opcionalmente, verificar si el token sigue siendo válido
            verifyToken(storedToken);
        }
        setLoading(false);
    }, []);

    const verifyToken = async (token) => {
        try {
            const response = await fetch(`${API_URL}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // Token inválido o expirado
                logout();
            }
        } catch (error) {
            console.error('Error verificando token:', error);
            logout();
        }
    };

    const login = async (dni, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dni, password })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al iniciar sesión');
            }

            const data = await response.json();

            // Guardar token y usuario
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.usuario));
            setUser(data.usuario);

            return data.usuario;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al registrarse');
            }

            const data = await response.json();

            // Guardar token y usuario
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.usuario));
            setUser(data.usuario);

            return data.usuario;
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    // Helper para obtener el token (útil para otras peticiones)
    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Helper para hacer peticiones autenticadas
    const fetchWithAuth = async (url, options = {}) => {
        const token = getToken();

        const config = {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        return fetch(`${API_URL}${url}`, config);
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
            login,
            register,
            logout,
            getToken,
            fetchWithAuth,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};