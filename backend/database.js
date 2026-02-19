const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'bourbon_collection.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema();
  }
  return db;
}

function initializeSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bottles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      distillery TEXT NOT NULL,
      region TEXT DEFAULT 'Kentucky',
      type TEXT DEFAULT 'Bourbon',
      mashbill TEXT,
      grain_bill TEXT,
      age_statement INTEGER,
      proof REAL,
      abv REAL,
      bottle_size INTEGER DEFAULT 750,
      vintage TEXT,
      batch_number TEXT,
      status TEXT DEFAULT 'sealed' CHECK(status IN ('sealed','open','finished','traded','gifted')),
      fill_level INTEGER DEFAULT 100,
      purchase_price REAL,
      purchase_date TEXT,
      retailer TEXT,
      msrp REAL,
      secondary_market_value REAL,
      photo_url TEXT,
      notes TEXT,
      is_gift INTEGER DEFAULT 0,
      gift_from TEXT,
      gift_to TEXT,
      custom_shelf TEXT DEFAULT 'Main Collection',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasting_sessions (
      id TEXT PRIMARY KEY,
      bottle_id TEXT NOT NULL,
      tasting_date TEXT NOT NULL,
      occasion TEXT,
      score INTEGER CHECK(score >= 1 AND score <= 100),
      nose TEXT,
      palate TEXT,
      finish TEXT,
      overall_notes TEXT,
      flavor_tags TEXT,
      pour_amount REAL DEFAULT 1.5,
      shared_with TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (bottle_id) REFERENCES bottles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      distillery TEXT,
      region TEXT,
      type TEXT DEFAULT 'Bourbon',
      estimated_price REAL,
      priority INTEGER DEFAULT 3 CHECK(priority >= 1 AND priority <= 5),
      notes TEXT,
      where_to_find TEXT,
      added_date TEXT DEFAULT (datetime('now')),
      acquired INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS shelves (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      color TEXT DEFAULT '#C8860A',
      icon TEXT DEFAULT 'shelves',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_bottles_status ON bottles(status);
    CREATE INDEX IF NOT EXISTS idx_bottles_region ON bottles(region);
    CREATE INDEX IF NOT EXISTS idx_bottles_distillery ON bottles(distillery);
    CREATE INDEX IF NOT EXISTS idx_tasting_bottle_id ON tasting_sessions(bottle_id);
  `);

  seedDefaultShelves();
  seedSampleData();
}

function seedDefaultShelves() {
  const count = db.prepare('SELECT COUNT(*) as c FROM shelves').get();
  if (count.c > 0) return;

  const shelves = [
    { id: 'shelf-1', name: 'Main Collection', description: 'Primary bourbon collection', color: '#C8860A', icon: 'shelves' },
    { id: 'shelf-2', name: 'Daily Drinkers', description: 'Bottles for everyday enjoyment', color: '#8B4513', icon: 'local_bar' },
    { id: 'shelf-3', name: 'Allocated', description: 'Hard to find allocated bottles', color: '#FFD700', icon: 'star' },
    { id: 'shelf-4', name: 'For Trading', description: 'Bottles available for trading', color: '#4A90D9', icon: 'swap_horiz' },
    { id: 'shelf-5', name: 'Special Occasions', description: 'Reserve for special moments', color: '#8E44AD', icon: 'celebration' },
  ];

  const insert = db.prepare('INSERT OR IGNORE INTO shelves (id, name, description, color, icon) VALUES (?, ?, ?, ?, ?)');
  for (const shelf of shelves) {
    insert.run(shelf.id, shelf.name, shelf.description, shelf.color, shelf.icon);
  }
}

function seedSampleData() {
  const count = db.prepare('SELECT COUNT(*) as c FROM bottles').get();
  if (count.c > 0) return;

  const bottles = [
    {
      id: 'bottle-1', name: "Buffalo Trace", distillery: "Buffalo Trace", region: "Kentucky",
      type: "Bourbon", mashbill: "Mash Bill #1", age_statement: null, proof: 90, abv: 45,
      bottle_size: 750, status: "open", fill_level: 65, purchase_price: 29.99, msrp: 29.99,
      secondary_market_value: 35, purchase_date: "2024-10-15", retailer: "Total Wine",
      notes: "Classic everyday bourbon. Great value.", custom_shelf: "Daily Drinkers",
      grain_bill: "Corn, Rye, Malted Barley", vintage: null, batch_number: null
    },
    {
      id: 'bottle-2', name: "Pappy Van Winkle 15 Year", distillery: "Buffalo Trace",
      region: "Kentucky", type: "Bourbon", mashbill: "Wheated Bourbon", age_statement: 15,
      proof: 107, abv: 53.5, bottle_size: 750, status: "sealed", fill_level: 100,
      purchase_price: 150, msrp: 119.99, secondary_market_value: 1200,
      purchase_date: "2023-11-20", retailer: "Lottery Win - ABC Fine Wine",
      notes: "Won in store lottery! Holding for a special occasion.", custom_shelf: "Special Occasions",
      grain_bill: "Corn, Wheat, Malted Barley", vintage: "2023", batch_number: null
    },
    {
      id: 'bottle-3', name: "Blanton's Original", distillery: "Buffalo Trace",
      region: "Kentucky", type: "Bourbon", mashbill: "Mash Bill #2", age_statement: null,
      proof: 93, abv: 46.5, bottle_size: 750, status: "open", fill_level: 40,
      purchase_price: 69.99, msrp: 64.99, secondary_market_value: 120,
      purchase_date: "2024-08-03", retailer: "Local Liquor Store",
      notes: "Single barrel bourbon. This barrel was exceptional.", custom_shelf: "Main Collection",
      grain_bill: "Corn, Rye, Malted Barley", vintage: null, batch_number: "S23F"
    },
    {
      id: 'bottle-4', name: "Elijah Craig Barrel Proof B524", distillery: "Heaven Hill",
      region: "Kentucky", type: "Bourbon", mashbill: "Heaven Hill Mash Bill", age_statement: 12,
      proof: 124.2, abv: 62.1, bottle_size: 750, status: "open", fill_level: 80,
      purchase_price: 89.99, msrp: 59.99, secondary_market_value: 130,
      purchase_date: "2024-09-10", retailer: "Spec's",
      notes: "Amazing barrel proof. Surprisingly approachable neat.", custom_shelf: "Main Collection",
      grain_bill: "Corn, Rye, Malted Barley", vintage: null, batch_number: "B524"
    },
    {
      id: 'bottle-5', name: "Four Roses Single Barrel", distillery: "Four Roses",
      region: "Kentucky", type: "Bourbon", mashbill: "OBSV", age_statement: 11,
      proof: 100, abv: 50, bottle_size: 750, status: "sealed", fill_level: 100,
      purchase_price: 59.99, msrp: 54.99, secondary_market_value: 85,
      purchase_date: "2024-07-22", retailer: "Binny's",
      notes: "Picked from barrel #47-7L. Floral and fruity.", custom_shelf: "Allocated",
      grain_bill: "Corn, Rye, Malted Barley", vintage: null, batch_number: "47-7L"
    },
    {
      id: 'bottle-6', name: "Weller Special Reserve", distillery: "Buffalo Trace",
      region: "Kentucky", type: "Bourbon", mashbill: "Wheated Bourbon", age_statement: null,
      proof: 90, abv: 45, bottle_size: 1750, status: "open", fill_level: 55,
      purchase_price: 44.99, msrp: 24.99, secondary_market_value: 65,
      purchase_date: "2024-06-14", retailer: "MSRP Score at Kroger",
      notes: "The poor man's Pappy. Fantastic value when found at MSRP.", custom_shelf: "Daily Drinkers",
      grain_bill: "Corn, Wheat, Malted Barley", vintage: null, batch_number: null
    },
    {
      id: 'bottle-7', name: "Angel's Envy Port Finish", distillery: "Angel's Envy",
      region: "Kentucky", type: "Bourbon", mashbill: "High Wheat", age_statement: null,
      proof: 86.6, abv: 43.3, bottle_size: 750, status: "finished", fill_level: 0,
      purchase_price: 49.99, msrp: 44.99, secondary_market_value: 55,
      purchase_date: "2024-02-10", retailer: "Total Wine",
      notes: "Loved the port finish - sweet and silky. Will buy again.", custom_shelf: "Main Collection",
      grain_bill: "Corn, Wheat, Malted Barley, Malted Rye", vintage: null, batch_number: null
    },
    {
      id: 'bottle-8', name: "Nikka From the Barrel", distillery: "Nikka",
      region: "Japanese", type: "Japanese Whisky", mashbill: "Blend", age_statement: null,
      proof: 102.8, abv: 51.4, bottle_size: 500, status: "open", fill_level: 70,
      purchase_price: 79.99, msrp: 74.99, secondary_market_value: 95,
      purchase_date: "2024-11-05", retailer: "K&L Wine Merchants",
      notes: "Mind-blowing complexity at this price point. Japanese excellence.", custom_shelf: "Main Collection",
      grain_bill: "Blend of malt and grain whiskies", vintage: null, batch_number: null
    },
    {
      id: 'bottle-9', name: "Maker's Mark Cask Strength", distillery: "Maker's Mark",
      region: "Kentucky", type: "Bourbon", mashbill: "Wheated", age_statement: null,
      proof: 111.6, abv: 55.8, bottle_size: 750, status: "sealed", fill_level: 100,
      purchase_price: 39.99, msrp: 34.99, secondary_market_value: 50,
      purchase_date: "2024-12-01", retailer: "Costco",
      notes: "Great find at Costco. Cask strength Makers is a treat.", custom_shelf: "Main Collection",
      grain_bill: "Corn, Red Winter Wheat, Malted Barley", vintage: null, batch_number: null
    },
    {
      id: 'bottle-10', name: "Michter's 10 Year", distillery: "Michter's",
      region: "Kentucky", type: "Bourbon", mashbill: "Proprietary", age_statement: 10,
      proof: 94.4, abv: 47.2, bottle_size: 750, status: "sealed", fill_level: 100,
      purchase_price: 189.99, msrp: 149.99, secondary_market_value: 280,
      purchase_date: "2024-05-18", retailer: "Spec's",
      notes: "Annual release. Picked up two this year.", custom_shelf: "Allocated",
      grain_bill: "Corn, Rye, Malted Barley", vintage: "2024", batch_number: null
    }
  ];

  const insertBottle = db.prepare(`
    INSERT INTO bottles (id, name, distillery, region, type, mashbill, grain_bill, age_statement,
      proof, abv, bottle_size, vintage, batch_number, status, fill_level, purchase_price, purchase_date,
      retailer, msrp, secondary_market_value, notes, custom_shelf)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const b of bottles) {
    insertBottle.run(
      b.id, b.name, b.distillery, b.region, b.type, b.mashbill, b.grain_bill,
      b.age_statement, b.proof, b.abv, b.bottle_size, b.vintage, b.batch_number,
      b.status, b.fill_level, b.purchase_price, b.purchase_date, b.retailer,
      b.msrp, b.secondary_market_value, b.notes, b.custom_shelf
    );
  }

  const tastings = [
    {
      id: 't-1', bottle_id: 'bottle-1', tasting_date: '2024-10-20', occasion: 'Casual Friday',
      score: 82, nose: 'Vanilla, caramel, hints of oak and a touch of citrus zest',
      palate: 'Sweet corn, toffee, light spice with rye pepper on the mid-palate',
      finish: 'Medium finish, warm with lingering caramel and light wood',
      overall_notes: 'Reliable everyday pour. Always delivers consistency.',
      flavor_tags: '["vanilla","caramel","corn","oak","citrus"]', pour_amount: 1.5
    },
    {
      id: 't-2', bottle_id: 'bottle-1', tasting_date: '2024-11-05', occasion: 'Neat at home',
      score: 84, nose: 'More oak than before, slight dusty quality. Caramel and cherry.',
      palate: 'Rounder than I remember. Vanilla forward, baking spices',
      finish: 'Clean, moderate length. Satisfying.',
      overall_notes: 'Getting better as the bottle opens up!',
      flavor_tags: '["vanilla","cherry","oak","baking spices","caramel"]', pour_amount: 2.0
    },
    {
      id: 't-3', bottle_id: 'bottle-3', tasting_date: '2024-08-15', occasion: 'Birthday celebration',
      score: 92, nose: 'Floral, orange blossom, honey, vanilla bean, slight nutmeg',
      palate: 'Honeyed sweetness, dried fruits, creamy mouthfeel, toasted oak',
      finish: 'Long, elegant finish with lingering honey and spice',
      overall_notes: 'Single barrel magic. This barrel (#S23F) is exceptional.',
      flavor_tags: '["floral","honey","orange","vanilla","oak","spice"]', pour_amount: 1.5,
      shared_with: 'Sarah'
    },
    {
      id: 't-4', bottle_id: 'bottle-4', tasting_date: '2024-09-20', occasion: 'Whiskey club',
      score: 95, nose: 'Dark chocolate, espresso, dark cherry, char, leather',
      palate: 'Massive mouthfeel. Dark fruit jam, brown sugar, char, tobacco leaf',
      finish: 'Extremely long, warming, complex with evolving flavors for minutes',
      overall_notes: 'Best ECBP batch I have tried. A new benchmark.',
      flavor_tags: '["chocolate","espresso","cherry","char","leather","tobacco"]', pour_amount: 1.5,
      shared_with: 'Whiskey Club'
    },
    {
      id: 't-5', bottle_id: 'bottle-8', tasting_date: '2024-11-10', occasion: 'Comparative tasting',
      score: 94, nose: 'Dried fruits, honey, white chocolate, subtle peat, orange peel',
      palate: 'Incredible complexity. Sherry influence, tropical fruits, malt, gentle smokiness',
      finish: 'Very long, warming, alternating sweet and savory notes',
      overall_notes: 'This is why people get into Japanese whisky. Stunning.',
      flavor_tags: '["dried fruit","honey","white chocolate","peat","orange","sherry","tropical"]', pour_amount: 1.0
    }
  ];

  const insertTasting = db.prepare(`
    INSERT INTO tasting_sessions (id, bottle_id, tasting_date, occasion, score, nose, palate,
      finish, overall_notes, flavor_tags, pour_amount, shared_with)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const t of tastings) {
    insertTasting.run(
      t.id, t.bottle_id, t.tasting_date, t.occasion, t.score, t.nose, t.palate,
      t.finish, t.overall_notes, t.flavor_tags, t.pour_amount, t.shared_with || null
    );
  }

  const wishlistItems = [
    {
      id: 'w-1', name: "William Larue Weller", distillery: "Buffalo Trace", region: "Kentucky",
      type: "Bourbon", estimated_price: 120, priority: 5,
      notes: "Buffalo Trace Antique Collection. Top of my list.", where_to_find: "Lottery, Secondary market"
    },
    {
      id: 'w-2', name: "George T. Stagg", distillery: "Buffalo Trace", region: "Kentucky",
      type: "Bourbon", estimated_price: 120, priority: 5,
      notes: "BTAC holy grail. One day...", where_to_find: "Lottery, Auction sites"
    },
    {
      id: 'w-3', name: "Old Forester Birthday Bourbon 2024", distillery: "Old Forester",
      region: "Kentucky", type: "Bourbon", estimated_price: 80, priority: 4,
      notes: "Annual release, always impressive", where_to_find: "Total Wine lottery"
    },
    {
      id: 'w-4', name: "Hibiki 21 Year", distillery: "Suntory", region: "Japanese",
      type: "Japanese Whisky", estimated_price: 500, priority: 3,
      notes: "Dream bottle. Save up for it.", where_to_find: "K&L, Spec's, Online"
    },
    {
      id: 'w-5', name: "Glenfarclas 25 Year", distillery: "Glenfarclas", region: "Scotch",
      type: "Single Malt Scotch", estimated_price: 200, priority: 3,
      notes: "Heard great things about the sherry cask influence", where_to_find: "Spec's, Total Wine"
    }
  ];

  const insertWishlist = db.prepare(`
    INSERT INTO wishlist (id, name, distillery, region, type, estimated_price, priority, notes, where_to_find)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const w of wishlistItems) {
    insertWishlist.run(w.id, w.name, w.distillery, w.region, w.type, w.estimated_price, w.priority, w.notes, w.where_to_find);
  }
}

module.exports = { getDb };
