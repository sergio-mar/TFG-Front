import React, { useState } from 'react';
import { Home } from 'lucide-react';

const Login = ({ onLogin, setView }) => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onLogin(loginData.email, loginData.password);
    } catch (err) {
      // Mensaje más claro y consistente
      const backendMessage = err?.response?.data?.message;
      setError(backendMessage || 'Credenciales incorrectas o usuario inactivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Servicios a Demanda</h1>
          <p className="text-gray-600">Inicia sesión para continuar</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

<div className="mt-6 text-center">
  <p className="text-sm text-gray-600">
    ¿No tienes cuenta?
    <button
      type="button"
      onClick={() => setView("register")}
      className="text-indigo-600 font-semibold ml-1 hover:underline"
    >
      Crear cuenta
    </button>
  </p>
</div>


      </div>
    </div>
  );
};

export default Login;
