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

const Reservas = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedCancha, setSelectedCancha] = useState('');
    const [selectedHorario, setSelectedHorario] = useState('');
    const [canchas, setCanchas] = useState([]);
    const [horarios, setHorarios] = useState([]);
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        // TODO: Cargar canchas desde tu backend
        setCanchas([
            { idCancha: 1, numero: '1', tipo: 'indoor' },
            { idCancha: 2, numero: '2', tipo: 'outdoor' },
            { idCancha: 3, numero: '3', tipo: 'indoor' }
        ]);
    }, []);

    useEffect(() => {
        if (selectedDate && selectedCancha) {
            // TODO: Cargar horarios disponibles desde tu backend
            const mockHorarios = [];
            for (let hour = 8; hour <= 22; hour += 1.5) {
                const wholeHour = Math.floor(hour);
                const minutes = (hour % 1) * 60;
                const startTime = setMinutes(setHours(selectedDate, wholeHour), minutes);
                const endTime = new Date(startTime.getTime() + 90 * 60000);

                mockHorarios.push({
                    id: mockHorarios.length + 1,
                    horaInicio: format(startTime, 'HH:mm'),
                    horaFin: format(endTime, 'HH:mm'),
                    disponible: Math.random() > 0.3
                });
            }
            setHorarios(mockHorarios);
        }
    }, [selectedDate, selectedCancha]);

    const handleReserva = async () => {
        if (!selectedCancha || !selectedHorario) {
            toast({
                title: "Error",
                description: "Por favor selecciona una cancha y un horario",
                variant: "destructive",
            });
            return;
        }

        // TODO: Crear reserva en tu backend
        // const response = await fetch('YOUR_BACKEND_URL/reservas', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     idUsuario: user.idUsuario,
        //     idCancha: selectedCancha,
        //     fechaReserva: format(selectedDate, 'yyyy-MM-dd'),
        //     horario: selectedHorario
        //   })
        // });

        toast({
            title: "¡Reserva confirmada! 🎾",
            description: "Tu cancha ha sido reservada exitosamente",
        });

        setSelectedCancha('');
        setSelectedHorario('');
    };

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
                                            onClick={() => setSelectedDate(day)}
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
                                        {horarios.map((horario) => (
                                            <button
                                                key={horario.id}
                                                onClick={() => horario.disponible && setSelectedHorario(horario.id)}
                                                disabled={!horario.disponible}
                                                className={`p-4 rounded-lg border transition-all ${selectedHorario === horario.id
                                                        ? 'bg-emerald-500 border-emerald-400 text-white'
                                                        : horario.disponible
                                                            ? 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                                                            : 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed opacity-50'
                                                    }`}
                                            >
                                                <p className="font-semibold">{horario.horaInicio}</p>
                                                <p className="text-xs mt-1">a {horario.horaFin}</p>
                                                {!horario.disponible && (
                                                    <p className="text-xs mt-2 text-red-400">No disponible</p>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            <div className="pt-4">
                                <Button
                                    onClick={handleReserva}
                                    disabled={!selectedCancha || !selectedHorario}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 text-lg"
                                >
                                    <Calendar className="w-5 h-5 mr-2" />
                                    Confirmar Reserva
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