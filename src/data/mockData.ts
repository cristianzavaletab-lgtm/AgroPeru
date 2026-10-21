import { Product, Category, Customer, Supplier, Purchase, Sale, InventoryMovement, MixRecipe, MixExecution, EmptyBagStock, FinancialMovement, ProductLot } from '../types';

export const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Fertilizantes Nitrogenados', description: 'Urea, Sulfato de Amonio y Nitratos' },
  { id: 'cat-2', name: 'Fertilizantes Fosfatados', description: 'Fosfatos monoamónicos, diamónicos y triples' },
  { id: 'cat-3', name: 'Fertilizantes Potásicos', description: 'Cloruro de potasio, Sulpomag, Sulfato de potasio' },
  { id: 'cat-4', name: 'Mezclas & Formulaciones NPK', description: 'Molimax, Supermix, Compomaster y mezclas preparadas' },
  { id: 'cat-5', name: 'Especiales & Enmiendas', description: 'YaraMila, Nitros, Cal Agrícola, Guano de Isla, Kieserita' },
];

export const initialProducts: Product[] = [
  { id: 'p-1', code: 'UREA-AGR', name: 'UREA AGRICOLA', categoryId: 'cat-1', unit: 'TM', bagWeightKg: 50, minStockTm: 10, currentStockTm: 24.5, currentBags: 490, purchasePricePen: 2120, salePricePen: 2240, totalVentasBags: 380, totalPreparadoSalidaTm: 3.5, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 48.0, conteoFisicoTm: 24.5, diferenciaTm: 0, isMix: false, active: true },
  { id: 'p-2', code: 'UREA-GRA', name: 'UREA GRANULAR', categoryId: 'cat-1', unit: 'TM', bagWeightKg: 50, minStockTm: 8, currentStockTm: 18.0, currentBags: 360, purchasePricePen: 2180, salePricePen: 2300, totalVentasBags: 100, totalPreparadoSalidaTm: 0, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 23.0, conteoFisicoTm: 18.0, diferenciaTm: 0, isMix: false, active: true },
  { id: 'p-3', code: 'UREA-AMA', name: 'UREA AMARILLA', categoryId: 'cat-1', unit: 'TM', bagWeightKg: 50, minStockTm: 2, currentStockTm: 6.0, currentBags: 120, purchasePricePen: 2000, salePricePen: 2150, totalVentasBags: 0, totalPreparadoSalidaTm: 0, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 6.0, conteoFisicoTm: 6.0, diferenciaTm: 0, isMix: false, active: true },
  { id: 'p-4', code: 'SULF-AMO', name: 'SULFATO DE AMONIO', categoryId: 'cat-1', unit: 'TM', bagWeightKg: 50, minStockTm: 15, currentStockTm: 32.0, currentBags: 640, purchasePricePen: 1250, salePricePen: 1380, totalVentasBags: 300, totalPreparadoSalidaTm: 0, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 47.0, conteoFisicoTm: 32.0, diferenciaTm: 0, isMix: false, active: true },
  { id: 'p-5', code: 'SULF-MARR', name: 'SULFATO GR MARRON', categoryId: 'cat-1', unit: 'TM', bagWeightKg: 50, minStockTm: 5, currentStockTm: 12.0, currentBags: 240, purchasePricePen: 1300, salePricePen: 1450, totalVentasBags: 0, totalPreparadoSalidaTm: 0, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 12.0, conteoFisicoTm: 12.0, diferenciaTm: 0, isMix: false, active: true },
  { id: 'p-6', code: 'SULF-BLAN', name: 'SULFATO GR BLANCO', categoryId: 'cat-1', unit: 'TM', bagWeightKg: 50, minStockTm: 5, currentStockTm: 15.0, currentBags: 300, purchasePricePen: 1320, salePricePen: 1480, totalVentasBags: 80, totalPreparadoSalidaTm: 1.5, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 20.5, conteoFisicoTm: 15.0, diferenciaTm: 0, isMix: false, active: true },
  { id: 'p-7', code: 'FURIA', name: 'FURIA', categoryId: 'cat-5', unit: 'TM', bagWeightKg: 50, minStockTm: 2, currentStockTm: 4.0, currentBags: 80, purchasePricePen: 2500, salePricePen: 2800, totalVentasBags: 0, totalPreparadoSalidaTm: 0, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 4.0, conteoFisicoTm: 4.0, diferenciaTm: 0, isMix: false, active: true },
  { id: 'p-8', code: 'MOLI-16', name: 'MOLI 16', categoryId: 'cat-4', unit: 'TM', bagWeightKg: 50, minStockTm: 2, currentStockTm: 6.0, currentBags: 120, purchasePricePen: 2600, salePricePen: 2900, totalVentasBags: 0, totalPreparadoSalidaTm: 0, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 6.0, conteoFisicoTm: 6.0, diferenciaTm: 0, isMix: false, active: true },
  { id: 'p-9', code: 'YARA-COMP', name: 'YARAMILA COMPLEX', categoryId: 'cat-5', unit: 'TM', bagWeightKg: 50, minStockTm: 5, currentStockTm: 8.5, currentBags: 170, purchasePricePen: 3800, salePricePen: 4400, totalVentasBags: 280, totalPreparadoSalidaTm: 0, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 22.5, conteoFisicoTm: 8.5, diferenciaTm: 0, isMix: false, active: true },
  { id: 'p-10', code: 'YARA-COMPL-ALT', name: 'YARAMILA - COMPLEJO', categoryId: 'cat-5', unit: 'TM', bagWeightKg: 50, minStockTm: 2, currentStockTm: 3.0, currentBags: 60, purchasePricePen: 3800, salePricePen: 4400, totalVentasBags: 0, totalPreparadoSalidaTm: 0, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 3.0, conteoFisicoTm: 3.0, diferenciaTm: 0, isMix: false, active: true },
  { id: 'p-11', code: 'NITR-MAX-VERD', name: 'NITROS S MAX VERDE', categoryId: 'cat-5', unit: 'TM', bagWeightKg: 50, minStockTm: 5, currentStockTm: 9.0, currentBags: 180, purchasePricePen: 2700, salePricePen: 3100, totalVentasBags: 60, totalPreparadoSalidaTm: 0, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 12.0, conteoFisicoTm: 9.0, diferenciaTm: 0, isMix: false, active: true },
  { id: 'p-12', code: 'NITR-S-AGRO', name: 'NITRO S AGROPERU', categoryId: 'cat-5', unit: 'TM', bagWeightKg: 50, minStockTm: 10, currentStockTm: 14.0, currentBags: 280, purchasePricePen: 2650, salePricePen: 3000, totalVentasBags: 80, totalPreparadoSalidaTm: 0, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 18.0, conteoFisicoTm: 14.0, diferenciaTm: 0, isMix: false, active: true },
  { id: 'p-13', code: 'MOLI-NITR-GR', name: 'MOLIMAX NITRO GR', categoryId: 'cat-4', unit: 'TM', bagWeightKg: 50, minStockTm: 2, currentStockTm: 6.5, currentBags: 130, purchasePricePen: 2750, salePricePen: 3100, totalVentasBags: 0, totalPreparadoSalidaTm: 0, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 6.5, conteoFisicoTm: 6.5, diferenciaTm: 0, isMix: true, active: true },
  { id: 'p-14', code: 'NITR-S-AMA', name: 'NITRO S AMARILLO', categoryId: 'cat-5', unit: 'TM', bagWeightKg: 50, minStockTm: 2, currentStockTm: 5.0, currentBags: 100, purchasePricePen: 2650, salePricePen: 3000, totalVentasBags: 0, totalPreparadoSalidaTm: 0, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 5.0, conteoFisicoTm: 5.0, diferenciaTm: 0, isMix: false, active: true },
  { id: 'p-15', code: 'NITR-AMO', name: 'NITRATO DE AMONIO', categoryId: 'cat-1', unit: 'TM', bagWeightKg: 50, minStockTm: 15, currentStockTm: 20.0, currentBags: 400, purchasePricePen: 2400, salePricePen: 2750, totalVentasBags: 0, totalPreparadoSalidaTm: 0, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 20.0, conteoFisicoTm: 20.0, diferenciaTm: 0, isMix: false, active: true },
  { id: 'p-16', code: 'FOSF-DIAM', name: 'FOSFATO DIAMONICO', categoryId: 'cat-2', unit: 'TM', bagWeightKg: 50, minStockTm: 10, currentStockTm: 28.0, currentBags: 560, purchasePricePen: 3200, salePricePen: 3600, totalVentasBags: 280, totalPreparadoSalidaTm: 4.0, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 46.0, conteoFisicoTm: 28.0, diferenciaTm: 0, isMix: false, active: true },
  { id: 'p-17', code: 'FOSF-CHAU', name: 'FOSFATO CHAUPE', categoryId: 'cat-2', unit: 'TM', bagWeightKg: 50, minStockTm: 2, currentStockTm: 8.0, currentBags: 160, purchasePricePen: 3000, salePricePen: 3400, totalVentasBags: 0, totalPreparadoSalidaTm: 0, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 8.0, conteoFisicoTm: 8.0, diferenciaTm: 0, isMix: false, active: true },
  { id: 'p-18', code: 'SUPE-FOSF-TRIP', name: 'SUPER FOSFATO TRIPLE', categoryId: 'cat-2', unit: 'TM', bagWeightKg: 50, minStockTm: 2, currentStockTm: 14.5, currentBags: 290, purchasePricePen: 2800, salePricePen: 3200, totalVentasBags: 0, totalPreparadoSalidaTm: 3.5, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 18.0, conteoFisicoTm: 14.5, diferenciaTm: 0, isMix: false, active: true },
  { id: 'p-19', code: 'ROCA-FOSF', name: 'ROCA FOSFORICA', categoryId: 'cat-2', unit: 'TM', bagWeightKg: 50, minStockTm: 2, currentStockTm: 10.0, currentBags: 200, purchasePricePen: 1100, salePricePen: 1350, totalVentasBags: 0, totalPreparadoSalidaTm: 0, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 10.0, conteoFisicoTm: 10.0, diferenciaTm: 0, isMix: false, active: true },
  { id: 'p-20', code: 'CLOR-POTA', name: 'CLORURO DE POTASIO', categoryId: 'cat-3', unit: 'TM', bagWeightKg: 50, minStockTm: 10, currentStockTm: 22.0, currentBags: 440, purchasePricePen: 2400, salePricePen: 2700, totalVentasBags: 260, totalPreparadoSalidaTm: 4.5, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 49.5, conteoFisicoTm: 22.0, diferenciaTm: 0, isMix: false, active: true },
  { id: 'p-21', code: 'SULP-PREM', name: 'SULPOMAG PREMIUM', categoryId: 'cat-3', unit: 'TM', bagWeightKg: 50, minStockTm: 5, currentStockTm: 16.5, currentBags: 330, purchasePricePen: 2350, salePricePen: 2650, totalVentasBags: 140, totalPreparadoSalidaTm: 0, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 23.5, conteoFisicoTm: 16.5, diferenciaTm: 0, isMix: false, active: true },
  { id: 'p-22', code: 'SULF-POTA-GR', name: 'SULFATO DE POTASIO GR', categoryId: 'cat-3', unit: 'TM', bagWeightKg: 50, minStockTm: 5, currentStockTm: 11.0, currentBags: 220, purchasePricePen: 2900, salePricePen: 3300, totalVentasBags: 0, totalPreparadoSalidaTm: 3.0, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 14.0, conteoFisicoTm: 11.0, diferenciaTm: 0, isMix: false, active: true },
  { id: 'p-23', code: 'MOLI-NPK-20', name: 'MOLIMAX NPK 20-20-20', categoryId: 'cat-4', unit: 'TM', bagWeightKg: 50, minStockTm: 5, currentStockTm: 12.5, currentBags: 250, purchasePricePen: 2950, salePricePen: 3350, totalVentasBags: 0, totalPreparadoSalidaTm: 0, totalPreparadoIngresoTm: 10.0, totalIngresoCompraTm: 2.5, conteoFisicoTm: 12.5, diferenciaTm: 0, isMix: true, active: true },
  { id: 'p-24', code: 'MOLI-PAPA-SIER', name: 'MOLIMAX PAPA SIERRA', categoryId: 'cat-4', unit: 'TM', bagWeightKg: 50, minStockTm: 8, currentStockTm: 15.0, currentBags: 300, purchasePricePen: 2900, salePricePen: 3300, totalVentasBags: 120, totalPreparadoSalidaTm: 0, totalPreparadoIngresoTm: 15.0, totalIngresoCompraTm: 6.0, conteoFisicoTm: 15.0, diferenciaTm: 0, isMix: true, active: true },
  { id: 'p-25', code: 'SUPE-MIX-PAPA', name: 'SUPER MIX PAPA SIERRA', categoryId: 'cat-4', unit: 'TM', bagWeightKg: 50, minStockTm: 2, currentStockTm: 7.5, currentBags: 150, purchasePricePen: 2850, salePricePen: 3250, totalVentasBags: 60, totalPreparadoSalidaTm: 0, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 10.5, conteoFisicoTm: 7.5, diferenciaTm: 0, isMix: true, active: true },
  { id: 'p-26', code: 'MEZC-NPK-INTE', name: 'MEZCLA NPK INTERMEDIA', categoryId: 'cat-4', unit: 'TM', bagWeightKg: 50, minStockTm: 5, currentStockTm: 10.0, currentBags: 200, purchasePricePen: 2650, salePricePen: 3050, totalVentasBags: 0, totalPreparadoSalidaTm: 0, totalPreparadoIngresoTm: 10.0, totalIngresoCompraTm: 0, conteoFisicoTm: 10.0, diferenciaTm: 0, isMix: true, active: true },
  { id: 'p-27', code: 'TRIP-NACI', name: 'TRIPLE NACIONAL', categoryId: 'cat-2', unit: 'TM', bagWeightKg: 50, minStockTm: 5, currentStockTm: 18.0, currentBags: 360, purchasePricePen: 2300, salePricePen: 2650, totalVentasBags: 20, totalPreparadoSalidaTm: 7.0, totalPreparadoIngresoTm: 0, totalIngresoCompraTm: 26.0, conteoFisicoTm: 18.0, diferenciaTm: 0, isMix: false, active: true }
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Fundo San José S.A.C.',
    lastName: '',
    docType: 'RUC',
    docNumber: '20601234567',
    phone: '956842103',
    address: 'Panamericana Sur Km 142, San Vicente',
    location: 'Cañete - Lima',
    cropType: 'Maíz Amarillo Duro',
    hectares: 45,
    soilRiegoType: 'Riego Por Goteo',
    nextApplicationDate: '2026-10-15',
    notes: 'Cliente preferencial con compra de mezclas nitrogenadas y solubles.',
    creditLimit: 50000,
    currentDebt: 18400
  },
  {
    id: 'cust-2',
    name: 'Cooperativa Agraria Valle de Ica',
    lastName: '',
    docType: 'RUC',
    docNumber: '20456789123',
    phone: '984120938',
    address: 'Av. Los Maestros 310',
    location: 'Ica - Subtanjalla',
    cropType: 'Palto HASS / Vid',
    hectares: 120,
    soilRiegoType: 'Riego Tecnificado',
    nextApplicationDate: '2026-10-10',
    notes: 'Consumen altos volúmenes de YaraMila Complex y Sulpomag.',
    creditLimit: 100000,
    currentDebt: 34200
  },
  {
    id: 'cust-3',
    name: 'Agrícola Huancayo E.I.R.L.',
    lastName: '',
    docType: 'RUC',
    docNumber: '20543219876',
    phone: '964128930',
    address: 'Av. Ferrocarril 850',
    location: 'Concepción - Junín',
    cropType: 'Papa Canchan / Yungay',
    hectares: 35,
    soilRiegoType: 'Riego por Gravedad',
    nextApplicationDate: '2026-10-20',
    notes: 'Compran fórmulas especiales de Papa Sierra y Supermix.',
    creditLimit: 30000,
    currentDebt: 9800
  },
  {
    id: 'cust-4',
    name: 'Asociación de Agricultores del Santa',
    lastName: '',
    docType: 'RUC',
    docNumber: '20389102934',
    phone: '943892019',
    address: 'Calle San Martín 102, Valle Chimbote',
    location: 'Chimbote - Ancash',
    cropType: 'Arroz / Espárrago',
    hectares: 80,
    soilRiegoType: 'Riego por Gravedad',
    nextApplicationDate: '2026-11-01',
    notes: 'Pagos al contado mediante transferencias bancarias.',
    creditLimit: 40000,
    currentDebt: 0
  },
  {
    id: 'cust-5',
    name: 'Don Jorge',
    lastName: 'Alva Rivas',
    docType: 'DNI',
    docNumber: '10428912',
    phone: '952019283',
    address: 'Fundo El Carmen Mz C Lote 4',
    location: 'Chincha - Ica',
    cropType: 'Maíz / Hortalizas',
    hectares: 15,
    soilRiegoType: 'Riego por Goteo',
    nextApplicationDate: '2026-10-18',
    notes: 'Abonado mensual de Nitro S Agroperú.',
    creditLimit: 15000,
    currentDebt: 4500
  },
  {
    id: 'cust-6',
    name: 'Fundo El Naranjal E.I.R.L.',
    lastName: '',
    docType: 'RUC',
    docNumber: '20591827364',
    phone: '914829102',
    address: 'Carretera Huaral - Palpa Km 8',
    location: 'Huaral - Lima',
    cropType: 'Cítricos / Palto',
    hectares: 28,
    soilRiegoType: 'Riego Tecnificado',
    nextApplicationDate: '2026-10-25',
    notes: 'Cliente muy puntual en abonos.',
    creditLimit: 25000,
    currentDebt: 0
  },
  {
    id: 'cust-7',
    name: 'Empresa Agrícola Arequipa S.A.',
    lastName: '',
    docType: 'RUC',
    docNumber: '20129384756',
    phone: '959182736',
    address: 'Asociación Majes Sección 3 Mz F',
    location: 'Majes - Arequipa',
    cropType: 'Cebolla / Papa',
    hectares: 60,
    soilRiegoType: 'Pivote Central',
    nextApplicationDate: '2026-10-12',
    notes: 'Crédito autorizados a 30 días.',
    creditLimit: 60000,
    currentDebt: 22000
  },
  {
    id: 'cust-8',
    name: 'Don Víctor',
    lastName: 'Mendoza Chuy',
    docType: 'DNI',
    docNumber: '08923415',
    phone: '987129384',
    address: 'Caserío Medio Mundo S/N',
    location: 'Barranca - Lima',
    cropType: 'Camote / Maíz',
    hectares: 18,
    soilRiegoType: 'Riego por Gravedad',
    nextApplicationDate: '2026-10-30',
    notes: 'Compras de Urea Granular y Sulfato Blanco.',
    creditLimit: 20000,
    currentDebt: 0
  }
];

