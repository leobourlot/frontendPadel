import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';
import { pagosService } from '../services/api.service';

const CardVidrio = ({ children, className = '' }) => (
    <div className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 ${className}`}>
        {children}
    </div>
);

const AdminMercadoPago = () => {
    const [estado, setEstado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [conectando, setConectando] = useState(false);
    const [desconectando, setDesconectando] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const { toast } = useToast();

    const cargarEstado = useCallback(async () => {
        setLoading(true);
        try {
            const data = await pagosService.estadoMercadoPago();
            setEstado(data);
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo obtener el estado de Mercado Pago', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        cargarEstado();
    }, [cargarEstado]);

    // Maneja el regreso desde el callback (?mp=conectado / ?mp=error / ?mp=error_state)
    useEffect(() => {
        const mp = searchParams.get('mp');
        if (!mp) return;

        if (mp === 'conectado') {
            toast({ title: '¡Cuenta conectada! 🎉', description: 'Ya podés recibir pagos con Mercado Pago.' });
            cargarEstado();
        } else if (mp.startsWith('error')) {
            toast({ title: 'No se pudo conectar', description: 'Intentá de nuevo o contactá soporte.', variant: 'destructive' });
        }

        searchParams.delete('mp');
        setSearchParams(searchParams, { replace: true });
    }, [searchParams, setSearchParams, toast, cargarEstado]);

    const handleConectar = async () => {
        setConectando(true);
        try {
            const { url } = await pagosService.conectarMercadoPago();
            window.location.href = url; // redirige a Mercado Pago
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo iniciar la conexión con Mercado Pago', variant: 'destructive' });
            setConectando(false);
        }
    };

    const handleDesconectar = async () => {
        if (!window.confirm('¿Seguro que querés desconectar tu cuenta de Mercado Pago? Dejarás de recibir pagos online hasta reconectarla.')) return;
        setDesconectando(true);
        try {
            await pagosService.desconectarMercadoPago();
            toast({ title: 'Cuenta desconectada' });
            await cargarEstado();
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo desconectar la cuenta', variant: 'destructive' });
        } finally {
            setDesconectando(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Mercado Pago - Admin</title>
            </Helmet>
            <Layout>
                <div className="max-w-3xl mx-auto space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">Mercado Pago</h1>
                            <p className="text-sm text-gray-300">Conectá tu cuenta para cobrar las señas de las reservas</p>
                        </div>
                    </motion.div>

                    <CardVidrio>
                        {loading ? (
                            <div className="flex items-center gap-2 text-gray-300">
                                <RefreshCw className="w-4 h-4 animate-spin" /> Cargando estado...
                            </div>
                        ) : estado?.conectado ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-emerald-400">
                                    <CheckCircle2 className="w-6 h-6" />
                                    <span className="text-lg font-semibold">Cuenta conectada</span>
                                </div>
                                {estado.expiraEl && (
                                    <p className="text-sm text-gray-400">
                                        La conexión se renueva automáticamente antes del{' '}
                                        {new Date(estado.expiraEl).toLocaleDateString('es-AR')}.
                                    </p>
                                )}
                                <Button
                                    onClick={handleDesconectar}
                                    disabled={desconectando}
                                    variant="outline"
                                    className="border-red-400/40 text-red-300 hover:bg-red-500/10"
                                >
                                    {desconectando ? 'Desconectando...' : 'Desconectar cuenta'}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-amber-400">
                                    <XCircle className="w-6 h-6" />
                                    <span className="text-lg font-semibold">No conectada</span>
                                </div>
                                <p className="text-sm text-gray-300">
                                    Para cobrar la seña de las reservas online, conectá tu propia cuenta de Mercado Pago.
                                    No vas a tener que copiar ni compartir ningún código: te llevamos directamente a
                                    Mercado Pago para que autorices desde tu cuenta.
                                </p>
                                <Button
                                    onClick={handleConectar}
                                    disabled={conectando}
                                    className="bg-emerald-500 hover:bg-emerald-600"
                                >
                                    {conectando ? 'Redirigiendo...' : 'Conectar con Mercado Pago'}
                                </Button>
                            </div>
                        )}
                    </CardVidrio>
                </div>
            </Layout>
        </>
    );
};

export default AdminMercadoPago;