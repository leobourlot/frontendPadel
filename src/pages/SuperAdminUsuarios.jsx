import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Users, Shield, ShieldCheck, ToggleLeft, ToggleRight, Edit, Trash2, Plus, Crown } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../components/ui/use-toast';
import { usuariosSuperAdminService, clubesService } from '../services/api.service';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../components/ui/dialog';

const ROLES = [
    { value: 'jugador', label: 'Jugador' },
    { value: 'admin', label: 'Admin de club' },
    { value: 'superadmin', label: 'Super Admin' },
];

const initialForm = {
    dni: '', email: '', nombre: '', apellido: '', telefono: '', clave: '',
    rol: 'jugador', idClub: '',
};

const SuperAdminUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [clubes, setClubes] = useState([]);
    const [clubFiltro, setClubFiltro] = useState('todos');
    const [loading, setLoading] = useState(true);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState(initialForm);
    const [saving, setSaving] = useState(false);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingUsuario, setEditingUsuario] = useState(null);
    const [editFormData, setEditFormData] = useState(initialForm);
    const [savingEdit, setSavingEdit] = useState(false);

    const [deleteDialog, setDeleteDialog] = useState({ open: false, usuario: null });

    const { toast } = useToast();

    useEffect(() => {
        loadClubes();
    }, []);

    useEffect(() => {
        loadUsuarios();
    }, [clubFiltro]);

    const loadClubes = async () => {
        try {
            const data = await clubesService.getAll();
            setClubes(data);
        } catch (error) {
            console.error('Error cargando clubes:', error);
        }
    };

    const loadUsuarios = async () => {
        try {
            setLoading(true);
            const idClub = clubFiltro === 'todos' ? undefined : clubFiltro;
            const data = await usuariosSuperAdminService.getAll(idClub);
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

    // ===== Crear =====
    const handleChange = (field, value) => {
        setFormData(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'rol' && value === 'superadmin') {
                next.idClub = ''; // un superadmin no pertenece a ningún club
            }
            return next;
        });
    };

    const handleOpenCreate = () => {
        setFormData(initialForm);
        setDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { dni, email, nombre, apellido, telefono, clave, rol, idClub } = formData;
        if (!dni || !email || !nombre || !apellido || !telefono || !clave) {
            toast({
                title: "Error",
                description: "Completá todos los campos obligatorios",
                variant: "destructive",
            });
            return;
        }
        if (rol !== 'superadmin' && !idClub) {
            toast({
                title: "Error",
                description: "Seleccioná un club para este usuario",
                variant: "destructive",
            });
            return;
        }

        setSaving(true);
        try {
            await usuariosSuperAdminService.create({
                dni, email, nombre, apellido, telefono, clave,
                rol,
                idClub: rol === 'superadmin' ? null : Number(idClub),
            });
            toast({
                title: "✅ Usuario creado",
                description: `${nombre} ${apellido} fue creado correctamente`,
            });
            setDialogOpen(false);
            await loadUsuarios();
        } catch (error) {
            console.error('Error creando usuario:', error);
            toast({
                title: "Error",
                description: error.message || "No se pudo crear el usuario",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    // ===== Editar =====
    const handleOpenEdit = (usuario) => {
        setEditingUsuario(usuario);
        setEditFormData({
            dni: usuario.dni,
            email: usuario.email,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            telefono: usuario.telefono,
            clave: '',
            rol: usuario.rol,
            idClub: usuario.idClub ? String(usuario.idClub) : '',
        });
        setEditDialogOpen(true);
    };

    const handleEditChange = (field, value) => {
        setEditFormData(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'rol' && value === 'superadmin') {
                next.idClub = '';
            }
            return next;
        });
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();

        const payload = { ...editFormData };
        if (!payload.clave) delete payload.clave;
        payload.idClub = payload.rol === 'superadmin' ? null : (payload.idClub ? Number(payload.idClub) : null);

        setSavingEdit(true);
        try {
            await usuariosSuperAdminService.update(editingUsuario.idUsuario, payload);
            toast({
                title: "✅ Usuario actualizado",
                description: `Los datos de ${payload.nombre} fueron actualizados`,
            });
            setEditDialogOpen(false);
            await loadUsuarios();
        } catch (error) {
            console.error('Error actualizando usuario:', error);
            toast({
                title: "Error",
                description: error.message || "No se pudo actualizar el usuario",
                variant: "destructive",
            });
        } finally {
            setSavingEdit(false);
        }
    };

    // ===== Activar / Desactivar =====
    const handleToggleActive = async (usuario) => {
        try {
            await usuariosSuperAdminService.update(usuario.idUsuario, { activo: !usuario.activo });
            toast({
                title: usuario.activo ? "Usuario desactivado" : "✅ Usuario activado",
                description: `${usuario.nombre} ${usuario.apellido}`,
            });
            await loadUsuarios();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "No se pudo cambiar el estado",
                variant: "destructive",
            });
        }
    };

    // ===== Eliminar =====
    const handleDelete = async () => {
        try {
            await usuariosSuperAdminService.delete(deleteDialog.usuario.idUsuario);
            toast({
                title: "✅ Usuario eliminado",
                description: `${deleteDialog.usuario.nombre} ${deleteDialog.usuario.apellido} fue eliminado`,
            });
            setDeleteDialog({ open: false, usuario: null });
            await loadUsuarios();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "No se pudo eliminar el usuario",
                variant: "destructive",
            });
        }
    };

    const rolBadgeClass = (rol) => {
        if (rol === 'superadmin') return 'bg-purple-500';
        if (rol === 'admin') return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    if (loading && usuarios.length === 0) {
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
                <title>Super Admin - Usuarios</title>
            </Helmet>

            <Layout>
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:justify-between md:items-center gap-4"
                    >
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Usuarios</h1>
                            <p className="text-gray-300">Administra admins y jugadores de todos los clubes</p>
                        </div>
                        <Button
                            onClick={handleOpenCreate}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Nuevo Usuario
                        </Button>
                    </motion.div>

                    {/* Filtro por club */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 max-w-sm"
                    >
                        <Label className="text-gray-300 mb-2 block">Filtrar por club</Label>
                        <Select value={clubFiltro} onValueChange={setClubFiltro}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                <SelectValue placeholder="Todos los clubes" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos los clubes</SelectItem>
                                {clubes.map((club) => (
                                    <SelectItem key={club.idClub} value={String(club.idClub)}>
                                        {club.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </motion.div>

                    {/* Lista de Usuarios */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                    >
                        <h2 className="text-xl font-bold text-white mb-6">
                            Lista de Usuarios ({usuarios.length})
                        </h2>

                        {usuarios.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No hay usuarios para mostrar</p>
                        ) : (
                            <div className="space-y-4">
                                {usuarios.map((usuario, index) => (
                                    <motion.div
                                        key={usuario.idUsuario}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className={`bg-white/5 rounded-lg p-4 border transition-all ${usuario.activo ? 'border-white/10' : 'border-red-500/30 opacity-60'
                                            }`}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${rolBadgeClass(usuario.rol)}`}>
                                                    {usuario.rol === 'superadmin' ? (
                                                        <Crown className="w-6 h-6 text-white" />
                                                    ) : usuario.rol === 'admin' ? (
                                                        <ShieldCheck className="w-6 h-6 text-white" />
                                                    ) : (
                                                        <Users className="w-6 h-6 text-white" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold">
                                                        {usuario.nombre} {usuario.apellido}
                                                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${rolBadgeClass(usuario.rol)} text-white`}>
                                                            {usuario.rol}
                                                        </span>
                                                        {!usuario.activo && (
                                                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-500/70 text-white">
                                                                Inactivo
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-gray-400 text-sm">
                                                        DNI {usuario.dni} · {usuario.email}
                                                    </p>
                                                    <p className="text-gray-400 text-sm">
                                                        {usuario.club ? `Club: ${usuario.club.nombre}` : 'Sin club (superadmin)'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    onClick={() => handleOpenEdit(usuario)}
                                                    variant="outline"
                                                    className="border-white/20 text-white hover:bg-white/10"
                                                    size="sm"
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Editar
                                                </Button>

                                                {usuario.activo ? (
                                                    <Button
                                                        onClick={() => handleToggleActive(usuario)}
                                                        variant="outline"
                                                        className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                                                        size="sm"
                                                    >
                                                        <ToggleLeft className="w-4 h-4 mr-2" />
                                                        Desactivar
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={() => handleToggleActive(usuario)}
                                                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                                        size="sm"
                                                    >
                                                        <ToggleRight className="w-4 h-4 mr-2" />
                                                        Activar
                                                    </Button>
                                                )}

                                                <Button
                                                    onClick={() => setDeleteDialog({ open: true, usuario })}
                                                    variant="destructive"
                                                    size="sm"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Eliminar
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Dialog Crear */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="bg-gray-900 text-white border-white/20 max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Nuevo Usuario</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Creá un admin, jugador o superadmin para cualquier club
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Nombre *</Label>
                                    <Input
                                        value={formData.nombre}
                                        onChange={(e) => handleChange('nombre', e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Apellido *</Label>
                                    <Input
                                        value={formData.apellido}
                                        onChange={(e) => handleChange('apellido', e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">DNI *</Label>
                                    <Input
                                        value={formData.dni}
                                        onChange={(e) => handleChange('dni', e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Email *</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Teléfono *</Label>
                                    <Input
                                        value={formData.telefono}
                                        onChange={(e) => handleChange('telefono', e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Contraseña *</Label>
                                    <Input
                                        type="password"
                                        value={formData.clave}
                                        onChange={(e) => handleChange('clave', e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Rol *</Label>
                                    <Select value={formData.rol} onValueChange={(v) => handleChange('rol', v)}>
                                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ROLES.map((r) => (
                                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">
                                        Club {formData.rol !== 'superadmin' && '*'}
                                    </Label>
                                    <Select
                                        value={formData.idClub}
                                        onValueChange={(v) => handleChange('idClub', v)}
                                        disabled={formData.rol === 'superadmin'}
                                    >
                                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                            <SelectValue placeholder={formData.rol === 'superadmin' ? 'Sin club' : 'Seleccioná un club'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clubes.map((club) => (
                                                <SelectItem key={club.idClub} value={String(club.idClub)}>
                                                    {club.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                    {saving ? 'Creando...' : 'Crear Usuario'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Dialog Editar */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="bg-gray-900 text-white border-white/20 max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Editar Usuario</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Modificá los datos de {editingUsuario?.nombre} {editingUsuario?.apellido}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmitEdit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Nombre</Label>
                                    <Input
                                        value={editFormData.nombre}
                                        onChange={(e) => handleEditChange('nombre', e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Apellido</Label>
                                    <Input
                                        value={editFormData.apellido}
                                        onChange={(e) => handleEditChange('apellido', e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">DNI</Label>
                                    <Input
                                        value={editFormData.dni}
                                        onChange={(e) => handleEditChange('dni', e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Email</Label>
                                    <Input
                                        type="email"
                                        value={editFormData.email}
                                        onChange={(e) => handleEditChange('email', e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Teléfono</Label>
                                    <Input
                                        value={editFormData.telefono}
                                        onChange={(e) => handleEditChange('telefono', e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Nueva contraseña (opcional)</Label>
                                    <Input
                                        type="password"
                                        placeholder="Dejar vacío para no cambiarla"
                                        value={editFormData.clave}
                                        onChange={(e) => handleEditChange('clave', e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Rol</Label>
                                    <Select value={editFormData.rol} onValueChange={(v) => handleEditChange('rol', v)}>
                                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ROLES.map((r) => (
                                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">
                                        Club {editFormData.rol !== 'superadmin' && '*'}
                                    </Label>
                                    <Select
                                        value={editFormData.idClub}
                                        onValueChange={(v) => handleEditChange('idClub', v)}
                                        disabled={editFormData.rol === 'superadmin'}
                                    >
                                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                            <SelectValue placeholder={editFormData.rol === 'superadmin' ? 'Sin club' : 'Seleccioná un club'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clubes.map((club) => (
                                                <SelectItem key={club.idClub} value={String(club.idClub)}>
                                                    {club.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
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

                {/* Confirmación de borrado */}
                <AlertDialog
                    open={deleteDialog.open}
                    onOpenChange={(open) => setDeleteDialog({ open, usuario: deleteDialog.usuario })}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                            <AlertDialogDescription>
                                {deleteDialog.usuario?.nombre} {deleteDialog.usuario?.apellido} será eliminado
                                permanentemente. Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Sí, eliminar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Layout>
        </>
    );
};

export default SuperAdminUsuarios;