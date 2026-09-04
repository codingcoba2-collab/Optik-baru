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
  address: 'Jl. Pemuda No. 88, Jakarta',
  phone: '0895621670403',
  marketplaceAdminFeePercent: 8.5,
  serviceFeePerOrder: 1000,
  monthlyTargetOmzet: 50000000,
  cashOnHand: 0,
  escrowBalance: 0,
  hasInternalTechnician: true,
  defaultExternalFasetCost: 20000,
};

export const INITIAL_EMPLOYEES: Employee[] = [];

export const INITIAL_PRODUCTS: OpticalProduct[] = [];

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
    storeName: 'Optik Jaya Sentosa',
    role: 'owner',
    roles: ['owner'],
    createdAt: new Date().toISOString()
  }
];

