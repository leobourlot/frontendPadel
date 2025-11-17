// src/components/Layout.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Calendar, Clock, LogOut, Menu, X, MapPin, Users, Repeat, CalendarCheck } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import Footer from './Footer';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // ✅ DEBUG: Ver qué usuario tenemos
    // console.log('👤 Usuario en Layout:', user);
    // console.log('👤 Rol del usuario:', user?.rol);

    // Menú base para todos
    const baseMenuItems = [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: Calendar, label: 'Nueva Reserva', path: '/reservas' },
        { icon: Repeat, label: 'Reservas fijas', path: '/reservas-recurrentes' },
        { icon: Clock, label: 'Mis Reservas', path: '/mis-reservas' }
    ];

    // Menú adicional solo para admin
    const adminMenuItems = [
        { icon: MapPin, label: 'Gestionar Canchas', path: '/admin/canchas' },
        { icon: Users, label: 'Gestionar Usuarios', path: '/admin/usuarios' },
        { icon: CalendarCheck, label: 'Gestionar Reservas', path: '/admin/reservas' }
    ];

    // ✅ Verificación estricta del rol
    const isAdmin = user?.rol === 'admin';
    // console.log('🔍 ¿Es admin?', isAdmin);

    // Combinar menús según el rol
    const menuItems = isAdmin
        ? [...baseMenuItems, ...adminMenuItems]
        : baseMenuItems;

    // console.log('📋 Menú items:', menuItems.map(m => m.label));

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-white/10 backdrop-blur-lg border-b border-white/20 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Club de Pádel</h2>
                        {isAdmin && (
                            <span className="text-xs text-amber-400">👑 Admin</span>
                        )}
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="text-white p-2"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Sidebar Desktop */}
            <aside className="hidden md:block w-64 bg-white/10 backdrop-blur-lg border-r border-white/20">
                <div className="p-6 sticky top-0">
                    <h2 className="text-2xl font-bold text-white mb-2">Club de Pádel</h2>

                    {/* Badge de rol */}
                    {isAdmin && (
                        <span className="inline-block bg-amber-500 text-white text-xs px-2 py-1 rounded-full mb-6">
                            👑 Administrador
                        </span>
                    )}

                    <nav className="space-y-2 mt-4">
                        {menuItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                                    ${location.pathname === item.path
                                        ? 'bg-emerald-500 text-white'
                                        : 'text-gray-300 hover:bg-white/10'
                                    }
                                `}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="mt-8 pt-8 border-t border-white/20">
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            className="w-full justify-start text-gray-300 hover:bg-white/10 hover:text-white"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Sidebar Mobile */}
            <motion.aside
                initial={false}
                animate={{
                    x: mobileMenuOpen ? 0 : '-100%'
                }}
                className="md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white/10 backdrop-blur-lg border-r border-white/20"
            >
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Club de Pádel</h2>

                    {isAdmin && (
                        <span className="inline-block bg-amber-500 text-white text-xs px-2 py-1 rounded-full mb-6">
                            👑 Administrador
                        </span>
                    )}

                    <nav className="space-y-2 mt-4">
                        {menuItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    setMobileMenuOpen(false);
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                                    ${location.pathname === item.path
                                        ? 'bg-emerald-500 text-white'
                                        : 'text-gray-300 hover:bg-white/10'
                                    }
                                `}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="mt-8 pt-8 border-t border-white/20">
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            className="w-full justify-start text-gray-300 hover:bg-white/10 hover:text-white"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </motion.aside>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Contenedor principal con Flexbox */}
            <div className="flex-1 flex flex-col min-h-screen">
                <main className="flex-1 p-4 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default Layout;