export type Role = 
  | 'owner' 
  | 'assisten' 
  | 'optisi' 
  | 'pelayan' 
  | 'teknisi' 
  | 'host' 
  | 'admin' 
  | 'faset'
  | 'consumer';

export type UserType = 'seller' | 'consumer';

export interface UserAccount {
  id: string;
  uid?: string;
  username: string;
  password?: string;
  fullName: string;
  name?: string;
  userType: UserType;
  phone: string;
  email?: string;
  storeId?: string;
  storeName?: string;
  role?: Role;
  roles?: Role[];
  address?: string;
  createdAt: string;
}

export type BaseSalaryType = 'hourly' | 'daily' | 'monthly';

export interface DailyTargetRule {
  enabled: boolean;
  thresholdUnits: number; // e.g. diatas 20 terjual
  regularRate: number; // insentif s/d 20 unit
  excessBonusRate: number; // insentif tambahan untuk unit ke-21 dst
}

export interface MonthlyTargetRule {
  enabled: boolean;
  targetOmzet: number; // target omzet bulanan (Rp)
  netProfitPercent: number; // persentase dari laba bersih setelah semua pengeluaran (e.g. 3%)
}

export interface TierRule {
  enabled: boolean;
  thresholdUnits: number;
  bonusRate: number;
  mode: 'excess_only' | 'all_units';
}

export interface DualRoleBonus {
  enabled: boolean;
  quotaUnits: number;
  bonusPerUnit: number;
}

export interface MonthlyOmzetBonus {
  enabled: boolean;
  targetOmzet: number;
  type: 'percent_omzet' | 'percent_net_profit' | 'fixed_nominal';
  value: number;
}

export interface SalaryScheme {
  baseType: BaseSalaryType;
  baseRate: number;
  perFrameSold: number;
  perPackageSold: number;
  perLensFaset: number;
  fixedNominal: number;
  ownerProfitPercent: number;
  tierRule: TierRule;
  dualRoleBonus: DualRoleBonus;
  monthlyOmzetBonus: MonthlyOmzetBonus;
}

export interface Employee {
  id: string;
  storeId: string;
  name: string;
  username: string;
  password?: string;
  roles: Role[]; // bisa rangkap: owner, assisten, optisi, pelayan, teknisi
  role?: Role;
  phone: string;
  active: boolean;

  // Skema Gaji
  salaryPeriod: 'hourly' | 'daily' | 'monthly';
  salaryRate: number;
  salaryCalculationType: 'flat' | 'per_pcs' | 'per_package';

  // Skema Insentif
  incentivePeriod: 'daily' | 'weekly' | 'monthly';
  incentiveRate: number;
  incentiveCalculationType: 'per_pcs' | 'per_package';

  // Target Tambahan
  dailyTarget: DailyTargetRule;
  monthlyTarget: MonthlyTargetRule;

  salaryScheme: SalaryScheme;
  bankInfo?: string;
  bankAccount?: string;
  createdAt?: string;
}

export type OpticalCategory = 
  | 'Frame Kacamata' 
  | 'Lensa Kacamata' 
  | 'Softlens' 
  | 'Sunglasses' 
  | 'Aksesoris Optik';

export type LensCategoryType = 
  | 'Single vision' 
  | 'Bifocal' 
  | 'Progressive' 
  | 'Blueray' 
  | 'Photochromic' 
  | 'Sunglasses' 
  | 'Plano';

export type UnitType = 'Pcs' | 'Pasang (Pair)' | 'Box' | 'Lusin' | 'Gross';

export interface OpticalProduct {
  id: string;
  storeId: string;
  storeName?: string;
  sku: string;
  name: string;
  category: OpticalCategory;
  subcategory: string;
  unit: UnitType;
  stockQty: number;
  minStockAlert: number;
  basePurchasePrice: number; // Modal beli
  edgingCostPerUnit: number; // Biaya faset
  realHpp: number; // Modal + Faset
  sellingPrice: number;
  description?: string;

  // Kategori Lensa Kombinasi (Bisa pilih beberapa)
  lensCategories: LensCategoryType[];

  // Atribut Lensa
  sph?: string; // e.g. -2.00 s/d +4.00 atau Plano
  cyl?: string; // e.g. -0.50
  axis?: string; // e.g. 180
  add?: string; // e.g. +1.50
  coating?: string; // e.g. "Anti-Reflective", "Super Hydrophobic", "Blue Ray Protection"
  diameter?: string; // e.g. "70mm"

