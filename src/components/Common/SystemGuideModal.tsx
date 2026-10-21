import React from 'react';
import { BookOpen, ArrowRight, X, Receipt, ShoppingCart, FlaskConical, History, DollarSign } from 'lucide-react';

interface SystemGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const SystemGuideModal: React.FC<SystemGuideModalProps> = ({ isOpen, onClose, onNavigateTab }) => {
  if (!isOpen) return null;

  const workflows = [
    {
      step: 'Paso 1',
      title: 'Registrar Compras e Importaciones',
      module: 'purchases',
      icon: ShoppingCart,
      color: 'from-blue-600 to-indigo-600',
      description: 'Cada vez que llegue un camión con fertilizantes (Urea, Sulfato, MAP), ingrésalo en Compras. El sistema calcula el flete y automáticamente AUMENTA el stock de tu almacén sin tocar Excel.'
    },
    {
      step: 'Paso 2',
      title: 'Formular & Producir Mezclas NPK',
      module: 'mixes',
      icon: FlaskConical,
      color: 'from-purple-600 to-indigo-600',
      description: 'Si preparas mezclas (ej. Molimax Papa Sierra o NPK Intermedia), usa el Estudio de Mezclas. El sistema descontará los insumos de materia prima, sumará la mezcla lista y consumirá los sacos vacíos.'
    },
    {
      step: 'Paso 3',
      title: 'Registrar Ventas y Emitir Proformas',
      module: 'sales',
      icon: Receipt,
      color: 'from-emerald-600 to-teal-600',
      description: 'Emite ventas por mostrador o créditos a clientes. Al guardar, el Kardex DESCUENTA las bolsas/TM vendidas al instante. Si es a Crédito, se guarda en la cuenta del cliente para cobrar después.'
    },
    {
      step: 'Paso 4',
      title: 'Auditoría Físicos & Sacos Vacíos',
      module: 'audit',
      icon: History,
      color: 'from-amber-600 to-orange-600',
      description: 'El encargado de almacén puede entrar desde su celular, contar las bolsas físicas reales y hacer ajustes si encuentra diferencias contra el saldo del sistema.'
    },
    {
      step: 'Paso 5',
      title: 'Revisar Utilidades y Control de Cajas',
      module: 'financials',
      icon: DollarSign,
      color: 'from-brand-red to-rose-700',
      description: 'Consulta cuánto dinero ganaste netamente por bolsa/producto vendida y controla los ingresos/egresos diarios de Caja 1 (BCP/Yape) y Caja 2 (Caja Chica).'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-green to-emerald-500 flex items-center justify-center shadow-lg shadow-brand-green/30">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Guía de Operación Humana AgroPerú</h2>
              <p className="text-xs text-slate-400">Paso a paso de cómo funciona tu negocio en este sistema</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intro */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/20 text-xs text-slate-300 space-y-2 leading-relaxed">
          <p className="font-semibold text-emerald-400">¿Cómo opera este sistema?</p>
          <p>
            Anteriormente en Excel era necesario conciliar manualmente las ventas en una hoja, los saldos en otra, y calcular las mezclas manualmente (lo que provocaba inconsistencias).
            Ahora, el flujo está completamente automatizado: los registros de compras incrementan existencias, las ventas descuentan inventario y las formulaciones NPK transforman materias primas y bolsas de empaque en tiempo real.
          </p>
        </div>

        {/* Steps Workflow List */}
        <div className="space-y-3">
          {workflows.map((item, idx) => {
            const Icon = item.icon;

            return (
              <div key={idx} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-600 transition-all">
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center shrink-0 shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-brand-gold uppercase tracking-wider">{item.step}</span>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => { onNavigateTab(item.module); onClose(); }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-2 border border-slate-700 shrink-0 transition-all cursor-pointer"
                >
                  <span>Ir al Módulo</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-green to-emerald-600 text-white font-bold text-xs shadow-lg shadow-brand-green/30"
          >
            Entendido, volver al sistema
          </button>
        </div>
      </div>
    </div>
  );
};
