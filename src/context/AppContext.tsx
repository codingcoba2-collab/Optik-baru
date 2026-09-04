import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  ShiftType
} from '../types';
import {
  INITIAL_STORE,
  INITIAL_EMPLOYEES,
  INITIAL_PRODUCTS,
  INITIAL_FASET_ORDERS,
  INITIAL_SALES_ORDERS,
  INITIAL_ATTENDANCE,
  INITIAL_AD_SPEND,
  INITIAL_RETURNS,
  INITIAL_CASHFLOW
} from '../data/mockData';

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
  currentUser: Employee;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  switchUser: (employeeId: string) => void;
  isAuthenticated: boolean;
  login: (employeeId: string, role?: Role) => boolean;
  loginWithCredentials: (usernameOrEmail: string, passwordOrPin: string, storeId?: string) => { success: boolean; message?: string };
  logout: () => void;

  // Data Collections
  employees: Employee[];
  addEmployee: (emp: Employee) => void;
  updateEmployee: (emp: Employee) => void;
  deleteEmployee: (id: string) => void;

  products: OpticalProduct[];
  addProduct: (product: OpticalProduct) => void;
  updateProduct: (product: OpticalProduct) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;

  fasetOrders: FasetLabOrder[];
  addFasetOrder: (order: FasetLabOrder) => void;
  updateFasetStatus: (id: string, status: FasetStatus, rejectReason?: string) => void;
  deleteFasetOrder: (id: string) => void;

  salesOrders: SaleOrder[];
  addSaleOrder: (order: SaleOrder) => void;
  deleteSaleOrder: (id: string) => void;

  attendance: AttendanceRecord[];
  addAttendance: (record: AttendanceRecord) => void;
  updateAttendance: (record: AttendanceRecord) => void;
  clockIn: (employeeId: string, shift?: ShiftType) => void;
  clockOut: (attendanceId: string) => void;

  adSpend: AdSpendRecord[];
  addAdSpend: (record: AdSpendRecord) => void;

  returns: ReturnRecord[];
  addReturn: (record: ReturnRecord) => void;
  updateReturnStatus: (id: string, status: 'Diproses' | 'Selesai') => void;

  cashflow: CashflowRecord[];
  addCashflow: (record: CashflowRecord) => void;
  deleteCashflow: (id: string) => void;

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

  // Reset to initial mock
  resetDataToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'eyehub_optics_data_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial data from localStorage if present
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

  const [allStores, setAllStores] = useState<StoreAccount[]>(
    initial?.allStores || [INITIAL_STORE]
  );
  const [activeStoreId, setActiveStoreId] = useState<string>(
    initial?.activeStoreId || INITIAL_STORE.id
  );
  const [employees, setEmployees] = useState<Employee[]>(
    initial?.employees || INITIAL_EMPLOYEES
  );
  const [currentUserId, setCurrentUserId] = useState<string>(
    initial?.currentUserId || INITIAL_EMPLOYEES[0].id // Owner by default
  );
  const [currentRole, setCurrentRole] = useState<Role>(
    initial?.currentRole || 'owner'
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('eyehub_authenticated') === 'true';
  });

  const [products, setProducts] = useState<OpticalProduct[]>(
    initial?.products || INITIAL_PRODUCTS
  );
  const [fasetOrders, setFasetOrders] = useState<FasetLabOrder[]>(
    initial?.fasetOrders || INITIAL_FASET_ORDERS
  );
  const [salesOrders, setSalesOrders] = useState<SaleOrder[]>(
    initial?.salesOrders || INITIAL_SALES_ORDERS
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

  const [theme, setThemeState] = useState<ThemePalette>(
    (localStorage.getItem('eyehub_theme') as ThemePalette) || 'Electric Ocean'
  );
  const [isDark, setIsDarkState] = useState<boolean>(() => {
    const saved = localStorage.getItem('eyehub_dark');
    return saved !== null ? saved === 'true' : true; // default dark for modern optics vibe
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState<boolean>(false);

  const openPwaModal = () => setIsPwaModalOpen(true);

  // Apply dark mode class and theme dataset to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-palette', theme);
    localStorage.setItem('eyehub_dark', String(isDark));
    localStorage.setItem('eyehub_theme', theme);
  }, [isDark, theme]);

  // Persist data state
  useEffect(() => {
    const dataToSave = {
      allStores,
      activeStoreId,
      employees,
      currentUserId,
      currentRole,
      products,
      fasetOrders,
      salesOrders,
      attendance,
      adSpend,
      returns,
      cashflow,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Storage quota exceeded or error saving:', e);
    }
  }, [
    allStores,
    activeStoreId,
    employees,
    currentUserId,
    currentRole,
    products,
    fasetOrders,
    salesOrders,
    attendance,
    adSpend,
    returns,
    cashflow,
  ]);

  const store = allStores.find((s) => s.id === activeStoreId) || allStores[0] || INITIAL_STORE;
  const currentUser = employees.find((e) => e.id === currentUserId) || employees[0];

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

  const updateStore = (updated: Partial<StoreAccount>) => {
    setAllStores((prev) =>
      prev.map((s) => (s.id === store.id ? { ...s, ...updated } : s))
    );
    showToast('Pengaturan toko optik berhasil disimpan', 'success');
  };

  const createStore = (newStore: StoreAccount) => {
    setAllStores((prev) => [...prev, newStore]);
    setActiveStoreId(newStore.id);
    showToast(`Toko baru "${newStore.name}" berhasil dibuat`, 'success');
  };

  const switchUser = (employeeId: string) => {
    const found = employees.find((e) => e.id === employeeId);
    if (found) {
      setCurrentUserId(employeeId);
      setCurrentRole(found.roles[0] || 'admin');
      showToast(`Login sebagai ${found.name} (${found.roles.join(', ')})`, 'info');
    }
  };

  const login = (employeeId: string, role?: Role): boolean => {
    const found = employees.find((e) => e.id === employeeId);
    if (found) {
      setCurrentUserId(found.id);
      setCurrentRole(role || found.roles[0] || 'owner');
      setIsAuthenticated(true);
      localStorage.setItem('eyehub_authenticated', 'true');
      showToast(`Selamat datang, ${found.name}! Masuk sebagai ${role || found.roles[0]}`, 'success');
      return true;
    }
    return false;
  };

  const loginWithCredentials = (
    usernameOrEmail: string,
    passwordOrPin: string,
    storeId?: string
  ): { success: boolean; message?: string } => {
    if (storeId) {
      setActiveStoreId(storeId);
    }
    const cleanInput = usernameOrEmail.trim().toLowerCase();
    let found = employees.find((e) =>
      e.name.toLowerCase().includes(cleanInput) ||
      e.phone.replace(/[^0-9]/g, '').includes(cleanInput.replace(/[^0-9]/g, '')) ||
      (cleanInput.includes('owner') && e.roles.includes('owner')) ||
      (cleanInput.includes('host') && e.roles.includes('host')) ||
      (cleanInput.includes('faset') && e.roles.includes('faset')) ||
      (cleanInput.includes('admin') && e.roles.includes('admin'))
    );

    if (!found) {
      if (cleanInput === '' || cleanInput === 'demo' || cleanInput === 'admin') {
        found = employees[0];
      }
    }

    if (found) {
      setCurrentUserId(found.id);
      setCurrentRole(found.roles[0] || 'owner');
      setIsAuthenticated(true);
      localStorage.setItem('eyehub_authenticated', 'true');
      showToast(`Login berhasil! Selamat datang kembali, ${found.name}`, 'success');
      return { success: true };
    }

    return {
      success: false,
      message: 'Kredensial tidak cocok. Silakan gunakan salah satu Akun Demo atau PIN 1234',
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('eyehub_authenticated');
    showToast('Anda telah keluar dari sesi sistem optik', 'info');
  };

  // Employees
  const addEmployee = (emp: Employee) => {
    setEmployees((prev) => [...prev, emp]);
    showToast(`Karyawan optik ${emp.name} ditambahkan`, 'success');
  };

  const updateEmployee = (emp: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === emp.id ? emp : e)));
    showToast(`Data karyawan ${emp.name} diperbarui`, 'success');
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    showToast('Karyawan dihapus', 'warning');
  };

  // Products
  const addProduct = (p: OpticalProduct) => {
    setProducts((prev) => [p, ...prev]);
    showToast(`Produk "${p.name}" ditambahkan ke inventaris`, 'success');
  };

  const updateProduct = (p: OpticalProduct) => {
    setProducts((prev) => prev.map((prod) => (prod.id === p.id ? p : prod)));
    showToast(`Produk "${p.name}" diperbarui`, 'success');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Produk dihapus dari katalog', 'warning');
  };

  const adjustStock = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newQty = Math.max(0, p.stockQty + delta);
          return { ...p, stockQty: newQty };
        }
        return p;
      })
    );
  };

  // Faset Lab
  const addFasetOrder = (order: FasetLabOrder) => {
    setFasetOrders((prev) => [order, ...prev]);
    showToast(`Order Lab Faset #${order.orderNumber} diterima di antrean`, 'success');
  };

  const updateFasetStatus = (id: string, status: FasetStatus, rejectReason?: string) => {
    setFasetOrders((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            status,
            rejectReason: rejectReason || f.rejectReason,
            completedAt: status === 'Selesai & Siap' ? new Date().toLocaleString('id-ID') : f.completedAt,
          };
        }
        return f;
      })
    );
    showToast(`Status Lab Faset diperbarui: ${status}`, 'info');
  };

  const deleteFasetOrder = (id: string) => {
    setFasetOrders((prev) => prev.filter((f) => f.id !== id));
    showToast('Order Lab Faset dihapus', 'warning');
  };

  // Sales
  const addSaleOrder = (order: SaleOrder) => {
    setSalesOrders((prev) => [order, ...prev]);

    // Deduct stock for sold items
    order.items.forEach((item) => {
      adjustStock(item.productId, -item.qty);
    });

    // Record cashflow
    const isEscrow = order.channel.includes('Shopee') || order.channel.includes('TikTok') || order.channel.includes('Tokopedia');
    const cashflowRecord: CashflowRecord = {
      id: 'cf-' + Date.now(),
      storeId: store.id,
      date: order.date,
      type: 'in',
      category: 'Penjualan Kacamata',
      amount: order.netRevenue,
      source: isEscrow ? 'Saldo Escrow Marketplace' : 'Kas Tunai Toko',
      description: `Penjualan ${order.channel} (${order.invoiceNo}) - ${order.customerName}`
    };
    setCashflow((prev) => [cashflowRecord, ...prev]);

    // Update store balances
    if (isEscrow) {
      updateStore({ escrowBalance: store.escrowBalance + order.netRevenue });
    } else {
      updateStore({ cashOnHand: store.cashOnHand + order.netRevenue });
    }

    showToast(`Penjualan berhasil dicatat! Omzet kotor: Rp ${order.grossAmount.toLocaleString('id-ID')}`, 'success');
  };

  const deleteSaleOrder = (id: string) => {
    setSalesOrders((prev) => prev.filter((s) => s.id !== id));
    showToast('Transaksi penjualan dihapus', 'warning');
  };

  // Attendance
  const addAttendance = (record: AttendanceRecord) => {
    setAttendance((prev) => [record, ...prev]);
    showToast(`Absensi ${record.status} tersimpan (${record.totalHours} jam)`, 'success');
  };

  const updateAttendance = (record: AttendanceRecord) => {
    setAttendance((prev) => prev.map((a) => (a.id === record.id ? record : a)));
    showToast('Data absensi diperbarui', 'success');
  };

  const clockIn = (employeeId: string, shift?: ShiftType) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15);
    const lateMinutes = isLate ? (now.getHours() - 9) * 60 + now.getMinutes() : 0;

    const record: AttendanceRecord = {
      id: 'att-' + Date.now(),
      employeeId,
      storeId: store.id,
      date: dateStr,
      clockIn: timeStr,
      clockOut: '',
      checkInTime: timeStr,
      checkOutTime: '',
      totalHours: 6,
      status: isLate ? 'Terlambat' : 'Hadir',
      lateMinutes,
      shift: shift || 'Shift Pagi (09:00 - 15:00)',
      notes: isLate ? `Terlambat ${lateMinutes} menit` : 'Masuk tepat waktu'
    };
    addAttendance(record);
  };

  const clockOut = (attendanceId: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setAttendance((prev) =>
      prev.map((a) => {
        if (a.id === attendanceId) {
          return {
            ...a,
            clockOut: timeStr,
            checkOutTime: timeStr,
            totalHours: 6,
          };
        }
        return a;
      })
    );
    showToast('Clock-out berhasil dicatat', 'success');
  };

  // Ad Spend
  const addAdSpend = (record: AdSpendRecord) => {
    setAdSpend((prev) => [record, ...prev]);
    const totalCost = record.adBudget + record.liveCoinSaweran;
    // Add to cashflow
    setCashflow((prev) => [
      {
        id: 'cf-ad-' + Date.now(),
        storeId: store.id,
        date: record.date,
        type: 'out',
        category: 'Iklan & Koin Live',
        amount: totalCost,
        source: 'Rekening Bank',
        description: `Biaya Iklan & Saweran Live ${record.platform}`
      },
      ...prev
    ]);
    showToast(`Biaya iklan ${record.platform} dicatat. ROAS: ${record.roas.toFixed(2)}x`, 'success');
  };

  // Returns
  const addReturn = (record: ReturnRecord) => {
    setReturns((prev) => [record, ...prev]);
    showToast(`Pengembalian barang (${record.returnReason}) dicatat`, 'warning');
  };

  const updateReturnStatus = (id: string, status: 'Diproses' | 'Selesai') => {
    setReturns((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    showToast(`Status retur diperbarui: ${status}`, 'info');
  };

  // Cashflow
  const addCashflow = (record: CashflowRecord) => {
    setCashflow((prev) => [record, ...prev]);
    if (record.type === 'in') {
      if (record.source === 'Kas Tunai Toko') {
        updateStore({ cashOnHand: store.cashOnHand + record.amount });
      } else if (record.source === 'Saldo Escrow Marketplace') {
        updateStore({ escrowBalance: store.escrowBalance + record.amount });
      }
    } else {
      if (record.source === 'Kas Tunai Toko') {
        updateStore({ cashOnHand: Math.max(0, store.cashOnHand - record.amount) });
      } else if (record.source === 'Saldo Escrow Marketplace') {
        updateStore({ escrowBalance: Math.max(0, store.escrowBalance - record.amount) });
      }
    }
    showToast(`Arus kas ${record.type === 'in' ? 'Masuk' : 'Keluar'} Rp ${record.amount.toLocaleString('id-ID')} dicatat`, 'success');
  };

  const deleteCashflow = (id: string) => {
    setCashflow((prev) => prev.filter((c) => c.id !== id));
    showToast('Catatan arus kas dihapus', 'warning');
  };

  const resetDataToDefault = () => {
    setAllStores([INITIAL_STORE]);
    setActiveStoreId(INITIAL_STORE.id);
    setEmployees(INITIAL_EMPLOYEES);
    setCurrentUserId(INITIAL_EMPLOYEES[0].id);
    setCurrentRole('owner');
    setProducts(INITIAL_PRODUCTS);
    setFasetOrders(INITIAL_FASET_ORDERS);
    setSalesOrders(INITIAL_SALES_ORDERS);
    setAttendance(INITIAL_ATTENDANCE);
    setAdSpend(INITIAL_AD_SPEND);
    setReturns(INITIAL_RETURNS);
    setCashflow(INITIAL_CASHFLOW);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Semua data berhasil direset ke sampel default toko optik', 'info');
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
        currentRole,
        setCurrentRole,
        switchUser,
        isAuthenticated,
        login,
        loginWithCredentials,
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
        salesOrders,
        addSaleOrder,
        deleteSaleOrder,
        attendance,
        addAttendance,
        updateAttendance,
        clockIn,
        clockOut,
        adSpend,
        addAdSpend,
        returns,
        addReturn,
        updateReturnStatus,
        cashflow,
        addCashflow,
        deleteCashflow,
        theme,
        setTheme: setThemeState,
        isDark,
        setIsDark: setIsDarkState,
        isPwaModalOpen,
        setIsPwaModalOpen,
        openPwaModal,
        toasts,
        showToast,
        dismissToast,
        resetDataToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
