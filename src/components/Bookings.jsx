import React, { useMemo, useState } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import * as api from '../services/api';

const Bookings = ({ data, setData, currentUser, loadData }) => {
  const [loading, setLoading] = useState(false);

  // ============================
  //  FILTRADO OPTIMIZADO
  // ============================
  const bookings = useMemo(() => {
    const allBookings = data?.bookings || [];
    const services = data?.services || [];

    if (currentUser.role === 'cliente') {
      return allBookings.filter(b => b.clienteId === currentUser.id);
    }

    if (currentUser.role === 'profesional') {
      const myServiceIds = services
        .filter(s => s.profesionalId === currentUser.id)
        .map(s => s.id);

      return allBookings.filter(b => myServiceIds.includes(b.servicioId));
    }

    return allBookings; // admin
  }, [data, currentUser]);

  // ============================
  //  CAMBIO DE ESTADO
  // ============================
  const handleChangeBookingStatus = async (bookingId, newStatus) => {
    try {
      setLoading(true);
      await api.updateBookingStatus(bookingId, newStatus);
      alert(`Reserva ${newStatus} correctamente`);
      await loadData();
    } catch (error) {
      console.error('Error actualizando reserva:', error);
      alert('Error al actualizar el estado de la reserva');
    } finally {
      setLoading(false);
    }
  };

  // ============================
  //  ESTILOS Y LABELS
  // ============================
  const getStatusColor = (status) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      aceptado: 'bg-blue-100 text-blue-800',
      en_curso: 'bg-purple-100 text-purple-800',
      finalizado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pendiente: 'Pendiente',
      aceptado: 'Aceptado',
      en_curso: 'En Curso',
      finalizado: 'Finalizado',
      cancelado: 'Cancelado'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        {currentUser.role === 'cliente' ? 'Mis Reservas' : 'Reservas Recibidas'}
      </h2>

      <div className="space-y-4">
        {bookings.map(booking => {
          const service = data.services.find(s => s.id === booking.servicioId);
          const cliente = data.users.find(u => u.id === booking.clienteId);
          const profesional = data.users.find(u => u.id === service?.profesionalId);

          return (
            <div
              key={booking.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
            >
              {/* ============================
                  CABECERA
              ============================ */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">
                    {service?.titulo || 'Servicio no disponible'}
                  </h3>

                  <p className="text-gray-600 mt-1">
                    {currentUser.role === 'cliente'
                      ? `Profesional: ${profesional?.nombre || 'N/A'}`
                      : `Cliente: ${cliente?.nombre || 'N/A'}`}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Teléfono:{' '}
                    {currentUser.role === 'cliente'
                      ? profesional?.telefono || 'N/A'
                      : cliente?.telefono || 'N/A'}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                    booking.estado
                  )}`}
                >
                  {getStatusLabel(booking.estado)}
                </span>
              </div>

              {/* ============================
                  FECHA
              ============================ */}
              <div className="flex items-center text-gray-600 mb-4">
                <Calendar size={16} className="mr-2" />
                <span>Fecha: {formatDate(booking.fecha)}</span>
              </div>

              {/* ============================
                  DETALLES DEL SERVICIO
              ============================ */}
              {service && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{service.descripcion}</p>
                  <p className="text-lg font-bold text-indigo-600 mt-2">
                    {service.precio}€
                  </p>
                </div>
              )}

              {/* ============================
                  ACCIONES SEGÚN ESTADO
              ============================ */}
              {(currentUser.role === 'admin' ||
                currentUser.role === 'profesional') &&
                booking.estado === 'pendiente' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleChangeBookingStatus(booking.id, 'aceptado')
                      }
                      disabled={loading}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400"
                    >
                      Aceptar
                    </button>

                    <button
                      onClick={() =>
                        handleChangeBookingStatus(booking.id, 'cancelado')
                      }
                      disabled={loading}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition disabled:bg-gray-400"
                    >
                      Rechazar
                    </button>
                  </div>
                )}

              {(currentUser.role === 'admin' ||
                currentUser.role === 'profesional') &&
                booking.estado === 'aceptado' && (
                  <button
                    onClick={() =>
                      handleChangeBookingStatus(booking.id, 'en_curso')
                    }
                    disabled={loading}
                    className="w-full bg-purple-500 text-white py-2 rounded-lg font-semibold hover:bg-purple-600 transition disabled:bg-gray-400"
                  >
                    Marcar como En Curso
                  </button>
                )}

              {(currentUser.role === 'admin' ||
                currentUser.role === 'profesional') &&
                booking.estado === 'en_curso' && (
                  <button
                    onClick={() =>
                      handleChangeBookingStatus(booking.id, 'finalizado')
                    }
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400"
                  >
                    Finalizar Servicio
                  </button>
                )}

              {/* ============================
                  VALORACIÓN DEL CLIENTE
              ============================ */}
              {booking.estado === 'finalizado' &&
                currentUser.role === 'cliente' &&
                !booking.valoracion && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      ¿Cómo fue tu experiencia?
                    </p>

                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => {
                            const updatedBookings = data.bookings.map((b) =>
                              b.id === booking.id
                                ? { ...b, valoracion: star }
                                : b
                            );
                            setData({ ...data, bookings: updatedBookings });
                            alert('¡Gracias por tu valoración!');
                          }}
                          className="text-2xl hover:scale-110 transition"
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {booking.valoracion && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    Valoración: {'⭐'.repeat(booking.valoracion)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ============================
          SIN RESERVAS
      ============================ */}
      {bookings.length === 0 && (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No hay reservas disponibles</p>
        </div>
      )}
    </div>
  );
};

export default Bookings;
