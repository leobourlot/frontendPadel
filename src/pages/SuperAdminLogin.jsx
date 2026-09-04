import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';

const SuperAdminLogin = () => {
    const [dni, setDni] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginSuperAdmin } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await loginSuperAdmin(dni, password);
            toast({
                title: "¡Bienvenido, Super Admin! 👑",
                description: "Has iniciado sesión correctamente",
            });
            navigate('/superadmin/clubes');
        } catch (error) {
            console.error('Error en login superadmin:', error);
            const errorMessage = error.message.includes('desactivado')
                ? "Tu cuenta ha sido desactivada."
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
                <title>Panel Interno</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
                        <div className="flex flex-col items-center mb-6">
                            <ShieldCheck className="w-10 h-10 text-amber-400 mb-2" />
                            <h1 className="text-xl font-bold text-white">Acceso restringido</h1>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="dni" className="text-gray-300">DNI</Label>
                                <Input
                                    id="dni"
                                    type="text"
                                    value={dni}
                                    onChange={(e) => setDni(e.target.value)}
                                    required
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="password" className="text-gray-300">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="mt-1"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-amber-500 hover:bg-amber-600"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Ingresando...
                                    </div>
                                ) : (
                                    'Ingresar'
                                )}
                            </Button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default SuperAdminLogin;