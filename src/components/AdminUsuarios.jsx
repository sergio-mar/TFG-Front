import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Filter, Edit3, Trash2, X, Save,
  ChevronLeft, CheckCircle, XCircle, AlertTriangle,
  UserCheck, UserX, Briefcase, User, ShieldCheck,
  ArrowUpDown, RefreshCw
} from 'lucide-react';
import * as api from '../services/api';

const ROLES = ['cliente', 'profesional', 'admin'];
const ROLE_LABELS = { cliente: 'Cliente', profesional: 'Profesional', admin: 'Administrador' };

const ROLE_STYLE = {
  cliente:      'bg-blue-100 text-blue-700 border border-blue-200',
  profesional:  'bg-emerald-100 text-emerald-700 border border-emerald-200',
  admin:        'bg-amber-100 text-amber-700 border border-amber-200',
};

const ROLE_ICON = {
  cliente:     <User size={12} />,
  profesional: <Briefcase size={12} />,
  admin:       <ShieldCheck size={12} />,
};

const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE  = /^[679]\d{8}$/;

function validateEdit(form) {
  const errors = {};
  if (!form.nombre?.trim())         errors.nombre   = 'El nombre es obligatorio';
  if (!EMAIL_RE.test(form.email))   errors.email    = 'Email no válido';
  if (form.telefono && !PHONE_RE.test(form.telefono))
    errors.telefono = 'Teléfono español de 9 dígitos (empieza por 6, 7 o 9)';
  if (!form.role)                   errors.role     = 'El rol es obligatorio';
  return errors;
}

