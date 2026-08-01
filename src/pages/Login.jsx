import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, User, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';
import Footer from '../components/Footer';
import { useLocation } from 'react-router-dom';


const Login = () => {
    const [dni, setDni] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginSuperAdmin, club } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const location = useLocation();

    const [modoSuperAdmin, setModoSuperAdmin] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (modoSuperAdmin) {
                await loginSuperAdmin(dni, password); // ✅ NUEVO
                toast({
                    title: "¡Bienvenido, Super Admin! 👑",
                    description: "Has iniciado sesión correctamente",
                });
                navigate('/superadmin/clubes');
                return;
            }

            await login(dni, password);
            toast({
                title: "¡Bienvenido! 🎾",
                description: "Has iniciado sesión correctamente",
            });
            const from = location.state?.from || '/dashboard';
            navigate(from);
        } catch (error) {
            console.error('Error en login:', error);
            const errorMessage = error.message.includes('desactivado')
                ? "Tu cuenta ha sido desactivada. Contacta al administrador."
                : modoSuperAdmin
                    ? "DNI o contraseña incorrectos"
                    : "DNI o contraseña incorrectos";

            toast({
                title: "Error al iniciar sesión",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>{club?.nombre ? `${club.nombre} - Reservas` : 'Club de Pádel'}</title>
                <meta name="description" content="Inicia sesión en tu cuenta del club de pádel" />
            </Helmet>

            <div className="min-h-screen flex flex-col">
                <div className="flex-1 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-md"
                    >
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                            <div className="text-center mb-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${modoSuperAdmin ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                >
                                    {modoSuperAdmin ? <ShieldCheck className="w-8 h-8 text-white" /> : <User className="w-8 h-8 text-white" />}
                                </motion.div>
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    {modoSuperAdmin ? 'Acceso Super Admin' : 'Bienvenido'}
                                </h1>
                                <p className="text-gray-300">
                                    {modoSuperAdmin ? 'Panel de administración general' : 'Inicia sesión para reservar tu cancha'}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="dni" className="text-white">DNI</Label>
                                    <Input
                                        id="dni"
                                        type="text"
                                        placeholder="12345678"
                                        value={dni}
                                        onChange={(e) => setDni(e.target.value)}
                                        required
                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-white">Contraseña</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full text-white ${modoSuperAdmin ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Iniciando sesión...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <LogIn className="w-4 h-4" />
                                            Iniciar Sesión
                                        </div>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 text-center space-y-2">
                                {!modoSuperAdmin && (
                                    <p className="text-gray-300">
                                        ¿No tienes cuenta?{' '}
                                        <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold">
                                            Regístrate aquí
                                        </Link>
                                    </p>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setModoSuperAdmin(!modoSuperAdmin)}
                                    className="text-xs text-gray-400 hover:text-white"
                                >
                                    {modoSuperAdmin ? '← Volver a login normal' : 'Acceso Super Admin'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <Footer />
            </div>
        </>
    );
};

export default Login;