export const initialSuppliers: Supplier[] = [
  { id: 'supp-1', companyName: 'INTI Agroquímicos S.A.C.', docType: 'RUC', ruc: '20100492817', contactName: 'Ing. Carlos Mendoza', phone: '014829300', address: 'Av. Industrial 450, Callao - Lima' },
  { id: 'supp-2', companyName: 'Fertilizantes del Perú S.A.', docType: 'RUC', ruc: '20501928371', contactName: 'Mariela Torres', phone: '016192800', address: 'Av. Argentina 2040, Lima' },
  { id: 'supp-3', companyName: 'Molinos Agro S.A.', docType: 'RUC', ruc: '20492810394', contactName: 'Roberto Gómez', phone: '013158000', address: 'Panamericana Sur Km 18, Lurín' },
  { id: 'supp-4', companyName: 'YARA Perú S.R.L.', docType: 'RUC', ruc: '20382910482', contactName: 'Ing. Alfonso Ruiz', phone: '012114000', address: 'Av. Víctor Andrés Belaúnde 147, San Isidro' },
  { id: 'supp-5', companyName: 'Equipak S.A.C.', docType: 'RUC', ruc: '20519283746', contactName: 'Carmen Vásquez', phone: '014942000', address: 'Av. Separatadora Industrial 1820, Ate' }
];

