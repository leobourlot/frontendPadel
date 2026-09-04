import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Reservas from './pages/Reservas';
import MisReservas from './pages/MisReservas';
import AdminCanchas from './pages/AdminCanchas';
import AdminUsuarios from './pages/AdminUsuarios';
import ReservasRecurrentes from './pages/ReservasRecurrentes';
import AdminReservas from './pages/AdminReservas';
import AdminReportes from './pages/AdminReportes'; // ✅ NUEVO
import Vencido from './pages/Vencido';
import SuperAdminClubes from './pages/SuperAdminClubes';
import SuperAdminLogin from './pages/SuperAdminLogin';

function PrivateRoute({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
    const { user } = useAuth();
    return !user ? children : <Navigate to="/dashboard" />;
}

function SuperAdminRoute({ children }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (user.rol !== 'superadmin') return <Navigate to="/dashboard" />;
    return children;
}

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/vencido" element={<Vencido />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                {/* ✅ pública: cualquiera puede ver turnos */}
                <Route path="/reservas" element={<Reservas />} />

                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/reservas-recurrentes" element={<PrivateRoute><ReservasRecurrentes /></PrivateRoute>} />
                <Route path="/mis-reservas" element={<PrivateRoute><MisReservas /></PrivateRoute>} />
                <Route path="/admin/canchas" element={<PrivateRoute><AdminCanchas /></PrivateRoute>} />
                <Route path="/admin/usuarios" element={<PrivateRoute><AdminUsuarios /></PrivateRoute>} />
                <Route path="/admin/reservas" element={<PrivateRoute><AdminReservas /></PrivateRoute>} />
                <Route path="/admin/reportes" element={<PrivateRoute><AdminReportes /></PrivateRoute>} /> {/* ✅ NUEVO */}
                <Route path="/" element={<Navigate to="/reservas" />} />
                <Route path="/superadmin-panel-leo/login" element={<SuperAdminLogin />} />
                <Route path="/superadmin/clubes" element={<SuperAdminRoute><SuperAdminClubes /></SuperAdminRoute>} />            </Routes>
        </AuthProvider>
    );
}

export default App;