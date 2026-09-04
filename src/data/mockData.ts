import {
  StoreAccount,
  Employee,
  OpticalProduct,
  FasetLabOrder,
  SaleOrder,
  AttendanceRecord,
  AdSpendRecord,
  ReturnRecord,
  CashflowRecord
} from '../types';

export const INITIAL_STORE: StoreAccount = {
  id: 'store-eyehub-01',
  name: 'eye hub Eyewear & Optics Studio',
  tagline: 'Kacamata Modern, Lensa Presisi & Solusi Mata Sehat',
  address: 'Ruko Grand Galaxy City Blok RGB No. 12, Bekasi Selatan',
  phone: '0812-8899-7721',
  marketplaceAdminFeePercent: 8.5,
  serviceFeePerOrder: 1000,
  monthlyTargetOmzet: 75000000,
  cashOnHand: 18500000,
  escrowBalance: 32450000,
};

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-01',
    storeId: 'store-eyehub-01',
    name: 'Budi Santoso',
    roles: ['owner'],
    phone: '0811-9988-112',
    active: true,
    salaryScheme: {
      baseType: 'daily',
      baseRate: 0,
      perFrameSold: 0,
      perPackageSold: 0,
      perLensFaset: 0,
      fixedNominal: 0,
      ownerProfitPercent: 100,
      tierRule: { enabled: false, thresholdUnits: 0, bonusRate: 0, mode: 'excess_only' },
      dualRoleBonus: { enabled: false, quotaUnits: 0, bonusPerUnit: 0 },
      monthlyOmzetBonus: { enabled: false, targetOmzet: 0, type: 'percent_omzet', value: 0 },
    },
    bankInfo: 'BCA 882019281 (Budi S.)'
  },
  {
    id: 'emp-02',
    storeId: 'store-eyehub-01',
    name: 'Citra Lestari',
    roles: ['host', 'admin'], // Dual Role!
    phone: '0857-1122-3344',
    active: true,
    salaryScheme: {
      baseType: 'hourly',
      baseRate: 20000, // Rp 20rb / jam
      perFrameSold: 5000, // Rp 5.000 / frame
      perPackageSold: 12000, // Rp 12.000 / paket bundling kacamata + lensa
      perLensFaset: 0,
      fixedNominal: 300000, // Tunjangan transport & komunikasi
      ownerProfitPercent: 0,
      tierRule: {
        enabled: true,
        thresholdUnits: 20, // jika > 20 paket terjual
        bonusRate: 5000, // tambahan Rp 5.000 per paket
        mode: 'excess_only',
      },
      dualRoleBonus: {
        enabled: true,
        quotaUnits: 25,
        bonusPerUnit: 3000, // Bonus rangkap Host + Admin
      },
      monthlyOmzetBonus: {
        enabled: true,
        targetOmzet: 50000000,
        type: 'percent_omzet',
        value: 1.0, // 1% omzet bulanan
      },
    },
    bankInfo: 'Mandiri 1330029102 (Citra L.)'
  },
  {
    id: 'emp-03',
    storeId: 'store-eyehub-01',
    name: 'Dimas Prakoso',
    roles: ['faset'], // Teknisi Faset Lab & Refraksionis Optisi
    phone: '0813-7766-5544',
    active: true,
    salaryScheme: {
      baseType: 'daily',
      baseRate: 140000, // Rp 140.000 / hari
      perFrameSold: 0,
      perPackageSold: 0,
      perLensFaset: 8000, // Rp 8.000 per pasang lensa difaset presisi
      fixedNominal: 250000,
      ownerProfitPercent: 0,
      tierRule: {
        enabled: true,
        thresholdUnits: 30, // jika > 30 pasang lensa
        bonusRate: 4000,
        mode: 'all_units',
      },
      dualRoleBonus: { enabled: false, quotaUnits: 0, bonusPerUnit: 0 },
      monthlyOmzetBonus: {
        enabled: true,
        targetOmzet: 60000000,
        type: 'fixed_nominal',
        value: 500000,
      },
    },
    bankInfo: 'BCA 7730192801 (Dimas P.)'
  },
  {
    id: 'emp-04',
    storeId: 'store-eyehub-01',
    name: 'Anisa Rahma',
    roles: ['host'],
    phone: '0878-9922-1100',
    active: true,
    salaryScheme: {
      baseType: 'hourly',
      baseRate: 22000,
      perFrameSold: 4000,
      perPackageSold: 10000,
      perLensFaset: 0,
      fixedNominal: 200000,
      ownerProfitPercent: 0,
      tierRule: {
        enabled: true,
        thresholdUnits: 15,
        bonusRate: 4000,
        mode: 'excess_only',
      },
      dualRoleBonus: { enabled: false, quotaUnits: 0, bonusPerUnit: 0 },
      monthlyOmzetBonus: { enabled: false, targetOmzet: 0, type: 'percent_omzet', value: 0 },
    },
    bankInfo: 'BRI 0210091823 (Anisa R.)'
  },
  {
    id: 'emp-05',
    storeId: 'store-eyehub-01',
    name: 'Kevin Wijaya',
    roles: ['admin', 'faset'], // Rangkap Admin + Asisten Faset
    phone: '0812-4455-6677',
    active: true,
    salaryScheme: {
      baseType: 'daily',
      baseRate: 120000,
      perFrameSold: 2000,
      perPackageSold: 5000,
      perLensFaset: 5000,
      fixedNominal: 200000,
      ownerProfitPercent: 0,
      tierRule: { enabled: false, thresholdUnits: 0, bonusRate: 0, mode: 'excess_only' },
      dualRoleBonus: { enabled: true, quotaUnits: 20, bonusPerUnit: 2500 },
      monthlyOmzetBonus: { enabled: false, targetOmzet: 0, type: 'percent_omzet', value: 0 },
    },
    bankInfo: 'BCA 521098271 (Kevin W.)'
  },
];

