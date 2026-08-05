import React, { useState } from 'react';
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Calendar, Clock, MapPin, User, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { pagosService, reservasService } from '../services/api.service';
import { useToast } from './ui/use-toast';

const PagoReservaModal = ({ open, onOpenChange, reservaData, cancha, club, user, onConfirmada }) => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    if (!reservaData) return null;

    const usaMercadoPago = !!club?.mercadopagoHabilitado && !!club?.precioReserva;

    const handlePagarMercadoPago = async () => {
        setLoading(true);
        try {
            const { initPoint } = await pagosService.crearPreferencia(reservaData);
            window.location.href = initPoint;
        } catch (error) {
            toast({ title: "Error", description: error.message || "No se pudo iniciar el pago", variant: "destructive" });
            setLoading(false);
        }
    };

    const handleConfirmarSinPago = async () => {
        setLoading(true);
        try {
            await reservasService.create(reservaData);
            toast({
                title: "¡Reserva confirmada! 🎾",
                description: "El club cobra la seña en el lugar al momento de jugar.",
            });
            onOpenChange(false);
            onConfirmada?.();
        } catch (error) {
            toast({ title: "Error", description: error.message || "No se pudo crear la reserva", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-gray-900 text-white border-white/20">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Confirmar Reserva</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Revisá los datos antes de confirmar
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span>{club?.nombre}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span>Cancha {cancha?.numero} - {cancha?.tipo}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        <span>{format(new Date(`${reservaData.fechaReserva}T00:00:00`), "EEEE d 'de' MMMM", { locale: es })}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        <span>{reservaData.horaInicio} - {reservaData.horaFin}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <User className="w-4 h-4 text-emerald-400" />
                        <span>{user?.nombre} {user?.apellido}</span>
                    </div>
                    {usaMercadoPago && (
                        <div className="flex items-center gap-3 text-sm font-semibold text-emerald-400">
                            <CreditCard className="w-4 h-4" />
                            <span>Seña a pagar: ${Number(club.precioReserva).toLocaleString('es-AR')}</span>
                        </div>
                    )}
                </div>

                {!usaMercadoPago && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-200">
                        Este club no cobra online. El pago de la reserva se realiza presencialmente al momento de jugar.
                    </div>
                )}

                <DialogFooter>
                    {usaMercadoPago ? (
                        <Button onClick={handlePagarMercadoPago} disabled={loading}
                            className="w-full bg-[#009ee3] hover:bg-[#0086c3] text-white">
                            {loading ? 'Redirigiendo...' : 'Pagar con Mercado Pago'}
                        </Button>
                    ) : (
                        <Button onClick={handleConfirmarSinPago} disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                            {loading ? 'Confirmando...' : 'Confirmar Reserva'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PagoReservaModal;