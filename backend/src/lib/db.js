import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', '..', 'data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const cache = {}; // collection name -> array (in memory)

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function load(name) {
  if (cache[name]) return cache[name];
  try {
    const raw = fs.readFileSync(filePath(name), 'utf-8');
    cache[name] = JSON.parse(raw);
  } catch {
    cache[name] = [];
  }
  return cache[name];
}

function persist(name) {
  fs.writeFileSync(filePath(name), JSON.stringify(cache[name], null, 2));
}

export function genId() {
  return crypto.randomBytes(8).toString('hex');
}

function getPath(obj, p) {
  return p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function setPath(obj, p, val) {
  const keys = p.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (cur[keys[i]] == null) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = val;
}

function toComparable(v) {
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'string' && !isNaN(Date.parse(v))) return new Date(v).getTime();
  if (typeof v === 'number') return v;
  return v;
}

function matchDoc(doc, filter) {
  for (const [key, cond] of Object.entries(filter)) {
    if (key === '$or') {
      if (!cond.some((sub) => matchDoc(doc, sub))) return false;
      continue;
    }
    if (key === '$and') {
      if (!cond.every((sub) => matchDoc(doc, sub))) return false;
      continue;
    }
    if (key === '$text') {
      const q = String(cond.$search || cond || '').toLowerCase();
      const hay = [doc.name, doc.title, doc.description, (doc.tags || []).join(' ')]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
      continue;
    }
    const value = getPath(doc, key);
    if (cond && typeof cond === 'object' && !Array.isArray(cond)) {
      let ok = true;
      for (const [op, opVal] of Object.entries(cond)) {
        if (op === '$gte') {
          if (!(toComparable(value) >= toComparable(opVal))) ok = false;
        } else if (op === '$gt') {
          if (!(toComparable(value) > toComparable(opVal))) ok = false;
        } else if (op === '$lte') {
          if (!(toComparable(value) <= toComparable(opVal))) ok = false;
        } else if (op === '$lt') {
          if (!(toComparable(value) < toComparable(opVal))) ok = false;
        } else if (op === '$ne') {
          if (value === opVal) ok = false;
        } else if (op === '$in') {
          if (!opVal.includes(value)) ok = false;
        } else if (op === '$regex') {
          const re = new RegExp(opVal, cond.$options || '');
          if (!re.test(String(value ?? ''))) ok = false;
        } else if (op === '$eq') {
          if (value !== opVal) ok = false;
        } else {
          if (value !== opVal) ok = false;
        }
      }
      if (!ok) return false;
    } else if (value !== cond) {
      return false;
    }
  }
  return true;
}

function applyHidden(doc, collectionName) {
  const hidden = COLLECTIONS[collectionName]?.hidden || [];
  if (!hidden.length) return doc;
  const copy = { ...doc };
  hidden.forEach((h) => delete copy[h]);
  return copy;
}

// Attach instance behaviour (save, comparePassword) without polluting stored data
function attachMethods(doc, collectionName) {
  const def = (obj, prop, fn) =>
    Object.defineProperty(obj, prop, { value: fn, enumerable: false, configurable: true });

  def(doc, 'save', async function (opts) {
    const col = COLLECTIONS[collectionName];
    const list = load(collectionName);
    const idx = list.findIndex((d) => d._id === doc._id);
    const merged = idx >= 0 ? { ...list[idx], ...doc, _id: doc._id } : { ...doc, _id: doc._id || genId(), createdAt: new Date().toISOString() };
    if (col?.hooks?.beforeSave) await col.hooks.beforeSave(merged);
    if (idx >= 0) {
      list[idx] = merged;
      list[idx].updatedAt = new Date().toISOString();
    } else {
      list.push(merged);
    }
    persist(collectionName);
    return doc;
  });

  if (collectionName === 'users') {
    def(doc, 'comparePassword', async function (candidate) {
      return bcrypt.compare(candidate, doc.password || '');
    });
  }
  return doc;
}

class Query {
  constructor(collectionName, filter = {}) {
    this.collectionName = collectionName;
    this.filter = filter;
    this.sortObj = null;
    this.skipN = 0;
    this.limitN = null;
    this.populatePath = null;
    this.populateFields = null;
    this.selectStr = null;
  }

  sort(obj) {
    this.sortObj = obj;
    return this;
  }

  skip(n) {
    this.skipN = Number(n) || 0;
    return this;
  }

  limit(n) {
    this.limitN = Number(n);
    return this;
  }

  select(str) {
    this.selectStr = str;
    return this;
  }