export const INITIAL_PRODUCTS: OpticalProduct[] = [
  {
    id: 'prod-01',
    storeId: 'store-eyehub-01',
    sku: 'FRM-TITAN-01',
    name: 'Frame Titanium Ultralight Korea Style',
    category: 'Frame Kacamata',
    subcategory: 'Titanium',
    unit: 'Pcs',
    stockQty: 48,
    minStockAlert: 10,
    basePurchasePrice: 85000,
    edgingCostPerUnit: 0,
    realHpp: 85000,
    sellingPrice: 199000,
    description: 'Frame titanium anti-patah, bobot hanya 8 gram, nosepad silikon empuk.'
  },
  {
    id: 'prod-02',
    storeId: 'store-eyehub-01',
    sku: 'FRM-ACET-02',
    name: 'Frame Acetate Bold Vintage Black Gold',
    category: 'Frame Kacamata',
    subcategory: 'Acetate',
    unit: 'Pcs',
    stockQty: 32,
    minStockAlert: 8,
    basePurchasePrice: 95000,
    edgingCostPerUnit: 0,
    realHpp: 95000,
    sellingPrice: 225000,
    description: 'Bahan asetat tebal kokoh, engsel 5-barrel hinge premium.'
  },
  {
    id: 'prod-03',
    storeId: 'store-eyehub-01',
    sku: 'FRM-TR90-03',
    name: 'Frame TR90 Sport Flex Anti Radiasi',
    category: 'Frame Kacamata',
    subcategory: 'TR90',
    unit: 'Pcs',
    stockQty: 65,
    minStockAlert: 15,
    basePurchasePrice: 45000,
    edgingCostPerUnit: 0,
    realHpp: 45000,
    sellingPrice: 135000,
    description: 'Lentur bisa ditekuk 180 derajat, sangat ramah anak & aktivitas outdoor.'
  },
  {
    id: 'prod-04',
    storeId: 'store-eyehub-01',
    sku: 'LNS-BLUERAY-01',
    name: 'Lensa Anti Radiasi Blue Ray UV420 Index 1.56',
    category: 'Lensa Kacamata',
    subcategory: 'Anti-Radiasi',
    unit: 'Pasang (Pair)',
    stockQty: 80,
    minStockAlert: 20,
    basePurchasePrice: 35000,
    edgingCostPerUnit: 10000,
    realHpp: 45000,
    sellingPrice: 110000,
    description: 'Menangkal 95% radiasi sinar biru gadget dan monitor komputer.'
  },
  {
    id: 'prod-05',
    storeId: 'store-eyehub-01',
    sku: 'LNS-BLUECHROM-02',
    name: 'Lensa Bluechromic (Photocromic + Blue Ray) Index 1.56',
    category: 'Lensa Kacamata',
    subcategory: 'Bluechromic',
    unit: 'Pasang (Pair)',
    stockQty: 55,
    minStockAlert: 15,
    basePurchasePrice: 65000,
    edgingCostPerUnit: 12000,
    realHpp: 77000,
    sellingPrice: 195000,
    description: 'Gelap otomatis saat terkena sinar matahari terik dan filter blue light di dalam ruangan.'
  },
  {
    id: 'prod-06',
    storeId: 'store-eyehub-01',
    sku: 'LNS-HI-INDEX-03',
    name: 'Lensa Hi-Index 1.67 Ultra Thin Anti Pantul',
    category: 'Lensa Kacamata',
    subcategory: 'Hi-Index 1.67',
    unit: 'Pasang (Pair)',
    stockQty: 24,
    minStockAlert: 5,
    basePurchasePrice: 140000,
    edgingCostPerUnit: 15000,
    realHpp: 155000,
    sellingPrice: 380000,
    description: 'Lensa 40% lebih tipis dan ringan untuk minus -4.00 ke atas.'
  },
  {
    id: 'prod-07',
    storeId: 'store-eyehub-01',
    sku: 'SFT-NATURAL-01',
    name: 'Softlens Natural Look Monthly (Brown/Grey)',
    category: 'Softlens',
    subcategory: 'Softlens Warna',
    unit: 'Box',
    stockQty: 42,
    minStockAlert: 10,
    basePurchasePrice: 42000,
    edgingCostPerUnit: 0,
    realHpp: 42000,
    sellingPrice: 85000,
    description: 'Kadar air 45%, nyaman dipakai seharian tanpa rasa mengganjal.'
  },
  {
    id: 'prod-08',
    storeId: 'store-eyehub-01',
    sku: 'AKS-CLEANER-01',
    name: 'Pembersih Lensa Spray Anti-Fog 60ml + Lap Microfiber',
    category: 'Aksesoris Optik',
    subcategory: 'Cleaner & Case',
    unit: 'Pcs',
    stockQty: 110,
    minStockAlert: 25,
    basePurchasePrice: 8000,
    edgingCostPerUnit: 0,
    realHpp: 8000,
    sellingPrice: 25000,
    description: 'Mencegah lensa berembun saat memakai masker dan membersihkan minyak/debu.'
  },
];