function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto
            transition-all duration-300
            ${t.type === 'success' ? 'bg-emerald-600 text-white' : ''}
            ${t.type === 'error'   ? 'bg-red-600 text-white'     : ''}
            ${t.type === 'warn'    ? 'bg-amber-500 text-white'   : ''}
          `}
        >
          {t.type === 'success' && <CheckCircle size={16} />}
          {t.type === 'error'   && <XCircle     size={16} />}
          {t.type === 'warn'    && <AlertTriangle size={16} />}
          {t.message}
          <button onClick={() => remove(t.id)} className="ml-2 opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  const remove = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);
  return { toasts, add, remove };
}

function EditModal({ user, onClose, onSave }) {
  const [form, setForm]     = useState({
    nombre:      user.nombre      || '',
    email:       user.email       || '',
    telefono:    user.telefono    || '',
    role:        user.role        || 'cliente',
    especialidad: user.especialidad || '',
    activo:      user.activo      ?? true,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const field = (name) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [name]: val }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleSave = async () => {
    const errs = validateEdit(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave(user.id, form);
    } finally {
      setSaving(false);
    }
  };

  const inp = (name) =>
    `w-full px-3 py-2 text-sm rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-indigo-400
    ${errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              {(user.nombre || '?')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{user.nombre}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          <div className="grid grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
              <input type="text" value={form.nombre} onChange={field('nombre')} className={inp('nombre')} />
              {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
            </div>

            {/* Email */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input type="email" value={form.email} onChange={field('email')} className={inp('email')} />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
              <input
                type="tel" value={form.telefono} onChange={field('telefono')}
                maxLength={9} placeholder="612345678" className={inp('telefono')}
              />
              {errors.telefono && <p className="mt-1 text-xs text-red-500">{errors.telefono}</p>}
            </div>

            {/* Rol */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
              <select value={form.role} onChange={field('role')} className={inp('role')}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
              {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role}</p>}
            </div>

            {/* Especialidad (sólo si es profesional) */}
            {form.role === 'profesional' && (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Especialidad
                </label>
                <input
                  type="text" value={form.especialidad}
                  onChange={field('especialidad')}
                  placeholder="Ej: fontanería, limpieza…"
                  className={inp('especialidad')}
                />
              </div>
            )}
          </div>

          {/* Estado activo */}
          <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">Cuenta activa</p>
              <p className="text-xs text-gray-500">
                {form.activo
                  ? 'El usuario puede acceder a la plataforma'
                  : 'El usuario tiene el acceso bloqueado'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, activo: !p.activo }))}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200
                ${form.activo ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
                  ${form.activo ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg
              hover:bg-indigo-700 disabled:opacity-60 transition font-medium"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ user, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try { await onConfirm(user.id); }
    finally { setDeleting(false); }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 size={24} className="text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-1">Eliminar usuario</p>
            <p className="text-sm text-gray-500">
              ¿Estás seguro de que quieres eliminar a{' '}
              <span className="font-medium text-gray-700">{user.nombre}</span>?
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={deleting}
              className="flex-1 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700
                disabled:opacity-60 transition font-medium"
            >
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsuarios({ onBack }) {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [filterRole, setFilterRole] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [sortField,  setSortField]  = useState('nombre');
  const [sortAsc,    setSortAsc]    = useState(true);
  const [editUser,   setEditUser]   = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const { toasts, add: addToast, remove: removeToast } = useToast();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      setUsers(res.data);
    } catch {
      addToast('No se pudo cargar el listado de usuarios', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const displayed = users
    .filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        u.nombre?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.telefono?.includes(q);
      const matchRole   = filterRole   === 'todos' || u.role   === filterRole;
      const matchStatus =
        filterStatus === 'todos' ||
        (filterStatus === 'activo'   &&  u.activo) ||
        (filterStatus === 'inactivo' && !u.activo);
      return matchSearch && matchRole && matchStatus;
    })
    .sort((a, b) => {
      const va = (a[sortField] ?? '').toString().toLowerCase();
      const vb = (b[sortField] ?? '').toString().toLowerCase();
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const toggleSort = (field) => {
    if (sortField === field) setSortAsc((v) => !v);
    else { setSortField(field); setSortAsc(true); }
  };

  const handleSave = async (id, data) => {
    try {
      const res = await api.updateUser(id, data);
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)));
      setEditUser(null);
      addToast('Usuario actualizado correctamente', 'success');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Error al actualizar el usuario';
      addToast(msg, 'error');
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setDeleteUser(null);
      addToast('Usuario eliminado', 'success');
    } catch {
      addToast('Error al eliminar el usuario', 'error');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const res = await api.updateUser(user.id, { ...user, activo: !user.activo });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? res.data : u)));
      addToast(
        res.data.activo ? 'Usuario activado' : 'Usuario desactivado',
        res.data.activo ? 'success' : 'warn'
      );
    } catch {
      addToast('No se pudo cambiar el estado del usuario', 'error');
    }
  };

  const SortTh = ({ field, children }) => (
    <th
      onClick={() => toggleSort(field)}
      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide
        cursor-pointer select-none hover:text-gray-800 transition group"
    >
      <span className="flex items-center gap-1">
        {children}
        <ArrowUpDown
          size={12}
          className={`opacity-0 group-hover:opacity-100 transition
            ${sortField === field ? 'opacity-100 text-indigo-500' : ''}`}
        />
      </span>
    </th>
  );

  const stats = {
    total:        users.length,
    activos:      users.filter((u) => u.activo).length,
    profesionales: users.filter((u) => u.role === 'profesional').length,
    admins:       users.filter((u) => u.role === 'admin').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast toasts={toasts} remove={removeToast} />
      {editUser   && <EditModal   user={editUser}   onClose={() => setEditUser(null)}   onSave={handleSave} />}
      {deleteUser && <DeleteModal user={deleteUser} onClose={() => setDeleteUser(null)} onConfirm={handleDelete} />}

      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
            >
              <ChevronLeft size={16} />
              Volver al panel
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800">Gestión de usuarios</h1>
              <p className="text-xs text-gray-500">{stats.total} usuarios registrados</p>
            </div>
          </div>
          <button
            onClick={loadUsers}
            className="ml-auto flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Recargar
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total',        value: stats.total,        color: 'indigo' },
            { label: 'Activos',      value: stats.activos,      color: 'emerald' },
            { label: 'Profesionales', value: stats.profesionales, color: 'blue' },
            { label: 'Admins',       value: stats.admins,       color: 'amber' },
          ].map((s) => (
            <div key={s.label}
              className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
              <span className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</span>
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3
          flex flex-wrap gap-3 items-center">

          {/* Búsqueda */}
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg
                bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filtro rol */}
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50
                focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="todos">Todos los roles</option>
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </div>

          {/* Filtro estado */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50
              focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>

          {/* Badge de resultados */}
          <span className="ml-auto text-xs text-gray-400">
            {displayed.length} resultado{displayed.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-gray-400 gap-3">
              <RefreshCw size={20} className="animate-spin" />
              <span className="text-sm">Cargando usuarios…</span>
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-2">
              <Users size={36} className="opacity-30" />
              <p className="text-sm">No se encontraron usuarios con los filtros actuales</p>
              <button
                onClick={() => { setSearch(''); setFilterRole('todos'); setFilterStatus('todos'); }}
                className="text-xs text-indigo-500 hover:underline mt-1"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <SortTh field="nombre">Usuario</SortTh>
                    <SortTh field="email">Email</SortTh>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Teléfono
                    </th>
                    <SortTh field="role">Rol</SortTh>
                    <SortTh field="activo">Estado</SortTh>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {displayed.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/60 transition group">

                      {/* Usuario */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center
                            text-indigo-600 font-semibold text-xs flex-shrink-0">
                            {(u.nombre || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 leading-tight">{u.nombre}</p>
                            {u.especialidad && (
                              <p className="text-xs text-gray-400">{u.especialidad}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>

                      {/* Teléfono */}
                      <td className="px-4 py-3 text-gray-500">
                        {u.telefono || <span className="text-gray-300">—</span>}
                      </td>

                      {/* Rol */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                          ${ROLE_STYLE[u.role] || 'bg-gray-100 text-gray-600'}`}>
                          {ROLE_ICON[u.role]}
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(u)}
                          title={u.activo ? 'Desactivar usuario' : 'Activar usuario'}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                            border transition hover:opacity-80
                            ${u.activo
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-600 border-red-200'}`}
                        >
                          {u.activo
                            ? <><UserCheck size={12} /> Activo</>
                            : <><UserX     size={12} /> Inactivo</>}
                        </button>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => setEditUser(u)}
                            title="Editar usuario"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteUser(u)}
                            title="Eliminar usuario"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center">
          Los cambios de estado (activar / desactivar) se aplican de forma inmediata sin necesidad de abrir el editor.
        </p>
      </div>
    </div>
  );
}