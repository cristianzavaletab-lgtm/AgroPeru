import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';
import { Plus, Search, Filter, Package, Edit, FlaskConical, ChevronLeft, ChevronRight, Trash2, FileSpreadsheet, X, DollarSign, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

export const ProductCatalog: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [initialStockBags, setInitialStockBags] = useState(0);
  const [showDollarPanel, setShowDollarPanel] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'ALL'>(15);

  // Dollar rate state
  const [dollarRate, setDollarRate] = useState<number>(3.75);
  const [dollarRateInput, setDollarRateInput] = useState<string>('3.75');
  const [priceInUsd, setPriceInUsd] = useState<number>(0);
  const [priceMarginPct, setPriceMarginPct] = useState<number>(6);
  const [applyToAll, setApplyToAll] = useState<boolean>(true);

  // Form State
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    categoryId: string;
    unit: Product['unit'];
    bagWeightKg: number;
    minStockTm: number;
    purchasePricePen: number;
    salePricePen: number;
    isMix: boolean;
    active: boolean;
  }>({
    code: '',
    name: '',
    categoryId: categories[0]?.id || '',
    unit: 'TM',
    bagWeightKg: 50,
    minStockTm: 5,
    purchasePricePen: 0,
    salePricePen: 0,
    isMix: false,
    active: true
  });

  const tmFromBags = (bags: number, bagKg: number) => parseFloat((bags * bagKg / 1000).toFixed(3));
  const bagsFromTm = (tm: number, bagKg: number) => Math.round(tm * 1000 / bagKg);
  const minStockBags = bagsFromTm(formData.minStockTm, formData.bagWeightKg);
  const initialStockTm = tmFromBags(initialStockBags, formData.bagWeightKg);
  const purchasePerBag = formData.purchasePricePen * formData.bagWeightKg / 1000;
  const salePerBag = formData.salePricePen * formData.bagWeightKg / 1000;
  const marginPerBag = salePerBag - purchasePerBag;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalPages = itemsPerPage === 'ALL'
    ? 1
    : Math.ceil(filteredProducts.length / (itemsPerPage as number)) || 1;

  const paginatedProducts = itemsPerPage === 'ALL'
    ? filteredProducts
    : filteredProducts.slice((currentPage - 1) * (itemsPerPage as number), currentPage * (itemsPerPage as number));

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setInitialStockBags(0);
    setFormData({
      code: `PROD-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      categoryId: categories[0]?.id || '',
      unit: 'TM',
      bagWeightKg: 50,
      minStockTm: 5,
      purchasePricePen: 1500,
      salePricePen: 1750,
      isMix: false,
      active: true
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;
    if (formData.bagWeightKg <= 0) return;
    if (formData.salePricePen < formData.purchasePricePen) {
      const confirmed = window.confirm('El precio de venta es menor que el precio de compra. ¿Deseas guardar el producto con margen negativo?');
      if (!confirmed) return;
    }
    const normalized = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim().toUpperCase(),
    };
    const success = editingProduct
      ? updateProduct(editingProduct.id, normalized)
      : addProduct({ ...normalized, initialStockBags });
    if (success) setShowModal(false);
  };

  const handleApplyDollarRate = () => {
    const rate = parseFloat(dollarRateInput) || 3.75;
    setDollarRate(rate);
    if (priceInUsd <= 0) return;
    const newPurchasePen = Math.round(priceInUsd * rate);
    const newSalePen = Math.round(newPurchasePen * (1 + priceMarginPct / 100));
    const targets = applyToAll ? products : filteredProducts;
    targets.forEach(p => {
      updateProduct(p.id, { purchasePricePen: newPurchasePen, salePricePen: newSalePen });
    });
  };

  const handleRecalcWithNewRate = () => {
    const newRate = parseFloat(dollarRateInput) || 3.75;
    const oldRate = dollarRate;
    setDollarRate(newRate);
    const targets = applyToAll ? products : filteredProducts;
    targets.forEach(p => {
      const newPurchase = Math.round(p.purchasePricePen * (newRate / oldRate));
      const newSale = Math.round(p.salePricePen * (newRate / oldRate));
      updateProduct(p.id, { purchasePricePen: newPurchase, salePricePen: newSale });
    });
  };

  const handleExportProducts = () => {
    const data = filteredProducts.map(p => {
      const cat = categories.find(c => c.id === p.categoryId);
      return {
        'Código SKU': p.code,
        'Producto': p.name,
        'Categoría': cat?.name || 'General',
        'Unidad': p.unit,
        'Stock (TM)': p.currentStockTm.toFixed(2),
        'Bolsas (50kg)': p.currentBags,
        'Stock Mínimo (TM)': p.minStockTm,
        'Precio Compra (S/)': p.purchasePricePen.toFixed(2),
        'Precio Venta (S/)': p.salePricePen.toFixed(2),
        'Es Mezcla': p.isMix ? 'Sí' : 'No',
        'Estado': p.active ? 'Activo' : 'Inactivo'
      };
    });
    exportToCSV(data, 'Catalogo_Productos_AgroPeru');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            <span>Productos</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Catálogo de productos, precios base y unidades (1 TM = 20 bolsas de 50 KG).
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowDollarPanel(v => !v)}
            className={`px-3.5 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 border transition-colors cursor-pointer ${
              showDollarPanel
                ? 'bg-amber-600 border-amber-600 text-white'
                : 'bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 hover:border-amber-300 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Tipo de Cambio</span>
            {showDollarPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleExportProducts}
            className="px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Dollar Rate Panel */}
      {showDollarPanel && (
        <div className="p-5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">Actualizar Precios por Tipo de Cambio</h3>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            Ingresa el nuevo tipo de cambio (S/ por USD) y elige cómo actualizar los precios de todos los productos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 block mb-1">
                Nuevo tipo de cambio (S/ por $)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">S/</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={dollarRateInput}
                  onChange={e => setDollarRateInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-slate-100 text-sm font-bold text-right font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="3.75"
                />
              </div>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">Tipo de cambio guardado: S/ {dollarRate.toFixed(2)}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 block mb-1">
                Precio base en USD por TM <span className="font-normal">(opcional, para fijar nuevo precio)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">$</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={priceInUsd || ''}
                  onChange={e => setPriceInUsd(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-slate-100 text-sm font-bold text-right font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="ej. 570"
                />
              </div>
              {priceInUsd > 0 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                  = S/ {Math.round(priceInUsd * (parseFloat(dollarRateInput) || dollarRate)).toLocaleString('es-PE')} / TM
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 block mb-1">
                Margen de venta sobre compra (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={priceMarginPct}
                  onChange={e => setPriceMarginPct(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-slate-100 text-sm font-bold text-right font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">%</span>
              </div>
              {priceInUsd > 0 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                  P. Venta = S/ {Math.round(Math.round(priceInUsd * (parseFloat(dollarRateInput) || dollarRate)) * (1 + priceMarginPct / 100)).toLocaleString('es-PE')} / TM
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="text-amber-800 dark:text-amber-300">Aplicar a:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" checked={applyToAll} onChange={() => setApplyToAll(true)} className="accent-amber-600" />
              <span className="text-amber-900 dark:text-amber-200">Todos los productos ({products.length})</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" checked={!applyToAll} onChange={() => setApplyToAll(false)} className="accent-amber-600" />
              <span className="text-amber-900 dark:text-amber-200">Solo los filtrados ({filteredProducts.length})</span>
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 border-t border-amber-200 dark:border-amber-700">
            <button
              onClick={handleRecalcWithNewRate}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Recalcular precios con nuevo tipo de cambio
            </button>
            {priceInUsd > 0 && (
              <button
                onClick={handleApplyDollarRate}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <DollarSign className="w-3.5 h-3.5" />
                Fijar precio $ {priceInUsd} USD a productos
              </button>
            )}
          </div>
          <p className="text-[10px] text-amber-700 dark:text-amber-400">
            💡 <strong>Recalcular</strong> = ajusta precios existentes proporcionalmente al nuevo cambio. <strong>Fijar precio</strong> = establece nuevo precio base en USD para los productos seleccionados.
          </p>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código SKU o nombre (ej. Urea, Sulfato, Yaramila)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
          />
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-lg shadow-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todas las Categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Código / SKU</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Stock TM</th>
                <th className="px-4 py-3">Bolsas disponibles</th>
                <th className="px-4 py-3">P. Compra (TM)</th>
                <th className="px-4 py-3">P. Venta (TM)</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {paginatedProducts.map(prod => {
                const cat = categories.find(c => c.id === prod.categoryId);
                const isLow = prod.currentStockTm <= prod.minStockTm;
                return (
                  <tr key={prod.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-slate-100">{prod.code}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <span>{prod.name}</span>
                        {prod.isMix && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 flex items-center gap-1">
                            <FlaskConical className="w-3 h-3 text-emerald-600" /> Mezcla
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{cat?.name || 'General'}</td>
                    <td className="px-4 py-3 font-semibold font-mono">
                      <span className={isLow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'}>{prod.currentStockTm.toFixed(3)} TM</span>
                      <div className={`mt-1 text-[10px] font-sans font-semibold ${prod.currentStockTm === 0 ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-600'}`}>{prod.currentStockTm === 0 ? 'Sin stock recibido' : isLow ? 'Stock bajo' : 'Stock disponible'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400"><div className="font-mono font-semibold">{prod.currentBags} bolsas</div><div className="mt-1 text-[10px]">{prod.bagWeightKg} kg por bolsa</div></td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-mono">S/ {prod.purchasePricePen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 font-mono">S/ {prod.salePricePen.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProduct(prod);
                            setInitialStockBags(prod.currentBags);
                            setFormData({
                              code: prod.code,
                              name: prod.name,
                              categoryId: prod.categoryId,
                              unit: prod.unit,
                              bagWeightKg: prod.bagWeightKg,
                              minStockTm: prod.minStockTm,
                              purchasePricePen: prod.purchasePricePen,
                              salePricePen: prod.salePricePen,
                              isMix: prod.isMix,
                              active: prod.active
                            });
                            setShowModal(true);
                          }}
                          className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                          title="Editar Producto"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de eliminar el producto "${prod.name}" y sus lotes asociados?`)) {
                              deleteProduct(prod.id);
                            }
                          }}
                          className="p-1.5 rounded-md bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-400 transition-colors cursor-pointer border border-rose-200 dark:border-rose-800"
                          title="Eliminar Producto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
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
              <option value={15}>15 productos</option>
              <option value={30}>30 productos</option>
              <option value={50}>50 productos</option>
              <option value="ALL">Todos los productos</option>
            </select>
            <span className="text-slate-400">
              (Mostrando {paginatedProducts.length} de {filteredProducts.length} productos)
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

      {/* Modal Crear / Editar Producto */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto en Catálogo'}
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
              {editingProduct && <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200"><strong>Stock actual: {editingProduct.currentBags} bolsas · {editingProduct.currentStockTm.toFixed(3)} TM.</strong><div className="mt-1">Aquí editas la ficha y los precios. El stock solo cambia con compras recibidas, ventas o conteo físico.</div></div>}
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">1. Identificación del producto</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Código / SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. UREA-AGR"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono font-semibold uppercase focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Categoría</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Nombre comercial *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. UREA AGRICOLA, SUPER FOSFATO..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium uppercase focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">2. Presentación y control de stock</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Unidad</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="TM">TM</option>
                    <option value="Bolsa">Bolsa</option>
                    <option value="Kg">Kg</option>
                    <option value="Litros">Litros</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Peso por bolsa (kg)</label>
                  <input
                    type="number"
                    value={formData.bagWeightKg}
                    onChange={(e) => setFormData({ ...formData, bagWeightKg: parseFloat(e.target.value) || 50 })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Alerta de stock mínimo</label>
                  <div className="flex gap-1">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step="0.1"
                        value={formData.minStockTm}
                        onChange={(e) => setFormData({ ...formData, minStockTm: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-2 pr-6 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <span className="absolute right-1.5 top-2 text-[10px] text-slate-400 pointer-events-none">TM</span>
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step="1"
                        value={minStockBags}
                        onChange={(e) => setFormData({ ...formData, minStockTm: tmFromBags(parseInt(e.target.value) || 0, formData.bagWeightKg) })}
                        className="w-full px-2 py-2 pr-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <span className="absolute right-1.5 top-2 text-[10px] text-slate-400 pointer-events-none">bls</span>
                    </div>
                  </div>
                </div>
              </div>

              {!editingProduct && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                  <div className="mb-3">
                    <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Stock con el que estás iniciando</div>
                    <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400">Registra las existencias que ya están físicamente en tu almacén. No se contabilizan como una compra nueva.</p>
                  </div>
                  <div className="grid items-end gap-3 sm:grid-cols-2">
                    <label className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
                      Cantidad inicial de bolsas
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={initialStockBags || ''}
                        onChange={(event) => setInitialStockBags(Math.max(0, Math.round(Number(event.target.value) || 0)))}
                        placeholder="Ej. 1600"
                        className="mt-1 w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-right text-sm font-bold text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-100"
                      />
                    </label>
                    <div className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-emerald-900 dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-200">
                      <div className="text-[10px] uppercase tracking-wide text-emerald-600">Equivalencia automática</div>
                      <strong className="mt-1 block text-base">{initialStockBags.toLocaleString('es-PE')} bolsas = {initialStockTm.toFixed(3)} TM</strong>
                      <span className="text-[10px] text-emerald-600">Se creará el lote “STOCK-INICIAL” y su movimiento en Kardex.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Prices with TM + bolsa dual inputs */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  3. Precios — puedes editar por TM o por bolsa
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {/* Purchase price */}
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">💰 Precio Compra</p>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">por TM (S/)</label>
                      <input
                        type="number"
                        step="1"
                        value={formData.purchasePricePen}
                        onChange={(e) => setFormData({ ...formData, purchasePricePen: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold text-right font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-emerald-700 dark:text-emerald-400 block mb-0.5">por bolsa (S/) ← edita aquí</label>
                      <input
                        type="number"
                        step="0.5"
                        value={parseFloat((formData.purchasePricePen * formData.bagWeightKg / 1000).toFixed(2))}
                        onChange={(e) => {
                          const perBag = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, purchasePricePen: parseFloat((perBag * 1000 / formData.bagWeightKg).toFixed(2)) });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-bold text-right font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Sale price */}
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">🏷️ Precio Venta</p>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">por TM (S/)</label>
                      <input
                        type="number"
                        step="1"
                        value={formData.salePricePen}
                        onChange={(e) => setFormData({ ...formData, salePricePen: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold text-right font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-blue-700 dark:text-blue-400 block mb-0.5">por bolsa (S/) ← edita aquí</label>
                      <input
                        type="number"
                        step="0.5"
                        value={parseFloat((formData.salePricePen * formData.bagWeightKg / 1000).toFixed(2))}
                        onChange={(e) => {
                          const perBag = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, salePricePen: parseFloat((perBag * 1000 / formData.bagWeightKg).toFixed(2)) });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 text-xs font-bold text-right font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl border p-3 text-xs ${marginPerBag >= 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`}><strong>Margen estimado por bolsa: S/ {marginPerBag.toFixed(2)}</strong><div className="mt-1">Compra S/ {purchasePerBag.toFixed(2)} · Venta S/ {salePerBag.toFixed(2)} · {editingProduct ? 'No modifica el stock actual.' : `Stock inicial: ${initialStockBags.toLocaleString('es-PE')} bolsas.`}</div></div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isMix}
                    onChange={(e) => setFormData({ ...formData, isMix: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Es Mezcla o Formulación</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Activo en Catálogo</span>
                </label>
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
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