export const INITIAL_FASET_ORDERS: FasetLabOrder[] = [
  {
    id: 'fst-001',
    orderNumber: 'FST-2026-001',
    date: '2026-09-02',
    storeId: 'store-eyehub-01',
    customerName: 'Rian Hidayat',
    phone: '0812-9900-1122',
    frameName: 'Frame Titanium Ultralight Korea Style',
    lensType: 'Lensa Bluechromic (Photocromic + Blue Ray) Index 1.56',
    prescription: {
      rightEye: { sph: '-2.25', cyl: '-0.50', axis: '180' },
      leftEye: { sph: '-2.75', cyl: '0.00', axis: '0' },
      pd: '63',
      lensTypeRequested: 'Bluechromic Photocromic'
    },
    technicianId: 'emp-03',
    status: 'Selesai & Siap',
    technicianIncentive: 8000,
    completedAt: '2026-09-02 15:30',
    notes: 'Fitting pas, axis 180 akurat, sudah di-UV tester'
  },
  {
    id: 'fst-002',
    orderNumber: 'FST-2026-002',
    date: '2026-09-03',
    storeId: 'store-eyehub-01',
    customerName: 'Siti Nurhaliza',
    phone: '0858-3344-5566',
    frameName: 'Frame Acetate Bold Vintage Black Gold',
    lensType: 'Lensa Hi-Index 1.67 Ultra Thin Anti Pantul',
    prescription: {
      rightEye: { sph: '-5.00', cyl: '-1.00', axis: '175' },
      leftEye: { sph: '-5.50', cyl: '-0.75', axis: '10' },
      pd: '61',
      lensTypeRequested: 'Hi-Index 1.67 Aspheris'
    },
    technicianId: 'emp-03',
    status: 'QC Akurasi',
    technicianIncentive: 8000,
    notes: 'Lensa minus tebal dipoles bevel rata supaya tidak nongol dari frame'
  },
  {
    id: 'fst-003',
    orderNumber: 'FST-2026-003',
    date: '2026-09-03',
    storeId: 'store-eyehub-01',
    customerName: 'Agus Pratama',
    phone: '0819-2233-4455',
    frameName: 'Frame TR90 Sport Flex Anti Radiasi',
    lensType: 'Lensa Anti Radiasi Blue Ray UV420 Index 1.56',
    prescription: {
      rightEye: { sph: '-1.50', cyl: '0.00', axis: '0' },
      leftEye: { sph: '-1.25', cyl: '0.00', axis: '0' },
      pd: '64',
      lensTypeRequested: 'Blue Ray Anti Radiasi'
    },
    technicianId: 'emp-05',
    status: 'Proses Faset',
    technicianIncentive: 5000,
    notes: 'Sedang proses cutting edger auto machine'
  },
  {
    id: 'fst-004',
    orderNumber: 'FST-2026-004',
    date: '2026-09-03',
    storeId: 'store-eyehub-01',
    customerName: 'Dewi Lestari',
    phone: '0877-1100-2299',
    frameName: 'Frame Titanium Ultralight Korea Style',
    lensType: 'Lensa Bluechromic (Photocromic + Blue Ray) Index 1.56',
    prescription: {
      rightEye: { sph: '-3.25', cyl: '-1.25', axis: '90' },
      leftEye: { sph: '-3.50', cyl: '-1.00', axis: '85' },
      pd: '62',
      lensTypeRequested: 'Bluechromic Silinder'
    },
    technicianId: 'emp-03',
    status: 'Antrean Lab',
    technicianIncentive: 8000,
    notes: 'Resep silinder axis 90/85, tunggu konfirmasi resep dokter'
  }
];

