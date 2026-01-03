# Dayflow - Human Resource Management System

![Status](https://img.shields.io/badge/Status-Development-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Tech](https://img.shields.io/badge/Tech-React%20%7C%20TypeScript%20%7C%20Firebase-orange)

Dayflow is a modern, comprehensive Human Resource Management System (HRMS) built to streamline organizational processes. It features distinct dashboards for **Employees** and **Administrators**, handling everything from attendance tracking and leave management to payroll processing.

## 🚀 Key Features

### 👥 For Employees
- **Real-time Attendance**: Clock In/Out with live timer and location tracking simulation.
- **Attendance History**: View past attendance records with status indicators (Present, Late, Absent).
- **Leave Management**: Apply for leaves (Casual, Sick, Privilege) and track approval status real-time.
- **Payroll**: View salary details and download professional PDF payslips.
- **Profile Management**: View and update personal information.
- **Interactive Dashboard**: Quick stats, upcoming holidays, and recent activity feed.

### 🛠 For Administrators
- **Employee Management**: Onboard new employees, manage profiles, and assign roles.
- **Attendance Overview**: Monitor real-time attendance of all staff.
- **Leave Requests**: Approve or reject leave applications with notifications.
- **Payroll Management**: Process salaries and view financial summaries.
- **Analytics**: Visual insights into workforce data.

## 🛠️ Technology Stack

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend / Database**: [Firebase](https://firebase.google.com/) (Firestore, Auth, Storage)
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF Generation**: `jspdf` & `html2canvas`

## 📦 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Prince-Tagadiya/Dayflow---Human-Resource-Management-System---8-hours.git
   cd Dayflow---Human-Resource-Management-System---8-hours
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## 📸 Screenshots

*(Add screenshots of your dashboard here)*

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ by Prince Tagadiya
