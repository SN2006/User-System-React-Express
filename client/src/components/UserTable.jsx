import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThrottle } from '../hooks/useThrottle';
import './UserTable.css';

const UserTable = ({ users, onDelete, onRoleChange, loading }) => {
  const { user: currentUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState({});

  const canDelete = (targetUser) => {
    if (currentUser.role === 'admin') {
      return targetUser.role === 'user';
    }
    if (currentUser.role === 'superadmin') {
      return targetUser.role !== 'superadmin' && targetUser.id !== currentUser.id;
    }
    return false;
  };

  const canChangeRole = (targetUser) => {
    return (
      currentUser.role === 'superadmin' &&
      targetUser.role !== 'superadmin' &&
      targetUser.id !== currentUser.id
    );
  };

  // Throttled handlers для запобігання множинних викликів
  const performRoleChange = useCallback((userId, newRole, currentRole) => {
    console.log('Changing role from', currentRole, 'to', newRole);
    if (newRole !== currentRole) {
      if (window.confirm(`Change role to ${newRole}?`)) {
        onRoleChange(userId, newRole);
      } else {
        setSelectedRole((prev) => ({ ...prev, [userId]: currentRole }));
      }
    }
  }, [onRoleChange]);

  const performDelete = useCallback((userId, username) => {
    if (window.confirm(`Delete user ${username}?`)) {
      onDelete(userId);
    }
  }, [onDelete]);

  const throttledRoleChange = useThrottle(performRoleChange, 1000);
  const throttledDelete = useThrottle(performDelete, 1000);

  const handleRoleChange = (userId, newRole, currentRole) => {
    throttledRoleChange(userId, newRole, currentRole);
  };

  const handleDelete = (userId, username) => {
    throttledDelete(userId, username);
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-table-container">
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            {(currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
              <th>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                {canChangeRole(user) ? (
                  <select
                    className={`role-select role-${selectedRole[user.id] || user.role}`}
                    value={selectedRole[user.id] || user.role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      console.log('Selected new role:', newRole);
                      setSelectedRole({ ...selectedRole, [user.id]: newRole });
                      handleRoleChange(user.id, newRole, user.role);
                    }}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span className={`role-badge role-${user.role}`}>
                    {user.role}
                  </span>
                )}
              </td>
              {(currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
                <td>
                  {canDelete(user) ? (
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(user.id, user.username)}
                    >
                      Delete
                    </button>
                  ) : (
                    <span className="no-action">-</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;

