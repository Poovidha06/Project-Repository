const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../utils/db');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(protect, requireRole('admin'));

// GET /api/admin/dashboard
router.get('/dashboard', (req, res) => {
  const items = db.all('items');
  const claims = db.all('claims');
  const users = db.all('users');
  const matches = db.all('matches');

  const byCategory = {};
  items.forEach((i) => {
    byCategory[i.category] = (byCategory[i.category] || 0) + 1;
  });

  const byMonth = {};
  items.forEach((i) => {
    const month = (i.createdAt || '').slice(0, 7);
    byMonth[month] = (byMonth[month] || 0) + 1;
  });

  res.json({
    counts: {
      users: users.filter((u) => u.role === 'student').length,
      lostItems: items.filter((i) => i.type === 'lost').length,
      foundItems: items.filter((i) => i.type === 'found').length,
      claims: claims.length,
      matches: matches.length,
      resolvedCases: items.filter((i) => i.status === 'resolved').length
    },
    charts: {
      byCategory,
      byMonth,
      claimStatusBreakdown: {
        pending: claims.filter((c) => c.status === 'pending').length,
        under_review: claims.filter((c) => c.status === 'under_review').length,
        approved: claims.filter((c) => c.status === 'approved').length,
        rejected: claims.filter((c) => c.status === 'rejected').length,
        completed: claims.filter((c) => c.status === 'completed').length
      }
    }
  });
});

// GET /api/admin/users
router.get('/users', (req, res) => {
  const { q } = req.query;
  let users = db.all('users').filter((u) => u.role === 'student');
  if (q) {
    users = users.filter(
      (u) =>
        u.name.toLowerCase().includes(q.toLowerCase()) ||
        u.email.toLowerCase().includes(q.toLowerCase()) ||
        (u.registerNumber || '').toLowerCase().includes(q.toLowerCase())
    );
  }
  res.json({ users: users.map(({ password, ...rest }) => rest) });
});

// PUT /api/admin/users/:id/suspend
router.put('/users/:id/suspend', (req, res) => {
  const updated = db.updateById('users', req.params.id, { suspended: true });
  if (!updated) return res.status(404).json({ message: 'User not found.' });
  res.json({ message: 'User suspended.' });
});

// PUT /api/admin/users/:id/reinstate
router.put('/users/:id/reinstate', (req, res) => {
  const updated = db.updateById('users', req.params.id, { suspended: false });
  if (!updated) return res.status(404).json({ message: 'User not found.' });
  res.json({ message: 'User reinstated.' });
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', (req, res) => {
  db.removeById('users', req.params.id);
  res.json({ message: 'User removed.' });
});

// PUT /api/admin/items/:id/approve
router.put('/items/:id/approve', (req, res) => {
  const updated = db.updateById('items', req.params.id, { status: 'active', flagged: false });
  if (!updated) return res.status(404).json({ message: 'Item not found.' });
  res.json({ item: updated });
});

// PUT /api/admin/items/:id/resolve
router.put('/items/:id/resolve', (req, res) => {
  const updated = db.updateById('items', req.params.id, { status: 'resolved' });
  if (!updated) return res.status(404).json({ message: 'Item not found.' });
  res.json({ item: updated });
});

// DELETE /api/admin/items/:id
router.delete('/items/:id', (req, res) => {
  db.removeById('items', req.params.id);
  res.json({ message: 'Item removed.' });
});

// POST /api/admin/announcements -> broadcast a notification to all students
router.post('/announcements', (req, res) => {
  const { title, message } = req.body;
  if (!title || !message) return res.status(400).json({ message: 'Title and message are required.' });
  const students = db.all('users').filter((u) => u.role === 'student');
  students.forEach((s) => {
    db.insert('notifications', {
      id: uuid(),
      user: s.id,
      title: `📢 ${title}`,
      message,
      read: false,
      createdAt: new Date().toISOString()
    });
  });
  res.json({ message: `Announcement sent to ${students.length} students.` });
});

module.exports = router;
