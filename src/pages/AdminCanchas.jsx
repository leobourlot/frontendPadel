import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../components/ui/use-toast';
import { canchasService } from '../services/api.service';
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
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../components/ui/alert-dialog';

const AdminCanchas = () => {
    const [canchas, setCanchas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCancha, setEditingCancha] = useState(null);
    const [canchaToDelete, setCanchaToDelete] = useState(null);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        numero: '',
        tipo: '',
        descripcion: '',
        activa: true
    });

    useEffect(() => {
        loadCanchas();
    }, []);

    const loadCanchas = async () => {
        try {
            setLoading(true);
            const data = await canchasService.getAll();
            setCanchas(data);
        } catch (error) {
            console.error('Error cargando canchas:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las canchas",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (cancha = null) => {
        if (cancha) {
            setEditingCancha(cancha);
            setFormData({
                numero: cancha.numero,
                tipo: cancha.tipo,
                descripcion: cancha.descripcion || '',
                activa: cancha.activa
            });
        } else {
            setEditingCancha(null);
            setFormData({
                numero: '',
                tipo: '',
                descripcion: '',
                activa: true
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingCancha(null);
        setFormData({
            numero: '',
            tipo: '',
            descripcion: '',
            activa: true
        });
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.numero || !formData.tipo) {
            toast({
                title: "Error",
                description: "Por favor completa todos los campos obligatorios",
                variant: "destructive",
            });
            return;
        }

        try {
            if (editingCancha) {
                await canchasService.update(editingCancha.idCancha, formData);
                toast({
                    title: "¡Cancha actualizada! ✅",
                    description: "La cancha ha sido actualizada correctamente",
                });
            } else {
                await canchasService.create(formData);
                toast({
                    title: "¡Cancha creada! 🎾",
                    description: "La nueva cancha ha sido creada exitosamente",
                });
            }

            handleCloseDialog();
            await loadCanchas();
        } catch (error) {
            console.error('Error guardando cancha:', error);
            toast({
                title: "Error",
                description: error.message || "No se pudo guardar la cancha",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async () => {
        if (!canchaToDelete) return;

        try {
            await canchasService.delete(canchaToDelete);
            toast({
                title: "Cancha desactivada",
                description: "La cancha ha sido desactivada correctamente",
            });
            setCanchaToDelete(null);
            await loadCanchas();
        } catch (error) {
            console.error('Error eliminando cancha:', error);
            toast({
                title: "Error",
                description: "No se pudo desactivar la cancha",
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
                <title>Administrar Canchas - Club de Pádel</title>
                <meta name="description" content="Gestiona las canchas del club" />
            </Helmet>

            <Layout>
                <div className="space-y-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-between items-center"
                    >
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Administrar Canchas</h1>
                            <p className="text-gray-300">Gestiona las canchas del club</p>
                        </div>
                        <Button
                            onClick={() => handleOpenDialog()}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Nueva Cancha
                        </Button>
                    </motion.div>

                    {/* Lista de Canchas */}
                    {canchas.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center"
                        >
                            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No hay canchas</h3>
                            <p className="text-gray-300">Crea la primera cancha del club</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {canchas.map((cancha, index) => (
                                <motion.div
                                    key={cancha.idCancha}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-emerald-500 w-12 h-12 rounded-lg flex items-center justify-center">
                                                <MapPin className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">
                                                    Cancha {cancha.numero}
                                                </h3>
                                                <p className="text-gray-300 text-sm capitalize">
                                                    {cancha.tipo}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-xs px-3 py-1 rounded-full ${cancha.activa
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-red-500 text-white'
                                            }`}>
                                            {cancha.activa ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </div>

                                    {cancha.descripcion && (
                                        <p className="text-gray-300 text-sm mb-4">
                                            {cancha.descripcion}
                                        </p>
                                    )}

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleOpenDialog(cancha)}
                                            variant="outline"
                                            className="flex-1 border-white/20 text-white hover:bg-white/10"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Editar
                                        </Button>
                                        {/* <Button
                                            onClick={() => setCanchaToDelete(cancha.idCancha)}
                                            variant="destructive"
                                            className="flex-1"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Desactivar
                                        </Button> */}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Dialog para Crear/Editar */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="bg-gray-900 text-white border-white/20">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">
                                {editingCancha ? 'Editar Cancha' : 'Nueva Cancha'}
                            </DialogTitle>
                            <DialogDescription className="text-gray-400">
                                {editingCancha
                                    ? 'Actualiza la información de la cancha'
                                    : 'Completa los datos para crear una nueva cancha'}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="numero" className="text-gray-600">
                                    Número de Cancha *
                                </Label>
                                <Input
                                    id="numero"
                                    type="text"
                                    placeholder="Ej: 1"
                                    value={formData.numero}
                                    onChange={(e) => handleChange('numero', e.target.value)}
                                    required
                                    className="bg-white/10 border-white/20 text-gray-800"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tipo" className="text-gray-600">
                                    Tipo de Cancha *
                                </Label>
                                <Select
                                    value={formData.tipo}
                                    onValueChange={(value) => handleChange('tipo', value)}
                                >
                                    <SelectTrigger className="bg-white/10 border-white/20 text-gray-800">
                                        <SelectValue placeholder="Selecciona el tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="indoor">Indoor (Techada)</SelectItem>
                                        <SelectItem value="outdoor">Outdoor (Exterior)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="descripcion" className="text-gray-600">
                                    Descripción
                                </Label>
                                <textarea
                                    id="descripcion"
                                    placeholder="Ej: Cancha con iluminación LED y piso sintético"
                                    value={formData.descripcion}
                                    onChange={(e) => handleChange('descripcion', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseDialog}
                                    className="border-white/20 text-white hover:bg-white/10"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                >
                                    {editingCancha ? 'Actualizar' : 'Crear Cancha'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Dialog de Confirmación para Eliminar */}
                <AlertDialog open={!!canchaToDelete} onOpenChange={() => setCanchaToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Desactivar cancha?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción desactivará la cancha. Podrás reactivarla más tarde si lo deseas.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Sí, desactivar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Layout>
        </>
    );
};

export default AdminCanchas;