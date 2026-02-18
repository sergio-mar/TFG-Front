import React, { useState } from 'react';
import * as api from '../services/api';

const CreateService = ({ currentUser, setView, loadData }) => {
  const [serviceForm, setServiceForm] = useState({
    titulo: '',
    categoria: '',
    descripcion: '',
    precio: ''
  });

  const [loading, setLoading] = useState(false);

  const categories = [
    'Limpieza',
    'Reparaciones',
    'Jardinería',
    'Cuidado de Mascotas',
    'Mantenimiento'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!serviceForm.titulo.trim() || !serviceForm.categoria || !serviceForm.precio) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const precioNum = parseFloat(serviceForm.precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      alert('El precio debe ser un número válido mayor que 0');
      return;
    }

    try {
      setLoading(true);

      await api.createService({
        profesionalId: currentUser.id,
        titulo: serviceForm.titulo.trim(),
        categoria: serviceForm.categoria,
        descripcion: serviceForm.descripcion.trim(),
        precio: precioNum,
        disponibilidad: true
      });

      alert('Servicio creado exitosamente');

      // Limpiar formulario
      setServiceForm({
        titulo: '',
        categoria: '',
        descripcion: '',
        precio: ''
      });

      await loadData();
      setView('myservices');

    } catch (error) {
      console.error('Error creando servicio:', error);
      const backendMessage = error?.response?.data?.message;
      alert(backendMessage || 'Error al crear el servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Crear Nuevo Servicio</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-4">

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título del Servicio <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={serviceForm.titulo}
            onChange={(e) => setServiceForm({ ...serviceForm, titulo: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Ej: Limpieza general del hogar"
            required
            disabled={loading}
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            value={serviceForm.categoria}
            onChange={(e) => setServiceForm({ ...serviceForm, categoria: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
            disabled={loading}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            value={serviceForm.descripcion}
            onChange={(e) => setServiceForm({ ...serviceForm, descripcion: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows="4"
            placeholder="Describe tu servicio en detalle..."
            disabled={loading}
          />
        </div>

        {/* Precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio (€) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={serviceForm.precio}
            onChange={(e) => setServiceForm({ ...serviceForm, precio: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="45.00"
            required
            disabled={loading}
          />
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear Servicio'}
          </button>

          <button
            type="button"
            onClick={() => setView('myservices')}
            disabled={loading}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateService;
