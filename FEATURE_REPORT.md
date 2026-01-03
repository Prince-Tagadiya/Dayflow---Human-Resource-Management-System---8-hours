# Dayflow HRMS - Complete Feature Report

## 📋 Executive Summary

**Dayflow** is a modern, intelligent Human Resource Management System (HRMS) built with React, TypeScript, and Firebase. It provides a comprehensive solution for managing employees, attendance, leave requests, and payroll with role-based access for HR Administrators and Employees.

---

## 🏗️ Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 19 + TypeScript |
| **Styling** | TailwindCSS 4 |
| **Backend** | Firebase (Firestore, Auth, Functions) |
| **Build Tool** | Vite 7 |
| **Form Handling** | React Hook Form + Zod Validation |
| **Icons** | Lucide React |
| **PDF Generation** | jsPDF + html2canvas |
| **Date Utilities** | date-fns |

---

## 🔐 Authentication & Security

### 1. Role-Based Access Control (RBAC)
- **Two Roles**: `admin` (HR) and `employee`
- **Protected Routes**: Guards prevent unauthorized access
- **Firebase Custom Claims**: Secure role verification

### 2. Authentication Flow
| Feature | Description |
|---------|-------------|
| **Login** | Email/Employee ID + Password |
| **Employee Activation** | New employees activate via `/activate` with their generated ID |
| **Password Reset** | Forgot password flow via email |
| **Session Management** | Automatic token refresh |

### 3. Employee ID Generation
- **Format**: `OI` + `[First 2 chars of First Name]` + `[First 2 chars of Last Name]` + `[Year]` + `[4-digit serial]`
- **Example**: `OIPRSH20240001` for Prince Sharma joining in 2024
- **Atomic Counter**: Uses Firestore transactions to ensure unique IDs

---

## 👤 User Roles & Dashboards

### HR Admin Dashboard (`/dashboard/hr`)

#### Navigation Sidebar
- Dashboard (Overview)
- All Employees (Directory)
- Attendance
- Leaves (Management)
- Payroll

#### Dashboard Features

| Feature | Description |
|---------|-------------|
| **Stats Cards** | Total employees, Present today, On leave, Pending requests |
| **Leave Requests Panel** | Quick approve/reject with one-click actions |
| **Pending Approvals Table** | Detailed view of all pending leave requests |
| **Quick Actions** | Add new employee button |

### Employee Dashboard (`/dashboard/employee`)

#### Navigation Sidebar
- Dashboard
- Profile
- Attendance
- Leaves
- Payroll

#### Dashboard Features

| Feature | Description |
|---------|-------------|
| **Greeting Header** | Personalized greeting with current date |
| **Clock In/Out Controls** | Header buttons with real-time sync |
| **Attendance Status Card** | Current status with shift times |
| **Leave Balance Cards** | Casual, Sick, Privilege leave remaining |
| **Request Status Table** | Recent leave requests and their status |
| **Profile Card** | Quick view with department/designation |
| **Upcoming Holiday** | Next company holiday display |
| **Activity Timeline** | Real-time activity feed |

---

## 👥 Employee Management

### Employee Directory View
- **Grid Layout**: Card-based employee display
- **Search**: Filter by name, email, designation
- **Status Filters**: All, Present, On Leave, Absent tabs
- **Status Indicators**:
  - 🟢 Green dot: Present
  - 🟡 Yellow dot: Absent  
  - ✈️ Airplane icon: On Leave

### Create New Employee Modal
| Field | Validation |
|-------|------------|
| First Name | Min 2 characters |
| Last Name | Min 2 characters |
| Email | Valid email format |
| Phone Number | Min 10 digits |
| Department | Required selection |
| Designation | Required |
| Year of Joining | 2000 - Current year |
| CTC (Optional) | Number |

### Employee Detail View (Admin)

#### Tabs Available
1. **Overview** - Profile summary with completion percentage
2. **Personal Info** - Editable personal details
3. **Attendance** - Individual attendance history
4. **Leaves** - Leave balance and history
5. **Salary** - CTC breakdown and structure
6. **Documents** - Document management (placeholder)

#### Profile Fields Managed
- Personal: Name, Gender, DOB, Phone, Address, City, State, Zip
- Professional: Department, Designation, Employee ID, Date of Joining
- Financial: CTC, Salary Structure

---

## ⏰ Attendance Management

### For Employees

#### Clock In/Out System
- **Time Simulation**: Select custom datetime for demo purposes
- **Real-time Updates**: Firestore onSnapshot listeners
- **Status Tracking**: `clocked-in` or `clocked-out`
- **Session Detection**: Prevents duplicate clock-ins

#### Clock Out Summary Modal
- Total work duration
- Check-in and Check-out times
- Late arrival indicator (>9:15 AM)

#### Attendance History View
- **Monthly Calendar View**: Visual attendance calendar
- **Stats Summary**: Present, Absent, Late counts
- **Detailed Records**: Per-day breakdown with times
- **Status Color Coding**:
  - Green: Present
  - Yellow: Absent
  - Purple: On Leave
  - Orange: Late