  // Marketplace & Iklan
  isMarketplaceListed?: boolean;
  soldCount?: number;
  rating?: number;
  cpcBid?: number; // Biaya per klik iklan
  isAdActive?: boolean;
  createdAt?: string;
}

export type CashflowEntry = CashflowRecord;
export type AdSpendEntry = AdSpendRecord;

export type CourierType = 'J&T' | 'JNE' | 'SiCepat' | 'GoSend' | 'GrabExpress';
export type PaymentMethodType = 'COD' | 'Transfer' | 'QRIS';
export type ShippingRateType = 'auto' | 'manual';

export interface EyePrescription {
  sph?: string;
  cyl?: string;
  axis?: string;
  add?: string;
}

export interface PrescriptionData {
  rightEye: EyePrescription;
  leftEye: EyePrescription;
  pd: string;
  lensTypeRequested: string;
}

export type FasetStatus = 
  | 'Antrean Lab' 
  | 'Proses Faset' 
  | 'Fitting Frame' 
  | 'QC Akurasi' 
  | 'Selesai & Siap' 
  | 'Reject Lab'
  | 'Selesai'
  | 'Terkirim'
  | 'Gagal/Reject';

export interface FasetLabOrder {
  id: string;
  orderNumber: string;
  date: string;
  storeId: string;
  customerName: string;
  phone?: string;
  frameName: string;
  lensType: string;
  prescription: PrescriptionData;
  technicianId?: string; // jika ada teknisi internal
  hasTechnician: boolean; // false jika tidak ada teknisi internal
  externalFasetCost: number; // biaya faset jika tidak ada teknisi
  status: FasetStatus;
  rejectReason?: string;
  technicianIncentive: number;
  notes?: string;
  completedAt?: string;
}

export interface AdCampaign {
  id: string;
  storeId: string;
  productId: string;
  productName: string;
  keywords: string[];
  cpcBid: number; // Biaya per klik (e.g. Rp 500)
  dailyBudget: number; // Budget harian (e.g. Rp 50.000)
  status: 'active' | 'paused';
  clicks: number;
  spent: number;
  salesCount: number;
  revenue: number;
  createdAt: string;
}

export interface DiscountCoupon {
  id: string;
  storeId: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed'; // persentase (%) atau nilai pasti (Rp)
  value: number; // e.g. 10 (untuk 10%) atau 25000 (untuk Rp 25.000)
  minPurchase: number; // minimal pembelian (Rp)
  maxDiscount?: number;
  validUntil: string;
  usageCount: number;
  maxQuota: number;
  active: boolean;
}

export interface MarketplaceOrderItem {
  productId: string;
  productName: string;
  qty: number;
  quantity?: number;
  price: number;
  selectedCategories?: LensCategoryType[];
  prescription?: {
    od: EyePrescription;
    os: EyePrescription;
    pd: string;
  };
}

export interface MarketplaceOrder {
  id: string;
  orderNo: string;
  orderNumber?: string;
  storeId: string;
  storeName: string;
  customerId: string;
  customerName: string;
  buyerName?: string;
  customerPhone: string;
  shippingAddress: string;
  courier?: CourierType | string;
  shippingRateType?: ShippingRateType | string;
  items: MarketplaceOrderItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'bank_transfer' | 'qris' | string;
  selectedBank?: 'BCA' | 'Mandiri' | 'BRI' | 'BNI' | 'Permata' | 'CIMB Niaga' | 'BSI';
  vaNumber?: string;
  paymentStatus: 'menunggu_pembayaran' | 'terverifikasi' | 'paid' | string;
  orderStatus: 'menunggu_pembayaran' | 'diproses' | 'faset' | 'dikirim' | 'selesai' | 'dibatalkan' | 'waiting_confirmation' | 'in_lab' | 'shipped' | string;
  createdAt: string;
  paidAt?: string;
  transferProofUrl?: string;
}

export type SalesChannel = 
  | 'Marketplace App'
  | 'TikTok Live' 
  | 'Shopee Live' 
  | 'Tokopedia Live' 
  | 'IG Live' 
  | 'Shopee Reguler' 
  | 'TikTok Shop Reguler' 
  | 'Offline Optik Store' 
  | 'WA Order Resep';

export type SalesFormat = 'Satuan' | 'Bundling Resep' | 'Campuran';

export interface SaleItem {
  productId: string;
  productName: string;
  qty: number;
  quantity?: number;
  price: number;
  hpp: number;
  isBundle?: boolean;
}

