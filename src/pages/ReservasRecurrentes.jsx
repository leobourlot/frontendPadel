import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Repeat, Trash2, Plus } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { format, addDays, parseISO, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { canchasService, reservasService } from '../services/api.service';
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

const DIAS_SEMANA = [
    { valor: 0, nombre: 'Domingo', emoji: '🌞' },
    { valor: 1, nombre: 'Lunes', emoji: '📅' },
    { valor: 2, nombre: 'Martes', emoji: '📅' },
    { valor: 3, nombre: 'Miércoles', emoji: '📅' },
    { valor: 4, nombre: 'Jueves', emoji: '📅' },
    { valor: 5, nombre: 'Viernes', emoji: '📅' },
    { valor: 6, nombre: 'Sábado', emoji: '🎉' },
];

const HORARIOS = [
    '08:00', '09:30', '11:00', '12:30', '14:00',
    '15:30', '17:00', '18:30', '20:00', '21:30'
];

const ReservasRecurrentes = () => {
    const [reservasRecurrentes, setReservasRecurrentes] = useState([]);
    const [canchas, setCanchas] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reservaToDelete, setReservaToDelete] = useState(null);
    const { user } = useAuth();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        idCancha: '',
        diaSemana: '',
        horaInicio: '',
        fechaInicio: format(new Date(), 'yyyy-MM-dd'),
        fechaFin: '',
        tieneFinalizacion: false
    });

    useEffect(() => {
        loadCanchas();
        loadReservasRecurrentes();
    }, []);

    const loadCanchas = async () => {
        try {
            const data = await canchasService.getAll();
            setCanchas(data);
        } catch (error) {
            console.error('Error cargando canchas:', error);
        }
    };

    const loadReservasRecurrentes = async () => {
        try {
            setLoading(true);
            const data = await reservasService.getMisReservasRecurrentes();
            setReservasRecurrentes(data);
        } catch (error) {
            console.error('Error cargando reservas recurrentes:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las reservas recurrentes",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = () => {
        setFormData({
            idCancha: '',
            diaSemana: '',
            horaInicio: '',
            fechaInicio: format(new Date(), 'yyyy-MM-dd'),
            fechaFin: '',
            tieneFinalizacion: false
        });
        setDialogOpen(true);
    };

    const calcularHoraFin = (horaInicio) => {
        const [horas, minutos] = horaInicio.split(':').map(Number);
        const fecha = new Date();
        fecha.setHours(horas, minutos, 0, 0);
        fecha.setMinutes(fecha.getMinutes() + 90);
        return format(fecha, 'HH:mm');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.idCancha || !formData.diaSemana || !formData.horaInicio) {
            toast({
                title: "Error",
                description: "Por favor completa todos los campos obligatorios",
                variant: "destructive",
            });
            return;
        }

        // ✅ Parsear la fecha con date-fns
        const fechaInicio = parseISO(formData.fechaInicio);
        const diaReal = getDay(fechaInicio); // 0-6 (Domingo-Sábado)
        const diaEsperado = parseInt(formData.diaSemana);

        console.log('📅 Fecha original:', formData.fechaInicio);
        console.log('📅 Fecha parseada:', fechaInicio);
        console.log('📅 Día real (getDay):', diaReal);
        console.log('📅 Día esperado:', diaEsperado);

        // Validar que coincidan
        if (diaReal !== diaEsperado) {
            console.log('❌ No coinciden los días');
            toast({
                title: "Error",
                description: `La fecha seleccionada es ${DIAS_SEMANA[diaReal].nombre}, pero seleccionaste ${DIAS_SEMANA[diaEsperado].nombre}`,
                variant: "destructive",
            });
            return;
        }

        console.log('✅ Validación correcta - días coinciden');

        try {
            const horaFin = calcularHoraFin(formData.horaInicio);

            const reservaData = {
                idCancha: parseInt(formData.idCancha),
                diaSemana: diaEsperado,
                horaInicio: formData.horaInicio,
                horaFin: horaFin,
                fechaInicio: formData.fechaInicio,
                fechaFin: formData.tieneFinalizacion ? formData.fechaFin : null,
            };

            console.log('📤 Enviando datos:', reservaData);

            await reservasService.createRecurrente(reservaData);

            toast({
                title: "¡Reserva recurrente creada! 🔄",
                description: "Se generarán reservas automáticamente cada semana",
            });

            setDialogOpen(false);
            await loadReservasRecurrentes();
        } catch (error) {
            console.error('❌ Error creando reserva recurrente:', error);
            toast({
                title: "Error",
                description: error.message || "No se pudo crear la reserva recurrente",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async () => {
        if (!reservaToDelete) return;

        try {
            await reservasService.cancelRecurrente(reservaToDelete);
            toast({
                title: "Reserva recurrente cancelada",
                description: "La reserva recurrente ha sido cancelada",
            });
            setReservaToDelete(null);
            await loadReservasRecurrentes();
        } catch (error) {
            console.error('Error cancelando reserva:', error);
            toast({
                title: "Error",
                description: "No se pudo cancelar la reserva recurrente",
                variant: "destructive",
            });
        }
    };

    const getDiaNombre = (dia) => {
        return DIAS_SEMANA.find(d => d.valor === dia)?.nombre || dia;
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
                <title>Reservas Recurrentes - Club de Pádel</title>
                <meta name="description" content="Gestiona tus reservas semanales fijas" />
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
                            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                                <Repeat className="w-8 h-8 text-emerald-500" />
                                Reservas Recurrentes
                            </h1>
                            <p className="text-gray-300">Configura reservas semanales automáticas</p>
                        </div>
                        <Button
                            onClick={handleOpenDialog}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Nueva Recurrente
                        </Button>
                    </motion.div>

                    {/* Info Card */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-blue-500/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30"
                    >
                        <div className="flex items-start gap-3">
                            <Repeat className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">¿Qué son las reservas recurrentes?</h3>
                                <p className="text-gray-300 text-sm">
                                    Programa tu cancha favorita el mismo día y hora cada semana.
                                    Por ejemplo: <span className="text-emerald-400 font-semibold">Todos los martes a las 20:00</span>.
                                    Las reservas se crean automáticamente para las próximas 4 semanas.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Lista de Reservas Recurrentes */}
                    {reservasRecurrentes.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center"
                        >
                            <Repeat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No tienes reservas recurrentes</h3>
                            <p className="text-gray-300 mb-4">Crea tu primera reserva semanal automática</p>
                            <Button
                                onClick={handleOpenDialog}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Crear Primera Recurrente
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="grid gap-4">
                            {reservasRecurrentes.map((reserva, index) => (
                                <motion.div
                                    key={reserva.idReservaRecurrente}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="space-y-3 flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-emerald-500 w-12 h-12 rounded-lg flex items-center justify-center">
                                                    <Repeat className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">
                                                        Cada {getDiaNombre(reserva.diaSemana)}
                                                    </h3>
                                                    <p className="text-gray-300 text-sm">
                                                        Cancha {reserva.cancha.numero} - {reserva.cancha.tipo}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-sm">
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{reserva.horaInicio} - {reserva.horaFin}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>
                                                        Desde: {format(new Date(reserva.fechaInicio), 'dd/MM/yyyy')}
                                                    </span>
                                                </div>
                                                {reserva.fechaFin && (
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>
                                                            Hasta: {format(new Date(reserva.fechaFin), 'dd/MM/yyyy')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <span className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full">
                                                    🔄 Activa
                                                </span>
                                                {!reserva.fechaFin && (
                                                    <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                                                        ♾️ Sin fecha fin
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            variant="destructive"
                                            onClick={() => setReservaToDelete(reserva.idReservaRecurrente)}
                                            className="md:self-start"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Cancelar
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Dialog para crear */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="bg-gray-900 text-white border-white/20 max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Repeat className="w-6 h-6 text-emerald-500" />
                                Nueva Reserva Recurrente
                            </DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Configura una reserva que se repetirá automáticamente cada semana
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cancha" className="text-gray-600">
                                        Cancha *
                                    </Label>
                                    <Select
                                        value={formData.idCancha}
                                        onValueChange={(value) => setFormData({ ...formData, idCancha: value })}
                                    >
                                        <SelectTrigger className="bg-white/10 border-white/20 text-gray-800">
                                            <SelectValue placeholder="Selecciona cancha" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {canchas.map((cancha) => (
                                                <SelectItem key={cancha.idCancha} value={cancha.idCancha.toString()}>
                                                    Cancha {cancha.numero} - {cancha.tipo}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="diaSemana" className="text-gray-600">
                                        Día de la semana *
                                    </Label>
                                    <Select
                                        value={formData.diaSemana}
                                        onValueChange={(value) => setFormData({ ...formData, diaSemana: value })}
                                    >
                                        <SelectTrigger className="bg-white/10 border-white/20 text-gray-800">
                                            <SelectValue placeholder="Selecciona día" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DIAS_SEMANA.map((dia) => (
                                                <SelectItem key={dia.valor} value={dia.valor.toString()}>
                                                    {dia.emoji} {dia.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="horaInicio" className="text-gray-600">
                                    Hora *
                                </Label>
                                <Select
                                    value={formData.horaInicio}
                                    onValueChange={(value) => setFormData({ ...formData, horaInicio: value })}
                                >
                                    <SelectTrigger className="bg-white/10 border-white/20 text-gray-800">
                                        <SelectValue placeholder="Selecciona horario" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {HORARIOS.map((hora) => (
                                            <SelectItem key={hora} value={hora}>
                                                {hora} - {calcularHoraFin(hora)} (90 min)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fechaInicio" className="text-gray-600">
                                    Fecha de inicio *
                                </Label>
                                <Input
                                    id="fechaInicio"
                                    type="date"
                                    value={formData.fechaInicio}
                                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                                    min={format(new Date(), 'yyyy-MM-dd')}
                                    className="bg-white/10 border-white/20 text-gray-800"
                                />
                                <p className="text-xs text-gray-400">
                                    Debe ser un {formData.diaSemana ? getDiaNombre(parseInt(formData.diaSemana)) : 'día de la semana seleccionado'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="tieneFinalizacion"
                                        checked={formData.tieneFinalizacion}
                                        onChange={(e) => setFormData({ ...formData, tieneFinalizacion: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <Label htmlFor="tieneFinalizacion" className="text-gray-600 cursor-pointer">
                                        Establecer fecha de finalización
                                    </Label>
                                </div>
                                {formData.tieneFinalizacion && (
                                    <Input
                                        type="date"
                                        value={formData.fechaFin}
                                        onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                                        min={formData.fechaInicio}
                                        className="bg-white/10 border-white/20 text-gray-800"
                                    />
                                )}
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
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                >
                                    Crear Reserva Recurrente
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Dialog de confirmación */}
                <AlertDialog open={!!reservaToDelete} onOpenChange={() => setReservaToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Cancelar reserva recurrente?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción cancelará la reserva recurrente. Las reservas individuales ya creadas no se cancelarán automáticamente.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>No, mantener</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                                Sí, cancelar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Layout>
        </>
    );
};

export default ReservasRecurrentes;