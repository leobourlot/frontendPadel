// const API_URL = 'http://localhost:3000';
const API_URL = 'https://padel.srv805858.hstgr.cloud';

// Helper para obtener el token
const getToken = () => localStorage.getItem('token');

// Helper para hacer peticiones autenticadas
const fetchWithAuth = async (endpoint, options = {}) => {
    const token = getToken();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en la petición');
    }

    return response.json();
};

// ====================================
// SERVICIOS DE CANCHAS
// ====================================
export const canchasService = {
    getAll: async () => {
        return fetchWithAuth('/canchas');
    },

    getById: async (id) => {
        return fetchWithAuth(`/canchas/${id}`);
    },

    create: async (canchaData) => {
        return fetchWithAuth('/canchas', {
            method: 'POST',
            body: JSON.stringify(canchaData)
        });
    },

    update: async (id, canchaData) => {
        return fetchWithAuth(`/canchas/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(canchaData)
        });
    },

    delete: async (id) => {
        return fetchWithAuth(`/canchas/${id}`, {
            method: 'DELETE'
        });
    }
};

// ====================================
// SERVICIOS DE HORARIOS
// ====================================
export const horariosService = {
    getAll: async () => {
        return fetchWithAuth('/horarios');
    },

    getById: async (id) => {
        return fetchWithAuth(`/horarios/${id}`);
    },

    create: async (horarioData) => {
        return fetchWithAuth('/horarios', {
            method: 'POST',
            body: JSON.stringify(horarioData)
        });
    },

    generarDefault: async () => {
        return fetchWithAuth('/horarios/generar-default', {
            method: 'POST'
        });
    }
};

// ====================================
// SERVICIOS DE RESERVAS
// ====================================
export const reservasService = {
    // Crear nueva reserva
    create: async (reservaData) => {
        return fetchWithAuth('/reservas', {
            method: 'POST',
            body: JSON.stringify(reservaData)
        });
    },

    // Obtener todas las reservas
    getAll: async () => {
        return fetchWithAuth('/reservas');
    },

    // Obtener mis reservas
    getMisReservas: async () => {
        return fetchWithAuth('/reservas/mis-reservas');
    },

    // Obtener reservas por cancha y fecha
    getByCancha: async (idCancha, fecha) => {
        return fetchWithAuth(`/reservas/cancha/${idCancha}?fecha=${fecha}`);
    },

    // Obtener una reserva específica
    getById: async (id) => {
        return fetchWithAuth(`/reservas/${id}`);
    },

    // Actualizar reserva
    update: async (id, reservaData) => {
        return fetchWithAuth(`/reservas/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(reservaData)
        });
    },

    // Cancelar reserva
    cancel: async (id) => {
        return fetchWithAuth(`/reservas/${id}/cancel`, {
            method: 'PATCH'
        });
    },

    // Eliminar reserva
    delete: async (id) => {
        return fetchWithAuth(`/reservas/${id}`, {
            method: 'DELETE'
        });
    },

    createRecurrente: async (reservaData) => {
        return fetchWithAuth('/reservas/recurrente', {
            method: 'POST',
            body: JSON.stringify(reservaData)
        });
    },

    getMisReservasRecurrentes: async () => {
        return fetchWithAuth('/reservas/recurrente/mis-reservas');
    },

    cancelRecurrente: async (id) => {
        return fetchWithAuth(`/reservas/recurrente/${id}`, {
            method: 'DELETE'
        });
    }
};

// ====================================
// SERVICIOS DE USUARIOS
// ====================================
export const usuariosService = {
    getAll: async () => {
        return fetchWithAuth('/usuarios');
    },

    getById: async (id) => {
        return fetchWithAuth(`/usuarios/${id}`);
    },

    update: async (id, usuarioData) => {
        return fetchWithAuth(`/usuarios/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(usuarioData)
        });
    },

    // ✅ NUEVO: Cambiar rol de usuario
    updateRole: async (id, rol) => {
        return fetchWithAuth(`/usuarios/${id}/rol`, {
            method: 'PATCH',
            body: JSON.stringify({ rol })
        });
    },

    // ✅ NUEVO: Activar/Desactivar usuario
    toggleActive: async (id, activo) => {
        return fetchWithAuth(`/usuarios/${id}/estado`, {
            method: 'PATCH',
            body: JSON.stringify({ activo })
        });
    },

    delete: async (id) => {
        return fetchWithAuth(`/usuarios/${id}`, {
            method: 'DELETE'
        });
    }
};

// ====================================
// SERVICIOS DE AUTENTICACIÓN
// ====================================
export const authService = {
    login: async (dni, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dni, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al iniciar sesión');
        }

        return response.json();
    },

    register: async (userData) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al registrarse');
        }

        return response.json();
    },

    getProfile: async () => {
        return fetchWithAuth('/auth/profile');
    }
};

export default {
    canchas: canchasService,
    horarios: horariosService,
    reservas: reservasService,
    usuarios: usuariosService,
    auth: authService
};