export const INITIAL_SALES_ORDERS: SaleOrder[] = [
  {
    id: 'ord-101',
    invoiceNo: 'INV/EYE/20260902/001',
    date: '2026-09-02',
    storeId: 'store-eyehub-01',
    channel: 'TikTok Live',
    orderFormat: 'Bundling Resep',
    customerName: 'Rian Hidayat',
    items: [
      { productId: 'prod-01', productName: 'Frame Titanium Ultralight Korea Style', qty: 1, price: 199000, hpp: 85000, isBundle: true },
      { productId: 'prod-05', productName: 'Lensa Bluechromic Index 1.56', qty: 1, price: 170000, hpp: 77000, isBundle: true },
    ],
    fasetLabOrderId: 'fst-001',
    grossAmount: 369000,
    marketplaceAdminFee: 31365, // 8.5%
    serviceFee: 1000,
    netRevenue: 336635,
    totalHpp: 162000,
    hostEmployeeId: 'emp-02', // Citra
    adminEmployeeId: 'emp-02', // Citra
    fasetTechnicianId: 'emp-03', // Dimas
    notes: 'Live flash sale sore TikTok'
  },
  {
    id: 'ord-102',
    invoiceNo: 'INV/EYE/20260902/002',
    date: '2026-09-02',
    storeId: 'store-eyehub-01',
    channel: 'Shopee Live',
    orderFormat: 'Bundling Resep',
    customerName: 'Nadya Putri',
    items: [
      { productId: 'prod-03', productName: 'Frame TR90 Sport Flex Anti Radiasi', qty: 1, price: 135000, hpp: 45000, isBundle: true },
      { productId: 'prod-04', productName: 'Lensa Blue Ray UV420', qty: 1, price: 95000, hpp: 45000, isBundle: true },
      { productId: 'prod-08', productName: 'Pembersih Lensa Spray Anti-Fog', qty: 1, price: 20000, hpp: 8000 }
    ],
    grossAmount: 250000,
    marketplaceAdminFee: 21250,
    serviceFee: 1000,
    netRevenue: 227750,
    totalHpp: 98000,
    hostEmployeeId: 'emp-04', // Anisa
    adminEmployeeId: 'emp-05', // Kevin
    notes: 'Shopee Live sesi malam'
  },
  {
    id: 'ord-103',
    invoiceNo: 'INV/EYE/20260903/003',
    date: '2026-09-03',
    storeId: 'store-eyehub-01',
    channel: 'Offline Optik Store',
    orderFormat: 'Bundling Resep',
    customerName: 'Siti Nurhaliza',
    items: [
      { productId: 'prod-02', productName: 'Frame Acetate Bold Vintage Black Gold', qty: 1, price: 225000, hpp: 95000, isBundle: true },
      { productId: 'prod-06', productName: 'Lensa Hi-Index 1.67 Ultra Thin', qty: 1, price: 380000, hpp: 155000, isBundle: true }
    ],
    fasetLabOrderId: 'fst-002',
    grossAmount: 605000,
    marketplaceAdminFee: 0, // Offline no admin fee!
    serviceFee: 0,
    netRevenue: 605000,
    totalHpp: 250000,
    hostEmployeeId: undefined,
    adminEmployeeId: 'emp-02', // Citra
    fasetTechnicianId: 'emp-03',
    notes: 'Walk-in optik, periksa refraksi mata langsung di toko'
  },
  {
    id: 'ord-104',
    invoiceNo: 'INV/EYE/20260903/004',
    date: '2026-09-03',
    storeId: 'store-eyehub-01',
    channel: 'TikTok Live',
    orderFormat: 'Satuan',
    customerName: 'Ferry Sanjaya',
    items: [
      { productId: 'prod-01', productName: 'Frame Titanium Ultralight Korea Style', qty: 1, price: 199000, hpp: 85000 },
      { productId: 'prod-07', productName: 'Softlens Natural Look Monthly', qty: 2, price: 170000, hpp: 84000 }
    ],
    grossAmount: 369000,
    marketplaceAdminFee: 31365,
    serviceFee: 1000,
    netRevenue: 336635,
    totalHpp: 169000,
    hostEmployeeId: 'emp-02',
    adminEmployeeId: 'emp-05',
    notes: 'Beli frame kosong + softlens promo live'
  },
  {
    id: 'ord-105',
    invoiceNo: 'INV/EYE/20260903/005',
    date: '2026-09-03',
    storeId: 'store-eyehub-01',
    channel: 'WA Order Resep',
    orderFormat: 'Bundling Resep',
    customerName: 'Agus Pratama',
    items: [
      { productId: 'prod-03', productName: 'Frame TR90 Sport Flex Anti Radiasi', qty: 1, price: 135000, hpp: 45000, isBundle: true },
      { productId: 'prod-04', productName: 'Lensa Blue Ray UV420', qty: 1, price: 110000, hpp: 45000, isBundle: true }
    ],
    fasetLabOrderId: 'fst-003',
    grossAmount: 245000,
    marketplaceAdminFee: 0,
    serviceFee: 0,
    netRevenue: 245000,
    totalHpp: 90000,
    adminEmployeeId: 'emp-05',
    fasetTechnicianId: 'emp-05',
    notes: 'Repeat order via WhatsApp kirim foto resep'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-01',
    employeeId: 'emp-02', // Citra
    storeId: 'store-eyehub-01',
    date: '2026-09-02',
    clockIn: '09:00',
    clockOut: '17:30',
    totalHours: 8.5,
    status: 'Hadir',
    lateMinutes: 0,
    notes: 'Shift Live Pagi & Admin Toko'
  },
  {
    id: 'att-02',
    employeeId: 'emp-03', // Dimas (Teknisi Faset)
    storeId: 'store-eyehub-01',
    date: '2026-09-02',
    clockIn: '09:15',
    clockOut: '18:00',
    totalHours: 8.75,
    status: 'Hadir',
    lateMinutes: 15,
    notes: 'Faset 8 pasang lensa pesanan online'
  },
  {
    id: 'att-03',
    employeeId: 'emp-04', // Anisa
    storeId: 'store-eyehub-01',
    date: '2026-09-02',
    clockIn: '18:30',
    clockOut: '22:30',
    totalHours: 4.0,
    status: 'Hadir',
    lateMinutes: 0,
    notes: 'Live Streaming Shopee Night'
  },
  {
    id: 'att-04',
    employeeId: 'emp-05', // Kevin
    storeId: 'store-eyehub-01',
    date: '2026-09-02',
    clockIn: '09:00',
    clockOut: '17:00',
    totalHours: 8.0,
    status: 'Hadir',
    lateMinutes: 0,
    notes: 'Admin marketplace packing & kirim kurir'
  },
  {
    id: 'att-05',
    employeeId: 'emp-02', // Citra
    storeId: 'store-eyehub-01',
    date: '2026-09-03',
    clockIn: '08:55',
    clockOut: '17:00',
    totalHours: 8.0,
    status: 'Hadir',
    lateMinutes: 0
  },
  {
    id: 'att-06',
    employeeId: 'emp-03', // Dimas
    storeId: 'store-eyehub-01',
    date: '2026-09-03',
    clockIn: '09:00',
    clockOut: '17:30',
    totalHours: 8.5,
    status: 'Hadir',
    lateMinutes: 0
  }
];

