import { useState, useEffect } from 'react';
import userService from '../services/userService';
import './UserStatistics.css';

const UserStatistics = ({ refreshTrigger }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, [refreshTrigger]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const data = await userService.getUserStatistics();
      setStatistics(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="statistics-loading">Loading statistics...</div>;
  }

  if (error) {
    return <div className="statistics-error">{error}</div>;
  }

  if (!statistics) {
    return null;
  }

  return (
    <div className="statistics-container">
      <h3>User Statistics</h3>
      <div className="statistics-cards">
        <div className="stat-card total">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.total}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="stat-card users">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.byRole.user}</div>
            <div className="stat-label">Regular Users</div>
          </div>
        </div>

        <div className="stat-card admins">
          <div className="stat-icon">🛡️</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.byRole.admin}</div>
            <div className="stat-label">Admins</div>
          </div>
        </div>

        <div className="stat-card superadmins">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.byRole.superadmin}</div>
            <div className="stat-label">Super Admins</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatistics;

