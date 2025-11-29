import { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { useThrottle } from '../hooks/useThrottle';
import './Auth.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: ''
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const debouncedEmail = useDebounce(formData.email, 500);
  const debouncedPassword = useDebounce(formData.password, 500);

  useEffect(() => {
    if (debouncedEmail.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(debouncedEmail)) {
        setValidationErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      } else {
        setValidationErrors(prev => ({ ...prev, email: '' }));
      }
    }
  }, [debouncedEmail]);

  useEffect(() => {
    if (debouncedPassword.length > 0) {
      if (debouncedPassword.length < 6) {
        setValidationErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      } else {
        setValidationErrors(prev => ({ ...prev, password: '' }));
      }
    }
  }, [debouncedPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    setValidationErrors(prev => ({ ...prev, [name]: '' }));
  };

  const performLogin = useCallback(async (data) => {
    setError('');
    setLoading(true);

    try {
      const result = await login(data);

      switch (result.user.role) {
        case 'superadmin':
          navigate('/superadmin');
          break;
        case 'admin':
          navigate('/admin');
          break;
        case 'user':
          navigate('/user');
          break;
        default:
          navigate('/user');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }, [login, navigate]);

  const throttledLogin = useThrottle(performLogin, 1000);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    const hasErrors = Object.values(validationErrors).some(error => error !== '');
    if (hasErrors) {
      setError('Please fix all validation errors before submitting');
      return;
    }

    throttledLogin(formData);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={validationErrors.email ? 'input-error' : ''}
              required
            />
            {validationErrors.email && <div className="field-error">{validationErrors.email}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={validationErrors.password ? 'input-error' : ''}
              required
            />
            {validationErrors.password && <div className="field-error">{validationErrors.password}</div>}
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

