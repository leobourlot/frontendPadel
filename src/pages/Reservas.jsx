import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../components/ui/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { canchasService, reservasService } from '../services/api.service';
import { useNavigate } from 'react-router-dom'; // agregar si no está

const Reservas = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedCancha, setSelectedCancha] = useState('');
    const [selectedHorario, setSelectedHorario] = useState(null);
    const [canchas, setCanchas] = useState([]);
    const [horarios, setHorarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    // Cargar canchas desde el backend
    useEffect(() => {
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

        loadCanchas();
    }, []);

    // Cargar horarios disponibles cuando se selecciona cancha y fecha
    useEffect(() => {
        if (selectedDate && selectedCancha) {
            loadHorariosDisponibles();
        }
    }, [selectedDate, selectedCancha]);

    // Helper: determina si una reserva existente pertenece al usuario logueado
    const getIdUsuarioDeReserva = (reserva) => {
        return reserva.idUsuario ?? reserva.usuario?.idUsuario ?? null;
    };

    const loadHorariosDisponibles = async () => {
        try {
            const fechaFormateada = format(selectedDate, 'yyyy-MM-dd');

            // Obtener reservas existentes para esa cancha y fecha
            const reservasExistentes = await reservasService.getByCancha(
                selectedCancha,
                fechaFormateada
            );

            const ahora = new Date();
            const horaActual = format(ahora, 'HH:mm');
            const esHoy = format(selectedDate, 'yyyy-MM-dd') === format(ahora, 'yyyy-MM-dd');

            // Generar horarios de 8:00 a 23:00 cada 90 minutos
            const horariosGenerados = [];
            for (let hour = 8; hour <= 22; hour += 1.5) {
                const wholeHour = Math.floor(hour);
                const minutes = (hour % 1) * 60;
                const startTime = setMinutes(setHours(selectedDate, wholeHour), minutes);
                const endTime = new Date(startTime.getTime() + 90 * 60000);

                const horaInicio = format(startTime, 'HH:mm');
                const horaFin = format(endTime, 'HH:mm');

                // ✅ Si es hoy, ocultar horarios pasados
                if (esHoy && horaInicio < horaActual) {
                    continue; // No agregar este horario
                }

                // Buscar si el horario está ocupado (y por quién)
                const reservaQueOcupa = reservasExistentes.find(reserva => {
                    const horaReservaNormalizada = reserva.horaInicio.includes(':')
                        ? reserva.horaInicio.substring(0, 5)
                        : reserva.horaInicio;

                    return horaReservaNormalizada === horaInicio && reserva.estado === 'confirmada';
                });

                const estaOcupado = !!reservaQueOcupa;
                const esMiReserva = !!(
                    estaOcupado &&
                    user &&
                    getIdUsuarioDeReserva(reservaQueOcupa) === user.idUsuario
                );

                horariosGenerados.push({
                    id: horariosGenerados.length + 1,
                    horaInicio,
                    horaFin,
                    disponible: !estaOcupado,
                    esMiReserva
                });
            }

            setHorarios(horariosGenerados);
        } catch (error) {
            console.error('Error cargando horarios:', error);
            // Si hay error, generar horarios por defecto sin verificar disponibilidad
            const horariosDefault = [];
            for (let hour = 8; hour <= 22; hour += 1.5) {
                const wholeHour = Math.floor(hour);
                const minutes = (hour % 1) * 60;
                const startTime = setMinutes(setHours(selectedDate, wholeHour), minutes);
                const endTime = new Date(startTime.getTime() + 90 * 60000);

                horariosDefault.push({
                    id: horariosDefault.length + 1,
                    horaInicio: format(startTime, 'HH:mm'),
                    horaFin: format(endTime, 'HH:mm'),
                    disponible: true,
                    esMiReserva: false
                });
            }
            setHorarios(horariosDefault);
        }
    };

    const handleReserva = async () => {
        if (!selectedCancha || !selectedHorario) {
            toast({
                title: "Error",
                description: "Por favor selecciona una cancha y un horario",
                variant: "destructive",
            });
            return;
        }

        // ✅ NUEVO: si no hay usuario logueado, guardar selección y pedir login
        if (!user) {
            const pendingSeleccion = {
                idCancha: parseInt(selectedCancha),
                fechaReserva: format(selectedDate, 'yyyy-MM-dd'),
                horaInicio: selectedHorario.horaInicio,
                horaFin: selectedHorario.horaFin,
            };
            sessionStorage.setItem('pendingSeleccion', JSON.stringify(pendingSeleccion));

            toast({
                title: "Iniciá sesión para reservar",
                description: "Necesitás una cuenta para confirmar tu turno",
            });
            navigate('/login', { state: { from: '/reservas' } });
            return;
        }

        setLoading(true);
        try {
            const reservaData = {
                idCancha: parseInt(selectedCancha),
                fechaReserva: format(selectedDate, 'yyyy-MM-dd'),
                horaInicio: selectedHorario.horaInicio,
                horaFin: selectedHorario.horaFin
            };

            await reservasService.create(reservaData);

            toast({
                title: "¡Reserva confirmada! 🎾",
                description: "Tu cancha ha sido reservada exitosamente",
                className: 'fixed top-1/2 left-1/2 z-[101] w-full max-w-[420px] h-[200px] bg-zinc-800 -translate-x-1/2 -translate-y-1/2 rounded-lg p-4',

            });

            // Limpiar selección y recargar horarios
            setSelectedHorario(null);
            await loadHorariosDisponibles();
        } catch (error) {
            console.error('Error creando reserva:', error);
            toast({
                title: "Error",
                description: error.message || "No se pudo crear la reserva",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const restaurarSeleccion = async () => {
            const pendingRaw = sessionStorage.getItem('pendingSeleccion');
            if (!pendingRaw || !user) return;

            const pending = JSON.parse(pendingRaw);
            sessionStorage.removeItem('pendingSeleccion');

            const fechaReserva = pending.fechaReserva || pending.fecha;
            if (!fechaReserva) {
                console.error('No se encontró la fecha en pendingSeleccion:', pending);
                return;
            }

            const fechaRestaurada = new Date(`${fechaReserva}T00:00:00`);
            if (Number.isNaN(fechaRestaurada.getTime())) {
                console.error('Fecha inválida en pendingSeleccion:', pending);
                return;
            }

            setSelectedDate(fechaRestaurada);
            setSelectedCancha(String(pending.idCancha));

            // Cargar horarios para esa fecha/cancha y, si el horario elegido sigue disponible, preseleccionarlo
            try {
                const fechaFormateada = format(fechaRestaurada, 'yyyy-MM-dd');
                const reservasExistentes = await reservasService.getByCancha(pending.idCancha, fechaFormateada);

                const ahora = new Date();
                const horaActual = format(ahora, 'HH:mm');
                const esHoy = fechaFormateada === format(ahora, 'yyyy-MM-dd');

                const horariosGenerados = [];
                for (let hour = 8; hour <= 22; hour += 1.5) {
                    const wholeHour = Math.floor(hour);
                    const minutes = (hour % 1) * 60;
                    const startTime = setMinutes(setHours(fechaRestaurada, wholeHour), minutes);
                    const endTime = new Date(startTime.getTime() + 90 * 60000);
                    const horaInicio = format(startTime, 'HH:mm');
                    const horaFin = format(endTime, 'HH:mm');

                    if (esHoy && horaInicio < horaActual) continue;

                    const reservaQueOcupa = reservasExistentes.find(reserva => {
                        const horaReservaNormalizada = reserva.horaInicio.includes(':')
                            ? reserva.horaInicio.substring(0, 5)
                            : reserva.horaInicio;
                        return horaReservaNormalizada === horaInicio && reserva.estado === 'confirmada';
                    });

                    const estaOcupado = !!reservaQueOcupa;
                    const esMiReserva = !!(
                        estaOcupado &&
                        user &&
                        getIdUsuarioDeReserva(reservaQueOcupa) === user.idUsuario
                    );

                    horariosGenerados.push({
                        id: horariosGenerados.length + 1,
                        horaInicio,
                        horaFin,
                        disponible: !estaOcupado,
                        esMiReserva
                    });
                }

                setHorarios(horariosGenerados);

                // Preseleccionar el horario elegido antes, solo si sigue disponible
                const horarioPrevio = horariosGenerados.find(h => h.horaInicio === pending.horaInicio);
                if (horarioPrevio && horarioPrevio.disponible) {
                    setSelectedHorario(horarioPrevio);
                    toast({
                        title: "Volviste a tu selección 👍",
                        description: "Confirmá la reserva cuando quieras",
                    });
                } else {
                    toast({
                        title: "Ese horario ya no está disponible",
                        description: "Elegí otro horario para continuar",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                console.error('Error restaurando selección:', error);
            }
        };

        restaurarSeleccion();
    }, [user]);

    const nextDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

    return (
        <>
            <Helmet>
                <title>Nueva Reserva - Club de Pádel</title>
                <meta name="description" content="Reserva tu cancha de pádel" />
            </Helmet>

            <Layout>
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-3xl font-bold text-white mb-2">Nueva Reserva</h1>
                        <p className="text-gray-300">Selecciona tu cancha y horario preferido</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                    >
                        <div className="space-y-6">
                            <div>
                                <Label className="text-white mb-3 block">Selecciona el día</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                    {nextDays.map((day) => (
                                        <button
                                            key={day.toISOString()}
                                            onClick={() => {
                                                setSelectedDate(day);
                                                setSelectedHorario(null);
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

                            <div>
                                <Label htmlFor="cancha" className="text-white mb-3 block">
                                    <MapPin className="w-4 h-4 inline mr-2" />
                                    Cancha
                                </Label>
                                <Select value={selectedCancha} onValueChange={(value) => {
                                    setSelectedCancha(value);
                                    setSelectedHorario(null);
                                }}>
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

                            {selectedCancha && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                >
                                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                        <Label className="text-white block">
                                            <Clock className="w-4 h-4 inline mr-2" />
                                            Horarios Disponibles (90 minutos)
                                        </Label>

                                        {/* Referencia de colores */}
                                        <div className="flex items-center gap-4 text-xs text-gray-300">
                                            <span className="flex items-center gap-1">
                                                <span className="w-3 h-3 rounded-sm bg-white/10 border border-white/20 inline-block" />
                                                Disponible
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="w-3 h-3 rounded-sm bg-blue-500/30 border border-blue-400 inline-block" />
                                                Tu turno
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="w-3 h-3 rounded-sm bg-gray-800 border border-gray-600 inline-block" />
                                                Ocupado
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {horarios.map((horario) => {
                                            const isSelected = selectedHorario?.id === horario.id;
                                            const isAvailable = horario.disponible;
                                            const esMiReserva = horario.esMiReserva;

                                            return (
                                                <button
                                                    key={horario.id}
                                                    onClick={() => isAvailable && setSelectedHorario(horario)}
                                                    disabled={!isAvailable}
                                                    className={`p-4 rounded-lg border transition-all ${isSelected
                                                        ? 'bg-emerald-500 border-emerald-400 text-white'
                                                        : esMiReserva
                                                            ? 'bg-blue-500/20 border-blue-400 text-blue-200 cursor-not-allowed'
                                                            : isAvailable
                                                                ? 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                                                                : 'bg-gray-800 border-gray-600 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                >
                                                    <p className="font-semibold">{horario.horaInicio}</p>
                                                    <p className="text-xs mt-1">a {horario.horaFin}</p>
                                                    {esMiReserva ? (
                                                        <p className="text-xs mt-2 text-blue-300 font-semibold">Tu turno</p>
                                                    ) : !isAvailable && (
                                                        <p className="text-xs mt-2 text-red-400 font-semibold">No disponible</p>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            <div className="pt-4">
                                <Button
                                    onClick={handleReserva}
                                    disabled={!selectedCancha || !selectedHorario || loading}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 text-lg"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Procesando...
                                        </div>
                                    ) : (
                                        <>
                                            <Calendar className="w-5 h-5 mr-2" />
                                            Confirmar Reserva
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </Layout>
        </>
    );
};

export default Reservas;