export const initialLots: ProductLot[] = [
  { id: 'lot-101', productId: 'p-1', productName: 'UREA AGRICOLA', lotNumber: 'LOT-2026-001', entryDate: '2026-09-15', initialQuantityTm: 20.0, currentQuantityTm: 15.0, initialBags: 400, currentBags: 300, unitCostPen: 2120, salePricePen: 2240, status: 'DISPONIBLE', purchaseDocNumber: 'F001-00142', supplierName: 'INTI Agroquímicos S.A.C.' },
  { id: 'lot-102', productId: 'p-1', productName: 'UREA AGRICOLA', lotNumber: 'LOT-2026-002', entryDate: '2026-09-15', initialQuantityTm: 10.0, currentQuantityTm: 9.5, initialBags: 200, currentBags: 190, unitCostPen: 2120, salePricePen: 2240, status: 'DISPONIBLE', purchaseDocNumber: 'F001-00142', supplierName: 'INTI Agroquímicos S.A.C.' },
  { id: 'lot-103', productId: 'p-16', productName: 'FOSFATO DIAMONICO', lotNumber: 'LOT-2026-003', entryDate: '2026-09-15', initialQuantityTm: 20.0, currentQuantityTm: 28.0, initialBags: 400, currentBags: 560, unitCostPen: 3200, salePricePen: 3600, status: 'DISPONIBLE', purchaseDocNumber: 'F001-00142', supplierName: 'INTI Agroquímicos S.A.C.' },
  { id: 'lot-104', productId: 'p-20', productName: 'CLORURO DE POTASIO', lotNumber: 'LOT-2026-004', entryDate: '2026-09-18', initialQuantityTm: 20.0, currentQuantityTm: 22.0, initialBags: 400, currentBags: 440, unitCostPen: 2400, salePricePen: 2700, status: 'DISPONIBLE', purchaseDocNumber: 'F003-00891', supplierName: 'Fertilizantes del Perú S.A.' },
  { id: 'lot-105', productId: 'p-4', productName: 'SULFATO DE AMONIO', lotNumber: 'LOT-2026-005', entryDate: '2026-09-15', initialQuantityTm: 30.0, currentQuantityTm: 32.0, initialBags: 600, currentBags: 640, unitCostPen: 1250, salePricePen: 1380, status: 'DISPONIBLE', purchaseDocNumber: 'F001-00142', supplierName: 'INTI Agroquímicos S.A.C.' },
  { id: 'lot-106', productId: 'p-21', productName: 'SULPOMAG PREMIUM', lotNumber: 'LOT-2026-006', entryDate: '2026-09-18', initialQuantityTm: 15.0, currentQuantityTm: 16.5, initialBags: 300, currentBags: 330, unitCostPen: 2350, salePricePen: 2650, status: 'DISPONIBLE', purchaseDocNumber: 'F003-00891', supplierName: 'Fertilizantes del Perú S.A.' },
  { id: 'lot-107', productId: 'p-9', productName: 'YARAMILA COMPLEX', lotNumber: 'LOT-2026-007', entryDate: '2026-09-18', initialQuantityTm: 10.0, currentQuantityTm: 8.5, initialBags: 200, currentBags: 170, unitCostPen: 3800, salePricePen: 4400, status: 'DISPONIBLE', purchaseDocNumber: 'F003-00891', supplierName: 'Fertilizantes del Perú S.A.' },
  { id: 'lot-108', productId: 'p-24', productName: 'MOLIMAX PAPA SIERRA', lotNumber: 'LOT-2026-008', entryDate: '2026-09-20', initialQuantityTm: 15.0, currentQuantityTm: 15.0, initialBags: 300, currentBags: 300, unitCostPen: 2900, salePricePen: 3300, status: 'DISPONIBLE', purchaseDocNumber: 'F002-00512', supplierName: 'Molinos Agro S.A.' },
  { id: 'lot-109', productId: 'p-27', productName: 'TRIPLE NACIONAL', lotNumber: 'LOT-2026-009', entryDate: '2026-09-20', initialQuantityTm: 20.0, currentQuantityTm: 18.0, initialBags: 400, currentBags: 360, unitCostPen: 2300, salePricePen: 2650, status: 'DISPONIBLE', purchaseDocNumber: 'F002-00512', supplierName: 'Molinos Agro S.A.' },
  { id: 'lot-110', productId: 'p-12', productName: 'NITRO S AGROPERU', lotNumber: 'LOT-2026-010', entryDate: '2026-09-22', initialQuantityTm: 12.0, currentQuantityTm: 14.0, initialBags: 240, currentBags: 280, unitCostPen: 2650, salePricePen: 3000, status: 'DISPONIBLE', purchaseDocNumber: 'F005-00231', supplierName: 'YARA Perú S.R.L.' }
];