  populate(path, fields) {
    this.populatePath = path;
    this.populateFields = typeof fields === 'string' ? fields.split(' ').filter(Boolean) : fields;
    return this;
  }

  async exec() {
    let docs = load(this.collectionName).filter((d) => matchDoc(d, this.filter));

    if (this.sortObj) {
      const keys = Object.keys(this.sortObj);
      docs.sort((a, b) => {
        for (const k of keys) {
          const dir = this.sortObj[k];
          const av = getPath(a, k);
          const bv = getPath(b, k);
          if (av < bv) return dir === 1 || dir === 'asc' ? -1 : 1;
          if (av > bv) return dir === 1 || dir === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    if (this.skipN) docs = docs.slice(this.skipN);
    if (this.limitN != null) docs = docs.slice(0, this.limitN);

    let result = docs.map((d) => {
      let out = { ...d };
      // select handling
      const hidden = COLLECTIONS[this.collectionName]?.hidden || [];
      if (this.selectStr) {
        const parts = this.selectStr.split(' ').map((s) => s.trim()).filter(Boolean);
        const includePassword = parts.some((p) => p === '+password' || p === 'password');
        if (!includePassword) hidden.forEach((h) => delete out[h]);
      } else {
        hidden.forEach((h) => delete out[h]);
      }
      return attachMethods(out, this.collectionName);
    });

    if (this.populatePath) {
      result = result.map((d) => {
        const refId = getPath(d, this.populatePath);
        if (refId == null) return d;
        const refName = this.populatePath === 'user' ? 'users' : `${this.populatePath}s`;
        const ref = load(refName).find((r) => r._id === refId);
        if (ref) {
          let populated = { _id: ref._id };
          if (this.populateFields) {
            this.populateFields.forEach((f) => {
              if (f !== '_id') setPath(populated, f, getPath(ref, f));
            });
          } else {
            populated = { ...ref };
          }
          setPath(d, this.populatePath, populated);
        }
        return d;
      });
    }

    if (this.single) return result[0] || null;
    return result;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

class Collection {
  constructor(name, options = {}) {
    this.name = name;
    this.hidden = options.hidden || [];
    this.hooks = options.hooks || {};
    load(name);
  }

  find(filter = {}) {
    return new Query(this.name, filter);
  }

  findOne(filter = {}) {
    const q = new Query(this.name, filter).limit(1);
    q.single = true;
    return q;
  }

  findById(id) {
    const q = new Query(this.name, { _id: id }).limit(1);
    q.single = true;
    return q;
  }

  async create(doc) {
    const list = load(this.name);
    const make = async (d) => {
      if (this.hooks?.beforeCreate) await this.hooks.beforeCreate(d);
      const now = new Date().toISOString();
      const fresh = { ...d, _id: d._id || genId(), createdAt: d.createdAt || now };
      fresh.updatedAt = fresh.updatedAt || now;
      list.push(fresh);
      return attachMethods({ ...fresh }, this.name);
    };
    let result;
    if (Array.isArray(doc)) {
      result = [];
      for (const d of doc) result.push(await make(d));
    } else {
      result = await make(doc);
    }
    persist(this.name);
    return result;
  }

  async findByIdAndUpdate(id, update, opts = {}) {
    const list = load(this.name);
    const idx = list.findIndex((d) => d._id === id);
    if (idx < 0) return null;
    list[idx] = { ...list[idx], ...update, _id: id, updatedAt: new Date().toISOString() };
    persist(this.name);
    return attachMethods({ ...list[idx] }, this.name);
  }

  async findByIdAndDelete(id) {
    const list = load(this.name);
    const idx = list.findIndex((d) => d._id === id);
    if (idx < 0) return null;
    const [removed] = list.splice(idx, 1);
    persist(this.name);
    return removed;
  }

  async deleteOne(filter = {}) {
    const list = load(this.name);
    const idx = list.findIndex((d) => matchDoc(d, filter));
    if (idx < 0) return { deletedCount: 0 };
    list.splice(idx, 1);
    persist(this.name);
    return { deletedCount: 1 };
  }

  async deleteMany(filter = {}) {
    const list = load(this.name);
    const before = list.length;
    const kept = list.filter((d) => !matchDoc(d, filter));
    cache[this.name] = kept;
    persist(this.name);
    return { deletedCount: before - kept.length };
  }

  async countDocuments(filter = {}) {
    return load(this.name).filter((d) => matchDoc(d, filter)).length;
  }

  aggregate(pipeline = []) {
    return runAggregation(this.name, pipeline);
  }
}

// ---- Minimal aggregation engine ----
function evalExpr(expr, doc) {
  if (expr && typeof expr === 'object' && !Array.isArray(expr)) {
    if ('$multiply' in expr) return expr.$multiply.reduce((acc, e) => acc * evalExpr(e, doc), 1);
    if ('$sum' in expr) return evalExpr(expr.$sum, doc);
    if ('$first' in expr) return evalExpr(expr.$first, doc);
    if ('$dateToString' in expr) {
      const d = new Date(evalExpr(expr.$dateToString.date, doc));
      if (isNaN(d)) return null;
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
    if ('$year' in expr) return new Date(evalExpr(expr.$year, doc)).getFullYear();
  }
  if (typeof expr === 'string' && expr.startsWith('$')) return getPath(doc, expr.slice(1));
  return expr;
}

function runAggregation(collectionName, pipeline) {
  let docs = load(collectionName).map((d) => ({ ...d }));

  for (const stage of pipeline) {
    const [op] = Object.keys(stage);
    const spec = stage[op];

    if (op === '$match') {
      docs = docs.filter((d) => matchDoc(d, spec));
    } else if (op === '$unwind') {
      const path = spec.$unwind || spec;
      const field = path.replace(/^\$/, '');
      const arr = [];
      for (const d of docs) {
        const val = getPath(d, field) || [];
        if (Array.isArray(val)) {
          for (const v of val) {
            const copy = { ...d };
            setPath(copy, field, v);
            arr.push(copy);
          }
        } else {
          arr.push(d);
        }
      }
      docs = arr;
    } else if (op === '$group') {
      const groups = {};
      const out = [];
      for (const d of docs) {
        let key;
        if (spec._id && typeof spec._id === 'object' && !Array.isArray(spec._id)) {
          key = JSON.stringify(evalExpr(spec._id, d));
        } else {
          key = JSON.stringify(evalExpr(spec._id, d));
        }
        if (!groups[key]) {
          groups[key] = { _id: key.startsWith('"') ? JSON.parse(key) : key, __acc: {} };
          out.push(groups[key]);
        }
        const g = groups[key];
        for (const [field, acc] of Object.entries(spec)) {
          if (field === '_id') continue;
          const opName = Object.keys(acc)[0];
          const operand = acc[opName];
          if (opName === '$sum') {
            g.__acc[field] = (g.__acc[field] || 0) + evalExpr(operand, d);
          } else if (opName === '$first') {
            if (!(field in g.__acc)) g.__acc[field] = evalExpr(operand, d);
          } else if (opName === '$avg') {
            g.__acc[field] = g.__acc[field] || { sum: 0, n: 0 };
            g.__acc[field].sum += evalExpr(operand, d);
            g.__acc[field].n += 1;
          } else if (opName === '$min') {
            const v = evalExpr(operand, d);
            g.__acc[field] = g.__acc[field] == null ? v : Math.min(g.__acc[field], v);
          } else if (opName === '$max') {
            const v = evalExpr(operand, d);
            g.__acc[field] = g.__acc[field] == null ? v : Math.max(g.__acc[field], v);
          }
        }
      }
      // finalize
      docs = out.map((g) => {
        const r = { _id: g._id };
        for (const [field, val] of Object.entries(g.__acc)) {
          if (val && typeof val === 'object' && 'sum' in val) r[field] = val.sum / val.n;
          else r[field] = val;
        }
        return r;
      });
    } else if (op === '$sort') {
      const keys = Object.keys(spec);
      docs.sort((a, b) => {
        for (const k of keys) {
          const dir = spec[k];
          const av = getPath(a, k);
          const bv = getPath(b, k);
          if (av < bv) return dir === 1 ? -1 : 1;
          if (av > bv) return dir === 1 ? 1 : -1;
        }
        return 0;
      });
    } else if (op === '$limit') {
      docs = docs.slice(0, spec);
    } else if (op === '$skip') {
      docs = docs.slice(spec);
    } else if (op === '$project') {
      docs = docs.map((d) => {
        const r = {};
        for (const [field, val] of Object.entries(spec)) {
          if (val === 0 || val === false) continue;
          r[field] = evalExpr(val, d);
        }
        return r;
      });
    }
  }
  return Promise.resolve(docs);
}

// Registry
export const COLLECTIONS = {};
export function defineCollection(name, options) {
  const col = new Collection(name, options);
  COLLECTIONS[name] = col;
  return col;
}

export default { defineCollection, genId, COLLECTIONS };
