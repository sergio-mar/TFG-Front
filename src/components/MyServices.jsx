import React, { useState } from 'react';
import { Plus, Trash2, Briefcase } from 'lucide-react';
import * as api from '../services/api';

const MyServices = ({ data, setData, currentUser, setView, loadData }) => {
  const [loadingDelete, setLoadingDelete] = useState(null);

  const myServices = data.services.filter(s => s.profesionalId === currentUser.id);

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('¿Estás seguro de eliminar este servicio?')) return;

    try {
      setLoadingDelete(serviceId);
      await api.deleteService(serviceId);
      alert('Servicio eliminado exitosamente');
      await loadData();
    } catch (error) {
      console.error('Error eliminando servicio:', error);
      alert('Error al eliminar el servicio');
    } finally {
      setLoadingDelete(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Mis Servicios</h2>
        <button
          onClick={() => setView('createservice')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Crear Servicio
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {myServices.map(service => (
          <div key={service.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">{service.titulo}</h3>
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                {service.categoria}
              </span>
            </div>

            <p className="text-gray-600 mb-4">{service.descripcion}</p>

            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-indigo-600">{service.precio}€</span>

              <button
                onClick={() => handleDeleteService(service.id)}
                disabled={loadingDelete === service.id}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center disabled:bg-red-300"
              >
                <Trash2 size={16} className="mr-2" />
                {loadingDelete === service.id ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {myServices.length === 0 && (
        <div className="text-center py-12">
          <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Aún no has creado servicios</p>
          <button
            onClick={() => setView('createservice')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition inline-flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Crear tu primer servicio
          </button>
        </div>
      )}
    </div>
  );
};

export default MyServices;
