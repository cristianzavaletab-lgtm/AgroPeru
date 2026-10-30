import { isSupabaseSyncEnabled, supabase } from './supabase';
import {
  Product, Customer, Supplier, Purchase, Sale, InventoryMovement,
  MixRecipe, MixExecution, EmptyBagStock, FinancialMovement,
  ProductLot, CashClosing
} from '../types';

export interface AppStateSnapshot {
  products: Product[];
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
  cashClosings: CashClosing[];
}

const stateId = import.meta.env.VITE_APP_STATE_ID || 'agroperu-main';

export const dbSync = {
  async getAppState(): Promise<AppStateSnapshot | null> {
    if (!isSupabaseSyncEnabled) return null;
    const { data, error } = await supabase
      .from('app_state')
      .select('payload')
      .eq('id', stateId)
      .abortSignal(AbortSignal.timeout(12_000))
      .maybeSingle();
    if (error) throw error;
    return data?.payload as AppStateSnapshot | null;
  },

  async saveAppState(payload: AppStateSnapshot): Promise<void> {
    if (!isSupabaseSyncEnabled) return;
    const { error } = await supabase.from('app_state').upsert({
      id: stateId,
      payload,
      updated_at: new Date().toISOString(),
    }).abortSignal(AbortSignal.timeout(12_000));
    if (error) throw error;
  },

  subscribeToAppState(onChange: (payload: AppStateSnapshot) => void): () => void {
    if (!isSupabaseSyncEnabled) return () => undefined;
    const channel = supabase
      .channel(`app-state-${stateId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_state', filter: `id=eq.${stateId}` },
        event => {
          const payload = (event.new as { payload?: AppStateSnapshot } | null)?.payload;
          if (payload) onChange(payload);
        }
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  },

  // Products
  async getProducts(): Promise<Product[] | null> {
    if (!isSupabaseSyncEnabled) return null;
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error || !data || data.length === 0) return null;
      return data.map((p: any) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        categoryId: p.category_id || 'cat-1',
        unit: p.unit || 'TM',
        bagWeightKg: Number(p.bag_weight_kg || 50),
        minStockTm: Number(p.min_stock_tm || 5),
        currentStockTm: Number(p.current_stock_tm || 0),
        currentBags: Number(p.current_bags || 0),
        purchasePricePen: Number(p.purchase_price_pen || 0),
        salePricePen: Number(p.sale_price_pen || 0),
        totalVentasBags: Number(p.total_ventas_bags || 0),
        totalPreparadoSalidaTm: Number(p.total_preparado_salida_tm || 0),
        totalPreparadoIngresoTm: Number(p.total_preparado_ingreso_tm || 0),
        totalIngresoCompraTm: Number(p.total_ingreso_compra_tm || 0),
        conteoFisicoTm: Number(p.conteo_fisico_tm || 0),
        diferenciaTm: Number(p.diferencia_tm || 0),
        isMix: Boolean(p.is_mix),
        active: Boolean(p.active)
      }));
    } catch {
      return null;
    }
  },

  async saveProduct(p: Product) {
    if (!isSupabaseSyncEnabled) return;
    try {
      await supabase.from('products').upsert({
        id: p.id,
        code: p.code,
        name: p.name,
        category_id: p.categoryId,
        unit: p.unit,
        bag_weight_kg: p.bagWeightKg,
        min_stock_tm: p.minStockTm,
        current_stock_tm: p.currentStockTm,
        current_bags: p.currentBags,
        purchase_price_pen: p.purchasePricePen,
        sale_price_pen: p.salePricePen,
        total_ventas_bags: p.totalVentasBags,
        total_preparado_salida_tm: p.totalPreparadoSalidaTm,
        total_preparado_ingreso_tm: p.totalPreparadoIngresoTm,
        total_ingreso_compra_tm: p.totalIngresoCompraTm,
        conteo_fisico_tm: p.conteoFisicoTm,
        diferencia_tm: p.diferenciaTm,
        is_mix: p.isMix,
        active: p.active
      });
    } catch (e) {
      console.warn('Supabase sync error:', e);
    }
  },

  // Customers
  async getCustomers(): Promise<Customer[] | null> {
    if (!isSupabaseSyncEnabled) return null;
    try {
      const { data, error } = await supabase.from('customers').select('*');
      if (error || !data || data.length === 0) return null;
      return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        lastName: c.last_name,
        docType: c.doc_type,
        docNumber: c.doc_number,
        phone: c.phone,
        alternatePhone: c.alternate_phone,
        email: c.email,
        contactName: c.contact_name,
        address: c.address,
        location: c.location,
        cropType: c.crop_type,
        hectares: Number(c.hectares || 0),
        soilRiegoType: c.soil_riego_type,
        nextApplicationDate: c.next_application_date,
        notes: c.notes,
        creditLimit: Number(c.credit_limit || 25000),
        currentDebt: Number(c.current_debt || 0)
      }));
    } catch {
      return null;
    }
  },

  async saveCustomer(c: Customer) {
    if (!isSupabaseSyncEnabled) return;
    try {
      await supabase.from('customers').upsert({
        id: c.id,
        name: c.name,
        last_name: c.lastName,
        doc_type: c.docType,
        doc_number: c.docNumber,
        phone: c.phone,
        alternate_phone: c.alternatePhone,
        email: c.email,
        contact_name: c.contactName,
        address: c.address,
        location: c.location,
        crop_type: c.cropType,
        hectares: c.hectares,
        soil_riego_type: c.soilRiegoType,
        next_application_date: c.nextApplicationDate,
        notes: c.notes,
        credit_limit: c.creditLimit,
        current_debt: c.currentDebt
      });
    } catch (e) {
      console.warn('Supabase sync error:', e);
    }
  },

  // Suppliers
  async getSuppliers(): Promise<Supplier[] | null> {
    if (!isSupabaseSyncEnabled) return null;
    try {
      const { data, error } = await supabase.from('suppliers').select('*');
      if (error || !data || data.length === 0) return null;
      return data.map((supplier: any) => ({
        id: supplier.id,
        companyName: supplier.company_name,
        docType: supplier.doc_type || (String(supplier.ruc || '').length === 8 ? 'DNI' : 'RUC'),
        ruc: String(supplier.ruc || ''),
        contactName: supplier.contact_name,
        phone: supplier.phone,
        alternatePhone: supplier.alternate_phone,
        address: supplier.address,
        email: supplier.email,
        website: supplier.website,
        notes: supplier.notes,
        active: supplier.active !== false,
      }));
    } catch {
      return null;
    }
  },

  async saveSupplier(supplier: Supplier) {
    if (!isSupabaseSyncEnabled) return;
    try {
      await supabase.from('suppliers').upsert({
        id: supplier.id,
        company_name: supplier.companyName,
        doc_type: supplier.docType,
        ruc: supplier.ruc,
        contact_name: supplier.contactName,
        phone: supplier.phone,
        alternate_phone: supplier.alternatePhone,
        address: supplier.address,
        email: supplier.email,
        website: supplier.website,
        notes: supplier.notes,
        active: supplier.active !== false,
      });
    } catch (error) {
      console.warn('Supabase supplier sync error:', error);
    }
  },

  async deleteSupplier(id: string) {
    if (!isSupabaseSyncEnabled) return;
    try {
      await supabase.from('suppliers').delete().eq('id', id);
    } catch (error) {
      console.warn('Supabase supplier delete error:', error);
    }
  },

  // Sales
  async getSales(): Promise<Sale[] | null> {
    if (!isSupabaseSyncEnabled) return null;
    try {
      const { data, error } = await supabase.from('sales').select('*').order('sale_date', { ascending: false });
      if (error || !data || data.length === 0) return null;
      return data.map((s: any) => ({
        id: s.id,
        proformaNumber: s.proforma_number,
        saleDate: s.sale_date,
        customerId: s.customer_id,
        customerName: s.customer_name,
        status: s.status,
        totalAmount: Number(s.total_amount),
        paidAmount: Number(s.paid_amount),
        items: s.items || [],
        notes: s.notes
      }));
    } catch {
      return null;
    }
  },

  async saveSale(s: Sale) {
    if (!isSupabaseSyncEnabled) return;
    try {
      await supabase.from('sales').upsert({
        id: s.id,
        proforma_number: s.proformaNumber,
        sale_date: s.saleDate,
        customer_id: s.customerId,
        customer_name: s.customerName,
        status: s.status,
        total_amount: s.totalAmount,
        paid_amount: s.paidAmount,
        items: s.items,
        notes: s.notes
      });
    } catch (e) {
      console.warn('Supabase sync error:', e);
    }
  },

  // Kardex
  async saveKardexMovement(m: InventoryMovement) {
    if (!isSupabaseSyncEnabled) return;
    try {
      await supabase.from('kardex_movements').upsert({
        id: m.id,
        product_id: m.productId,
        product_name: m.productName,
        type: m.type,
        quantity_tm: m.quantityTm,
        quantity_bags: m.quantityBags,
        unit_cost_pen: m.unitCostPen,
        balance_stock_tm: m.balanceStockTm,
        balance_bags: m.balanceBags,
        reference_type: m.referenceType,
        reference_id: m.referenceId,
        date: m.date,
        notes: m.notes
      });
    } catch (e) {
      console.warn('Supabase sync error:', e);
    }
  }
};
