import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Search, Eye, Calendar, DollarSign, Receipt, TrendingUp } from 'lucide-react';
import TicketDetailModal from '../components/TicketDetailModal';

const HistoryPage = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  
  // Filtros
  const [filters, setFilters] = useState({
    date_from: new Date().toISOString().split('T')[0], // Hoy por defecto
    date_to: new Date().toISOString().split('T')[0],
    user_id: '',
    location_id: ''
  });

  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null); // Para el modal

  // Calcular totalizadores
  const totals = useMemo(() => {
    const totalAmount = tickets.reduce((sum, ticket) => sum + parseFloat(ticket.total_amount || 0), 0);
    const ticketCount = tickets.length;
    const averageTicket = ticketCount > 0 ? totalAmount / ticketCount : 0;
    
    return {
      totalAmount: totalAmount.toFixed(2),
      ticketCount,
      averageTicket: averageTicket.toFixed(2)
    };
  }, [tickets]);

  // Cargar listas desplegables al iniciar
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [uRes, lRes] = await Promise.all([
          api.get('/users'),
          api.get('/locations')
        ]);
        setUsers(uRes.data);
        setLocations(lRes.data);
        // Cargar tickets iniciales
        fetchTickets();
      } catch (err) {
        console.error("Error loading metadata:", err);
      }
    };
    loadMetadata();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      // Eliminar params vacíos
      Object.keys(filters).forEach(key => {
          if (!filters[key]) params.delete(key);
      });
      
      const response = await api.get(`/tickets?${params.toString()}`);
      setTickets(response.data);
    } catch (err) {
      console.error("Error loading tickets:", err);
      alert("Error al cargar historial.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-3xl font-bold text-turi-blue-dark mb-6">Historial de Cobros</h2>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center mb-4">
          <Calendar className="text-turi-blue-dark mr-2" size={24} />
          <h3 className="text-lg font-semibold text-gray-700">Filtros de Búsqueda</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
              <input
                type="date"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-turi-blue-light focus:border-turi-blue-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
              <input
                type="date"
                name="date_to"
                value={filters.date_to}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-turi-blue-light focus:border-turi-blue-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <select
                name="user_id"
                value={filters.user_id}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-2 focus:ring-turi-blue-light focus:border-turi-blue-light"
              >
                <option value="">Todos los usuarios</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
              <select
                name="location_id"
                value={filters.location_id}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-2 focus:ring-turi-blue-light focus:border-turi-blue-light"
              >
                <option value="">Todas las ubicaciones</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-turi-blue-dark hover:bg-turi-blue-light text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search size={20} className="mr-2" />
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>
      </div>

      {/* Tarjetas de Totalizadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-turi-green-dark to-turi-green-light rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Vendido</p>
              <p className="text-3xl font-bold">${totals.totalAmount}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <DollarSign size={32} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-turi-blue-dark to-turi-blue-light rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Tickets</p>
              <p className="text-3xl font-bold">{totals.ticketCount}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <Receipt size={32} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-400 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Ticket Promedio</p>
              <p className="text-3xl font-bold">${totals.averageTicket}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <TrendingUp size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          {loading ? (
            <div className="p-10 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-turi-blue-dark mb-2"></div>
              <p>Cargando tickets...</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Fecha y Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ticket #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Cajero</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.length === 0 && (
                   <tr>
                     <td colSpan="6" className="p-10 text-center text-gray-500">
                       <Receipt size={48} className="mx-auto mb-2 text-gray-300" />
                       <p className="text-lg">No se encontraron registros</p>
                       <p className="text-sm text-gray-400 mt-1">Intenta ajustar los filtros de búsqueda</p>
                     </td>
                   </tr>
                )}
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">{new Date(t.created_at_local).toLocaleDateString()}</span>
                        <span className="text-xs text-gray-500">{new Date(t.created_at_local).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-sm font-mono font-semibold bg-gray-100 text-gray-700 rounded-full">
                        #{t.correlative_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-turi-blue-100 flex items-center justify-center mr-2">
                          <span className="text-xs font-semibold text-turi-blue-dark">
                            {t.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {t.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t.location_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-lg font-bold text-turi-green-dark">
                        ${parseFloat(t.total_amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                          onClick={() => setSelectedTicket(t)}
                          className="inline-flex items-center px-3 py-2 bg-turi-blue-dark hover:bg-turi-blue-light text-white rounded-lg transition-colors"
                          title="Ver detalles"
                      >
                        <Eye size={18} className="mr-1" />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de Detalle */}
      {selectedTicket && (
        <TicketDetailModal 
            ticket={selectedTicket} 
            onClose={() => setSelectedTicket(null)} 
        />
      )}
    </div>
  );
};

export default HistoryPage;