export const initialPurchases: Purchase[] = [
  {
    id: 'pur-1',
    supplierId: 'supp-1',
    supplierName: 'INTI Agroquímicos S.A.C.',
    docNumber: 'F001-00142',
    purchaseDate: '2026-09-15',
    currency: 'PEN',
    exchangeRate: 3.75,
    freightCostPen: 2100,
    totalPen: 108100,
    items: [
      { productId: 'p-1', lotNumber: 'LOT-2026-001', quantityTm: 20, bags: 400, pricePerTmPen: 2120, totalPen: 42400 },
      { productId: 'p-4', lotNumber: 'LOT-2026-005', quantityTm: 30, bags: 600, pricePerTmPen: 1250, totalPen: 37500 },
      { productId: 'p-16', lotNumber: 'LOT-2026-003', quantityTm: 20, bags: 400, pricePerTmPen: 3200, totalPen: 64000 }
    ]
  },
  {
    id: 'pur-2',
    supplierId: 'supp-2',
    supplierName: 'Fertilizantes del Perú S.A.',
    docNumber: 'F003-00891',
    purchaseDate: '2026-09-18',
    currency: 'USD',
    exchangeRate: 3.76,
    freightCostPen: 3000,
    totalUsd: 36000,
    totalPen: 135360,
    items: [
      { productId: 'p-20', lotNumber: 'LOT-2026-004', quantityTm: 20, bags: 400, pricePerTmUsd: 638.30, pricePerTmPen: 2400, totalPen: 48000 },
      { productId: 'p-21', lotNumber: 'LOT-2026-006', quantityTm: 15, bags: 300, pricePerTmUsd: 625.00, pricePerTmPen: 2350, totalPen: 35250 },
      { productId: 'p-9', lotNumber: 'LOT-2026-007', quantityTm: 10, bags: 200, pricePerTmUsd: 1010.64, pricePerTmPen: 3800, totalPen: 38000 }
    ]
  },
  {
    id: 'pur-3',
    supplierId: 'supp-3',
    supplierName: 'Molinos Agro S.A.',
    docNumber: 'F002-00512',
    purchaseDate: '2026-09-20',
    currency: 'PEN',
    exchangeRate: 3.75,
    freightCostPen: 1500,
    totalPen: 88500,
    items: [
      { productId: 'p-24', lotNumber: 'LOT-2026-008', quantityTm: 15, bags: 300, pricePerTmPen: 2900, totalPen: 43500 },
      { productId: 'p-27', lotNumber: 'LOT-2026-009', quantityTm: 20, bags: 400, pricePerTmPen: 2300, totalPen: 46000 }
    ]
  },
  {
    id: 'pur-4',
    supplierId: 'supp-4',
    supplierName: 'YARA Perú S.R.L.',
    docNumber: 'F005-00231',
    purchaseDate: '2026-09-22',
    currency: 'PEN',
    exchangeRate: 3.75,
    freightCostPen: 1200,
    totalPen: 64800,
    items: [
      { productId: 'p-11', quantityTm: 12, bags: 240, pricePerTmPen: 2700, totalPen: 32400 },
      { productId: 'p-12', lotNumber: 'LOT-2026-010', quantityTm: 12, bags: 240, pricePerTmPen: 2650, totalPen: 31800 }
    ]
  },
  {
    id: 'pur-5',
    supplierId: 'supp-5',
    supplierName: 'Equipak S.A.C.',
    docNumber: 'F001-00388',
    purchaseDate: '2026-09-25',
    currency: 'PEN',
    exchangeRate: 3.75,
    freightCostPen: 800,
    totalPen: 46000,
    items: [
      { productId: 'p-18', quantityTm: 10, bags: 200, pricePerTmPen: 2800, totalPen: 28000 },
      { productId: 'p-19', quantityTm: 15, bags: 300, pricePerTmPen: 1100, totalPen: 16500 }
    ]
  }
];

