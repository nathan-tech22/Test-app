const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');

router.get('/', (req, res) => {
  const db = getDb();
  const items = db.prepare('SELECT * FROM wishlist ORDER BY priority DESC, added_date DESC').all();
  res.json(items);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { name, distillery, region, type = 'Bourbon', estimated_price, priority = 3, notes, where_to_find } = req.body;

  if (!name) return res.status(400).json({ error: 'Name is required' });

  const id = uuidv4();
  db.prepare(`
    INSERT INTO wishlist (id, name, distillery, region, type, estimated_price, priority, notes, where_to_find)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, distillery, region, type, estimated_price, priority, notes, where_to_find);

  const item = db.prepare('SELECT * FROM wishlist WHERE id = ?').get(id);
  res.status(201).json(item);
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM wishlist WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Wishlist item not found' });

  const fields = ['name', 'distillery', 'region', 'type', 'estimated_price', 'priority', 'notes', 'where_to_find', 'acquired'];
  const updates = {};
  for (const field of fields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  if (Object.keys(updates).length === 0) return res.json(existing);

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE wishlist SET ${setClauses} WHERE id = ?`).run(...Object.values(updates), req.params.id);

  const item = db.prepare('SELECT * FROM wishlist WHERE id = ?').get(req.params.id);
  res.json(item);
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM wishlist WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Wishlist item not found' });

  db.prepare('DELETE FROM wishlist WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
