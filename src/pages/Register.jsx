import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        dni: '',
        email: '',
        nombre: '',
        apellido: '',
        telefono: '',
        clave: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.clave !== formData.confirmPassword) {
            toast({
                title: "Error",
                description: "Las contraseñas no coinciden",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            await register(formData);
            toast({
                title: "¡Registro exitoso! 🎉",
                description: "Tu cuenta ha sido creada correctamente",
            });
            navigate('/dashboard');
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo crear la cuenta. Intenta nuevamente.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Registro - Club de Pádel</title>
                <meta name="description" content="Crea tu cuenta en el club de pádel" />
            </Helmet>

            <div className="min-h-screen flex items-center justify-center p-4 py-12">
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
                                className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-4"
                            >
                                <UserPlus className="w-8 h-8 text-white" />
                            </motion.div>
                            <h1 className="text-3xl font-bold text-white mb-2">Crear Cuenta</h1>
                            <p className="text-gray-300">Únete a nuestro club de pádel</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre" className="text-white">Nombre</Label>
                                    <Input
                                        id="nombre"
                                        name="nombre"
                                        type="text"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required
                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="apellido" className="text-white">Apellido</Label>
                                    <Input
                                        id="apellido"
                                        name="apellido"
                                        type="text"
                                        value={formData.apellido}
                                        onChange={handleChange}
                                        required
                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dni" className="text-white">DNI</Label>
                                <Input
                                    id="dni"
                                    name="dni"
                                    type="text"
                                    placeholder="12345678"
                                    value={formData.dni}
                                    onChange={handleChange}
                                    required
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-white">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telefono" className="text-white">Teléfono</Label>
                                <Input
                                    id="telefono"
                                    name="telefono"
                                    type="tel"
                                    placeholder="+54 9 11 1234-5678"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    required
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="clave" className="text-white">Contraseña</Label>
                                <Input
                                    id="clave"
                                    name="clave"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.clave}
                                    onChange={handleChange}
                                    required
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-white">Confirmar Contraseña</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Creando cuenta...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <UserPlus className="w-4 h-4" />
                                        Crear Cuenta
                                    </div>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-300">
                                ¿Ya tienes cuenta?{' '}
                                <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold">
                                    Inicia sesión aquí
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default Register;