export interface SaleOrder {
  id: string;
  invoiceNo: string;
  date: string;
  storeId: string;
  channel: SalesChannel;
  orderFormat: SalesFormat;
  customerName: string;
  items: SaleItem[];
  fasetLabOrderId?: string;
  grossAmount: number;
  marketplaceAdminFee: number;
  serviceFee: number;
  netRevenue: number;
  totalHpp: number;
  hostEmployeeId?: string;
  hostId?: string;
  adminEmployeeId?: string;
  fasetTechnicianId?: string;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  storeId: string;
  date: string;
  clockIn: string;
  clockOut: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalHours: number;
  status: 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpa';
  lateMinutes: number;
  shift?: ShiftType;
  notes?: string;
}

export interface AdSpendRecord {
  id: string;
  storeId: string;
  date: string;
  platform: 'TikTok Ads' | 'Shopee Ads' | 'Tokopedia Ads' | 'IG Meta Ads' | 'Meta Ads' | 'Google Ads';
  adBudget: number;
  liveCoinSaweran: number;
  salesAttributed?: number;
  revenueGenerated?: number;
  roas: number;
  notes?: string;
}

export interface ReturnRecord {
  id: string;
  storeId: string;
  date: string;
  invoiceNo: string;
  customerName: string;
  channel: SalesChannel;
  returnReason: 'Salah Ukuran Resep' | 'Cacat Pengiriman' | 'Batal COD' | 'Frame Tidak Pas / Rusak';
  itemCondition: 'Bisa Dijual Lagi' | 'Reject / Rusak Total (HPP Hangus)';
  refundAmount: number;
  hppLoss: number;
  resiNumber: string;
  status: 'Diproses' | 'Selesai';
}

export interface CashflowRecord {
  id: string;
  storeId: string;
  date: string;
  type: 'in' | 'out';
  category: ExpenseCategory;
  amount: number;
  source?: 'Kas Tunai Toko' | 'Saldo Escrow Marketplace' | 'Rekening Bank';
  description: string;
  recipient?: string;
}

export interface StoreAccount {
  id: string;
  name: string;
  ownerId?: string;
  tagline: string;
  address: string;
  phone: string;
  marketplaceAdminFeePercent: number;
  serviceFeePerOrder: number;
  monthlyTargetOmzet: number;
  cashOnHand: number;
  escrowBalance: number;
  hasInternalTechnician: boolean; // apakah ada teknisi faset internal
  defaultExternalFasetCost: number; // biaya faset maklon/luar jika tidak ada teknisi internal
}

export type ShiftType = 
  | 'Shift Pagi (09:00 - 15:00)' 
  | 'Shift Sore (15:00 - 21:00)' 
  | 'Shift Live Streaming (Malam)' 
  | 'Full Day';

export type ExpenseCategory = 
  | 'Biaya Lab Faset & Konsumabel' 
  | 'Sewa Ruko / Booth Optik' 
  | 'Ads TikTok & Shopee' 
  | 'Coin Saweran / Voucher Live' 
  | 'Gaji & Komisi Karyawan' 
  | 'Packaging & Pengiriman' 
  | 'Pembelian Grosir Frame/Lensa' 
  | 'Operasional & Listrik Toko'
  | 'Penjualan Kacamata'
  | 'Pencairan Saldo Escrow MP'
  | 'Kulakan Frame & Lensa'
  | 'Payroll Gaji & Insentif'
  | 'Iklan & Koin Live'
  | 'Sewa & Listrik Optik'
  | 'Operasional Lab Faset'
  | 'Lain-lain';

export type ThemePalette = 
  | 'Electric Ocean' 
  | 'Neon Cyber' 
  | 'Emerald Mint' 
  | 'Royal Violet' 
  | 'Sunset Coral' 
  | 'Minimalist Studio';

export interface AiEvaluationResult {
  overallScore?: number;
  score?: number;
  headline?: string;
  overallSummary?: string;
  narrativeSummary?: string;
  strengths?: string[];
  keyStrengths?: string[];
  improvements?: string[];
  areasForImprovement?: string[];
  recommendations?: string[];
  actionRecommendations?: string[];
  performanceGrade?: 'S' | 'A' | 'B' | 'C' | 'D';
  efficiencyRatings?: {
    productivity?: number;
    salesContribution?: number;
    discipline?: number;
    opticalQc?: number;
    fasetEfficiency?: number;
    salesConversion?: number;
    adRoi?: number;
  };
}
