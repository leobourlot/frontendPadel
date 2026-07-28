// El backend es uno solo. El club se detecta automáticamente
// por el subdominio en el middleware del servidor.
// const API_URL = 'https://api.turnos.bourderweb.com.ar';
// const API_URL = 'https://backendpadel-n3u9.onrender.com';
const API_URL = 'https://n8n-bourder-padelturnos.nvtq0w.easypanel.host';

// Helper para obtener el token
const getToken = () => localStorage.getItem('token');

// Helper para hacer peticiones autenticadas
const fetchWithAuth = async (endpoint, options = {}) => {
    const token = getToken();

    // const config = {
    //     ...options,
    //     headers: {
    //         'Content-Type': 'application/json',
    //         ...options.headers,
    //         ...(token && { Authorization: `Bearer ${token}` }),
    //     },
    // };

    // // En desarrollo local, pasar el club por header para testear
    // // Ejemplo: setClubSlug('clubdelrio') en la consola del navegador
    // const devSlug = localStorage.getItem('dev_club_slug');
    // if (devSlug && window.location.hostname === 'localhost') {
    //     config.headers['X-Club-Slug'] = devSlug;
    // }
    // Leer el slug del subdominio actual del frontend
    const hostname = window.location.hostname;
    const slug = hostname.split('.')[0];

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
            ...(token && { Authorization: `Bearer ${token}` }),
            'X-Club-Slug': slug,  // ← siempre se manda
        },
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));

        // Si el club venció, redirigir a página de vencimiento
        if (response.status === 403 && error.vencido) {
            window.location.href = '/vencido';
            return;
        }

        throw new Error(error.message || 'Error en la petición');
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return null;

    const text = await response.text();
    if (!text || text.trim() === '') return null;

    return JSON.parse(text);
};

// ====================================
// SERVICIOS DE CANCHAS
// ====================================
export const canchasService = {
    getAll: () => fetchWithAuth('/canchas'),
    getById: (id) => fetchWithAuth(`/canchas/${id}`),
    create: (canchaData) => fetchWithAuth('/canchas', { method: 'POST', body: JSON.stringify(canchaData) }),
    update: (id, canchaData) => fetchWithAuth(`/canchas/${id}`, { method: 'PATCH', body: JSON.stringify(canchaData) }),
    delete: (id) => fetchWithAuth(`/canchas/${id}`, { method: 'DELETE' }),
};

// ====================================
// SERVICIOS DE HORARIOS
// ====================================
export const horariosService = {
    getAll: () => fetchWithAuth('/horarios'),
    getById: (id) => fetchWithAuth(`/horarios/${id}`),
    create: (horarioData) => fetchWithAuth('/horarios', { method: 'POST', body: JSON.stringify(horarioData) }),
    generarDefault: () => fetchWithAuth('/horarios/generar-default', { method: 'POST' }),
};

// ====================================
// SERVICIOS DE RESERVAS
// ====================================
export const reservasService = {
    create: (reservaData) => fetchWithAuth('/reservas', { method: 'POST', body: JSON.stringify(reservaData) }),
    getAll: () => fetchWithAuth('/reservas'),
    getMisReservas: () => fetchWithAuth('/reservas/mis-reservas'),
    getByCancha: (idCancha, fecha) => fetchWithAuth(`/reservas/cancha/${idCancha}?fecha=${fecha}`),
    getById: (id) => fetchWithAuth(`/reservas/${id}`),
    update: (id, reservaData) => fetchWithAuth(`/reservas/${id}`, { method: 'PATCH', body: JSON.stringify(reservaData) }),
    cancel: (id) => fetchWithAuth(`/reservas/${id}/cancel`, { method: 'PATCH' }),
    delete: (id) => fetchWithAuth(`/reservas/${id}`, { method: 'DELETE' }),
    createRecurrente: (reservaData) => fetchWithAuth('/reservas/recurrente', { method: 'POST', body: JSON.stringify(reservaData) }),
    getMisReservasRecurrentes: () => fetchWithAuth('/reservas/recurrente/mis-reservas'),
    cancelRecurrente: (id) => fetchWithAuth(`/reservas/recurrente/${id}`, { method: 'DELETE' }),
};

// ====================================
// SERVICIOS DE USUARIOS
// ====================================
export const usuariosService = {
    getAll: () => fetchWithAuth('/usuarios'),
    getById: (id) => fetchWithAuth(`/usuarios/${id}`),
    update: (id, usuarioData) => fetchWithAuth(`/usuarios/${id}`, { method: 'PATCH', body: JSON.stringify(usuarioData) }),
    updateRole: (id, rol) => fetchWithAuth(`/usuarios/${id}/rol`, { method: 'PATCH', body: JSON.stringify({ rol }) }),
    toggleActive: (id, activo) => fetchWithAuth(`/usuarios/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ activo }) }),
    delete: (id) => fetchWithAuth(`/usuarios/${id}`, { method: 'DELETE' }),
};

// ====================================
// SERVICIOS DE AUTENTICACIÓN
// ====================================
export const authService = {
    login: async (dni, password) => {
        const token = getToken();
        const headers = { 'Content-Type': 'application/json' };

        const devSlug = localStorage.getItem('dev_club_slug');
        if (devSlug && window.location.hostname === 'localhost') {
            headers['X-Club-Slug'] = devSlug;
        }

        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ dni, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al iniciar sesión');
        }
        return response.json();
    },

    register: async (userData) => {
        const headers = { 'Content-Type': 'application/json' };

        const devSlug = localStorage.getItem('dev_club_slug');
        if (devSlug && window.location.hostname === 'localhost') {
            headers['X-Club-Slug'] = devSlug;
        }

        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers,
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al registrarse');
        }
        return response.json();
    },

    getProfile: () => fetchWithAuth('/auth/profile'),
};

export default { canchas: canchasService, horarios: horariosService, reservas: reservasService, usuarios: usuariosService, auth: authService };