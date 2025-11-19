import React, { useState } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  MapPin, 
  Settings, 
  LogIn, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import ItemsPage from './pages/ItemsPage';
import UsersPage from './pages/UsersPage';
import LocationsPage from './pages/LocationsPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';

// --- Placeholder de Páginas ---
// --- Placeholder de Páginas (restantes) ---

// --- Placeholder de Login ---
const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Intenta hacer login real con el backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el login');
      }

      // Guardar el token real y datos del usuario
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin();
    } catch (err) {
      console.error('Error en login:', err);
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Login simulado para testing (sin backend)
  const handleSimulatedLogin = () => {
    const fakeToken = 'simulated-jwt-token-for-testing';
    localStorage.setItem('authToken', fakeToken);
    onLogin();
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-turi-blue-dark to-turi-blue-light">
      <div className="p-8 bg-white rounded-2xl shadow-2xl w-96">
        <div className="flex justify-center mb-6">
          <img 
            src="/src/assets/logo.png" 
            alt="TuriCash Logo" 
            className="w-32 h-32 object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-center text-turi-blue-dark mb-6">
          Panel de Administración
        </h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turi-blue-dark"
              placeholder="Ingresa tu usuario"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turi-blue-dark"
              placeholder="Ingresa tu PIN"
              required
              maxLength="8"
              pattern="^[a-zA-Z]+$"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-turi-blue-dark hover:bg-turi-blue-light text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* Botón de testing - comentar en producción */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/*
          <button
            onClick={handleSimulatedLogin}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white text-sm py-2 px-4 rounded-lg transition-colors"
          >
            Login Simulado (Testing)
          </button>
          */}
        </div>
      </div>
    </div>
  );
};

// --- Componente de Layout Principal ---
const MainLayout = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-turi-snow">
      {/* Sidebar (Menú lateral) */}
      <Sidebar onLogout={onLogout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Cabecera Móvil (botón de menú) */}
        <header className="md:hidden bg-white shadow-md p-4">
          <button onClick={() => setSidebarOpen(true)} className="text-turi-stone">
            <Menu size={24} />
          </button>
        </header>
        
        {/* Área de contenido con scroll */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// --- Componente Sidebar ---
const Sidebar = ({ onLogout, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Items', icon: Settings, path: '/items' },
    { name: 'Usuarios', icon: Users, path: '/users' },
    { name: 'Ubicaciones', icon: MapPin, path: '/locations' },
    { name: 'Historial', icon: Ticket, path: '/history' },
  ];

  const NavLink = ({ item }) => (
    <Link
      to={item.path}
      onClick={() => setSidebarOpen(false)}
      className={`
        flex items-center px-4 py-3 text-sm font-medium
        ${location.pathname === item.path
          ? 'bg-turi-blue-dark text-white'
          : 'text-gray-300 hover:bg-turi-blue-light hover:text-white'
        }
        transition-colors rounded-lg
      `}
    >
      <item.icon size={20} className="mr-3" />
      {item.name}
    </Link>
  );

  return (
    <>
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Contenido del Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-20
        flex flex-col w-64 h-full bg-turi-stone
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 transition-transform duration-300 ease-in-out
      `}>
        <div className="flex flex-col items-center p-4 border-b border-gray-700">
          <div className="flex items-center justify-between w-full mb-3">
            <div className="flex-1"></div>
            <button className="md:hidden text-gray-300" onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <img 
            src="/src/assets/logo.png" 
            alt="TuriCash Logo" 
            className="w-20 h-20 object-contain mb-2"
          />
          <h1 className="text-xl font-bold text-white">TuriCash</h1>
          <p className="text-xs text-gray-400">Panel Admin</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => <NavLink key={item.name} item={item} />)}
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-colors rounded-lg"
          >
            <LogOut size={20} className="mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
};


// --- Componente Principal de App (Manejo de Autenticación) ---
function App() {
  // Simulación de estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));

  // Simulación de login
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Simulación de logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <LoginPage onLogin={handleLogin} />
          ) : (
            <Navigate to="/" replace /> // Si ya está logueado, ir al dashboard
          )
        }
      />
      <Route
        path="/*" // Todas las demás rutas
        element={
          isAuthenticated ? (
            <MainLayout onLogout={handleLogout} /> // Rutas protegidas
          ) : (
            <Navigate to="/login" replace /> // Si no está logueado, ir al login
          )
        }
      />
    </Routes>
  );
}

export default App;