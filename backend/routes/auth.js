const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const db = require('../utils/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

function isStudentEmail(email) {
  return (
    typeof email === "string" &&
    email.toLowerCase().endsWith("@student.tce.edu")
  );
}

function isAdminEmail(email) {
  return (
    typeof email === "string" &&
    email.toLowerCase().endsWith("@tce.edu") &&
    !email.toLowerCase().endsWith("@student.tce.edu")
  );
}

function isStrongPassword(pw) {
  // at least 8 chars, one letter, one number
  return typeof pw === 'string' && pw.length >= 8 && /[A-Za-z]/.test(pw) && /[0-9]/.test(pw);
}

function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    }
  );
}

function sanitize(user) {
  const { password, ...rest } = user;
  return rest;
}

// POST /api/auth/register  (students self-register; admins are seeded/created by an existing admin)
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      registerNumber,
      email,
      department,
      year,
      phone,
      password,
      confirmPassword
    } = req.body;

    if (
      !name ||
      !registerNumber ||
      !department ||
      !year ||
      !phone ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "Please fill in all required fields."
      });
    }

    if (!isStudentEmail(email)) {
      return res.status(400).json({
        message: "Use your student email (example@student.tce.edu)"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match."
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters including one letter and one number."
      });
    }

    const existing = db.find(
      "users",
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "An account with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = db.insert("users", {
      id: uuid(),
      name,
      registerNumber,
      email: email.toLowerCase(),
      department,
      year,
      phone,
      password: hashedPassword,
      role: "student",
      profileImage: null,
      reputationScore: 0,
      createdAt: new Date().toISOString()
    });

    const token = signToken(user);

    res.status(201).json({
      token,
      user: sanitize(user)
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Registration failed.",
      error: err.message
    });
  }
});
// POST /api/auth/login  -> used by the student login screen
router.post("/login", async (req, res) => {
  try {

    const email = (req.body.email || "").trim().toLowerCase();
const password = req.body.password || "";

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    if (!isStudentEmail(email)) {
      return res.status(400).json({
        message: "Use your student email."
      });
    }

    const user = db.find(
      "users",
      u =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.role === "student"
    )[0];

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

console.log("Stored Hash:", user.password);
console.log("Password Match:", passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const token = signToken(user);

    return res.status(200).json({
      token,
      user: sanitize(user)
    });

  } catch (err) {
  console.error("LOGIN ERROR:", err);

  return res.status(500).json({
    message: err.message
  });
}
});

// POST /api/auth/admin-login -> separate endpoint for the admin login screen
router.post("/admin-login", async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    if (!isAdminEmail(email)) {
      return res.status(400).json({
        message: "Use your admin email."
      });
    }

    const user = db.find(
      "users",
      u =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.role === "admin"
    )[0];

    if (!user) {
      return res.status(401).json({
        message: "Invalid admin credentials."
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid admin credentials."
      });
    }

    const token = signToken(user);

    res.json({
      token,
      user: sanitize(user)
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Login failed.",
      error: err.message
    });

  }

});

// GET /api/auth/profile
router.get('/profile', protect, (req, res) => {
  const user = db.findById('users', req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const itemsReported = db.find('items', (i) => i.owner === user.id).length;
  const claims = db.find('claims', (c) => c.claimant === user.id);
  const successfulClaims = claims.filter((c) => c.status === 'approved' || c.status === 'completed').length;

  res.json({
    user: sanitize(user),
    stats: {
      itemsReported,
      successfulClaims,
      itemsReturned: db.find('items', (i) => i.owner === user.id && i.status === 'resolved').length,
      reputationScore: user.reputationScore || 0
    }
  });
});

// PUT /api/auth/profile
router.put('/profile', protect, (req, res) => {
  const { name, department, year, phone, profileImage } = req.body;
  const updated = db.updateById('users', req.user.id, {
    ...(name && { name }),
    ...(department && { department }),
    ...(year && { year }),
    ...(phone && { phone }),
    ...(profileImage !== undefined && { profileImage })
  });
  if (!updated) return res.status(404).json({ message: 'User not found.' });
  res.json({ user: sanitize(updated) });
});

// PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = db.findById('users', req.user.id);
  const match = await bcrypt.compare(currentPassword || '', user.password);
  if (!match) return res.status(400).json({ message: 'Current password is incorrect.' });
  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({ message: 'New password must be at least 8 characters and include a letter and a number.' });
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  db.updateById('users', user.id, { password: hashed });
  res.json({ message: 'Password updated successfully.' });
});

module.exports = router;
