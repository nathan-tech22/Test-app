const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET all bottles with filters
router.get('/', (req, res) => {
  const db = getDb();
  const { status, region, type, shelf, distillery, search, sort = 'created_at', order = 'DESC' } = req.query;

  let query = 'SELECT * FROM bottles WHERE 1=1';
  const params = [];

  if (status) { query += ' AND status = ?'; params.push(status); }
  if (region) { query += ' AND region = ?'; params.push(region); }
  if (type) { query += ' AND type = ?'; params.push(type); }
  if (shelf) { query += ' AND custom_shelf = ?'; params.push(shelf); }
  if (distillery) { query += ' AND distillery LIKE ?'; params.push(`%${distillery}%`); }
  if (search) {
    query += ' AND (name LIKE ? OR distillery LIKE ? OR notes LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const validSort = ['name', 'distillery', 'purchase_price', 'proof', 'age_statement', 'created_at', 'purchase_date'];
  const sortCol = validSort.includes(sort) ? sort : 'created_at';
  const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';
  query += ` ORDER BY ${sortCol} ${sortOrder}`;

  const bottles = db.prepare(query).all(...params);
  res.json(bottles);
});

// GET single bottle with tasting sessions
router.get('/:id', (req, res) => {
  const db = getDb();
  const bottle = db.prepare('SELECT * FROM bottles WHERE id = ?').get(req.params.id);
  if (!bottle) return res.status(404).json({ error: 'Bottle not found' });

  const tastings = db.prepare('SELECT * FROM tasting_sessions WHERE bottle_id = ? ORDER BY tasting_date DESC').all(req.params.id);
  const avgScore = tastings.length > 0
    ? Math.round(tastings.reduce((sum, t) => sum + (t.score || 0), 0) / tastings.filter(t => t.score).length)
    : null;

  res.json({ ...bottle, tastings, avg_score: avgScore });
});

// POST create bottle
router.post('/', (req, res) => {
  const db = getDb();
  const id = uuidv4();
  const {
    name, distillery, region = 'Kentucky', type = 'Bourbon', mashbill, grain_bill,
    age_statement, proof, abv, bottle_size = 750, vintage, batch_number,
    status = 'sealed', fill_level = 100, purchase_price, purchase_date, retailer,
    msrp, secondary_market_value, notes, custom_shelf = 'Main Collection',
    is_gift = 0, gift_from, gift_to
  } = req.body;

  if (!name || !distillery) {
    return res.status(400).json({ error: 'Name and distillery are required' });
  }

  db.prepare(`
    INSERT INTO bottles (id, name, distillery, region, type, mashbill, grain_bill, age_statement,
      proof, abv, bottle_size, vintage, batch_number, status, fill_level, purchase_price,
      purchase_date, retailer, msrp, secondary_market_value, notes, custom_shelf, is_gift, gift_from, gift_to)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, distillery, region, type, mashbill, grain_bill, age_statement,
    proof, abv, bottle_size, vintage, batch_number, status, fill_level,
    purchase_price, purchase_date, retailer, msrp, secondary_market_value, notes,
    custom_shelf, is_gift, gift_from, gift_to);

  const bottle = db.prepare('SELECT * FROM bottles WHERE id = ?').get(id);
  res.status(201).json(bottle);
});

// PUT update bottle
router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM bottles WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Bottle not found' });

  const fields = ['name', 'distillery', 'region', 'type', 'mashbill', 'grain_bill', 'age_statement',
    'proof', 'abv', 'bottle_size', 'vintage', 'batch_number', 'status', 'fill_level',
    'purchase_price', 'purchase_date', 'retailer', 'msrp', 'secondary_market_value', 'notes',
    'custom_shelf', 'is_gift', 'gift_from', 'gift_to'];

  const updates = {};
  for (const field of fields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  if (Object.keys(updates).length === 0) {
    return res.json(existing);
  }

  updates.updated_at = new Date().toISOString();
  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(updates), req.params.id];

  db.prepare(`UPDATE bottles SET ${setClauses} WHERE id = ?`).run(...values);
  const bottle = db.prepare('SELECT * FROM bottles WHERE id = ?').get(req.params.id);
  res.json(bottle);
});

// DELETE bottle
router.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM bottles WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Bottle not found' });

  db.prepare('DELETE FROM bottles WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// POST upload photo
router.post('/:id/photo', upload.single('photo'), (req, res) => {
  const db = getDb();
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const photoUrl = `/uploads/${req.file.filename}`;
  db.prepare('UPDATE bottles SET photo_url = ? WHERE id = ?').run(photoUrl, req.params.id);
  res.json({ photo_url: photoUrl });
});

// GET recommendations based on flavor profile
router.get('/:id/recommendations', (req, res) => {
  const db = getDb();
  const bottle = db.prepare('SELECT * FROM bottles WHERE id = ?').get(req.params.id);
  if (!bottle) return res.status(404).json({ error: 'Bottle not found' });

  const tastings = db.prepare('SELECT flavor_tags FROM tasting_sessions WHERE bottle_id = ?').all(req.params.id);
  const allTags = new Set();
  tastings.forEach(t => {
    if (t.flavor_tags) {
      JSON.parse(t.flavor_tags).forEach(tag => allTags.add(tag));
    }
  });

  const recs = db.prepare(`
    SELECT b.*, ts.flavor_tags FROM bottles b
    LEFT JOIN tasting_sessions ts ON b.id = ts.bottle_id
    WHERE b.id != ? AND (b.region = ? OR b.type = ?)
    GROUP BY b.id
    LIMIT 5
  `).all(req.params.id, bottle.region, bottle.type);

  res.json(recs);
});

module.exports = router;