export const INITIAL_AD_SPEND: AdSpendRecord[] = [
  {
    id: 'ad-01',
    storeId: 'store-eyehub-01',
    date: '2026-09-02',
    platform: 'TikTok Ads',
    adBudget: 150000,
    liveCoinSaweran: 50000, // Koin tap-tap layar TikTok
    salesAttributed: 1250000,
    roas: 6.25,
    notes: 'Promosi Live Frame Titanium Viral Korea'
  },
  {
    id: 'ad-02',
    storeId: 'store-eyehub-01',
    date: '2026-09-02',
    platform: 'Shopee Ads',
    adBudget: 100000,
    liveCoinSaweran: 35000,
    salesAttributed: 680000,
    roas: 5.03,
    notes: 'Iklan pencarian kata kunci kacamata minus bluechromic'
  },
  {
    id: 'ad-03',
    storeId: 'store-eyehub-01',
    date: '2026-09-03',
    platform: 'TikTok Ads',
    adBudget: 180000,
    liveCoinSaweran: 60000,
    salesAttributed: 1490000,
    roas: 6.20,
    notes: 'Voucher bagi-bagi saat live stream demo ketahanan frame'
  }
];

export const INITIAL_RETURNS: ReturnRecord[] = [
  {
    id: 'ret-01',
    storeId: 'store-eyehub-01',
    date: '2026-09-01',
    invoiceNo: 'INV/EYE/20260830/089',
    customerName: 'Hendro Gunawan',
    channel: 'Shopee Reguler',
    returnReason: 'Salah Ukuran Resep',
    itemCondition: 'Reject / Rusak Total (HPP Hangus)', // Lensa minus custom tidak bisa dipakai orang lain
    refundAmount: 295000,
    hppLoss: 122000,
    resiNumber: 'SPXID0291823901',
    status: 'Selesai'
  },
  {
    id: 'ret-02',
    storeId: 'store-eyehub-01',
    date: '2026-09-03',
    invoiceNo: 'INV/EYE/20260901/014',
    customerName: 'Lina Marlina',
    channel: 'TikTok Shop Reguler',
    returnReason: 'Batal COD',
    itemCondition: 'Bisa Dijual Lagi', // Frame polos belum dipasang resep
    refundAmount: 199000,
    hppLoss: 0,
    resiNumber: 'JNT7729102912',
    status: 'Diproses'
  }
];

