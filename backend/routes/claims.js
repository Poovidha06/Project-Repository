const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../utils/db');
const { protect, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

function notify(userId, title, message) {
  db.insert('notifications', {
    id: uuid(),
    user: userId,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString()
  });
}

// POST /api/claims  -> student claims a found item
router.post('/', protect, upload.array('proofImages', 3), (req, res) => {
  const { itemId, uniqueMarks, whatWasInside, purchaseProof, additionalExplanation } = req.body;
  const item = db.findById('items', itemId);
  if (!item) return res.status(404).json({ message: 'Item not found.' });
  if (item.type !== 'found') return res.status(400).json({ message: 'You can only claim found items.' });

  const proofImages = (req.files || []).map((f) => `/uploads/${f.filename}`);

  const claim = db.insert('claims', {
    id: uuid(),
    itemId,
    claimant: req.user.id,
    answers: { uniqueMarks, whatWasInside, purchaseProof: purchaseProof || '', additionalExplanation: additionalExplanation || '' },
    proofImages,
    status: 'pending',
    adminRemarks: '',
    createdAt: new Date().toISOString()
  });

  db.updateById('items', itemId, { status: 'claim_pending' });

  // Notify all admins
  db.find('users', (u) => u.role === 'admin').forEach((admin) =>
    notify(admin.id, 'New claim submitted', `A claim was submitted for "${item.title}".`)
  );

  res.status(201).json({ claim });
});

// GET /api/claims/mine
router.get('/mine', protect, (req, res) => {
  const claims = db.find('claims', (c) => c.claimant === req.user.id).map((c) => ({
    ...c,
    item: db.findById('items', c.itemId)
  }));
  res.json({ claims });
});

// GET /api/claims  (admin: all claims)
router.get('/', protect, requireRole('admin'), (req, res) => {
  const { status } = req.query;
  let claims = db.all('claims');
  if (status) claims = claims.filter((c) => c.status === status);
  claims = claims.map((c) => ({
    ...c,
    item: db.findById('items', c.itemId),
    claimantUser: (() => {
      const u = db.findById('users', c.claimant);
      if (!u) return null;
      const { password, ...rest } = u;
      return rest;
    })()
  }));
  res.json({ claims });
});

// PUT /api/claims/:id  (admin: approve / reject / request-info)
router.put('/:id', protect, requireRole('admin'), (req, res) => {
  const { status, adminRemarks } = req.body; // status: under_review | approved | rejected | completed
  const claim = db.findById('claims', req.params.id);
  if (!claim) return res.status(404).json({ message: 'Claim not found.' });

  const updated = db.updateById('claims', req.params.id, {
    status,
    adminRemarks: adminRemarks || claim.adminRemarks
  });

  if (status === 'approved') {
    db.updateById('items', claim.itemId, { status: 'resolved' });
    notify(claim.claimant, 'Claim approved', 'Your claim has been approved. Please visit the office to collect your item.');
    const item = db.findById('items', claim.itemId);
    const claimant = db.findById('users', claim.claimant);
    db.updateById('users', claim.claimant, { reputationScore: (claimant.reputationScore || 0) + 1 });
  } else if (status === 'rejected') {
    db.updateById('items', claim.itemId, { status: 'active' });
    notify(claim.claimant, 'Claim rejected', adminRemarks || 'Your claim was rejected. Please contact the admin office for details.');
  } else if (status === 'under_review') {
    notify(claim.claimant, 'Claim under review', 'Your claim is now under review by the admin team.');
  } else if (status === 'completed') {
    db.updateById('items', claim.itemId, { status: 'resolved' });
    notify(claim.claimant, 'Item returned', 'Your item has been marked as returned. Glad it found its way back!');
  }

  res.json({ claim: updated });
});

module.exports = router;
