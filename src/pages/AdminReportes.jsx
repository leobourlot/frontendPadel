import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
    BarChart3, TrendingUp, DollarSign, Clock, XCircle, Calendar, RefreshCw,
} from 'lucide-react';
import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { format, subDays, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../components/ui/use-toast';
import { reportesService } from '../services/api.service';

const COLORES = ['#10b981', '#14b8a6', '#f59e0b', '#6366f1', '#ec4899', '#ef4444', '#3b82f6'];

const hoyStr = () => format(new Date(), 'yyyy-MM-dd');

const PRESETS = [
    { label: '7 días', desde: () => format(subDays(new Date(), 6), 'yyyy-MM-dd') },
    { label: '30 días', desde: () => format(subDays(new Date(), 29), 'yyyy-MM-dd') },
    { label: '90 días', desde: () => format(subDays(new Date(), 89), 'yyyy-MM-dd') },
    { label: 'Este mes', desde: () => format(startOfMonth(new Date()), 'yyyy-MM-dd') },
];

const formatearMoneda = (valor) =>
    '$' + Math.round(Number(valor) || 0).toLocaleString('es-AR');

const formatearFechaCorta = (fechaStr) => {
    try {
        return format(new Date(`${fechaStr}T00:00:00`), 'd MMM', { locale: es });
    } catch {
        return fechaStr;
    }
};

const CardVidrio = ({ children, className = '' }) => (
    <div className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 ${className}`}>
        {children}
    </div>
);

const KpiCard = ({ icon: Icon, label, value, sub, color = 'text-emerald-400' }) => (
    <CardVidrio>
        <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-xl bg-white/10 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-300">{label}</span>
        </div>
        <div className="text-3xl font-bold text-white">{value}</div>
        {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </CardVidrio>
);

const AdminReportes = () => {
    const [desde, setDesde] = useState(format(subDays(new Date(), 29), 'yyyy-MM-dd'));
    const [hasta, setHasta] = useState(hoyStr());
    const [loading, setLoading] = useState(false);
    const [resumen, setResumen] = useState(null);
    const [ocupacion, setOcupacion] = useState(null);
    const [ingresos, setIngresos] = useState(null);
    const [horariosPico, setHorariosPico] = useState(null);
    const [cancelaciones, setCancelaciones] = useState(null);
    const { toast } = useToast();

    const cargarTodo = useCallback(async () => {
        setLoading(true);
        try {
            const [r1, r2, r3, r4, r5] = await Promise.all([
                reportesService.getResumen(desde, hasta),
                reportesService.getOcupacion(desde, hasta),
                reportesService.getIngresos(desde, hasta),
                reportesService.getHorariosPico(desde, hasta),
                reportesService.getCancelaciones(desde, hasta),
            ]);
            setResumen(r1);
            setOcupacion(r2);
            setIngresos(r3);
            setHorariosPico(r4);
            setCancelaciones(r5);
        } catch (error) {
            console.error('Error cargando reportes:', error);
            toast({
                title: 'Error',
                description: 'No se pudieron cargar los reportes',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [desde, hasta, toast]);

    useEffect(() => {
        cargarTodo();
    }, [cargarTodo]);

    const aplicarPreset = (preset) => {
        setDesde(preset.desde());
        setHasta(hoyStr());
    };

    return (
        <>
            <Helmet>
                <title>Reportes - Admin</title>
                <meta name="description" content="Ocupación, ingresos, horarios pico y cancelaciones del club" />
            </Helmet>
            <Layout>
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Reportes</h1>
                                <p className="text-sm text-gray-300">Ocupación, facturación y horarios pico del club</p>
                            </div>
                        </div>
                        <Button
                            onClick={cargarTodo}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 w-fit"
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </Button>
                    </motion.div>

                    {/* Filtros de fecha */}
                    <CardVidrio>
                        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                            <div className="flex flex-wrap gap-2">
                                {PRESETS.map((preset) => (
                                    <Button
                                        key={preset.label}
                                        size="sm"
                                        variant="outline"
                                        className="border-white/20 text-white hover:bg-white/10"
                                        onClick={() => aplicarPreset(preset)}
                                    >
                                        {preset.label}
                                    </Button>
                                ))}
                            </div>
                            <div className="flex items-end gap-3">
                                <div>
                                    <Label className="text-gray-300 text-xs">Desde</Label>
                                    <Input
                                        type="date"
                                        value={desde}
                                        max={hasta}
                                        onChange={(e) => setDesde(e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-300 text-xs">Hasta</Label>
                                    <Input
                                        type="date"
                                        value={hasta}
                                        min={desde}
                                        max={hoyStr()}
                                        onChange={(e) => setHasta(e.target.value)}
                                        className="bg-white/10 border-white/20 text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardVidrio>

                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <KpiCard
                            icon={TrendingUp}
                            label="Ocupación promedio"
                            value={`${resumen?.ocupacionPromedio ?? 0}%`}
                            color="text-emerald-400"
                        />
                        <KpiCard
                            icon={DollarSign}
                            label="Ingresos totales"
                            value={formatearMoneda(resumen?.ingresosTotales)}
                            color="text-teal-400"
                        />
                        <KpiCard
                            icon={DollarSign}
                            label="Ticket promedio"
                            value={formatearMoneda(resumen?.ticketPromedio)}
                            color="text-amber-400"
                        />
                        <KpiCard
                            icon={Calendar}
                            label="Reservas"
                            value={resumen?.totalReservas ?? 0}
                            color="text-indigo-400"
                        />
                        <KpiCard
                            icon={XCircle}
                            label="Tasa cancelación"
                            value={`${resumen?.tasaCancelacion ?? 0}%`}
                            sub={cancelaciones ? `${cancelaciones.canceladas} de ${cancelaciones.totalCreadas}` : ''}
                            color="text-red-400"
                        />
                    </div>

                    {/* Ocupación por día + Ingresos por día */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <CardVidrio>
                            <h2 className="text-lg font-bold text-white mb-4">Ocupación por día</h2>
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={ocupacion?.ocupacionPorDia || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        dataKey="fecha"
                                        tickFormatter={formatearFechaCorta}
                                        stroke="rgba(255,255,255,0.5)"
                                        fontSize={12}
                                    />
                                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} unit="%" />
                                    <Tooltip
                                        labelFormatter={formatearFechaCorta}
                                        formatter={(value) => [`${value}%`, 'Ocupación']}
                                        contentStyle={{ background: '#0f2e26', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }}
                                    />
                                    <Line type="monotone" dataKey="ocupacionPct" stroke="#10b981" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardVidrio>

                        <CardVidrio>
                            <h2 className="text-lg font-bold text-white mb-4">Ingresos por día</h2>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={ingresos?.ingresosPorDia || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        dataKey="fecha"
                                        tickFormatter={formatearFechaCorta}
                                        stroke="rgba(255,255,255,0.5)"
                                        fontSize={12}
                                    />
                                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                                    <Tooltip
                                        labelFormatter={formatearFechaCorta}
                                        formatter={(value) => [formatearMoneda(value), 'Ingresos']}
                                        contentStyle={{ background: '#0f2e26', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }}
                                    />
                                    <Bar dataKey="total" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardVidrio>
                    </div>

                    {/* Horarios pico + Ocupación por cancha */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <CardVidrio>
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-amber-400" />
                                <h2 className="text-lg font-bold text-white">Horarios pico</h2>
                            </div>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={horariosPico?.porHorario || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="horaInicio" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} allowDecimals={false} />
                                    <Tooltip
                                        formatter={(value) => [value, 'Reservas']}
                                        contentStyle={{ background: '#0f2e26', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }}
                                    />
                                    <Bar dataKey="cantidad" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                            {horariosPico?.horarioMasPopular && (
                                <p className="text-sm text-gray-300 mt-2">
                                    Horario más solicitado:{' '}
                                    <span className="text-amber-400 font-semibold">
                                        {horariosPico.horarioMasPopular.horaInicio}
                                    </span>{' '}
                                    ({horariosPico.horarioMasPopular.cantidad} reservas)
                                </p>
                            )}
                        </CardVidrio>

                        <CardVidrio>
                            <h2 className="text-lg font-bold text-white mb-4">Ocupación por cancha</h2>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={ocupacion?.ocupacionPorCancha || []} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={12} unit="%" />
                                    <YAxis
                                        type="category"
                                        dataKey="numero"
                                        stroke="rgba(255,255,255,0.5)"
                                        fontSize={12}
                                        tickFormatter={(v) => `Cancha ${v}`}
                                        width={90}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`${value}%`, 'Ocupación']}
                                        labelFormatter={(v) => `Cancha ${v}`}
                                        contentStyle={{ background: '#0f2e26', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }}
                                    />
                                    <Bar dataKey="ocupacionPct" fill="#10b981" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardVidrio>
                    </div>

                    {/* Ingresos por cancha + método de pago */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <CardVidrio>
                            <h2 className="text-lg font-bold text-white mb-4">Ingresos por cancha</h2>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={ingresos?.ingresosPorCancha || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        dataKey="numero"
                                        stroke="rgba(255,255,255,0.5)"
                                        fontSize={12}
                                        tickFormatter={(v) => `Cancha ${v}`}
                                    />
                                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                                    <Tooltip
                                        formatter={(value) => [formatearMoneda(value), 'Ingresos']}
                                        labelFormatter={(v) => `Cancha ${v}`}
                                        contentStyle={{ background: '#0f2e26', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }}
                                    />
                                    <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardVidrio>

                        <CardVidrio>
                            <h2 className="text-lg font-bold text-white mb-4">Ingresos por método de pago</h2>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={ingresos?.ingresosPorMetodo || []}
                                        dataKey="total"
                                        nameKey="metodo"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        label={(entry) => `${entry.metodo}: ${formatearMoneda(entry.total)}`}
                                    >
                                        {(ingresos?.ingresosPorMetodo || []).map((_, index) => (
                                            <Cell key={index} fill={COLORES[index % COLORES.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => [formatearMoneda(value), 'Ingresos']}
                                        contentStyle={{ background: '#0f2e26', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }}
                                    />
                                    <Legend wrapperStyle={{ color: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardVidrio>
                    </div>

                    {/* Cancelaciones por día */}
                    <CardVidrio>
                        <h2 className="text-lg font-bold text-white mb-4">Cancelaciones por día</h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={cancelaciones?.canceladasPorDia || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="fecha"
                                    tickFormatter={formatearFechaCorta}
                                    stroke="rgba(255,255,255,0.5)"
                                    fontSize={12}
                                />
                                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} allowDecimals={false} />
                                <Tooltip
                                    labelFormatter={formatearFechaCorta}
                                    formatter={(value) => [value, 'Cancelaciones']}
                                    contentStyle={{ background: '#0f2e26', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }}
                                />
                                <Bar dataKey="cantidad" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardVidrio>
                </div>
            </Layout>
        </>
    );
};

export default AdminReportes;