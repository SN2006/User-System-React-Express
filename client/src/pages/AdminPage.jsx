import { useState, useEffect } from 'react';
import Header from '../components/Header';
import UserTable from '../components/UserTable';
import userService from '../services/userService';
import './RolePage.css';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleDelete = async (userId) => {
    try {
      await userService.deleteUser(userId);
      setSuccessMessage('User deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="role-page">
      <Header />
      <div className="page-content">
        <div className="page-header">
          <h2>Admin Dashboard</h2>
          <p className="page-description">Manage users - View and delete user accounts</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        <UserTable
          users={users}
          loading={loading}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default AdminPage;

