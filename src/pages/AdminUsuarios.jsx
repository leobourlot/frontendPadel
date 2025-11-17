import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Users, Shield, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';
import { usuariosService } from '../services/api.service';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../components/ui/alert-dialog';

const AdminUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        usuario: null,
        action: null,
        title: '',
        description: ''
    });
    const { toast } = useToast();

    useEffect(() => {
        loadUsuarios();
    }, []);

    const loadUsuarios = async () => {
        try {
            setLoading(true);
            const data = await usuariosService.getAll();
            setUsuarios(data);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los usuarios",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const openConfirmDialog = (usuario, action) => {
        let title, description;

        switch (action) {
            case 'promote':
                title = '¿Promover a Administrador?';
                description = `${usuario.nombre} ${usuario.apellido} tendrá acceso completo al sistema y podrá gestionar canchas y usuarios.`;
                break;
            case 'demote':
                title = '¿Degradar a Jugador?';
                description = `${usuario.nombre} ${usuario.apellido} perderá los permisos de administrador y solo podrá hacer reservas.`;
                break;
            case 'activate':
                title = '¿Activar usuario?';
                description = `${usuario.nombre} ${usuario.apellido} podrá iniciar sesión y usar el sistema.`;
                break;
            case 'deactivate':
                title = '¿Desactivar usuario?';
                description = `${usuario.nombre} ${usuario.apellido} no podrá iniciar sesión hasta que sea reactivado.`;
                break;
        }

        setConfirmDialog({
            open: true,
            usuario,
            action,
            title,
            description
        });
    };

    const handleConfirmAction = async () => {
        const { usuario, action } = confirmDialog;

        try {
            switch (action) {
                case 'promote':
                    await usuariosService.updateRole(usuario.idUsuario, 'admin');
                    toast({
                        title: "✅ Usuario promovido",
                        description: `${usuario.nombre} ahora es administrador`,
                    });
                    break;
                case 'demote':
                    await usuariosService.updateRole(usuario.idUsuario, 'jugador');
                    toast({
                        title: "✅ Usuario degradado",
                        description: `${usuario.nombre} ahora es jugador`,
                    });
                    break;
                case 'activate':
                    await usuariosService.toggleActive(usuario.idUsuario, true);
                    toast({
                        title: "✅ Usuario activado",
                        description: `${usuario.nombre} puede iniciar sesión`,
                    });
                    break;
                case 'deactivate':
                    await usuariosService.toggleActive(usuario.idUsuario, false);
                    toast({
                        title: "✅ Usuario desactivado",
                        description: `${usuario.nombre} no puede iniciar sesión`,
                    });
                    break;
            }

            await loadUsuarios();
            setConfirmDialog({ ...confirmDialog, open: false });
        } catch (error) {
            console.error('Error ejecutando acción:', error);
            toast({
                title: "Error",
                description: error.message || "No se pudo completar la acción",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                </div>
            </Layout>
        );
    }

    return (
        <>
            <Helmet>
                <title>Gestionar Usuarios - Club de Pádel</title>
                <meta name="description" content="Administra usuarios y roles del club" />
            </Helmet>

            <Layout>
                <div className="space-y-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-3xl font-bold text-white mb-2">Gestionar Usuarios</h1>
                        <p className="text-gray-300">Administra roles y permisos de los usuarios</p>
                    </motion.div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-gray-300 text-sm">Total Usuarios</p>
                                    <p className="text-3xl font-bold text-white">{usuarios.length}</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-amber-500 w-12 h-12 rounded-lg flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-gray-300 text-sm">Administradores</p>
                                    <p className="text-3xl font-bold text-white">
                                        {usuarios.filter(u => u.rol === 'admin').length}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-emerald-500 w-12 h-12 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-gray-300 text-sm">Jugadores</p>
                                    <p className="text-3xl font-bold text-white">
                                        {usuarios.filter(u => u.rol === 'jugador').length}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Lista de Usuarios */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                    >
                        <h2 className="text-xl font-bold text-white mb-6">Lista de Usuarios</h2>

                        <div className="space-y-4">
                            {usuarios.map((usuario, index) => (
                                <motion.div
                                    key={usuario.idUsuario}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`bg-white/5 rounded-lg p-4 border transition-all ${usuario.activo ? 'border-white/10' : 'border-red-500/30 opacity-60'
                                        }`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${usuario.rol === 'admin'
                                                    ? 'bg-amber-500'
                                                    : 'bg-emerald-500'
                                                }`}>
                                                {usuario.rol === 'admin' ? (
                                                    <ShieldCheck className="w-6 h-6 text-white" />
                                                ) : (
                                                    <Users className="w-6 h-6 text-white" />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-bold text-white">
                                                        {usuario.nombre} {usuario.apellido}
                                                    </h3>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${usuario.rol === 'admin'
                                                            ? 'bg-amber-500 text-white'
                                                            : 'bg-blue-500 text-white'
                                                        }`}>
                                                        {usuario.rol === 'admin' ? '👑 Admin' : '🎾 Jugador'}
                                                    </span>
                                                    {!usuario.activo && (
                                                        <span className="text-xs px-2 py-1 rounded-full bg-red-500 text-white">
                                                            Inactivo
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-3 text-sm text-gray-300">
                                                    <span>📧 {usuario.email}</span>
                                                    <span>🆔 DNI: {usuario.dni}</span>
                                                    <span>📱 {usuario.telefono}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {/* Cambiar rol */}
                                            {usuario.rol === 'jugador' ? (
                                                <Button
                                                    onClick={() => openConfirmDialog(usuario, 'promote')}
                                                    className="bg-amber-500 hover:bg-amber-600 text-white"
                                                    size="sm"
                                                >
                                                    <Shield className="w-4 h-4 mr-2" />
                                                    Hacer Admin
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => openConfirmDialog(usuario, 'demote')}
                                                    variant="outline"
                                                    className="border-white/20 text-white hover:bg-white/10"
                                                    size="sm"
                                                >
                                                    <Users className="w-4 h-4 mr-2" />
                                                    Hacer Jugador
                                                </Button>
                                            )}

                                            {/* Activar/Desactivar */}
                                            {usuario.activo ? (
                                                <Button
                                                    onClick={() => openConfirmDialog(usuario, 'deactivate')}
                                                    variant="outline"
                                                    className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                                                    size="sm"
                                                >
                                                    <ToggleLeft className="w-4 h-4 mr-2" />
                                                    Desactivar
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => openConfirmDialog(usuario, 'activate')}
                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                                    size="sm"
                                                >
                                                    <ToggleRight className="w-4 h-4 mr-2" />
                                                    Activar
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Dialog de Confirmación */}
                <AlertDialog
                    open={confirmDialog.open}
                    onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {confirmDialog.description}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleConfirmAction}
                                className={
                                    confirmDialog.action === 'promote' || confirmDialog.action === 'activate'
                                        ? 'bg-emerald-500 hover:bg-emerald-600'
                                        : 'bg-red-500 hover:bg-red-600'
                                }
                            >
                                Confirmar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Layout>
        </>
    );
};

export default AdminUsuarios;