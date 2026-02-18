import React, { useMemo } from 'react';
import { Users, User, Briefcase, Calendar, AlertCircle, BarChart3 } from 'lucide-react';

const Dashboard = ({ data }) => {

  // ============================
  //  OPTIMIZACIÓN DE ESTADÍSTICAS
  // ============================
  const stats = useMemo(() => {
    const users = data?.users || [];
    const services = data?.services || [];
    const bookings = data?.bookings || [];
    const complaints = data?.complaints || [];

    const activeUsers = users.filter(u => u.activo).length;
    const pendingBookings = bookings.filter(b => b.estado === 'pendiente').length;
    const completedBookings = bookings.filter(b => b.estado === 'finalizado').length;
    const inProgressBookings = bookings.filter(
      b => b.estado === 'aceptado' || b.estado === 'en curso'
    ).length;
    const cancelledBookings = bookings.filter(b => b.estado === 'cancelado').length;

    return {
      totalUsers: users.length,
      activeUsers,
      inactiveUsers: users.length - activeUsers,
      totalServices: services.length,
      totalBookings: bookings.length,
      pendingBookings,
      completedBookings,
      inProgressBookings,
      cancelledBookings,
      newUsersThisMonth: users.filter(u => u.id > 1).length, // placeholder
      complaints: complaints.length
    };
  }, [data]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Panel de Control - Administrador</h2>

      {/* ============================
          TARJETAS PRINCIPALES
      ============================ */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        {/* Usuarios Totales */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Usuarios Totales</h3>
            <Users className="text-indigo-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
          <p className="text-sm text-green-600 mt-2">↑ {stats.newUsersThisMonth} nuevos este mes</p>
        </div>

        {/* Usuarios Activos */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Usuarios Activos</h3>
            <User className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.activeUsers}</p>
          <p className="text-sm text-gray-500 mt-2">{stats.inactiveUsers} inactivos</p>
        </div>

        {/* Servicios */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Servicios</h3>
            <Briefcase className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.totalServices}</p>
          <p className="text-sm text-gray-500 mt-2">Publicados en plataforma</p>
        </div>

        {/* Reservas */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Reservas</h3>
            <Calendar className="text-purple-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.totalBookings}</p>
          <p className="text-sm text-yellow-600 mt-2">{stats.pendingBookings} pendientes</p>
        </div>
      </div>

      {/* ============================
          SECCIONES DETALLADAS
      ============================ */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Gestión de Usuarios */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Users className="mr-2" size={20} />
            Gestión de Usuarios
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800">{user.nombre}</p>
                  <p className="text-sm text-gray-600">{user.email} - {user.role}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Estado de Reservas */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="mr-2" size={20} />
            Estado de Reservas
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="font-medium text-gray-700">Pendientes</span>
              <span className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-gray-700">En Proceso</span>
              <span className="text-2xl font-bold text-blue-600">{stats.inProgressBookings}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-gray-700">Completadas</span>
              <span className="text-2xl font-bold text-green-600">{stats.completedBookings}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="font-medium text-gray-700">Canceladas</span>
              <span className="text-2xl font-bold text-red-600">{stats.cancelledBookings}</span>
            </div>
          </div>
        </div>

        {/* Quejas */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            Quejas y Reclamaciones
          </h3>

          {stats.complaints === 0 ? (
            <div className="text-center py-8">
              <AlertCircle size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No hay quejas pendientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.complaints.map((complaint, idx) => (
                <div key={idx} className="p-3 bg-red-50 rounded-lg">
                  <p className="font-semibold text-gray-800">{complaint.subject}</p>
                  <p className="text-sm text-gray-600">{complaint.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Servicios más solicitados */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Briefcase className="mr-2" size={20} />
            Servicios Más Solicitados
          </h3>

          <div className="space-y-3">
            {data.services.slice(0, 5).map(service => {
              const bookingCount = data.bookings.filter(b => b.servicioId === service.id).length;

              return (
                <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{service.titulo}</p>
                    <p className="text-sm text-gray-600">{service.categoria}</p>
                  </div>
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {bookingCount} reservas
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
