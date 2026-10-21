import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FlaskConical, Plus, Play, Layers, Trash2, X } from 'lucide-react';

export const MixStudio: React.FC = () => {
  const { mixRecipes, products, executeMix, addRecipe, quickAddProduct } = useApp();
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(mixRecipes[0]?.id || '');
  const [productionQtyTm, setProductionQtyTm] = useState<number>(10);
  const [proformaNumber, setProformaNumber] = useState<string>('');

  // Modal create recipe
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newTargetProdName, setNewTargetProdName] = useState('');
  const [targetProductId, setTargetProductId] = useState(products.find(p => p.isMix)?.id || products[0]?.id || '');
  const [isCreatingNewTarget, setIsCreatingNewTarget] = useState(false);

  const [ingredients, setIngredients] = useState<{ productId: string; quantityTm: number }[]>([
    { productId: products[0]?.id || '', quantityTm: 7.0 },
    { productId: products[1]?.id || products[0]?.id || '', quantityTm: 3.0 }
  ]);

  const selectedRecipe = mixRecipes.find(r => r.id === selectedRecipeId);

  const handleAddIngredient = () => {
    setIngredients(prev => [...prev, { productId: products[0]?.id || '', quantityTm: 1.0 }]);
  };

  const handleRemoveIngredient = (idx: number) => {
    if (ingredients.length <= 1) return;
    setIngredients(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipeName) return;

    let finalTargetId = targetProductId;
    let finalTargetName = products.find(p => p.id === targetProductId)?.name || 'Mezcla Formulada';

    // If user typed a new product name to register as target product
    if (isCreatingNewTarget && newTargetProdName) {
      const newProd = quickAddProduct(newTargetProdName, 2900, 2400);
      finalTargetId = newProd.id;
      finalTargetName = newProd.name;
    }

    const totalBatchTm = ingredients.reduce((acc, i) => acc + i.quantityTm, 0);

    addRecipe({
      name: newRecipeName,
      targetProductId: finalTargetId,
      targetProductName: finalTargetName,
      batchSizeTm: totalBatchTm || 10,
      description: `Formulación NPK personalizada (${ingredients.length} insumos)`,
      ingredients: ingredients.map(i => ({
        productId: i.productId,
        productName: products.find(p => p.id === i.productId)?.name || '',
        quantityTm: i.quantityTm
      }))
    });

    setShowCreateModal(false);
    setNewRecipeName('');
    setNewTargetProdName('');
  };

  const handleExecuteProduction = () => {
    if (!selectedRecipe || productionQtyTm <= 0) return;
    executeMix(selectedRecipe.id, productionQtyTm, proformaNumber || undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            <span>Mezclas</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Formulación de productos y conversión de materias primas.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Fórmula</span>
        </button>
      </div>

      {/* Main Studio View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formula Selection & Setup */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">1. Configurar Lote de Mezcla</h3>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Receta / Formulación NPK</label>
            <select
              value={selectedRecipeId}
              onChange={(e) => setSelectedRecipeId(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {mixRecipes.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Cantidad Total a Producir (TM)</label>
            <input
              type="number"
              step="0.5"
              value={productionQtyTm}
              onChange={(e) => setProductionQtyTm(parseFloat(e.target.value) || 0)}
              className="w-full mt-1.5 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-semibold text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block font-mono">
              = {Math.round(productionQtyTm * 20)} bolsas de 50 kg
            </span>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Proforma Asignada (Opcional)</label>
            <input
              type="text"
              placeholder="Ej. Proforma 6160"
              value={proformaNumber}
              onChange={(e) => setProformaNumber(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleExecuteProduction}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Ejecutar Lote & Aumentar Stock</span>
            </button>
          </div>
        </div>

        {/* Breakdown Simulation */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">2. Consumo Estimado de Insumos</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Prorrateo de insumos requeridos según volumen de lote ({productionQtyTm} TM)</p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              {selectedRecipe?.name}
            </span>
          </div>

          <div className="space-y-2.5">
            {selectedRecipe?.ingredients.map(ing => {
              const ratio = (selectedRecipe.batchSizeTm || 10) > 0 ? (productionQtyTm / selectedRecipe.batchSizeTm) : 1;
              const requiredTm = ing.quantityTm * ratio;
              const requiredBags = Math.round(requiredTm * 20);
              const prod = products.find(p => p.id === ing.productId);
              const hasEnough = prod ? prod.currentStockTm >= requiredTm : false;

              return (
                <div key={ing.productId} className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      {ing.productName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{ing.productName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Stock actual: <span className={hasEnough ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400 font-semibold'}>
                          {prod?.currentStockTm.toFixed(2)} TM ({prod?.currentBags} bolsas)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-semibold font-mono text-amber-600 dark:text-amber-400">-{requiredTm.toFixed(2)} TM</div>
                    <div className="text-[11px] text-slate-400 font-mono">-{requiredBags} bolsas</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Result Summary Box */}
          <div className="p-4 rounded-lg bg-slate-900 text-white flex items-center justify-between shadow-xs border border-slate-800">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xs font-semibold text-white">Producto Resultante: {selectedRecipe?.targetProductName}</div>
                <div className="text-[11px] text-slate-400">Se registrará en el inventario como PREPARADO INGRESO</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-emerald-400 font-mono">+{productionQtyTm.toFixed(2)} TM</div>
              <div className="text-[11px] text-slate-400 font-mono">+{Math.round(productionQtyTm * 20)} bolsas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Crear Nueva Fórmula Dinámica */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Crear Nueva Formulación NPK Dinámica</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Nombre de la Formulación / Receta *</label>
                <input
                  type="text"
                  placeholder="Ej. Formulación Papa Sierra NPK 15-15-15"
                  value={newRecipeName}
                  onChange={(e) => setNewRecipeName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Producto Resultante *</label>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewTarget(!isCreatingNewTarget)}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
                  >
                    {isCreatingNewTarget ? 'Seleccionar existente' : '+ Crear nuevo producto'}
                  </button>
                </div>

                {isCreatingNewTarget ? (
                  <input
                    type="text"
                    placeholder="Nombre del nuevo producto (ej. MEZCLA NPK SUPER SIERRA)"
                    value={newTargetProdName}
                    onChange={(e) => setNewTargetProdName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                ) : (
                  <select
                    value={targetProductId}
                    onChange={(e) => setTargetProductId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Insumos / Materias Primas */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Materias Primas Requeridas</span>
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-medium text-[11px] border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    + Agregar Insumo
                  </button>
                </div>

                {ingredients.map((ing, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={ing.productId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setIngredients(prev => prev.map((item, i) => i === idx ? { ...item, productId: val } : item));
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        placeholder="TM"
                        value={ing.quantityTm}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setIngredients(prev => prev.map((item, i) => i === idx ? { ...item, quantityTm: val } : item));
                        }}
                        className="w-20 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-right text-xs font-mono font-semibold text-slate-900 dark:text-slate-100"
                      />
                      <span className="text-xs text-slate-400">TM</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                      title="Eliminar Insumo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  Guardar Formulación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
