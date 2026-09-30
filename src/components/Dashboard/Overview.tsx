import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, ShoppingCart, Package, DollarSign, 
  AlertTriangle, ArrowUpRight, ArrowDownRight, Layers,
  Receipt, FlaskConical, CheckCircle2, History, ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

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

export const Overview: React.FC = () => {
  const { products, sales, purchases, kardex, emptyBags, setActiveTab } = useApp();

  // Metrics Calculations
  const activeSales = sales.filter(s => s.status !== 'ANULADO');
  const totalSalesPen = activeSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalPurchasesPen = purchases.reduce((acc, p) => acc + p.totalPen, 0);
  
  // Stock Valorization
  const totalValuedStock = products.reduce((acc, p) => acc + (p.currentStockTm * p.purchasePricePen), 0);
  const totalStockTm = products.reduce((acc, p) => acc + p.currentStockTm, 0);

  // Gross Profit Estimate
  const estimatedProfit = activeSales.reduce((acc, s) => {
    const saleCost = s.items.reduce((itemAcc, item) => {
      const prod = products.find(p => p.id === item.productId);
      const cost = prod ? (item.quantity * (prod.purchasePricePen / 20)) : 0;
      return itemAcc + cost;
    }, 0);
    return acc + (s.totalAmount - saleCost);
  }, 0);

  // Low stock products
  const lowStockProducts = products.filter(p => p.currentStockTm <= p.minStockTm);
  const lowStockBags = emptyBags.filter(b => b.saldoFinal <= b.minStock);

  // Dynamic sales aggregation from real sales context
  const salesByDayMap: { [dateStr: string]: number } = {};
  activeSales.forEach(s => {
    const d = s.saleDate || new Date().toISOString().split('T')[0];
    salesByDayMap[d] = (salesByDayMap[d] || 0) + s.totalAmount;
  });

  const sortedDates = Object.keys(salesByDayMap).sort();
  const dailySalesData = sortedDates.length > 0
    ? sortedDates.map(dateStr => {
        const dateObj = new Date(dateStr + 'T00:00:00');
        const dayLabel = `${dateObj.getDate().toString().padStart(2, '0')} ${dateObj.toLocaleString('es-PE', { month: 'short' })}`;
        return {
          day: dayLabel,
          ventas: salesByDayMap[dateStr]
        };
      })
    : [
        { day: 'Sin registros', ventas: 0 }
      ];

  // Dynamic chart period label
  const chartPeriodLabel = sortedDates.length > 0
    ? (() => {
        const last = new Date(sortedDates[sortedDates.length - 1] + 'T00:00:00');
        return last.toLocaleString('es-PE', { month: 'long', year: 'numeric' });
      })()
    : new Date().toLocaleString('es-PE', { month: 'long', year: 'numeric' });

  const recentMovements = kardex.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Panel General
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Sistema Activo
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Resumen simple e integral de ventas, compras, inventario y caja.
          </p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setActiveTab('sales')}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Receipt className="w-4 h-4" />
            <span>Nueva Venta</span>
          </button>
          <button 
            onClick={() => setActiveTab('mixes')}
            className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-xs"
          >
            <FlaskConical className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Formular Mezcla</span>
          </button>
        </div>
      </div>

      {/* Row 1: 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ventas */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Ventas Totales
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
            S/ {totalSalesPen.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{activeSales.length} proformas emitidas</span>
          </div>
        </div>

        {/* KPI 2: Compras */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Compras & Flete
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
            S/ {totalPurchasesPen.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>{purchases.length} órdenes ingresadas</span>
          </div>
        </div>

        {/* KPI 3: Stock Valorizado */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Stock Valorizado
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
            S/ {totalValuedStock.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>{totalStockTm.toFixed(2)} TM en existencias</span>
          </div>
        </div>

        {/* KPI 4: Margen Estimado */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Margen Bruto Estimado
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            S/ {estimatedProfit.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>Rentabilidad operativa calculada</span>
          </div>
        </div>
      </div>

      {/* Row 2: Sales Chart & Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Histórico de Facturación Diaria
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evolución de ventas por fecha según registros de proformas.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
              {chartPeriodLabel}
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `S/ ${(val/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '8px', 
                    color: '#fff', 
                    border: 'none',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [`S/ ${Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, 'Ventas']}
                />
                <Bar dataKey="ventas" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts (1 col) */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Stock Bajo el Mínimo
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              {lowStockProducts.length + lowStockBags.length} alertas
            </span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-64 flex-1 pr-1">
            {lowStockProducts.length === 0 && lowStockBags.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Todo el inventario está en niveles óptimos.
              </div>
            ) : (
              <>
                {lowStockProducts.map(prod => (
                  <div key={prod.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase">{prod.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Stock: <span className="font-mono font-bold text-rose-600">{prod.currentStockTm} TM</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">Mín: {prod.minStockTm} TM</span>
                  </div>
                ))}

                {lowStockBags.map(b => (
                  <div key={b.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase">{b.bagName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Saldo: <span className="font-mono font-bold text-amber-600">{b.saldoFinal} u</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">Mín: {b.minStock} u</span>
                  </div>
                ))}
              </>
            )}
          </div>

          <button 
            onClick={() => setActiveTab('kardex')}
            className="w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
          >
            <span>Ver Matriz de Inventario</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 3: Recent Kardex Activity */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Últimos Movimientos de Stock
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('kardex')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 cursor-pointer"
          >
            <span>Ver Bitácora Completa</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-3.5 py-2.5">Fecha</th>
                <th className="px-3.5 py-2.5">Producto</th>
                <th className="px-3.5 py-2.5">Operación</th>
                <th className="px-3.5 py-2.5 text-center">Lote</th>
                <th className="px-3.5 py-2.5 text-right">Cantidad</th>
                <th className="px-3.5 py-2.5 text-right">Saldo en Almacén</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
              {recentMovements.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-3.5 py-2 font-mono font-medium">{m.date}</td>
                  <td className="px-3.5 py-2 font-semibold text-slate-900 dark:text-slate-100 uppercase">{m.productName}</td>
                  <td className="px-3.5 py-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.type === 'PURCHASE' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                      m.type === 'SALE' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                      m.type === 'MIX_PRODUCTION' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                      m.type === 'MIX_CONSUMPTION' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                      m.type === 'SALE_CANCEL' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {MOVEMENT_LABELS[m.type] || m.type}
                    </span>
                  </td>
                  <td className="px-3.5 py-2 text-center font-mono font-bold">{m.lotNumber || '-'}</td>
                  <td className="px-3.5 py-2 text-right font-mono font-bold">
                    {m.quantityTm.toFixed(2)} TM ({m.quantityBags} u)
                  </td>
                  <td className="px-3.5 py-2 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    {m.balanceStockTm.toFixed(2)} TM
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
