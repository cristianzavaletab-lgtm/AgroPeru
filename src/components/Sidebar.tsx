import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, Package, History, ShoppingCart, 
  Receipt, FlaskConical, PackageCheck, ClipboardCheck, 
  DollarSign, Users, X, ShieldCheck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, sidebarOpen, setSidebarOpen } = useApp();

  const menuItems = [
    { id: 'dashboard', label: 'Panel General', icon: LayoutDashboard },
    { id: 'sales', label: 'Ventas', icon: Receipt },
    { id: 'purchases', label: 'Compras', icon: ShoppingCart },
    { id: 'kardex', label: 'Inventario', icon: History },
    { id: 'mixes', label: 'Mezclas', icon: FlaskConical },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'bags', label: 'Bolsas Vacías', icon: PackageCheck },
    { id: 'audit', label: 'Conteo Físico', icon: ClipboardCheck },
    { id: 'financials', label: 'Caja Diaria', icon: DollarSign },
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 lg:top-[57px] left-0 z-40
        w-64 h-full lg:h-[calc(100vh-57px)]
        bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
        flex flex-col shrink-0 transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Header with Close Button */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between lg:hidden">
          <img src="/logo-agroperu.png" alt="AGROPERÚ" className="h-7 w-auto object-contain" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Header */}
        <div className="px-4 pt-4 pb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Módulos del Sistema
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1 overflow-y-auto flex-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer text-left ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-semibold border-l-3 border-emerald-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                }`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom PWA / Sync Status */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Sistema AgroPerú Online</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Saldos y movimientos sincronizados
          </p>
        </div>
      </aside>
    </>
  );
};
