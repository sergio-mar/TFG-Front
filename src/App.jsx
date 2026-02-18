import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Services from './components/Services';
import MyServices from './components/MyServices';
import CreateService from './components/CreateService';
import Bookings from './components/Bookings';
import Profile from './components/Profile';
import Register from './components/Register';
import * as api from './services/api';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    users: [],
    services: [],
    bookings: [],
    complaints: []
  });

  // ============================
  // Recuperar sesión al cargar
  // ============================
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      api.setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
      setView("services");
    }
  }, []);

  // ============================
  // Cargar datos al iniciar sesión
  // ============================
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  // ============================
  // Manejo de expiración del token
  // ============================
  const handleApiError = (error) => {
    if (error?.unauthorized) {
      handleLogout();
    }
  };

  // ============================
  // Cargar datos
  // ============================
  const loadData = async () => {
    try {
      setLoading(true);

      const [servicesRes, bookingsRes] = await Promise.all([
        api.getServices().catch(handleApiError),
        api.getBookings().catch(handleApiError)
      ]);

      let usersRes = { data: [] };
      if (currentUser?.role === 'admin') {
        usersRes = await api.getUsers().catch(handleApiError);
      }

      setData({
        users: usersRes?.data || [],
        services: servicesRes?.data || [],
        bookings: bookingsRes?.data || [],
        complaints: []
      });

    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // Login
  // ============================
  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.login(email, password);

      const user = {
        id: response.id,
        email: response.email,
        nombre: response.nombre,
        role: response.role
      };

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", response.token);
      api.setToken(response.token);

      setCurrentUser(user);
      setView(user.role === 'admin' ? 'dashboard' : 'services');

      return user;

    } catch (error) {
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // Logout
  // ============================
  const handleLogout = () => {
    api.logout();
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setCurrentUser(null);
    setView('login');
    setData({ users: [], services: [], bookings: [], complaints: [] });
  };

  // ============================
  // Render
  // ============================
  if (!currentUser) {
    if (view === "register") {
      return <Register setView={setView} />;
    }
    return <Login onLogin={handleLogin} setView={setView} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navegación siempre visible */}
      <Navigation 
        currentUser={currentUser} 
        view={view} 
        setView={setView} 
        onLogout={handleLogout} 
      />

      <div className="py-6">

        {/* Spinner solo para contenido, no para navegación */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {view === 'dashboard' && currentUser.role === 'admin' && (
              <Dashboard data={data} setData={setData} loadData={loadData} />
            )}

            {view === 'services' && (
              <Services data={data} setData={setData} currentUser={currentUser} loadData={loadData} />
            )}

            {view === 'myservices' && currentUser.role === 'profesional' && (
              <MyServices data={data} setData={setData} currentUser={currentUser} setView={setView} loadData={loadData} />
            )}

            {view === 'createservice' && currentUser.role === 'profesional' && (
              <CreateService data={data} setData={setData} currentUser={currentUser} setView={setView} loadData={loadData} />
            )}

            {view === 'bookings' && (
              <Bookings data={data} setData={setData} currentUser={currentUser} loadData={loadData} />
            )}

            {view === 'profile' && (
              <Profile data={data} setData={setData} currentUser={currentUser} setCurrentUser={setCurrentUser} loadData={loadData} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
