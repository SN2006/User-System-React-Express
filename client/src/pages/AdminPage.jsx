import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import UserTable from '../components/UserTable';
import UserStatistics from '../components/UserStatistics';
import UserSearch from '../components/UserSearch';
import AddUserForm from '../components/AddUserForm';
import userService from '../services/userService';
import { useThrottle } from '../hooks/useThrottle';
import './RolePage.css';

const AdminPage = () => {
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

  const handleDelete = useThrottle(performDelete, 1000);

  return (
    <div className="role-page">
      <Header />
      <div className="page-content">
        <div className="page-header">
          <h2>Admin Dashboard</h2>
          <p className="page-description">Manage users - View, add, and delete user accounts with AJAX</p>
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
        />
      </div>
    </div>
  );
};

export default AdminPage;

