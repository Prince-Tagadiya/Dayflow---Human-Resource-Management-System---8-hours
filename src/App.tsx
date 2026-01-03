import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { Login } from './modules/auth/Login';
import { AdminDashboard } from './modules/admin/AdminDashboard';
import { EmployeeDashboard } from './modules/employee/EmployeeDashboard';
import { SetupAdmin } from './modules/admin/SetupAdmin';
import { AdminGuard, EmployeeGuard } from './guards/RoleGuard';
import { LandingPage } from './modules/landing/LandingPage';
import { Activate } from './modules/auth/Activate';
import { ForgotPassword } from './modules/auth/ForgotPassword';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/activate" element={<Activate />} />
          <Route path="/signup" element={<Navigate to="/activate" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/setup" element={<SetupAdmin />} />

          <Route path="/dashboard/hr" element={
            <AdminGuard>
              <AdminDashboard />
            </AdminGuard>
          } />

          <Route path="/dashboard/employee" element={
            <EmployeeGuard>
              <EmployeeDashboard />
            </EmployeeGuard>
          } />

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
