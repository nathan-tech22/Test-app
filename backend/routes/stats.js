const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

router.get('/', (req, res) => {
  const db = getDb();

  const totalBottles = db.prepare("SELECT COUNT(*) as count FROM bottles WHERE status != 'finished'").get();
  const totalValue = db.prepare("SELECT SUM(COALESCE(secondary_market_value, purchase_price, 0)) as total FROM bottles WHERE status != 'finished'").get();
  const totalCost = db.prepare("SELECT SUM(COALESCE(purchase_price, 0)) as total FROM bottles").get();
  const avgScore = db.prepare("SELECT AVG(score) as avg FROM tasting_sessions WHERE score IS NOT NULL").get();
  const totalTastings = db.prepare("SELECT COUNT(*) as count FROM tasting_sessions").get();

  const byStatus = db.prepare(`
    SELECT status, COUNT(*) as count FROM bottles GROUP BY status
  `).all();

  const byRegion = db.prepare(`
    SELECT region, COUNT(*) as count, SUM(COALESCE(secondary_market_value, purchase_price, 0)) as value
    FROM bottles WHERE status != 'finished'
    GROUP BY region ORDER BY count DESC
  `).all();

  const byType = db.prepare(`
    SELECT type, COUNT(*) as count FROM bottles WHERE status != 'finished'
    GROUP BY type ORDER BY count DESC
  `).all();

  const byShelf = db.prepare(`
    SELECT custom_shelf as shelf, COUNT(*) as count
    FROM bottles WHERE status != 'finished'
    GROUP BY custom_shelf ORDER BY count DESC
  `).all();

  const topRated = db.prepare(`
    SELECT b.name, b.distillery, b.region, AVG(ts.score) as avg_score, COUNT(ts.id) as tasting_count
    FROM bottles b
    JOIN tasting_sessions ts ON b.id = ts.id
    WHERE ts.score IS NOT NULL
    GROUP BY b.id
    ORDER BY avg_score DESC
    LIMIT 5
  `).all();

  const topRatedFixed = db.prepare(`
    SELECT b.name, b.distillery, b.region,
           AVG(ts.score) as avg_score, COUNT(ts.id) as tasting_count
    FROM tasting_sessions ts
    JOIN bottles b ON ts.bottle_id = b.id
    WHERE ts.score IS NOT NULL
    GROUP BY b.id
    ORDER BY avg_score DESC
    LIMIT 5
  `).all();

  const recentTastings = db.prepare(`
    SELECT ts.*, b.name as bottle_name, b.distillery
    FROM tasting_sessions ts
    JOIN bottles b ON ts.bottle_id = b.id
    ORDER BY ts.tasting_date DESC
    LIMIT 5
  `).all();

  const spendByMonth = db.prepare(`
    SELECT strftime('%Y-%m', purchase_date) as month,
           SUM(purchase_price) as spend,
           COUNT(*) as bottles_purchased
    FROM bottles
    WHERE purchase_date IS NOT NULL
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `).all();

  const costPerPour = db.prepare(`
    SELECT b.name, b.distillery,
           COALESCE(b.purchase_price, 0) as purchase_price,
           b.bottle_size,
           COUNT(ts.id) as pour_count,
           COALESCE(SUM(ts.pour_amount * 29.5735), 0) as ml_consumed,
           CASE WHEN SUM(ts.pour_amount) > 0
                THEN ROUND(b.purchase_price / SUM(ts.pour_amount), 2)
                ELSE NULL
           END as cost_per_pour
    FROM bottles b
    LEFT JOIN tasting_sessions ts ON b.id = ts.bottle_id
    WHERE b.purchase_price IS NOT NULL AND b.status = 'open'
    GROUP BY b.id
    ORDER BY cost_per_pour ASC
    LIMIT 10
  `).all();

  const gainLoss = db.prepare(`
    SELECT name, distillery,
           purchase_price,
           COALESCE(secondary_market_value, msrp, purchase_price) as current_value,
           COALESCE(secondary_market_value, msrp, purchase_price) - COALESCE(purchase_price, 0) as gain_loss
    FROM bottles
    WHERE purchase_price IS NOT NULL AND status != 'finished'
    ORDER BY gain_loss DESC
    LIMIT 10
  `).all();

  const flavorFrequency = db.prepare('SELECT flavor_tags FROM tasting_sessions WHERE flavor_tags IS NOT NULL').all();
  const tagCounts = {};
  flavorFrequency.forEach(row => {
    try {
      const tags = JSON.parse(row.flavor_tags);
      tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    } catch {}
  });
  const topFlavors = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([tag, count]) => ({ tag, count }));

  res.json({
    summary: {
      total_bottles: totalBottles.count,
      total_value: totalValue.total || 0,
      total_cost: totalCost.total || 0,
      unrealized_gain: (totalValue.total || 0) - (totalCost.total || 0),
      avg_score: avgScore.avg ? Math.round(avgScore.avg * 10) / 10 : null,
      total_tastings: totalTastings.count,
    },
    by_status: byStatus,
    by_region: byRegion,
    by_type: byType,
    by_shelf: byShelf,
    top_rated: topRatedFixed,
    recent_tastings: recentTastings,
    spend_by_month: spendByMonth.reverse(),
    cost_per_pour: costPerPour,
    gain_loss: gainLoss,
    top_flavors: topFlavors,
  });
});

// CSV export
router.get('/export/csv', (req, res) => {
  const db = getDb();
  const bottles = db.prepare('SELECT * FROM bottles ORDER BY name').all();

  const headers = [
    'Name', 'Distillery', 'Region', 'Type', 'Age Statement', 'Proof', 'ABV',
    'Bottle Size (ml)', 'Status', 'Fill Level %', 'Purchase Price', 'MSRP',
    'Market Value', 'Purchase Date', 'Retailer', 'Mashbill', 'Vintage',
    'Batch Number', 'Shelf', 'Notes'
  ];

  const rows = bottles.map(b => [
    b.name, b.distillery, b.region, b.type, b.age_statement || 'NAS',
    b.proof, b.abv, b.bottle_size, b.status, b.fill_level,
    b.purchase_price, b.msrp, b.secondary_market_value,
    b.purchase_date, b.retailer, b.mashbill, b.vintage,
    b.batch_number, b.custom_shelf,
    (b.notes || '').replace(/,/g, ';')
  ]);

  const csv = [headers, ...rows].map(row => row.map(v => `"${v || ''}"`).join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="bourbon-collection.csv"');
  res.send(csv);
});

// Shelves
router.get('/shelves', (req, res) => {
  const db = getDb();
  const shelves = db.prepare('SELECT * FROM shelves ORDER BY name').all();
  res.json(shelves);
});

module.exports = router;
