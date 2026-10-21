import React, { useMemo, useState } from 'react';
import { Edit3, FileSpreadsheet, MapPin, Plus, Search, ShoppingCart, Trash2, Truck, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FreightCharge, PaymentMethod, Purchase, PurchaseItem, PurchaseStatus } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';
import { toLocalISODate } from '../../utils/dateUtils';

const today = () => toLocalISODate();
const money = (value: number) => value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface PurchaseForm {
  supplierId: string; docNumber: string; purchaseDate: string; currency: 'PEN' | 'USD'; exchangeRate: number;
  status: PurchaseStatus; paymentStatus: 'PENDIENTE' | 'PARCIAL' | 'PAGADO'; paymentMethod: PaymentMethod;
  paidAmount: number; expectedPickupDate: string; notes: string; items: PurchaseItem[]; freights: FreightCharge[];
}

export const PurchaseRegister: React.FC = () => {
  const { purchases, suppliers, products, addPurchase, updatePurchase, updatePurchaseStatus, deletePurchase, setActiveTab } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Purchase | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | PurchaseStatus>('TODOS');

  const blankItem = (): PurchaseItem => {
    const product = products[0];
    return { productId: product?.id || '', lotNumber: '', bags: 0, quantityTm: 0, pricePerTmPen: product?.purchasePricePen || 0, pricePerTmUsd: 0, salePricePen: product?.salePricePen || 0, totalPen: 0 };
  };
  const blankFreight = (): FreightCharge => ({ id: `freight-${Date.now()}`, origin: '', destination: 'Almacén AgroPerú', carrier: '', amountPen: 0, status: 'PENDIENTE', paymentMethod: 'EFECTIVO' });
  const emptyForm = (): PurchaseForm => ({ supplierId: suppliers[0]?.id || '', docNumber: '', purchaseDate: today(), currency: 'PEN', exchangeRate: 3.75, status: 'PENDIENTE_RECOJO', paymentStatus: 'PENDIENTE', paymentMethod: 'TRANSFERENCIA', paidAmount: 0, expectedPickupDate: '', notes: '', items: [blankItem()], freights: [blankFreight()] });
  const [form, setForm] = useState<PurchaseForm>(emptyForm);
  const inventoryLocked = !!editing && (editing.inventoryPosted ?? (editing.status === undefined || editing.status === 'RECIBIDO'));

  const merchandiseTotal = useMemo(() => form.items.reduce((sum, item) => sum + item.totalPen, 0), [form.items]);
  const freightTotal = useMemo(() => form.freights.reduce((sum, freight) => sum + Number(freight.amountPen || 0), 0), [form.freights]);
  const grandTotal = merchandiseTotal + freightTotal;

  const rows = useMemo(() => purchases.filter(p => {
    const matchesText = `${p.docNumber} ${p.supplierName}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'TODOS' || (p.status || 'RECIBIDO') === statusFilter;
    return matchesText && matchesStatus;
  }), [purchases, search, statusFilter]);

  const openNew = () => { setEditing(null); setForm(emptyForm()); setIsOpen(true); };
  const openEdit = (purchase: Purchase) => {
    setEditing({ ...purchase, inventoryPosted: purchase.inventoryPosted ?? (purchase.status === undefined || purchase.status === 'RECIBIDO') });
    setForm({
      supplierId: purchase.supplierId, docNumber: purchase.docNumber, purchaseDate: purchase.purchaseDate,
      currency: purchase.currency || 'PEN', exchangeRate: purchase.exchangeRate || 1,
      status: purchase.status || 'RECIBIDO', paymentStatus: purchase.paymentStatus || 'PAGADO',
      paymentMethod: purchase.paymentMethod || 'TRANSFERENCIA', paidAmount: purchase.paidAmount ?? purchase.totalPen,
      expectedPickupDate: purchase.expectedPickupDate || '', notes: purchase.notes || '',
      items: purchase.items.map(i => ({ ...i })), freights: purchase.freights?.map(f => ({ ...f })) || (purchase.freightCostPen ? [{ ...blankFreight(), amountPen: purchase.freightCostPen, status: 'PAGADO' }] : [blankFreight()])
    });
    setIsOpen(true);
  };

  const changeItem = (index: number, field: keyof PurchaseItem, raw: string) => {
    setForm(current => ({ ...current, items: current.items.map((item, i) => {
      if (i !== index) return item;
      const next = { ...item };
      if (field === 'productId' || field === 'lotNumber') (next as any)[field] = raw;
      else (next as any)[field] = Number(raw) || 0;
      const product = products.find(p => p.id === next.productId);
      if (field === 'productId' && product) { next.pricePerTmPen = product.purchasePricePen; next.salePricePen = product.salePricePen; }
      if (field === 'bags' || field === 'productId') next.quantityTm = Number(((next.bags * (product?.bagWeightKg || 50)) / 1000).toFixed(3));
      const unitPen = current.currency === 'USD' ? (next.pricePerTmUsd || 0) * current.exchangeRate : next.pricePerTmPen;
      next.totalPen = Number((next.quantityTm * unitPen).toFixed(2));
      return next;
    }) }));
  };

  const recalculateCurrency = (currency: 'PEN' | 'USD', exchangeRate = form.exchangeRate) => {
    setForm(current => ({ ...current, currency, exchangeRate, items: current.items.map(item => ({
      ...item,
      totalPen: Number((item.quantityTm * (currency === 'USD' ? (item.pricePerTmUsd || 0) * exchangeRate : item.pricePerTmPen)).toFixed(2))
    })) }));
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const supplier = suppliers.find(s => s.id === form.supplierId);
    if (!supplier || !form.items.length) return;
    const payload: Omit<Purchase, 'id'> = {
      supplierId: supplier.id, supplierName: supplier.companyName, docNumber: form.docNumber,
      purchaseDate: form.purchaseDate, currency: form.currency, exchangeRate: form.exchangeRate,
      freightCostPen: freightTotal, freights: form.freights.filter(f => f.origin || f.amountPen), totalPen: grandTotal,
      totalUsd: form.currency === 'USD' ? grandTotal / form.exchangeRate : undefined,
      items: form.items, status: form.status, paymentStatus: form.paymentStatus,
      paymentMethod: form.paymentStatus === 'PENDIENTE' ? 'CREDITO' : form.paymentMethod,
      paidAmount: form.paymentStatus === 'PAGADO' ? grandTotal : form.paidAmount,
      expectedPickupDate: form.expectedPickupDate || undefined, notes: form.notes,
      inventoryPosted: inventoryLocked
    };
    if (editing) updatePurchase(editing.id, payload); else addPurchase(payload);
    setIsOpen(false);
  };

  const totalCommitted = purchases.filter(p => p.status !== 'CANCELADO').reduce((sum, p) => sum + p.totalPen, 0);
  const pendingCount = purchases.filter(p => ['PENDIENTE_RECOJO', 'EN_TRANSITO'].includes(p.status || 'RECIBIDO')).length;
  const totalFreight = purchases.reduce((sum, p) => sum + (p.freights?.reduce((a, f) => a + f.amountPen, 0) || p.freightCostPen || 0), 0);

  const exportRows = () => exportToCSV(rows.map(p => ({ Fecha: p.purchaseDate, Documento: p.docNumber, Proveedor: p.supplierName, Estado: p.status || 'RECIBIDO', Mercadería: p.totalPen - p.freightCostPen, Fletes: p.freightCostPen, Total: p.totalPen })), 'Compras_AgroPeru');

  return <div className="space-y-5">
    <section className="page-header"><div><div className="eyebrow">Abastecimiento y recepción</div><h1 className="page-title"><ShoppingCart className="h-5 w-5 text-emerald-600" /> Compras</h1><p className="page-subtitle">Separa el pago, el traslado y el ingreso real al inventario.</p></div><div className="flex gap-2"><button className="btn-secondary" onClick={exportRows}><FileSpreadsheet className="h-4 w-4" /> Exportar</button><button className="btn-primary" onClick={openNew}><Plus className="h-4 w-4" /> Nueva compra</button></div></section>

    <div className="grid gap-3 sm:grid-cols-3">
      <div className="stat-card"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Compras acumuladas</div><div className="mt-2 text-2xl font-bold tabular-nums">S/ {money(totalCommitted)}</div></div>
      <div className="stat-card"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pendientes de recibir</div><div className="mt-2 flex items-center gap-2 text-2xl font-bold"><Truck className="h-5 w-5 text-amber-500" />{pendingCount}</div></div>
      <div className="stat-card"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fletes registrados</div><div className="mt-2 text-2xl font-bold tabular-nums">S/ {money(totalFreight)}</div></div>
    </div>

    <section className="card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row dark:border-slate-800"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input className="field mt-0 pl-9" placeholder="Buscar documento o proveedor" value={search} onChange={e => setSearch(e.target.value)} /></div><select className="field mt-0 sm:w-52" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}><option value="TODOS">Todos los estados</option><option value="PENDIENTE_RECOJO">Pendiente de recojo</option><option value="EN_TRANSITO">En tránsito</option><option value="RECIBIDO">Recibido</option><option value="CANCELADO">Cancelado</option></select></div>
      <div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Compra</th><th>Proveedor</th><th>Productos</th><th>Fletes</th><th>Pago</th><th>Recepción</th><th className="text-right">Total</th><th className="text-right">Acciones</th></tr></thead><tbody>
        {rows.map(p => {
          const received = p.inventoryPosted === true || p.status === undefined || p.status === 'RECIBIDO';
          return <tr key={p.id}><td><div className="font-mono font-bold text-slate-900 dark:text-white">{p.docNumber}</div><div className="text-[11px] text-slate-500">{p.purchaseDate}</div></td><td className="font-semibold">{p.supplierName}</td><td>{p.items.length} producto{p.items.length === 1 ? '' : 's'}<div className="text-[11px] text-slate-500">{p.items.reduce((s, i) => s + i.bags, 0)} bolsas</div></td><td><div>S/ {money(p.freightCostPen || 0)}</div><div className="text-[11px] text-slate-500">{p.freights?.length || (p.freightCostPen ? 1 : 0)} tramo(s)</div></td><td><div className="font-semibold">{p.paymentStatus || 'PAGADO'}</div><div className="text-[11px] text-slate-500">{p.paymentMethod || 'No indicado'}</div></td><td><select className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold dark:border-slate-700 dark:bg-slate-950" value={p.status || 'RECIBIDO'} onChange={e => updatePurchaseStatus(p.id, e.target.value as PurchaseStatus)} disabled={p.status === 'CANCELADO' || received}><option value="PENDIENTE_RECOJO">PENDIENTE RECOJO</option><option value="EN_TRANSITO">EN TRÁNSITO</option><option value="RECIBIDO">RECIBIDO</option><option value="CANCELADO">CANCELADO</option></select></td><td className="text-right font-mono font-bold">S/ {money(p.totalPen)}</td><td><div className="flex justify-end gap-1"><button className="icon-button" title="Editar compra" onClick={() => openEdit(p)}><Edit3 className="h-4 w-4" /></button><button className="icon-button danger" title={received ? 'La compra recibida conserva su trazabilidad' : 'Eliminar compra pendiente'} disabled={received} onClick={() => deletePurchase(p.id)}><Trash2 className="h-4 w-4" /></button></div></td></tr>;
        })}
        {!rows.length && <tr><td colSpan={8} className="empty-state">No hay compras para este filtro.</td></tr>}
      </tbody></table></div>
    </section>

    {isOpen && <div className="modal-backdrop"><div className="modal-panel max-w-5xl"><div className="modal-header"><div><div className="eyebrow">{editing ? 'Edición con trazabilidad' : 'Nueva orden de compra'}</div><h2 className="text-lg font-bold">{editing ? editing.docNumber : 'Registrar compra'}</h2></div><button className="icon-button" onClick={() => setIsOpen(false)}><X className="h-5 w-5" /></button></div><form onSubmit={save} className="space-y-6 p-5">
      {!suppliers.length && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800"><strong>Primero registra un proveedor.</strong><button type="button" className="ml-2 underline" onClick={() => { setIsOpen(false); setActiveTab('suppliers'); }}>Ir a Proveedores</button></div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><label className="form-label sm:col-span-2">Proveedor *<select className="field" required value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })}><option value="">Selecciona un proveedor</option>{suppliers.filter(s => s.active !== false).map(s => <option key={s.id} value={s.id}>{s.companyName} · {s.docType || (s.ruc.length === 8 ? 'DNI' : 'RUC')} {s.ruc}</option>)}</select></label><label className="form-label">Guía / factura *<input className="field font-mono" required value={form.docNumber} onChange={e => setForm({ ...form, docNumber: e.target.value })} /></label><label className="form-label">Fecha<input type="date" className="field" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} /></label><label className="form-label">Estado logístico<select className="field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as PurchaseStatus })} disabled={!!editing?.inventoryPosted}><option value="PENDIENTE_RECOJO">Pendiente de recojo</option><option value="EN_TRANSITO">En tránsito</option><option value="RECIBIDO">Recibido en almacén</option></select></label><label className="form-label">Fecha esperada<input type="date" className="field" value={form.expectedPickupDate} onChange={e => setForm({ ...form, expectedPickupDate: e.target.value })} /></label><label className="form-label">Moneda<select className="field" value={form.currency} onChange={e => recalculateCurrency(e.target.value as any)}><option value="PEN">Soles (PEN)</option><option value="USD">Dólares (USD)</option></select></label><label className="form-label">Tipo de cambio<input type="number" step="0.001" className="field" value={form.exchangeRate} onChange={e => recalculateCurrency(form.currency, Number(e.target.value) || 1)} /></label></div>

      <div><div className="mb-3 flex items-center justify-between"><div><h3 className="text-sm font-bold">Productos y lotes</h3><p className="text-[11px] text-slate-500">El stock se actualiza únicamente cuando la compra queda recibida.</p></div><button type="button" className="btn-secondary" onClick={() => setForm({ ...form, items: [...form.items, blankItem()] })} disabled={!!editing?.inventoryPosted}><Plus className="h-4 w-4" /> Producto</button></div><div className="space-y-2">{form.items.map((item, index) => <div key={index} className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-12 dark:border-slate-800 dark:bg-slate-950/50"><label className="form-label sm:col-span-3">Producto<select className="field" disabled={!!editing?.inventoryPosted} value={item.productId} onChange={e => changeItem(index, 'productId', e.target.value)}>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label className="form-label sm:col-span-2">Lote<input className="field" disabled={!!editing?.inventoryPosted} value={item.lotNumber || ''} onChange={e => changeItem(index, 'lotNumber', e.target.value)} /></label><label className="form-label sm:col-span-2">Bolsas<input type="number" className="field text-right" disabled={!!editing?.inventoryPosted} value={item.bags} onChange={e => changeItem(index, 'bags', e.target.value)} /></label><label className="form-label sm:col-span-2">Costo / TM ({form.currency})<input type="number" className="field text-right" disabled={!!editing?.inventoryPosted} value={form.currency === 'USD' ? item.pricePerTmUsd : item.pricePerTmPen} onChange={e => changeItem(index, form.currency === 'USD' ? 'pricePerTmUsd' : 'pricePerTmPen', e.target.value)} /></label><label className="form-label sm:col-span-2">Venta / TM<input type="number" className="field text-right" disabled={!!editing?.inventoryPosted} value={item.salePricePen || 0} onChange={e => changeItem(index, 'salePricePen', e.target.value)} /></label><div className="flex items-end justify-center sm:col-span-1"><button type="button" className="icon-button danger" disabled={form.items.length === 1 || !!editing?.inventoryPosted} onClick={() => setForm({ ...form, items: form.items.filter((_, i) => i !== index) })}><Trash2 className="h-4 w-4" /></button></div><div className="text-[11px] text-slate-500 sm:col-span-12">{item.quantityTm.toFixed(3)} TM · Subtotal S/ {money(item.totalPen)}</div></div>)}</div></div>

      <div><div className="mb-3 flex items-center justify-between"><div><h3 className="text-sm font-bold">Fletes por origen</h3><p className="text-[11px] text-slate-500">Registra cada recojo, transportista y pago por separado.</p></div><button type="button" className="btn-secondary" onClick={() => setForm({ ...form, freights: [...form.freights, blankFreight()] })}><Plus className="h-4 w-4" /> Flete</button></div><div className="space-y-2">{form.freights.map((freight, index) => <div key={freight.id} className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-12 dark:border-slate-800"><label className="form-label sm:col-span-3">Origen<div className="relative"><MapPin className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400" /><input className="field pl-8" value={freight.origin} onChange={e => setForm({ ...form, freights: form.freights.map((f, i) => i === index ? { ...f, origin: e.target.value } : f) })} /></div></label><label className="form-label sm:col-span-3">Transportista<input className="field" value={freight.carrier || ''} onChange={e => setForm({ ...form, freights: form.freights.map((f, i) => i === index ? { ...f, carrier: e.target.value } : f) })} /></label><label className="form-label sm:col-span-2">Costo S/<input type="number" className="field text-right" value={freight.amountPen} onChange={e => setForm({ ...form, freights: form.freights.map((f, i) => i === index ? { ...f, amountPen: Number(e.target.value) || 0 } : f) })} /></label><label className="form-label sm:col-span-2">Estado<select className="field" value={freight.status} onChange={e => setForm({ ...form, freights: form.freights.map((f, i) => i === index ? { ...f, status: e.target.value as any } : f) })}><option value="PENDIENTE">Pendiente</option><option value="PAGADO">Pagado</option></select></label><div className="flex items-end justify-center sm:col-span-2"><button type="button" className="icon-button danger" disabled={form.freights.length === 1} onClick={() => setForm({ ...form, freights: form.freights.filter((_, i) => i !== index) })}><Trash2 className="h-4 w-4" /></button></div></div>)}</div></div>

      <div className="grid gap-4 rounded-xl bg-slate-950 p-4 text-white sm:grid-cols-4"><label className="form-label !text-slate-300">Estado de pago<select className="field" value={form.paymentStatus} onChange={e => setForm({ ...form, paymentStatus: e.target.value as any })}><option value="PENDIENTE">Pendiente</option><option value="PARCIAL">Parcial</option><option value="PAGADO">Pagado</option></select></label><label className="form-label !text-slate-300">Método<select className="field" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}><option value="EFECTIVO">Efectivo</option><option value="YAPE">Yape</option><option value="TRANSFERENCIA">Transferencia</option><option value="CREDITO">Crédito</option></select></label>{form.paymentStatus === 'PARCIAL' && <label className="form-label !text-slate-300">Monto pagado<input type="number" className="field text-right" value={form.paidAmount} onChange={e => setForm({ ...form, paidAmount: Number(e.target.value) || 0 })} /></label>}<div className="sm:col-span-1 sm:text-right"><div className="text-[10px] uppercase tracking-wider text-slate-400">Total compra</div><div className="mt-2 text-2xl font-bold">S/ {money(grandTotal)}</div><div className="text-[11px] text-slate-400">Mercadería {money(merchandiseTotal)} + fletes {money(freightTotal)}</div></div></div>
      <label className="form-label">Notas<textarea className="field min-h-20" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
      <div className="modal-actions"><button type="button" className="btn-secondary" onClick={() => setIsOpen(false)}>Cancelar</button><button className="btn-primary" disabled={!suppliers.length || !products.length}>{editing ? 'Guardar cambios' : 'Guardar compra'}</button></div>
    </form></div></div>}
  </div>;
};
