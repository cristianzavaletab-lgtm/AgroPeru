import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, Category, Customer, Supplier, Purchase, Sale, 
  InventoryMovement, MixRecipe, MixExecution, EmptyBagStock, 
  FinancialMovement, PhysicalAuditItem, ProductLot 
} from '../types';
import { 
  initialProducts, initialCategories, initialCustomers, 
  initialSuppliers, initialPurchases, initialSales, 
  initialKardex, initialRecipes, initialBags, initialFinancials,
  initialLots, initialExecutions 
} from '../data/mockData';
import { dbSync } from '../lib/supabaseSync';

const loadLocal = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

interface AppContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  errorMessage: string | null;
  setErrorMessage: (msg: string | null) => void;
  successMessage: string | null;
  setSuccessMessage: (msg: string | null) => void;

  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;

  products: Product[];
  categories: Category[];
  customers: Customer[];
  suppliers: Supplier[];
  purchases: Purchase[];
  sales: Sale[];
  kardex: InventoryMovement[];
  lots: ProductLot[];
  mixRecipes: MixRecipe[];
  mixExecutions: MixExecution[];
  emptyBags: EmptyBagStock[];
  financials: FinancialMovement[];

  // Actions
  resetToDemoData: () => void;
  addProduct: (product: Omit<Product, 'id' | 'currentStockTm' | 'currentBags' | 'totalVentasBags' | 'totalPreparadoSalidaTm' | 'totalPreparadoIngresoTm' | 'totalIngresoCompraTm' | 'conteoFisicoTm' | 'diferenciaTm'>) => boolean;
  quickAddProduct: (name: string, salePricePen?: number, purchasePricePen?: number, categoryId?: string) => Product;
  updateProduct: (id: string, product: Partial<Product>) => boolean;
  deleteProduct: (id: string) => boolean;
  clearProductCount: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'currentDebt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => boolean;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  addPurchase: (purchase: Omit<Purchase, 'id'>) => void;
  deletePurchase: (id: string) => boolean;
  addSale: (sale: Omit<Sale, 'id'>) => boolean;
  anularSale: (saleId: string) => boolean;
  deleteSale: (saleId: string) => boolean;
  updateSaleStatus: (saleId: string, newStatus: Sale['status']) => void;
  executeMix: (recipeId: string, producedQtyTm: number, proformaNumber?: string) => boolean;
  addRecipe: (recipe: Omit<MixRecipe, 'id'>) => void;
  deleteRecipe: (id: string) => boolean;
  updateBagStock: (id: string, incoming: number, outgoing: number) => void;
  reconcileAudit: (items: PhysicalAuditItem[]) => void;
  addFinancialMovement: (movement: Omit<FinancialMovement, 'id'>) => void;
  deleteFinancialMovement: (id: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('agroperu_theme') as 'light' | 'dark') || 'light';
  });
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('agroperu_theme', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const [products, setProducts] = useState<Product[]>(() => loadLocal('agroperu_products', initialProducts));
  const [categories] = useState<Category[]>(initialCategories);
  const [customers, setCustomers] = useState<Customer[]>(() => loadLocal('agroperu_customers', initialCustomers));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadLocal('agroperu_suppliers', initialSuppliers));
  const [purchases, setPurchases] = useState<Purchase[]>(() => loadLocal('agroperu_purchases', initialPurchases));
  const [sales, setSales] = useState<Sale[]>(() => loadLocal('agroperu_sales', initialSales));
  const [kardex, setKardex] = useState<InventoryMovement[]>(() => loadLocal('agroperu_kardex', initialKardex));
  const [lots, setLots] = useState<ProductLot[]>(() => loadLocal('agroperu_lots', initialLots));
  const [mixRecipes, setMixRecipes] = useState<MixRecipe[]>(() => loadLocal('agroperu_recipes', initialRecipes));
  const [mixExecutions, setMixExecutions] = useState<MixExecution[]>(() => loadLocal('agroperu_executions', initialExecutions));
  const [emptyBags, setEmptyBags] = useState<EmptyBagStock[]>(() => loadLocal('agroperu_bags', initialBags));
  const [financials, setFinancials] = useState<FinancialMovement[]>(() => loadLocal('agroperu_financials', initialFinancials));

  // Reset/seed all system data to rich demo dataset
  const resetToDemoData = () => {
    setProducts(initialProducts);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setPurchases(initialPurchases);
    setSales(initialSales);
    setKardex(initialKardex);
    setLots(initialLots);
    setMixRecipes(initialRecipes);
    setMixExecutions(initialExecutions);
    setEmptyBags(initialBags);
    setFinancials(initialFinancials);

    localStorage.setItem('agroperu_products', JSON.stringify(initialProducts));
    localStorage.setItem('agroperu_customers', JSON.stringify(initialCustomers));
    localStorage.setItem('agroperu_suppliers', JSON.stringify(initialSuppliers));
    localStorage.setItem('agroperu_purchases', JSON.stringify(initialPurchases));
    localStorage.setItem('agroperu_sales', JSON.stringify(initialSales));
    localStorage.setItem('agroperu_kardex', JSON.stringify(initialKardex));
    localStorage.setItem('agroperu_lots', JSON.stringify(initialLots));
    localStorage.setItem('agroperu_recipes', JSON.stringify(initialRecipes));
    localStorage.setItem('agroperu_executions', JSON.stringify(initialExecutions));
    localStorage.setItem('agroperu_bags', JSON.stringify(initialBags));
    localStorage.setItem('agroperu_financials', JSON.stringify(initialFinancials));
    localStorage.setItem('agroperu_demo_seeded_v3', 'true');

    triggerSuccess('¡Sistema restaurado y poblado con datos de prueba realistas para AgroPerú!');
  };

  // Auto-seed on first load or if dataset was empty
  useEffect(() => {
    const isSeeded = localStorage.getItem('agroperu_demo_seeded_v3');
    if (!isSeeded || customers.length === 0 || sales.length === 0) {
      resetToDemoData();
    }
  }, []);

  // Sync state changes to localStorage for 100% reload persistence
  useEffect(() => { localStorage.setItem('agroperu_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('agroperu_lots', JSON.stringify(lots)); }, [lots]);
  useEffect(() => { localStorage.setItem('agroperu_purchases', JSON.stringify(purchases)); }, [purchases]);
  useEffect(() => { localStorage.setItem('agroperu_sales', JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem('agroperu_kardex', JSON.stringify(kardex)); }, [kardex]);
  useEffect(() => { localStorage.setItem('agroperu_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('agroperu_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('agroperu_recipes', JSON.stringify(mixRecipes)); }, [mixRecipes]);
  useEffect(() => { localStorage.setItem('agroperu_executions', JSON.stringify(mixExecutions)); }, [mixExecutions]);
  useEffect(() => { localStorage.setItem('agroperu_bags', JSON.stringify(emptyBags)); }, [emptyBags]);
  useEffect(() => { localStorage.setItem('agroperu_financials', JSON.stringify(financials)); }, [financials]);

  // Sync from Supabase on mount if available
  useEffect(() => {
    async function loadSupabaseData() {
      try {
        const [remoteProds, remoteCusts, remoteSales] = await Promise.all([
          dbSync.getProducts(),
          dbSync.getCustomers(),
          dbSync.getSales()
        ]);
        if (remoteProds && remoteProds.length > 0) setProducts(remoteProds);
        if (remoteCusts && remoteCusts.length > 0) setCustomers(remoteCusts);
        if (remoteSales && remoteSales.length > 0) setSales(remoteSales);
      } catch (err) {
        console.warn('Supabase remote load skipped, using local data:', err);
      }
    }
    loadSupabaseData();
  }, []);

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 6000);
  };

  // Add Product
  const addProduct = (productData: Omit<Product, 'id' | 'currentStockTm' | 'currentBags' | 'totalVentasBags' | 'totalPreparadoSalidaTm' | 'totalPreparadoIngresoTm' | 'totalIngresoCompraTm' | 'conteoFisicoTm' | 'diferenciaTm'>) => {
    if (products.some(p => p.code.toLowerCase() === productData.code.toLowerCase())) {
      triggerError(`El código SKU '${productData.code}' ya existe en el sistema.`);
      return false;
    }
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      currentStockTm: 0,
      currentBags: 0,
      totalVentasBags: 0,
      totalPreparadoSalidaTm: 0,
      totalPreparadoIngresoTm: 0,
      totalIngresoCompraTm: 0,
      conteoFisicoTm: 0,
      diferenciaTm: 0
    };
    setProducts(prev => [...prev, newProduct]);
    dbSync.saveProduct(newProduct);
    triggerSuccess(`Producto '${productData.name}' creado correctamente.`);
    return true;
  };

  // Quick Add Product inline from sales, purchases, or mixes
  const quickAddProduct = (name: string, salePricePen = 2200, purchasePricePen = 1900, categoryId?: string): Product => {
    const code = `PROD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      code,
      name: name.toUpperCase().trim(),
      categoryId: categoryId || categories[0]?.id || 'cat-1',
      unit: 'TM',
      bagWeightKg: 50,
      minStockTm: 5,
      currentStockTm: 0,
      currentBags: 0,
      purchasePricePen,
      salePricePen,
      totalVentasBags: 0,
      totalPreparadoSalidaTm: 0,
      totalPreparadoIngresoTm: 0,
      totalIngresoCompraTm: 0,
      conteoFisicoTm: 0,
      diferenciaTm: 0,
      isMix: false,
      active: true
    };
    setProducts(prev => [...prev, newProd]);
    dbSync.saveProduct(newProd);
    triggerSuccess(`Nuevo producto '${newProd.name}' agregado al catálogo.`);
    return newProd;
  };

  // Update Product
  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    if (updatedFields.code) {
      const duplicate = products.find(p => p.id !== id && p.code.toLowerCase() === updatedFields.code?.toLowerCase());
      if (duplicate) {
        triggerError(`El código SKU '${updatedFields.code}' ya está asignado al producto '${duplicate.name}'.`);
        return false;
      }
    }
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updatedFields };
        dbSync.saveProduct(updated);
        return updated;
      }
      return p;
    }));
    triggerSuccess(`Producto actualizado correctamente.`);
    return true;
  };

  // Delete Product
  const deleteProduct = (productId: string): boolean => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return false;

    setProducts(prev => prev.filter(p => p.id !== productId));
    setLots(prev => prev.filter(l => l.productId !== productId));
    triggerSuccess(`Producto '${prod.name}' eliminado correctamente.`);
    return true;
  };

  // Clear Product Count
  const clearProductCount = (productId: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, conteoFisicoTm: 0, diferenciaTm: 0 };
      }
      return p;
    }));
  };

  // Add Customer
  const addCustomer = (customerData: Omit<Customer, 'id' | 'currentDebt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      currentDebt: 0
    };
    setCustomers(prev => [...prev, newCustomer]);
    dbSync.saveCustomer(newCustomer);
    triggerSuccess(`Cliente '${customerData.name}' registrado.`);
  };

  // Update Customer
  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, ...customerData };
        dbSync.saveCustomer(updated);
        return updated;
      }
      return c;
    }));
    triggerSuccess(`Cliente actualizado.`);
  };

  // Add Supplier
  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `supp-${Date.now()}`
    };
    setSuppliers(prev => [...prev, newSupplier]);
    triggerSuccess(`Proveedor '${supplierData.companyName}' agregado.`);
  };

  // Add Purchase (Updates Stock + Lots + Matrix INGRESO COMPRA + Kardex) with USD Support
  const addPurchase = (purchaseData: Omit<Purchase, 'id'>) => {
    setIsLoading(true);
    const purchaseId = `pur-${Date.now()}`;
    const newPurchase: Purchase = { ...purchaseData, id: purchaseId };
    const dateStr = purchaseData.purchaseDate || new Date().toISOString().split('T')[0];

    setTimeout(() => {
      setPurchases(prev => [newPurchase, ...prev]);

      const totalTmInPurchase = purchaseData.items.reduce((acc, i) => acc + i.quantityTm, 0);
      const freightPerTm = totalTmInPurchase > 0 ? (purchaseData.freightCostPen / totalTmInPurchase) : 0;

      const newLotsToAdd: ProductLot[] = [];
      const newKardexItems: InventoryMovement[] = [];

      purchaseData.items.forEach((item, itemIdx) => {
        const p = products.find(prod => prod.id === item.productId);
        const prodName = p?.name || 'PRODUCTO';
        const lotNum = (item.lotNumber && item.lotNumber.trim()) || `LOT-${String(itemIdx + 1).padStart(3, '0')}`;

        // Unit cost calculation (incorporating freight per TM)
        const baseCostPen = purchaseData.currency === 'USD'
          ? ((item.pricePerTmUsd || 0) * purchaseData.exchangeRate)
          : item.pricePerTmPen;
        const effectiveUnitCostPen = parseFloat((baseCostPen + freightPerTm).toFixed(2));
        const lotSalePricePen = item.salePricePen !== undefined && item.salePricePen > 0
          ? item.salePricePen
          : (p ? p.salePricePen : parseFloat((effectiveUnitCostPen * 1.15).toFixed(2)));

        // Create new ProductLot
        const newLot: ProductLot = {
          id: `lot-${Date.now()}-${itemIdx}-${Math.random().toString(36).substring(2, 6)}`,
          productId: item.productId,
          productName: prodName,
          lotNumber: lotNum,
          entryDate: dateStr,
          initialQuantityTm: item.quantityTm,
          currentQuantityTm: item.quantityTm,
          initialBags: item.bags,
          currentBags: item.bags,
          unitCostPen: effectiveUnitCostPen,
          salePricePen: lotSalePricePen,
          status: 'DISPONIBLE',
          purchaseDocNumber: purchaseData.docNumber,
          supplierName: purchaseData.supplierName
        };
        newLotsToAdd.push(newLot);

        // Update product stock and matrix totals
        setProducts(prevProducts => prevProducts.map(prod => {
          if (prod.id === item.productId) {
            const newStockTm = parseFloat((prod.currentStockTm + item.quantityTm).toFixed(2));
            const newBags = prod.currentBags + item.bags;

            const kardexItem: InventoryMovement = {
              id: `kard-${Date.now()}-${itemIdx}-${Math.random().toString(36).substring(2, 7)}`,
              productId: prod.id,
              productName: prod.name,
              lotNumber: lotNum,
              type: 'PURCHASE',
              quantityTm: item.quantityTm,
              quantityBags: item.bags,
              unitCostPen: effectiveUnitCostPen,
              salePricePen: lotSalePricePen,
              balanceStockTm: newStockTm,
              balanceBags: newBags,
              referenceType: 'PURCHASE',
              referenceId: purchaseData.docNumber,
              date: dateStr,
              notes: `[Lote: ${lotNum}] Compra a ${purchaseData.supplierName} (${purchaseData.currency === 'USD' ? `$${item.pricePerTmUsd}/TM @ TC ${purchaseData.exchangeRate}` : `S/${item.pricePerTmPen}/TM`}) - Doc ${purchaseData.docNumber}`
            };
            newKardexItems.push(kardexItem);
            dbSync.saveKardexMovement(kardexItem);

            const updatedP: Product = {
              ...prod,
              currentStockTm: newStockTm,
              currentBags: newBags,
              totalIngresoCompraTm: parseFloat((prod.totalIngresoCompraTm + item.quantityTm).toFixed(2)),
              purchasePricePen: effectiveUnitCostPen,
              salePricePen: lotSalePricePen || prod.salePricePen
            };
            dbSync.saveProduct(updatedP);
            return updatedP;
          }
          return prod;
        }));
      });

      setLots(prevLots => [...newLotsToAdd, ...prevLots]);
      setKardex(kPrev => [...newKardexItems, ...kPrev]);

      const newExpense: FinancialMovement = {
        id: `fin-${Date.now()}`,
        date: dateStr,
        type: 'EGRESOS',
        category: 'COMPRA',
        description: `Compra - ${purchaseData.supplierName} (${purchaseData.docNumber})`,
        amountPen: purchaseData.totalPen,
        cashRegister: 'CAJA_1'
      };
      setFinancials(prev => [newExpense, ...prev]);

      setIsLoading(false);
      triggerSuccess(`Compra ${purchaseData.docNumber} procesada y registrada en lotes y Kardex.`);
    }, 400);
  };

  // Add Sale (Deducts Stock + Deducts from Lots + Matrix VENTA + Kardex)
  const addSale = (saleData: Omit<Sale, 'id'>) => {
    for (const item of saleData.items) {
      const p = products.find(prod => prod.id === item.productId);
      if (p) {
        const qtyBags = Math.round(item.quantity);
        const qtyTm = parseFloat(((qtyBags * p.bagWeightKg) / 1000).toFixed(3));
        if (p.currentStockTm < qtyTm) {
          triggerError(`Stock insuficiente de '${p.name}'. Requerido: ${qtyTm.toFixed(2)} TM (${qtyBags} bolsas) | Disponible: ${p.currentStockTm.toFixed(2)} TM (${p.currentBags} bolsas)`);
          return false;
        }
      }
    }

    setIsLoading(true);
    const saleId = `sale-${Date.now()}`;
    const newSale: Sale = { ...saleData, id: saleId };
    const dateStr = saleData.saleDate || new Date().toISOString().split('T')[0];

    setTimeout(() => {
      setSales(prev => [newSale, ...prev]);
      dbSync.saveSale(newSale);

      const newKardexItems: InventoryMovement[] = [];

      saleData.items.forEach(item => {
        const p = products.find(prod => prod.id === item.productId);
        if (!p) return;

        const qtyBags = Math.round(item.quantity);
        const qtyTm = parseFloat(((qtyBags * p.bagWeightKg) / 1000).toFixed(3));

        // Deduct from lots (Specific lot if requested, or FIFO from available lots)
        let remainingTmToDeduct = qtyTm;
        let lotUsed = item.lotNumber || '';
        let lotUnitCost = p.purchasePricePen;

        setLots(prevLots => {
          return prevLots.map(lot => {
            if (lot.productId === p.id && lot.status === 'DISPONIBLE' && remainingTmToDeduct > 0) {
              if (item.lotNumber && lot.lotNumber !== item.lotNumber) {
                return lot;
              }
              if (!lotUsed) lotUsed = lot.lotNumber;
              lotUnitCost = lot.unitCostPen;

              const deductTm = Math.min(lot.currentQuantityTm, remainingTmToDeduct);
              const deductBags = Math.round(deductTm * (1000 / p.bagWeightKg));
              const newLotTm = Math.max(0, parseFloat((lot.currentQuantityTm - deductTm).toFixed(3)));
              const newLotBags = Math.max(0, lot.currentBags - deductBags);
              remainingTmToDeduct = Math.max(0, parseFloat((remainingTmToDeduct - deductTm).toFixed(3)));

              return {
                ...lot,
                currentQuantityTm: newLotTm,
                currentBags: newLotBags,
                status: newLotTm <= 0.001 ? ('AGOTADO' as const) : ('DISPONIBLE' as const)
              };
            }
            return lot;
          });
        });

        // Update product stock and matrix
        setProducts(prevProducts => prevProducts.map(prod => {
          if (prod.id === item.productId) {
            const newStockTm = Math.max(0, parseFloat((prod.currentStockTm - qtyTm).toFixed(3)));
            const newBags = Math.max(0, prod.currentBags - qtyBags);

            const kardexItem: InventoryMovement = {
              id: `kard-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              productId: prod.id,
              productName: prod.name,
              lotNumber: lotUsed || '001',
              type: 'SALE',
              quantityTm: qtyTm,
              quantityBags: qtyBags,
              unitCostPen: lotUnitCost,
              salePricePen: item.unitPrice,
              balanceStockTm: newStockTm,
              balanceBags: newBags,
              referenceType: 'SALE',
              referenceId: saleData.proformaNumber,
              date: dateStr,
              notes: `[Lote: ${lotUsed || '001'}] Venta Proforma N.º ${saleData.proformaNumber} a ${saleData.customerName}`
            };

            newKardexItems.push(kardexItem);
            dbSync.saveKardexMovement(kardexItem);

            const updatedP = { 
              ...prod, 
              currentStockTm: newStockTm, 
              currentBags: newBags,
              totalVentasBags: prod.totalVentasBags + qtyBags
            };
            dbSync.saveProduct(updatedP);
            return updatedP;
          }
          return prod;
        }));
      });

      setKardex(kPrev => [...newKardexItems, ...kPrev]);

      if (saleData.status === 'CREDITO') {
        const pendingDebt = saleData.totalAmount - (saleData.paidAmount || 0);
        setCustomers(cPrev => cPrev.map(c => c.id === saleData.customerId ? { ...c, currentDebt: c.currentDebt + pendingDebt } : c));
      }

      const paid = saleData.paidAmount || (saleData.status === 'PAGADO' ? saleData.totalAmount : 0);
      if (paid > 0) {
        const newIncome: FinancialMovement = {
          id: `fin-${Date.now()}`,
          date: dateStr,
          type: 'INGRESOS',
          category: 'VENTA',
          description: `Cobro Proforma N.º ${saleData.proformaNumber} - ${saleData.customerName}`,
          amountPen: paid,
          cashRegister: 'CAJA_1'
        };
        setFinancials(prev => [newIncome, ...prev]);
      }

      setIsLoading(false);
      triggerSuccess(`Venta Proforma #${saleData.proformaNumber} registrada exitosamente.`);
    }, 400);

    return true;
  };

  // Anular Sale (Restores Stock, Lots & Reverts Debt/Financials)
  const anularSale = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale || sale.status === 'ANULADO') return false;

    setIsLoading(true);
    const dateStr = new Date().toISOString().split('T')[0];

    setTimeout(() => {
      setSales(prev => prev.map(s => s.id === saleId ? { ...s, status: 'ANULADO' } : s));

      // Restore Stock for each product
      sale.items.forEach(item => {
        setProducts(prevProducts => prevProducts.map(p => {
          if (p.id === item.productId) {
            const qtyBags = Math.round(item.quantity);
            const qtyTm = parseFloat(((qtyBags * p.bagWeightKg) / 1000).toFixed(3));

            const newStockTm = parseFloat((p.currentStockTm + qtyTm).toFixed(3));
            const newBags = p.currentBags + qtyBags;

            const kardexItem: InventoryMovement = {
              id: `kard-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              productId: p.id,
              productName: p.name,
              lotNumber: item.lotNumber || '001',
              type: 'SALE_CANCEL',
              quantityTm: qtyTm,
              quantityBags: qtyBags,
              unitCostPen: p.purchasePricePen,
              salePricePen: item.unitPrice,
              balanceStockTm: newStockTm,
              balanceBags: newBags,
              referenceType: 'CANCEL',
              referenceId: sale.proformaNumber,
              date: dateStr,
              notes: `[Lote: ${item.lotNumber || '001'}] ANULACIÓN Proforma N.º ${sale.proformaNumber} - Reintegro Stock`
            };

            setKardex(kPrev => [kardexItem, ...kPrev]);

            return {
              ...p,
              currentStockTm: newStockTm,
              currentBags: newBags,
              totalVentasBags: Math.max(0, p.totalVentasBags - qtyBags)
            };
          }
          return p;
        }));

        // Restore Lot
        if (item.lotNumber) {
          setLots(prevLots => prevLots.map(l => {
            if (l.productId === item.productId && l.lotNumber === item.lotNumber) {
              const p = products.find(prod => prod.id === item.productId);
              const bagWeight = p ? p.bagWeightKg : 50;
              const qtyBags = Math.round(item.quantity);
              const qtyTm = parseFloat(((qtyBags * bagWeight) / 1000).toFixed(3));
              const restoredTm = parseFloat((l.currentQuantityTm + qtyTm).toFixed(3));
              const restoredBags = l.currentBags + qtyBags;
              return {
                ...l,
                currentQuantityTm: restoredTm,
                currentBags: restoredBags,
                status: 'DISPONIBLE'
              };
            }
            return l;
          }));
        }
      });

      // Adjust customer debt if credit
      if (sale.status === 'CREDITO') {
        const pendingDebt = sale.totalAmount - sale.paidAmount;
        setCustomers(cPrev => cPrev.map(c => c.id === sale.customerId ? { ...c, currentDebt: Math.max(0, c.currentDebt - pendingDebt) } : c));
      }

      setIsLoading(false);
      triggerSuccess(`Proforma N.º ${sale.proformaNumber} anulada y stock devuelto al Kardex.`);
    }, 300);

    return true;
  };

  // Delete Sale completely
  const deleteSale = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return false;

    if (sale.status !== 'ANULADO') {
      anularSale(saleId);
    }
    setSales(prev => prev.filter(s => s.id !== saleId));
    triggerSuccess(`Registro de venta eliminado.`);
    return true;
  };

  const updateSaleStatus = (saleId: string, newStatus: Sale['status']) => {
    setSales(prev => prev.map(s => {
      if (s.id === saleId) {
        if (s.status === 'CREDITO' && newStatus === 'PAGADO') {
          const pendingDebt = s.totalAmount - s.paidAmount;
          setCustomers(cPrev => cPrev.map(c => c.id === s.customerId ? { ...c, currentDebt: Math.max(0, c.currentDebt - pendingDebt) } : c));
          
          const newIncome: FinancialMovement = {
            id: `fin-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            type: 'INGRESOS',
            category: 'VENTA',
            description: `Cobro de crédito Proforma N.º ${s.proformaNumber} - ${s.customerName}`,
            amountPen: pendingDebt,
            cashRegister: 'CAJA_1'
          };
          setFinancials(fPrev => [newIncome, ...fPrev]);
        }
        return { ...s, status: newStatus, paidAmount: newStatus === 'PAGADO' ? s.totalAmount : s.paidAmount };
      }
      return s;
    }));
    triggerSuccess(`Estado de venta actualizado a ${newStatus}.`);
  };

  // Execute Mixture Production (SIMULTANEOUS PREPARADO SALIDA & PREPARADO INGRESO)
  const executeMix = (recipeId: string, producedQtyTm: number, proformaNumber?: string) => {
    const recipe = mixRecipes.find(r => r.id === recipeId);
    if (!recipe) {
      triggerError('Receta de mezcla no encontrada.');
      return false;
    }

    for (const ing of recipe.ingredients) {
      const ratio = producedQtyTm / recipe.batchSizeTm;
      const consumedTm = ing.quantityTm * ratio;
      const prod = products.find(p => p.id === ing.productId);
      if (!prod || prod.currentStockTm < consumedTm) {
        triggerError(`Stock insuficiente del insumo '${ing.productName}'. Requerido: ${consumedTm.toFixed(2)} TM | Disponible: ${prod?.currentStockTm.toFixed(2) || 0} TM`);
        return false;
      }
    }

    setIsLoading(true);
    const dateStr = new Date().toISOString().split('T')[0];
    const targetProd = products.find(p => p.id === recipe.targetProductId);
    const targetBagWeight = targetProd?.bagWeightKg || 50;
    const producedBags = Math.round(producedQtyTm * (1000 / targetBagWeight));

    setTimeout(() => {
      const consumedDetails: { productId: string; productName: string; consumedQtyTm: number; consumedBags: number }[] = [];

      // 1. Deduct Raw Materials (PREPARADO SALIDA)
      recipe.ingredients.forEach(ing => {
        const ratio = producedQtyTm / recipe.batchSizeTm;
        const consumedTm = ing.quantityTm * ratio;
        const ingProd = products.find(p => p.id === ing.productId);
        const ingBagWeight = ingProd?.bagWeightKg || 50;
        const consumedBags = Math.round(consumedTm * (1000 / ingBagWeight));

        consumedDetails.push({
          productId: ing.productId,
          productName: ing.productName,
          consumedQtyTm: consumedTm,
          consumedBags
        });

        setProducts(pPrev => pPrev.map(p => {
          if (p.id === ing.productId) {
            const newStockTm = Math.max(0, p.currentStockTm - consumedTm);
            const newBags = Math.max(0, p.currentBags - consumedBags);

            const kardexItem: InventoryMovement = {
              id: `kard-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              productId: p.id,
              productName: p.name,
              type: 'MIX_CONSUMPTION',
              quantityTm: consumedTm,
              quantityBags: consumedBags,
              unitCostPen: p.purchasePricePen,
              balanceStockTm: newStockTm,
              balanceBags: newBags,
              referenceType: 'MIX_EXECUTION',
              referenceId: recipe.name,
              date: dateStr,
              notes: `PREPARADO SALIDA para mezcla ${recipe.name}`
            };
            setKardex(kPrev => [kardexItem, ...kPrev]);

            return { 
              ...p, 
              currentStockTm: newStockTm, 
              currentBags: newBags,
              totalPreparadoSalidaTm: p.totalPreparadoSalidaTm + consumedTm
            };
          }
          return p;
        }));
      });

      // 2. Add Target Product (PREPARADO INGRESO)
      setProducts(pPrev => pPrev.map(p => {
        if (p.id === recipe.targetProductId) {
          const newStockTm = p.currentStockTm + producedQtyTm;
          const newBags = p.currentBags + producedBags;

          const kardexItem: InventoryMovement = {
            id: `kard-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            productId: p.id,
            productName: p.name,
            type: 'MIX_PRODUCTION',
            quantityTm: producedQtyTm,
            quantityBags: producedBags,
            unitCostPen: p.purchasePricePen,
            balanceStockTm: newStockTm,
            balanceBags: newBags,
            referenceType: 'MIX_EXECUTION',
            referenceId: recipe.name,
            date: dateStr,
            notes: `PREPARADO INGRESO de mezcla ${recipe.name}`
          };
          setKardex(kPrev => [kardexItem, ...kPrev]);

          return { 
            ...p, 
            currentStockTm: newStockTm, 
            currentBags: newBags,
            totalPreparadoIngresoTm: p.totalPreparadoIngresoTm + producedQtyTm
          };
        }
        return p;
      }));

      const execution: MixExecution = {
        id: `exec-${Date.now()}`,
        mixRecipeId: recipeId,
        recipeName: recipe.name,
        producedQtyTm,
        producedBags,
        executionDate: dateStr,
        proformaNumber,
        consumedItems: consumedDetails
      };

      setMixExecutions(prev => [execution, ...prev]);

      setIsLoading(false);
      triggerSuccess(`Mezcla '${recipe.name}' (${producedQtyTm} TM) procesada: PREPARADO SALIDA de insumos e INGRESO del producto final.`);
    }, 400);

    return true;
  };

  const addRecipe = (recipeData: Omit<MixRecipe, 'id'>) => {
    const newRecipe: MixRecipe = { ...recipeData, id: `recipe-${Date.now()}` };
    setMixRecipes(prev => [...prev, newRecipe]);
    triggerSuccess(`Formulación '${recipeData.name}' guardada.`);
  };

  const updateBagStock = (id: string, incoming: number, outgoing: number) => {
    const inc = Math.max(0, Number(incoming) || 0);
    const out = Math.max(0, Number(outgoing) || 0);
    setEmptyBags(prev => prev.map(b => {
      if (b.id === id) {
        const newInc = b.ingresoCompra + inc;
        const newOut = b.preparadoSalida + out;
        return {
          ...b,
          ingresoCompra: newInc,
          preparadoSalida: newOut,
          saldoFinal: Math.max(0, newInc - newOut)
        };
      }
      return b;
    }));
    triggerSuccess(`Stock de bolsas vacías actualizado.`);
  };

  const reconcileAudit = (items: PhysicalAuditItem[]) => {
    setIsLoading(true);
    const dateStr = new Date().toISOString().split('T')[0];
    let adjustedCount = 0;

    setTimeout(() => {
      items.forEach(item => {
        if (item.physicalCountTm === undefined || item.physicalCountTm === null || isNaN(item.physicalCountTm)) {
          return;
        }

        setProducts(pPrev => pPrev.map(p => {
          if (p.id === item.productId) {
            const physicalCount = item.physicalCountTm as number;
            const diffTm = item.differenceTm !== undefined && item.differenceTm !== null 
              ? item.differenceTm 
              : parseFloat((physicalCount - p.currentStockTm).toFixed(2));
            const diffBags = Math.round(diffTm * (1000 / p.bagWeightKg));
            const newStockTm = physicalCount;
            const newBags = Math.max(0, Math.round(physicalCount * (1000 / p.bagWeightKg)));

            if (Math.abs(diffTm) > 0.001) {
              adjustedCount++;
              const kardexItem: InventoryMovement = {
                id: `kard-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                productId: p.id,
                productName: p.name,
                type: 'ADJUSTMENT',
                quantityTm: Math.abs(diffTm),
                quantityBags: Math.abs(diffBags),
                unitCostPen: p.purchasePricePen,
                balanceStockTm: newStockTm,
                balanceBags: newBags,
                referenceType: 'AUDIT',
                referenceId: 'CONTEO_FISICO',
                date: dateStr,
                notes: `Ajuste Conteo Físico (${diffTm > 0 ? '+' : ''}${diffTm} TM) - Motivo: ${item.reason || 'error_conteo'}`,
                adjustmentReason: item.reason || 'error_conteo'
              };
              setKardex(kPrev => [kardexItem, ...kPrev]);
              dbSync.saveKardexMovement(kardexItem);
            }

            const updatedP = { 
              ...p, 
              currentStockTm: newStockTm, 
              currentBags: newBags,
              conteoFisicoTm: physicalCount,
              diferenciaTm: 0
            };
            dbSync.saveProduct(updatedP);
            return updatedP;
          }
          return p;
        }));
      });
      setIsLoading(false);
      triggerSuccess(`Conteo Físico conciliado. Se ajustaron ${adjustedCount} productos en el Kardex.`);
    }, 300);
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    triggerSuccess(`Cliente eliminado.`);
    return true;
  };

  const deletePurchase = (id: string) => {
    setPurchases(prev => prev.filter(p => p.id !== id));
    triggerSuccess(`Compra eliminada.`);
    return true;
  };

  const deleteRecipe = (id: string) => {
    setMixRecipes(prev => prev.filter(r => r.id !== id));
    triggerSuccess(`Fórmula de mezcla eliminada.`);
    return true;
  };

  const addFinancialMovement = (movementData: Omit<FinancialMovement, 'id'>) => {
    const newMov: FinancialMovement = {
      ...movementData,
      id: `fin-${Date.now()}`
    };
    setFinancials(prev => [newMov, ...prev]);
    triggerSuccess(`Movimiento de caja registrado.`);
  };

  const deleteFinancialMovement = (id: string) => {
    setFinancials(prev => prev.filter(f => f.id !== id));
    triggerSuccess(`Movimiento de caja eliminado.`);
    return true;
  };

  return (
    <AppContext.Provider value={{
      activeTab, setActiveTab,
      isLoading, setIsLoading,
      errorMessage, setErrorMessage,
      successMessage, setSuccessMessage,
      themeMode, toggleTheme,
      sidebarOpen, setSidebarOpen,
      products, categories, customers, suppliers,
      purchases, sales, kardex, lots, mixRecipes, mixExecutions,
      emptyBags, financials,
      addProduct, quickAddProduct, updateProduct, deleteProduct, clearProductCount, addCustomer, updateCustomer, deleteCustomer, addSupplier,
      addPurchase, deletePurchase, addSale, anularSale, deleteSale, updateSaleStatus, executeMix,
      addRecipe, deleteRecipe, updateBagStock, reconcileAudit, addFinancialMovement, deleteFinancialMovement, resetToDemoData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
