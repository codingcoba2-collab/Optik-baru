import {
  StoreAccount,
  Employee,
  OpticalProduct,
  FasetLabOrder,
  SaleOrder,
  AttendanceRecord,
  AdSpendRecord,
  ReturnRecord,
  CashflowRecord,
  AdCampaign,
  DiscountCoupon,
  MarketplaceOrder,
  UserAccount
} from '../types';

// Default empty state - ready for fresh user inputs
export const INITIAL_STORE: StoreAccount = {
  id: 'store-optik-01',
  name: 'Optik Jaya Sentosa',
  tagline: 'Lensa Presisi & Kacamata Terbaik',
  address: 'Jl. Pemuda No. 88, Jakarta Pusat',
  phone: '0895621670403',
  marketplaceAdminFeePercent: 8.5,
  serviceFeePerOrder: 1000,
  monthlyTargetOmzet: 50000000,
  cashOnHand: 2500000,
  escrowBalance: 0,
  hasInternalTechnician: true,
  defaultExternalFasetCost: 20000,
  bankName: 'BCA',
  bankAccountNumber: '8820192831',
  bankAccountHolder: 'Danial Ramdhan - Optik Jaya Sentosa',
  localDeliveryFee: 10000,
};

export const INITIAL_EMPLOYEES: Employee[] = [];

export const INITIAL_PRODUCTS: OpticalProduct[] = [
  {
    id: 'prod-opt-01',
    storeId: 'store-optik-01',
    storeName: 'Optik Jaya Sentosa',
    sku: 'FRM-TITAN-01',
    name: 'Frame Kacamata Titanium Ultra-Lightweight Round',
    category: 'Frame Kacamata',
    subcategory: 'Titanium Premium',
    unit: 'Pcs',
    stockQty: 25,
    minStockAlert: 5,
    basePurchasePrice: 135000,
    edgingCostPerUnit: 0,
    realHpp: 135000,
    sellingPrice: 320000,
    description: 'Frame titanium super ringan anti karat, fleksibel dan sangat nyaman untuk penggunaan harian berjam-jam.',
    lensCategories: ['Single vision', 'Blueray'],
    sph: 'Plano s/d -6.00',
    cyl: '0.00 s/d -2.00',
    coating: 'Anti gores',
    diameter: '50-19-145',
    imageUrl: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80',
    isMarketplaceListed: true,
    soldCount: 38,
    rating: 4.9,
    cpcBid: 500,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-opt-02',
    storeId: 'store-optik-01',
    storeName: 'Optik Jaya Sentosa',
    sku: 'LNS-BLUERAY-02',
    name: 'Lensa Single Vision Blueray 1.56 Anti Radiasi Digital',
    category: 'Lensa Kacamata',
    subcategory: 'Super Hydrophobic',
    unit: 'Pasang (Pair)',
    stockQty: 30,
    minStockAlert: 5,
    basePurchasePrice: 65000,
    edgingCostPerUnit: 20000,
    realHpp: 85000,
    sellingPrice: 195000,
    description: 'Lensa filter sinar biru 420nm melindungi mata dari layar gadget, laptop & smartphone. Dilengkapi lapisan anti pantul dan licin tahan air.',
    lensCategories: ['Single vision', 'Blueray'],
    sph: '-0.25 s/d -6.00',
    cyl: '0.00 s/d -2.00',
    coating: 'Super Hydrophobic Blue Cut AR',
    diameter: '70mm',
    imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
    isMarketplaceListed: true,
    soldCount: 64,
    rating: 5.0,
    cpcBid: 500,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-opt-03',
    storeId: 'store-optik-01',
    storeName: 'Optik Jaya Sentosa',
    sku: 'LNS-PHOTO-03',
    name: 'Lensa Photochromic Grey Transisi Cepat UV400',
    category: 'Lensa Kacamata',
    subcategory: 'Fast Shift Transitions',
    unit: 'Pasang (Pair)',
    stockQty: 18,
    minStockAlert: 4,
    basePurchasePrice: 95000,
    edgingCostPerUnit: 20000,
    realHpp: 115000,
    sellingPrice: 285000,
    description: 'Lensa bening di dalam ruangan dan berubah gelap abu-abu pekat di luar ruangan saat terkena sinar matahari terik.',
    lensCategories: ['Single vision', 'Photochromic'],
    sph: 'Plano s/d -5.00',
    cyl: '0.00 s/d -2.00',
    coating: 'Multi-Coated UV400 Dark Shift',
    diameter: '70mm',
    imageUrl: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=600&q=80',
    isMarketplaceListed: true,
    soldCount: 42,
    rating: 4.8,
    cpcBid: 500,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-opt-04',
    storeId: 'store-optik-01',
    storeName: 'Optik Jaya Sentosa',
    sku: 'FRM-VINTAGE-04',
    name: 'Frame Acetate Classic Square Black Glossy',
    category: 'Frame Kacamata',
    subcategory: 'Acetate Premium',
    unit: 'Pcs',
    stockQty: 15,
    minStockAlert: 3,
    basePurchasePrice: 110000,
    edgingCostPerUnit: 0,
    realHpp: 110000,
    sellingPrice: 275000,
    description: 'Model klasik kokoh dengan material asetat Italia, engsel pegas tahan lama cocok untuk wajah oval dan bulat.',
    lensCategories: ['Single vision', 'Plano'],
    sph: 'Plano',
    coating: 'Glossy Finish',
    diameter: '52-18-140',
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
    isMarketplaceListed: true,
    soldCount: 29,
    rating: 4.9,
    cpcBid: 500,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_FASET_ORDERS: FasetLabOrder[] = [];

export const INITIAL_SALES: SaleOrder[] = [];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_AD_SPEND: AdSpendRecord[] = [];

export const INITIAL_RETURNS: ReturnRecord[] = [];

export const INITIAL_CASHFLOW: CashflowRecord[] = [];

export const INITIAL_ADS_CAMPAIGNS: AdCampaign[] = [];

export const INITIAL_DISCOUNT_COUPONS: DiscountCoupon[] = [];

export const INITIAL_MARKETPLACE_ORDERS: MarketplaceOrder[] = [];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-danial-01',
    username: 'danialramdhan',
    fullName: 'Danial Ramdhan',
    name: 'Danial Ramdhan',
    phone: '0895621670403',
    email: 'danialramdhan@gmail.com',
    userType: 'seller',
    storeId: 'store-optik-01',
    storeName: 'Optik Jaya Sentosa',
    role: 'owner',
    roles: ['owner'],
    createdAt: new Date().toISOString()
  }
];