### For HR Admin

#### Attendance Overview
- **Date Filter**: View attendance for specific date
- **Status Summary Cards**: Present, Absent, On Leave counts
- **Employee Attendance Table**: All employees with status
- **Per-Employee Detail**: Click to view individual history

---

## 🏖️ Leave Management

### Leave Types
| Type | Default Balance |
|------|-----------------|
| Casual Leave | 12 days/year |
| Sick Leave | 10 days/year |
| Privilege/Earned Leave | 20 days/year |
| Unpaid Leave | Unlimited |

### Employee Leave Application

#### Apply Leave Form
- Leave type selection (radio cards)
- Start date and End date pickers
- Automatic duration calculation
- Reason/Remarks text area (250 char limit)
- Submit with toast notification

#### Leave Balance Cards
- Visual progress bars
- Days taken vs total available
- Real-time balance updates

### HR Leave Management

#### Pending Requests Panel
- Employee name with initials avatar
- Leave type and duration
- Quick Approve/Reject buttons
- Reason preview

#### Approval Actions
- One-click approve/reject
- Admin comments (optional)
- Automatic status update
- Real-time notification to employee

---

## 💰 Payroll System

### Salary Structure (Indian Format)

#### Earnings
| Component | Calculation |
|-----------|-------------|
| Basic Pay | 40% of CTC |
| HRA | 50% of Basic |
| Standard Allowance | 40% of Basic |
| Performance Bonus | Variable |
| LTA | Fixed |
| Fixed Allowance | Balancing figure |

#### Deductions
| Component | Calculation |
|-----------|-------------|
| Provident Fund (PF) | 12% of Basic |
| Professional Tax (PT) | Flat ₹200/month |

### Payroll Page Features

#### For Employees
- Current month salary breakdown
- Earnings vs Deductions visualization
- Net salary calculation
- **Download Salary Slip** (PDF)

#### For HR Admin
- Set/Edit employee CTC
- Auto-calculate all components
- Save salary structure
- View past payroll records

### PDF Salary Slip Generation
- Uses jsPDF + html2canvas
- Company header with logo
- Employee details section
- Earnings breakdown table
- Deductions breakdown table
- Net salary footer
- Professional formatting

---

## 👤 Profile Management

### Employee Profile Page

#### Editable Fields
- First Name & Last Name
- Phone Number
- Gender (Male/Female/Other)
- Date of Birth
- Address, City, State, Zip Code

#### Read-Only Fields (System Controlled)
- Employee ID
- Email
- Department
- Designation
- Date of Joining

#### Profile Completion Indicator
- Percentage bar showing profile completeness
- Visual progress indicator

---

## 🔔 Notification System

### Employee Notifications
- **Leave Status Updates**: Approved/Rejected notifications
- **Bell Icon Badge**: Unread count indicator
- **Notification Panel**: Slide-out panel
- **Clear All/Individual**: Remove notifications
- **Persist Cleared**: LocalStorage for cleared IDs

### Toast Notifications
- Success/Error types
- Auto-dismiss after 4 seconds
- Manual dismiss option
- Animated entrance

---

## 🎨 UI/UX Features

### Design System
- **Clean Modern Design**: Slate/Blue color palette
- **Glassmorphism**: Backdrop blur effects
- **Micro-animations**: Hover effects, transitions
- **Responsive Layout**: Mobile-first design
- **Dark/Light Aware**: Consistent theming

### Components
- Stats Cards with trends
- Status Badges (color-coded)
- Profile Avatars with initials
- Progress Bars
- Modal Dialogs
- Toast Notifications
- Calendar Views
- Data Tables

---

## 🗄️ Database Schema (Firestore)

### Collections

#### `users`
```typescript
{
  uid: string;
  email: string;
  role: 'admin' | 'employee';
  displayName: string;
}
```

#### `employees`
```typescript
{
  id: string;              // Employee ID (e.g., OIPRSH20240001)
  uid: string;             // Firebase Auth UID
  firstName: string;
  lastName: string;
  personalEmail: string;
  department: string;
  designation: string;
  yearOfJoining: number;
  phoneNumber: string;
  companyCode: string;
  dateOfJoining: string;   // ISO Date
  isActive: boolean;
  isRegistered: boolean;   // Has activated account
  role: string;
  ctc: number;
  // Personal info fields...
}
```

#### `attendance`
```typescript
{
  id: string;
  employeeId: string;
  date: string;            // YYYY-MM-DD
  checkIn: string | null;  // ISO Timestamp
  checkOut: string | null;
  status: 'present' | 'absent' | 'half-day' | 'on-leave' | 'late';
  isLocked: boolean;
}
```

#### `timeOffRequests`
```typescript
{
  id: string;
  employeeId: string;
  type: 'sick' | 'casual' | 'earned' | 'unpaid';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approverId: string;
  reviewedAt: string;
  appliedAt: string;
  adminComments: string;
  createdAt: string;
}
```

