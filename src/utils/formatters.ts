import { Employee, AttendanceRecord, SaleOrder, FasetLabOrder } from '../types';

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export function formatNumber(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  return val.toLocaleString('id-ID');
}

export function parseRupiahInput(value: string): number {
  const clean = value.replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
}

export interface PayrollCalculation {
  basePay: number;
  hoursWorked: number;
  daysPresent: number;
  frameIncentive: number;
  framesSold: number;
  packageIncentive: number;
  packagesSold: number;
  fasetIncentive: number;
  lensesFaseted: number;
  tierBonus: number;
  dualRoleBonus: number;
  monthlyOmzetBonus: number;
  fixedAllowance: number;
  lateDeduction: number;
  grossSalary: number;
  netSalary: number;
}

export function calculateEmployeePayroll(
  employee: Employee,
  attendanceRecords: AttendanceRecord[],
  salesOrders: SaleOrder[],
  fasetOrders: FasetLabOrder[],
  monthlyStoreOmzet: number,
  storeNetProfit: number = 0
): PayrollCalculation {
  const scheme = employee.salaryScheme;

  // Filter attendance for this employee
  const empAtt = attendanceRecords.filter((a) => a.employeeId === employee.id);
  const daysPresent = empAtt.filter((a) => a.status === 'Hadir').length;
  const hoursWorked = empAtt
    .filter((a) => a.status === 'Hadir')
    .reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
  const totalLateMinutes = empAtt.reduce((acc, curr) => acc + (curr.lateMinutes || 0), 0);

  // Base Pay
  let basePay = 0;
  if (scheme.baseType === 'hourly') {
    basePay = hoursWorked * (scheme.baseRate || 0);
  } else {
    basePay = daysPresent * (scheme.baseRate || 0);
  }

  // Sales attribution
  // Attributed if employee is host OR admin on the order
  const empSales = salesOrders.filter(
    (o) => o.hostEmployeeId === employee.id || o.adminEmployeeId === employee.id
  );

  let framesSold = 0;
  let packagesSold = 0;

  empSales.forEach((order) => {
    order.items.forEach((item) => {
      if (item.isBundle || order.orderFormat === 'Bundling Resep') {
        packagesSold += item.qty;
      } else {
        framesSold += item.qty;
      }
    });
  });

  const frameIncentive = framesSold * (scheme.perFrameSold || 0);
  const packageIncentive = packagesSold * (scheme.perPackageSold || 0);

  // Faset Lab attribution (Teknisi Lab Lensa)
  const empFaset = fasetOrders.filter(
    (f) => f.technicianId === employee.id && f.status === 'Selesai & Siap'
  );
  const lensesFaseted = empFaset.length;
  const fasetIncentive = lensesFaseted * (scheme.perLensFaset || 0);

  // Tier Rule Target
  let tierBonus = 0;
  const totalQualifyingUnits = packagesSold + (employee.roles.includes('faset') ? lensesFaseted : 0);
  if (scheme.tierRule?.enabled && scheme.tierRule.thresholdUnits > 0) {
    if (totalQualifyingUnits > scheme.tierRule.thresholdUnits) {
      if (scheme.tierRule.mode === 'excess_only') {
        tierBonus = (totalQualifyingUnits - scheme.tierRule.thresholdUnits) * scheme.tierRule.bonusRate;
      } else {
        // all_units
        tierBonus = totalQualifyingUnits * scheme.tierRule.bonusRate;
      }
    }
  }

  // Dual Role Bonus
  let dualRoleBonus = 0;
  if (scheme.dualRoleBonus?.enabled && employee.roles.length > 1) {
    if (packagesSold >= scheme.dualRoleBonus.quotaUnits) {
      dualRoleBonus = packagesSold * scheme.dualRoleBonus.bonusPerUnit;
    }
  }

  // Monthly Omzet Bonus Toko
  let monthlyOmzetBonus = 0;
  if (scheme.monthlyOmzetBonus?.enabled && monthlyStoreOmzet >= scheme.monthlyOmzetBonus.targetOmzet) {
    if (scheme.monthlyOmzetBonus.type === 'percent_omzet') {
      monthlyOmzetBonus = (scheme.monthlyOmzetBonus.value / 100) * monthlyStoreOmzet;
    } else if (scheme.monthlyOmzetBonus.type === 'percent_net_profit') {
      monthlyOmzetBonus = (scheme.monthlyOmzetBonus.value / 100) * storeNetProfit;
    } else {
      // fixed_nominal
      monthlyOmzetBonus = scheme.monthlyOmzetBonus.value;
    }
  }

  // Deductions (e.g. late minutes: Rp 1.000 / menit keterlambatan)
  const lateDeduction = totalLateMinutes * 500;

  const fixedAllowance = scheme.fixedNominal || 0;

  const grossSalary =
    basePay +
    frameIncentive +
    packageIncentive +
    fasetIncentive +
    tierBonus +
    dualRoleBonus +
    monthlyOmzetBonus +
    fixedAllowance;

  const netSalary = Math.max(0, grossSalary - lateDeduction);

  return {
    basePay,
    hoursWorked,
    daysPresent,
    frameIncentive,
    framesSold,
    packageIncentive,
    packagesSold,
    fasetIncentive,
    lensesFaseted,
    tierBonus,
    dualRoleBonus,
    monthlyOmzetBonus,
    fixedAllowance,
    lateDeduction,
    grossSalary,
    netSalary
  };
}