export const initialSales: Sale[] = [
  {
    id: 'sale-1',
    proformaNumber: 'P-1001',
    saleDate: '2026-09-21',
    customerId: 'cust-1',
    customerName: 'Fundo San José S.A.C.',
    status: 'CREDITO',
    totalAmount: 38400,
    paidAmount: 20000,
    notes: 'Abono parcial recibido al momento de la entrega en fundo.',
    items: [
      { productId: 'p-1', productName: 'UREA AGRICOLA', lotNumber: 'LOT-2026-001', quantity: 200, unitPrice: 112, total: 22400 },
      { productId: 'p-20', productName: 'CLORURO DE POTASIO', lotNumber: 'LOT-2026-004', quantity: 160, unitPrice: 135, total: 21600 }
    ]
  },
  {
    id: 'sale-2',
    proformaNumber: 'P-1002',
    saleDate: '2026-09-22',
    customerId: 'cust-2',
    customerName: 'Cooperativa Agraria Valle de Ica',
    status: 'PAGADO',
    totalAmount: 52800,
    paidAmount: 52800,
    notes: 'Pago total por transferencia bancaria BCP.',
    items: [
      { productId: 'p-9', productName: 'YARAMILA COMPLEX', lotNumber: 'LOT-2026-007', quantity: 160, unitPrice: 220, total: 35200 },
      { productId: 'p-21', productName: 'SULPOMAG PREMIUM', lotNumber: 'LOT-2026-006', quantity: 140, unitPrice: 132.50, total: 18550 }
    ]
  },
  {
    id: 'sale-3',
    proformaNumber: 'P-1003',
    saleDate: '2026-09-24',
    customerId: 'cust-3',
    customerName: 'Agrícola Huancayo E.I.R.L.',
    status: 'CREDITO',
    totalAmount: 29400,
    paidAmount: 19600,
    notes: 'Venta para campaña de papa en Concepción.',
    items: [
      { productId: 'p-24', productName: 'MOLIMAX PAPA SIERRA', lotNumber: 'LOT-2026-008', quantity: 120, unitPrice: 165, total: 19800 },
      { productId: 'p-25', productName: 'SUPER MIX PAPA SIERRA', quantity: 60, unitPrice: 160, total: 9600 }
    ]
  },
  {
    id: 'sale-4',
    proformaNumber: 'P-1004',
    saleDate: '2026-09-25',
    customerId: 'cust-4',
    customerName: 'Asociación de Agricultores del Santa',
    status: 'ENTREGADO',
    totalAmount: 41400,
    paidAmount: 41400,
    notes: 'Entregado en almacén de la asociación.',
    items: [
      { productId: 'p-4', productName: 'SULFATO DE AMONIO', lotNumber: 'LOT-2026-005', quantity: 300, unitPrice: 69, total: 20700 },
      { productId: 'p-1', productName: 'UREA AGRICOLA', lotNumber: 'LOT-2026-002', quantity: 180, unitPrice: 112, total: 20160 }
    ]
  },
  {
    id: 'sale-5',
    proformaNumber: 'P-1005',
    saleDate: '2026-09-26',
    customerId: 'cust-5',
    customerName: 'Don Jorge Alva Rivas',
    status: 'CREDITO',
    totalAmount: 14500,
    paidAmount: 10000,
    notes: 'Pendiente saldo de S/ 4,500 a cancelar a fin de mes.',
    items: [
      { productId: 'p-12', productName: 'NITRO S AGROPERU', lotNumber: 'LOT-2026-010', quantity: 80, unitPrice: 150, total: 12000 },
      { productId: 'p-27', productName: 'TRIPLE NACIONAL', lotNumber: 'LOT-2026-009', quantity: 20, unitPrice: 132.50, total: 2650 }
    ]
  },
  {
    id: 'sale-6',
    proformaNumber: 'P-1006',
    saleDate: '2026-09-27',
    customerId: 'cust-6',
    customerName: 'Fundo El Naranjal E.I.R.L.',
    status: 'PAGADO',
    totalAmount: 26400,
    paidAmount: 26400,
    notes: 'Abonado directo en caja.',
    items: [
      { productId: 'p-9', productName: 'YARAMILA COMPLEX', quantity: 120, unitPrice: 220, total: 26400 }
    ]
  },
  {
    id: 'sale-7',
    proformaNumber: 'P-1007',
    saleDate: '2026-09-28',
    customerId: 'cust-7',
    customerName: 'Empresa Agrícola Arequipa S.A.',
    status: 'CREDITO',
    totalAmount: 44000,
    paidAmount: 22000,
    notes: 'Crédito a 30 días para campaña de cebolla.',
    items: [
      { productId: 'p-16', productName: 'FOSFATO DIAMONICO', lotNumber: 'LOT-2026-003', quantity: 200, unitPrice: 180, total: 36000 },
      { productId: 'p-20', productName: 'CLORURO DE POTASIO', lotNumber: 'LOT-2026-004', quantity: 100, unitPrice: 135, total: 13500 }
    ]
  },
  {
    id: 'sale-8',
    proformaNumber: 'P-1008',
    saleDate: '2026-09-29',
    customerId: 'cust-8',
    customerName: 'Don Víctor Mendoza Chuy',
    status: 'PENDIENTE',
    totalAmount: 18200,
    paidAmount: 0,
    notes: 'Proforma reservada a ser recogida el día de mañana.',
    items: [
      { productId: 'p-2', productName: 'UREA GRANULAR', quantity: 100, unitPrice: 115, total: 11500 },
      { productId: 'p-6', productName: 'SULFATO GR BLANCO', quantity: 80, unitPrice: 74, total: 5920 }
    ]
  }
];

