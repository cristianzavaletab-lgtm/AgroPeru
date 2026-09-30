import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdjustmentReason, PhysicalAuditItem } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';
import { ClipboardCheck, AlertTriangle, CheckCircle2, RefreshCcw, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';

export const PhysicalCountModal: React.FC = () => {
  const { products, reconcileAudit } = useApp();
  const [auditItems, setAuditItems] = useState<PhysicalAuditItem[]>(
    products.map(p => ({
      productId: p.id,
      productName: p.name,
      systemStockTm: p.currentStockTm,
      physicalCountTm: p.currentStockTm,
      differenceTm: 0,
      reason: 'error_conteo'
    }))
  );
  const [reconciledMsg, setReconciledMsg] = useState('');

  // Pagination State (Default 15 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'ALL'>(15);

  const handleCountChange = (productId: string, valStr: string) => {
    setAuditItems(prev => prev.map(item => {
      if (item.productId === productId) {
        if (valStr === '') {
          return {
            ...item,
            physicalCountTm: null,
            differenceTm: null
          };
        }
        const val = parseFloat(valStr);
        if (isNaN(val)) {
          return {
            ...item,
            physicalCountTm: null,
            differenceTm: null
          };
        }
        const diff = parseFloat((val - item.systemStockTm).toFixed(2));
        return {
          ...item,
          physicalCountTm: val,
          differenceTm: diff
        };
      }
      return item;
    }));
  };

  const handleReasonChange = (productId: string, reason: AdjustmentReason) => {
    setAuditItems(prev => prev.map(item => item.productId === productId ? { ...item, reason } : item));
  };

  const handleExport = () => {
    const exportData = auditItems.map(i => ({
      Producto: i.productName,
      'Stock Sistema (TM)': i.systemStockTm.toFixed(2),
      'Conteo Físico (TM)': i.physicalCountTm !== null && i.physicalCountTm !== undefined ? i.physicalCountTm.toFixed(2) : '-',
      'Diferencia TM': i.differenceTm !== null && i.differenceTm !== undefined ? i.differenceTm.toFixed(2) : '-',
      'Diferencia Bolsas': i.differenceTm !== null && i.differenceTm !== undefined ? Math.round(i.differenceTm * 20) : '-',
      'Motivo Ajuste': i.reason || 'N/A'
    }));
    exportToCSV(exportData, 'Audit_Conteo_Fisico_AgroPeru');
  };

  const handleReconcile = () => {
    const validItems = auditItems.filter(i => i.physicalCountTm !== null && i.physicalCountTm !== undefined);
    reconcileAudit(validItems);
    setReconciledMsg('Stock ajustado correctamente. El sistema ya refleja lo contado en almacén.');
    setTimeout(() => setReconciledMsg(''), 5000);
  };

  const discrepancyCount = auditItems.filter(i => i.differenceTm !== null && i.differenceTm !== undefined && Math.abs(i.differenceTm) > 0.001).length;

  const totalPages = itemsPerPage === 'ALL' 
    ? 1 
    : Math.ceil(auditItems.length / (itemsPerPage as number)) || 1;

  const paginatedAuditItems = itemsPerPage === 'ALL'
    ? auditItems
    : auditItems.slice((currentPage - 1) * (itemsPerPage as number), currentPage * (itemsPerPage as number));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-600" />
            <span>Conteo Físico</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-1">
            Conteo físico de almacén y conciliación de stock.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={handleReconcile}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Conciliar Diferencias {discrepancyCount > 0 ? `(${discrepancyCount})` : ''}</span>
          </button>
        </div>
      </div>

      {reconciledMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{reconciledMsg}</span>
        </div>
      )}

      {discrepancyCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-medium text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span><strong>DIFERENCIA DETECTADA: {discrepancyCount} productos</strong> tienen distinta cantidad entre el conteo físico y el stock registrado en el sistema.</span>
          </div>
        </div>
      )}

      {/* Audit Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/75 text-slate-600 dark:text-slate-300 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Producto</th>
                <th className="px-4 py-3.5 text-right">Saldo Sistema (TM)</th>
                <th className="px-4 py-3.5 text-right">Conteo Físico (TM)</th>
                <th className="px-4 py-3.5 text-right">Diferencia TM</th>
                <th className="px-4 py-3.5 text-right">Diferencia Bolsas</th>
                <th className="px-4 py-3.5">Motivo del Ajuste</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {paginatedAuditItems.map(item => {
                const diff = item.differenceTm;
                const hasDiff = diff !== null && diff !== undefined && Math.abs(diff) > 0.001;

                return (
                  <tr key={item.productId} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${hasDiff ? 'bg-amber-500/5 dark:bg-amber-500/10' : ''}`}>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white uppercase">{item.productName}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300 font-mono">{item.systemStockTm.toFixed(2)} TM</td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="-"
                        value={item.physicalCountTm !== null && item.physicalCountTm !== undefined ? item.physicalCountTm : ''}
                        onChange={(e) => handleCountChange(item.productId, e.target.value)}
                        className="w-28 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-right font-semibold text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold font-mono ${
                      diff === null || diff === undefined ? 'text-slate-400' :
                      diff > 0 ? 'text-emerald-600 dark:text-emerald-400' : 
                      diff < 0 ? 'text-rose-600 dark:text-rose-400' : 
                      'text-slate-400'
                    }`}>
                      {diff === null || diff === undefined ? '-' : diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)} TM
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300 font-mono">
                      {diff === null || diff === undefined ? '-' : diff > 0 ? `+${Math.round(diff * 20)}` : Math.round(diff * 20)} u
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={item.reason || 'error_conteo'}
                        onChange={(e) => handleReasonChange(item.productId, e.target.value as AdjustmentReason)}
                        disabled={!hasDiff}
                        className={`w-full px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors focus:outline-none ${
                          hasDiff 
                            ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500' 
                            : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <option value="error_conteo">Error de Conteo</option>
                        <option value="merma">Merma / Pérdida Natural</option>
                        <option value="producto_entregado">Producto Entregado No Registrado</option>
                        <option value="producto_deteriorado">Producto Deteriorado / Dañado</option>
                        <option value="error_registro">Error de Registro Anterior</option>
                        <option value="otro">Otro Motivo</option>
                      </select>
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
              <option value={15}>15 productos</option>
              <option value={30}>30 productos</option>
              <option value={50}>50 productos</option>
              <option value="ALL">Todos los productos</option>
            </select>
            <span className="text-slate-400 dark:text-slate-500">
              (Mostrando {paginatedAuditItems.length} de {auditItems.length} productos)
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
