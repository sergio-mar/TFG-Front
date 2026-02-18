import React, { useState } from 'react';
import { Edit, Save, X } from 'lucide-react';
import * as api from '../services/api';

const Profile = ({ data, setData, currentUser, setCurrentUser, loadData }) => {
  const [editProfile, setEditProfile] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    nombre: currentUser.nombre || '',
    telefono: currentUser.telefono || '',
    especialidad: currentUser.especialidad || '',
    activo: currentUser.activo,
    role: currentUser.role,
    email: currentUser.email
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!profileForm.nombre.trim() || !profileForm.telefono.trim()) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    try {
      setLoading(true);

      await api.updateUser(currentUser.id, {
        nombre: profileForm.nombre.trim(),
        telefono: profileForm.telefono.trim(),
        email: currentUser.email,
        role: currentUser.role,
        especialidad: currentUser.role === "profesional" ? profileForm.especialidad : null,
        activo: profileForm.activo
      });

      const updatedUser = {
        ...currentUser,
        nombre: profileForm.nombre,
        telefono: profileForm.telefono,
        especialidad: profileForm.especialidad
      };

      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setEditProfile(false);
      alert("Perfil actualizado exitosamente");

      await loadData();

    } catch (error) {
      console.error("Error actualizando perfil:", error);
      const backendMessage = error?.response?.data?.message;
      alert(backendMessage || "Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileForm({
      nombre: currentUser.nombre,
      telefono: currentUser.telefono,
      especialidad: currentUser.especialidad,
      activo: currentUser.activo,
      role: currentUser.role,
      email: currentUser.email
    });
    setEditProfile(false);
  };

  const stats = {
    cliente: {
      reservas: data.bookings.filter(b => b.clienteId === currentUser.id).length,
      completados: data.bookings.filter(
        b => b.clienteId === currentUser.id && b.estado === "finalizado"
      ).length
    },
    profesional: {
      publicados: data.services.filter(s => s.profesionalId === currentUser.id).length,
      pendientes: data.bookings.filter(b => {
        const service = data.services.find(s => s.id === b.servicioId);
        return service?.profesionalId === currentUser.id && b.estado === "pendiente";
      }).length,
      completados: data.bookings.filter(b => {
        const service = data.services.find(s => s.id === b.servicioId);
        return service?.profesionalId === currentUser.id && b.estado === "finalizado";
      }).length
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Mi Perfil</h2>

      {!editProfile ? (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="space-y-4">

            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Información Personal</h3>
              <button
                onClick={() => setEditProfile(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center"
              >
                <Edit size={16} className="mr-2" />
                Editar
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <ProfileField label="Nombre" value={currentUser.nombre} />
              <ProfileField label="Email" value={currentUser.email} />
              <ProfileField label="Teléfono" value={currentUser.telefono} />

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Rol</label>
                <p className="text-lg text-gray-800 capitalize">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    currentUser.role === 'admin'
                      ? 'bg-red-100 text-red-800'
                      : currentUser.role === 'profesional'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {currentUser.role}
                  </span>
                </p>
              </div>

              {currentUser.role === "profesional" && (
                <ProfileField
                  label="Especialidad"
                  value={currentUser.especialidad || "No especificada"}
                />
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Estado</label>
                <p className="text-lg">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    currentUser.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {currentUser.activo ? "Activo" : "Inactivo"}
                  </span>
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2">Estadísticas</h4>

              <div className="grid md:grid-cols-3 gap-4">
                {currentUser.role === "cliente" && (
                  <>
                    <StatCard label="Reservas realizadas" value={stats.cliente.reservas} color="blue" />
                    <StatCard label="Servicios completados" value={stats.cliente.completados} color="green" />
                  </>
                )}

                {currentUser.role === "profesional" && (
                  <>
                    <StatCard label="Servicios publicados" value={stats.profesional.publicados} color="blue" />
                    <StatCard label="Reservas pendientes" value={stats.profesional.pendientes} color="yellow" />
                    <StatCard label="Servicios completados" value={stats.profesional.completados} color="green" />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdateProfile} className="bg-white rounded-xl shadow-md p-6 space-y-4">

          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">Editar Perfil</h3>
          </div>

          <InputField
            label="Nombre"
            required
            value={profileForm.nombre}
            disabled={loading}
            onChange={(e) => setProfileForm({ ...profileForm, nombre: e.target.value })}
          />

          <InputField
            label="Teléfono"
            required
            value={profileForm.telefono}
            disabled={loading}
            onChange={(e) => setProfileForm({ ...profileForm, telefono: e.target.value })}
          />

          {currentUser.role === "profesional" && (
            <InputField
              label="Especialidad"
              value={profileForm.especialidad}
              disabled={loading}
              onChange={(e) => setProfileForm({ ...profileForm, especialidad: e.target.value })}
            />
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>Email:</strong> {currentUser.email} (no editable)</p>
            <p className="text-sm text-gray-600"><strong>Rol:</strong> {currentUser.role} (no editable)</p>
          </div>

          {/* 🔥 AQUÍ VA LA PARTE FINAL QUE FALTABA */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center disabled:bg-gray-400"
            >
              <Save size={20} className="mr-2" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition flex items-center justify-center disabled:cursor-not-allowed"
            >
              <X size={20} className="mr-2" />
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

/* ============================
   COMPONENTES AUXILIARES
============================ */

const ProfileField = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
    <p className="text-lg text-gray-800">{value}</p>
  </div>
);

const InputField = ({ label, value, onChange, disabled, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
    />
  </div>
);

const StatCard = ({ label, value, color }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    yellow: "text-yellow-600 bg-yellow-50"
  };

  return (
    <div className={`p-3 rounded-lg ${colors[color]}`}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default Profile;
