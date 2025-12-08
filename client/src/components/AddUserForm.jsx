import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import './AddUserForm.css';

const AddUserForm = ({ onUserAdded }) => {
  const { user: currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await userService.createUser(formData);

      setSuccess(`User ${formData.username} created successfully!`);
      setFormData({ username: '', email: '', password: '', role: 'user' });

      setTimeout(() => {
        setSuccess('');
        setIsOpen(false);
      }, 2000);

      // Notify parent component to refresh data
      if (onUserAdded) {
        onUserAdded();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const canCreateAdmin = currentUser.role === 'superadmin';

  return (
    <div className="add-user-container">
      {!isOpen ? (
        <button className="btn-open-form" onClick={() => setIsOpen(true)}>
          ➕ Add New User
        </button>
      ) : (
        <div className="add-user-form-wrapper">
          <div className="form-header">
            <h3>Add New User</h3>
            <button className="btn-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <form onSubmit={handleSubmit} className="add-user-form">
            {error && <div className="form-error">{error}</div>}
            {success && <div className="form-success">{success}</div>}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading || !canCreateAdmin}
              >
                <option value="user">User</option>
                {canCreateAdmin && <option value="admin">Admin</option>}
              </select>
              {!canCreateAdmin && (
                <small className="form-hint">Only SuperAdmin can create Admins</small>
              )}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setIsOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddUserForm;

