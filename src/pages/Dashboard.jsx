import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Trophy, User, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Array con TODAS tus imágenes
    const imagenesClub = [
        '/imagenesClub/padel.webp',
        '/imagenesClub/padel2.webp',
        '/imagenesClub/padel.webp',
        '/imagenesClub/padel2.webp',

    ];

    // Cantidad de imágenes a mostrar según el tamaño de pantalla
    // const imagesPerView = 2; // En desktop mostrar 2 a la vez
    const [imagesPerView, setImagesPerView] = useState(2);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1279) {
                setImagesPerView(1); // Móvil
            } else {
                setImagesPerView(2); // Desktop
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    // Calcular el total de páginas
    const totalPages = Math.ceil(imagenesClub.length / imagesPerView);

    // Navegar al siguiente grupo
    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % totalPages);
    };

    // Navegar al anterior grupo
    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
    };

    // Obtener las imágenes actuales a mostrar
    const getCurrentImages = () => {
        const start = currentIndex * imagesPerView;
        return imagenesClub.slice(start, start + imagesPerView);
    };

    return (
        <>
            <Helmet>
                <title>Dashboard - Club de Pádel</title>
                <meta name="description" content="Panel principal del club de pádel" />
            </Helmet>

            <Layout>
                <div className="space-y-8">
                    {/* Header de bienvenida */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">¡Hola, {user?.nombre}! 👋</h1>
                                <p className="text-emerald-100">Bienvenido a tu panel de control</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Carousel de imágenes del club */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6">Nuestras Instalaciones</h2>

                        <div className="relative">
                            {/* Contenedor del carousel */}
                            <div className="overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentIndex}
                                        initial={{ opacity: 0, x: 100 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ duration: 0.3 }}
                                        className="grid grid-cols-1 xl:grid-cols-2 gap-4"
                                    >
                                        {getCurrentImages().map((imagen, index) => (
                                            <div
                                                key={`imagen-${currentIndex}-${index}`}
                                                className="relative overflow-hidden rounded-lg aspect-video group"
                                            >
                                                <img
                                                    src={imagen}
                                                    alt={`Instalación del club ${currentIndex * imagesPerView + index + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            </div>
                                        ))}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Botones de navegación */}
                            <button
                                onClick={prevSlide}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/20 hover:bg-white/30 backdrop-blur-lg p-3 rounded-full transition-all"
                                aria-label="Anterior"
                            >
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/20 hover:bg-white/30 backdrop-blur-lg p-3 rounded-full transition-all"
                                aria-label="Siguiente"
                            >
                                <ChevronRight className="w-6 h-6 text-white" />
                            </button>

                            {/* Indicadores de página */}
                            <div className="flex justify-center gap-2 mt-6">
                                {Array.from({ length: totalPages }).map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`h-2 rounded-full transition-all ${index === currentIndex
                                            ? 'w-8 bg-emerald-500'
                                            : 'w-2 bg-white/30 hover:bg-white/50'
                                            }`}
                                        aria-label={`Ir a página ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Acciones rápidas */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6">Acciones Rápidas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button
                                onClick={() => navigate('/reservas')}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white h-auto py-6 text-lg"
                            >
                                <Calendar className="w-5 h-5 mr-2" />
                                Nueva Reserva
                            </Button>
                            <Button
                                onClick={() => navigate('/mis-reservas')}
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10 h-auto py-6 text-lg"
                            >
                                <Clock className="w-5 h-5 mr-2" />
                                Mis Reservas
                            </Button>
                        </div>
                    </motion.div>


                </div>
            </Layout>
        </>
    );
};

export default Dashboard;