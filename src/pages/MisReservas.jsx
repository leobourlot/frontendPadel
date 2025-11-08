import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { reservasService } from '../services/api.service';
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
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        loadReservas();
    }, [user]);

    const loadReservas = async () => {
        try {
            setLoading(true);
            const data = await reservasService.getMisReservas();
            // Filtrar solo las confirmadas y ordenar por fecha
            const reservasConfirmadas = data
                .filter(r => r.estado === 'confirmada')
                .sort((a, b) => {
                    const dateA = new Date(`${a.fechaReserva}T${a.horaInicio}`);
                    const dateB = new Date(`${b.fechaReserva}T${b.horaInicio}`);
                    return dateA - dateB;
                });
            setReservas(reservasConfirmadas);
        } catch (error) {
            console.error('Error cargando reservas:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las reservas",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = async () => {
        if (!reservaToDelete) return;

        try {
            await reservasService.delete(reservaToDelete);

            // Actualizar la lista local
            setReservas(reservas.filter(r => r.idReserva !== reservaToDelete));

            toast({
                title: "Reserva cancelada",
                description: "Tu reserva ha sido cancelada exitosamente",
            });
        } catch (error) {
            console.error('Error cancelando reserva:', error);
            toast({
                title: "Error",
                description: "No se pudo cancelar la reserva",
                variant: "destructive",
            });
        } finally {
            setReservaToDelete(null);
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
                                                    <span>{formatearFecha(reserva.fechaReserva)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{reserva.horaInicio} - {reserva.horaFin}</span>
                                                </div>
                                            </div>

                                            <div>
                                                <span className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full capitalize">
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