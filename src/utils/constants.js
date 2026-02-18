export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const USER_ROLES = {
  CLIENTE: 'cliente',
  PROFESIONAL: 'profesional',
  ADMIN: 'admin'
};

export const BOOKING_STATUS = {
  PENDIENTE: 'pendiente',
  ACEPTADO: 'aceptado',
  EN_CURSO: 'en curso',
  FINALIZADO: 'finalizado',
  CANCELADO: 'cancelado'
};

export const CATEGORIES = [
  'Todas',
  'Limpieza',
  'Reparaciones',
  'Jardinería',
  'Cuidado de Mascotas',
  'Mantenimiento'
];