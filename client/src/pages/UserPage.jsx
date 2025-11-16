import { useState, useEffect } from 'react';
import Header from '../components/Header';
import UserTable from '../components/UserTable';
import userService from '../services/userService';
import './RolePage.css';

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-page">
      <Header />
      <div className="page-content">
        <div className="page-header">
          <h2>User Dashboard</h2>
          <p className="page-description">View all users in the system</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        <UserTable users={users} loading={loading} />
      </div>
    </div>
  );
};

export default UserPage;

