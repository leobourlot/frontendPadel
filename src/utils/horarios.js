import { setHours, setMinutes, getDay } from 'date-fns';

/**
 * Genera los bloques horarios de un día específico, según la configuración del club.
 * @param {Array} horariosClub - array de configuración por día, del endpoint /horarios-club
 * @param {Date} fecha - la fecha para la que se quiere generar la grilla
 * @returns {Array} bloques { horaInicio, horaFin } en formato "HH:mm"
 */
export function generarHorariosDelDia(horariosClub, fecha) {
    const diaSemana = getDay(fecha); // 0=Domingo, 1=Lunes, ..., 6=Sábado

    const configDia = horariosClub.find(h => h.diaSemana === diaSemana);

    // Si no hay config para ese día, o está marcado como inactivo, no hay horarios
    if (!configDia || !configDia.activo) {
        return [];
    }

    const { horaInicio, horaFin, duracionTurno } = configDia;

    const [horaIni, minIni] = horaInicio.split(':').map(Number);
    const [horaFinNum, minFin] = horaFin.split(':').map(Number);

    const inicio = setMinutes(setHours(fecha, horaIni), minIni);
    const fin = setMinutes(setHours(fecha, horaFinNum), minFin);

    const bloques = [];
    let actual = new Date(inicio);

    while (actual.getTime() + duracionTurno * 60000 <= fin.getTime()) {
        const bloqueInicio = new Date(actual);
        const bloqueFin = new Date(actual.getTime() + duracionTurno * 60000);

        bloques.push({
            horaInicio: formatHora(bloqueInicio),
            horaFin: formatHora(bloqueFin),
        });

        actual = bloqueFin;
    }

    return bloques;
}

function formatHora(date) {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
}

/** Nombres de días para mostrar mensajes ("El club no atiende los domingos", etc.) */
export const NOMBRES_DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];