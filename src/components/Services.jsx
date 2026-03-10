import React, { useState } from 'react';
import { Search, Calendar, Briefcase, AlertCircle } from 'lucide-react';
import * as api from '../services/api';

const Services = ({ data, setData, currentUser, loadData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [bookingForm, setBookingForm] = useState({ servicioId: null, fecha: '' });
  const [loading, setLoading] = useState(false);

  const categories = ['Todas', 'Limpieza', 'Reparaciones', 'Jardinería', 'Cuidado de Mascotas', 'Mantenimiento'];

  const handleCreateBooking = async (servicioId) => {
    if (!bookingForm.fecha || bookingForm.servicioId !== servicioId) {
      alert('Selecciona una fecha válida');
      return;
    }

    try {
      setLoading(true);
      await api.createBooking({
        clienteId: currentUser.id,
        servicioId,
        fecha: bookingForm.fecha
      });

      setBookingForm({ servicioId: null, fecha: '' });
      alert('Reserva realizada exitosamente');
      await loadData();
    } catch (error) {
      console.error('Error creando reserva:', error);
      alert('Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = data.services.filter(service => {
    const matchesSearch =
      service.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'Todas' || service.categoria === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Servicios Disponibles</h2>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar servicios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map(service => (
          <div key={service.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">{service.titulo}</h3>
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                {service.categoria}
              </span>
            </div>

            <p className="text-gray-600 mb-4">{service.descripcion}</p>

            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-indigo-600">{service.precio}€</span>

              {service.profesionalNombre && (
                <div className="flex items-center text-sm text-gray-600">
                  <Briefcase size={16} className="mr-1" />
                  {service.profesionalNombre}
                </div>
              )}
            </div>

            {currentUser.role === 'cliente' && (
              <div className="space-y-2">
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) =>
                    setBookingForm({
                      servicioId: service.id,
                      fecha: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  onClick={() => handleCreateBooking(service.id)}
                  disabled={loading || bookingForm.servicioId !== service.id || !bookingForm.fecha}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Procesando...' : 'Reservar Servicio'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No se encontraron servicios</p>
        </div>
      )}
    </div>
  );
};

export default Services;