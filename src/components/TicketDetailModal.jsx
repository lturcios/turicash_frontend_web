import React, { useState, useEffect } from 'react';
import { X, Calendar, User, MapPin, CreditCard, Package, ShoppingCart, Download } from 'lucide-react';
import api from '../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const TicketDetailModal = ({ ticket, onClose }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/tickets/${ticket.id}/items`);
        setItems(res.data);
      } catch (err) {
        console.error(err);
        setError('Error al cargar los detalles del ticket');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [ticket]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Colores de TuriCash
    const primaryColor = [41, 98, 255]; // turi-blue-dark
    const greenColor = [34, 197, 94]; // turi-green-dark
    
    // ===== CABECERA =====
    // Fondo azul para la cabecera
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 45, 'F');
    
    // Logo/Nombre de la empresa (texto blanco)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('TuriCash', 20, 20);
    
    // Subtítulo
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestión de Ventas', 20, 28);
    
    // Información del ticket en la cabecera
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Ticket #${ticket.correlative_number}`, 20, 38);
    
    // Fecha en la esquina derecha
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const fecha = new Date(ticket.created_at_local);
    doc.text(`Fecha: ${fecha.toLocaleDateString()}`, 150, 25, { align: 'right' });
    doc.text(`Hora: ${fecha.toLocaleTimeString()}`, 150, 32, { align: 'right' });
    
    // ===== INFORMACIÓN DEL TICKET =====
    doc.setTextColor(0, 0, 0);
    let yPos = 55;
    
    // Título de sección
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Información del Ticket', 20, yPos);
    
    // Línea divisoria
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    yPos += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Información en dos columnas
    const leftCol = 20;
    const rightCol = 110;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Cajero:', leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(ticket.username, leftCol + 25, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Ubicación:', rightCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(ticket.location_name, rightCol + 25, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Tipo de Pago:', leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(ticket.payment_type, leftCol + 25, yPos);
    
    yPos += 15;
    
    // ===== ITEMS =====
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Detalle de Items', 20, yPos);
    
    // Línea divisoria
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    yPos += 8;
    
    // Tabla de items
    const tableData = items.map(item => [
      item.quantity.toString(),
      item.item_name,
      `$${parseFloat(item.unit_price).toFixed(2)}`,
      `$${(item.quantity * item.unit_price).toFixed(2)}`
    ]);
    
    const tableResult = autoTable(doc, {
      startY: yPos,
      head: [['Cant.', 'Descripción', 'P. Unit.', 'Subtotal']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 90 },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' }
      },
      margin: { left: 20, right: 20 },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      }
    });
    
    // ===== TOTAL =====
    // Obtener la posición Y final de la tabla
    const finalY = doc.lastAutoTable?.finalY || doc.previousAutoTable?.finalY || yPos + 50;
    
    // Recuadro verde para el total
    doc.setFillColor(greenColor[0], greenColor[1], greenColor[2]);
    doc.rect(130, finalY, 60, 15, 'F');
    
    // Texto del total
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 135, finalY + 6);
    doc.setFontSize(14);
    doc.text(`$${parseFloat(ticket.total_amount).toFixed(2)}`, 185, finalY + 10, { align: 'right' });
    
    // ===== PIE DE PÁGINA =====
    const pageHeight = doc.internal.pageSize.height;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Gracias por su compra', 105, pageHeight - 15, { align: 'center' });
    doc.text(`Generado el ${new Date().toLocaleString()}`, 105, pageHeight - 10, { align: 'center' });
    
    // Guardar el PDF
    doc.save(`Ticket_${ticket.correlative_number}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-turi-blue-dark to-turi-blue-light p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold mb-1">
                Ticket #{ticket.correlative_number}
              </h3>
              <p className="text-sm opacity-90">Detalle de venta</p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handleExportPDF}
                disabled={loading || error}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg px-3 py-2 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Exportar a PDF"
              >
                <Download size={20} />
                <span className="text-sm font-medium hidden sm:inline">PDF</span>
              </button>
              <button 
                onClick={onClose} 
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Información del Ticket */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar size={20} className="text-turi-blue-dark" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Fecha</p>
                <p className="text-sm font-semibold text-gray-800">
                  {new Date(ticket.created_at_local).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-600">
                  {new Date(ticket.created_at_local).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <User size={20} className="text-turi-green-dark" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Cajero</p>
                <p className="text-sm font-semibold text-gray-800">{ticket.username}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <MapPin size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Ubicación</p>
                <p className="text-sm font-semibold text-gray-800">{ticket.location_name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <CreditCard size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Tipo de Pago</p>
                <p className="text-sm font-semibold text-gray-800">{ticket.payment_type}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Vendidos */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center mb-4">
            <ShoppingCart className="text-turi-blue-dark mr-2" size={20} />
            <h4 className="text-lg font-semibold text-gray-800">Items Vendidos</h4>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-turi-blue-dark mb-2"></div>
              <p className="text-gray-500">Cargando detalles...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Package size={48} className="mx-auto mb-2 text-gray-300" />
              <p>No hay items en este ticket</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="bg-turi-blue-dark text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                          {item.quantity}
                        </span>
                        <h5 className="font-semibold text-gray-800">{item.item_name}</h5>
                      </div>
                      <p className="text-sm text-gray-500 ml-8">
                        ${parseFloat(item.unit_price).toFixed(2)} c/u
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                      <p className="text-lg font-bold text-turi-green-dark">
                        ${(item.quantity * item.unit_price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con Total */}
        <div className="bg-gradient-to-r from-turi-green-dark to-turi-green-light p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Pagado</p>
              <p className="text-xs opacity-75">{items.length} item(s)</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">
                ${parseFloat(ticket.total_amount).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;