import React, { useMemo, useState } from 'react';
import { Ban, ChevronRight, Eye, FileSpreadsheet, Plus, Printer, Receipt, Search, Trash2, WalletCards, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, Sale, SaleDocumentKind, SaleItem } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';
import { toLocalISODate } from '../../utils/dateUtils';
import { printSaleDocument } from './saleDocument';

const money = (value: number) => value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = () => toLocalISODate();

export const SalesManager: React.FC = () => {
  const { sales, products, lots, customers, addSale, anularSale, deleteSale, updateSaleStatus, issueSaleDocument, setActiveTab, setErrorMessage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [detail, setDetail] = useState<Sale | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO');
  const [paidAmount, setPaidAmount] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);

  const makeItem = (): SaleItem => {
    const product = products[0];
    const price = product ? product.salePricePen / (1000 / product.bagWeightKg) : 0;
    return { productId: product?.id || '', productName: product?.name || '', lotNumber: '', quantity: 1, unitPrice: price, total: price };
  };
  const total = items.reduce((sum, item) => sum + item.total, 0);
  const activeSales = sales.filter(s => s.status !== 'ANULADO');
  const soldTotal = activeSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const collected = activeSales.reduce((sum, s) => sum + s.paidAmount, 0);
  const receivable = activeSales.reduce((sum, s) => sum + Math.max(0, s.totalAmount - s.paidAmount), 0);

  const rows = useMemo(() => sales.filter(s => {
    const matches = `${s.proformaNumber} ${s.documentNumber || ''} ${s.customerName}`.toLowerCase().includes(search.toLowerCase());
    return matches && (statusFilter === 'TODOS' || s.status === statusFilter);
  }), [sales, search, statusFilter]);

  const openNew = () => {
    setCustomerId(customers[0]?.id || ''); setPaymentMethod('EFECTIVO'); setPaidAmount(0); setDueDate(''); setNotes(''); setItems([makeItem()]); setIsOpen(true);
  };
  const changeItem = (index: number, field: keyof SaleItem, raw: string) => {
    setItems(current => current.map((item, i) => {
      if (i !== index) return item;
      const next = { ...item };
      if (field === 'productId' || field === 'lotNumber') (next as any)[field] = raw; else (next as any)[field] = Number(raw) || 0;
      if (field === 'productId') {
        const product = products.find(p => p.id === raw);
        if (product) { next.productName = product.name; next.lotNumber = ''; next.unitPrice = product.salePricePen / (1000 / product.bagWeightKg); }
      }
      if (field === 'lotNumber' && raw) {
        const lot = lots.find(l => l.productId === next.productId && l.lotNumber === raw);
        const product = products.find(p => p.id === next.productId);
        if (lot && product) next.unitPrice = lot.salePricePen / (1000 / product.bagWeightKg);
      }
      next.total = Number((next.quantity * next.unitPrice).toFixed(2));
      return next;
    }));
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const customer = customers.find(c => c.id === customerId);
    if (!customer || !items.length) return;
    const isCredit = paymentMethod === 'CREDITO';
    const actualPaid = isCredit ? Math.min(paidAmount, total) : total;
    const reference = `V-${String(sales.length + 1).padStart(5, '0')}`;
    const success = addSale({
      proformaNumber: reference, saleDate: today(), customerId: customer.id,
      customerName: `${customer.name} ${customer.lastName || ''}`.trim(),
      status: isCredit ? 'CREDITO' : 'PAGADO', paymentMethod, totalAmount: total, paidAmount: actualPaid,
      items, notes, dueDate: isCredit ? dueDate : undefined, documentType: 'SIN_COMPROBANTE', sunatStatus: 'NO_APLICA',
      deliveryStatus: 'PENDIENTE'
    });
    if (success) setIsOpen(false);
  };

  const selectedCustomer = detail ? customers.find(c => c.id === detail.customerId) : undefined;
  const canInvoice = selectedCustomer?.docType === 'RUC' || selectedCustomer?.docNumber?.length === 11;
  const issue = (kind: SaleDocumentKind) => {
    if (!detail) return;
    if (kind === 'FACTURA' && !canInvoice) return;
    const issuedSale = issueSaleDocument(detail.id, kind);
    if (issuedSale) setDetail(issuedSale);
  };

  const printDocument = () => {
    if (!detail) return;
    if (!printSaleDocument(detail, selectedCustomer)) {
      setErrorMessage('El navegador bloqueó la vista del comprobante. Habilita las ventanas emergentes e inténtalo otra vez.');
    }
  };

  const exportRows = () => exportToCSV(rows.map(s => ({ Fecha: s.saleDate, Operación: s.proformaNumber, Comprobante: s.documentNumber || s.documentType || 'SIN COMPROBANTE', Cliente: s.customerName, Pago: s.paymentMethod || 'NO INDICADO', Estado: s.status, Total: s.totalAmount, Cobrado: s.paidAmount, Saldo: s.totalAmount - s.paidAmount })), 'Ventas_AgroPeru');

  return <div className="space-y-5">
    <section className="page-header"><div><div className="eyebrow">Ventas y comprobantes</div><h1 className="page-title"><Receipt className="h-5 w-5 text-emerald-600" /> Ventas</h1><p className="page-subtitle">Consulta cada operación, cobro, cliente, entrega y comprobante sin perder el detalle.</p></div><div className="flex gap-2"><button className="btn-secondary" onClick={exportRows}><FileSpreadsheet className="h-4 w-4" /> Exportar</button><button className="btn-primary" onClick={openNew}><Plus className="h-4 w-4" /> Nueva venta</button></div></section>

    <div className="grid gap-3 sm:grid-cols-3"><div className="stat-card"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total vendido</div><div className="mt-2 text-2xl font-bold">S/ {money(soldTotal)}</div><div className="mt-1 text-[11px] text-slate-500">{activeSales.length} operaciones activas</div></div><div className="stat-card"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Dinero ingresado</div><div className="mt-2 text-2xl font-bold text-emerald-600">S/ {money(collected)}</div><div className="mt-1 text-[11px] text-slate-500">Efectivo, Yape y transferencias</div></div><div className="stat-card"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Por cobrar</div><div className="mt-2 text-2xl font-bold text-amber-600">S/ {money(receivable)}</div><div className="mt-1 text-[11px] text-slate-500">Créditos y saldos pendientes</div></div></div>

    <section className="card overflow-hidden"><div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row dark:border-slate-800"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input className="field mt-0 pl-9" placeholder="Buscar cliente, operación o comprobante" value={search} onChange={e => setSearch(e.target.value)} /></div><select className="field mt-0 sm:w-48" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="TODOS">Todos los estados</option><option value="PAGADO">Pagado</option><option value="CREDITO">Crédito</option><option value="PENDIENTE">Pendiente</option><option value="ENTREGADO">Entregado</option><option value="ANULADO">Anulado</option></select></div><div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Operación</th><th>Cliente</th><th>Detalle</th><th>Pago</th><th>Comprobante</th><th className="text-right">Total</th><th className="text-right">Acciones</th></tr></thead><tbody>
      {rows.map(s => <tr key={s.id} className={s.status === 'ANULADO' ? 'opacity-55' : ''}><td><div className="font-mono font-bold text-slate-900 dark:text-white">{s.proformaNumber}</div><div className="text-[11px] text-slate-500">{s.saleDate}</div></td><td><div className="font-semibold">{s.customerName}</div><div className="text-[11px] text-slate-500">{s.deliveryStatus === 'ENTREGADO' || s.status === 'ENTREGADO' ? 'Mercadería entregada' : 'Entrega pendiente'}</div></td><td>{s.items.length} producto{s.items.length === 1 ? '' : 's'}<div className="max-w-[260px] truncate text-[11px] text-slate-500">{s.items.map(i => `${i.quantity} × ${i.productName}`).join(', ')}</div></td><td><div className="font-bold">{s.paymentMethod || (s.status === 'CREDITO' ? 'CREDITO' : 'NO INDICADO')}</div><div className="text-[11px] text-slate-500">Cobrado S/ {money(s.paidAmount)}</div></td><td><div className="font-semibold">{s.documentType?.replace(/_/g, ' ') || 'SIN COMPROBANTE'}</div><div className="text-[11px] text-slate-500">{s.documentNumber || (s.sunatStatus === 'PENDIENTE' ? 'Pendiente SUNAT' : 'Se elige al guardar')}</div></td><td className="text-right font-mono font-bold">S/ {money(s.totalAmount)}{s.totalAmount > s.paidAmount && <div className="text-[11px] text-amber-600">Saldo S/ {money(s.totalAmount - s.paidAmount)}</div>}</td><td><div className="flex justify-end gap-1"><button className="icon-button" title="Ver detalle" onClick={() => setDetail(s)}><Eye className="h-4 w-4" /></button>{s.status === 'CREDITO' && <button className="icon-button" title="Marcar como pagado" onClick={() => updateSaleStatus(s.id, 'PAGADO')}><WalletCards className="h-4 w-4" /></button>}{s.status !== 'ANULADO' && <button className="icon-button" title="Anular" onClick={() => anularSale(s.id)}><Ban className="h-4 w-4" /></button>}<button className="icon-button danger" title="Eliminar" onClick={() => deleteSale(s.id)}><Trash2 className="h-4 w-4" /></button></div></td></tr>)}
      {!rows.length && <tr><td colSpan={7} className="empty-state">No hay ventas para este filtro.</td></tr>}
    </tbody></table></div></section>

    {isOpen && <div className="modal-backdrop"><div className="modal-panel max-w-4xl"><div className="modal-header"><div><div className="eyebrow">Venta rápida y trazable</div><h2 className="text-lg font-bold">Nueva venta</h2></div><button className="icon-button" onClick={() => setIsOpen(false)}><X className="h-5 w-5" /></button></div><form onSubmit={save} className="space-y-5 p-5">
      {!customers.length && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800"><strong>Necesitas un cliente.</strong><button type="button" className="ml-2 underline" onClick={() => { setIsOpen(false); setActiveTab('customers'); }}>Ir a Clientes</button></div>}
      <div className="grid gap-4 sm:grid-cols-3"><label className="form-label sm:col-span-2">Cliente *<select className="field" value={customerId} required onChange={e => setCustomerId(e.target.value)}><option value="">Selecciona un cliente</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.lastName || ''} · {c.docType} {c.docNumber}</option>)}</select><span className="mt-1 block text-[10px] font-normal text-slate-500">DNI y RUC pueden validarse al crear o editar la ficha del cliente.</span></label><label className="form-label">Método de pago<select className="field" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}><option value="EFECTIVO">Efectivo</option><option value="YAPE">Yape</option><option value="TRANSFERENCIA">Transferencia</option><option value="CREDITO">Crédito</option></select></label>{paymentMethod === 'CREDITO' && <><label className="form-label">Abono inicial<input type="number" className="field" min={0} max={total} value={paidAmount} onChange={e => setPaidAmount(Number(e.target.value) || 0)} /></label><label className="form-label">Vencimiento<input type="date" className="field" value={dueDate} onChange={e => setDueDate(e.target.value)} /></label></>}</div>
      <div><div className="mb-3 flex items-center justify-between"><div><h3 className="text-sm font-bold">Cantidad, descripción y precio</h3><p className="text-[11px] text-slate-500">Estructura simple para proformas, boletas y facturas.</p></div><button type="button" className="btn-secondary" onClick={() => setItems([...items, makeItem()])}><Plus className="h-4 w-4" /> Ítem</button></div><div className="space-y-2">{items.map((item, index) => { const available = lots.filter(l => l.productId === item.productId && l.status === 'DISPONIBLE'); const product = products.find(p => p.id === item.productId); return <div key={index} className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-12 dark:border-slate-800 dark:bg-slate-950/50"><label className="form-label sm:col-span-4">Descripción<select className="field" value={item.productId} onChange={e => changeItem(index, 'productId', e.target.value)}>{products.map(p => <option key={p.id} value={p.id}>{p.name} · {p.currentBags} bolsas</option>)}</select></label><label className="form-label sm:col-span-3">Lote<select className="field" value={item.lotNumber || ''} onChange={e => changeItem(index, 'lotNumber', e.target.value)}><option value="">FIFO automático</option>{available.map(l => <option key={l.id} value={l.lotNumber}>{l.lotNumber} · {l.currentBags} bolsas</option>)}</select></label><label className="form-label sm:col-span-2">Cantidad<input type="number" min={1} className="field text-right" value={item.quantity} onChange={e => changeItem(index, 'quantity', e.target.value)} /></label><label className="form-label sm:col-span-2">Precio unitario<input type="number" min={0} step="0.01" className="field text-right" value={item.unitPrice} onChange={e => changeItem(index, 'unitPrice', e.target.value)} /></label><div className="flex items-end justify-center sm:col-span-1"><button type="button" className="icon-button danger" disabled={items.length === 1} onClick={() => setItems(items.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></button></div><div className="flex justify-between text-[11px] text-slate-500 sm:col-span-12"><span>{item.quantity} bolsas · {((item.quantity * (product?.bagWeightKg || 50)) / 1000).toFixed(3)} TM</span><strong className="text-slate-900 dark:text-white">Subtotal S/ {money(item.total)}</strong></div></div>; })}</div></div>
      <label className="form-label">Notas de la venta<textarea className="field min-h-20" value={notes} onChange={e => setNotes(e.target.value)} /></label>
      <div className="rounded-xl bg-slate-950 p-4 text-white"><div className="flex items-center justify-between"><div><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total de la venta</div><div className="mt-1 text-[11px] text-slate-400">El comprobante se elige después de guardar.</div></div><div className="text-2xl font-bold">S/ {money(total)}</div></div></div>
      <div className="modal-actions"><button type="button" className="btn-secondary" onClick={() => setIsOpen(false)}>Cancelar</button><button className="btn-primary" disabled={!customers.length || !products.length}>Guardar venta</button></div>
    </form></div></div>}

    {detail && <div className="modal-backdrop"><div className="modal-panel max-w-3xl"><div className="modal-header"><div><div className="eyebrow">Detalle de venta</div><h2 className="text-lg font-bold">{detail.documentNumber || detail.proformaNumber} · {detail.customerName}</h2></div><button className="icon-button" onClick={() => setDetail(null)}><X className="h-5 w-5" /></button></div><div className="space-y-5 p-5"><div className="grid gap-3 sm:grid-cols-4"><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><div className="text-[10px] uppercase text-slate-500">Fecha</div><div className="mt-1 font-bold">{detail.saleDate}</div></div><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><div className="text-[10px] uppercase text-slate-500">Pago</div><div className="mt-1 font-bold">{detail.paymentMethod || detail.status}</div></div><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><div className="text-[10px] uppercase text-slate-500">Cobrado</div><div className="mt-1 font-bold">S/ {money(detail.paidAmount)}</div></div><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><div className="text-[10px] uppercase text-slate-500">Total</div><div className="mt-1 font-bold">S/ {money(detail.totalAmount)}</div></div></div><div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"><table className="data-table"><thead><tr><th>Cantidad</th><th>Descripción</th><th>Lote</th><th className="text-right">Precio</th><th className="text-right">Importe</th></tr></thead><tbody>{detail.items.map((item, i) => <tr key={i}><td>{item.quantity}</td><td className="font-semibold">{item.productName}</td><td className="font-mono">{item.lotNumber || 'FIFO'}</td><td className="text-right">S/ {money(item.unitPrice)}</td><td className="text-right font-bold">S/ {money(item.total)}</td></tr>)}</tbody></table></div>
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20"><div className="mb-3"><h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">Emitir comprobante de prueba</h3><p className="text-[11px] text-emerald-800 dark:text-emerald-400">Selecciona boleta para DNI/público general o factura para un cliente con RUC. Por ahora se genera una vista imprimible sin envío a SUNAT.</p></div><div className="grid gap-2 sm:grid-cols-2"><button className={detail.documentType === 'BOLETA' ? 'btn-primary' : 'btn-secondary'} onClick={() => issue('BOLETA')}>Generar boleta</button><button className={detail.documentType === 'FACTURA' ? 'btn-primary' : 'btn-secondary'} disabled={!canInvoice} title={!canInvoice ? 'La factura requiere cliente con RUC' : ''} onClick={() => issue('FACTURA')}>Generar factura</button></div>{!canInvoice && <p className="mt-2 text-[10px] text-amber-700">La factura se habilita cuando el cliente tiene RUC de 11 dígitos.</p>}{(detail.documentType === 'BOLETA' || detail.documentType === 'FACTURA') && <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px] font-semibold text-amber-800">{detail.documentType} {detail.documentNumber} · Documento de prueba, pendiente de integración con SUNAT.</div>}</div>
      <div className="modal-actions"><button className="btn-secondary" onClick={printDocument}><Printer className="h-4 w-4" /> Ver e imprimir comprobante</button><button className="btn-primary" onClick={() => setDetail(null)}>Cerrar <ChevronRight className="h-4 w-4" /></button></div></div></div></div>}
  </div>;
};
