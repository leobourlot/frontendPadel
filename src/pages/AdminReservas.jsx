import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Trash2, User, Search } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../components/ui/use-toast';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { canchasService, reservasService } from '../services/api.service';
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

const AdminReservas = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedCancha, setSelectedCancha] = useState('');
    const [canchas, setCanchas] = useState([]);
    const [reservas, setReservas] = useState([]);
    const [reservaToDelete, setReservaToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        loadCanchas();
    }, []);

    useEffect(() => {
        if (selectedDate && selectedCancha) {
            loadReservas();
        }
    }, [selectedDate, selectedCancha]);

    const loadCanchas = async () => {
        try {
            const data = await canchasService.getAll();
            setCanchas(data);
        } catch (error) {
            console.error('Error cargando canchas:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las canchas",
                variant: "destructive",
            });
        }
    };

    const loadReservas = async () => {
        try {
            setLoading(true);
            const fechaFormateada = format(selectedDate, 'yyyy-MM-dd');
            const data = await reservasService.getByCancha(selectedCancha, fechaFormateada);

            console.log('📦 Datos RAW del backend:', JSON.stringify(data, null, 2));
            console.log('📊 Cantidad de reservas:', data.length);

            // Mostrar estructura de la primera reserva si existe
            if (data.length > 0) {
                console.log('🔍 Primera reserva completa:', data[0]);
                console.log('👤 Usuario de primera reserva:', data[0].usuario);
                console.log('🆔 ID Usuario:', data[0].idUsuario);
            }

            // Filtrar solo las confirmadas (sin filtrar por usuario todavía)
            const reservasConfirmadas = data.filter(r => r.estado === 'confirmada');

            console.log('✅ Reservas confirmadas (sin filtrar usuario):', reservasConfirmadas.length);
            console.log('📋 Detalle:', reservasConfirmadas);

            setReservas(reservasConfirmadas);
        } catch (error) {
            console.error('❌ Error cargando reservas:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las reservas",
                variant: "destructive",
            });
            setReservas([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = async () => {
        if (!reservaToDelete) return;

        try {
            await reservasService.delete(reservaToDelete.idReserva);

            toast({
                title: "Reserva cancelada",
                description: `Reserva de ${reservaToDelete.usuario?.nombre || 'usuario'} ${reservaToDelete.usuario?.apellido || ''} cancelada exitosamente`,
            });

            // Recargar reservas
            await loadReservas();
            setReservaToDelete(null);
        } catch (error) {
            console.error('Error cancelando reserva:', error);
            toast({
                title: "Error",
                description: "No se pudo cancelar la reserva",
                variant: "destructive",
            });
        }
    };

    const formatearFecha = (fechaString) => {
        const fecha = new Date(fechaString + 'T00:00:00');
        return fecha.toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const nextDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

    // Filtrar reservas por búsqueda
    const reservasFiltradas = reservas.filter(r => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        const nombre = r.usuario?.nombre?.toLowerCase() || '';
        const apellido = r.usuario?.apellido?.toLowerCase() || '';
        const dni = r.usuario?.dni?.toLowerCase() || '';

        return nombre.includes(search) || apellido.includes(search) || dni.includes(search);
    });

    return (
        <>
            <Helmet>
                <title>Gestionar Reservas - Club de Pádel</title>
                <meta name="description" content="Administra y cancela reservas de usuarios" />
            </Helmet>

            <Layout>
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-3xl font-bold text-white mb-2">Gestionar Reservas</h1>
                        <p className="text-gray-300">Visualiza y cancela reservas de cualquier usuario</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                    >
                        <div className="space-y-6">
                            {/* Selector de día */}
                            <div>
                                <Label className="text-white mb-3 block">Selecciona el día</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                    {nextDays.map((day) => (
                                        <button
                                            key={day.toISOString()}
                                            onClick={() => {
                                                setSelectedDate(day);
                                            }}
                                            className={`p-4 rounded-lg border transition-all ${format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                                                    ? 'bg-emerald-500 border-emerald-400 text-white'
                                                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                                                }`}
                                        >
                                            <p className="text-xs font-medium">
                                                {format(day, 'EEE', { locale: es })}
                                            </p>
                                            <p className="text-2xl font-bold mt-1">
                                                {format(day, 'd')}
                                            </p>
                                            <p className="text-xs mt-1">
                                                {format(day, 'MMM', { locale: es })}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Selector de cancha */}
                            <div>
                                <Label htmlFor="cancha" className="text-white mb-3 block">
                                    <MapPin className="w-4 h-4 inline mr-2" />
                                    Cancha
                                </Label>
                                <Select value={selectedCancha} onValueChange={setSelectedCancha}>
                                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                        <SelectValue placeholder="Selecciona una cancha" />
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

                            {/* Lista de reservas */}
                            {selectedCancha && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <Label className="text-white">
                                            <Calendar className="w-4 h-4 inline mr-2" />
                                            Reservas del día ({reservas.length})
                                        </Label>

                                        {/* Buscador */}
                                        {reservas.length > 0 && (
                                            <div className="relative w-64">
                                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <Input
                                                    type="text"
                                                    placeholder="Buscar por nombre o DNI..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {loading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                                        </div>
                                    ) : reservasFiltradas.length === 0 ? (
                                        <div className="bg-white/5 rounded-lg p-12 text-center">
                                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-300">
                                                {searchTerm
                                                    ? 'No se encontraron reservas con ese criterio'
                                                    : 'No hay reservas para este día y cancha'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {reservasFiltradas.map((reserva, index) => (
                                                <motion.div
                                                    key={reserva.idReserva}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                        <div className="flex items-center gap-4 flex-1">
                                                            <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                                                                <User className="w-6 h-6 text-white" />
                                                            </div>

                                                            <div className="flex-1">
                                                                <h3 className="text-lg font-bold text-white">
                                                                    {reserva.usuario?.nombre
                                                                        ? `${reserva.usuario.nombre} ${reserva.usuario.apellido || ''}`
                                                                        : `Usuario ID: ${reserva.idUsuario}`
                                                                    }
                                                                </h3>
                                                                <div className="flex flex-wrap gap-3 text-sm text-gray-300 mt-1">
                                                                    {reserva.usuario?.dni ? (
                                                                        <span className="flex items-center gap-1">
                                                                            <User className="w-3 h-3" />
                                                                            DNI: {reserva.usuario.dni}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="flex items-center gap-1 text-yellow-400">
                                                                            <User className="w-3 h-3" />
                                                                            ID: {reserva.idUsuario}
                                                                        </span>
                                                                    )}
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        {reserva.horaInicio} - {reserva.horaFin}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => setReservaToDelete(reserva)}
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
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Dialog de confirmación */}
                <AlertDialog open={!!reservaToDelete} onOpenChange={() => setReservaToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>
                            <AlertDialogDescription>
                                {reservaToDelete && (
                                    <>
                                        Vas a cancelar la reserva de{' '}
                                        <span className="font-semibold text-white">
                                            {reservaToDelete.usuario?.nombre || 'Usuario'} {reservaToDelete.usuario?.apellido || ''}
                                        </span>
                                        {' '}para el{' '}
                                        <span className="font-semibold text-white">
                                            {formatearFecha(reservaToDelete.fechaReserva)}
                                        </span>
                                        {' '}de{' '}
                                        <span className="font-semibold text-white">
                                            {reservaToDelete.horaInicio} a {reservaToDelete.horaFin}
                                        </span>
                                        . Esta acción no se puede deshacer.
                                    </>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>No, mantener</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCancelar} className="bg-red-500 hover:bg-red-600">
                                Sí, cancelar reserva
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Layout>
        </>
    );
};

export default AdminReservas;