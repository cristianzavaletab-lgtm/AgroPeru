import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, PurchaseItem } from '../../types';
import { QuickProductModal } from '../Products/QuickProductModal';
import { exportToCSV } from '../../utils/exportUtils';
import { ShoppingCart, Plus, Truck, PlusCircle, ChevronLeft, ChevronRight, Trash2, FileSpreadsheet } from 'lucide-react';

export const PurchaseRegister: React.FC = () => {
  const { purchases, suppliers, products, addPurchase, deletePurchase } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showQuickProductModal, setShowQuickProductModal] = useState(false);

  // Pagination State (Default 15 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'ALL'>(15);

  const totalPages = itemsPerPage === 'ALL' 
    ? 1 
    : Math.ceil(purchases.length / (itemsPerPage as number)) || 1;

  const paginatedPurchases = itemsPerPage === 'ALL'
    ? purchases
    : purchases.slice((currentPage - 1) * (itemsPerPage as number), currentPage * (itemsPerPage as number));

  // Form State
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [docNumber, setDocNumber] = useState(`F001-${Math.floor(100000 + Math.random() * 900000)}`);
  const [currency, setCurrency] = useState<'PEN' | 'USD'>('USD');
  const [freightCostPen, setFreightCostPen] = useState(1500);
  const [exchangeRate, setExchangeRate] = useState(3.75);

  const [items, setItems] = useState<PurchaseItem[]>([
    { 
      productId: products[0]?.id || '', 
      lotNumber: '001',
      quantityTm: 10, 
      bags: 200, 
      pricePerTmUsd: 560, 
      pricePerTmPen: 2100, 
      salePricePen: products[0]?.salePricePen || 2250,
      totalPen: 21000 
    }
  ]);

  const totalItemsPen = items.reduce((acc, i) => {
    const itemPen = currency === 'USD' ? ((i.pricePerTmUsd || 0) * exchangeRate * i.quantityTm) : i.totalPen;
    return acc + itemPen;
  }, 0);

  const totalPurchasePen = totalItemsPen + freightCostPen;
  const totalPurchaseUsd = exchangeRate > 0 ? (totalPurchasePen / exchangeRate) : 0;

  const handleAddItem = () => {
    const p = products[0];
    if (!p) return;
    const nextLotNum = String(items.length + 1).padStart(3, '0');
    const defaultBags = 100;
    const defaultTm = parseFloat((defaultBags * (p.bagWeightKg || 50) / 1000).toFixed(3));
    setItems(prev => [...prev, {
      productId: p.id,
      lotNumber: nextLotNum,
      quantityTm: defaultTm,
      bags: defaultBags,
      pricePerTmUsd: 550,
      pricePerTmPen: p.purchasePricePen,
      salePricePen: p.salePricePen,
      totalPen: defaultTm * p.purchasePricePen
    }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof PurchaseItem | 'bags_input', value: any) => {
    setItems(prev => prev.map((item, idx) => {
      if (idx === index) {
        const updated = { ...item };
        if (field === 'bags_input') {
          // User enters bags -> compute TM
          const bags = Math.round(Number(value) || 0);
          const prod = products.find(pr => pr.id === item.productId);
          const kgPerBag = prod?.bagWeightKg || 50;
          updated.bags = bags;
          updated.quantityTm = parseFloat((bags * kgPerBag / 1000).toFixed(3));
        } else if (field === 'productId') {
          updated.productId = value;
          const prod = products.find(pr => pr.id === value);
          if (prod) {
            updated.pricePerTmPen = prod.purchasePricePen;
            updated.salePricePen = prod.salePricePen;
            const kgPerBag = prod.bagWeightKg || 50;
            updated.quantityTm = parseFloat((updated.bags * kgPerBag / 1000).toFixed(3));
          }
        } else {
          (updated as any)[field] = value;
        }
        if (currency === 'USD') {
          updated.pricePerTmPen = Math.round((updated.pricePerTmUsd || 0) * exchangeRate);
        }
        updated.totalPen = updated.quantityTm * updated.pricePerTmPen;
        return updated;
      }
      return item;
    }));
  };

  const handleQuickProductCreated = (newProd: Product) => {
    const usdPrice = exchangeRate > 0 ? (newProd.purchasePricePen / exchangeRate) : 550;
    const nextLotNum = String(items.length + 1).padStart(3, '0');
    setItems(prev => [...prev, {
      productId: newProd.id,
      lotNumber: nextLotNum,
      quantityTm: 10,
      bags: 200,
      pricePerTmUsd: parseFloat(usdPrice.toFixed(2)),
      pricePerTmPen: newProd.purchasePricePen,
      salePricePen: newProd.salePricePen,
      totalPen: 10 * newProd.purchasePricePen
    }]);
  };

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const supp = suppliers.find(s => s.id === supplierId);

    addPurchase({
      supplierId,
      supplierName: supp?.companyName || 'Proveedor Agro',
      docNumber,
      purchaseDate: new Date().toISOString().split('T')[0],
      currency,
      exchangeRate,
      freightCostPen,
      totalUsd: totalPurchaseUsd,
      totalPen: totalPurchasePen,
      items: items.map(i => ({
        ...i,
        lotNumber: i.lotNumber || '001',
        salePricePen: i.salePricePen,
        pricePerTmPen: currency === 'USD' ? Math.round((i.pricePerTmUsd || 0) * exchangeRate) : i.pricePerTmPen,
        totalPen: i.quantityTm * (currency === 'USD' ? Math.round((i.pricePerTmUsd || 0) * exchangeRate) : i.pricePerTmPen)
      }))
    });

    setShowModal(false);
  };

  const handleExportPurchases = () => {
    const data = purchases.map(p => ({
      'Doc. N°': p.docNumber,
      'Fecha': p.purchaseDate,
      'Proveedor': p.supplierName,
      'Moneda': p.currency,
      'Tipo Cambio': p.exchangeRate,
      'Flete (S/)': p.freightCostPen.toFixed(2),
      'Total (S/)': p.totalPen.toFixed(2),
      'Lotes / Items': p.items.map(i => `${i.lotNumber || '001'} (${i.quantityTm} TM / ${i.bags} bls)`).join('; ')
    }));
    exportToCSV(data, 'Compras_Importaciones_AgroPeru');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            <span>Compras</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registro de ingresos de mercadería con lotes y flete.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPurchases}
            className="px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Compra</span>
          </button>
        </div>
      </div>

      {/* Purchases List Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Boleta / Factura N.º</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Proveedor</th>
                <th className="px-4 py-3">Lotes</th>
                <th className="px-4 py-3">Moneda & Tipo Cambio</th>
                <th className="px-4 py-3">Flete Transportista</th>
                <th className="px-4 py-3 text-right">Total Compra (S/)</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 font-medium">
                    No hay compras registradas. Usa "Nueva Compra" para agregar una.
                  </td>
                </tr>
              ) : (
                paginatedPurchases.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-slate-100">{p.docNumber}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.purchaseDate}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{p.supplierName}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.items?.map((it, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                            {it.lotNumber || '001'} ({it.quantityTm} TM)
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {p.currency || 'PEN'} @ S/ {(p.exchangeRate || 3.75).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1 font-mono">
                        <Truck className="w-3.5 h-3.5 text-slate-400" /> S/ {p.freightCostPen.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100 font-mono text-xs">
                      S/ {p.totalPen.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => deletePurchase(p.id)}
                        title="Eliminar compra"
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
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
              <option value={15}>15 compras</option>
              <option value={30}>30 compras</option>
              <option value={50}>50 compras</option>
              <option value="ALL">Todas las compras</option>
            </select>
            <span className="text-slate-400">
              (Mostrando {paginatedPurchases.length} de {purchases.length} compras)
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

      {/* Modal New Purchase */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Nueva Compra</h3>
              <button
                type="button"
                onClick={() => setShowQuickProductModal(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Crear Producto</span>
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Proveedor</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium"
                  >
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Guía / Factura</label>
                  <input
                    type="text"
                    required
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Moneda Compra</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold"
                  >
                    <option value="USD">DÓLARES ($ USD)</option>
                    <option value="PEN">SOLES (S/ PEN)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Tipo Cambio</label>
                  <input
                    type="number"
                    step="0.001"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Costo Flete Transportista (S/)</label>
                  <input
                    type="number"
                    value={freightCostPen}
                    onChange={(e) => setFreightCostPen(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono font-semibold"
                  />
                </div>
                <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400 pt-5">
                  <span>* El flete se prorratea automáticamente en el costo unitario por TM.</span>
                </div>
              </div>

              {/* Purchase Items */}
              <div className="space-y-3 border-t border-b border-slate-100 dark:border-slate-800 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Productos y Lotes</span>
                  <button type="button" onClick={handleAddItem} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer">
                    + Agregar Producto
                  </button>
                </div>

                <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400 px-1">
                  <div className="col-span-3">Producto</div>
                  <div className="col-span-2">N.º Lote</div>
                  <div className="col-span-2 text-right">Cant. Bolsas</div>
                  <div className="col-span-2 text-right">Costo Unit. ({currency})</div>
                  <div className="col-span-2 text-right">P. Venta (S/)</div>
                  <div className="col-span-1"></div>
                </div>

                {items.map((item, idx) => {
                  const itemPenPrice = currency === 'USD' ? ((item.pricePerTmUsd || 0) * exchangeRate) : item.pricePerTmPen;
                  const itemSubtotalPen = item.quantityTm * itemPenPrice;
                  const prod = products.find(p => p.id === item.productId);
                  const kgLabel = prod?.bagWeightKg ? `${prod.bagWeightKg}kg` : '50kg';

                  return (
                    <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-3">
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium"
                          >
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="N.º Lote"
                            value={item.lotNumber || ''}
                            onChange={(e) => handleItemChange(idx, 'lotNumber', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono font-semibold text-center"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="Bolsas"
                            value={item.bags || 0}
                            onChange={(e) => handleItemChange(idx, 'bags_input', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold text-right"
                          />
                        </div>
                        <div className="col-span-2">
                          {currency === 'USD' ? (
                            <input
                              type="number"
                              step="0.1"
                              placeholder="$/TM"
                              value={item.pricePerTmUsd}
                              onChange={(e) => handleItemChange(idx, 'pricePerTmUsd', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono font-semibold text-right"
                            />
                          ) : (
                            <input
                              type="number"
                              step="0.1"
                              placeholder="S//TM"
                              value={item.pricePerTmPen}
                              onChange={(e) => handleItemChange(idx, 'pricePerTmPen', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs text-right font-mono font-medium"
                            />
                          )}
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="0.1"
                            placeholder="P. Venta S/"
                            value={item.salePricePen || ''}
                            onChange={(e) => handleItemChange(idx, 'salePricePen', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono font-semibold text-right"
                            title="Precio de venta para este lote"
                          />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            disabled={items.length <= 1}
                            className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Eliminar fila"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-600 dark:text-slate-400 px-1">
                        <span className="font-mono">{item.bags} bolsas ({kgLabel}) = <strong className="text-slate-900 dark:text-slate-100">{item.quantityTm.toFixed(3)} TM</strong></span>
                        <span>
                          Subtotal: <strong className="font-mono text-slate-900 dark:text-slate-100">S/ {itemSubtotalPen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">TOTAL COMPRA:</span>
                  {currency === 'USD' && (
                    <span className="text-xs text-slate-500 font-mono font-medium">
                      = ${totalPurchaseUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                    </span>
                  )}
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">S/ {totalPurchasePen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-end gap-3">
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
                  Guardar Compra
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
        initialType="purchase"
      />
    </div>
  );
};
