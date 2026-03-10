import React, { useState } from 'react';
import { Edit, Save, X, Eye, EyeOff, KeyRound } from 'lucide-react';
import * as api from '../services/api';

// ── Validaciones
const PHONE_RE    = /^[679]\d{8}$/;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;

function validateProfile(form) {
  const errors = {};
  if (!form.nombre.trim())
    errors.nombre = 'El nombre es obligatorio';
  if (form.telefono && !PHONE_RE.test(form.telefono))
    errors.telefono = 'Teléfono español de 9 dígitos (empieza por 6, 7 o 9)';
  return errors;
}

function validatePassword(form) {
  const errors = {};
  if (!form.currentPassword)
    errors.currentPassword = 'Introduce tu contraseña actual';
  if (!form.newPassword)
    errors.newPassword = 'Introduce la nueva contraseña';
  else if (!PASSWORD_RE.test(form.newPassword))
    errors.newPassword = 'Mínimo 8 caracteres, con mayúscula, minúscula y número';
  if (form.newPassword && form.newPassword === form.currentPassword)
    errors.newPassword = 'La nueva contraseña debe ser distinta a la actual';
  if (!form.confirmPassword)
    errors.confirmPassword = 'Confirma la nueva contraseña';
  else if (form.newPassword !== form.confirmPassword)
    errors.confirmPassword = 'Las contraseñas no coinciden';
  return errors;
}

// ── Componentes auxiliares

const ProfileField = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
    <p className="text-base text-gray-800">{value || '—'}</p>
  </div>
);