export const initialKardex: InventoryMovement[] = [
  {
    id: 'kard-1',
    productId: 'p-1',
    productName: 'UREA AGRICOLA',
    lotNumber: 'LOT-2026-001',
    type: 'INITIAL_STOCK',
    quantityTm: 10.0,
    quantityBags: 200,
    unitCostPen: 2120,
    salePricePen: 2240,
    balanceStockTm: 10.0,
    balanceBags: 200,
    referenceType: 'INITIAL',
    referenceId: 'INVENTARIO-INICIAL',
    date: '2026-09-01',
    notes: 'Stock Inicial de Almacén Central'
  },
  {
    id: 'kard-2',
    productId: 'p-1',
    productName: 'UREA AGRICOLA',
    lotNumber: 'LOT-2026-001',
    type: 'PURCHASE',
    quantityTm: 20.0,
    quantityBags: 400,
    unitCostPen: 2120,
    salePricePen: 2240,
    balanceStockTm: 30.0,
    balanceBags: 600,
    referenceType: 'PURCHASE',
    referenceId: 'F001-00142',
    date: '2026-09-15',
    notes: '[Lote: LOT-2026-001] Compra a INTI Agroquímicos S.A.C.'
  },
  {
    id: 'kard-3',
    productId: 'p-16',
    productName: 'FOSFATO DIAMONICO',
    lotNumber: 'LOT-2026-003',
    type: 'PURCHASE',
    quantityTm: 20.0,
    quantityBags: 400,
    unitCostPen: 3200,
    salePricePen: 3600,
    balanceStockTm: 38.0,
    balanceBags: 760,
    referenceType: 'PURCHASE',
    referenceId: 'F001-00142',
    date: '2026-09-15',
    notes: '[Lote: LOT-2026-003] Compra a INTI Agroquímicos S.A.C.'
  },
  {
    id: 'kard-4',
    productId: 'p-20',
    productName: 'CLORURO DE POTASIO',
    lotNumber: 'LOT-2026-004',
    type: 'PURCHASE',
    quantityTm: 20.0,
    quantityBags: 400,
    unitCostPen: 2400,
    salePricePen: 2700,
    balanceStockTm: 35.0,
    balanceBags: 700,
    referenceType: 'PURCHASE',
    referenceId: 'F003-00891',
    date: '2026-09-18',
    notes: '[Lote: LOT-2026-004] Compra en USD @ TC 3.76 a Fertilizantes del Perú S.A.'
  },
  {
    id: 'kard-5',
    productId: 'p-1',
    productName: 'UREA AGRICOLA',
    lotNumber: 'LOT-2026-001',
    type: 'SALE',
    quantityTm: 10.0,
    quantityBags: 200,
    unitCostPen: 2120,
    salePricePen: 2240,
    balanceStockTm: 20.0,
    balanceBags: 400,
    referenceType: 'SALE',
    referenceId: 'P-1001',
    date: '2026-09-21',
    notes: '[Lote: LOT-2026-001] Venta Proforma N.º P-1001 a Fundo San José S.A.C.'
  },
  {
    id: 'kard-6',
    productId: 'p-27',
    productName: 'TRIPLE NACIONAL',
    lotNumber: 'LOT-2026-009',
    type: 'MIX_CONSUMPTION',
    quantityTm: 7.0,
    quantityBags: 140,
    unitCostPen: 2300,
    salePricePen: 2650,
    balanceStockTm: 18.0,
    balanceBags: 360,
    referenceType: 'MIX_EXECUTION',
    referenceId: 'Formulación Mezcla NPK Intermedia',
    date: '2026-09-23',
    notes: 'PREPARADO SALIDA para mezcla Formulación Mezcla NPK Intermedia'
  },
  {
    id: 'kard-7',
    productId: 'p-26',
    productName: 'MEZCLA NPK INTERMEDIA',
    lotNumber: 'MEZ-2026-01',
    type: 'MIX_PRODUCTION',
    quantityTm: 10.0,
    quantityBags: 200,
    unitCostPen: 2650,
    salePricePen: 3050,
    balanceStockTm: 10.0,
    balanceBags: 200,
    referenceType: 'MIX_EXECUTION',
    referenceId: 'Formulación Mezcla NPK Intermedia',
    date: '2026-09-23',
    notes: 'PREPARADO INGRESO de mezcla Formulación Mezcla NPK Intermedia'
  },
  {
    id: 'kard-8',
    productId: 'p-24',
    productName: 'MOLIMAX PAPA SIERRA',
    lotNumber: 'LOT-2026-008',
    type: 'SALE',
    quantityTm: 6.0,
    quantityBags: 120,
    unitCostPen: 2900,
    salePricePen: 3300,
    balanceStockTm: 15.0,
    balanceBags: 300,
    referenceType: 'SALE',
    referenceId: 'P-1003',
    date: '2026-09-24',
    notes: '[Lote: LOT-2026-008] Venta Proforma N.º P-1003 a Agrícola Huancayo E.I.R.L.'
  },
  {
    id: 'kard-9',
    productId: 'p-9',
    productName: 'YARAMILA COMPLEX',
    lotNumber: 'LOT-2026-007',
    type: 'SALE',
    quantityTm: 6.0,
    quantityBags: 120,
    unitCostPen: 3800,
    salePricePen: 4400,
    balanceStockTm: 8.5,
    balanceBags: 170,
    referenceType: 'SALE',
    referenceId: 'P-1006',
    date: '2026-09-27',
    notes: '[Lote: LOT-2026-007] Venta Proforma N.º P-1006 a Fundo El Naranjal E.I.R.L.'
  },
  {
    id: 'kard-10',
    productId: 'p-16',
    productName: 'FOSFATO DIAMONICO',
    lotNumber: 'LOT-2026-003',
    type: 'SALE',
    quantityTm: 10.0,
    quantityBags: 200,
    unitCostPen: 3200,
    salePricePen: 3600,
    balanceStockTm: 28.0,
    balanceBags: 560,
    referenceType: 'SALE',
    referenceId: 'P-1007',
    date: '2026-09-28',
    notes: '[Lote: LOT-2026-003] Venta Proforma N.º P-1007 a Empresa Agrícola Arequipa S.A.'
  }
];

