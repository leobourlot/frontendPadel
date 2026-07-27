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

    const loadHorariosDisponibles = async () => {
        try {
            const fechaFormateada = format(selectedDate, 'yyyy-MM-dd');

            // Obtener reservas existentes para esa cancha y fecha
            const reservasExistentes = await reservasService.getByCancha(
                selectedCancha,
                fechaFormateada
            );

            console.log('📅 Reservas existentes:', reservasExistentes); // ← AGREGAR

            const ahora = new Date();
            const horaActual = format(ahora, 'HH:mm');
            const esHoy = format(selectedDate, 'yyyy-MM-dd') === format(ahora, 'yyyy-MM-dd');

            console.log('🕐 Hora actual:', horaActual);
            console.log('📆 ¿Es hoy?', esHoy);

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
                    console.log(`⏰ ${horaInicio}: ⏭️ PASADO - Omitiendo`);
                    continue; // No agregar este horario
                }

                // Verificar si el horario está ocupado
                const estaOcupado = reservasExistentes.some(reserva => {
                    const horaReservaNormalizada = reserva.horaInicio.includes(':')
                        ? reserva.horaInicio.substring(0, 5)
                        : reserva.horaInicio;

                    const match = horaReservaNormalizada === horaInicio && reserva.estado === 'confirmada';

                    if (match) {
                        console.log('✅ MATCH encontrado:', horaInicio);
                    }

                    return match;
                });

                console.log(`⏰ ${horaInicio}: ${estaOcupado ? '❌ OCUPADO' : '✅ DISPONIBLE'}`);

                horariosGenerados.push({
                    id: horariosGenerados.length + 1,
                    horaInicio,
                    horaFin,
                    disponible: !estaOcupado
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
                    disponible: true
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
            const pendingReserva = {
                idCancha: selectedCancha,
                fechaReserva: format(selectedDate, 'yyyy-MM-dd'),
                horaInicio: selectedHorario.horaInicio,
                horaFin: selectedHorario.horaFin,
            };
            sessionStorage.setItem('pendingReserva', JSON.stringify(pendingReserva));

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
        const intentarCompletarPendiente = async () => {
            const pendingRaw = sessionStorage.getItem('pendingReserva');
            if (!pendingRaw || !user) return;

            const pending = JSON.parse(pendingRaw);
            sessionStorage.removeItem('pendingReserva');

            try {
                await reservasService.create(pending);
                toast({
                    title: "¡Reserva confirmada! 🎾",
                    description: "Tu cancha ha sido reservada exitosamente",
                });
                setSelectedCancha(pending.idCancha.toString());
                await loadHorariosDisponibles();
            } catch (error) {
                toast({
                    title: "No se pudo completar la reserva",
                    description: "El horario ya no está disponible, elegí otro",
                    variant: "destructive",
                });
            }
        };

        intentarCompletarPendiente();
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
                                    <Label className="text-white mb-3 block">
                                        <Clock className="w-4 h-4 inline mr-2" />
                                        Horarios Disponibles (90 minutos)
                                    </Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {horarios.map((horario) => {
                                            const isSelected = selectedHorario?.id === horario.id;
                                            const isAvailable = horario.disponible;

                                            return (
                                                <button
                                                    key={horario.id}
                                                    onClick={() => isAvailable && setSelectedHorario(horario)}
                                                    disabled={!isAvailable}
                                                    className={`p-4 rounded-lg border transition-all ${isSelected
                                                        ? 'bg-emerald-500 border-emerald-400 text-white'
                                                        : isAvailable
                                                            ? 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                                                            : 'bg-gray-800 border-gray-600 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                >
                                                    <p className="font-semibold">{horario.horaInicio}</p>
                                                    <p className="text-xs mt-1">a {horario.horaFin}</p>
                                                    {!isAvailable && (
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