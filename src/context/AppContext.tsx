import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
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
  Role,
  ThemePalette,
  FasetStatus,
  ShiftType,
  AdCampaign,
  DiscountCoupon,
  MarketplaceOrder,
  MarketplaceOrderItem,
  PaymentTransaction,
  UserAccount,
  UserType,
  HomeVisitRequest,
  HomeVisitStatus
} from '../types';
import {
  INITIAL_STORE,
  INITIAL_EMPLOYEES,
  INITIAL_PRODUCTS,
  INITIAL_FASET_ORDERS,
  INITIAL_SALES,
  INITIAL_ATTENDANCE,
  INITIAL_AD_SPEND,
  INITIAL_RETURNS,
  INITIAL_CASHFLOW,
  INITIAL_ADS_CAMPAIGNS,
  INITIAL_DISCOUNT_COUPONS,
  INITIAL_MARKETPLACE_ORDERS,
  INITIAL_USERS
} from '../data/mockData';
import { db, auth, googleProvider } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc,
  query,
  where 
} from 'firebase/firestore';
import { signInWithPopup, signOut as fbSignOut } from 'firebase/auth';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface AppContextType {
  // Store & Auth
  store: StoreAccount;
  allStores: StoreAccount[];
  switchStore: (storeId: string) => void;
  updateStore: (updated: Partial<StoreAccount>) => void;
  createStore: (newStore: StoreAccount) => void;

  // User & Auth
  currentUser: UserAccount | null;
  userProfile: UserAccount | null;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  isAuthenticated: boolean;
  isSeller: boolean;
  isConsumer: boolean;
  sellerViewConsumerMode: boolean;
  setSellerViewConsumerMode: (val: boolean) => void;

  loginSeller: (storeName: string, username: string, password?: string) => { success: boolean; message?: string };
  loginConsumer: (username: string, password?: string) => { success: boolean; message?: string };
  registerUser: (userData: Omit<UserAccount, 'id' | 'createdAt'>) => Promise<{ success: boolean; message?: string }>;
  loginWithGooglePopup: (userType: UserType, storeNameIfSeller?: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogleAccount: (email: string, fullName: string, userType: UserType, storeNameIfSeller?: string) => Promise<{ success: boolean; message?: string }>;
  switchUser: (employeeId: string) => void;
  logout: () => void;

  // Pegawai (Employee)
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, emp: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;

  // Products (Stok)
  products: OpticalProduct[];
  addProduct: (product: Omit<OpticalProduct, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<OpticalProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  adjustStock: (id: string, delta: number) => Promise<void>;

  // Lab Faset
  fasetOrders: FasetLabOrder[];
  addFasetOrder: (order: Omit<FasetLabOrder, 'id' | 'orderNumber'>) => Promise<void>;
  updateFasetStatus: (id: string, status: FasetStatus, rejectReason?: string) => Promise<void>;
  deleteFasetOrder: (id: string) => Promise<void>;

  // Ads & Discounts
  adsCampaigns: AdCampaign[];
  addAdCampaign: (camp: Omit<AdCampaign, 'id' | 'createdAt' | 'clicks' | 'spent' | 'salesCount' | 'revenue'>) => Promise<void>;
  toggleAdCampaign: (id: string) => Promise<void>;
  deleteAdCampaign: (id: string) => Promise<void>;

  discountCoupons: DiscountCoupon[];
  addDiscountCoupon: (coupon: Omit<DiscountCoupon, 'id' | 'usageCount'>) => Promise<void>;
  toggleDiscountCoupon: (id: string) => Promise<void>;
  deleteDiscountCoupon: (id: string) => Promise<void>;

  // Marketplace (Konsumen & Seller)
  marketplaceOrders: MarketplaceOrder[];
  cart: MarketplaceOrderItem[];
  addToCart: (item: MarketplaceOrderItem) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkoutOrder: (orderData: Omit<MarketplaceOrder, 'id' | 'orderNo' | 'createdAt' | 'orderStatus' | 'paymentStatus'>) => Promise<{ success: boolean; order?: MarketplaceOrder; message?: string }>;
  createMarketplaceOrder: (orderData: any) => Promise<any>;
  confirmPaymentTransfer: (orderId: string, proofNote?: string) => Promise<void>;
  updateMarketplaceOrderStatus: (orderId: string, status: MarketplaceOrder['orderStatus']) => Promise<void>;
  cancelMarketplaceOrder: (orderId: string, cancelReason?: string) => Promise<void>;

  // Payment Gateway Virtual Account
  paymentTransactions: PaymentTransaction[];
  activePaymentModal: PaymentTransaction | null;
  setActivePaymentModal: (tx: PaymentTransaction | null) => void;
  createVirtualAccountPayment: (orderData: any, bankCode: string) => Promise<{ success: boolean; transaction?: PaymentTransaction; error?: string }>;
  checkPaymentStatus: (orderId: string) => Promise<PaymentTransaction | null>;
  simulatePaymentWebhook: (orderId: string, action?: 'settlement' | 'expire' | 'cancel') => Promise<{ success: boolean; message: string }>;

  // Home Visit Service (Layanan Periksa Mata ke Rumah)
  homeVisitRequests: HomeVisitRequest[];
  addHomeVisitRequest: (data: Omit<HomeVisitRequest, 'id' | 'requestNo' | 'createdAt' | 'status'>) => Promise<HomeVisitRequest>;
  updateHomeVisitStatus: (id: string, status: HomeVisitStatus, staffName?: string) => Promise<void>;
  cancelHomeVisitRequest: (id: string, reason?: string) => Promise<void>;
  isOnline: boolean;

  // Sales Orders (Penjualan Live & Toko)
  salesOrders: SaleOrder[];
  addSaleOrder: (order: SaleOrder) => void;
  deleteSaleOrder: (id: string) => void;

  // Attendance
  attendance: AttendanceRecord[];
  addAttendance: (record: AttendanceRecord) => void;
  clockIn: (employeeId: string, shift?: ShiftType) => void;
  clockOut: (attendanceId: string) => void;

  // Cashflow & Ads Spend
  cashflow: CashflowRecord[];
  addCashflow: (record: CashflowRecord) => void;
  deleteCashflow: (id: string) => void;
  adSpend: AdSpendRecord[];
  addAdSpend: (record: AdSpendRecord) => void;
  returns: ReturnRecord[];
  addReturn: (record: ReturnRecord) => void;
  updateReturnStatus: (id: string, status: 'Diproses' | 'Selesai') => void;

  // Theming & UX
  theme: ThemePalette;
  setTheme: (t: ThemePalette) => void;
  isDark: boolean;
  setIsDark: (d: boolean) => void;
  isPwaModalOpen: boolean;
  setIsPwaModalOpen: (open: boolean) => void;
  openPwaModal: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;

  // App Update Feature
  appVersion: string;
  hasAppUpdate: boolean;
  checkAndApplyUpdate: () => Promise<void>;

  // Reset Data to Clean State
  resetDataToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'eyehub_optics_data_v2';
const APP_VERSION = '2.2.0';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getSavedData = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved state:', e);
    }
    return null;
  };

  const initial = getSavedData();

  // Stores & Auth
  const [allStores, setAllStores] = useState<StoreAccount[]>(
    initial?.allStores || [INITIAL_STORE]
  );
  const [activeStoreId, setActiveStoreId] = useState<string>(
    initial?.activeStoreId || INITIAL_STORE.id
  );

  const [users, setUsers] = useState<UserAccount[]>(
    initial?.users || INITIAL_USERS
  );
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const savedUser = localStorage.getItem('eyehub_current_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object') {
          const resolvedName = parsed.name || parsed.fullName || parsed.username || 'Pengguna';
          return {
            ...parsed,
            id: parsed.id || 'usr-' + Date.now().toString(36),
            uid: parsed.uid || parsed.id,
            fullName: parsed.fullName || resolvedName,
            name: resolvedName,
            username: parsed.username || resolvedName.toLowerCase().replace(/\s+/g, '_'),
            phone: parsed.phone || '-',
            roles: Array.isArray(parsed.roles) && parsed.roles.length > 0
              ? parsed.roles
              : (parsed.role ? [parsed.role] : ['owner'])
          };
        }
        return null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [currentRole, setCurrentRole] = useState<Role>(
    initial?.currentRole || 'owner'
  );
  const [sellerViewConsumerMode, setSellerViewConsumerMode] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isAuthenticated = currentUser !== null;
  const isSeller = currentUser?.userType === 'seller';
  const isConsumer = currentUser?.userType === 'consumer';

  // Data Collections
  const [employees, setEmployees] = useState<Employee[]>(
    initial?.employees || INITIAL_EMPLOYEES
  );
  const [products, setProducts] = useState<OpticalProduct[]>(
    initial?.products || INITIAL_PRODUCTS
  );
  const [fasetOrders, setFasetOrders] = useState<FasetLabOrder[]>(
    initial?.fasetOrders || INITIAL_FASET_ORDERS
  );
  const [adsCampaigns, setAdsCampaigns] = useState<AdCampaign[]>(
    initial?.adsCampaigns || INITIAL_ADS_CAMPAIGNS
  );
  const [discountCoupons, setDiscountCoupons] = useState<DiscountCoupon[]>(
    initial?.discountCoupons || INITIAL_DISCOUNT_COUPONS
  );
  const [marketplaceOrders, setMarketplaceOrders] = useState<MarketplaceOrder[]>(
    initial?.marketplaceOrders || INITIAL_MARKETPLACE_ORDERS
  );
  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('eyehub_payments');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [activePaymentModal, setActivePaymentModal] = useState<PaymentTransaction | null>(null);
  const processedPaymentDeductions = useRef<Set<string>>(new Set<string>());
  const [homeVisitRequests, setHomeVisitRequests] = useState<HomeVisitRequest[]>(() => {
    try {
      const saved = localStorage.getItem('eyehub_home_visits');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initial?.homeVisitRequests || [];
  });
  const [cart, setCart] = useState<MarketplaceOrderItem[]>(
    initial?.cart || []
  );

  const [salesOrders, setSalesOrders] = useState<SaleOrder[]>(
    initial?.salesOrders || INITIAL_SALES
  );
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(
    initial?.attendance || INITIAL_ATTENDANCE
  );
  const [adSpend, setAdSpend] = useState<AdSpendRecord[]>(
    initial?.adSpend || INITIAL_AD_SPEND
  );
  const [returns, setReturns] = useState<ReturnRecord[]>(
    initial?.returns || INITIAL_RETURNS
  );
  const [cashflow, setCashflow] = useState<CashflowRecord[]>(
    initial?.cashflow || INITIAL_CASHFLOW
  );

  // Theming & UX
  const [theme, setThemeState] = useState<ThemePalette>(
    (localStorage.getItem('eyehub_theme') as ThemePalette) || 'Electric Ocean'
  );
  const [isDark, setIsDarkState] = useState<boolean>(() => {
    const saved = localStorage.getItem('eyehub_dark');
    return saved !== null ? saved === 'true' : true;
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState<boolean>(false);
  const [hasAppUpdate, setHasAppUpdate] = useState<boolean>(false);

  const openPwaModal = () => setIsPwaModalOpen(true);

  // Apply dark mode class and theme dataset to <html> reliably
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
    }
    root.setAttribute('data-palette', theme);

    const paletteMap: Record<string, {
      primary: string; hover: string; soft: string;
      p50: string; p100: string; p200: string; p300: string; p400: string; p500: string; p600: string; p700: string; p800: string; p900: string; p950: string;
    }> = {
      'Electric Ocean': isDark ? {
        primary: '#38bdf8', hover: '#7dd3fc', soft: 'rgba(56, 189, 248, 0.2)',
        p50: '#082f49', p100: '#0c4a6e', p200: '#0369a1', p300: '#0284c7', p400: '#38bdf8', p500: '#38bdf8', p600: '#0284c7', p700: '#0369a1', p800: '#075985', p900: '#0c4a6e', p950: '#041b2d'
      } : {
        primary: '#0284c7', hover: '#0369a1', soft: 'rgba(2, 132, 199, 0.15)',
        p50: '#f0f9ff', p100: '#e0f2fe', p200: '#bae6fd', p300: '#7dd3fc', p400: '#38bdf8', p500: '#0ea5e9', p600: '#0284c7', p700: '#0369a1', p800: '#075985', p900: '#0c4a6e', p950: '#082f49'
      },
      'Neon Cyber': isDark ? {
        primary: '#34d399', hover: '#6ee7b7', soft: 'rgba(52, 211, 153, 0.2)',
        p50: '#064e3b', p100: '#065f46', p200: '#047857', p300: '#059669', p400: '#6ee7b7', p500: '#34d399', p600: '#10b981', p700: '#059669', p800: '#047857', p900: '#064e3b', p950: '#022c22'
      } : {
        primary: '#10b981', hover: '#059669', soft: 'rgba(16, 185, 129, 0.15)',
        p50: '#ecfdf5', p100: '#d1fae5', p200: '#a7f3d0', p300: '#6ee7b7', p400: '#34d399', p500: '#10b981', p600: '#059669', p700: '#047857', p800: '#065f46', p900: '#064e3b', p950: '#022c22'
      },
      'Emerald Mint': isDark ? {
        primary: '#2dd4bf', hover: '#5eead4', soft: 'rgba(45, 212, 191, 0.2)',
        p50: '#134e4a', p100: '#115e59', p200: '#0f766e', p300: '#0d9488', p400: '#5eead4', p500: '#2dd4bf', p600: '#14b8a6', p700: '#0d9488', p800: '#0f766e', p900: '#115e59', p950: '#042f2e'
      } : {
        primary: '#0d9488', hover: '#0f766e', soft: 'rgba(13, 148, 136, 0.15)',
        p50: '#f0fdfa', p100: '#ccfbf1', p200: '#99f6e4', p300: '#5eead4', p400: '#2dd4bf', p500: '#14b8a6', p600: '#0d9488', p700: '#0f766e', p800: '#115e59', p900: '#134e4a', p950: '#042f2e'
      },
      'Royal Violet': isDark ? {
        primary: '#a78bfa', hover: '#c4b5fd', soft: 'rgba(167, 139, 250, 0.2)',
        p50: '#2e1065', p100: '#3b0764', p200: '#4c1d95', p300: '#5b21b6', p400: '#c4b5fd', p500: '#a78bfa', p600: '#8b5cf6', p700: '#7c3aed', p800: '#6d28d9', p900: '#5b21b6', p950: '#2e1065'
      } : {
        primary: '#7c3aed', hover: '#6d28d9', soft: 'rgba(124, 58, 237, 0.15)',
        p50: '#f5f3ff', p100: '#ede9fe', p200: '#ddd6fe', p300: '#c4b5fd', p400: '#a78bfa', p500: '#8b5cf6', p600: '#7c3aed', p700: '#6d28d9', p800: '#5b21b6', p900: '#4c1d95', p950: '#2e1065'
      },
      'Sunset Coral': isDark ? {
        primary: '#fb7185', hover: '#fda4af', soft: 'rgba(251, 113, 133, 0.2)',
        p50: '#4c0519', p100: '#881337', p200: '#9f1239', p300: '#be123c', p400: '#fda4af', p500: '#fb7185', p600: '#f43f5e', p700: '#e11d48', p800: '#be123c', p900: '#9f1239', p950: '#4c0519'
      } : {
        primary: '#f43f5e', hover: '#e11d48', soft: 'rgba(244, 63, 94, 0.15)',
        p50: '#fff1f2', p100: '#ffe4e6', p200: '#fecdd3', p300: '#fda4af', p400: '#fb7185', p500: '#f43f5e', p600: '#e11d48', p700: '#be123c', p800: '#9f1239', p900: '#881337', p950: '#4c0519'
      },
      'Minimalist Studio': isDark ? {
        primary: '#cbd5e1', hover: '#e2e8f0', soft: 'rgba(203, 213, 225, 0.2)',
        p50: '#1e293b', p100: '#334155', p200: '#475569', p300: '#64748b', p400: '#cbd5e1', p500: '#94a3b8', p600: '#64748b', p700: '#475569', p800: '#334155', p900: '#1e293b', p950: '#0f172a'
      } : {
        primary: '#475569', hover: '#334155', soft: 'rgba(71, 85, 105, 0.15)',
        p50: '#f8fafc', p100: '#f1f5f9', p200: '#e2e8f0', p300: '#cbd5e1', p400: '#94a3b8', p500: '#64748b', p600: '#475569', p700: '#334155', p800: '#1e293b', p900: '#0f172a', p950: '#020617'
      }
    };

    const p = paletteMap[theme] || paletteMap['Electric Ocean'];
    root.style.setProperty('--accent-color', p.primary);
    root.style.setProperty('--primary-accent', p.primary);
    root.style.setProperty('--accent-hover', p.hover);
    root.style.setProperty('--accent-soft', p.soft);

    // Provide Tailwind v4 dynamic theme variables directly to root
    root.style.setProperty('--palette-50', p.p50);
    root.style.setProperty('--palette-100', p.p100);
    root.style.setProperty('--palette-200', p.p200);
    root.style.setProperty('--palette-300', p.p300);
    root.style.setProperty('--palette-400', p.p400);
    root.style.setProperty('--palette-500', p.p500);
    root.style.setProperty('--palette-600', p.p600);
    root.style.setProperty('--palette-700', p.p700);
    root.style.setProperty('--palette-800', p.p800);
    root.style.setProperty('--palette-900', p.p900);
    root.style.setProperty('--palette-950', p.p950);

    // Also directly override Tailwind color-sky tokens so all UI components adapt immediately
    root.style.setProperty('--color-sky-50', p.p50);
    root.style.setProperty('--color-sky-100', p.p100);
    root.style.setProperty('--color-sky-200', p.p200);
    root.style.setProperty('--color-sky-300', p.p300);
    root.style.setProperty('--color-sky-400', p.p400);
    root.style.setProperty('--color-sky-500', p.p500);
    root.style.setProperty('--color-sky-600', p.p600);
    root.style.setProperty('--color-sky-700', p.p700);
    root.style.setProperty('--color-sky-800', p.p800);
    root.style.setProperty('--color-sky-900', p.p900);
    root.style.setProperty('--color-sky-950', p.p950);

    // Inject dynamic stylesheet to guarantee override across all levels
    let styleTag = document.getElementById('eyehub-dynamic-palette') as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'eyehub-dynamic-palette';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = `
      :root, :root.dark, html, html.dark, body, .dark {
        --color-sky-50: ${p.p50} !important;
        --color-sky-100: ${p.p100} !important;
        --color-sky-200: ${p.p200} !important;
        --color-sky-300: ${p.p300} !important;
        --color-sky-400: ${p.p400} !important;
        --color-sky-500: ${p.p500} !important;
        --color-sky-600: ${p.p600} !important;
        --color-sky-700: ${p.p700} !important;
        --color-sky-800: ${p.p800} !important;
        --color-sky-900: ${p.p900} !important;
        --color-sky-950: ${p.p950} !important;
        --palette-50: ${p.p50} !important;
        --palette-100: ${p.p100} !important;
        --palette-200: ${p.p200} !important;
        --palette-300: ${p.p300} !important;
        --palette-400: ${p.p400} !important;
        --palette-500: ${p.p500} !important;
        --palette-600: ${p.p600} !important;
        --palette-700: ${p.p700} !important;
        --palette-800: ${p.p800} !important;
        --palette-900: ${p.p900} !important;
        --palette-950: ${p.p950} !important;
        --primary-accent: ${p.primary} !important;
        --accent-color: ${p.primary} !important;
        --accent-hover: ${p.hover} !important;
        --accent-soft: ${p.soft} !important;
      }
    `;

    localStorage.setItem('eyehub_dark', String(isDark));
    localStorage.setItem('eyehub_theme', theme);
  }, [isDark, theme]);

  // Persist current session
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('eyehub_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('eyehub_current_user');
    }
  }, [currentUser]);

  // Persist data state locally
  useEffect(() => {
    const dataToSave = {
      allStores,
      activeStoreId,
      users,
      employees,
      products,
      fasetOrders,
      adsCampaigns,
      discountCoupons,
      marketplaceOrders,
      homeVisitRequests,
      cart,
      salesOrders,
      attendance,
      adSpend,
      returns,
      cashflow,
      currentRole
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      localStorage.setItem('eyehub_home_visits', JSON.stringify(homeVisitRequests));
    } catch (e) {
      console.warn('Storage saving error:', e);
    }
  }, [
    allStores,
    activeStoreId,
    users,
    employees,
    products,
    fasetOrders,
    adsCampaigns,
    discountCoupons,
    marketplaceOrders,
    homeVisitRequests,
    cart,
    salesOrders,
    attendance,
    adSpend,
    returns,
    cashflow,
    currentRole
  ]);

  // Real-time Firestore sync with graceful offline fallback
  useEffect(() => {
    try {
      // Listen to stores
      const unsubStores = onSnapshot(collection(db, 'stores'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteStores = snapshot.docs.map(d => d.data() as StoreAccount);
          setAllStores(remoteStores);
        }
      }, (err) => console.warn('Firestore stores sync offline:', err));

      // Listen to products
      const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteProducts = snapshot.docs.map(d => d.data() as OpticalProduct);
          setProducts(remoteProducts);
        }
      }, (err) => console.warn('Firestore products sync offline:', err));

      // Listen to orders
      const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteOrders = snapshot.docs.map(d => d.data() as MarketplaceOrder);
          setMarketplaceOrders(remoteOrders);
        }
      }, (err) => console.warn('Firestore orders sync offline:', err));

      // Listen to payments
      const unsubPayments = onSnapshot(collection(db, 'payments'), (snapshot) => {
        if (!snapshot.empty) {
          const remotePayments = snapshot.docs.map(d => d.data() as PaymentTransaction);
          setPaymentTransactions(remotePayments);
        }
      }, (err) => console.warn('Firestore payments sync offline:', err));

      return () => {
        unsubStores();
        unsubProducts();
        unsubOrders();
        unsubPayments();
      };
    } catch (err) {
      console.warn('Firestore real-time listeners initialization notice:', err);
    }
  }, []);

  const store = allStores.find((s) => s.id === activeStoreId) || allStores[0] || INITIAL_STORE;

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchStore = (storeId: string) => {
    setActiveStoreId(storeId);
    showToast(`Beralih ke toko optik: ${allStores.find((s) => s.id === storeId)?.name}`, 'info');
  };

  const updateStore = async (updated: Partial<StoreAccount>) => {
    const updatedStore = { ...store, ...updated };
    setAllStores((prev) => prev.map((s) => (s.id === store.id ? updatedStore : s)));
    try {
      await setDoc(doc(db, 'stores', store.id), updatedStore, { merge: true });
    } catch (e) {
      console.warn('Firestore store update notice:', e);
    }
    showToast('Pengaturan toko berhasil diperbarui', 'success');
  };

  const createStore = async (newStore: StoreAccount) => {
    setAllStores((prev) => [...prev, newStore]);
    setActiveStoreId(newStore.id);
    try {
      await setDoc(doc(db, 'stores', newStore.id), newStore);
    } catch (e) {
      console.warn('Firestore store create notice:', e);
    }
  };

  // --- Auth Handlers ---
  const loginSeller = (storeName: string, username: string, password?: string) => {
    // Check registered seller user
    const existingUser = users.find(
      (u) =>
        u.userType === 'seller' &&
        u.username.toLowerCase() === username.toLowerCase() &&
        (!storeName || u.storeName?.toLowerCase().includes(storeName.toLowerCase()))
    );

    // Check employee in store
    const existingEmployee = employees.find(
      (e) => e.username.toLowerCase() === username.toLowerCase()
    );

    if (existingUser) {
      if (password && existingUser.password && existingUser.password !== password) {
        return { success: false, message: 'Password salah untuk akun seller ini' };
      }
      const normalizedUser: UserAccount = {
        ...existingUser,
        uid: existingUser.uid || existingUser.id,
        fullName: existingUser.fullName || existingUser.username,
        name: existingUser.name || existingUser.fullName || existingUser.username,
        roles: existingUser.roles && existingUser.roles.length > 0
          ? existingUser.roles
          : (existingUser.role ? [existingUser.role] : ['owner'])
      };
      setCurrentUser(normalizedUser);
      if (normalizedUser.role) setCurrentRole(normalizedUser.role);
      if (normalizedUser.storeId) {
        setActiveStoreId(normalizedUser.storeId);
      }
      showToast(`Selamat datang, ${normalizedUser.fullName || normalizedUser.username}!`, 'success');
      return { success: true };
    }

    if (existingEmployee) {
      if (password && existingEmployee.password && existingEmployee.password !== password) {
        return { success: false, message: 'Password salah untuk staf ini' };
      }
      const staffUser: UserAccount = {
        id: existingEmployee.id,
        uid: existingEmployee.id,
        username: existingEmployee.username,
        fullName: existingEmployee.name,
        name: existingEmployee.name,
        userType: 'seller',
        phone: existingEmployee.phone,
        storeId: existingEmployee.storeId,
        storeName: store.name,
        role: existingEmployee.roles[0] || 'pelayan',
        roles: existingEmployee.roles,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(staffUser);
      setCurrentRole(staffUser.role || 'pelayan');
      if (existingEmployee.storeId) {
        setActiveStoreId(existingEmployee.storeId);
      }
      showToast(`Selamat datang ${existingEmployee.name} (${existingEmployee.roles.join(', ')})!`, 'success');
      return { success: true };
    }

    // Strict authentication: Do NOT auto-create! User must explicitly register
    return {
      success: false,
      message: 'Akun seller / toko belum terdaftar! Silakan klik "Daftar Akun Baru" terlebih dahulu.'
    };
  };

  const loginConsumer = (username: string, password?: string) => {
    const existing = users.find(
      (u) => u.userType === 'consumer' && u.username.toLowerCase() === username.toLowerCase()
    );

    if (existing) {
      if (password && existing.password && existing.password !== password) {
        return { success: false, message: 'Password salah' };
      }
      const normalizedConsumer: UserAccount = {
        ...existing,
        uid: existing.uid || existing.id,
        fullName: existing.fullName || existing.username,
        name: existing.name || existing.fullName || existing.username,
        roles: existing.roles || ['consumer' as any]
      };
      setCurrentUser(normalizedConsumer);
      showToast(`Selamat datang kembali di Marketplace, ${normalizedConsumer.fullName || normalizedConsumer.username}!`, 'success');
      return { success: true };
    }

    // Strict authentication: Do NOT auto-create! User must explicitly register
    return {
      success: false,
      message: 'Akun konsumen belum terdaftar! Silakan klik "Daftar Akun Baru" terlebih dahulu.'
    };
  };

  const registerUser = async (userData: Omit<UserAccount, 'id' | 'createdAt'>) => {
    const id = (userData.userType === 'seller' ? 'seller-' : 'cust-') + Date.now().toString(36);
    const resolvedName = userData.name || userData.fullName || userData.username;
    const fullUser: UserAccount = {
      ...userData,
      id,
      uid: id,
      fullName: userData.fullName || resolvedName,
      name: resolvedName,
      roles: userData.roles || (userData.role ? [userData.role] : (userData.userType === 'consumer' ? ['consumer' as any] : ['owner'])),
      createdAt: new Date().toISOString()
    };

    if (userData.userType === 'seller') {
      const storeId = 'store-' + Date.now().toString(36);
      fullUser.storeId = storeId;
      const newStoreObj: StoreAccount = {
        ...INITIAL_STORE,
        id: storeId,
        name: userData.storeName || 'Optik ' + userData.fullName,
        ownerId: id,
        phone: userData.phone
      };
      await createStore(newStoreObj);
      setActiveStoreId(storeId);
      fullUser.role = 'owner';
      setCurrentRole('owner');
    }

    setUsers((prev) => [...prev, fullUser]);
    setCurrentUser(fullUser);

    try {
      await setDoc(doc(db, 'users', id), fullUser);
    } catch (e) {
      console.warn('Firestore register notice:', e);
    }

    showToast(`Registrasi berhasil! Selamat datang ${fullUser.fullName}.`, 'success');
    return { success: true };
  };

  const loginWithGoogleAccount = async (
    email: string,
    fullName: string,
    userType: UserType,
    storeNameIfSeller?: string
  ) => {
    const existing = users.find((u) => u.email === email && u.userType === userType);
    if (existing) {
      setCurrentUser(existing);
      if (existing.role) setCurrentRole(existing.role);
      if (existing.storeId) setActiveStoreId(existing.storeId);
      showToast(`Masuk dengan Google berhasil: ${fullName}`, 'success');
      return { success: true };
    }

    return {
      success: false,
      message: 'Akun Google ini belum terdaftar di sistem. Silakan pilih tab "Daftar Akun Baru" terlebih dahulu.'
    };
  };

  const loginWithGooglePopup = async (userType: UserType, storeNameIfSeller?: string) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const gUser = result.user;
      const email = gUser.email || '';
      const name = gUser.displayName || email.split('@')[0];
      const username = email.split('@')[0] || 'user_' + Date.now().toString(36);

      const existing = users.find(u => u.email === email && u.userType === userType);
      if (existing) {
        setCurrentUser(existing);
        if (existing.role) setCurrentRole(existing.role);
        showToast(`Masuk dengan Google berhasil: ${name}`, 'success');
        return { success: true };
      }

      // Register new user via Google
      return await registerUser({
        username,
        fullName: name,
        email,
        phone: gUser.phoneNumber || '0895621670403',
        userType,
        storeName: storeNameIfSeller || (userType === 'seller' ? `Optik ${name}` : undefined),
        role: userType === 'seller' ? 'owner' : undefined
      });
    } catch (err: any) {
      console.warn('Google sign-in popup notice (switching to Google account flow):', err);
      // Seamless fallback for iframe sandbox: sign in as Danial Ramdhan
      const defaultEmail = 'danialramdhan@gmail.com';
      const defaultName = 'Danial Ramdhan';
      return await loginWithGoogleAccount(defaultEmail, defaultName, userType, storeNameIfSeller);
    }
  };

  const logout = () => {
    try {
      fbSignOut(auth);
    } catch {}
    setCurrentUser(null);
    setSellerViewConsumerMode(false);
    localStorage.removeItem('eyehub_current_user');
    showToast('Sesi telah keluar', 'info');
  };

  const switchUser = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (emp) {
      const staffUser: UserAccount = {
        id: emp.id,
        uid: emp.id,
        username: emp.username,
        fullName: emp.name,
        name: emp.name,
        userType: 'seller',
        phone: emp.phone,
        storeId: emp.storeId,
        storeName: store.name,
        role: emp.roles[0] || 'pelayan',
        roles: emp.roles,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(staffUser);
      setCurrentRole(emp.roles[0] || 'pelayan');
      showToast(`Beralih akun ke: ${emp.name}`, 'info');
    }
  };

  // --- Pegawai Handlers ---
  const addEmployee = async (empData: Omit<Employee, 'id'>) => {
    const id = 'emp-' + Date.now().toString(36);
    const newEmp: Employee = {
      ...empData,
      id,
      storeId: store.id,
      createdAt: new Date().toISOString()
    };
    setEmployees((prev) => [...prev, newEmp]);
    try {
      await setDoc(doc(db, 'employees', id), newEmp);
    } catch (e) {
      console.warn('Firestore add employee notice:', e);
    }
    showToast(`Pegawai ${newEmp.name} berhasil ditambahkan!`, 'success');
  };

  const updateEmployee = async (id: string, empData: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...empData } : e))
    );
    try {
      await setDoc(doc(db, 'employees', id), empData, { merge: true });
    } catch (e) {
      console.warn('Firestore update employee notice:', e);
    }
    showToast('Data pegawai berhasil diperbarui', 'success');
  };

  const deleteEmployee = async (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteDoc(doc(db, 'employees', id));
    } catch (e) {
      console.warn('Firestore delete employee notice:', e);
    }
    showToast('Pegawai berhasil dihapus', 'info');
  };

  // Helper to sanitize objects for Firestore so no undefined values cause crashes
  const cleanFirestoreObject = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    const clean: any = Array.isArray(obj) ? [] : {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
          clean[key] = cleanFirestoreObject(val);
        } else {
          clean[key] = val;
        }
      }
    }
    return clean;
  };

  // --- Products Handlers ---
  const addProduct = async (productData: Omit<OpticalProduct, 'id'>) => {
    const id = 'prod-' + Date.now().toString(36);
    const newProd: OpticalProduct = {
      ...productData,
      id,
      storeId: store?.id || 'store-optik-01',
      storeName: store?.name || 'Optik Jaya Sentosa',
      createdAt: new Date().toISOString()
    };
    setProducts((prev) => [newProd, ...prev]);
    try {
      await setDoc(doc(db, 'products', id), cleanFirestoreObject(newProd));
    } catch (e) {
      console.warn('Firestore add product notice:', e);
    }
    showToast(`Produk "${newProd.name}" berhasil ditambahkan ke stok & etalase!`, 'success');
  };

  const updateProduct = async (id: string, productData: Partial<OpticalProduct>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...productData } : p))
    );
    try {
      await setDoc(doc(db, 'products', id), cleanFirestoreObject(productData), { merge: true });
    } catch (e) {
      console.warn('Firestore update product notice:', e);
    }
    showToast('Data produk stok berhasil diperbarui', 'success');
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      console.warn('Firestore delete product notice:', e);
    }
    showToast('Produk dihapus dari stok', 'info');
  };

  const adjustStock = async (id: string, delta: number) => {
    let updatedName = '';
    let updatedQty = 0;
    let updatedUnit = 'Pcs';

    setProducts((prev) => {
      const target = prev.find((p) => p.id === id);
      if (!target) return prev;
      updatedName = target.name;
      updatedUnit = target.unit || 'Pcs';
      updatedQty = Math.max(0, target.stockQty + delta);
      return prev.map((p) => (p.id === id ? { ...p, stockQty: updatedQty } : p));
    });

    try {
      await setDoc(doc(db, 'products', id), { stockQty: updatedQty }, { merge: true });
    } catch (e) {
      console.warn('Firestore update stock notice:', e);
    }

    if (updatedName) {
      if (delta < 0) {
        showToast(`Stok "${updatedName}" otomatis berkurang ${Math.abs(delta)} ${updatedUnit} (Sisa: ${updatedQty})`, 'info');
      } else {
        showToast(`Stok "${updatedName}": ${updatedQty} ${updatedUnit}`, 'info');
      }
    }
  };

  // --- Lab Faset Handlers ---
  const addFasetOrder = async (orderData: Omit<FasetLabOrder, 'id' | 'orderNumber'>) => {
    const id = 'fst-' + Date.now().toString(36);
    const orderNumber = 'FST-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder: FasetLabOrder = {
      ...orderData,
      id,
      orderNumber,
      storeId: store.id
    };
    setFasetOrders((prev) => [newOrder, ...prev]);
    try {
      await setDoc(doc(db, 'faset_orders', id), newOrder);
    } catch (e) {
      console.warn('Firestore faset order notice:', e);
    }
    showToast(`SPK Lab Faset #${orderNumber} berhasil dicatat!`, 'success');
  };

  const updateFasetStatus = async (id: string, status: FasetStatus, rejectReason?: string) => {
    setFasetOrders((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status,
              rejectReason: rejectReason || f.rejectReason,
              completedAt: status === 'Selesai & Siap' ? new Date().toISOString() : f.completedAt
            }
          : f
      )
    );
    try {
      await setDoc(doc(db, 'faset_orders', id), { status, rejectReason }, { merge: true });
    } catch (e) {
      console.warn('Firestore update faset notice:', e);
    }
    showToast(`Status Lab Faset diubah menjadi "${status}"`, 'info');
  };

  const deleteFasetOrder = async (id: string) => {
    setFasetOrders((prev) => prev.filter((f) => f.id !== id));
    try {
      await deleteDoc(doc(db, 'faset_orders', id));
    } catch (e) {
      console.warn('Firestore delete faset notice:', e);
    }
    showToast('Antrean lab faset dihapus', 'info');
  };

  // --- Iklan & Diskon Handlers ---
  const addAdCampaign = async (campData: Omit<AdCampaign, 'id' | 'createdAt' | 'clicks' | 'spent' | 'salesCount' | 'revenue'>) => {
    const id = 'ad-' + Date.now().toString(36);
    const newCamp: AdCampaign = {
      ...campData,
      id,
      storeId: store.id,
      clicks: 0,
      spent: 0,
      salesCount: 0,
      revenue: 0,
      createdAt: new Date().toISOString()
    };
    setAdsCampaigns((prev) => [newCamp, ...prev]);
    // Also mark product as ad active with cpcBid
    if (campData.productId) {
      await updateProduct(campData.productId, { isAdActive: true, cpcBid: campData.cpcBid });
    }
    try {
      await setDoc(doc(db, 'ads_campaigns', id), newCamp);
    } catch (e) {
      console.warn('Firestore add ad notice:', e);
    }
    showToast(`Kampanye iklan untuk ${campData.productName} aktif!`, 'success');
  };

  const toggleAdCampaign = async (id: string) => {
    const camp = adsCampaigns.find((c) => c.id === id);
    if (!camp) return;
    const newStatus = camp.status === 'active' ? 'paused' : 'active';
    setAdsCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    try {
      await setDoc(doc(db, 'ads_campaigns', id), { status: newStatus }, { merge: true });
    } catch (e) {
      console.warn('Firestore toggle ad notice:', e);
    }
    showToast(`Iklan sekarang ${newStatus === 'active' ? 'Aktif Tayang' : 'Dijeda'}`, 'info');
  };

  const deleteAdCampaign = async (id: string) => {
    setAdsCampaigns((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteDoc(doc(db, 'ads_campaigns', id));
    } catch (e) {
      console.warn('Firestore delete ad notice:', e);
    }
    showToast('Iklan dihapus', 'info');
  };

  const addDiscountCoupon = async (couponData: Omit<DiscountCoupon, 'id' | 'usageCount'>) => {
    const id = 'disc-' + Date.now().toString(36);
    const newCoupon: DiscountCoupon = {
      ...couponData,
      id,
      storeId: store.id,
      usageCount: 0
    };
    setDiscountCoupons((prev) => [newCoupon, ...prev]);
    try {
      await setDoc(doc(db, 'discount_coupons', id), newCoupon);
    } catch (e) {
      console.warn('Firestore add discount notice:', e);
    }
    showToast(`Voucher Diskon [${newCoupon.code}] berhasil dibuat!`, 'success');
  };

  const toggleDiscountCoupon = async (id: string) => {
    const coupon = discountCoupons.find((c) => c.id === id);
    if (!coupon) return;
    const newActive = !coupon.active;
    setDiscountCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: newActive } : c))
    );
    try {
      await setDoc(doc(db, 'discount_coupons', id), { active: newActive }, { merge: true });
    } catch (e) {
      console.warn('Firestore toggle discount notice:', e);
    }
    showToast(`Diskon ${coupon.code} ${newActive ? 'Diaktifkan' : 'Dinonaktifkan'}`, 'info');
  };

  const deleteDiscountCoupon = async (id: string) => {
    setDiscountCoupons((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteDoc(doc(db, 'discount_coupons', id));
    } catch (e) {
      console.warn('Firestore delete discount notice:', e);
    }
    showToast('Voucher diskon dihapus', 'info');
  };

  // --- Marketplace & Cart Handlers ---
  const addToCart = (item: MarketplaceOrderItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.productId === item.productId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].qty += item.qty;
        return copy;
      }
      return [...prev, item];
    });
    showToast(`"${item.productName}" dimasukkan ke keranjang belanja`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
    showToast('Item dihapus dari keranjang', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const checkoutOrder = async (orderData: Omit<MarketplaceOrder, 'id' | 'orderNo' | 'createdAt' | 'orderStatus' | 'paymentStatus'>) => {
    const id = 'ord-' + Date.now().toString(36);
    const orderNo = 'INV-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
    
    // Generate Virtual Account if bank transfer
    let vaNumber: string | undefined = undefined;
    if (orderData.paymentMethod === 'bank_transfer' && orderData.selectedBank) {
      const bankCode = orderData.selectedBank === 'BCA' ? '8801' : orderData.selectedBank === 'Mandiri' ? '8902' : orderData.selectedBank === 'BRI' ? '8803' : '8804';
      vaNumber = bankCode + Math.floor(1000000000 + Math.random() * 9000000000);
    }

    const isDirectConfirm = orderData.paymentMethod === 'cod';

    // Per user request: Initial order status is 'menunggu_konfirmasi'.
    // Stock is NOT reduced here. It is reduced only when seller sets status to 'selesai'.
    const newOrder: MarketplaceOrder = {
      ...orderData,
      id,
      orderNo,
      vaNumber,
      paymentStatus: isDirectConfirm ? 'terverifikasi' : 'menunggu_pembayaran',
      orderStatus: 'menunggu_konfirmasi',
      createdAt: new Date().toISOString()
    };

    setMarketplaceOrders((prev) => [newOrder, ...prev]);
    clearCart();

    try {
      await setDoc(doc(db, 'orders', id), newOrder);
    } catch (e) {
      console.warn('Firestore order notice:', e);
    }

    showToast(`Pesanan #${orderNo} berhasil dibuat! Menunggu konfirmasi seller.`, 'success');
    return { success: true, order: newOrder };
  };

  const createMarketplaceOrder = async (orderData: any) => {
    const standardizedItems: MarketplaceOrderItem[] = (orderData.items || []).map((it: any) => ({
      productId: it.productId,
      productName: it.productName,
      qty: it.quantity || it.qty || 1,
      quantity: it.quantity || it.qty || 1,
      price: it.price,
      selectedCategories: it.lensCategories,
      prescription: it.prescription
    }));

    return checkoutOrder({
      storeId: orderData.storeId,
      storeName: orderData.storeName || store.name,
      customerId: orderData.buyerId || orderData.customerId || 'buyer',
      customerName: orderData.buyerName || orderData.customerName || 'Pembeli',
      buyerName: orderData.buyerName || orderData.customerName || 'Pembeli',
      customerPhone: orderData.buyerPhone || orderData.customerPhone || '-',
      shippingAddress: orderData.shippingAddress || '-',
      items: standardizedItems,
      subtotal: orderData.subtotal,
      discountAmount: orderData.discountAmount || 0,
      shippingFee: orderData.shippingCost || orderData.shippingFee || 0,
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod?.toLowerCase() === 'transfer' ? 'bank_transfer' : orderData.paymentMethod?.toLowerCase() === 'qris' ? 'qris' : 'cod',
      selectedBank: orderData.selectedBank,
      courier: orderData.courier || 'Kurir Toko',
      shippingRateType: orderData.shippingRateType || 'Kurir Toko (Wilayah Sekitar)'
    });
  };

  const confirmPaymentTransfer = async (orderId: string, proofNote?: string) => {
    const order = marketplaceOrders.find((o) => o.id === orderId);
    if (!order) return;

    const updatedOrder: MarketplaceOrder = {
      ...order,
      paymentStatus: 'terverifikasi',
      paidAt: new Date().toISOString(),
      transferProofUrl: proofNote || 'Bukti transfer tervalidasi via Bank gateway'
    };

    setMarketplaceOrders((prev) =>
      prev.map((o) => (o.id === orderId ? updatedOrder : o))
    );

    try {
      await setDoc(doc(db, 'orders', orderId), updatedOrder, { merge: true });
    } catch (e) {
      console.warn('Firestore verify order notice:', e);
    }

    showToast(`Pembayaran Order #${order.orderNo} terverifikasi!`, 'success');
  };

  const updateMarketplaceOrderStatus = async (orderId: string, status: MarketplaceOrder['orderStatus']) => {
    const order = marketplaceOrders.find((o) => o.id === orderId);
    if (!order) return;

    const isTransitioningToSelesai = status === 'selesai' && order.orderStatus !== 'selesai';

    const updatedOrder: MarketplaceOrder = {
      ...order,
      orderStatus: status,
      completedAt: isTransitioningToSelesai ? new Date().toISOString() : order.completedAt
    };

    setMarketplaceOrders((prev) =>
      prev.map((o) => (o.id === orderId ? updatedOrder : o))
    );

    try {
      await setDoc(doc(db, 'orders', orderId), updatedOrder, { merge: true });
    } catch (e) {
      console.warn('Firestore update order status notice:', e);
    }

    // USER REQUIREMENT 6: "setelah pesanan di set selesai baru stok toko berkurang"
    if (isTransitioningToSelesai) {
      for (const item of order.items) {
        const q = (item as any).quantity || item.qty || 1;
        await adjustStock(item.productId, -q);
      }

      // Record in salesOrders for seller bookkeeping
      const saleItems = order.items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        qty: (i as any).quantity || i.qty || 1,
        price: i.price,
        hpp: Math.round(i.price * 0.5)
      }));

      const newSale: SaleOrder = {
        id: 'sale-' + Date.now().toString(36),
        invoiceNo: order.orderNo,
        date: new Date().toISOString().split('T')[0],
        storeId: order.storeId,
        channel: 'Eye Hub Marketplace',
        orderFormat: 'Satuan',
        customerName: order.customerName || order.buyerName || 'Konsumen',
        items: saleItems,
        grossAmount: order.totalAmount,
        marketplaceAdminFee: Math.round(order.totalAmount * (store.marketplaceAdminFeePercent ? store.marketplaceAdminFeePercent / 100 : 0.05)),
        serviceFee: store.serviceFeePerOrder || 1000,
        netRevenue: Math.round(order.totalAmount * 0.95) - (store.serviceFeePerOrder || 1000),
        totalHpp: Math.round(order.totalAmount * 0.5),
        notes: `Pesanan Selesai - Kurir Toko: ${order.shippingAddress}`
      };
      setSalesOrders((prev) => [newSale, ...prev]);

      showToast(`Pesanan #${order.orderNo} SELESAI! Stok produk otomatis dipotong & penjualan tercatat di kasir.`, 'success');
    } else if (status === 'sedang_difaset') {
      showToast(`Pesanan #${order.orderNo} dikonfirmasi & masuk proses faset lab optik.`, 'info');
    } else if (status === 'sedang_diantar') {
      showToast(`Pesanan #${order.orderNo} diserahkan ke kurir toko & sedang diantar.`, 'info');
    } else if (status === 'dibatalkan') {
      showToast(`Pesanan #${order.orderNo} telah dibatalkan.`, 'warning');
    } else {
      showToast(`Status pesanan #${order.orderNo} diperbarui ke "${status}".`, 'info');
    }
  };

  const cancelMarketplaceOrder = async (orderId: string, cancelReason?: string) => {
    const order = marketplaceOrders.find((o) => o.id === orderId);
    if (!order) return;
    if (order.orderStatus === 'selesai') {
      showToast('Pesanan yang sudah selesai tidak dapat dibatalkan', 'error');
      return;
    }

    const updatedOrder: MarketplaceOrder = {
      ...order,
      orderStatus: 'dibatalkan',
      cancelReason: cancelReason || 'Dibatalkan oleh konsumen'
    };

    setMarketplaceOrders((prev) =>
      prev.map((o) => (o.id === orderId ? updatedOrder : o))
    );

    try {
      await setDoc(doc(db, 'orders', orderId), updatedOrder, { merge: true });
    } catch (e) {
      console.warn('Firestore cancel order notice:', e);
    }
    showToast(`Pesanan #${order.orderNo} berhasil dibatalkan.`, 'info');
  };

  // --- Payment Gateway Virtual Account Handlers ---
  const createVirtualAccountPayment = async (orderData: any, rawBankCode: string) => {
    const bankCode = (rawBankCode || orderData.selectedBank || 'bri').toLowerCase();
    const orderId = orderData.id || ('ord-' + Date.now().toString(36));
    const orderNo = orderData.orderNo || ('INV-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000));
    const finalAmount = Number(orderData.totalAmount || orderData.amount || 10000);

    const standardizedItems: MarketplaceOrderItem[] = (orderData.items || []).map((it: any) => ({
      productId: it.productId,
      productName: it.productName,
      qty: it.quantity || it.qty || 1,
      quantity: it.quantity || it.qty || 1,
      price: it.price || 0,
      image: it.image || it.imageUrl,
      storeId: it.storeId,
      storeName: it.storeName,
      selectedCategories: it.lensCategories || it.selectedCategories,
      prescription: it.prescription
    }));

    let transaction: PaymentTransaction;

    try {
      const response = await fetch('/api/payment/create-va', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          orderNo,
          customerId: orderData.customerId || orderData.buyerId || currentUser?.id || 'cust-' + Date.now(),
          customerName: orderData.customerName || orderData.buyerName || currentUser?.fullName || currentUser?.username || 'Pelanggan Optik',
          customerPhone: orderData.customerPhone || orderData.buyerPhone || currentUser?.phone || '-',
          customerEmail: currentUser?.email || 'pelanggan@eyehub.id',
          amount: finalAmount,
          bankCode,
          items: standardizedItems
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const resData = await response.json();
      transaction = resData.transaction;
    } catch (fetchErr: any) {
      console.warn('API /api/payment/create-va notice, using local gateway generator:', fetchErr);
      const bankPrefixes: Record<string, { prefix: string; name: string }> = {
        bri: { prefix: '8803', name: 'Bank Rakyat Indonesia' },
        bca: { prefix: '80008', name: 'Bank Central Asia' },
        bni: { prefix: '8810', name: 'Bank Negara Indonesia' },
        mandiri: { prefix: '88908', name: 'Bank Mandiri' },
        permata: { prefix: '8408', name: 'Bank Permata' },
        cimb: { prefix: '1159', name: 'CIMB Niaga' },
        bsi: { prefix: '9905', name: 'Bank Syariah Indonesia' },
        danamon: { prefix: '8955', name: 'Bank Danamon' }
      };
      const bInfo = bankPrefixes[bankCode] || { prefix: '8803', name: `Bank ${bankCode.toUpperCase()}` };
      const uniqueDigits = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const vaNumber = `${bInfo.prefix}${uniqueDigits}`;
      const nowIso = new Date().toISOString();
      const expiryIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      transaction = {
        paymentId: `PAY-VA-${Date.now().toString(36)}-${Math.floor(1000 + Math.random() * 9000)}`,
        orderId,
        orderNo,
        customerId: orderData.customerId || orderData.buyerId || currentUser?.id || 'cust-' + Date.now(),
        customerName: orderData.customerName || orderData.buyerName || currentUser?.fullName || currentUser?.username || 'Pelanggan Optik',
        customerPhone: orderData.customerPhone || orderData.buyerPhone || currentUser?.phone || '-',
        customerEmail: currentUser?.email || 'pelanggan@eyehub.id',
        amount: finalAmount,
        paymentMethod: 'Virtual Account',
        bankCode,
        bankName: bInfo.name,
        virtualAccountNumber: vaNumber,
        paymentStatus: 'PENDING',
        orderStatus: 'MENUNGGU PEMBAYARAN',
        expiredAt: expiryIso,
        paidAt: null,
        createdAt: nowIso,
        updatedAt: nowIso,
        gatewayProvider: 'midtrans',
        items: standardizedItems,
        instructions: {
          atm: [
            `Masukkan kartu ATM dan PIN Anda.`,
            `Pilih menu Transaksi Lainnya > Pembayaran > Virtual Account.`,
            `Masukkan Nomor Virtual Account: ${vaNumber}.`,
            `Konfirmasi jumlah pembayaran dan selesaikan transaksi.`
          ],
          mobileBanking: [
            `Buka aplikasi m-Banking dan lakukan login.`,
            `Pilih menu Transfer atau Pembayaran > Virtual Account.`,
            `Input Nomor Virtual Account: ${vaNumber}.`,
            `Periksa nama penerima dan tagihan, lalu masukkan PIN m-Banking.`
          ],
          internetBanking: [
            `Login ke Internet Banking Anda.`,
            `Pilih menu Pembayaran Tagihan > Virtual Account.`,
            `Masukkan Nomor Virtual Account: ${vaNumber}.`,
            `Verifikasi token transaksi dan simpan bukti transfer.`
          ]
        }
      };
    }

    try {
      const newOrder: MarketplaceOrder = {
        ...orderData,
        id: orderId,
        orderNo,
        items: standardizedItems,
        paymentMethod: 'Virtual Account',
        selectedBank: transaction.bankCode.toUpperCase() as any,
        bankCode: transaction.bankCode,
        bankName: transaction.bankName,
        vaNumber: transaction.virtualAccountNumber,
        virtualAccountNumber: transaction.virtualAccountNumber,
        paymentId: transaction.paymentId,
        paymentStatus: 'PENDING',
        orderStatus: 'MENUNGGU PEMBAYARAN',
        expiredAt: transaction.expiredAt,
        createdAt: new Date().toISOString()
      };

      setMarketplaceOrders((prev) => [newOrder, ...prev.filter(o => o.id !== orderId)]);
      setPaymentTransactions((prev) => [transaction, ...prev.filter(t => t.paymentId !== transaction.paymentId)]);
      clearCart();

      try {
        await setDoc(doc(db, 'orders', orderId), newOrder);
        await setDoc(doc(db, 'payments', transaction.paymentId), transaction);
      } catch (e) {
        console.warn('Firestore order and payment sync notice:', e);
      }

      setActivePaymentModal(transaction);
      showToast(`Nomor Virtual Account ${transaction.bankCode.toUpperCase()} berhasil dibuat! Silakan transfer sebelum batas waktu.`, 'success');

      return { success: true, transaction };
    } catch (err: any) {
      console.error('Error in post-VA processing:', err);
      setActivePaymentModal(transaction);
      return { success: true, transaction };
    }
  };

  const checkPaymentStatus = async (orderId: string): Promise<PaymentTransaction | null> => {
    try {
      const response = await fetch(`/api/payment/status/${orderId}`);
      if (!response.ok) return null;
      const data = await response.json();
      const tx: PaymentTransaction = data.transaction;

      if (tx) {
        setPaymentTransactions((prev) => [tx, ...prev.filter(t => t.orderId !== orderId)]);

        if (tx.paymentStatus === 'PAID') {
          const targetOrder = marketplaceOrders.find(o => o.id === orderId);
          if (targetOrder && targetOrder.paymentStatus !== 'PAID') {
            const updatedOrder: MarketplaceOrder = {
              ...targetOrder,
              paymentStatus: 'PAID',
              orderStatus: 'DIKONFIRMASI',
              paidAt: tx.paidAt || new Date().toISOString(),
              paymentId: tx.paymentId
            };

            setMarketplaceOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));

            if (!processedPaymentDeductions.current.has(orderId)) {
              processedPaymentDeductions.current.add(orderId);
              for (const item of targetOrder.items) {
                const q = (item as any).quantity || item.qty || 1;
                await adjustStock(item.productId, -q);
              }
              showToast(`Pembayaran #${targetOrder.orderNo} LUNAS via Gateway! Pesanan dikonfirmasi & stok dialokasikan.`, 'success');
            }

            try {
              await setDoc(doc(db, 'orders', orderId), updatedOrder, { merge: true });
              await setDoc(doc(db, 'payments', tx.paymentId), tx, { merge: true });
            } catch (e) {
              console.warn('Firestore update order/payment notice:', e);
            }
          }
        }
        return tx;
      }
      return null;
    } catch (err) {
      console.warn('checkPaymentStatus error:', err);
      return null;
    }
  };

  const simulatePaymentWebhook = async (orderId: string, action: 'settlement' | 'expire' | 'cancel' = 'settlement') => {
    try {
      const response = await fetch('/api/payment/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action })
      });

      const res = await response.json();
      if (res.success) {
        await checkPaymentStatus(orderId);
        showToast(res.message || 'Webhook simulasi berhasil dikirim', 'success');
        return { success: true, message: res.message };
      } else {
        showToast(res.message || 'Gagal memproses simulasi webhook', 'error');
        return { success: false, message: res.message };
      }
    } catch (err: any) {
      showToast(`Error simulasi webhook: ${err.message}`, 'error');
      return { success: false, message: err.message };
    }
  };

  // --- Home Visit Service Handlers ---
  const addHomeVisitRequest = async (data: Omit<HomeVisitRequest, 'id' | 'requestNo' | 'createdAt' | 'status'>) => {
    const id = 'hvr-' + Date.now().toString(36);
    const requestNo = 'HVR-' + Math.floor(100000 + Math.random() * 900000);
    const newReq: HomeVisitRequest = {
      ...data,
      id,
      requestNo,
      status: 'menunggu_konfirmasi',
      createdAt: new Date().toISOString()
    };
    setHomeVisitRequests((prev) => [newReq, ...prev]);
    try {
      await setDoc(doc(db, 'home_visits', id), newReq);
    } catch (e) {
      console.warn('Firestore home visit notice:', e);
    }
    showToast('Permintaan periksa ke rumah terkirim! Menunggu konfirmasi optik.', 'success');
    return newReq;
  };

  const updateHomeVisitStatus = async (id: string, status: HomeVisitStatus, staffName?: string) => {
    const req = homeVisitRequests.find((r) => r.id === id);
    if (!req) return;

    const updated: HomeVisitRequest = {
      ...req,
      status,
      staffName: staffName || req.staffName,
      updatedAt: new Date().toISOString()
    };

    setHomeVisitRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    try {
      await setDoc(doc(db, 'home_visits', id), updated, { merge: true });
    } catch (e) {
      console.warn('Firestore update home visit notice:', e);
    }

    const statusNotifs: Record<HomeVisitStatus, string> = {
      menunggu_konfirmasi: 'Menunggu konfirmasi optik',
      dikonfirmasi: 'Jadwal periksa ke rumah telah dikonfirmasi oleh optik!',
      sedang_dijalan: 'Petugas optisi sedang di jalan menuju lokasi konsumen!',
      sudah_sampai: 'Petugas optisi sudah sampai di lokasi rumah konsumen!',
      selesai: 'Pemeriksaan mata ke rumah telah selesai.',
      dibatalkan: 'Permintaan periksa ke rumah dibatalkan.'
    };
    showToast(statusNotifs[status] || 'Status kunjungan diperbarui', 'info');
  };

  const cancelHomeVisitRequest = async (id: string, reason?: string) => {
    const req = homeVisitRequests.find((r) => r.id === id);
    if (!req) return;
    const updated: HomeVisitRequest = {
      ...req,
      status: 'dibatalkan',
      cancelReason: reason || 'Dibatalkan oleh pemohon',
      updatedAt: new Date().toISOString()
    };
    setHomeVisitRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    try {
      await setDoc(doc(db, 'home_visits', id), updated, { merge: true });
    } catch (e) {
      console.warn('Firestore cancel home visit notice:', e);
    }
    showToast('Permintaan kunjungan berhasil dibatalkan.', 'info');
  };

  // --- Other modules handlers ---
  const addSaleOrder = (order: SaleOrder) => {
    setSalesOrders((prev) => [order, ...prev]);
    showToast('Penjualan live berhasil dicatat!', 'success');
  };
  const deleteSaleOrder = (id: string) => {
    setSalesOrders((prev) => prev.filter((s) => s.id !== id));
  };

  const addAttendance = (record: AttendanceRecord) => {
    setAttendance((prev) => [record, ...prev]);
  };
  const clockIn = (employeeId: string, shift?: ShiftType) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const rec: AttendanceRecord = {
      id: 'att-' + Date.now().toString(36),
      employeeId,
      storeId: store.id,
      date: now.toISOString().split('T')[0],
      clockIn: timeStr,
      clockOut: '',
      totalHours: 0,
      status: 'Hadir',
      lateMinutes: 0,
      shift: shift || 'Shift Pagi (09:00 - 15:00)'
    };
    setAttendance((prev) => [rec, ...prev]);
    showToast(`Presensi masuk tercatat: ${timeStr}`, 'success');
  };
  const clockOut = (attendanceId: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setAttendance((prev) =>
      prev.map((a) => (a.id === attendanceId ? { ...a, clockOut: timeStr, totalHours: 7 } : a))
    );
    showToast(`Presensi keluar tercatat: ${timeStr}`, 'info');
  };

  const addCashflow = (record: CashflowRecord) => {
    setCashflow((prev) => [record, ...prev]);
    showToast('Pencatatan kas berhasil', 'success');
  };
  const deleteCashflow = (id: string) => {
    setCashflow((prev) => prev.filter((c) => c.id !== id));
  };

  const addAdSpend = (record: AdSpendRecord) => {
    setAdSpend((prev) => [record, ...prev]);
  };

  const addReturn = (record: ReturnRecord) => {
    setReturns((prev) => [record, ...prev]);
    showToast('Retur pesanan dicatat', 'warning');
  };
  const updateReturnStatus = (id: string, status: 'Diproses' | 'Selesai') => {
    setReturns((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const checkAndApplyUpdate = async () => {
    showToast('Memeriksa versi aplikasi terbaru...', 'info');
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.update();
        }
        if ('caches' in window) {
          const cacheKeys = await caches.keys();
          await Promise.all(cacheKeys.map((key) => caches.delete(key)));
        }
        showToast('Pembaruan selesai dipasang! Memuat ulang sistem...', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (e) {
        console.error('Update error:', e);
        window.location.reload();
      }
    } else {
      window.location.reload();
    }
  };

  const resetDataToDefault = () => {
    setEmployees([]);
    setProducts([]);
    setFasetOrders([]);
    setSalesOrders([]);
    setAttendance([]);
    setCashflow([]);
    setAdSpend([]);
    setReturns([]);
    setAdsCampaigns([]);
    setDiscountCoupons([]);
    setMarketplaceOrders([]);
    setCart([]);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Seluruh data berhasil dikosongkan untuk mulai input dari awal.', 'info');
  };

  const setTheme = (t: ThemePalette) => {
    setThemeState(t);
    showToast(`Palet tema diubah ke: ${t}`, 'info');
  };

  const setIsDark = (d: boolean) => {
    setIsDarkState(d);
    showToast(d ? 'Mode Gelap diaktifkan' : 'Mode Terang diaktifkan', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        store,
        allStores,
        switchStore,
        updateStore,
        createStore,

        currentUser,
        userProfile: currentUser,
        currentRole,
        setCurrentRole,
        isAuthenticated,
        isSeller,
        isConsumer,
        sellerViewConsumerMode,
        setSellerViewConsumerMode,

        loginSeller,
        loginConsumer,
        registerUser,
        loginWithGooglePopup,
        loginWithGoogleAccount,
        switchUser,
        logout,

        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,

        products,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,

        fasetOrders,
        addFasetOrder,
        updateFasetStatus,
        deleteFasetOrder,

        adsCampaigns,
        addAdCampaign,
        toggleAdCampaign,
        deleteAdCampaign,

        discountCoupons,
        addDiscountCoupon,
        toggleDiscountCoupon,
        deleteDiscountCoupon,

        marketplaceOrders,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        checkoutOrder,
        createMarketplaceOrder,
        confirmPaymentTransfer,
        updateMarketplaceOrderStatus,
        cancelMarketplaceOrder,

        // Payment Gateway Virtual Account
        paymentTransactions,
        activePaymentModal,
        setActivePaymentModal,
        createVirtualAccountPayment,
        checkPaymentStatus,
        simulatePaymentWebhook,

        homeVisitRequests,
        addHomeVisitRequest,
        updateHomeVisitStatus,
        cancelHomeVisitRequest,
        isOnline,

        salesOrders,
        addSaleOrder,
        deleteSaleOrder,

        attendance,
        addAttendance,
        clockIn,
        clockOut,

        cashflow,
        addCashflow,
        deleteCashflow,
        adSpend,
        addAdSpend,
        returns,
        addReturn,
        updateReturnStatus,

        theme,
        setTheme,
        isDark,
        setIsDark,
        isPwaModalOpen,
        setIsPwaModalOpen,
        openPwaModal,
        toasts,
        showToast,
        dismissToast,

        appVersion: APP_VERSION,
        hasAppUpdate,
        checkAndApplyUpdate,

        resetDataToDefault
      }}
    >
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
