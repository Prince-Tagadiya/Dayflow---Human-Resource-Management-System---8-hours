import { useNavigate } from 'react-router-dom';

// ... inside AdminDashboard
  const navigate = useNavigate();
  // ...
  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/login');
  };
// ...
