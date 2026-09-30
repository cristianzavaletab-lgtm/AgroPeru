import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCSV } from '../../utils/exportUtils';
import { 
  DollarSign, Plus, Wallet, PieChart, Calendar, Search, 
  ChevronLeft, ChevronRight, FileSpreadsheet, CalendarDays, 
  CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Receipt, ShoppingCart, FlaskConical, Package, Trash2, X
} from 'lucide-react';

export const FinancialReports: React.FC = () => {
  const { products, sales, purchases, mixExecutions, emptyBags, financials, addFinancialMovement, deleteFinancialMovement } = useApp();
  const [activeReportTab, setActiveReportTab] = useState<'PROFITABILITY' | 'DAILY_CLOSING' | 'CASH_LOG'>('PROFITABILITY');
  const [showModal, setShowModal] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Daily Closing Selected Date (Defaults to 2026-09-11 or current)
  const [selectedClosingDate, setSelectedClosingDate] = useState<string>(() => {
    const today = new Date().toISOString().split('T')[0];
    return sales.some(s => s.saleDate === '2026-09-11') ? '2026-09-11' : today;
  });

  // Pagination State (Default 15 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'ALL'>(15);

  // Form New Movement
  const [type, setType] = useState<'INGRESOS' | 'EGRESOS'>('EGRESOS');
  const [category, setCategory] = useState<any>('TRANSPORTE');
  const [description, setDescription] = useState('');
  const [amountPen, setAmountPen] = useState(0);
  const [cashRegister, setCashRegister] = useState<'CAJA_1' | 'CAJA_2'>('CAJA_1');

  // Filter sales based on dateFilter
  const filteredSales = sales.filter(s => {
    const matchesDate = !dateFilter || s.saleDate.startsWith(dateFilter);
    const matchesStatus = s.status !== 'ANULADO';
    return matchesDate && matchesStatus;
  });

  // Profitability per Product
  const productProfitability = products.map(prod => {
    const productSales = filteredSales.flatMap(s => s.items.filter(i => i.productId === prod.id));
    const totalQtyBags = productSales.reduce((acc, i) => acc + i.quantity, 0);
    const totalRevenue = productSales.reduce((acc, i) => acc + i.total, 0);
    const unitCostBag = prod.purchasePricePen / 20; // 50kg bag cost
    const totalCost = totalQtyBags * unitCostBag;
    const profit = totalRevenue - totalCost;
    const profitPerBag = totalQtyBags > 0 ? profit / totalQtyBags : 0;

    return {
      product: prod,
      totalQtyBags,
      totalRevenue,
      totalCost,
      profit,
      profitPerBag
    };
  }).filter(p => {
    const matchesSearch = p.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (p.totalQtyBags > 0 || p.product.currentStockTm > 0);
  });

  const totalPages = itemsPerPage === 'ALL' 
    ? 1 
    : Math.ceil(productProfitability.length / (itemsPerPage as number)) || 1;

  const paginatedProfitability = itemsPerPage === 'ALL'
    ? productProfitability
    : productProfitability.slice((currentPage - 1) * (itemsPerPage as number), currentPage * (itemsPerPage as number));

  const totalGlobalRevenue = productProfitability.reduce((acc, p) => acc + p.totalRevenue, 0);
  const totalGlobalCost = productProfitability.reduce((acc, p) => acc + p.totalCost, 0);
  const totalGlobalProfit = totalGlobalRevenue - totalGlobalCost;

  // Cash balances
  const caja1In = financials.filter(f => f.cashRegister === 'CAJA_1' && f.type === 'INGRESOS').reduce((acc, f) => acc + f.amountPen, 0);
  const caja1Out = financials.filter(f => f.cashRegister === 'CAJA_1' && f.type === 'EGRESOS').reduce((acc, f) => acc + f.amountPen, 0);
  const caja1Balance = caja1In - caja1Out;

  const caja2In = financials.filter(f => f.cashRegister === 'CAJA_2' && f.type === 'INGRESOS').reduce((acc, f) => acc + f.amountPen, 0);
  const caja2Out = financials.filter(f => f.cashRegister === 'CAJA_2' && f.type === 'EGRESOS').reduce((acc, f) => acc + f.amountPen, 0);
  const caja2Balance = caja2In - caja2Out;

  // ---------------- DAILY CLOSING CALCULATIONS ----------------
  const daySales = sales.filter(s => s.saleDate === selectedClosingDate && s.status !== 'ANULADO');
  const daySalesPen = daySales.reduce((acc, s) => acc + s.totalAmount, 0);
  const daySalesBags = daySales.reduce((acc, s) => acc + s.items.reduce((sum, it) => sum + it.quantity, 0), 0);
  const daySalesTm = daySalesBags / 20;
  const dayCreditsPen = daySales.filter(s => s.status === 'CREDITO').reduce((acc, s) => acc + (s.totalAmount - (s.paidAmount || 0)), 0);
  const dayCollectionsPen = daySales.reduce((acc, s) => acc + (s.paidAmount || (s.status === 'PAGADO' ? s.totalAmount : 0)), 0);

  const dayPurchases = purchases.filter(p => p.purchaseDate === selectedClosingDate);
  const dayPurchasesPen = dayPurchases.reduce((acc, p) => acc + p.totalPen, 0);
  const dayPurchasesTm = dayPurchases.reduce((acc, p) => acc + p.items.reduce((sum, it) => sum + it.quantityTm, 0), 0);

  const dayMixes = mixExecutions.filter(m => m.executionDate === selectedClosingDate);
  const dayMixesTm = dayMixes.reduce((acc, m) => acc + m.producedQtyTm, 0);

  const dayFinancials = financials.filter(f => f.date === selectedClosingDate);
  const dayIncomePen = dayFinancials.filter(f => f.type === 'INGRESOS').reduce((acc, f) => acc + f.amountPen, 0);
  const dayExpensePen = dayFinancials.filter(f => f.type === 'EGRESOS').reduce((acc, f) => acc + f.amountPen, 0);

  const dayCaja1In = dayFinancials.filter(f => f.cashRegister === 'CAJA_1' && f.type === 'INGRESOS').reduce((acc, f) => acc + f.amountPen, 0);
  const dayCaja1Out = dayFinancials.filter(f => f.cashRegister === 'CAJA_1' && f.type === 'EGRESOS').reduce((acc, f) => acc + f.amountPen, 0);
  const dayCaja1Net = dayCaja1In - dayCaja1Out;

  const dayCaja2In = dayFinancials.filter(f => f.cashRegister === 'CAJA_2' && f.type === 'INGRESOS').reduce((acc, f) => acc + f.amountPen, 0);
  const dayCaja2Out = dayFinancials.filter(f => f.cashRegister === 'CAJA_2' && f.type === 'EGRESOS').reduce((acc, f) => acc + f.amountPen, 0);
  const dayCaja2Net = dayCaja2In - dayCaja2Out;

  const totalStockTm = products.reduce((acc, p) => acc + p.currentStockTm, 0);
  const totalStockBags = products.reduce((acc, p) => acc + p.currentBags, 0);
  const totalEmptyBags = emptyBags.reduce((acc, b) => acc + b.saldoFinal, 0);
  const discrepanciesDetected = products.filter(p => p.conteoFisicoTm > 0 && Math.abs(p.diferenciaTm) > 0.001).length;

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amountPen <= 0) return;

    addFinancialMovement({
      date: new Date().toISOString().split('T')[0],
      type,
      category,
      description,
      amountPen,
      cashRegister
    });

    setShowModal(false);
  };

  const handleExportFinancials = () => {
    if (activeReportTab === 'PROFITABILITY') {
      const data = productProfitability.map(p => ({
        'Producto': p.product.name,
        'Bolsas Vendidas': p.totalQtyBags,
        'Ventas Totales (S/)': p.totalRevenue.toFixed(2),
        'Costo Mercadería (S/)': p.totalCost.toFixed(2),
        'Utilidad Bruta (S/)': p.profit.toFixed(2),
        'Utilidad / Bolsa (S/)': p.profitPerBag.toFixed(2)
      }));
      exportToCSV(data, 'Estado_Resultados_Rentabilidad_AgroPeru');
    } else if (activeReportTab === 'DAILY_CLOSING') {
      const summary = [
        { 'Concepto': 'Fecha de Cierre', 'Valor': selectedClosingDate },
        { 'Concepto': 'Ventas del Día (S/)', 'Valor': daySalesPen.toFixed(2) },
        { 'Concepto': 'Ventas (Bolsas)', 'Valor': daySalesBags },
        { 'Concepto': 'Ventas (TM)', 'Valor': daySalesTm.toFixed(2) },
        { 'Concepto': 'Créditos Generados (S/)', 'Valor': dayCreditsPen.toFixed(2) },
        { 'Concepto': 'Cobranzas Recibidas (S/)', 'Valor': dayCollectionsPen.toFixed(2) },
        { 'Concepto': 'Compras del Día (S/)', 'Valor': dayPurchasesPen.toFixed(2) },
        { 'Concepto': 'Compras (TM)', 'Valor': dayPurchasesTm.toFixed(2) },
        { 'Concepto': 'Producción / Preparaciones (TM)', 'Valor': dayMixesTm.toFixed(2) },
        { 'Concepto': 'Ingresos Caja (S/)', 'Valor': dayIncomePen.toFixed(2) },
        { 'Concepto': 'Egresos / Gastos (S/)', 'Valor': dayExpensePen.toFixed(2) },
        { 'Concepto': 'Flujo Neto Caja 1 (S/)', 'Valor': dayCaja1Net.toFixed(2) },
        { 'Concepto': 'Flujo Neto Caja 2 (S/)', 'Valor': dayCaja2Net.toFixed(2) },
        { 'Concepto': 'Stock Final Almacén (TM)', 'Valor': totalStockTm.toFixed(2) },
        { 'Concepto': 'Stock Final Almacén (Bolsas)', 'Valor': totalStockBags },
        { 'Concepto': 'Sacos Vacíos Almacén (BLS)', 'Valor': totalEmptyBags },
        { 'Concepto': 'Diferencias Físicas Detectadas', 'Valor': discrepanciesDetected }
      ];
      exportToCSV(summary, `Cierre_Diario_AgroPeru_${selectedClosingDate}`);
    } else {
      const data = financials.map(f => ({
        'Fecha': f.date,
        'Caja': f.cashRegister === 'CAJA_1' ? 'Caja 1 (Principal)' : 'Caja 2 (Chica)',
        'Tipo': f.type,
        'Categoría': f.category,
        'Descripción': f.description,
        'Monto (S/)': f.amountPen.toFixed(2)
      }));
      exportToCSV(data, 'Movimientos_Cajas_AgroPeru');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>Caja Diaria</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-1">
            Cierre diario, flujo de cajas y márgenes por producto.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportFinancials}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Movimiento de Caja</span>
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-lg border border-slate-200 dark:border-slate-800 w-fit">
        <button
          onClick={() => setActiveReportTab('PROFITABILITY')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeReportTab === 'PROFITABILITY' 
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Utilidad por Producto</span>
        </button>
        <button
          onClick={() => setActiveReportTab('DAILY_CLOSING')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeReportTab === 'DAILY_CLOSING' 
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Cierre del Día ({selectedClosingDate})</span>
        </button>
        <button
          onClick={() => setActiveReportTab('CASH_LOG')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeReportTab === 'CASH_LOG' 
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Bitácora de Cajas</span>
        </button>
      </div>

      {/* TAB 1: PROFITABILITY & MARGINS */}
      {activeReportTab === 'PROFITABILITY' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Filtrar Fecha:
              </span>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="text-xs text-slate-600 dark:text-slate-300 font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Global Profit Metric Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Ingreso Total Ventas</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">S/ {totalGlobalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Costo Mercadería Comprada</span>
              <div className="text-xl font-bold text-slate-600 dark:text-slate-400 font-mono">S/ {totalGlobalCost.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-xs space-y-1">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 uppercase font-semibold tracking-wider">Utilidad Neta Ganancia</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">S/ {totalGlobalProfit.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          </div>

          {/* Cash Register Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Caja 1 */}
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Caja Principal (Caja 1)</h3>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  BCP / Yape / Principal
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-slate-100 dark:border-slate-800 text-center text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px] block">Ingresos</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">+S/ {caja1In.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px] block">Egresos</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono">-S/ {caja1Out.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px] block">Saldo Actual</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">S/ {caja1Balance.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Caja 2 */}
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Caja Chica / Operaciones (Caja 2)</h3>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Efectivo Almacén
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-slate-100 dark:border-slate-800 text-center text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px] block">Ingresos</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">+S/ {caja2In.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px] block">Egresos</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono">-S/ {caja2Out.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px] block">Saldo Actual</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">S/ {caja2Balance.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Profitability Table */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                <span>Utilidad Bruta y Margen por Producto / Bolsa</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/75 text-slate-600 dark:text-slate-300 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">Producto</th>
                    <th className="px-4 py-3.5 text-right">Bolsas Vendidas</th>
                    <th className="px-4 py-3.5 text-right">Ventas Totales</th>
                    <th className="px-4 py-3.5 text-right">Costo Mercadería</th>
                    <th className="px-4 py-3.5 text-right">Utilidad Bruta</th>
                    <th className="px-4 py-3.5 text-right">Utilidad por Bolsa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {paginatedProfitability.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white uppercase">{item.product.name}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300 font-mono">{item.totalQtyBags} u</td>
                      <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-mono">S/ {item.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-right text-slate-500 font-mono">S/ {item.totalCost.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400 font-mono">S/ {item.profit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white font-mono">
                        {item.totalQtyBags > 0 ? `S/ ${item.profitPerBag.toFixed(2)} / bls` : '-'}
                      </td>
                    </tr>
                  ))}
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
                  (Mostrando {paginatedProfitability.length} de {productProfitability.length} productos)
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
      )}

      {/* TAB 2: DAILY CLOSING (CIERRE DEL DÍA) */}
      {activeReportTab === 'DAILY_CLOSING' && (
        <div className="space-y-6">
          {/* Date Selector for Closing */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-6 h-6 text-emerald-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Seleccionar Fecha de Cierre Diario</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">Consulta exacta de toda la actividad física, comercial y financiera ocurrida ese día.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedClosingDate('2026-09-11')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedClosingDate === '2026-09-11' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                11/09/2026
              </button>
              <button
                onClick={() => setSelectedClosingDate(new Date().toISOString().split('T')[0])}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedClosingDate === new Date().toISOString().split('T')[0] ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Hoy
              </button>
              <input
                type="date"
                value={selectedClosingDate}
                onChange={(e) => setSelectedClosingDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Master Summary Card Grid for Closing */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase block">Ventas del Día</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">S/ {daySalesPen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">{daySalesBags} bolsas ({daySalesTm.toFixed(2)} TM)</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase block">Compras del Día</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">S/ {dayPurchasesPen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">{dayPurchasesTm.toFixed(2)} TM ingresadas</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase block">Preparaciones / Mezclas</span>
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 font-mono">{dayMixesTm.toFixed(2)} TM</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">{Math.round(dayMixesTm * 20)} bolsas producidas</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase block">Créditos Otorgados</span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">S/ {dayCreditsPen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Deuda generada hoy</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase block">Cobranzas Recibidas</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">S/ {dayCollectionsPen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Ingreso por pagos de clientes</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase block">Gastos / Egresos Caja</span>
              <span className="text-lg font-bold text-rose-600 dark:text-rose-400 font-mono">S/ {dayExpensePen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Estiba, flete y suministros</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase block">Stock Final Almacén</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">{totalStockTm.toFixed(2)} TM</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">{totalStockBags} bolsas en existencias</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase block">Bolsas Vacías (BLS)</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">{totalEmptyBags} u</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Sacos de empaque disponibles</span>
            </div>
          </div>

          {/* Caja 1 & Caja 2 Day Balances */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Caja 1 (Principal - BCP/Yape)</span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Flujo del Día</span>
              </div>
              <div className={`text-2xl font-bold font-mono ${dayCaja1Net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {dayCaja1Net >= 0 ? `+S/ ${dayCaja1Net.toFixed(2)}` : `-S/ ${Math.abs(dayCaja1Net).toFixed(2)}`}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Ingresos: +S/ {dayCaja1In.toFixed(2)} | Egresos: -S/ {dayCaja1Out.toFixed(2)}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Caja 2 (Chica - Almacén)</span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Flujo del Día</span>
              </div>
              <div className={`text-2xl font-bold font-mono ${dayCaja2Net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {dayCaja2Net >= 0 ? `+S/ ${dayCaja2Net.toFixed(2)}` : `-S/ ${Math.abs(dayCaja2Net).toFixed(2)}`}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Ingresos: +S/ {dayCaja2In.toFixed(2)} | Egresos: -S/ {dayCaja2Out.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Detailed Movements of the Selected Day */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Movimientos y Operaciones Registradas el {selectedClosingDate}
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Total Operaciones: {daySales.length + dayPurchases.length + dayMixes.length + dayFinancials.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/75 text-slate-600 dark:text-slate-300 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Tipo Operación</th>
                    <th className="px-4 py-3">Documento / Ref</th>
                    <th className="px-4 py-3">Detalle / Cliente / Proveedor</th>
                    <th className="px-4 py-3 text-right">Monto / Cantidad</th>
                    <th className="px-4 py-3 text-right">Estado / Caja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {daySales.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-2.5 font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5" /> VENTA
                      </td>
                      <td className="px-4 py-2.5 font-mono font-medium text-slate-900 dark:text-white">Proforma #{s.proformaNumber}</td>
                      <td className="px-4 py-2.5 font-medium">{s.customerName}</td>
                      <td className="px-4 py-2.5 text-right font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                        S/ {s.totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {dayPurchases.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-2.5 font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                        <ShoppingCart className="w-3.5 h-3.5" /> COMPRA
                      </td>
                      <td className="px-4 py-2.5 font-mono font-medium text-slate-900 dark:text-white">{p.docNumber}</td>
                      <td className="px-4 py-2.5 font-medium">{p.supplierName}</td>
                      <td className="px-4 py-2.5 text-right font-semibold font-mono text-blue-600 dark:text-blue-400">
                        S/ {p.totalPen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          {p.currency}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {dayMixes.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-2.5 font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5" /> PREPARADO
                      </td>
                      <td className="px-4 py-2.5 font-mono font-medium text-slate-900 dark:text-white">{m.recipeName}</td>
                      <td className="px-4 py-2.5 font-medium">{m.consumedItems.length} insumos consumidos</td>
                      <td className="px-4 py-2.5 text-right font-semibold font-mono text-indigo-600 dark:text-indigo-400">
                        +{m.producedQtyTm} TM ({m.producedBags} bls)
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                          COMPLETADO
                        </span>
                      </td>
                    </tr>
                  ))}

                  {dayFinancials.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-2.5 font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5" /> CAJA ({f.type})
                      </td>
                      <td className="px-4 py-2.5 font-mono font-medium text-slate-900 dark:text-white">{f.category}</td>
                      <td className="px-4 py-2.5 font-medium">{f.description}</td>
                      <td className={`px-4 py-2.5 text-right font-semibold font-mono ${f.type === 'INGRESOS' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {f.type === 'INGRESOS' ? `+S/ ${f.amountPen.toFixed(2)}` : `-S/ ${f.amountPen.toFixed(2)}`}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {f.cashRegister}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {daySales.length === 0 && dayPurchases.length === 0 && dayMixes.length === 0 && dayFinancials.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 dark:text-slate-500 font-medium">
                        No se registraron movimientos en esta fecha específica ({selectedClosingDate}).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CASH LOG (MOVIMIENTOS DE CAJA) */}
      {activeReportTab === 'CASH_LOG' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Libro Diario de Caja Chica y Caja Principal</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/75 text-slate-600 dark:text-slate-300 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">Fecha</th>
                    <th className="px-4 py-3.5">Caja</th>
                    <th className="px-4 py-3.5">Tipo</th>
                    <th className="px-4 py-3.5">Categoría</th>
                    <th className="px-4 py-3.5">Descripción / Concepto</th>
                    <th className="px-4 py-3.5 text-right">Monto (S/)</th>
                    <th className="px-4 py-3.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {financials.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-slate-900 dark:text-white">{f.date}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {f.cashRegister === 'CAJA_1' ? 'Caja 1 (BCP/Yape)' : 'Caja 2 (Almacén)'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          f.type === 'INGRESOS' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                        }`}>
                          {f.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{f.category}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{f.description}</td>
                      <td className={`px-4 py-3 text-right font-semibold font-mono text-xs ${
                        f.type === 'INGRESOS' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {f.type === 'INGRESOS' ? `+S/ ${f.amountPen.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-S/ ${f.amountPen.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => deleteFinancialMovement(f.id)}
                          title="Eliminar movimiento"
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nuevo Movimiento de Caja */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <span>Registrar Movimiento de Caja</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tipo de Movimiento</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="EGRESOS">EGRESO / GASTO (Salida de dinero)</option>
                  <option value="INGRESOS">INGRESO (Entrada de dinero)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Caja Destino / Origen</label>
                <select
                  value={cashRegister}
                  onChange={(e) => setCashRegister(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="CAJA_1">Caja Principal (Caja 1 - BCP/Yape)</option>
                  <option value="CAJA_2">Caja Chica (Caja 2 - Almacén)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Categoría del Movimiento</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="TRANSPORTE">Flete / Transporte</option>
                  <option value="ESTIBA">Estiba / Carga</option>
                  <option value="ALQUILER">Alquiler de Almacén</option>
                  <option value="COMPRA">Compra Insumos</option>
                  <option value="VENTA">Cobro Venta</option>
                  <option value="SERVICIOS">Servicios (Luz/Agua/Internet)</option>
                  <option value="OTROS">Otros Gastos Operativos</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Descripción / Concepto *</label>
                <input
                  type="text"
                  placeholder="Ej. Pago de estiba 20 TM Urea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Monto (S/) *</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.00"
                  value={amountPen || ''}
                  onChange={(e) => setAmountPen(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-bold text-right font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Registrar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
