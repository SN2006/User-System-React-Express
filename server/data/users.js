const bcrypt = require('bcryptjs');

let users = [
  {
    id: '1',
    username: 'superadmin',
    email: 'superadmin@example.com',
    password: bcrypt.hashSync('superadmin123', 10),
    role: 'superadmin'
  },
  {
    id: '2',
    username: 'admin',
    email: 'admin@example.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin'
  },
  {
    id: '3',
    username: 'user1',
    email: 'user1@example.com',
    password: bcrypt.hashSync('user123', 10),
    role: 'user'
  },
  {
    id: '4',
    username: 'user2',
    email: 'user2@example.com',
    password: bcrypt.hashSync('user123', 10),
    role: 'user'
  }
];

let nextId = 5;

module.exports = {
  getUsers: () => users,
  getUserById: (id) => users.find(u => u.id === id),
  getUserByEmail: (email) => users.find(u => u.email === email),
  getUserByUsername: (username) => users.find(u => u.username === username),
  addUser: (user) => {
    const newUser = { ...user, id: String(nextId++) };
    users.push(newUser);
    return newUser;
  },
  deleteUser: (id) => {
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      const deleted = users[index];
      users.splice(index, 1);
      return deleted;
    }
    return null;
  },
  updateUserRole: (id, newRole) => {
    const user = users.find(u => u.id === id);
    if (user) {
      user.role = newRole;
      return user;
    }
    return null;
  }
};

