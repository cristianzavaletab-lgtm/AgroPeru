import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCSV } from '../../utils/exportUtils';
import { toLocalISODate } from '../../utils/dateUtils';
import { 
  Table, Search, ArrowUpRight, ArrowDownLeft, RefreshCw, 
  ChevronLeft, ChevronRight, Calendar,
  AlertTriangle, Tag, Clock, FileSpreadsheet
} from 'lucide-react';

const MOVEMENT_LABELS: Record<string, string> = {
  INITIAL_STOCK: 'Stock Inicial',
  PURCHASE: 'Compra / Ingreso',
  SALE: 'Venta',
  SALE_CANCEL: 'Anulación Venta',
  MIX_PRODUCTION: 'Preparado Ingreso',
  MIX_CONSUMPTION: 'Preparado Salida',
  ADJUSTMENT: 'Ajuste Físico',
  TRANSFER: 'Transferencia',
};

export const KardexViewer: React.FC = () => {
  const { kardex, products, lots, reconcileAudit } = useApp();
  const [viewMode, setViewMode] = useState<'MATRIX' | 'LOTS' | 'LOG'>('MATRIX');
  
  // Search and general filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('ALL');
  const [lotStatusFilter, setLotStatusFilter] = useState<'ALL' | 'DISPONIBLE' | 'AGOTADO'>('ALL');
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>('ALL');

  // Date filters
  const [dateFilterMode, setDateFilterMode] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'RANGE'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Reconcile modal
  const [showReconcileModal, setShowReconcileModal] = useState(false);

  // Pagination State (Default 15 items per page)
  const [pageSize, setPageSize] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Editable physical counts for Matrix View (supports string '' for uncounted/cleared state)
  const [counts, setCounts] = useState<{ [productId: string]: number | '' }>(
    products.reduce((acc, p) => ({ 
      ...acc, 
      [p.id]: (p.conteoFisicoTm !== undefined && p.conteoFisicoTm !== null && p.conteoFisicoTm !== 0) 
        ? p.conteoFisicoTm 
        : '' 
    }), {})
  );

  // Date Helper Calculations
  const todayStr = useMemo(() => toLocalISODate(), []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return toLocalISODate(d);
  }, []);

  const handleQuickDateFilter = (mode: 'ALL' | 'TODAY' | 'YESTERDAY' | 'RANGE') => {
    setDateFilterMode(mode);
    setCurrentPage(1);
    if (mode === 'TODAY') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (mode === 'YESTERDAY') {
      setStartDate(yesterdayStr);
      setEndDate(yesterdayStr);
    } else if (mode === 'ALL') {
      setStartDate('');
      setEndDate('');
    }
  };

  // 1. FILTERED PRODUCTS (For Matrix View)
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchProd = selectedProductId === 'ALL' || p.id === selectedProductId;
      return matchSearch && matchProd;
    });
  }, [products, searchTerm, selectedProductId]);

  // 2. FILTERED LOTS (For Lots View)
  const filteredLots = useMemo(() => {
    return lots.filter(lot => {
      const matchProd = selectedProductId === 'ALL' || lot.productId === selectedProductId;
      const matchSearch = lot.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lot.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (lot.purchaseDocNumber && lot.purchaseDocNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = lotStatusFilter === 'ALL' || lot.status === lotStatusFilter;

      // Date filtering
      let matchDate = true;
      if (dateFilterMode === 'TODAY') {
        matchDate = lot.entryDate === todayStr;
      } else if (dateFilterMode === 'YESTERDAY') {
        matchDate = lot.entryDate === yesterdayStr;
      } else if (dateFilterMode === 'RANGE') {
        if (startDate && lot.entryDate < startDate) matchDate = false;
        if (endDate && lot.entryDate > endDate) matchDate = false;
      }

      return matchProd && matchSearch && matchStatus && matchDate;
    });
  }, [lots, selectedProductId, searchTerm, lotStatusFilter, dateFilterMode, startDate, endDate, todayStr, yesterdayStr]);

  // 3. FILTERED KARDEX (For Log View)
  const filteredKardex = useMemo(() => {
    return kardex.filter(item => {
      const matchesProduct = selectedProductId === 'ALL' || item.productId === selectedProductId;
      const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (item.lotNumber && item.lotNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (item.referenceId && item.referenceId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = movementTypeFilter === 'ALL' || item.type === movementTypeFilter;

      let matchesDate = true;
      if (dateFilterMode === 'TODAY') {
        matchesDate = item.date === todayStr;
      } else if (dateFilterMode === 'YESTERDAY') {
        matchesDate = item.date === yesterdayStr;
      } else if (dateFilterMode === 'RANGE') {
        if (startDate && item.date < startDate) matchesDate = false;
        if (endDate && item.date > endDate) matchesDate = false;
      }

      return matchesProduct && matchesSearch && matchesType && matchesDate;
    });
  }, [kardex, selectedProductId, searchTerm, movementTypeFilter, dateFilterMode, startDate, endDate, todayStr, yesterdayStr]);

  // Pagination Calculations
  const currentDatasetLength = viewMode === 'MATRIX' 
    ? filteredProducts.length 
    : viewMode === 'LOTS' 
      ? filteredLots.length 
      : filteredKardex.length;

  const totalPages = pageSize === 0 ? 1 : Math.ceil(currentDatasetLength / (pageSize || 1)) || 1;
  const startIndex = pageSize === 0 ? 0 : (currentPage - 1) * pageSize;

  const paginatedProducts = pageSize === 0 
    ? filteredProducts 
    : filteredProducts.slice(startIndex, startIndex + pageSize);

  const paginatedLots = pageSize === 0 
    ? filteredLots 
    : filteredLots.slice(startIndex, startIndex + pageSize);

  const paginatedKardex = pageSize === 0 
    ? filteredKardex 
    : filteredKardex.slice(startIndex, startIndex + pageSize);

  // Count editing handlers
  const handleCountChange = (prodId: string, valStr: string) => {
    if (valStr === '') {
      setCounts(prev => ({ ...prev, [prodId]: '' }));
      return;
    }
    const val = parseFloat(valStr);
    setCounts(prev => ({ ...prev, [prodId]: isNaN(val) ? '' : val }));
  };

  const itemsToReconcile = useMemo(() => {
    return products.filter(p => {
      const countVal = counts[p.id];
      return typeof countVal === 'number' && Math.abs(countVal - p.currentStockTm) > 0.001;
    });
  }, [products, counts]);

  const handleConfirmReconcile = () => {
    const auditItems = products
      .filter(p => typeof counts[p.id] === 'number')
      .map(p => {
        const physicalCountTm = counts[p.id] as number;
        const differenceTm = parseFloat((physicalCountTm - p.currentStockTm).toFixed(2));
        return {
          productId: p.id,
          productName: p.name,
          systemStockTm: p.currentStockTm,
          physicalCountTm,
          differenceTm
        };
      });
    
    reconcileAudit(auditItems);
    setShowReconcileModal(false);
  };

  // Lot Statistics Summary
  const lotStats = useMemo(() => {
    const totalLots = lots.length;
    const activeLots = lots.filter(l => l.status === 'DISPONIBLE').length;
    const totalTmInLots = lots.filter(l => l.status === 'DISPONIBLE').reduce((acc, l) => acc + l.currentQuantityTm, 0);
    const totalValuationPen = lots.filter(l => l.status === 'DISPONIBLE').reduce((acc, l) => acc + (l.currentQuantityTm * l.unitCostPen), 0);
    return { totalLots, activeLots, totalTmInLots, totalValuationPen };
  }, [lots]);

  const handleExportKardex = () => {
    if (viewMode === 'MATRIX') {
      const data = filteredProducts.map(p => {
        const rawCount = counts[p.id];
        const hasCount = rawCount !== undefined && rawCount !== '';
        const currentPhysical = hasCount ? (rawCount as number) : null;
        const diff = currentPhysical !== null ? parseFloat((currentPhysical - p.currentStockTm).toFixed(2)) : null;
        return {
          'SKU': p.code,
          'Producto': p.name,
          'Ventas (Bolsas)': p.totalVentasBags || 0,
          'Preparado Salida (TM)': p.totalPreparadoSalidaTm || 0,
          'Preparado Ingreso (TM)': p.totalPreparadoIngresoTm || 0,
          'Ingreso Compra (TM)': p.totalIngresoCompraTm || 0,
          'Saldo Final (TM)': p.currentStockTm.toFixed(2),
          'Saldo Final (Bolsas)': p.currentBags,
          'Valorizado (S/)': (p.currentStockTm * p.purchasePricePen).toFixed(2),
          'Conteo Físico (TM)': currentPhysical !== null ? currentPhysical.toFixed(2) : '-',
          'Diferencia (TM)': diff !== null ? diff.toFixed(2) : '-'
        };
      });
      exportToCSV(data, 'Matriz_Inventario_AgroPeru');
    } else if (viewMode === 'LOTS') {
      const data = filteredLots.map(l => ({
        'Producto': l.productName,
        'Lote': l.lotNumber,
        'Fecha Ingreso': l.entryDate,
        'Cant. Inicial (TM)': l.initialQuantityTm.toFixed(2),
        'Cant. Disponible (TM)': l.currentQuantityTm.toFixed(2),
        'Bolsas Disponibles': l.currentBags,
        'Costo Unit. (S/)': l.unitCostPen.toFixed(2),
        'Precio Venta (S/)': l.salePricePen.toFixed(2),
        'Estado': l.status,
        'Documento Compra': l.purchaseDocNumber || '-',
        'Proveedor': l.supplierName || '-'
      }));
      exportToCSV(data, 'Inventario_Por_Lotes_AgroPeru');
    } else {
      const data = filteredKardex.map(k => ({
        'Fecha': k.date,
        'Producto': k.productName,
        'Lote': k.lotNumber || '-',
        'Tipo Movimiento': k.type,
        'Cantidad TM': k.quantityTm.toFixed(2),
        'Cantidad Bolsas': k.quantityBags,
        'Saldo TM': k.balanceStockTm.toFixed(2),
        'Saldo Bolsas': k.balanceBags,
        'Costo Unit. (S/)': k.unitCostPen ? k.unitCostPen.toFixed(2) : '-',
        'Precio Venta (S/)': k.salePricePen ? k.salePricePen.toFixed(2) : '-',
        'Referencia': k.referenceId || '-',
        'Notas': k.notes || '-'
      }));
      exportToCSV(data, 'Kardex_Movimientos_AgroPeru');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tab Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Table className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Inventario</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Existencias en TM y bolsas, trazabilidad por lotes y valorización.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportKardex}
            className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Exportar Excel</span>
          </button>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => { setViewMode('MATRIX'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'MATRIX' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Matriz Excel</span>
            </button>
            <button
              onClick={() => { setViewMode('LOTS'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'LOTS' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Lotes ({lotStats.activeLots})</span>
            </button>
            <button
              onClick={() => { setViewMode('LOG'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'LOG' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Historial</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lot Stats KPI Banner (Shown in Lots View) */}
      {viewMode === 'LOTS' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Lotes Registrados</span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">{lotStats.totalLots}</span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Lotes con Saldo Activo</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">{lotStats.activeLots}</span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Stock en Lotes</span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">{lotStats.totalTmInLots.toFixed(2)} TM</span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Valorización Contable</span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">S/ {lotStats.totalValuationPen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}

      {/* Master Filter & Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Universal Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={
                viewMode === 'LOTS' 
                  ? 'Buscar por número de lote (ej. 001, 002) o producto...' 
                  : viewMode === 'LOG'
                    ? 'Buscar por producto, lote, documento o motivo...'
                    : 'Buscar por producto o código SKU...'
              }
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Product Filter Selector */}
          <div className="w-full md:w-60">
            <select
              value={selectedProductId}
              onChange={(e) => { setSelectedProductId(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Todos los Productos</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Lot Status Filter (Only in LOTS view) */}
          {viewMode === 'LOTS' && (
            <div className="w-full md:w-44">
              <select
                value={lotStatusFilter}
                onChange={(e) => { setLotStatusFilter(e.target.value as any); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none"
              >
                <option value="ALL">Todos los Estados</option>
                <option value="DISPONIBLE">Solo Disponibles</option>
                <option value="AGOTADO">Solo Agotados</option>
              </select>
            </div>
          )}

          {/* Movement Type Filter (Only in LOG view) */}
          {viewMode === 'LOG' && (
            <div className="w-full md:w-48">
              <select
                value={movementTypeFilter}
                onChange={(e) => { setMovementTypeFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none"
              >
                <option value="ALL">Todos los Movimientos</option>
                <option value="PURCHASE">Compras (Ingreso)</option>
                <option value="SALE">Ventas (Salida)</option>
                <option value="MIX_CONSUMPTION">Preparado Salida</option>
                <option value="MIX_PRODUCTION">Preparado Ingreso</option>
                <option value="ADJUSTMENT">Ajustes Físicos</option>
                <option value="SALE_CANCEL">Anulaciones</option>
              </select>
            </div>
          )}

          {/* Conciliate Button in Matrix View */}
          {viewMode === 'MATRIX' && (
            <button
              onClick={() => setShowReconcileModal(true)}
              title="Ver productos con diferencia entre conteo físico y stock del sistema"
              className="w-full md:w-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ajustar Stock {itemsToReconcile.length > 0 ? `(${itemsToReconcile.length})` : ''}</span>
            </button>
          )}
        </div>

        {/* Date Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium text-[11px] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Filtrar por Fecha:
            </span>
            <button
              onClick={() => handleQuickDateFilter('ALL')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                dateFilterMode === 'ALL' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Todo
            </button>
            <button
              onClick={() => handleQuickDateFilter('TODAY')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                dateFilterMode === 'TODAY' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Hoy ({todayStr})
            </button>
            <button
              onClick={() => handleQuickDateFilter('YESTERDAY')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                dateFilterMode === 'YESTERDAY' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Ayer ({yesterdayStr})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium text-[11px]">Desde:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setDateFilterMode('RANGE'); setCurrentPage(1); }}
              className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono font-medium"
            />
            <span className="text-slate-500 font-medium text-[11px]">Hasta:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setDateFilterMode('RANGE'); setCurrentPage(1); }}
              className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono font-medium"
            />

            {/* Page Size Selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg text-xs ml-2">
              <span className="text-slate-500 font-medium text-[11px]">Filas:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={0}>Todos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: MATRIX VIEW (EXCEL CONSOLIDATED) */}
      {viewMode === 'MATRIX' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Productos</th>
                  <th className="px-3 py-3 text-right text-rose-600 dark:text-rose-400">Venta (Bolsas)</th>
                  <th className="px-3 py-3 text-right text-amber-600 dark:text-amber-400">Prep. Salida (TM)</th>
                  <th className="px-3 py-3 text-right text-emerald-600 dark:text-emerald-400">Prep. Ingreso (TM)</th>
                  <th className="px-3 py-3 text-right text-blue-600 dark:text-blue-400">Compra (TM)</th>
                  <th className="px-3 py-3 text-right text-slate-900 dark:text-slate-100 font-bold">Saldo Final (TM)</th>
                  <th className="px-3 py-3 text-right text-slate-700 dark:text-slate-300">Valorizado (S/)</th>
                  <th className="px-3 py-3 text-right bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100">Conteo Físico (TM)</th>
                  <th className="px-3 py-3 text-right font-bold text-slate-700 dark:text-slate-300">Diferencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {paginatedProducts.map(p => {
                  const valorizadoPen = p.currentStockTm * p.purchasePricePen;
                  const rawCount = counts[p.id];
                  const hasCount = rawCount !== undefined && rawCount !== '';
                  const currentPhysical = hasCount ? (rawCount as number) : null;
                  const diff = currentPhysical !== null ? parseFloat((currentPhysical - p.currentStockTm).toFixed(2)) : null;
                  const hasDiff = diff !== null && Math.abs(diff) > 0.001;

                  return (
                    <tr key={p.id} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${hasDiff ? 'bg-amber-50/70 dark:bg-amber-950/20' : ''}`}>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                        <div>{p.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono font-normal">{p.code}</div>
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-rose-600 dark:text-rose-400 font-mono">{p.totalVentasBags || 0}</td>
                      <td className="px-3 py-3 text-right font-semibold text-amber-600 dark:text-amber-400 font-mono">{p.totalPreparadoSalidaTm || 0}</td>
                      <td className="px-3 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400 font-mono">{p.totalPreparadoIngresoTm || 0}</td>
                      <td className="px-3 py-3 text-right font-semibold text-blue-600 dark:text-blue-400 font-mono">{p.totalIngresoCompraTm || 0}</td>
                      <td className="px-3 py-3 text-right font-bold text-slate-900 dark:text-slate-100 text-xs font-mono">
                        {p.currentStockTm.toFixed(2)} TM
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                        S/ {valorizadoPen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-1 text-right bg-slate-50/50 dark:bg-slate-800/30">
                        <input
                          type="number"
                          step="0.1"
                          placeholder="-"
                          value={counts[p.id] !== undefined ? counts[p.id] : ''}
                          onChange={(e) => handleCountChange(p.id, e.target.value)}
                          className="w-24 px-2 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-right font-semibold text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                      </td>
                      <td className={`px-3 py-3 text-right font-bold font-mono ${
                        diff === null ? 'text-slate-400' :
                        diff > 0 ? 'text-emerald-600 dark:text-emerald-400' : 
                        diff < 0 ? 'text-rose-600 dark:text-rose-400' : 
                        'text-slate-400'
                      }`}>
                        {diff === null ? '-' : diff > 0 ? `+${diff}` : diff}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: LOTS VIEW (FASE 2 & 3: Trazabilidad Completa por Lotes) */}
      {viewMode === 'LOTS' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-3 py-3 text-center">Lote</th>
                  <th className="px-3 py-3">Fecha Ingreso</th>
                  <th className="px-3 py-3 text-right">Cant. Ingresada</th>
                  <th className="px-3 py-3 text-right text-emerald-600 dark:text-emerald-400">Cant. Disponible</th>
                  <th className="px-3 py-3 text-right text-slate-700 dark:text-slate-300">Costo Unit. (S/)</th>
                  <th className="px-3 py-3 text-right text-slate-700 dark:text-slate-300">Precio Venta (S/)</th>
                  <th className="px-3 py-3 text-right">Margen Unit.</th>
                  <th className="px-3 py-3 text-center">Estado</th>
                  <th className="px-4 py-3">Origen / Guía</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {paginatedLots.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-slate-400 font-medium">
                      No se encontraron lotes que coincidan con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  paginatedLots.map(lot => {
                    const unitMarginPen = lot.salePricePen - lot.unitCostPen;
                    const marginPercent = lot.unitCostPen > 0 ? ((unitMarginPen / lot.unitCostPen) * 100).toFixed(1) : '0';

                    return (
                      <tr key={lot.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                          <div>{lot.productName}</div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="px-2 py-0.5 rounded-md text-xs font-semibold font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 inline-block">
                            {lot.lotNumber}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono text-slate-600 dark:text-slate-400">
                          {lot.entryDate}
                        </td>
                        <td className="px-3 py-3 text-right font-mono">
                          <div className="font-medium text-slate-900 dark:text-slate-100">{lot.initialQuantityTm.toFixed(2)} TM</div>
                          <div className="text-[11px] text-slate-400">{lot.initialBags} bls</div>
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-semibold">
                          <span className={lot.currentQuantityTm > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                            {lot.currentQuantityTm.toFixed(2)} TM
                          </span>
                          <div className="text-[11px] text-slate-400 font-normal">{lot.currentBags} bls</div>
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                          S/ {lot.unitCostPen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
                          S/ {lot.salePricePen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`px-3 py-3 text-right font-mono font-medium text-xs ${
                          unitMarginPen >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          <div>{unitMarginPen >= 0 ? `+S/ ${unitMarginPen.toFixed(2)}` : `-S/ ${Math.abs(unitMarginPen).toFixed(2)}`}</div>
                          <div className="text-[10px] text-slate-400">({marginPercent}%)</div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border uppercase ${
                            lot.status === 'DISPONIBLE' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' 
                              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}>
                            {lot.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{lot.purchaseDocNumber || 'Doc Inicial'}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{lot.supplierName || 'Sistema'}</div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: HISTORIAL DE MOVIMIENTOS */}
      {viewMode === 'LOG' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-3 py-3 text-center">Lote</th>
                  <th className="px-4 py-3">Movimiento</th>
                  <th className="px-3 py-3 text-right text-emerald-600 dark:text-emerald-400">Entrada TM</th>
                  <th className="px-3 py-3 text-right text-rose-600 dark:text-rose-400">Salida TM</th>
                  <th className="px-3 py-3 text-right text-slate-900 dark:text-slate-100 font-bold">Saldo TM</th>
                  <th className="px-3 py-3 text-right text-slate-600 dark:text-slate-400">Saldo Bolsas</th>
                  <th className="px-3 py-3 text-right text-slate-700 dark:text-slate-300">Costo Unit. (S/)</th>
                  <th className="px-3 py-3 text-right text-slate-700 dark:text-slate-300">Precio Venta (S/)</th>
                  <th className="px-4 py-3">Referencia / Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {paginatedKardex.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-12 text-slate-400 font-medium">
                      No hay movimientos registrados para el criterio seleccionado.
                    </td>
                  </tr>
                ) : (
                  paginatedKardex.map(item => {
                    const isEntry = ['INITIAL_STOCK', 'PURCHASE', 'MIX_PRODUCTION', 'SALE_CANCEL'].includes(item.type);
                    const isExit = ['SALE', 'MIX_CONSUMPTION'].includes(item.type);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">{item.date}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{item.productName}</td>
                        <td className="px-3 py-3 text-center">
                          {item.lotNumber ? (
                            <span className="px-2 py-0.5 rounded-md text-xs font-semibold font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                              {item.lotNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1 w-fit ${
                            item.type === 'INITIAL_STOCK' ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' :
                            item.type === 'PURCHASE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' :
                            item.type === 'SALE' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800' :
                            item.type === 'SALE_CANCEL' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' :
                            item.type === 'MIX_PRODUCTION' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800' :
                            item.type === 'MIX_CONSUMPTION' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' :
                            'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800'
                          }`}>
                            {isEntry && <ArrowDownLeft className="w-3 h-3" />}
                            {isExit && <ArrowUpRight className="w-3 h-3" />}
                            <span>{MOVEMENT_LABELS[item.type] || item.type}</span>
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                          {isEntry ? `+${item.quantityTm.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold font-mono text-rose-600 dark:text-rose-400">
                          {isExit ? `-${item.quantityTm.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-slate-900 dark:text-slate-100 font-mono text-xs">
                          {item.balanceStockTm.toFixed(2)} TM
                        </td>
                        <td className="px-3 py-3 text-right font-medium text-slate-600 dark:text-slate-400 font-mono">
                          {item.balanceBags} u
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                          S/ {item.unitCostPen ? item.unitCostPen.toLocaleString('es-PE', { minimumFractionDigits: 2 }) : '-'}
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
                          {item.salePricePen ? `S/ ${item.salePricePen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{item.referenceId || 'N/A'}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{item.notes}</div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unified Pagination Footer */}
      <div className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
        <span className="text-slate-600 dark:text-slate-400">
          Mostrando <strong className="text-slate-900 dark:text-slate-100">{currentDatasetLength > 0 ? startIndex + 1 : 0}</strong> a{' '}
          <strong className="text-slate-900 dark:text-slate-100">{Math.min(startIndex + (pageSize || currentDatasetLength), currentDatasetLength)}</strong> de{' '}
          <strong className="text-slate-900 dark:text-slate-100 font-semibold">{currentDatasetLength}</strong> registros
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 disabled:opacity-40 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 disabled:opacity-40 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal: Ajuste de Stock Físico */}
      {showReconcileModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Ajustar Stock según Conteo Físico</h3>
                <p className="text-xs text-slate-500">Los siguientes productos tienen diferencia entre lo contado y lo que dice el sistema</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              El stock del sistema se actualizará para que coincida con lo que contaste físicamente en el almacén.
            </p>

            {itemsToReconcile.length === 0 ? (
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
                No hay diferencias pendientes entre los conteos físicos registrados y los saldos del sistema.
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                {itemsToReconcile.map(p => {
                  const physical = counts[p.id] as number;
                  const diff = parseFloat((physical - p.currentStockTm).toFixed(2));
                  return (
                    <div key={p.id} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 block">{p.name}</span>
                        <span className="text-[11px] text-slate-500">
                          Sistema: {p.currentStockTm.toFixed(2)} TM | Físico: {physical.toFixed(2)} TM
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md font-semibold font-mono text-xs ${
                        diff > 0 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                      }`}>
                        {diff > 0 ? `+${diff}` : diff} TM
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReconcileModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={itemsToReconcile.length === 0}
                onClick={handleConfirmReconcile}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              >
                ✓ Aplicar Ajustes ({itemsToReconcile.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
