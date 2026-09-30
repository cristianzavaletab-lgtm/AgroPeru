import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCSV } from '../../utils/exportUtils';
import { PackageCheck, Edit, Save, AlertTriangle, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';

export const BagInventory: React.FC = () => {
  const { emptyBags, updateBagStock } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInc, setEditInc] = useState<number>(0);
  const [editOut, setEditOut] = useState<number>(0);

  // Pagination State (Default 15 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'ALL'>(15);

  const handleSave = (id: string) => {
    updateBagStock(id, editInc, editOut);
    setEditingId(null);
  };

  const totalSaldoFinal = emptyBags.reduce((acc, b) => acc + b.saldoFinal, 0);

  const totalPages = itemsPerPage === 'ALL' 
    ? 1 
    : Math.ceil(emptyBags.length / (itemsPerPage as number)) || 1;

  const paginatedBags = itemsPerPage === 'ALL'
    ? emptyBags
    : emptyBags.slice((currentPage - 1) * (itemsPerPage as number), currentPage * (itemsPerPage as number));

  const handleExportBags = () => {
    const data = emptyBags.map(b => ({
      'Saco Vacío (BLS)': b.bagName,
      'Venta (Bolsas)': b.ventas,
      'Preparado Salida (Bolsas)': b.preparadoSalida,
      'Ingreso Compra (Bolsas)': b.ingresoCompra,
      'Saldo Final (Bolsas)': b.saldoFinal,
      'Stock Mínimo': b.minStock
    }));
    exportToCSV(data, 'Inventario_Bolsas_Vacias_AgroPeru');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-600" />
            <span>Bolsas Vacías</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-1">
            Control de sacos vacíos de empaque por compras, mezclas y saldo final.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportBags}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">Total Sacos Vacíos:</span>
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-mono">{totalSaldoFinal.toLocaleString('es-PE')} u</span>
          </div>
        </div>
      </div>

      {/* BLS Matrix Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/75 text-slate-600 dark:text-slate-300 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">BLS (Saco Vacío)</th>
                <th className="px-4 py-3.5 text-right">Venta</th>
                <th className="px-4 py-3.5 text-right">Preparado Salida</th>
                <th className="px-4 py-3.5 text-right">Ingreso (Compra)</th>
                <th className="px-4 py-3.5 text-right font-bold text-xs">Saldo Final</th>
                <th className="px-4 py-3.5 text-right">Ajuste Manual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {paginatedBags.map(bag => {
                const isLow = bag.saldoFinal <= bag.minStock;

                return (
                  <tr key={bag.id} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${isLow ? 'bg-amber-500/5 dark:bg-amber-500/10' : ''}`}>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white uppercase flex items-center gap-2">
                      <span>{bag.bagName}</span>
                      {isLow && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                          Stock Mínimo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-rose-600 dark:text-rose-400 font-mono">{bag.ventas} u</td>
                    <td className="px-4 py-3 text-right font-medium text-amber-600 dark:text-amber-400 font-mono">{bag.preparadoSalida} u</td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600 dark:text-emerald-400 font-mono">{bag.ingresoCompra} u</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white text-xs font-mono">{bag.saldoFinal.toLocaleString('es-PE')} u</td>
                    <td className="px-4 py-3 text-right">
                      {editingId === bag.id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <input
                            type="number"
                            placeholder="+Ent"
                            className="w-16 px-2 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-right text-xs font-medium text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            onChange={(e) => setEditInc(parseInt(e.target.value) || 0)}
                          />
                          <input
                            type="number"
                            placeholder="-Sal"
                            className="w-16 px-2 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-right text-xs font-medium text-rose-600 dark:text-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                            onChange={(e) => setEditOut(parseInt(e.target.value) || 0)}
                          />
                          <button
                            onClick={() => handleSave(bag.id)}
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer transition-colors"
                            title="Guardar Ajuste"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingId(bag.id); setEditInc(0); setEditOut(0); }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors cursor-pointer"
                        >
                          Ajustar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Mostrar por página:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value);
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value={15}>15 sacos</option>
              <option value={30}>30 sacos</option>
              <option value={50}>50 sacos</option>
              <option value="ALL">Todos los sacos</option>
            </select>
            <span className="text-slate-400 dark:text-slate-500">
              (Mostrando {paginatedBags.length} de {emptyBags.length} tipos de bolsas)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || itemsPerPage === 'ALL'}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-900 dark:text-white">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || itemsPerPage === 'ALL'}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
