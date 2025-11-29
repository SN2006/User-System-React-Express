import { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { useThrottle } from '../hooks/useThrottle';
import './Auth.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isValidating, setIsValidating] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const debouncedUsername = useDebounce(formData.username, 500);
  const debouncedEmail = useDebounce(formData.email, 500);
  const debouncedPassword = useDebounce(formData.password, 500);
  const debouncedConfirmPassword = useDebounce(formData.confirmPassword, 500);

  useEffect(() => {
    if (debouncedUsername.length > 0) {
      if (debouncedUsername.length < 3) {
        setValidationErrors(prev => ({ ...prev, username: 'Username must be at least 3 characters' }));
      } else if (debouncedUsername.length > 20) {
        setValidationErrors(prev => ({ ...prev, username: 'Username must be less than 20 characters' }));
      } else if (!/^[a-zA-Z0-9_]+$/.test(debouncedUsername)) {
        setValidationErrors(prev => ({ ...prev, username: 'Username can only contain letters, numbers and underscore' }));
      } else {
        setValidationErrors(prev => ({ ...prev, username: '' }));
      }
    }
  }, [debouncedUsername]);

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
      } else if (debouncedPassword.length > 50) {
        setValidationErrors(prev => ({ ...prev, password: 'Password must be less than 50 characters' }));
      } else if (!/(?=.*[a-z])/.test(debouncedPassword)) {
        setValidationErrors(prev => ({ ...prev, password: 'Password must contain at least one lowercase letter' }));
      } else if (!/(?=.*[A-Z])/.test(debouncedPassword)) {
        setValidationErrors(prev => ({ ...prev, password: 'Password must contain at least one uppercase letter' }));
      } else if (!/(?=.*\d)/.test(debouncedPassword)) {
        setValidationErrors(prev => ({ ...prev, password: 'Password must contain at least one number' }));
      } else {
        setValidationErrors(prev => ({ ...prev, password: '' }));
      }
    }
  }, [debouncedPassword]);

  useEffect(() => {
    if (debouncedPassword && debouncedConfirmPassword) {
      if (debouncedPassword !== debouncedConfirmPassword) {
        setValidationErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setValidationErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  }, [debouncedPassword, debouncedConfirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    setIsValidating(true);

    setValidationErrors(prev => ({ ...prev, [name]: '' }));
  };

  useEffect(() => {
    setIsValidating(false);
  }, [debouncedUsername, debouncedEmail, debouncedPassword, debouncedConfirmPassword]);

  const performRegistration = useCallback(async (data) => {
    setError('');

    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = data;
      await register(registerData);

      navigate('/user');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }, [register, navigate]);

  const throttledRegister = useThrottle(performRegistration, 1000);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const hasErrors = Object.values(validationErrors).some(error => error !== '');
    if (hasErrors) {
      setError('Please fix all validation errors before submitting');
      return;
    }

    throttledRegister(formData);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
        {isValidating && <div className="validation-status">⏳ Validating...</div>}
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={validationErrors.username ? 'input-error' : ''}
              required
            />
            {validationErrors.username && <div className="field-error">{validationErrors.username}</div>}
          </div>
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
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={validationErrors.confirmPassword ? 'input-error' : ''}
              required
            />
            {validationErrors.confirmPassword && <div className="field-error">{validationErrors.confirmPassword}</div>}
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

