import React, { useState } from 'react';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import * as api from '../services/api';

// ── Validaciones cliente
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[679]\d{8}$/;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;

function validate(form) {
  const errors = {};

  if (!form.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio';
  } else if (form.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres';
  }

  if (!form.email.trim()) {
    errors.email = 'El email es obligatorio';
  } else if (!EMAIL_RE.test(form.email)) {
    errors.email = 'El formato del email no es válido';
  }

  if (form.telefono && !PHONE_RE.test(form.telefono)) {
    errors.telefono = 'Debe ser un número español de 9 dígitos (empieza por 6, 7 o 9)';
  }

  if (!form.password) {
    errors.password = 'La contraseña es obligatoria';
  } else if (!PASSWORD_RE.test(form.password)) {
    errors.password =
      'Mínimo 8 caracteres, con al menos una mayúscula, una minúscula y un número';
  }

  if (!form.role) {
    errors.role = 'Debes seleccionar un tipo de cuenta';
  }

  return errors;
}

const ROLES = [
  { value: 'cliente',     label: 'Cliente' },
  { value: 'profesional', label: 'Profesional' },
];

const Register = ({ setView }) => {
  const [form, setForm] = useState({
    nombre:    '',
    email:     '',
    telefono:  '',
    password:  '',
    role:      '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Actualiza el campo y borra el error de ese campo en tiempo real
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErrors({});

    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);
      await api.register(form);
      alert('Cuenta creada correctamente. Ya puedes iniciar sesión.');
      setView('login');
    } catch (err) {
      // El backend devuelve { campo: "mensaje" } o { error: "mensaje" }
      const data = err?.response?.data;
      if (data && typeof data === 'object' && !data.error) {
        // mapa campo -> mensaje de @Valid
        setServerErrors(data);
      } else {
        setServerErrors({
          general: data?.error || 'Error al registrar el usuario. Inténtalo de nuevo.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Combina errores de validación cliente y servidor para mostrarlos juntos
  const err = (field) => fieldErrors[field] || serverErrors[field];

  const inputClass = (field) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
      err(field)
        ? 'border-red-400 focus:ring-red-300'
        : 'border-gray-300 focus:ring-indigo-300'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        {/* Cabecera */}
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Crear Cuenta</h1>
          <p className="text-gray-600">Regístrate para comenzar</p>
        </div>

        {/* Error general de servidor */}
        {serverErrors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {serverErrors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          {/* Tipo de cuenta — va primero para que el usuario sepa con qué rol se registra */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de cuenta <span className="text-red-500">*</span>
            </label>
            <select
              value={form.role}
              onChange={handleChange('role')}
              className={inputClass('role')}
            >
              <option value="">Selecciona un tipo de cuenta…</option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {err('role') && (
              <p className="mt-1 text-xs text-red-600">{err('role')}</p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={handleChange('nombre')}
              placeholder="Tu nombre completo"
              className={inputClass('nombre')}
            />
            {err('nombre') && (
              <p className="mt-1 text-xs text-red-600">{err('nombre')}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="correo@ejemplo.com"
              className={inputClass('email')}
            />
            {err('email') && (
              <p className="mt-1 text-xs text-red-600">{err('email')}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
              <span className="text-gray-400 text-xs ml-1">(opcional)</span>
            </label>
            <input
              type="tel"
              value={form.telefono}
              onChange={handleChange('telefono')}
              placeholder="612345678"
              maxLength={9}
              className={inputClass('telefono')}
            />
            {err('telefono') && (
              <p className="mt-1 text-xs text-red-600">{err('telefono')}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange('password')}
                placeholder="Mínimo 8 caracteres"
                className={`${inputClass('password')} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {err('password') && (
              <p className="mt-1 text-xs text-red-600">{err('password')}</p>
            )}
            {/* Indicador de requisitos */}
            {form.password && !err('password') && (
              <ul className="mt-2 text-xs text-gray-500 space-y-0.5 list-disc list-inside">
                <li className={form.password.length >= 8 ? 'text-green-600' : ''}>
                  Al menos 8 caracteres
                </li>
                <li className={/[A-Z]/.test(form.password) ? 'text-green-600' : ''}>
                  Una letra mayúscula
                </li>
                <li className={/[a-z]/.test(form.password) ? 'text-green-600' : ''}>
                  Una letra minúscula
                </li>
                <li className={/\d/.test(form.password) ? 'text-green-600' : ''}>
                  Un número
                </li>
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60 transition"
          >
            {loading ? 'Creando cuenta…' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              onClick={() => setView('login')}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Iniciar sesión
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;