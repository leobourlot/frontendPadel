import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';
import { useAuth } from '../contexts/AuthContext';
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

const MisReservas = () => {
    const [reservas, setReservas] = useState([]);
    const [reservaToDelete, setReservaToDelete] = useState(null);
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        // TODO: Cargar reservas del usuario desde tu backend
        const mockReservas = [
            {
                idReserva: 1,
                cancha: { numero: '1', tipo: 'indoor' },
                fechaReserva: '2025-10-30',
                horario: { horaInicio: '10:00', horaFin: '11:30' },
                estado: 'confirmada'
            },
            {
                idReserva: 2,
                cancha: { numero: '2', tipo: 'outdoor' },
                fechaReserva: '2025-11-01',
                horario: { horaInicio: '18:00', horaFin: '19:30' },
                estado: 'confirmada'
            },
            {
                idReserva: 3,
                cancha: { numero: '1', tipo: 'indoor' },
                fechaReserva: '2025-11-03',
                horario: { horaInicio: '16:00', horaFin: '17:30' },
                estado: 'confirmada'
            }
        ];
        setReservas(mockReservas);
    }, [user]);

    const handleCancelar = async () => {
        if (!reservaToDelete) return;

        // TODO: Cancelar reserva en tu backend
        // await fetch(`YOUR_BACKEND_URL/reservas/${reservaToDelete}`, {
        //   method: 'DELETE'
        // });

        setReservas(reservas.filter(r => r.idReserva !== reservaToDelete));
        toast({
            title: "Reserva cancelada",
            description: "Tu reserva ha sido cancelada exitosamente",
        });
        setReservaToDelete(null);
    };

    return (
        <>
            <Helmet>
                <title>Mis Reservas - Club de Pádel</title>
                <meta name="description" content="Gestiona tus reservas de pádel" />
            </Helmet>

            <Layout>
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-3xl font-bold text-white mb-2">Mis Reservas</h1>
                        <p className="text-gray-300">Gestiona tus próximas reservas</p>
                    </motion.div>

                    {reservas.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center"
                        >
                            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No tienes reservas</h3>
                            <p className="text-gray-300">¡Reserva tu primera cancha ahora!</p>
                        </motion.div>
                    ) : (
                        <div className="grid gap-4">
                            {reservas.map((reserva, index) => (
                                <motion.div
                                    key={reserva.idReserva}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-emerald-500 w-12 h-12 rounded-lg flex items-center justify-center">
                                                    <MapPin className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">
                                                        Cancha {reserva.cancha.numero}
                                                    </h3>
                                                    <p className="text-gray-300 text-sm capitalize">
                                                        {reserva.cancha.tipo}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-sm">
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(reserva.fechaReserva).toLocaleDateString('es-AR', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{reserva.horario.horaInicio} - {reserva.horario.horaFin}</span>
                                                </div>
                                            </div>

                                            <div>
                                                <span className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full">
                                                    {reserva.estado}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="destructive"
                                            onClick={() => setReservaToDelete(reserva.idReserva)}
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

                <AlertDialog open={!!reservaToDelete} onOpenChange={() => setReservaToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. La reserva será cancelada permanentemente.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>No, mantener</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCancelar} className="bg-red-500 hover:bg-red-600">
                                Sí, cancelar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Layout>
        </>
    );
};

export default MisReservas;