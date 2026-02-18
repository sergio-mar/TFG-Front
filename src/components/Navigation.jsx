import React from 'react';
import { Home, User, Briefcase, Shield, Settings, LogOut, BarChart3, Calendar } from 'lucide-react';

const Navigation = ({ currentUser, view, setView, onLogout }) => {
  const navButton = (label, icon, targetView) => (
    <button
      onClick={() => setView(targetView)}
      className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
        view === targetView ? 'bg-indigo-700' : 'hover:bg-indigo-500'
      }`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <Home size={24} />
            <span className="text-xl font-bold">Servicios a Demanda</span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              {currentUser.role === 'cliente' && <User size={20} />}
              {currentUser.role === 'profesional' && <Briefcase size={20} />}
              {currentUser.role === 'admin' && <Shield size={20} />}
              <span className="font-medium">{currentUser.nombre}</span>
            </div>

            <div className="flex space-x-2">
              {currentUser.role === 'admin' &&
                navButton('', <BarChart3 size={20} />, 'dashboard')}

              {navButton('Servicios', null, 'services')}

              {currentUser.role === 'profesional' &&
                navButton('Mis Servicios', null, 'myservices')}

              {navButton('', <Calendar size={20} />, 'bookings')}

              {navButton('', <Settings size={20} />, 'profile')}

              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition flex items-center gap-2"
              >
                <LogOut size={20} />
                <span className="hidden md:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