export const initialRecipes: MixRecipe[] = [
  {
    id: 'recipe-1',
    name: 'Formulación Mezcla NPK Intermedia',
    targetProductId: 'p-26',
    targetProductName: 'MEZCLA NPK INTERMEDIA',
    batchSizeTm: 10,
    description: 'Mezcla equilibrada para siembra de hortalizas y maíz',
    ingredients: [
      { productId: 'p-27', productName: 'TRIPLE NACIONAL', quantityTm: 7.0 },
      { productId: 'p-6', productName: 'SULFATO GR BLANCO', quantityTm: 1.5 },
      { productId: 'p-20', productName: 'CLORURO DE POTASIO', quantityTm: 1.5 }
    ]
  },
  {
    id: 'recipe-2',
    name: 'Formulación Papa Sierra Especial',
    targetProductId: 'p-24',
    targetProductName: 'MOLIMAX PAPA SIERRA',
    batchSizeTm: 10,
    description: 'Formulación de alta asimilación para papa y tubérculos andinos',
    ingredients: [
      { productId: 'p-16', productName: 'FOSFATO DIAMONICO', quantityTm: 4.0 },
      { productId: 'p-1', productName: 'UREA AGRICOLA', quantityTm: 3.0 },
      { productId: 'p-20', productName: 'CLORURO DE POTASIO', quantityTm: 3.0 }
    ]
  },
  {
    id: 'recipe-3',
    name: 'Supermix 20-20-20 Soluble',
    targetProductId: 'p-23',
    targetProductName: 'MOLIMAX NPK 20-20-20',
    batchSizeTm: 10,
    description: 'Mezcla balanceada 1:1:1 para fertirriego y mantenimiento de frutales',
    ingredients: [
      { productId: 'p-1', productName: 'UREA AGRICOLA', quantityTm: 3.5 },
      { productId: 'p-18', productName: 'SUPER FOSFATO TRIPLE', quantityTm: 3.5 },
      { productId: 'p-22', productName: 'SULFATO DE POTASIO GR', quantityTm: 3.0 }
    ]
  }
];

