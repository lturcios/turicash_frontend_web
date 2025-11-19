import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  MapPin, 
  Package,
  Clock,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [salesToday, setSalesToday] = useState(null);
  const [salesByPeriod, setSalesByPeriod] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [salesByLocation, setSalesByLocation] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('day');

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        salesTodayRes,
        salesByPeriodRes,
        topItemsRes,
        salesByLocationRes,
        recentActivityRes
      ] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/sales-today'),
        api.get(`/dashboard/sales-by-period?period=${period}&limit=7`),
        api.get('/dashboard/top-items?limit=5'),
        api.get('/dashboard/sales-by-location'),
        api.get('/dashboard/recent-activity?limit=5')
      ]);

      setStats(statsRes.data);
      setSalesToday(salesTodayRes.data);
      setSalesByPeriod(salesByPeriodRes.data);
      setTopItems(topItemsRes.data);
      setSalesByLocation(salesByLocationRes.data);
      setRecentActivity(recentActivityRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#2962ff', '#00e676', '#ff6d00', '#d500f9', '#00b0ff'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-turi-blue-dark mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-turi-blue-dark">Dashboard</h2>
          <p className="text-gray-600 mt-1">Resumen general del sistema</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center space-x-2 bg-turi-blue-dark hover:bg-turi-blue-light text-white px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw size={18} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Tarjetas de Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ventas Totales"
          value={`$${parseFloat(stats?.totalSales || 0).toFixed(2)}`}
          icon={<DollarSign size={24} />}
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="Total Tickets"
          value={stats?.totalTickets || 0}
          icon={<ShoppingCart size={24} />}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Ticket Promedio"
          value={`$${parseFloat(stats?.averageTicket || 0).toFixed(2)}`}
          icon={<TrendingUp size={24} />}
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Items Activos"
          value={stats?.totalItems || 0}
          icon={<Package size={24} />}
          color="from-orange-500 to-orange-600"
        />
      </div>

      {/* Ventas de Hoy */}
      {salesToday && (
        <div className="bg-gradient-to-r from-turi-blue-dark to-turi-blue-light rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center mb-4">
            <Clock size={24} className="mr-2" />
            <h3 className="text-xl font-semibold">Ventas de Hoy</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm opacity-90">Tickets</p>
              <p className="text-2xl font-bold">{salesToday.ticket_count}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Total Vendido</p>
              <p className="text-2xl font-bold">${parseFloat(salesToday.total_sales).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Promedio</p>
              <p className="text-2xl font-bold">${parseFloat(salesToday.avg_ticket).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Ticket Máximo</p>
              <p className="text-2xl font-bold">${parseFloat(salesToday.max_ticket).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas por Período */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Tendencia de Ventas</h3>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-turi-blue-light focus:border-turi-blue-light"
            >
              <option value="day">Últimos 7 días</option>
              <option value="week">Últimas 7 semanas</option>
              <option value="month">Últimos 7 meses</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesByPeriod}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total_sales" 
                stroke="#2962ff" 
                strokeWidth={2}
                name="Ventas ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Items */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Items Más Vendidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topItems} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="item_name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="total_quantity" fill="#00e676" name="Cantidad Vendida" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fila inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ventas por Ubicación */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ventas por Ubicación</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={salesByLocation}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ location_name, percent }) => `${location_name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="total_sales"
              >
                {salesByLocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {salesByLocation.map((loc, idx) => (
              <div key={loc.id} className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  ></div>
                  <span className="text-gray-700">{loc.location_name}</span>
                </div>
                <span className="font-semibold text-gray-900">${parseFloat(loc.total_sales).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            {recentActivity.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="bg-turi-blue-dark text-white rounded-full h-10 w-10 flex items-center justify-center font-bold">
                    {ticket.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Ticket #{ticket.correlative_number}</p>
                    <p className="text-sm text-gray-600">{ticket.full_name} - {ticket.location_name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(ticket.created_at_local).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-turi-green-dark">
                    ${parseFloat(ticket.total_amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">{ticket.payment_type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Estadísticas Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.totalUsers || 0}</p>
            </div>
            <Users size={32} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ubicaciones</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.totalLocations || 0}</p>
            </div>
            <MapPin size={32} className="text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Productos</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.totalItems || 0}</p>
            </div>
            <Package size={32} className="text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para las tarjetas de estadísticas
const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-lg shadow-lg p-6 text-white`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm opacity-90">{title}</p>
        <div className="bg-white bg-opacity-20 rounded-full p-2">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

export default DashboardPage;
