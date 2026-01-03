export type UserRole = 'admin' | 'employee';

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  employeeId: string;
  companyId: string;
}

export interface EmployeeProfile {
  id: string; // employeeId
  uid: string; // auth uid
  firstName: string;
  lastName: string;
  email: string;
  loginId: string; // System generated
  designation: string;
  department: string;
  dateOfJoining: string; // ISO Date
  isActive: boolean;
  companyCode?: string; // Custom Employee Code

  // Explicitly excluding salary data from this shared interface
}

export interface SalaryStructure {
  id: string;
  employeeId: string;
  basePay: number;
  hra: number;
  specialAllowances: number;
  pfDeduction: number;
  taxDeduction: number;
  netPay: number; // Computed?
  currency: string;
  effectiveDate: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // ISO Timestamp
  checkOut: string | null; // ISO Timestamp
  status: 'present' | 'absent' | 'half-day' | 'on-leave' | 'late';
  isLocked: boolean; // Locked after payroll generation
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  type: 'sick' | 'casual' | 'earned' | 'unpaid';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approverId?: string; // Admin UID
  reviewedAt?: string;
  adminComments?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string; // YYYY-MM
  totalDays: number;
  payableDays: number;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  isDisbursed: boolean;
  disbursedAt?: string;
  generatedBy: string; // Admin UID
}

export interface AuditLog {
  id: string;
  action: string;
  collection: string;
  documentId: string;
  performedBy: string; // UID
  timestamp: string;
  details: Record<string, any>;
}