export const initialExecutions: MixExecution[] = [
  {
    id: 'exec-1',
    mixRecipeId: 'recipe-1',
    recipeName: 'Formulación Mezcla NPK Intermedia',
    producedQtyTm: 10,
    producedBags: 200,
    executionDate: '2026-09-23',
    proformaNumber: 'P-1003',
    consumedItems: [
      { productId: 'p-27', productName: 'TRIPLE NACIONAL', consumedQtyTm: 7.0, consumedBags: 140 },
      { productId: 'p-6', productName: 'SULFATO GR BLANCO', consumedQtyTm: 1.5, consumedBags: 30 },
      { productId: 'p-20', productName: 'CLORURO DE POTASIO', consumedQtyTm: 1.5, consumedBags: 30 }
    ]
  },
  {
    id: 'exec-2',
    mixRecipeId: 'recipe-2',
    recipeName: 'Formulación Papa Sierra Especial',
    producedQtyTm: 15,
    producedBags: 300,
    executionDate: '2026-09-26',
    proformaNumber: 'P-1005',
    consumedItems: [
      { productId: 'p-16', productName: 'FOSFATO DIAMONICO', consumedQtyTm: 6.0, consumedBags: 120 },
      { productId: 'p-1', productName: 'UREA AGRICOLA', consumedQtyTm: 4.5, consumedBags: 90 },
      { productId: 'p-20', productName: 'CLORURO DE POTASIO', consumedQtyTm: 4.5, consumedBags: 90 }
    ]
  }
];

export const initialBags: EmptyBagStock[] = [
  { id: 'b-1', bagName: 'BLS SULPOMAG', ventas: 140, preparadoSalida: 0, ingresoCompra: 500, saldoFinal: 360, minStock: 50 },
  { id: 'b-2', bagName: 'BLS CERES FERTINITROS', ventas: 60, preparadoSalida: 0, ingresoCompra: 300, saldoFinal: 240, minStock: 20 },
  { id: 'b-3', bagName: 'BLS SUPERMIX PAPA', ventas: 180, preparadoSalida: 300, ingresoCompra: 800, saldoFinal: 320, minStock: 40 },
  { id: 'b-4', bagName: 'BLS SUPERMIX 20-20-20', ventas: 0, preparadoSalida: 200, ingresoCompra: 500, saldoFinal: 300, minStock: 40 },
  { id: 'b-5', bagName: 'BLS YARAMILA COMPLEX', ventas: 280, preparadoSalida: 0, ingresoCompra: 600, saldoFinal: 320, minStock: 30 },
  { id: 'b-6', bagName: 'BLS UREA GR', ventas: 100, preparadoSalida: 0, ingresoCompra: 500, saldoFinal: 400, minStock: 50 },
  { id: 'b-7', bagName: 'BLS UREA AGRICOLA', ventas: 380, preparadoSalida: 180, ingresoCompra: 1000, saldoFinal: 440, minStock: 30 }
];

export const initialFinancials: FinancialMovement[] = [
  { id: 'fin-1', date: '2026-09-15', type: 'EGRESOS', category: 'COMPRA', description: 'Compra de Insumos - INTI Agroquímicos S.A.C. (F001-00142)', amountPen: 108100, cashRegister: 'CAJA_1' },
  { id: 'fin-2', date: '2026-09-15', type: 'EGRESOS', category: 'TRANSPORTE', description: 'Flete de camión Callao - Almacén AgroPerú', amountPen: 2100, cashRegister: 'CAJA_1' },
  { id: 'fin-3', date: '2026-09-18', type: 'EGRESOS', category: 'COMPRA', description: 'Pago Fertilizantes del Perú S.A. ($36,000 @ 3.76)', amountPen: 135360, cashRegister: 'CAJA_2' },
  { id: 'fin-4', date: '2026-09-20', type: 'EGRESOS', category: 'ESTIBA', description: 'Servicio de descarga y estiba en almacén 70 TM', amountPen: 1400, cashRegister: 'CAJA_1' },
  { id: 'fin-5', date: '2026-09-21', type: 'INGRESOS', category: 'VENTA', description: 'Abono inicial Proforma P-1001 - Fundo San José S.A.C.', amountPen: 20000, cashRegister: 'CAJA_1' },
  { id: 'fin-6', date: '2026-09-22', type: 'INGRESOS', category: 'VENTA', description: 'Cobro Proforma N.º P-1002 - Cooperativa Agraria Valle de Ica', amountPen: 52800, cashRegister: 'CAJA_2' },
  { id: 'fin-7', date: '2026-09-24', type: 'INGRESOS', category: 'VENTA', description: 'Pago parcial Proforma P-1003 - Agrícola Huancayo', amountPen: 19600, cashRegister: 'CAJA_1' },
  { id: 'fin-8', date: '2026-09-25', type: 'INGRESOS', category: 'VENTA', description: 'Cobro contado Proforma P-1004 - Asoc. Agricultores del Santa', amountPen: 41400, cashRegister: 'CAJA_1' },
  { id: 'fin-9', date: '2026-09-26', type: 'INGRESOS', category: 'VENTA', description: 'Cobro inicial P-1005 - Don Jorge Alva Rivas', amountPen: 10000, cashRegister: 'CAJA_1' },
  { id: 'fin-10', date: '2026-09-27', type: 'INGRESOS', category: 'VENTA', description: 'Cobro Proforma P-1006 - Fundo El Naranjal E.I.R.L.', amountPen: 26400, cashRegister: 'CAJA_2' },
  { id: 'fin-11', date: '2026-09-28', type: 'INGRESOS', category: 'VENTA', description: 'Cobro 50% Proforma P-1007 - Empresa Agrícola Arequipa S.A.', amountPen: 22000, cashRegister: 'CAJA_1' },
  { id: 'fin-12', date: '2026-09-29', type: 'EGRESOS', category: 'LUZ', description: 'Pago luz trifásica de planta de mezclas y almacén', amountPen: 850, cashRegister: 'CAJA_1' }
];
