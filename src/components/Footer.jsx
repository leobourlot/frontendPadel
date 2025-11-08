import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Mail, Phone } from 'lucide-react';

const Footer = () => {
    return (
        <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 bg-white/10 backdrop-blur-lg rounded-t-2xl border-t border-white/20 text-white"
        >
            <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                {/* Columna 1 */}
                <div>
                    <h3 className="text-2xl font-bold text-emerald-400 mb-3">Club de Pádel</h3>
                    <p className="text-sm text-gray-300">
                        Disfrutá de las mejores canchas y una comunidad apasionada por el pádel.
                    </p>
                </div>

                {/* Columna 2 */}
                <div>
                    <h4 className="text-lg font-semibold text-emerald-400 mb-3">Contacto</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex justify-center md:justify-start items-center gap-2">
                            <Mail className="w-4 h-4 text-emerald-400" /> contacto@clubpadel.com
                        </li>
                        <li className="flex justify-center md:justify-start items-center gap-2">
                            <Phone className="w-4 h-4 text-emerald-400" /> +54 9 11 5555 5555
                        </li>
                    </ul>
                </div>

                {/* Columna 3 */}
                <div>
                    <h4 className="text-lg font-semibold text-emerald-400 mb-3">Seguinos</h4>
                    <div className="flex justify-center md:justify-start gap-4">
                        <a href="#" className="hover:text-emerald-400 transition-colors">
                            <Facebook className="w-5 h-5" />
                        </a>
                        <a href="#" className="hover:text-emerald-400 transition-colors">
                            <Instagram className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10 mt-6 py-4 text-center text-sm text-gray-400">
                © {new Date().getFullYear()} Club de Pádel — Todos los derechos reservados.
            </div>
        </motion.footer>
    );
};

export default Footer;
