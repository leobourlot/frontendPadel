import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Building2, Plus, Mail, Phone, Calendar, CheckCircle, XCircle, Edit, Power, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../components/ui/use-toast';
import { clubesService, horariosClubService } from '../services/api.service';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../components/ui/dialog';

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from '../components/ui/alert-dialog';

const DIAS_SEMANA = [
    { valor: 1, nombre: 'Lunes' },
    { valor: 2, nombre: 'Martes' },
    { valor: 3, nombre: 'Miércoles' },
    { valor: 4, nombre: 'Jueves' },
    { valor: 5, nombre: 'Viernes' },
    { valor: 6, nombre: 'Sábado' },
    { valor: 0, nombre: 'Domingo' },
];

const SuperAdminClubes = () => {
    const [clubes, setClubes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingClub, setEditingClub] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [savingEdit, setSavingEdit] = useState(false);

    const [toggleDialog, setToggleDialog] = useState({ open: false, club: null });

    const [horariosDialogOpen, setHorariosDialogOpen] = useState(false);
    const [horariosClub, setHorariosClub] = useState(null);
    const [horariosData, setHorariosData] = useState([]);
    const [loadingHorarios, setLoadingHorarios] = useState(false);
    const [savingHorarios, setSavingHorarios] = useState(false);


    const initialForm = {
        slug: '',
        nombre: '',
        emailContacto: '',
        telefono: '',
        direccion: '',
        facebookUrl: '',
        instagramUrl: '',
        twitterUrl: '',
        horarioSemana: '',
        horarioFinde: '',
        admin: {
            dni: '',
            email: '',
            nombre: '',
            apellido: '',
            telefono: '',
            clave: '',
        },
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        loadClubes();
    }, []);

    const loadClubes = async () => {
        try {
            setLoading(true);
            const data = await clubesService.getAll();
            setClubes(data);
        } catch (error) {
            console.error('Error cargando clubes:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los clubes",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAdminChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            admin: { ...prev.admin, [field]: value },
        }));
    };

    const handleOpenDialog = () => {
        setFormData(initialForm);
        setDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.slug || !formData.nombre) {
            toast({
                title: "Error",
                description: "Slug y nombre del club son obligatorios",
                variant: "destructive",
            });
            return;
        }

        const { dni, email, nombre, apellido, telefono, clave } = formData.admin;
        if (!dni || !email || !nombre || !apellido || !telefono || !clave) {
            toast({
                title: "Error",
                description: "Completá todos los datos del administrador",
                variant: "destructive",
            });
            return;
        }

        setSaving(true);
        try {
            await clubesService.createConAdmin(formData);
            toast({
                title: "¡Club creado! 🎉",
                description: `${formData.nombre} fue creado con su administrador correctamente`,
            });
            setDialogOpen(false);
            await loadClubes();
        } catch (error) {
            console.error('Error creando club:', error);
            toast({
                title: "Error",
                description: error.message || "No se pudo crear el club",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleOpenEdit = (club) => {
        setEditingClub(club);
        setEditFormData({
            nombre: club.nombre || '',
            emailContacto: club.emailContacto || '',
            telefono: club.telefono || '',
            direccion: club.direccion || '',
            facebookUrl: club.facebookUrl || '',
            instagramUrl: club.instagramUrl || '',
            twitterUrl: club.twitterUrl || '',
            horarioSemana: club.horarioSemana || '',
            horarioFinde: club.horarioFinde || '',
            mercadopagoHabilitado: club.mercadopagoHabilitado || false, // ✅ NUEVO
            mercadopagoAccessToken: club.mercadopagoAccessToken || '',  // ✅ NUEVO
            precioReserva: club.precioReserva || '',
        });
        setEditDialogOpen(true);
    };

    // ✅ NUEVO
    const handleEditChange = (field, value) => {
        if (field === 'precioReserva') {
            setEditFormData(prev => ({ ...prev, [field]: value === '' ? '' : Number(value) }));
            return;
        }
        setEditFormData(prev => ({ ...prev, [field]: value }));
    };

    // ✅ NUEVO
    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        setSavingEdit(true);
        try {
            await clubesService.update(editingClub.idClub, editFormData);
            toast({
                title: "✅ Club actualizado",
                description: `${editFormData.nombre} fue actualizado correctamente`,
            });
            setEditDialogOpen(false);
            await loadClubes();
        } catch (error) {
            console.error('Error actualizando club:', error);
            toast({
                title: "Error",
                description: error.message || "No se pudo actualizar el club",
                variant: "destructive",
            });
        } finally {
            setSavingEdit(false);
        }
    };

    // ✅ NUEVO: activar/desactivar
    const handleToggleActivo = async () => {
        const club = toggleDialog.club;
        if (!club) return;

        try {
            if (club.activo) {
                await clubesService.delete(club.idClub); // el backend ya hace activo=false
            } else {
                await clubesService.update(club.idClub, { activo: true });
            }
            toast({
                title: club.activo ? "Club desactivado" : "Club activado",
                description: `${club.nombre} fue ${club.activo ? 'desactivado' : 'activado'} correctamente`,
            });
            setToggleDialog({ open: false, club: null });
            await loadClubes();
        } catch (error) {
            console.error('Error cambiando estado del club:', error);
            toast({
                title: "Error",
                description: "No se pudo cambiar el estado del club",
                variant: "destructive",
            });
        }
    };

    const handleOpenHorarios = async (club) => {
        setHorariosClub(club);
        setHorariosDialogOpen(true);
        setLoadingHorarios(true);
        try {
            const data = await horariosClubService.getByClub(club.idClub);
            // Ordenar según DIAS_SEMANA (lunes primero) y asegurar que estén los 7 días
            const ordenado = DIAS_SEMANA.map(dia => {
                const existente = data.find(h => h.diaSemana === dia.valor);
                return existente || {
                    diaSemana: dia.valor,
                    horaInicio: '08:00',
                    horaFin: '23:00',
                    duracionTurno: 90,
                    activo: true,
                };
            });
            setHorariosData(ordenado);
        } catch (error) {
            console.error('Error cargando horarios:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los horarios del club",
                variant: "destructive",
            });
        } finally {
            setLoadingHorarios(false);
        }
    };

    // ✅ NUEVO
    const handleHorarioChange = (diaSemana, campo, valor) => {
        setHorariosData(prev => prev.map(h =>
            h.diaSemana === diaSemana ? { ...h, [campo]: valor } : h
        ));
    };

    // ✅ NUEVO
    const handleSubmitHorarios = async (e) => {
        e.preventDefault();
        setSavingHorarios(true);
        try {
            await horariosClubService.update(horariosClub.idClub, horariosData);
            toast({
                title: "✅ Horarios actualizados",
                description: `Los horarios de ${horariosClub.nombre} fueron guardados correctamente`,
            });
            setHorariosDialogOpen(false);
        } catch (error) {
            console.error('Error guardando horarios:', error);
            toast({
                title: "Error",
                description: error.message || "No se pudieron guardar los horarios",
                variant: "destructive",
            });
        } finally {
            setSavingHorarios(false);
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
                <title>Super Admin - Clubes</title>
            </Helmet>

            <Layout>
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-between items-center"
                    >
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Clubes</h1>
                            <p className="text-gray-300">Administra todos los clubes del sistema</p>
                        </div>
                        <Button
                            onClick={handleOpenDialog}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Nuevo Club
                        </Button>
                    </motion.div>

                    {clubes.length === 0 ? (
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
                            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No hay clubes</h3>
                            <p className="text-gray-300">Creá el primer club del sistema</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {clubes.map((club, index) => (
                                <motion.div
                                    key={club.idClub}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-emerald-500 w-12 h-12 rounded-lg flex items-center justify-center">
                                                    <Building2 className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">{club.nombre}</h3>
                                                    <p className="text-gray-400 text-sm">{club.slug}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-300 mt-2">
                                                {club.emailContacto && (
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3" /> {club.emailContacto}
                                                    </span>
                                                )}
                                                {club.telefono && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" /> {club.telefono}
                                                    </span>
                                                )}
                                                {club.fechaFinPrueba && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        Prueba hasta: {new Date(club.fechaFinPrueba).toLocaleDateString('es-AR')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full ${club.pagado ? 'bg-emerald-500' : 'bg-amber-500'} text-white`}>
                                                {club.pagado ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {club.pagado ? 'Pagado' : 'Prueba'}
                                            </span>
                                            <span className={`text-xs px-3 py-1 rounded-full ${club.activo ? 'bg-blue-500' : 'bg-red-500'} text-white`}>
                                                {club.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleOpenEdit(club)}
                                                variant="outline"
                                                size="sm"
                                                className="border-white/20 text-white hover:bg-white/10"
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                Editar
                                            </Button>
                                            <Button
                                                onClick={() => handleOpenHorarios(club)}
                                                variant="outline"
                                                size="sm"
                                                className="border-white/20 text-white hover:bg-white/10"
                                            >
                                                <Clock className="w-4 h-4 mr-2" />
                                                Horarios
                                            </Button>
                                            <Button
                                                onClick={() => setToggleDialog({ open: true, club })}
                                                variant="outline"
                                                size="sm"
                                                className={club.activo
                                                    ? "border-red-500/50 text-red-400 hover:bg-red-500/20"
                                                    : "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20"
                                                }
                                            >
                                                <Power className="w-4 h-4 mr-2" />
                                                {club.activo ? 'Desactivar' : 'Activar'}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="bg-gray-900 text-white border-white/20 max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Nuevo Club</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Completá los datos del club y de su primer administrador
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <h4 className="text-emerald-400 font-semibold mb-3">Datos del club</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Slug (subdominio) *</Label>
                                        <Input
                                            placeholder="clubdelrio"
                                            value={formData.slug}
                                            onChange={(e) => handleChange('slug', e.target.value)}
                                            className="bg-white/10 border-white/20 text-gray-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Nombre *</Label>
                                        <Input
                                            placeholder="Club del Río"
                                            value={formData.nombre}
                                            onChange={(e) => handleChange('nombre', e.target.value)}
                                            className="bg-white/10 border-white/20 text-gray-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Email de contacto</Label>
                                        <Input
                                            type="email"
                                            placeholder="info@clubdelrio.com"
                                            value={formData.emailContacto}
                                            onChange={(e) => handleChange('emailContacto', e.target.value)}
                                            className="bg-white/10 border-white/20 text-gray-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Teléfono</Label>
                                        <Input
                                            placeholder="+54 9 3456 000000"
                                            value={formData.telefono}
                                            onChange={(e) => handleChange('telefono', e.target.value)}
                                            className="bg-white/10 border-white/20 text-gray-600"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-gray-700">Dirección</Label>
                                        <Input
                                            placeholder="Av. Siempreviva 123"
                                            value={formData.direccion}
                                            onChange={(e) => handleChange('direccion', e.target.value)}
                                            className="bg-white/10 border-white/20 text-gray-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Facebook URL</Label>
                                        <Input
                                            placeholder="https://facebook.com/..."
                                            value={formData.facebookUrl}
                                            onChange={(e) => handleChange('facebookUrl', e.target.value)}
                                            className="bg-white/10 border-white/20 text-gray-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Instagram URL</Label>
                                        <Input
                                            placeholder="https://instagram.com/..."
                                            value={formData.instagramUrl}
                                            onChange={(e) => handleChange('instagramUrl', e.target.value)}
                                            className="bg-white/10 border-white/20 text-gray-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Twitter URL</Label>
                                        <Input
                                            placeholder="https://twitter.com/..."
                                            value={formData.twitterUrl}
                                            onChange={(e) => handleChange('twitterUrl', e.target.value)}
                                            className="bg-white/10 border-white/20 text-gray-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Horario Lun-Vie</Label>
                                        <Input
                                            placeholder="8:00 - 23:00"
                                            value={formData.horarioSemana}
                                            onChange={(e) => handleChange('horarioSemana', e.target.value)}
                                            className="bg-white/10 border-white/20 text-gray-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Horario Sáb-Dom</Label>
                                        <Input
                                            placeholder="9:00 - 22:00"
                                            value={formData.horarioFinde}
                                            onChange={(e) => handleChange('horarioFinde', e.target.value)}
                                            className="bg-white/10 border-white/20 text-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-emerald-400 font-semibold mb-3">Administrador del club</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Nombre *</Label>
                                        <Input
                                            value={formData.admin.nombre}
                                            onChange={(e) => handleAdminChange('nombre', e.target.value)}
                                            className="bg-white/10 border-white/20 text-gray-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Apellido *</Label>
                                        <Input
                                            value={formData.admin.apellido}
                                            onChange={(e) => handleAdminChange('apellido', e.target.value)}
                                            className="bg-white/10 border-white/20 text-gray-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">DNI *</Label>
                                        <Input
                                            value={formData.admin.dni}
                                            onChange={(e) => handleAdminChange('dni', e.target.value)}
                                            className="bg-white/10 border-white/20 text-gray-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Teléfono *</Label>
                                        <Input
                                            value={formData.admin.telefono}
                                            onChange={(e) => handleAdminChange('telefono', e.target.value)}
                                            className="bg-white/10 border-white/20 text-gray-600"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-gray-700">Email *</Label>
                                        <Input
                                            type="email"
                                            value={formData.admin.email}
                                            onChange={(e) => handleAdminChange('email', e.target.value)}
                                            className="bg-white/10 border-white/20 text-gray-600"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-gray-700">Contraseña *</Label>
                                        <Input
                                            type="password"
                                            value={formData.admin.clave}
                                            onChange={(e) => handleAdminChange('clave', e.target.value)}
                                            className="bg-white/10 border-white/20 text-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                    className="border-white/20 text-white hover:bg-white/10"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                >
                                    {saving ? 'Creando...' : 'Crear Club'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="bg-gray-900 text-white border-white/20 max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Editar Club</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Modificá los datos de {editingClub?.nombre}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmitEdit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Nombre</Label>
                                    <Input
                                        value={editFormData.nombre || ''}
                                        onChange={(e) => handleEditChange('nombre', e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Email de contacto</Label>
                                    <Input
                                        type="email"
                                        value={editFormData.emailContacto || ''}
                                        onChange={(e) => handleEditChange('emailContacto', e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Teléfono</Label>
                                    <Input
                                        value={editFormData.telefono || ''}
                                        onChange={(e) => handleEditChange('telefono', e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Dirección</Label>
                                    <Input
                                        value={editFormData.direccion || ''}
                                        onChange={(e) => handleEditChange('direccion', e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Facebook URL</Label>
                                    <Input
                                        value={editFormData.facebookUrl || ''}
                                        onChange={(e) => handleEditChange('facebookUrl', e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Instagram URL</Label>
                                    <Input
                                        value={editFormData.instagramUrl || ''}
                                        onChange={(e) => handleEditChange('instagramUrl', e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Twitter URL</Label>
                                    <Input
                                        value={editFormData.twitterUrl || ''}
                                        onChange={(e) => handleEditChange('twitterUrl', e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Horario Lun-Vie</Label>
                                    <Input
                                        value={editFormData.horarioSemana || ''}
                                        onChange={(e) => handleEditChange('horarioSemana', e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Horario Sáb-Dom</Label>
                                    <Input
                                        value={editFormData.horarioFinde || ''}
                                        onChange={(e) => handleEditChange('horarioFinde', e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                            </div>
                            <div className="pt-2 border-t border-white/10">
                                <h4 className="text-emerald-400 font-semibold mb-3 mt-4">Cobro con Mercado Pago</h4>

                                <div className="flex items-center gap-2 mb-4">
                                    <input
                                        type="checkbox"
                                        id="mercadopagoHabilitado"
                                        checked={editFormData.mercadopagoHabilitado}
                                        onChange={(e) => handleEditChange('mercadopagoHabilitado', e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <Label htmlFor="mercadopagoHabilitado" className="text-gray-300 cursor-pointer">
                                        Este club cobra la seña con Mercado Pago
                                    </Label>
                                </div>

                                {editFormData.mercadopagoHabilitado && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 col-span-2">
                                            <Label className="text-gray-300">Access Token de Mercado Pago</Label>
                                            <Input
                                                type="password"
                                                placeholder="APP_USR-..."
                                                value={editFormData.mercadopagoAccessToken}
                                                onChange={(e) => handleEditChange('mercadopagoAccessToken', e.target.value)}
                                                className="bg-white/10 border-white/20 text-white"
                                            />
                                            <p className="text-xs text-gray-400">
                                                Lo obtiene el club en su cuenta de Mercado Pago → Credenciales de producción.
                                            </p>
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <Label className="text-gray-300">Precio de la seña (ARS)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="100"
                                                placeholder="5000"
                                                value={editFormData.precioReserva}
                                                onChange={(e) => handleEditChange('precioReserva', e.target.value)}
                                                className="bg-white/10 border-white/20 text-white"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditDialogOpen(false)}
                                    className="border-white/20 text-white hover:bg-white/10"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={savingEdit}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                >
                                    {savingEdit ? 'Guardando...' : 'Guardar cambios'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={horariosDialogOpen} onOpenChange={setHorariosDialogOpen}>
                    <DialogContent className="bg-gray-900 text-white border-white/20 max-w-3xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Horarios de atención</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Configurá el horario y duración de turnos para {horariosClub?.nombre}, día por día
                            </DialogDescription>
                        </DialogHeader>

                        {loadingHorarios ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitHorarios} className="space-y-3">
                                {horariosData.map((horario) => {
                                    const nombreDia = DIAS_SEMANA.find(d => d.valor === horario.diaSemana)?.nombre;
                                    return (
                                        <div
                                            key={horario.diaSemana}
                                            className={`grid grid-cols-12 gap-2 items-center p-3 rounded-lg border ${horario.activo ? 'bg-white/5 border-white/10' : 'bg-white/5 border-white/5 opacity-50'}`}
                                        >
                                            <div className="col-span-2 flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={horario.activo}
                                                    onChange={(e) => handleHorarioChange(horario.diaSemana, 'activo', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm font-medium">{nombreDia}</span>
                                            </div>
                                            <div className="col-span-3">
                                                <Label className="text-xs text-gray-400">Desde</Label>
                                                <Input
                                                    type="time"
                                                    value={horario.horaInicio}
                                                    onChange={(e) => handleHorarioChange(horario.diaSemana, 'horaInicio', e.target.value)}
                                                    disabled={!horario.activo}
                                                    className="bg-white/10 border-white/20 text-white h-9"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <Label className="text-xs text-gray-400">Hasta</Label>
                                                <Input
                                                    type="time"
                                                    value={horario.horaFin}
                                                    onChange={(e) => handleHorarioChange(horario.diaSemana, 'horaFin', e.target.value)}
                                                    disabled={!horario.activo}
                                                    className="bg-white/10 border-white/20 text-white h-9"
                                                />
                                            </div>
                                            <div className="col-span-4">
                                                <Label className="text-xs text-gray-400">Duración turno (min)</Label>
                                                <Input
                                                    type="number"
                                                    min={15}
                                                    step={15}
                                                    value={horario.duracionTurno}
                                                    onChange={(e) => handleHorarioChange(horario.diaSemana, 'duracionTurno', parseInt(e.target.value) || 90)}
                                                    disabled={!horario.activo}
                                                    className="bg-white/10 border-white/20 text-white h-9"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}

                                <DialogFooter className="pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setHorariosDialogOpen(false)}
                                        className="border-white/20 text-white hover:bg-white/10"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={savingHorarios}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                    >
                                        {savingHorarios ? 'Guardando...' : 'Guardar horarios'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>

                {/* ✅ NUEVO: Confirmación activar/desactivar */}
                <AlertDialog open={toggleDialog.open} onOpenChange={(open) => setToggleDialog({ open, club: toggleDialog.club })}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {toggleDialog.club?.activo ? '¿Desactivar club?' : '¿Activar club?'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {toggleDialog.club?.activo
                                    ? `${toggleDialog.club?.nombre} dejará de estar disponible para sus usuarios hasta que lo reactives.`
                                    : `${toggleDialog.club?.nombre} volverá a estar disponible para sus usuarios.`
                                }
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleToggleActivo}
                                className={toggleDialog.club?.activo ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}
                            >
                                {toggleDialog.club?.activo ? 'Sí, desactivar' : 'Sí, activar'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Layout>
        </>
    );
};

export default SuperAdminClubes;