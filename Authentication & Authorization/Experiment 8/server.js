const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const users = []; // Simple in-memory user store

const secretKey = 'your_secret_key';

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword, role });

  res.status(201).send('User registered successfully');
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(user => user.username === username);
  if (!user) {
    return res.status(400).send('Invalid username or password');
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).send('Invalid username or password');
  }

  const token = jwt.sign({ username: user.username, role: user.role }, secretKey, { expiresIn: '1h' });

  res.status(200).json({ token });
});

// Middleware to verify JWT
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).send('Access Denied');
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).send('Invalid Token');
  }
};

// Role-based middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).send('Access Denied');
    }
    next();
  };
};

// Protected route
app.get('/admin', authenticateJWT, authorizeRoles('Admin'), (req, res) => {
  res.status(200).send('Welcome Admin');
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
