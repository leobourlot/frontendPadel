import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Calendar, Clock, LogOut, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import Footer from './footer'

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const menuItems = [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: Calendar, label: 'Nueva Reserva', path: '/reservas' },
        { icon: Clock, label: 'Mis Reservas', path: '/mis-reservas' }
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-white/10 backdrop-blur-lg border-b border-white/20 p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Club de Pádel</h2>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="text-white p-2"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Sidebar Desktop (Siempre visible) */}
            <aside className="hidden md:block w-64 bg-white/10 backdrop-blur-lg border-r border-white/20">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-8">Club de Pádel</h2>

                    <nav className="space-y-2">
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

            {/* Sidebar Mobile (Con animación) */}
            <motion.aside
                initial={false}
                animate={{
                    x: mobileMenuOpen ? 0 : '-100%'
                }}
                className="md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white/10 backdrop-blur-lg border-r border-white/20"
            >
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-8">Club de Pádel</h2>

                    <nav className="space-y-2">
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

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>

            <Footer/>
        </div>
    );
};

export default Layout;