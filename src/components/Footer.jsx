import React from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from 'lucide-react';
import bourder from '/logoBourder.svg'

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white/10 backdrop-blur-lg border-t border-white/20 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                {/* Grid principal */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    {/* Columna 1: Información del Club */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Club de Pádel</h3>
                        
                        {/* Redes Sociales */}
                        <div className="flex gap-3">
                            <a 
                                href="https://facebook.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-white/10 hover:bg-emerald-500 p-2 rounded-lg transition-all"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-5 h-5 text-white" />
                            </a>
                            <a 
                                href="https://instagram.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-white/10 hover:bg-emerald-500 p-2 rounded-lg transition-all"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5 text-white" />
                            </a>
                            <a 
                                href="https://twitter.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-white/10 hover:bg-emerald-500 p-2 rounded-lg transition-all"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-5 h-5 text-white" />
                            </a>
                        </div>
                    </div>

                    {/* Columna 2: Contacto */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Contacto</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-gray-300 text-sm">
                                <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span>Dirección, Concordia, Entre Ríos</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-300 text-sm">
                                <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <a href="tel:+5493456123456" className="hover:text-white transition-colors">
                                    +54 9 1111 1111
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-gray-300 text-sm">
                                <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <a href="mailto:info@clubpadel.com" className="hover:text-white transition-colors">
                                    info@club.com
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Columna 3: Horarios */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Horarios</h3>
                        <ul className="space-y-2 text-gray-300 text-sm">
                            <li className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-400" />
                                <span className="font-semibold text-white">Lunes a Viernes:</span>
                            </li>
                            <li className="ml-6">8:00 - 23:00</li>
                            <li className="flex items-center gap-2 mt-2">
                                <Clock className="w-4 h-4 text-emerald-400" />
                                <span className="font-semibold text-white">Sábados y Domingos:</span>
                            </li>
                            <li className="ml-6">9:00 - 22:00</li>
                        </ul>
                    </div>

                    {/* Columna 4: Enlaces Rápidos
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Enlaces Rápidos</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="/dashboard" className="text-gray-300 hover:text-emerald-400 text-sm transition-colors">
                                    Dashboard
                                </a>
                            </li>
                            <li>
                                <a href="/reservas" className="text-gray-300 hover:text-emerald-400 text-sm transition-colors">
                                    Nueva Reserva
                                </a>
                            </li>
                            <li>
                                <a href="/mis-reservas" className="text-gray-300 hover:text-emerald-400 text-sm transition-colors">
                                    Mis Reservas
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-emerald-400 text-sm transition-colors">
                                    Términos y Condiciones
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-emerald-400 text-sm transition-colors">
                                    Política de Privacidad
                                </a>
                            </li>
                        </ul>
                    </div> */}
                </div>

                {/* Línea divisoria */}
                <div className="border-t border-white/20 pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-300 text-sm text-center md:text-left">
                            © {currentYear} Club de Pádel. Todos los derechos reservados.
                        </p>
                        <p className="text-gray-400 text-xl">
                            Diseñado por <img src= {bourder} alt='Logo Bourder Web' className='w-8 h-8 inline rounded-md'/> <a href='https://bourderweb.com.ar/'> Bourder Web</a> 
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;