// A tiny, dependency-free "database" that persists to a JSON file on disk.
// It mimics the collections described in the spec (Users, LostItems/FoundItems -> merged
// into "items", Claims, Notifications, Bookmarks, ActivityLogs) so the rest of the app can
// be written against a stable, promise-based API. Swapping this for real MongoDB Atlas +
// Mongoose later only requires rewriting this file - routes/controllers stay the same shape.

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

const DEFAULT_DATA = {
  users: [],
  items: [],
  claims: [],
  notifications: [],
  bookmarks: [],
  activityLogs: []
};

function ensureFile() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
  }
}

function readDB() {
  ensureFile();
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Generic collection helpers -------------------------------------------------

function all(collection) {
  const db = readDB();
  return db[collection] || [];
}

function findById(collection, id) {
  return all(collection).find((doc) => doc.id === id) || null;
}

function find(collection, predicate) {
  return all(collection).filter(predicate);
}

function insert(collection, doc) {
  const db = readDB();
  db[collection] = db[collection] || [];
  db[collection].push(doc);
  writeDB(db);
  return doc;
}

function updateById(collection, id, patch) {
  const db = readDB();
  const list = db[collection] || [];
  const idx = list.findIndex((doc) => doc.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
  db[collection] = list;
  writeDB(db);
  return list[idx];
}

function removeById(collection, id) {
  const db = readDB();
  const list = db[collection] || [];
  const next = list.filter((doc) => doc.id !== id);
  const removed = list.length !== next.length;
  db[collection] = next;
  writeDB(db);
  return removed;
}

module.exports = { all, findById, find, insert, updateById, removeById };
