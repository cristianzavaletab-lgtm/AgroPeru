import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, CalendarDays, FileBarChart, Plus, Save, Trash2, TrendingUp, Wallet, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FinancialMovement, PaymentMethod } from '../../types';
import { toLocalISODate } from '../../utils/dateUtils';
import { exportToCSV } from '../../utils/exportUtils';

type Period = 'DIA' | 'SEMANA' | 'MES' | 'PERSONALIZADO';
const iso = (date: Date) => toLocalISODate(date);
const money = (value: number) => value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = () => iso(new Date());

const rangeFor = (period: Period) => {
  const now = new Date();
  if (period === 'DIA') return { from: iso(now), to: iso(now) };
  if (period === 'SEMANA') { const start = new Date(now); const day = (now.getDay() + 6) % 7; start.setDate(now.getDate() - day); return { from: iso(start), to: iso(now) }; }
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: iso(start), to: iso(end) };
};

export const FinancialReports: React.FC = () => {
  const { financials, sales, purchases, products, cashClosings, addFinancialMovement, deleteFinancialMovement, saveCashClosing, deleteCashClosing } = useApp();
  const [period, setPeriod] = useState<Period>('MES');
  const month = rangeFor('MES');
  const [from, setFrom] = useState(month.from);
  const [to, setTo] = useState(month.to);
  const [movementOpen, setMovementOpen] = useState(false);
  const [closingOpen, setClosingOpen] = useState(false);
  const [closingNotes, setClosingNotes] = useState('');
  const [movement, setMovement] = useState<Omit<FinancialMovement, 'id'>>({ date: today(), type: 'EGRESOS', category: 'OTROS', description: '', amountPen: 0, cashRegister: 'CAJA_1', paymentMethod: 'EFECTIVO' });

  const setPreset = (next: Period) => { setPeriod(next); if (next !== 'PERSONALIZADO') { const range = rangeFor(next); setFrom(range.from); setTo(range.to); } };
  const selectMonth = (value: string) => {
    if (!/^\d{4}-\d{2}$/.test(value)) return;
    const [year, monthNumber] = value.split('-').map(Number);
    setPeriod('MES');
    setFrom(`${value}-01`);
    setTo(iso(new Date(year, monthNumber, 0)));
  };
  const inside = (date: string) => date >= from && date <= to;
  const cash = financials.filter(f => inside(f.date));
  const periodSales = sales.filter(s => s.status !== 'ANULADO' && inside(s.saleDate));
  const periodPurchases = purchases.filter(p => p.status !== 'CANCELADO' && inside(p.purchaseDate));
  const income = cash.filter(f => f.type === 'INGRESOS').reduce((sum, f) => sum + f.amountPen, 0);
  const expense = cash.filter(f => f.type === 'EGRESOS').reduce((sum, f) => sum + f.amountPen, 0);
  const cashBalance = income - expense;
  const salesTotal = periodSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const purchaseTotal = periodPurchases.reduce((sum, p) => sum + p.totalPen, 0);
  const costOfSales = periodSales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => {
    const product = products.find(p => p.id === item.productId);
    return itemSum + item.quantity * ((product?.purchasePricePen || 0) / (1000 / (product?.bagWeightKg || 50)));
  }, 0), 0);
  const operatingExpenses = cash.filter(f => f.type === 'EGRESOS' && f.category !== 'COMPRA').reduce((sum, f) => sum + f.amountPen, 0);
  const grossProfit = salesTotal - costOfSales;
  const netProfit = grossProfit - operatingExpenses;
  const receivable = periodSales.reduce((sum, s) => sum + Math.max(0, s.totalAmount - s.paidAmount), 0);
  const exportPeriod = () => exportToCSV(cash.map(item => ({
    Fecha: item.date,
    Concepto: item.description,
    Categoría: item.category,
    Método: item.paymentMethod || '',
    Caja: item.cashRegister,
    'Ingreso S/': item.type === 'INGRESOS' ? item.amountPen : 0,
    'Egreso S/': item.type === 'EGRESOS' ? item.amountPen : 0,
  })), `Caja_${from}_a_${to}`);

  const saveMovement = (event: React.FormEvent) => { event.preventDefault(); addFinancialMovement(movement); setMovementOpen(false); setMovement({ ...movement, description: '', amountPen: 0 }); };
  const saveClosing = (event: React.FormEvent) => { event.preventDefault(); saveCashClosing({ from, to, label: `${period === 'DIA' ? 'Cierre diario' : period === 'SEMANA' ? 'Cierre semanal' : period === 'MES' ? 'Cierre mensual' : 'Cierre personalizado'} · ${from} a ${to}`, incomePen: income, expensePen: expense, balancePen: cashBalance, salesPen: salesTotal, purchasesPen: purchaseTotal, notes: closingNotes }); setClosingOpen(false); setClosingNotes(''); };

  return <div className="space-y-5">
    <section className="card flex flex-wrap items-end gap-3 p-4">
      <label className="form-label">Consultar un mes<input type="month" className="field" value={period === 'MES' ? from.slice(0, 7) : ''} onChange={event => selectMonth(event.target.value)} /></label>
      <button className="btn-secondary" onClick={exportPeriod} disabled={!cash.length}>Exportar movimientos del periodo (CSV para Excel)</button>
      <p className="text-xs text-slate-500">La exportación respeta las fechas seleccionadas. Los cierres guardados conservan el resumen original.</p>
    </section>
    <section className="page-header"><div><div className="eyebrow">Control financiero</div><h1 className="page-title"><Wallet className="h-5 w-5 text-emerald-600" /> Caja y resultados</h1><p className="page-subtitle">Filtra por día, semana, mes o rango; guarda cierres y revisa la rentabilidad.</p></div><div className="flex gap-2"><button className="btn-secondary" onClick={() => setMovementOpen(true)}><Plus className="h-4 w-4" /> Movimiento</button><button className="btn-primary" onClick={() => setClosingOpen(true)}><Save className="h-4 w-4" /> Guardar cierre</button></div></section>

    <section className="card p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-end"><div className="flex flex-wrap gap-2">{(['DIA', 'SEMANA', 'MES', 'PERSONALIZADO'] as Period[]).map(p => <button key={p} className={period === p ? 'btn-primary' : 'btn-secondary'} onClick={() => setPreset(p)}>{p === 'DIA' ? 'Hoy' : p === 'SEMANA' ? 'Esta semana' : p === 'MES' ? 'Este mes' : 'Personalizado'}</button>)}</div><div className="flex flex-1 gap-3 lg:justify-end"><label className="form-label">Desde<input type="date" className="field" value={from} onChange={e => { setPeriod('PERSONALIZADO'); setFrom(e.target.value); }} /></label><label className="form-label">Hasta<input type="date" className="field" value={to} onChange={e => { setPeriod('PERSONALIZADO'); setTo(e.target.value); }} /></label></div></div></section>

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><div className="stat-card"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ventas del periodo</span><TrendingUp className="h-4 w-4 text-emerald-500" /></div><div className="mt-2 text-2xl font-bold">S/ {money(salesTotal)}</div><div className="mt-1 text-[11px] text-slate-500">{periodSales.length} ventas · S/ {money(receivable)} por cobrar</div></div><div className="stat-card"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ingresó a caja</span><ArrowUpRight className="h-4 w-4 text-emerald-500" /></div><div className="mt-2 text-2xl font-bold text-emerald-600">S/ {money(income)}</div><div className="mt-1 text-[11px] text-slate-500">Cobros realmente registrados</div></div><div className="stat-card"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Salió de caja</span><ArrowDownRight className="h-4 w-4 text-rose-500" /></div><div className="mt-2 text-2xl font-bold text-rose-600">S/ {money(expense)}</div><div className="mt-1 text-[11px] text-slate-500">Compras, fletes y gastos</div></div><div className="stat-card bg-slate-950 text-white dark:bg-emerald-950"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Saldo neto de caja</div><div className={`mt-2 text-2xl font-bold ${cashBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>S/ {money(cashBalance)}</div><div className="mt-1 text-[11px] text-slate-400">Ingresos menos egresos</div></div></div>

    <div className="grid gap-5 xl:grid-cols-5"><section className="card overflow-hidden xl:col-span-3"><div className="border-b border-slate-200 p-4 dark:border-slate-800"><h2 className="flex items-center gap-2 text-sm font-bold"><CalendarDays className="h-4 w-4 text-emerald-600" /> Movimientos del periodo</h2></div><div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Fecha</th><th>Concepto</th><th>Método</th><th className="text-right">Ingreso</th><th className="text-right">Egreso</th><th></th></tr></thead><tbody>{cash.map(f => <tr key={f.id}><td className="font-mono">{f.date}</td><td><div className="font-semibold">{f.description}</div><div className="text-[10px] text-slate-500">{f.category} · {f.cashRegister.replace('_', ' ')}</div></td><td>{f.paymentMethod || '—'}</td><td className="text-right font-mono font-bold text-emerald-600">{f.type === 'INGRESOS' ? `S/ ${money(f.amountPen)}` : '—'}</td><td className="text-right font-mono font-bold text-rose-600">{f.type === 'EGRESOS' ? `S/ ${money(f.amountPen)}` : '—'}</td><td><button className="icon-button danger" onClick={() => deleteFinancialMovement(f.id)}><Trash2 className="h-4 w-4" /></button></td></tr>)}{!cash.length && <tr><td colSpan={6} className="empty-state">No hay movimientos de caja en este periodo.</td></tr>}</tbody></table></div></section>

      <section className="card p-5 xl:col-span-2"><div className="eyebrow">Estado de resultados</div><h2 className="mt-1 flex items-center gap-2 text-lg font-bold"><FileBarChart className="h-5 w-5 text-emerald-600" /> Rentabilidad estimada</h2><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span className="text-slate-500">Ventas netas</span><strong>S/ {money(salesTotal)}</strong></div><div className="flex justify-between"><span className="text-slate-500">Costo de mercadería vendida</span><strong className="text-rose-600">− S/ {money(costOfSales)}</strong></div><div className="flex justify-between border-y border-slate-200 py-3 dark:border-slate-800"><span className="font-semibold">Utilidad bruta</span><strong className="text-emerald-600">S/ {money(grossProfit)}</strong></div><div className="flex justify-between"><span className="text-slate-500">Gastos operativos</span><strong className="text-rose-600">− S/ {money(operatingExpenses)}</strong></div><div className="flex items-end justify-between rounded-xl bg-slate-950 p-4 text-white"><div><div className="text-[10px] uppercase tracking-wider text-slate-400">Resultado neto</div><div className="mt-1 text-[11px] text-slate-400">Margen {salesTotal ? ((netProfit / salesTotal) * 100).toFixed(1) : '0.0'}%</div></div><strong className={`text-xl ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>S/ {money(netProfit)}</strong></div><div className="rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800"><div className="flex justify-between"><span>Compras comprometidas</span><strong>S/ {money(purchaseTotal)}</strong></div><p className="mt-2 text-[10px] leading-relaxed text-slate-500">Las compras de inventario afectan caja, pero el estado de resultados reconoce como costo solo lo vendido.</p></div></div></section>
    </div>

    <section className="card overflow-hidden"><div className="border-b border-slate-200 p-4 dark:border-slate-800"><h2 className="text-sm font-bold">Cierres guardados</h2><p className="mt-1 text-[11px] text-slate-500">Fotografías inmutables del resumen que estabas revisando.</p></div><div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Cierre</th><th>Guardado</th><th className="text-right">Ingresos</th><th className="text-right">Egresos</th><th className="text-right">Saldo</th><th></th></tr></thead><tbody>{cashClosings.map(c => <tr key={c.id}><td><div className="font-semibold">{c.label}</div><div className="text-[10px] text-slate-500">{c.notes || 'Sin notas'}</div></td><td>{new Date(c.createdAt).toLocaleString('es-PE')}</td><td className="text-right font-mono">S/ {money(c.incomePen)}</td><td className="text-right font-mono">S/ {money(c.expensePen)}</td><td className="text-right font-mono font-bold">S/ {money(c.balancePen)}</td><td><button className="icon-button danger" onClick={() => deleteCashClosing(c.id)}><Trash2 className="h-4 w-4" /></button></td></tr>)}{!cashClosings.length && <tr><td colSpan={6} className="empty-state">Aún no has guardado cierres para consulta posterior.</td></tr>}</tbody></table></div></section>

    {movementOpen && <div className="modal-backdrop"><div className="modal-panel max-w-xl"><div className="modal-header"><h2 className="text-lg font-bold">Nuevo movimiento de caja</h2><button className="icon-button" onClick={() => setMovementOpen(false)}><X className="h-5 w-5" /></button></div><form onSubmit={saveMovement} className="space-y-4 p-5"><div className="grid gap-4 sm:grid-cols-2"><label className="form-label">Tipo<select className="field" value={movement.type} onChange={e => setMovement({ ...movement, type: e.target.value as any })}><option value="INGRESOS">Ingreso</option><option value="EGRESOS">Egreso</option></select></label><label className="form-label">Fecha<input type="date" className="field" value={movement.date} onChange={e => setMovement({ ...movement, date: e.target.value })} /></label><label className="form-label">Categoría<select className="field" value={movement.category} onChange={e => setMovement({ ...movement, category: e.target.value as any })}><option value="VENTA">Venta</option><option value="COMPRA">Compra</option><option value="TRANSPORTE">Transporte</option><option value="ESTIBA">Estiba</option><option value="BOLSAS">Bolsas</option><option value="AGUA">Agua</option><option value="LUZ">Luz</option><option value="OTROS">Otros</option></select></label><label className="form-label">Método<select className="field" value={movement.paymentMethod} onChange={e => setMovement({ ...movement, paymentMethod: e.target.value as PaymentMethod })}><option value="EFECTIVO">Efectivo</option><option value="YAPE">Yape</option><option value="TRANSFERENCIA">Transferencia</option><option value="CREDITO">Crédito</option></select></label><label className="form-label sm:col-span-2">Descripción<input className="field" required value={movement.description} onChange={e => setMovement({ ...movement, description: e.target.value })} /></label><label className="form-label">Monto S/<input type="number" min={0.01} step="0.01" className="field" required value={movement.amountPen} onChange={e => setMovement({ ...movement, amountPen: Number(e.target.value) || 0 })} /></label><label className="form-label">Caja<select className="field" value={movement.cashRegister} onChange={e => setMovement({ ...movement, cashRegister: e.target.value as any })}><option value="CAJA_1">Caja 1</option><option value="CAJA_2">Caja 2</option></select></label></div><div className="modal-actions"><button type="button" className="btn-secondary" onClick={() => setMovementOpen(false)}>Cancelar</button><button className="btn-primary">Guardar movimiento</button></div></form></div></div>}

    {closingOpen && <div className="modal-backdrop"><div className="modal-panel max-w-lg"><div className="modal-header"><h2 className="text-lg font-bold">Guardar cierre</h2><button className="icon-button" onClick={() => setClosingOpen(false)}><X className="h-5 w-5" /></button></div><form onSubmit={saveClosing} className="space-y-4 p-5"><div className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-950"><div className="flex justify-between"><span>Periodo</span><strong>{from} — {to}</strong></div><div className="mt-2 flex justify-between"><span>Saldo calculado</span><strong>S/ {money(cashBalance)}</strong></div></div><label className="form-label">Notas del cierre<textarea className="field min-h-24" placeholder="Ej.: Caja revisada y conciliada con Yape y banco." value={closingNotes} onChange={e => setClosingNotes(e.target.value)} /></label><div className="modal-actions"><button type="button" className="btn-secondary" onClick={() => setClosingOpen(false)}>Cancelar</button><button className="btn-primary"><Save className="h-4 w-4" /> Confirmar cierre</button></div></form></div></div>}
  </div>;
};
