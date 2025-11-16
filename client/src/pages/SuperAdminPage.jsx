import { useState, useEffect } from 'react';
import Header from '../components/Header';
import UserTable from '../components/UserTable';
import userService from '../services/userService';
import './RolePage.css';

const SuperAdminPage = () => {
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

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      setSuccessMessage(`User role changed to ${newRole} successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change user role');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="role-page">
      <Header />
      <div className="page-content">
        <div className="page-header">
          <h2>Super Admin Dashboard</h2>
          <p className="page-description">Full access - Manage all users and change roles</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        <UserTable
          users={users}
          loading={loading}
          onDelete={handleDelete}
          onRoleChange={handleRoleChange}
        />
      </div>
    </div>
  );
};

export default SuperAdminPage;

