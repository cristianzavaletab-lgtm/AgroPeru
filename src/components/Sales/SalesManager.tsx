import React, { useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, SaleItem, SaleStatus } from '../../types';
import { QuickProductModal } from '../Products/QuickProductModal';
import { exportToCSV } from '../../utils/exportUtils';
import { Receipt, Plus, Printer, UserPlus, Trash2, Ban, PlusCircle, Search, Filter, ChevronLeft, ChevronRight, FileSpreadsheet, X, CheckCircle2, RefreshCw } from 'lucide-react';

export const SalesManager: React.FC = () => {
  const { sales, products, lots, customers, addSale, anularSale, deleteSale, updateSaleStatus, addCustomer } = useApp();
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showQuickProductModal, setShowQuickProductModal] = useState(false);
  const [viewingSale, setViewingSale] = useState<any>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'info' }>({ visible: false, message: '', type: 'success' });
  const [openStatusMenuId, setOpenStatusMenuId] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }, []);

  const handleChangeStatus = (saleId: string, newStatus: SaleStatus, oldStatus: SaleStatus) => {
    setOpenStatusMenuId(null);
    updateSaleStatus(saleId, newStatus);
    if (newStatus === 'PAGADO' && oldStatus === 'CREDITO') {
      showToast('✅ ¡Deuda cobrada exitosamente!');
    } else if (newStatus === 'PAGADO') {
      showToast('✅ Venta marcada como Pagada');
    } else if (newStatus === 'CREDITO') {
      showToast('🔄 Venta movida a Crédito (Por Cobrar)', 'info');
    } else if (newStatus === 'PENDIENTE') {
      showToast('🕐 Venta marcada como Pendiente', 'info');
    } else if (newStatus === 'ENTREGADO') {
      showToast('📦 Venta marcada como Entregada', 'info');
    }
  };

  // Pagination State (Default 15 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'ALL'>(15);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form New Sale
  const [proformaNumber, setProformaNumber] = useState(`6${Math.floor(200 + Math.random() * 800)}`);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [status, setStatus] = useState<SaleStatus>('PAGADO');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<SaleItem[]>([
    { productId: products[0]?.id || '', productName: products[0]?.name || '', lotNumber: '', quantity: 10, unitPrice: (products[0]?.salePricePen || 2200) / 20, total: 10 * ((products[0]?.salePricePen || 2200) / 20) }
  ]);

  // Form New Customer
  const [newCustName, setNewCustName] = useState('');
  const [newCustDoc, setNewCustDoc] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustLocation, setNewCustLocation] = useState('');
  const [newCustCrop, setNewCustCrop] = useState('Papa');

  const totalSaleAmount = items.reduce((acc, i) => acc + i.total, 0);

  const filteredSales = sales.filter(s => {
    const matchesSearch = s.proformaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = itemsPerPage === 'ALL' 
    ? 1 
    : Math.ceil(filteredSales.length / (itemsPerPage as number)) || 1;

  const paginatedSales = itemsPerPage === 'ALL'
    ? filteredSales
    : filteredSales.slice((currentPage - 1) * (itemsPerPage as number), currentPage * (itemsPerPage as number));

  const handleAddItem = () => {
    const prod = products[0];
    if (!prod) return;
    const price = prod.salePricePen / 20; // default per bag
    setItems(prev => [...prev, {
      productId: prod.id,
      productName: prod.name,
      lotNumber: '',
      quantity: 10,
      unitPrice: price,
      total: 10 * price
    }]);
  };

  const handleItemChange = (index: number, field: keyof SaleItem, value: any) => {
    setItems(prev => prev.map((item, idx) => {
      if (idx === index) {
        const updated = { ...item, [field]: value };
        if (field === 'productId') {
          const p = products.find(prod => prod.id === value);
          if (p) {
            updated.productName = p.name;
            updated.lotNumber = '';
            updated.unitPrice = p.salePricePen / 20;
          }
        }
        if (field === 'lotNumber' && value) {
          const chosenLot = lots.find(l => l.productId === item.productId && l.lotNumber === value);
          if (chosenLot && chosenLot.salePricePen > 0) {
            updated.unitPrice = Math.round(chosenLot.salePricePen / 20);
          }
        }
        if (field === 'quantity' || field === 'unitPrice' || field === 'productId' || field === 'lotNumber') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleQuickProductCreated = (newProd: Product) => {
    const priceBag = newProd.salePricePen / 20;
    setItems(prev => [...prev, {
      productId: newProd.id,
      productName: newProd.name,
      quantity: 10,
      unitPrice: priceBag,
      total: 10 * priceBag
    }]);
  };

  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === selectedCustomerId);

    const success = addSale({
      proformaNumber,
      saleDate: new Date().toISOString().split('T')[0],
      customerId: selectedCustomerId,
      customerName: cust ? `${cust.name} ${cust.lastName || ''}`.trim() : 'Cliente Particular',
      status,
      totalAmount: totalSaleAmount,
      paidAmount: status === 'PAGADO' ? totalSaleAmount : 0,
      items,
      notes
    });

    if (success) {
      setShowNewSaleModal(false);
      setProformaNumber(`6${Math.floor(200 + Math.random() * 800)}`);
    }
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName) return;

    addCustomer({
      name: newCustName,
      docType: 'DNI',
      docNumber: newCustDoc || `${Math.floor(10000000 + Math.random() * 90000000)}`,
      phone: newCustPhone,
      location: newCustLocation,
      cropType: newCustCrop,
      creditLimit: 25000
    });

    setShowCustomerModal(false);
  };

  const handleExportSales = () => {
    const data = filteredSales.map(s => ({
      'Proforma N°': s.proformaNumber,
      'Fecha': s.saleDate,
      'Cliente': s.customerName,
      'Estado': s.status,
      'Monto Total (S/)': s.totalAmount.toFixed(2),
      'Monto Pagado (S/)': s.paidAmount.toFixed(2),
      'Items': s.items.map(i => `${i.productName} (Lote: ${i.lotNumber || '001'}) x ${i.quantity} u @ S/${i.unitPrice}`).join('; ')
    }));
    exportToCSV(data, 'Ventas_Proformas_AgroPeru');
  };

  return (
    <div className="space-y-6" onClick={() => openStatusMenuId && setOpenStatusMenuId(null)}>

      {/* Toast Notification */}
      <div
        className={`fixed top-5 right-5 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border transition-all duration-500 ${
          toast.visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
        } ${
          toast.type === 'success'
            ? 'bg-emerald-600 border-emerald-500 text-white'
            : 'bg-blue-600 border-blue-500 text-white'
        }`}
        style={{ maxWidth: 320 }}
      >
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        <span className="text-sm font-semibold">{toast.message}</span>
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            <span>Ventas</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registro de ventas, proformas y control de stock.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={handleExportSales}
            className="px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>
          <button
            onClick={() => setShowCustomerModal(true)}
            className="px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span>Nuevo Cliente</span>
          </button>
          <button
            onClick={() => setShowNewSaleModal(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Venta</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-lg shadow-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="PAGADO">PAGADO</option>
            <option value="CREDITO">CRÉDITO</option>
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="ENTREGADO">ENTREGADO</option>
            <option value="ANULADO">ANULADO</option>
          </select>
        </div>
      </div>

      {/* Sales List Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Proforma N.º</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Total Soles</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                    No hay ventas registradas. Usa "Nueva Venta" para crear la primera.
                  </td>
                </tr>
              ) : (
                paginatedSales.map(s => (
                  <tr key={s.id} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${s.status === 'ANULADO' ? 'opacity-60 bg-rose-50/30 dark:bg-rose-950/20' : ''}`}>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-slate-100">#{s.proformaNumber}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{s.saleDate}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{s.customerName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                        s.status === 'PAGADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' :
                        s.status === 'CREDITO' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' :
                        s.status === 'ANULADO' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800' :
                        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100 font-mono text-xs">S/ {s.totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right space-x-1.5">
                      {/* Flexible Status Changer */}
                      {s.status !== 'ANULADO' && (
                        <div className="relative inline-block">
                          {s.status === 'CREDITO' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleChangeStatus(s.id, 'PAGADO', s.status); }}
                              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold cursor-pointer shadow-xs transition-colors mr-1"
                            >
                              Cobrar Deuda
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenStatusMenuId(openStatusMenuId === s.id ? null : s.id); }}
                            className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                            title="Cambiar Estado"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          {openStatusMenuId === s.id && (
                            <div
                              className="absolute right-0 mt-1 w-44 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-50 py-1 overflow-hidden"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">Cambiar a...</div>
                              {(['PAGADO', 'CREDITO', 'PENDIENTE', 'ENTREGADO'] as SaleStatus[]).filter(st => st !== s.status).map(st => (
                                <button
                                  key={st}
                                  onClick={() => handleChangeStatus(s.id, st, s.status)}
                                  className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors flex items-center gap-2 ${
                                    st === 'PAGADO' ? 'text-emerald-700 dark:text-emerald-400' :
                                    st === 'CREDITO' ? 'text-amber-700 dark:text-amber-400' :
                                    st === 'PENDIENTE' ? 'text-blue-700 dark:text-blue-400' :
                                    'text-purple-700 dark:text-purple-400'
                                  }`}
                                >
                                  <span className={`w-2 h-2 rounded-full ${
                                    st === 'PAGADO' ? 'bg-emerald-500' :
                                    st === 'CREDITO' ? 'bg-amber-500' :
                                    st === 'PENDIENTE' ? 'bg-blue-500' :
                                    'bg-purple-500'
                                  }`} />
                                  {st === 'PAGADO' ? 'Pagado' : st === 'CREDITO' ? 'Crédito' : st === 'PENDIENTE' ? 'Pendiente' : 'Entregado'}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {s.status !== 'ANULADO' && (
                        <button
                          onClick={() => anularSale(s.id)}
                          className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-400 transition-colors cursor-pointer border border-amber-200 dark:border-amber-800"
                          title="Anular Venta (Devuelve el stock al inventario)"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteSale(s.id)}
                        className="p-1.5 rounded-md bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-400 transition-colors cursor-pointer border border-rose-200 dark:border-rose-800"
                        title="Eliminar Registro de Venta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setViewingSale(s)}
                        className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                        title="Imprimir / Ver Detalle"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer (Max 15 per page) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Mostrar por página:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value);
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value={15}>15 ventas</option>
              <option value={30}>30 ventas</option>
              <option value={50}>50 ventas</option>
              <option value="ALL">Todas las ventas</option>
            </select>
            <span className="text-slate-400">
              (Mostrando {paginatedSales.length} de {filteredSales.length} ventas)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || itemsPerPage === 'ALL'}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || itemsPerPage === 'ALL'}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* New Sale Modal */}
      {showNewSaleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Nueva Venta</h3>
              <button
                type="button"
                onClick={() => setShowQuickProductModal(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Crear Producto</span>
              </button>
            </div>

            <form onSubmit={handleSaveSale} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Proforma N.º</label>
                  <input
                    type="text"
                    required
                    value={proformaNumber}
                    onChange={(e) => setProformaNumber(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Cliente</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {customers.length === 0 ? (
                      <option value="">Cliente Mostrador / Varios</option>
                    ) : (
                      customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.lastName || ''} ({c.docNumber})</option>)
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Forma de Pago</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="PAGADO">PAGADO (Efectivo/Yape/BCP)</option>
                    <option value="CREDITO">CRÉDITO (Por Cobrar)</option>
                    <option value="PENDIENTE">PENDIENTE DE ENTREGA</option>
                  </select>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 border-t border-b border-slate-100 dark:border-slate-800 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Productos</span>
                  <button type="button" onClick={handleAddItem} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer">
                    + Agregar Fila
                  </button>
                </div>

                {items.map((item, idx) => {
                  const availableLots = lots.filter(l => l.productId === item.productId && l.status === 'DISPONIBLE');

                  return (
                    <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-4">
                          <label className="text-[10px] font-medium text-slate-500 block mb-0.5">Producto</label>
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentBags} b)</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-3">
                          <label className="text-[10px] font-medium text-slate-500 block mb-0.5">Lote a Descontar</label>
                          <select
                            value={item.lotNumber || ''}
                            onChange={(e) => handleItemChange(idx, 'lotNumber', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono font-medium"
                          >
                            <option value="">Automático (FIFO)</option>
                            {availableLots.map(l => (
                              <option key={l.id} value={l.lotNumber}>
                                Lote {l.lotNumber} ({l.currentBags} bolsas)
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-medium text-slate-500 block mb-0.5">Bolsas</label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Cant."
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold text-right"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-medium text-slate-500 block mb-0.5">S/ x Bolsa</label>
                          <input
                            type="number"
                            step="0.5"
                            placeholder="Precio"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs text-right font-mono font-medium"
                          />
                        </div>
                        <div className="col-span-1 text-center pt-4">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Eliminar fila"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-mono pr-2">
                        <span className="text-slate-400">
                          {item.quantity} bolsas = {(() => { const p = products.find(pr => pr.id === item.productId); return ((item.quantity * (p?.bagWeightKg || 50)) / 1000).toFixed(3); })()} TM
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Subtotal: S/ {item.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">TOTAL:</span>
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">S/ {totalSaleAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewSaleModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  Guardar Venta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Product Modal */}
      <QuickProductModal
        isOpen={showQuickProductModal}
        onClose={() => setShowQuickProductModal(false)}
        onProductCreated={handleQuickProductCreated}
        initialType="sale"
      />
    </div>
  );
};
