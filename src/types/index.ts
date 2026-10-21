export type MovementType = 
  | 'INITIAL_STOCK' 
  | 'PURCHASE' 
  | 'SALE' 
  | 'MIX_CONSUMPTION' 
  | 'MIX_PRODUCTION' 
  | 'ADJUSTMENT' 
  | 'RETURN'
  | 'SALE_CANCEL';

export type SaleStatus = 'PENDIENTE' | 'PAGADO' | 'CREDITO' | 'ANULADO' | 'ENTREGADO';

export type PaymentMethod = 'EFECTIVO' | 'YAPE' | 'TRANSFERENCIA' | 'CREDITO';
export type SaleDocumentKind = 'SIN_COMPROBANTE' | 'PROFORMA' | 'BOLETA' | 'FACTURA';
export type SunatStatus = 'NO_APLICA' | 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';
export type PurchaseStatus = 'PENDIENTE_RECOJO' | 'EN_TRANSITO' | 'RECIBIDO' | 'CANCELADO';

export type DocumentType = 'DNI' | 'RUC' | 'PROFORMA' | 'BOLETA' | 'FACTURA' | 'GUIA';

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  unit: 'TM' | 'Bolsa' | 'Kg' | 'Litros';
  bagWeightKg: number; // 50kg por defecto
  minStockTm: number;
  currentStockTm: number;
  currentBags: number;
  purchasePricePen: number; // Valorización unitaria en S/
  salePricePen: number;
  
  // Totales acumulados estilo matriz Excel
  totalVentasBags: number;
  totalPreparadoSalidaTm: number;
  totalPreparadoIngresoTm: number;
  totalIngresoCompraTm: number;
  
  // Auditoría física
  conteoFisicoTm: number;
  diferenciaTm: number;
  
  isMix: boolean;
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  lastName?: string;
  docType: DocumentType;
  docNumber: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  contactName?: string;
  address?: string;
  location?: string; // Fundo, Distrito, Caserío (Ubicación)
  cropType?: string; // Cultivo (Maíz, Papa, Arroz, Palto, Hortalizas, etc.)
  hectares?: number; // Hectáreas de siembra
  soilRiegoType?: string; // Riego Por Goteo / Gravedad / Suelo Arcilloso, etc.
  nextApplicationDate?: string; // Próxima fecha de abonado o fertilización
  notes?: string;
  creditLimit: number;
  currentDebt: number;
}

export interface Supplier {
  id: string;
  companyName: string;
  docType: DocumentType;
  /** Número de documento. Se conserva el nombre `ruc` por compatibilidad con datos anteriores. */
  ruc: string;
  contactName?: string;
  phone?: string;
  alternatePhone?: string;
  address?: string;
  email?: string;
  website?: string;
  notes?: string;
  active?: boolean;
}

export interface FreightCharge {
  id: string;
  origin: string;
  destination?: string;
  carrier?: string;
  amountPen: number;
  status: 'PENDIENTE' | 'PAGADO';
  paymentMethod?: Exclude<PaymentMethod, 'CREDITO'>;
  notes?: string;
}

export interface ProductLot {
  id: string;
  productId: string;
  productName: string;
  lotNumber: string; // Ej: "001", "002", "LOT-2026-01"
  entryDate: string; // YYYY-MM-DD
  initialQuantityTm: number;
  currentQuantityTm: number;
  initialBags: number;
  currentBags: number;
  unitCostPen: number; // Costo unitario en S/
  salePricePen: number; // Precio de venta en S/ para este lote
  status: 'DISPONIBLE' | 'AGOTADO';
  purchaseDocNumber?: string;
  supplierName?: string;
}

export interface PurchaseItem {
  productId: string;
  lotNumber?: string;
  salePricePen?: number;
  quantityTm: number;
  bags: number;
  pricePerTmUsd?: number;
  pricePerTmPen: number;
  totalPen: number;
}

