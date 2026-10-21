import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, Smartphone, Sun, Moon,
  Menu, X, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { Logo } from './ui/Logo';

export const Navbar: React.FC = () => {
  const { 
    products, emptyBags, themeMode, toggleTheme, 
    sidebarOpen, setSidebarOpen, activeTab
  } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [alertsAcknowledged, setAlertsAcknowledged] = useState(false);

  // Section title mapping
  const sectionTitles: Record<string, string> = {
    dashboard: 'Panel General',
    sales: 'Ventas',
    purchases: 'Compras',
    mixes: 'Mezclas',
    kardex: 'Inventario',
    customers: 'Clientes',
    suppliers: 'Proveedores',
    products: 'Productos',
    bags: 'Bolsas Vacías',
    audit: 'Conteo Físico',
    financials: 'Caja y Resultados',
  };

  // Low stock alerts
  const lowStockProducts = products.filter(p => p.currentStockTm <= p.minStockTm);
  const lowStockBags = emptyBags.filter(b => b.saldoFinal <= b.minStock);
  const totalAlertCount = lowStockProducts.length + lowStockBags.length;
  const activeAlertCount = alertsAcknowledged ? 0 : totalAlertCount;

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Hamburger (Mobile) + Real Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(prev => !prev)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Alternar menú"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Real AGROPERÚ Logo */}
          <div className="flex items-center gap-2">
            <Logo compact={true} className="scale-75 sm:scale-90 origin-left" />
            <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700 ml-1" />
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
              {sectionTitles[activeTab] || 'Gestión Empresarial'}
            </span>
          </div>
        </div>



        {/* Right: Actions (PWA, Theme, Alerts, User Profile) */}
        <div className="flex items-center gap-2 sm:gap-3">


          {/* PWA Install Button */}
          <button
            onClick={() => alert("Para instalar AgroPerú ERP en tu dispositivo: Haz clic en el menú del navegador (tres puntos) y selecciona 'Instalar aplicación' o 'Agregar a la pantalla de inicio'.")}
            className="hidden xl:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
            title="Instalar como PWA"
          >
            <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Instalar PWA</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
            title={themeMode === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            aria-label="Cambiar tema visual"
          >
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button 
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 relative cursor-pointer"
              title="Alertas de Inventario"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notificaciones de stock"
            >
              <Bell className="w-4 h-4" />
              {activeAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                  {activeAlertCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg p-4 z-50 text-xs text-slate-800 dark:text-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Alertas de Inventario</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                    {totalAlertCount} críticas
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {totalAlertCount === 0 ? (
                    <div className="text-center py-6 text-slate-500 font-medium flex flex-col items-center gap-1">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <span>Todo el inventario se encuentra dentro de los niveles mínimos requeridos.</span>
                    </div>
                  ) : (
                    <>
                      {lowStockProducts.map(p => (
                        <div key={p.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 uppercase">{p.name}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Stock: <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{p.currentStockTm.toFixed(2)} TM</span>
                            </div>
                          </div>
                          <span className="text-[11px] font-medium text-slate-500">Mín: {p.minStockTm} TM</span>
                        </div>
                      ))}

                      {lowStockBags.map(b => (
                        <div key={b.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 uppercase">{b.bagName}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Saldo: <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{b.saldoFinal} u</span>
                            </div>
                          </div>
                          <span className="text-[11px] font-medium text-slate-500">Mín: {b.minStock} u</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setAlertsAcknowledged(true);
                      setShowNotifications(false);
                    }}
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs text-center cursor-pointer transition-colors"
                  >
                    Marcar como revisado
                  </button>
                </div>
              </div>
            )}
          </div>


        </div>
      </div>
    </header>
  );
};
