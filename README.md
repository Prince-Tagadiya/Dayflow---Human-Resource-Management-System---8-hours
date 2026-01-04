<div align="center">

# ⏰ Dayflow HRMS

### **Intelligent Human Resource Management System**

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" alt="Version"/>
  <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge" alt="Status"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-7.0-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/TailwindCSS-4.0-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Firebase-11.0-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase"/>
</p>

<br/>

> 🚀 **A full-stack, production-ready HRMS designed to digitize and automate core HR operations with real-time attendance, leave management, payroll visibility, and role-based workflows.**

<br/>

[✨ Features](#-features) • [🛠 Tech Stack](#-technology-stack) • [🚀 Quick Start](#-quick-start) • [📸 Screenshots](#-screenshots) • [📄 License](#-license)

</div>

---

## 🎯 Overview

**Dayflow HRMS** is a comprehensive enterprise-grade HR platform that eliminates spreadsheet dependency and manual coordination. Built with modern web technologies and powered by Firebase's real-time infrastructure, it delivers a seamless experience for both HR administrators and employees.

<table>
<tr>
<td width="50%">

### 🎭 For HR Administrators
- 📊 Company-wide analytics dashboard
- 👥 Complete employee directory management
- ✅ One-click leave approval/rejection
- 💰 Salary structure configuration
- 📈 Real-time attendance monitoring
- 🔐 Role-based access control

</td>
<td width="50%">

### 👤 For Employees
- ⏱️ Clock In/Out with time simulation
- 📅 Leave application & tracking
- 💵 Payroll visibility & PDF slips
- 📊 Personal attendance history
- 🔔 Real-time notifications
- 👤 Profile self-service

</td>
</tr>
</table>

---

## ✨ Features

### 🔐 Authentication & Security
> **Enterprise-grade security with Firebase Auth + Custom Claims**

| Feature | Description |
|---------|-------------|
| 🔑 **Dual Login** | Login via Email or Employee ID |
| 🆔 **Smart ID Generation** | Format: `OI` + `First_Name(2)` + `Last_Name(2)` + `Year` + `Serial` → `OIPRSH20240001` |
| 🛡️ **RBAC** | Strict role-based access (Admin/Employee) |
| 🔒 **Firestore Rules** | Server-side security enforcement |
| ✉️ **Email Activation** | Self-service account activation flow |

### 📊 Attendance Management
> **Real-time attendance tracking with late detection**

- ⏰ **Clock In/Out** — One-click with timestamp
- 🕐 **Time Simulation** — Set custom times for demo
- 📱 **Live Status** — Real-time sync across devices
- ⚠️ **Late Detection** — Auto-flag arrivals after 9:15 AM
- 📅 **Calendar View** — Monthly attendance overview
- 📈 **Statistics** — Present, absent, late, half-day counts

### 🏖️ Leave Management
> **Complete leave lifecycle from application to approval**

| Leave Type | Annual Quota |
|------------|-------------|
| 🌴 Casual Leave | 12 days |
| 🤒 Sick Leave | 10 days |
| ⭐ Privilege/Earned | 20 days |
| 📝 Unpaid Leave | Unlimited |

- 📝 **Easy Application** — Date picker + reason input
- 📊 **Balance Tracking** — Real-time balance updates
- ✅ **Quick Approval** — One-click approve/reject for admins
- 🔔 **Notifications** — Instant status updates

### 💰 Payroll System (Indian Compliance)
> **Complete Indian salary structure with statutory deductions**

```
┌─────────────────────────────────────────────────────────────┐
│                    EARNINGS                                  │
├─────────────────────────────────────────────────────────────┤
│  Basic Pay ............ 40% of CTC                          │
│  HRA .................. 50% of Basic                        │
│  Special Allowance .... Variable                            │
│  LTA .................. ₹1,667/month                        │
│  Performance Bonus .... 8.33% of Basic                      │
├─────────────────────────────────────────────────────────────┤
│                    DEDUCTIONS                                │
├─────────────────────────────────────────────────────────────┤
│  Provident Fund ....... 12% of Basic                        │
│  Professional Tax ..... ₹200/month                          │
└─────────────────────────────────────────────────────────────┘
```

- 📄 **PDF Salary Slip** — Professional downloadable format
- 💵 **CTC Configuration** — Admin-configurable per employee
- 📊 **Payroll History** — Month-wise records

### 🔔 Notification System
> **Stay informed with real-time alerts**

- 🔔 **In-App Bell** — Unread badge indicator
- ✅ **Toast Popups** — Success/error feedback
- 📧 **Email Activation** — Welcome email with credentials
- 💾 **Persistent State** — Cleared notifications remembered

### 🎨 User Experience
> **Modern, responsive, and delightful UI**

- 🌓 **Clean Design** — Minimal, professional interface
- 📱 **Fully Responsive** — Mobile-first approach
- ✨ **Micro-animations** — Smooth transitions
- 🎭 **Glassmorphism** — Modern visual effects
- ⚡ **Instant Feedback** — Loading states & skeletons

---

## 🛠 Technology Stack

<div align="center">

### Frontend

<p>
  <img src="https://skillicons.dev/icons?i=react,typescript,vite,tailwind" alt="Frontend Stack"/>
</p>

| Technology | Version | Purpose |
|------------|---------|---------|
| ![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=black) | 19.0 | UI Framework |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | 5.0 | Type Safety |
| ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | 7.0 | Build Tool |
| ![TailwindCSS](https://img.shields.io/badge/-TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) | 4.0 | Styling |
| ![Lucide](https://img.shields.io/badge/-Lucide-F56565?style=flat-square&logo=lucide&logoColor=white) | Latest | Icons |

### Backend & Infrastructure

<p>
  <img src="https://skillicons.dev/icons?i=firebase" alt="Backend Stack"/>
</p>

| Technology | Purpose |
|------------|---------|
| ![Firebase Auth](https://img.shields.io/badge/-Firebase%20Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black) | Authentication |
| ![Firestore](https://img.shields.io/badge/-Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black) | Real-time Database |
| ![Firebase Functions](https://img.shields.io/badge/-Cloud%20Functions-FFCA28?style=flat-square&logo=firebase&logoColor=black) | Serverless Backend |

### Libraries & Tools

| Library | Purpose |
|---------|---------|
| `react-hook-form` | Form Management |
| `zod` | Schema Validation |
| `date-fns` | Date Utilities |
| `jspdf` + `html2canvas` | PDF Generation |
| `react-router-dom` | Routing |

</div>

---

## 🚀 Quick Start

### Prerequisites

```bash
node >= 18.0.0
npm >= 9.0.0
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Prince-Tagadiya/Dayflow---Human-Resource-Management-System---8-hours.git

# 2. Navigate to directory
cd Dayflow---Human-Resource-Management-System---8-hours

# 3. Install dependencies
npm install

# 4. Configure environment
cp .env.example .env
# Edit .env with your Firebase credentials

# 5. Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Demo Setup

1. Navigate to `/setup` after first run
2. Create master admin account
3. Click "Seed Fake Database" for demo data
4. Login with seeded credentials

---

## 📁 Project Structure

```
📦 Dayflow HRMS
├── 📂 src
│   ├── 📂 modules
│   │   ├── 📂 admin          # HR Admin Dashboard & Components
│   │   ├── 📂 auth           # Login, Activate, Auth Flows
│   │   ├── 📂 employee       # Employee Dashboard & Components
│   │   └── 📂 payroll        # Salary & Payslip Components
│   ├── 📂 services           # Firebase Service Layer
│   ├── 📂 guards             # Route Protection (RBAC)
│   ├── 📂 types              # TypeScript Interfaces
│   ├── 📂 firebase           # Firebase Configuration
│   └── 📂 utils              # Helpers & Utilities
├── 📄 firestore.rules        # Security Rules
├── 📄 package.json
└── 📄 vite.config.ts
```

---

## 🗄️ Database Schema

```
📦 Firestore Collections
├── 📁 users              # Auth user mapping
├── 📁 employees          # Employee profiles
├── 📁 attendance         # Clock in/out records
├── 📁 timeOffRequests    # Leave applications
├── 📁 salaryStructures   # CTC configurations
├── 📁 payroll            # Monthly payroll records
├── 📁 counters           # Atomic ID generation
└── 📁 auditLogs          # Admin activity logs
```

---

## 🔒 Security Model

| Collection | Read | Write |
|------------|------|-------|
| `users` | Self / Admin | Self |
| `employees` | Admin | Admin |
| `attendance` | Self / Admin | Self / Admin |
| `timeOffRequests` | Self / Admin | Create: Self, Update: Admin |
| `payroll` | Self / Admin | Admin |

---

## 📸 Screenshots

<div align="center">

> *Screenshots coming soon...*

</div>

---

## 🎯 Roadmap

- [ ] 📧 Email notifications for leave status
- [ ] 📊 Advanced analytics dashboard
- [ ] 📱 Mobile app (React Native)
- [ ] 🌐 Multi-tenant support
- [ ] 📄 Document management
- [ ] 🎓 Training module

---

## � Team

<div align="center">

<table>
<tr>
<td align="center">
<a href="https://github.com/Prince-Tagadiya">
<img src="https://github.com/Prince-Tagadiya.png" width="100px;" alt="Prince Tagadiya"/><br />
<sub><b>Prince Tagadiya</b></sub>
</a><br />
<a href="https://github.com/Prince-Tagadiya">
<img src="https://img.shields.io/badge/-Prince--Tagadiya-181717?style=flat-square&logo=github" alt="GitHub"/>
</a>
</td>
<td align="center">
<a href="https://github.com/CHAUHANRUDRA24">
<img src="https://github.com/CHAUHANRUDRA24.png" width="100px;" alt="Rudra Chauhan"/><br />
<sub><b>Rudra Chauhan</b></sub>
</a><br />
<a href="https://github.com/CHAUHANRUDRA24">
<img src="https://img.shields.io/badge/-CHAUHANRUDRA24-181717?style=flat-square&logo=github" alt="GitHub"/>
</a>
</td>
<td align="center">
<a href="https://github.com/Khushi-S-Belani">
<img src="https://github.com/Khushi-S-Belani.png" width="100px;" alt="Khushi Belani"/><br />
<sub><b>Khushi Belani</b></sub>
</a><br />
<a href="https://github.com/Khushi-S-Belani">
<img src="https://img.shields.io/badge/-Khushi--S--Belani-181717?style=flat-square&logo=github" alt="GitHub"/>
</a>
</td>
<td align="center">
<a href="https://github.com/NisargPatel3108">
<img src="https://github.com/NisargPatel3108.png" width="100px;" alt="Nisarg Patel"/><br />
<sub><b>Nisarg Patel</b></sub>
</a><br />
<a href="https://github.com/NisargPatel3108">
<img src="https://img.shields.io/badge/-NisargPatel3108-181717?style=flat-square&logo=github" alt="GitHub"/>
</a>
</td>
</tr>
</table>

</div>

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### ⭐ Star this repo if you found it helpful!

<br/>

**Built with ❤️ by Team Dayflow**

<br/>

<img src="https://skillicons.dev/icons?i=react,typescript,firebase,tailwind,vite" alt="Tech Stack"/>

</div>
