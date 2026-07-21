// Bulk product importer.
//
// Usage:
//   node scripts/import-products.js path/to/products.json
//   node scripts/import-products.js path/to/products.csv
//
// The JSON file should be an array of product objects, or an object with a
// `products` array. The CSV must have a header row; columns map directly to
// product fields (booleans: true/false/1/0, numbers: price/stock/etc.).
//
// Only `name` and `price` are required. Slug and SKU are auto-generated, and
// products whose slug already exists are skipped (idempotent re-runs).

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csvParse from './csv.js';
import db from '../src/lib/db.js';
import Product from '../src/models/Product.js';

dotenv.config();

const slugify = (name) =>
  String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const skuPrefix = {
  men: 'MN', women: 'WM', fragrances: 'FR', backpacks: 'BP',
  new: 'NW', popular: 'PP', sale: 'SL', featured: 'FT',
};
const generateSKU = async (category = 'GEN') => {
  const prefix = skuPrefix[category] || 'GN';
  const count = await Product.countDocuments({ category });
  const seq = String(count + 1).padStart(4, '0');
  const random = String(Math.floor(Math.random() * 100)).padStart(2, '0');
  return `${prefix}-${seq}-${random}`;
};

const coerce = (data) => {
  const bool = (v) => v === true || v === 'true' || v === '1';
  const num = (v) => (v === '' || v == null ? v : Number(v));
  if (data.isActive !== undefined) data.isActive = bool(data.isActive);
  if (data.featured !== undefined) data.featured = bool(data.featured);
  if (data.price !== undefined) data.price = num(data.price);
  if (data.originalPrice !== undefined) data.originalPrice = num(data.originalPrice);
  if (data.stock !== undefined) data.stock = num(data.stock);
  if (data.colorCount !== undefined) data.colorCount = num(data.colorCount);
  if (data.isActive === undefined) data.isActive = true;
  if (typeof data.tags === 'string') data.tags = data.tags.split(',').map((t) => t.trim()).filter(Boolean);
  if (typeof data.colors === 'string') {
    try { data.colors = JSON.parse(data.colors); } catch { data.colors = []; }
  }
  return data;
};

const parseFile = (file) => {
  const text = fs.readFileSync(file, 'utf-8');
  if (file.endsWith('.csv')) return csvParse(text);
  const data = JSON.parse(text);
  return Array.isArray(data) ? data : data.products;
};

const run = async () => {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/import-products.js <file.json|file.csv>');
    process.exit(1);
  }
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(1);
  }

  await db.connect(process.env.MONGODB_URI);

  const incoming = parseFile(file);
  console.log(`Parsed ${incoming.length} product(s) from ${file}`);

  const existingSlugs = new Set(
    (await Product.find({ slug: { $in: incoming.map((p) => slugify(p.name)) } }).lean()).map((p) => p.slug)
  );

  const toInsert = [];
  const skipped = [];
  const errors = [];

  for (const raw of incoming) {
    if (!raw.name) { errors.push({ error: 'name is required', row: raw }); continue; }
    const slug = slugify(raw.name);
    if (existingSlugs.has(slug)) { skipped.push(slug); continue; }
    try {
      const data = coerce({ ...raw });
      data.slug = slug;
      if (!data.sku) data.sku = await generateSKU(data.category);
      toInsert.push(data);
      existingSlugs.add(slug);
    } catch (e) {
      errors.push({ error: e.message, row: raw });
    }
  }

  if (toInsert.length) {
    const inserted = await Product.create(toInsert);
    console.log(`✅ Created ${inserted.length} product(s)`);
  } else {
    console.log('No new products to insert.');
  }
  if (skipped.length) console.log(`⏭️  Skipped ${skipped.length} duplicate(s)`);
  if (errors.length) console.log(`❌ ${errors.length} error(s)`);

  process.exit(0);
};

run().catch((err) => {
  console.error('Import failed:', err.message);
  process.exit(1);
});
