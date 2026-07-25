import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Mail, Phone } from 'lucide-react';

const Vencido = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-10 border border-white/20 max-w-md w-full text-center"
            >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-3">
                    Período de prueba vencido
                </h1>
                <p className="text-gray-300 mb-8">
                    Tu mes de prueba gratuito ha finalizado. Para seguir usando el sistema de reservas, contactá a tu proveedor.
                </p>

                <div className="space-y-3 text-sm text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-400" />
                        <a href="mailto:info@bourderweb.com.ar" className="hover:text-white transition-colors">
                            info@bourderweb.com.ar
                        </a>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-400" />
                        <a href="tel:+5493456XXXXXX" className="hover:text-white transition-colors">
                            +54 9 3456 XXXXXX
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Vencido;