#### `salaryStructures`
```typescript
{
  id: string;
  employeeId: string;
  basePay: number;
  hra: number;
  specialAllowances: number;
  pfDeduction: number;
  taxDeduction: number;
  netPay: number;
  currency: string;
  effectiveDate: string;
}
```

#### `payroll`
```typescript
{
  id: string;
  employeeId: string;
  month: string;           // YYYY-MM
  totalDays: number;
  payableDays: number;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  isDisbursed: boolean;
  disbursedAt: string;
  generatedBy: string;
}
```

#### `counters`
```typescript
{
  id: string;              // e.g., employee_serial_2024
  current: number;         // Current serial number
}
```

---

## 🔒 Security Rules

### Firestore Rules Summary

| Collection | Read | Write |
|------------|------|-------|
| `users` | Owner or Admin | System only |
| `employees` | Self or Admin | Admin only |
| `salaryStructures` | Admin only | Admin only |
| `attendance` | Self or Admin | Admin only |
| `timeOffRequests` | Self or Admin | Create: Self, Update: Admin |
| `payroll` | Self or Admin | Admin only |
| `auditLogs` | Admin only | System only |

---

## 🧪 Development Tools

### Setup Admin Page (`/setup`)
- Create Master Admin account
- **Seed Database** button for fake data
- Generates 25 employees with Indian names
- Creates attendance, leaves, salary records

### Fake Data Seeding
- Clears old data before seeding
- Indian names (60+ first names, 50+ last names)
- Realistic job titles and departments
- 60% Present, 20% Absent, 20% On Leave distribution
- 14 days of historical attendance
- 2 months of payroll history

---

## 📱 Responsive Design

| Screen Size | Layout |
|-------------|--------|
| Mobile (<640px) | Collapsible sidebar, stacked cards |
| Tablet (640-1024px) | 2-column grid, partial sidebar |
| Desktop (>1024px) | Full sidebar, 3-4 column grid |

---

## 🚀 Routes & Navigation

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | Login form |
| `/activate` | Public | Employee activation |
| `/forgot-password` | Public | Password reset |
| `/setup` | Public | Admin setup (dev) |
| `/dashboard/hr` | Admin only | HR Dashboard |
| `/dashboard/employee` | Employee only | Employee Dashboard |

---

## 📊 Real-time Features

- **Firestore onSnapshot**: Live updates for attendance and leaves
- **Optimistic UI**: Immediate UI feedback
- **Auto-refresh**: Stats refresh on data change
- **WebSocket-like**: Firebase handles connection

---

## 🛠️ Services Architecture

### AuthService
- `login()` - Email/ID + Password login
- `register()` - Create new auth user
- `logout()` - Sign out
- `getCurrentUser()` - Get current auth state
- `refreshToken()` - Force token refresh

### AdminService
- `createEmployee()` - Create new employee with generated ID
- `updateEmployee()` - Update employee data
- `getAllEmployees()` - Fetch all employees
- `getAllAttendance()` - Fetch attendance records
- `getAllTimeOffRequests()` - Fetch all leave requests
- `updateTimeOffRequestStatus()` - Approve/Reject leave
- `getSalaryStructure()` - Get employee salary
- `updateSalaryStructure()` - Update salary
- `getAllPayrollRecords()` - Get payroll history

### EmployeeService
- `getProfileByUid()` - Get profile by auth UID
- `getProfile()` - Get profile by employee ID
- `updateProfile()` - Update own profile
- `subscribeToAttendance()` - Real-time attendance
- `getAttendanceByMonth()` - Monthly attendance
- `getTodayAttendance()` - Today's record
- `clockIn()` - Record check-in
- `clockOut()` - Record check-out
- `applyLeave()` - Submit leave request
- `subscribeToLeaveRequests()` - Real-time leaves
- `getLeaveBalances()` - Calculate balances

### PayrollService
- `calculateSalaryBreakdown()` - Compute salary components
- `saveEmployeeSalary()` - Persist salary structure

---

## 📈 Performance Optimizations

- **Lazy Loading**: Components loaded on demand
- **Query Limits**: Firestore queries limited to prevent overload
- **Debouncing**: Form inputs debounced
- **Memoization**: useMemo for expensive calculations
- **Indexes**: Composite indexes for Firestore queries

---

## 🎯 Key Highlights

1. **Complete HRMS Solution** - All core HR functions in one app
2. **Real-time Updates** - Firebase onSnapshot for live data
3. **Role-based Security** - Admin vs Employee access control
4. **Indian Payroll Format** - PF, PT, HRA calculations
5. **PDF Salary Slips** - Downloadable pay stubs
6. **Modern UI/UX** - Clean, responsive design
7. **Easy Setup** - One-click admin creation and data seeding
8. **Extensible Architecture** - Clean service layer pattern

---

*Report Generated: January 3, 2026*
*Version: 1.0.0*
*Platform: Dayflow HRMS*
