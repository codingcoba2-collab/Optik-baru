export type Role = 'owner' | 'host' | 'admin' | 'faset';

export type BaseSalaryType = 'hourly' | 'daily';

export interface TierRule {
  enabled: boolean;
  thresholdUnits: number; // e.g. 15 paket
  bonusRate: number; // rate bonus per paket
  mode: 'excess_only' | 'all_units'; // kelebihan saja atau seluruh unit
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
  value: number; // e.g. 1.5 for 1.5% or 500000 for Rp 500rb
}

export interface SalaryScheme {
  baseType: BaseSalaryType;
  baseRate: number; // e.g. 15,000 / jam atau 120,000 / hari
  perFrameSold: number; // Insentif per frame kacamata
  perPackageSold: number; // Insentif per paket kacamata + lensa (bundling resep)
  perLensFaset: number; // Insentif per pasang lensa difaset (Teknisi Lab Faset)
  fixedNominal: number; // Tunjangan tetap
  ownerProfitPercent: number; // % Laba bersih owner
  tierRule: TierRule;
  dualRoleBonus: DualRoleBonus;
  monthlyOmzetBonus: MonthlyOmzetBonus;
}

export interface Employee {
  id: string;
  storeId: string;
  name: string;
  roles: Role[];
  phone: string;
  active: boolean;
  salaryScheme: SalaryScheme;
  baseSalary?: number;
  incentiveScheme?: IncentiveScheme;
  bankInfo?: string;
  bankAccount?: string;
}

export type OpticalCategory = 
  | 'Frame Kacamata' 
  | 'Lensa Kacamata' 
  | 'Softlens' 
  | 'Sunglasses' 
  | 'Aksesoris Optik';

export type UnitType = 'Pcs' | 'Pasang (Pair)' | 'Box' | 'Lusin' | 'Gross';

export interface OpticalProduct {
  id: string;
  storeId: string;
  sku: string;
  name: string;
  category: OpticalCategory;
  subcategory: string; // e.g. 'Titanium', 'Acetate', 'TR90', 'Bluechromic', 'Progressive', 'Anti-Radiasi'
  unit: UnitType;
  stockQty: number;
  minStockAlert: number;
  basePurchasePrice: number; // Modal beli awal frame / lensa kosongan
  edgingCostPerUnit: number; // Biaya pengerjaan faset/lab per unit
  realHpp: number; // basePurchasePrice + edgingCostPerUnit
  sellingPrice: number;
  description?: string;
}

export interface EyePrescription {
  sph: string; // -2.00, +1.50, plano
  cyl: string; // -0.50, 0.00
  axis: string; // 180, 90
  add?: string; // +2.00 (bifokal/progresif)
}

export interface PrescriptionData {
  rightEye: EyePrescription;
  leftEye: EyePrescription;
  pd: string; // Pupil distance in mm, e.g. 64mm
  lensTypeRequested: string; // e.g. Bluechromic Index 1.56, Anti Radiasi UV420
}

export type FasetStatus = 
  | 'Antrean Lab' 
  | 'Proses Faset' 
  | 'Fitting Frame' 
  | 'QC Akurasi' 
  | 'Selesai & Siap' 
  | 'Reject Lab';

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
  technicianId: string; // Employee with 'faset' role
  status: FasetStatus;
  rejectReason?: string;
  technicianIncentive: number;
  notes?: string;
  completedAt?: string;
}

export type SalesChannel = 
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
  marketplaceAdminFee: number; // e.g. 8.5%
  serviceFee: number; // e.g. Rp 1.000
  netRevenue: number; // grossAmount - marketplaceAdminFee - serviceFee
  totalHpp: number;
  hostEmployeeId?: string;
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
  totalHours: number;
  status: 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpa';
  lateMinutes: number;
  shift?: ShiftType;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface AdSpendRecord {
  id: string;
  storeId: string;
  date: string;
  platform: 'TikTok Ads' | 'Shopee Ads' | 'Tokopedia Ads' | 'IG Meta Ads' | 'Meta Ads' | 'Google Ads';
  adBudget: number;
  liveCoinSaweran: number; // Koin tap-tap / voucher sawer live optik
  salesAttributed?: number;
  revenueGenerated?: number;
  roas: number; // salesAttributed / (adBudget + liveCoinSaweran)
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
  tagline: string;
  address: string;
  phone: string;
  marketplaceAdminFeePercent: number; // default 8.5%
  serviceFeePerOrder: number; // default 1000
  monthlyTargetOmzet: number; // default 50,000,000
  cashOnHand: number;
  escrowBalance: number;
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

export type ColorPalette = 
  | 'sky' 
  | 'indigo' 
  | 'emerald' 
  | 'rose' 
  | 'amber' 
  | 'violet';

export type ThemePalette = 
  | 'Electric Ocean' 
  | 'Neon Cyber' 
  | 'Emerald Mint' 
  | 'Royal Violet' 
  | 'Sunset Coral' 
  | 'Minimalist Studio';

export type StoreConfig = StoreAccount;
export type CashflowEntry = CashflowRecord;
export type AdSpendEntry = AdSpendRecord;
export type IncentiveScheme = SalaryScheme;

export interface AiEvaluationResult {
  overallScore?: number;
  score?: number;
  headline?: string;
  overallSummary?: string;
  strengths?: string[];
  improvements?: string[];
  recommendations?: string[];
  performanceGrade?: 'S' | 'A' | 'B' | 'C' | 'D';
  efficiencyRatings?: {
    productivity: number;
    salesContribution: number;
    discipline: number;
    opticalQc: number;
  };
  narrativeSummary?: string;
  keyStrengths?: string[];
  areasForImprovement?: string[];
  actionRecommendations?: string[];
}