export const INITIAL_CASHFLOW: CashflowRecord[] = [
  {
    id: 'cf-01',
    storeId: 'store-eyehub-01',
    date: '2026-09-01',
    type: 'in',
    category: 'Pencairan Saldo Escrow MP',
    amount: 8500000,
    source: 'Saldo Escrow Marketplace',
    description: 'Pencairan saldo TikTok Shop periode 26-29 Agustus'
  },
  {
    id: 'cf-02',
    storeId: 'store-eyehub-01',
    date: '2026-09-01',
    type: 'out',
    category: 'Kulakan Frame & Lensa',
    amount: 4200000,
    source: 'Rekening Bank',
    description: 'Restock Frame Titanium & Blank Lensa Bluechromic dari Distributor Optik'
  },
  {
    id: 'cf-03',
    storeId: 'store-eyehub-01',
    date: '2026-09-02',
    type: 'in',
    category: 'Penjualan Kacamata',
    amount: 605000,
    source: 'Kas Tunai Toko',
    description: 'Pembayaran cash pelanggan walk-in optik toko'
  },
  {
    id: 'cf-04',
    storeId: 'store-eyehub-01',
    date: '2026-09-02',
    type: 'out',
    category: 'Iklan & Koin Live',
    amount: 335000,
    source: 'Rekening Bank',
    description: 'Topup saldo TikTok Ads & Koin Live Saweran'
  },
  {
    id: 'cf-05',
    storeId: 'store-eyehub-01',
    date: '2026-09-03',
    type: 'out',
    category: 'Operasional Lab Faset',
    amount: 150000,
    source: 'Kas Tunai Toko',
    description: 'Beli mata pisau potong diamond wheel & air pendingin mesin faset'
  }
];