export interface Purchase {
  id: string;
  supplierId: string;
  supplierName: string;
  docNumber: string; // Boleta/Factura
  purchaseDate: string;
  currency: 'PEN' | 'USD';
  exchangeRate: number;
  freightCostPen: number;
  freights?: FreightCharge[];
  totalUsd?: number;
  totalPen: number;
  items: PurchaseItem[];
  status?: PurchaseStatus;
  paymentStatus?: 'PENDIENTE' | 'PARCIAL' | 'PAGADO';
  paymentMethod?: PaymentMethod;
  paidAmount?: number;
  expectedPickupDate?: string;
  receivedDate?: string;
  inventoryPosted?: boolean;
  notes?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  lotNumber?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  proformaNumber: string;
  saleDate: string;
  customerId: string;
  customerName: string;
  status: SaleStatus;
  totalAmount: number;
  paidAmount: number;
  items: SaleItem[];
  notes?: string;
  paymentMethod?: PaymentMethod;
  documentType?: SaleDocumentKind;
  documentSeries?: string;
  documentNumber?: string;
  sunatStatus?: SunatStatus;
  dueDate?: string;
  deliveryStatus?: 'PENDIENTE' | 'ENTREGADO';
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  lotNumber?: string;
  type: MovementType;
  quantityTm: number;
  quantityBags: number;
  unitCostPen: number;
  salePricePen?: number;
  balanceStockTm: number;
  balanceBags: number;
  referenceType?: 'PURCHASE' | 'SALE' | 'MIX_EXECUTION' | 'AUDIT' | 'INITIAL' | 'CANCEL';
  referenceId?: string;
  date: string;
  notes?: string;
  adjustmentReason?: AdjustmentReason;
}

export interface MixIngredient {
  productId: string;
  productName: string;
  quantityTm: number;
}

export interface MixRecipe {
  id: string;
  name: string;
  targetProductId: string;
  targetProductName: string;
  batchSizeTm: number;
  ingredients: MixIngredient[];
  description?: string;
}

export interface MixExecution {
  id: string;
  mixRecipeId: string;
  recipeName: string;
  producedQtyTm: number;
  producedBags: number;
  executionDate: string;
  proformaNumber?: string;
  consumedItems: {
    productId: string;
    productName: string;
    consumedQtyTm: number;
    consumedBags: number;
  }[];
}

export interface EmptyBagStock {
  id: string;
  bagName: string;
  ventas: number;
  preparadoSalida: number;
  ingresoCompra: number;
  saldoFinal: number;
  minStock: number;
}

export type AdjustmentReason = 
  | 'error_conteo' 
  | 'merma' 
  | 'producto_entregado' 
  | 'producto_deteriorado' 
  | 'error_registro' 
  | 'otro';

export interface PhysicalAuditItem {
  productId: string;
  productName: string;
  systemStockTm: number;
  physicalCountTm?: number | null;
  differenceTm?: number | null;
  reason?: AdjustmentReason;
  notes?: string;
}

export interface FinancialMovement {
  id: string;
  date: string;
  type: 'INGRESOS' | 'EGRESOS';
  category: 'VENTA' | 'COMPRA' | 'TRANSPORTE' | 'ESTIBA' | 'AGUA' | 'LUZ' | 'PROFORMAS' | 'CINTA' | 'BOLSAS' | 'OTROS';
  description: string;
  amountPen: number;
  cashRegister: 'CAJA_1' | 'CAJA_2';
  paymentMethod?: PaymentMethod;
  referenceId?: string;
}

export interface CashClosing {
  id: string;
  createdAt: string;
  from: string;
  to: string;
  label: string;
  incomePen: number;
  expensePen: number;
  balancePen: number;
  salesPen: number;
  purchasesPen: number;
  notes?: string;
}

export interface DailyClosingSummary {
  date: string;
  totalSalesPen: number;
  totalSalesTm: number;
  totalSalesBags: number;
  totalPurchasesPen: number;
  totalPurchasesTm: number;
  totalMixesTm: number;
  totalIncomePen: number;
  totalExpensePen: number;
  creditsGeneratedPen: number;
  collectionsPen: number;
  finalStockTm: number;
  finalStockBags: number;
  emptyBagsSaldo: number;
  discrepanciesCount: number;
  caja1Balance: number;
  caja2Balance: number;
}
