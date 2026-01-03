import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { Login } from './modules/auth/Login';
import { AdminDashboard } from './modules/admin/AdminDashboard';
import { SetupAdmin } from './modules/admin/SetupAdmin';
import { AdminGuard, EmployeeGuard } from './guards/RoleGuard';
import { LandingPage } from './modules/landing/LandingPage';
import { Activate } from './modules/auth/Activate';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/activate" element={<Activate />} />
          <Route path="/setup" element={<SetupAdmin />} />
          
          <Route path="/dashboard/hr" element={
            <AdminGuard>
              <AdminDashboard />
            </AdminGuard>
          } />
          
          <Route path="/dashboard/employee" element={
            <EmployeeGuard>
              {/* Placeholder for Employee Dashboard - To be built */}
              <div className="p-8 text-center">
                 <h1 className="text-2xl font-bold">Employee Dashboard</h1>
                 <p>Welcome! Your secure portal is under construction.</p>
              </div>
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
