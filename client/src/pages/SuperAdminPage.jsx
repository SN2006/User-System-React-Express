import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import UserTable from '../components/UserTable';
import UserStatistics from '../components/UserStatistics';
import UserSearch from '../components/UserSearch';
import AddUserForm from '../components/AddUserForm';
import userService from '../services/userService';
import { useThrottle } from '../hooks/useThrottle';
import './RolePage.css';

const SuperAdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [statisticsRefresh, setStatisticsRefresh] = useState(0);

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

  const handleSearch = async (query) => {
    try {
      setLoading(true);
      const data = await userService.searchUsers(query);
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAdded = () => {
    fetchUsers();
    setStatisticsRefresh(prev => prev + 1);
    setSuccessMessage('User added successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const performDelete = useCallback(async (userId) => {
    try {
      await userService.deleteUser(userId);
      setSuccessMessage('User deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchUsers();
      setStatisticsRefresh(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
      setTimeout(() => setError(''), 3000);
    }
  }, []);

  const performRoleChange = useCallback(async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      setSuccessMessage(`User role changed to ${newRole} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchUsers();
      setStatisticsRefresh(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change user role');
      setTimeout(() => setError(''), 3000);
    }
  }, []);

  const handleDelete = useThrottle(performDelete, 1000);
  const handleRoleChange = useThrottle(performRoleChange, 1000);

  return (
    <div className="role-page">
      <Header />
      <div className="page-content">
        <div className="page-header">
          <h2>Super Admin Dashboard</h2>
          <p className="page-description">Full access - Manage all users, change roles, and view statistics with AJAX</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <UserStatistics refreshTrigger={statisticsRefresh} />

        <AddUserForm onUserAdded={handleUserAdded} />

        <UserSearch onSearch={handleSearch} resultsCount={users.length} />

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

