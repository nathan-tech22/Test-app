const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');

// GET all tasting sessions (optionally filtered by bottle)
router.get('/', (req, res) => {
  const db = getDb();
  const { bottle_id } = req.query;

  let query = `
    SELECT ts.*, b.name as bottle_name, b.distillery, b.region
    FROM tasting_sessions ts
    JOIN bottles b ON ts.bottle_id = b.id
  `;
  const params = [];

  if (bottle_id) {
    query += ' WHERE ts.bottle_id = ?';
    params.push(bottle_id);
  }

  query += ' ORDER BY ts.tasting_date DESC';
  const tastings = db.prepare(query).all(...params);
  res.json(tastings);
});

// GET single tasting session
router.get('/:id', (req, res) => {
  const db = getDb();
  const tasting = db.prepare(`
    SELECT ts.*, b.name as bottle_name, b.distillery
    FROM tasting_sessions ts
    JOIN bottles b ON ts.bottle_id = b.id
    WHERE ts.id = ?
  `).get(req.params.id);

  if (!tasting) return res.status(404).json({ error: 'Tasting session not found' });
  res.json(tasting);
});

// POST create tasting session
router.post('/', (req, res) => {
  const db = getDb();
  const {
    bottle_id, tasting_date, occasion, score, nose, palate, finish,
    overall_notes, flavor_tags, pour_amount = 1.5, shared_with
  } = req.body;

  if (!bottle_id || !tasting_date) {
    return res.status(400).json({ error: 'bottle_id and tasting_date are required' });
  }

  const bottle = db.prepare('SELECT id FROM bottles WHERE id = ?').get(bottle_id);
  if (!bottle) return res.status(404).json({ error: 'Bottle not found' });

  const id = uuidv4();
  const tagsJson = Array.isArray(flavor_tags) ? JSON.stringify(flavor_tags) : flavor_tags;

  db.prepare(`
    INSERT INTO tasting_sessions (id, bottle_id, tasting_date, occasion, score, nose, palate,
      finish, overall_notes, flavor_tags, pour_amount, shared_with)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, bottle_id, tasting_date, occasion, score, nose, palate, finish, overall_notes, tagsJson, pour_amount, shared_with);

  const tasting = db.prepare('SELECT * FROM tasting_sessions WHERE id = ?').get(id);
  res.status(201).json(tasting);
});

// PUT update tasting session
router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM tasting_sessions WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Tasting session not found' });

  const fields = ['tasting_date', 'occasion', 'score', 'nose', 'palate', 'finish',
    'overall_notes', 'flavor_tags', 'pour_amount', 'shared_with'];

  const updates = {};
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      updates[field] = field === 'flavor_tags' && Array.isArray(req.body[field])
        ? JSON.stringify(req.body[field])
        : req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) return res.json(existing);

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE tasting_sessions SET ${setClauses} WHERE id = ?`).run(...Object.values(updates), req.params.id);

  const tasting = db.prepare('SELECT * FROM tasting_sessions WHERE id = ?').get(req.params.id);
  res.json(tasting);
});

// DELETE tasting session
router.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM tasting_sessions WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Tasting session not found' });

  db.prepare('DELETE FROM tasting_sessions WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
