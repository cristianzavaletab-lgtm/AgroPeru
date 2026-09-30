import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';
import { 
  Users, UserPlus, Search, Phone, MapPin, Sprout, 
  Calendar, ShieldAlert, CreditCard, Edit, Trash2, FileText, CheckCircle2, ChevronRight, ChevronLeft, Filter, FileSpreadsheet, X
} from 'lucide-react';

export const CustomerCRM: React.FC = () => {
  const { customers, sales, addCustomer, updateCustomer, deleteCustomer } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [cropFilter, setCropFilter] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Pagination State (Default 15 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'ALL'>(15);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    lastName: string;
    docType: Customer['docType'];
    docNumber: string;
    phone: string;
    address: string;
    location: string;
    cropType: string;
    hectares: number;
    soilRiegoType: string;
    nextApplicationDate: string;
    notes: string;
    creditLimit: number;
  }>({
    name: '',
    lastName: '',
    docType: 'DNI',
    docNumber: '',
    phone: '',
    address: '',
    location: '',
    cropType: 'Maíz',
    hectares: 10,
    soilRiegoType: 'Riego por Gravedad',
    nextApplicationDate: new Date().toISOString().split('T')[0],
    notes: '',
    creditLimit: 25000
  });

  const cropTypes = Array.from(new Set(customers.map(c => c.cropType).filter(Boolean)));

  const filteredCustomers = customers.filter(c => {
    const fullName = `${c.name} ${c.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                          c.docNumber.includes(searchTerm) ||
                          (c.location && c.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCrop = cropFilter === 'ALL' || c.cropType === cropFilter;
    return matchesSearch && matchesCrop;
  });

  const totalPages = itemsPerPage === 'ALL' 
    ? 1 
    : Math.ceil(filteredCustomers.length / (itemsPerPage as number)) || 1;

  const paginatedCustomers = itemsPerPage === 'ALL'
    ? filteredCustomers
    : filteredCustomers.slice((currentPage - 1) * (itemsPerPage as number), currentPage * (itemsPerPage as number));

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      lastName: '',
      docType: 'DNI',
      docNumber: '',
      phone: '',
      address: '',
      location: 'Huancayo / Valle Mantaro',
      cropType: 'Maíz',
      hectares: 10,
      soilRiegoType: 'Riego por Gravedad',
      nextApplicationDate: new Date().toISOString().split('T')[0],
      notes: '',
      creditLimit: 25000
    });
    setShowModal(true);
  };

  const handleOpenEdit = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name,
      lastName: cust.lastName || '',
      docType: cust.docType,
      docNumber: cust.docNumber,
      phone: cust.phone,
      address: cust.address || '',
      location: cust.location || '',
      cropType: cust.cropType || 'Maíz',
      hectares: cust.hectares || 10,
      soilRiegoType: cust.soilRiegoType || '',
      nextApplicationDate: cust.nextApplicationDate || '',
      notes: cust.notes || '',
      creditLimit: cust.creditLimit
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
    } else {
      addCustomer(formData);
    }
    setShowModal(false);
  };

  const handleExportCustomers = () => {
    const data = filteredCustomers.map(c => ({
      'Cliente': `${c.name} ${c.lastName || ''}`.trim(),
      'Tipo Doc.': c.docType,
      'N° Doc.': c.docNumber,
      'Teléfono': c.phone || '-',
      'Fundo / Lugar': c.location || '-',
      'Cultivo': c.cropType || '-',
      'Hectáreas': c.hectares || 0,
      'Tipo Riego': c.soilRiegoType || '-',
      'Próxima Aplicación': c.nextApplicationDate || '-',
      'Deuda Pendiente (S/)': c.currentDebt.toFixed(2),
      'Límite Crédito (S/)': c.creditLimit.toFixed(2)
    }));
    exportToCSV(data, 'Clientes_CRM_AgroPeru');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            <span>Clientes</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestión de clientes, ubicación de fundos y fechas de fertilización.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCustomers}
            className="px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Nombre, DNI/RUC, Lugar o Fundo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-lg shadow-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todos los Cultivos</option>
            {cropTypes.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full p-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">No hay clientes registrados</div>
            <p className="text-xs text-slate-500">Presiona "Nuevo Cliente" para agregar tu primer agricultor.</p>
          </div>
        ) : (
          paginatedCustomers.map(cust => {
            const custSales = sales.filter(s => s.customerId === cust.id);
            const hasDebt = cust.currentDebt > 0;

            return (
              <div key={cust.id} className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Header card */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-200 dark:border-emerald-800">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                          {cust.name} {cust.lastName || ''}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                            {cust.docType}: {cust.docNumber}
                          </span>
                          {cust.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" /> {cust.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(cust)}
                        className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                        title="Editar Ficha"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCustomer(cust.id)}
                        className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 text-slate-400 transition-colors cursor-pointer"
                        title="Eliminar Cliente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Agricultural Badge */}
                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Sprout className="w-3.5 h-3.5 text-emerald-600" /> Cultivo:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{cust.cropType || 'Maíz'}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> Lugar / Fundo:
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{cust.location || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Hectáreas & Riego:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{cust.hectares || 0} Ha ({cust.soilRiegoType || 'Convencional'})</span>
                    </div>

                    {cust.nextApplicationDate && (
                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-500" /> Próx. Abonado:
                        </span>
                        <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">{cust.nextApplicationDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Debt & Financial Foot */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Deuda Pendiente</span>
                    <span className={`text-sm font-bold font-mono ${hasDebt ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      S/ {cust.currentDebt.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedCustomer(cust)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Historial ({custSales.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer for Customer Cards */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
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
            <option value={15}>15 clientes</option>
            <option value={30}>30 clientes</option>
            <option value={50}>50 clientes</option>
            <option value="ALL">Todos los clientes</option>
          </select>
          <span className="text-slate-400">
            (Mostrando {paginatedCustomers.length} de {filteredCustomers.length} clientes)
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

      {/* Customer Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {editingCustomer ? 'Editar Ficha Agricultor' : 'Registrar Nuevo Agricultor / Cliente'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Nombres / Razón Social *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan o Agrícola del Valle"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Apellidos</label>
                  <input
                    type="text"
                    placeholder="Ej. Quispe Morales"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Tipo Documento</label>
                  <select
                    value={formData.docType}
                    onChange={(e) => setFormData({ ...formData, docType: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium"
                  >
                    <option value="DNI">DNI</option>
                    <option value="RUC">RUC</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Número Documento</label>
                  <input
                    type="text"
                    placeholder="Ej. 41829304"
                    value={formData.docNumber}
                    onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Teléfono / Celular</label>
                  <input
                    type="text"
                    placeholder="Ej. 984512039"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Agronomic Section */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sprout className="w-4 h-4 text-emerald-600" /> Datos de Ficha Agrícola & Cultivo
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Lugar / Fundo / Distrito</label>
                    <input
                      type="text"
                      placeholder="Ej: Huancayo / Jauja"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Tipo de Cultivo</label>
                    <input
                      type="text"
                      placeholder="Ej: Maíz Blanco, Papa, Arroz"
                      value={formData.cropType}
                      onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Hectáreas (Ha)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.hectares}
                      onChange={(e) => setFormData({ ...formData, hectares: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Tipo de Suelo / Riego</label>
                    <input
                      type="text"
                      placeholder="Ej: Riego por Goteo / Gravedad"
                      value={formData.soilRiegoType}
                      onChange={(e) => setFormData({ ...formData, soilRiegoType: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Próxima Fecha de Aplicación</label>
                    <input
                      type="date"
                      value={formData.nextApplicationDate}
                      onChange={(e) => setFormData({ ...formData, nextApplicationDate: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  Guardar Ficha Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
