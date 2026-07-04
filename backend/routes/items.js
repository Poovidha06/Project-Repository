const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../utils/db');
const { protect, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { scoreItemPair, scoreTextSimilarity } = require('../utils/matching');

const router = express.Router();

const MATCH_THRESHOLD = 0.35;

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

function publicItem(item) {
  if (item.anonymous) {
    const { owner, contactPreference, ...rest } = item;
    return { ...rest, owner: null };
  }
  return item;
}

// Whenever a new item is submitted, compare it against the opposite type and notify on strong matches.
function runAutoMatch(newItem) {
  const oppositeType = newItem.type === 'lost' ? 'found' : 'lost';
  const candidates = db.find('items', (i) => i.type === oppositeType && i.status === 'active');

  candidates.forEach((candidate) => {
    const score = scoreItemPair(newItem, candidate);
    if (score >= MATCH_THRESHOLD) {
      const lost = newItem.type === 'lost' ? newItem : candidate;
      const found = newItem.type === 'found' ? newItem : candidate;

      db.insert('matches', {
        id: uuid(),
        lostItem: lost.id,
        foundItem: found.id,
        score: Number(score.toFixed(2)),
        createdAt: new Date().toISOString()
      });

      notify(lost.owner, 'Possible match found', `We found a possible match for "${lost.title}". Check your matches.`);
      notify(found.owner, 'Possible match found', `A lost item report looks similar to "${found.title}" you reported. Check your matches.`);
    }
  });
}

// GET /api/items  -> browse + search + filter
router.get('/', (req, res) => {
  const { q, type, category, campusBlock, color, brand, status, dateFrom, dateTo, rewardOnly, page = 1, limit = 12 } = req.query;

  let results = db.all('items');

  if (type) results = results.filter((i) => i.type === type);
  if (category) results = results.filter((i) => i.category === category);
  if (campusBlock) results = results.filter((i) => i.campusBlock === campusBlock);
  if (color) results = results.filter((i) => (i.color || '').toLowerCase() === color.toLowerCase());
  if (brand) results = results.filter((i) => (i.brand || '').toLowerCase().includes(brand.toLowerCase()));
  if (status) results = results.filter((i) => i.status === status);
  if (rewardOnly === 'true') results = results.filter((i) => !!i.reward);
  if (dateFrom) results = results.filter((i) => i.dateLost >= dateFrom);
  if (dateTo) results = results.filter((i) => i.dateLost <= dateTo);

  if (q) {
    // "AI smart search": fuzzy/semantic-ish ranking instead of exact substring match only
    results = results
      .map((item) => {
        const haystack = `${item.title} ${item.brand} ${item.description} ${item.category} ${item.color}`;
        const exact = haystack.toLowerCase().includes(q.toLowerCase()) ? 0.2 : 0;
        const fuzzy = scoreTextSimilarity(q, haystack);
        return { item, relevance: exact + fuzzy };
      })
      .filter((r) => r.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .map((r) => r.item);
  } else {
    results = results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const total = results.length;
  const start = (Number(page) - 1) * Number(limit);
  const paged = results.slice(start, start + Number(limit));

  res.json({
    items: paged.map(publicItem),
    total,
    page: Number(page),
    totalPages: Math.max(1, Math.ceil(total / Number(limit)))
  });
});

// GET /api/items/stats -> home page statistics
router.get('/stats', (req, res) => {
  const items = db.all('items');
  const users = db.all('users');
  const resolved = items.filter((i) => i.status === 'resolved').length;
  res.json({
    totalItems: items.length,
    itemsReturned: resolved,
    activeUsers: users.length,
    successRate: items.length ? Math.round((resolved / items.length) * 100) : 0
  });
});

// GET /api/items/:id
router.get('/:id', (req, res) => {
  const item = db.findById('items', req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found.' });
  res.json({ item: publicItem(item) });
});

// GET /api/items/:id/matches -> possible matches for one item
router.get('/:id/matches', protect, (req, res) => {
  const item = db.findById('items', req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found.' });

  const matches = db.find(
    'matches',
    (m) => m.lostItem === item.id || m.foundItem === item.id
  );
  const withItems = matches.map((m) => ({
    ...m,
    lostItem: publicItem(db.findById('items', m.lostItem)),
    foundItem: publicItem(db.findById('items', m.foundItem))
  }));
  res.json({ matches: withItems });
});

// POST /api/items  (type: 'lost' | 'found' comes in the body)
router.post('/', protect, upload.array('images', 5), (req, res) => {
  const body = req.body;
  if (!body.type || !['lost', 'found'].includes(body.type)) {
    return res.status(400).json({ message: 'Item type must be "lost" or "found".' });
  }
  if (!body.title || !body.category || !body.description) {
    return res.status(400).json({ message: 'Title, category and description are required.' });
  }

  const images = (req.files || []).map((f) => `/uploads/${f.filename}`);

  const item = db.insert('items', {
    id: uuid(),
    type: body.type,
    title: body.title,
    category: body.category,
    description: body.description,
    brand: body.brand || '',
    color: body.color || '',
    uniqueIdentifiers: body.uniqueIdentifiers || '',
    dateLost: body.dateLost || new Date().toISOString().slice(0, 10),
    approximateTime: body.approximateTime || '',
    campusBlock: body.campusBlock || '',
    building: body.building || '',
    floor: body.floor || '',
    room: body.room || '',
    currentItemLocation: body.currentItemLocation || '', // used for found items
    images,
    reward: body.reward || '',
    contactPreference: body.contactPreference || 'email',
    anonymous: body.anonymous === 'true' || body.anonymous === true,
    additionalNotes: body.additionalNotes || '',
    owner: req.user.id,
    status: 'active',
    createdAt: new Date().toISOString()
  });

  runAutoMatch(item);

  res.status(201).json({ item });
});

// PUT /api/items/:id  (owner or admin)
router.put('/:id', protect, (req, res) => {
  const item = db.findById('items', req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found.' });
  if (item.owner !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You can only edit your own reports.' });
  }
  const updated = db.updateById('items', req.params.id, req.body);
  res.json({ item: updated });
});

// DELETE /api/items/:id (owner or admin)
router.delete('/:id', protect, (req, res) => {
  const item = db.findById('items', req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found.' });
  if (item.owner !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You can only delete your own reports.' });
  }
  db.removeById('items', req.params.id);
  res.json({ message: 'Item deleted.' });
});

// POST /api/items/:id/bookmark
router.post('/:id/bookmark', protect, (req, res) => {
  const item = db.findById('items', req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found.' });

  const existing = db.find('bookmarks', (b) => b.user === req.user.id && b.item === item.id)[0];
  if (existing) {
    db.removeById('bookmarks', existing.id);
    return res.json({ bookmarked: false });
  }
  db.insert('bookmarks', { id: uuid(), user: req.user.id, item: item.id, createdAt: new Date().toISOString() });
  res.json({ bookmarked: true });
});

// GET /api/items/user/mine -> current user's own reports
router.get('/user/mine', protect, (req, res) => {
  const items = db.find('items', (i) => i.owner === req.user.id);
  const bookmarkIds = db.find('bookmarks', (b) => b.user === req.user.id).map((b) => b.item);
  const bookmarks = bookmarkIds.map((id) => db.findById('items', id)).filter(Boolean);
  res.json({
    lost: items.filter((i) => i.type === 'lost'),
    found: items.filter((i) => i.type === 'found'),
    bookmarks
  });
});

module.exports = router;
