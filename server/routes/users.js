const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { getUsers, getUserById, getUserByEmail, getUserByUsername, addUser, deleteUser, updateUserRole } = require('../data/users');

router.get('/statistics', authenticateToken, (req, res) => {
  try {
    const users = getUsers();
    const stats = {
      total: users.length,
      byRole: {
        user: users.filter(u => u.role === 'user').length,
        admin: users.filter(u => u.role === 'admin').length,
        superadmin: users.filter(u => u.role === 'superadmin').length
      }
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/search', authenticateToken, (req, res) => {
  try {
    const { query } = req.query;
    let users = getUsers().map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }));

    if (query) {
      const searchLower = query.toLowerCase();
      users = users.filter(user =>
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

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

router.post('/', authenticateToken, authorizeRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;
    const currentUser = req.user;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (getUserByEmail(email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    if (getUserByUsername(username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Admin can only create users with "user" role
    let assignedRole = role;
    if (currentUser.role === 'admin') {
      assignedRole = 'user';
    } else if (currentUser.role === 'superadmin') {
      // Superadmin can create user or admin, but not superadmin
      if (!['user', 'admin'].includes(role)) {
        assignedRole = 'user';
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = addUser({
      username,
      email,
      password: hashedPassword,
      role: assignedRole
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
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