const InputField = ({ label, value, onChange, disabled, required, error, type = 'text',
  placeholder, maxLength, hint }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`w-full px-4 py-2 border rounded-lg text-sm transition
        focus:outline-none focus:ring-2 focus:ring-indigo-400
        ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}
        ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
  </div>
);

const PasswordInput = ({ label, value, onChange, disabled, error, show, onToggle, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-4 py-2 pr-10 border rounded-lg text-sm transition
          focus:outline-none focus:ring-2 focus:ring-indigo-400
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
      <button
        type="button"
        onClick={onToggle}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

// ── Componente principal 
const Profile = ({ data, setData, currentUser, setCurrentUser, loadData }) => {
  const [mode, setMode]       = useState('view');   // 'view' | 'edit' | 'password'
  const [loading, setLoading] = useState(false);

  // ── Formulario de perfil 
  const [profileForm, setProfileForm] = useState({
    nombre:      currentUser.nombre      || '',
    telefono:    currentUser.telefono    || '',
    especialidad: currentUser.especialidad || '',
  });
  const [profileErrors, setProfileErrors] = useState({});

  const profileField = (name) => (e) => {
    setProfileForm((p) => ({ ...p, [name]: e.target.value }));
    setProfileErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const errors = validateProfile(profileForm);
    if (Object.keys(errors).length) { setProfileErrors(errors); return; }

    try {
      setLoading(true);
      await api.updateUser(currentUser.id, {
        nombre:      profileForm.nombre.trim(),
        telefono:    profileForm.telefono.trim() || null,
        email:       currentUser.email,
        role:        currentUser.role,
        especialidad: currentUser.role === 'profesional'
          ? profileForm.especialidad.trim() || null
          : null,
        activo: currentUser.activo,
      });

      const updated = {
        ...currentUser,
        nombre:       profileForm.nombre.trim(),
        telefono:     profileForm.telefono.trim() || null,
        especialidad: profileForm.especialidad.trim() || null,
      };
      setCurrentUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setMode('view');
      await loadData();
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message
        || 'Error al actualizar el perfil';
      setProfileErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileForm({
      nombre:       currentUser.nombre      || '',
      telefono:     currentUser.telefono    || '',
      especialidad: currentUser.especialidad || '',
    });
    setProfileErrors({});
    setMode('view');
  };

  // ── Formulario de contraseña
  const emptyPwdForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  const [pwdForm, setPwdForm]     = useState(emptyPwdForm);
  const [pwdErrors, setPwdErrors] = useState({});
  const [pwdShow, setPwdShow]     = useState({ current: false, new: false, confirm: false });
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const pwdField = (name) => (e) => {
    setPwdForm((p) => ({ ...p, [name]: e.target.value }));
    setPwdErrors((p) => ({ ...p, [name]: undefined }));
    setPwdSuccess(false);
  };

  const toggleShow = (name) => setPwdShow((p) => ({ ...p, [name]: !p[name] }));

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errors = validatePassword(pwdForm);
    if (Object.keys(errors).length) { setPwdErrors(errors); return; }

    try {
      setLoading(true);
      // El endpoint recibe la contraseña actual para verificarla en el backend
      await api.updateUser(currentUser.id, {
        ...currentUser,
        currentPassword: pwdForm.currentPassword,
        password:        pwdForm.newPassword,
      });
      setPwdForm(emptyPwdForm);
      setPwdErrors({});
      setPwdSuccess(true);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message
        || 'Error al cambiar la contraseña';
      setPwdErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPassword = () => {
    setPwdForm(emptyPwdForm);
    setPwdErrors({});
    setPwdSuccess(false);
    setMode('view');
  };

  // ── Indicador de requisitos de contraseña
  const pwd = pwdForm.newPassword;
  const pwdReqs = [
    { label: 'Al menos 8 caracteres',  ok: pwd.length >= 8 },
    { label: 'Una letra mayúscula',     ok: /[A-Z]/.test(pwd) },
    { label: 'Una letra minúscula',     ok: /[a-z]/.test(pwd) },
    { label: 'Un número',              ok: /\d/.test(pwd)   },
  ];

  // ── Render 
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Mi Perfil</h2>

      {/* ── Vista de datos */}
      {mode === 'view' && (
        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">

          {/* Cabecera */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">Información Personal</h3>
            <button
              onClick={() => setMode('edit')}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2
                rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
            >
              <Edit size={15} />
              Editar
            </button>
          </div>

          {/* Campos */}
          <div className="grid md:grid-cols-2 gap-5">
            <ProfileField label="Nombre"   value={currentUser.nombre} />
            <ProfileField label="Email"    value={currentUser.email} />
            <ProfileField label="Teléfono" value={currentUser.telefono} />

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Rol</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                currentUser.role === 'admin'      ? 'bg-amber-100 text-amber-800'   :
                currentUser.role === 'profesional' ? 'bg-blue-100 text-blue-800'   :
                                                    'bg-green-100 text-green-800'
              }`}>
                {currentUser.role}
              </span>
            </div>

            {currentUser.role === 'profesional' && (
              <ProfileField
                label="Especialidad"
                value={currentUser.especialidad || 'No especificada'}
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Estado</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                currentUser.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {currentUser.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          {/* Botón cambiar contraseña */}
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={() => setMode('password')}
              className="flex items-center gap-2 text-sm text-indigo-600 font-medium
                hover:text-indigo-800 transition"
            >
              <KeyRound size={15} />
              Cambiar contraseña
            </button>
          </div>
        </div>
      )}

      {/* ── Formulario de edición */}
      {mode === 'edit' && (
        <form onSubmit={handleUpdateProfile}
          className="bg-white rounded-xl shadow-md p-6 space-y-5" noValidate>

          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">Editar Perfil</h3>
          </div>

          {profileErrors.general && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {profileErrors.general}
            </div>
          )}

          <InputField
            label="Nombre"
            required
            value={profileForm.nombre}
            onChange={profileField('nombre')}
            disabled={loading}
            error={profileErrors.nombre}
          />

          <InputField
            label="Teléfono"
            value={profileForm.telefono}
            onChange={profileField('telefono')}
            disabled={loading}
            error={profileErrors.telefono}
            placeholder="612345678"
            maxLength={9}
            hint="Número español de 9 dígitos empezando por 6, 7 o 9 (opcional)"
          />

          {currentUser.role === 'profesional' && (
            <InputField
              label="Especialidad"
              value={profileForm.especialidad}
              onChange={profileField('especialidad')}
              disabled={loading}
              placeholder="Ej: fontanería, limpieza…"
            />
          )}

          {/* Campos no editables */}
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-500 space-y-1">
            <p><strong className="text-gray-700">Email:</strong> {currentUser.email} (no editable)</p>
            <p><strong className="text-gray-700">Rol:</strong> {currentUser.role} (no editable)</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white
                py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 transition"
            >
              <Save size={16} />
              {loading ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700
                py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-200 disabled:opacity-60 transition"
            >
              <X size={16} />
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* ── Formulario de contraseña */}
      {mode === 'password' && (
        <form onSubmit={handleChangePassword}
          className="bg-white rounded-xl shadow-md p-6 space-y-5" noValidate>

          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <KeyRound size={18} className="text-indigo-600" />
              Cambiar contraseña
            </h3>
          </div>

          {pwdErrors.general && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {pwdErrors.general}
            </div>
          )}

          {pwdSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              ✓ Contraseña actualizada correctamente.
            </div>
          )}

          <PasswordInput
            label="Contraseña actual"
            value={pwdForm.currentPassword}
            onChange={pwdField('currentPassword')}
            disabled={loading}
            error={pwdErrors.currentPassword}
            show={pwdShow.current}
            onToggle={() => toggleShow('current')}
            placeholder="Tu contraseña actual"
          />

          <PasswordInput
            label="Nueva contraseña"
            value={pwdForm.newPassword}
            onChange={pwdField('newPassword')}
            disabled={loading}
            error={pwdErrors.newPassword}
            show={pwdShow.new}
            onToggle={() => toggleShow('new')}
            placeholder="Mínimo 8 caracteres"
          />

          {/* Indicador de requisitos */}
          {pwd && (
            <ul className="space-y-1 pl-1">
              {pwdReqs.map((r) => (
                <li key={r.label}
                  className={`flex items-center gap-2 text-xs transition-colors
                    ${r.ok ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                    ${r.ok ? 'bg-green-500' : 'bg-gray-300'}`} />
                  {r.label}
                </li>
              ))}
            </ul>
          )}

          <PasswordInput
            label="Confirmar nueva contraseña"
            value={pwdForm.confirmPassword}
            onChange={pwdField('confirmPassword')}
            disabled={loading}
            error={pwdErrors.confirmPassword}
            show={pwdShow.confirm}
            onToggle={() => toggleShow('confirm')}
            placeholder="Repite la nueva contraseña"
          />

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white
                py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 transition"
            >
              <Save size={16} />
              {loading ? 'Guardando…' : 'Cambiar contraseña'}
            </button>
            <button
              type="button"
              onClick={handleCancelPassword}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700
                py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-200 disabled:opacity-60 transition"
            >
              <X size={16} />
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;