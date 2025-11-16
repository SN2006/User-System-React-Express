import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">User Management System</h1>
        {user && (
          <div className="header-user">
            <span className="user-info">
              <span className="username">{user.username}</span>
              <span className={`role-badge role-${user.role}`}>{user.role}</span>
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

