const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { getUsers, getUserById, deleteUser, updateUserRole } = require('../data/users');

router.get('/', authenticateToken, (req, res) => {
  try {
    const users = getUsers().map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }));

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, authorizeRole('admin', 'superadmin'), (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (id === currentUser.id) {
      return res.status(403).json({ error: 'Cannot delete your own account' });
    }

    const userToDelete = getUserById(id);
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (currentUser.role === 'admin' && userToDelete.role !== 'user') {
      return res.status(403).json({ error: 'Admin can only delete users with role "user"' });
    }

    if (userToDelete.role === 'superadmin') {
      return res.status(403).json({ error: 'Cannot delete Super Admin' });
    }

    const deletedUser = deleteUser(id);
    res.json({
      message: 'User deleted successfully',
      user: {
        id: deletedUser.id,
        username: deletedUser.username,
        role: deletedUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/role', authenticateToken, authorizeRole('superadmin'), (req, res) => {
  try {
    const { id } = req.params;
    const { newRole } = req.body;
    const currentUser = req.user;

    if (!newRole) {
      return res.status(400).json({ error: 'New role is required' });
    }

    if (!['user', 'admin'].includes(newRole)) {
      return res.status(400).json({ error: 'Invalid role. Only "user" and "admin" are allowed' });
    }

    if (id === currentUser.id) {
      return res.status(403).json({ error: 'Cannot change your own role' });
    }

    const userToUpdate = getUserById(id);
    if (!userToUpdate) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userToUpdate.role === 'superadmin') {
      return res.status(403).json({ error: 'Cannot change Super Admin role' });
    }

    const updatedUser = updateUserRole(id, newRole);
    res.json({
      message: 'Role updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

