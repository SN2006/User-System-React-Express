import { useNavigate } from 'react-router-dom';
import './Unauthorized.css';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <h1>403</h1>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <button onClick={() => navigate(-1)} className="back-btn">
          Go Back
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

