const express = require('express');
const db = require('../utils/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, (req, res) => {
  const notifications = db
    .find('notifications', (n) => n.user === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ notifications, unreadCount: notifications.filter((n) => !n.read).length });
});

router.put('/read', protect, (req, res) => {
  const { id } = req.body; // if omitted, mark all as read
  const notifications = db.find('notifications', (n) => n.user === req.user.id);
  notifications.forEach((n) => {
    if (!id || n.id === id) db.updateById('notifications', n.id, { read: true });
  });
  res.json({ message: 'Updated.' });
});

module.exports = router;
