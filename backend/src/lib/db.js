import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// MongoDB (Atlas) backed data layer.
//
// This keeps the SAME public API the rest of the app already uses
// (defineCollection / genId / COLLECTIONS plus the Query/instance methods),
// so controllers and models work unchanged. The previous implementation was a
// file-based fake-Mongo; this one is real Mongoose talking to MongoDB Atlas.
// ---------------------------------------------------------------------------

const modelCache = {};
export const COLLECTIONS = {};

let connectionPromise = null;

export async function connect(uri) {
  if (!uri) {
    console.warn(
      '[db] MONGODB_URI is not set — database operations will fail. ' +
        'Set MONGODB_URI to your MongoDB Atlas connection string.'
    );
    return;
  }
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose
    .connect(uri, { serverSelectionTimeoutMS: 30000 })
    .then(() => {
      console.log('[db] Connected to MongoDB');
    })
    .catch((err) => {
      connectionPromise = null;
      console.error('[db] MongoDB connection error:', err.message);
      throw err;
    });

  return connectionPromise;
}

export function genId() {
  return crypto.randomBytes(8).toString('hex');
}

function buildSchema(name) {
  const schema = new mongoose.Schema(
    { _id: { type: String } },
    { strict: false, timestamps: true, minimize: false }
  );
  // Hide the password hash by default; opt in with .select('+password').
  if (name === 'users') {
    schema.path('password', { type: String, select: false });
  }
  return schema;
}

// Translate the old fake-Mongo `$text` search into a regex `$or`, so search
// keeps working without a text index and matches substrings like before.
function normalizeFilter(filter) {
  if (filter && typeof filter === 'object' && filter.$text) {
    const raw = filter.$text;
    const q = String(raw && raw.$search != null ? raw.$search : raw).toLowerCase();
    const f = { ...filter };
    delete f.$text;
    f.$or = [
      { name: { $regex: q, $options: 'i' } },
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } },
    ];
    return f;
  }
  return filter;
}

// Re-create the instance behaviour the controllers rely on (save / comparePassword)
// without polluting stored data (methods are non-enumerable).
function attachMethods(doc, name) {
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return doc;
  const model = modelCache[name];
  const opts = COLLECTIONS[name]?.options || {};

  Object.defineProperty(doc, 'save', {
    enumerable: false,
    configurable: true,
    value: async function () {
      if (opts.hooks?.beforeSave) await opts.hooks.beforeSave(this);
      const { _id, ...rest } = this;
      const updated = await model.findByIdAndUpdate(_id, rest, { new: true });
      return updated ? attachMethods(updated.toObject(), name) : null;
    },
  });

  if (name === 'users') {
    Object.defineProperty(doc, 'comparePassword', {
      enumerable: false,
      configurable: true,
      value: async function (candidate) {
        return bcrypt.compare(candidate, this.password || '');
      },
    });
  }

  return doc;
}

// Manual populate (mirrors the previous engine): only the `user` ref is used,
// and the schemaless model has no declared refs, so we resolve it ourselves.
async function applyPopulate(docs, pop) {
  const list = Array.isArray(docs) ? docs : [docs];
  const { path, fields } = pop;
  const refName = path === 'user' ? 'users' : `${path}s`;
  const refModel = modelCache[refName];

  for (const d of list) {
    const refId = d && d[path];
    if (refId != null && refModel) {
      const ref = await refModel.findById(refId).lean().exec();
      if (ref) {
        const populated =
          fields && fields.length
            ? { _id: ref._id }
            : { ...ref };
        if (fields && fields.length) {
          fields.forEach((f) => {
            if (f !== '_id') populated[f] = ref[f];
          });
        }
        d[path] = populated;
      }
    }
  }
  return docs;
}

class MQuery {
  constructor(model, filter, name) {
    this.model = model;
    this.name = name;
    this.mq = model.find(filter);
    this.single = false;
    this._populate = null;
  }

  sort(o) {
    this.mq = this.mq.sort(o);
    return this;
  }

  skip(n) {
    this.mq = this.mq.skip(Number(n) || 0);
    return this;
  }

  limit(n) {
    this.mq = this.mq.limit(Number(n));
    return this;
  }

  select(s) {
    this.mq = this.mq.select(s);
    return this;
  }

  lean() {
    return this;
  }

  populate(path, fields) {
    this._populate = {
      path,
      fields: typeof fields === 'string' ? fields.split(' ').map((f) => f.trim()).filter(Boolean) : fields,
    };
    return this;
  }

  async exec() {
    let docs = await this.mq.lean().exec();
    if (this.single) docs = docs[0] || null;
    if (this._populate) docs = await applyPopulate(docs, this._populate);
    if (Array.isArray(docs)) docs = docs.map((d) => attachMethods(d, this.name));
    else if (docs) docs = attachMethods(docs, this.name);
    return docs;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

export function defineCollection(name, options = {}) {
  if (!modelCache[name]) {
    modelCache[name] = mongoose.model(name, buildSchema(name), name);
  }
  const model = modelCache[name];
  const opts = options || {};

  const collection = {
    name,
    options: opts,
    model,

    find(filter = {}) {
      return new MQuery(model, normalizeFilter(filter), name);
    },

    findOne(filter = {}) {
      const q = new MQuery(model, normalizeFilter(filter), name);
      q.mq = q.mq.limit(1);
      q.single = true;
      return q;
    },

    findById(id) {
      const q = new MQuery(model, { _id: id }, name);
      q.mq = q.mq.limit(1);
      q.single = true;
      return q;
    },

    async create(doc) {
      const make = async (d) => {
        if (opts.hooks?.beforeCreate) await opts.hooks.beforeCreate(d);
        if (!d._id) d._id = genId();
        const created = await model.create(d);
        return attachMethods(created.toObject(), name);
      };
      if (Array.isArray(doc)) {
        const out = [];
        for (const d of doc) out.push(await make(d));
        return out;
      }
      return make(doc);
    },

    async findByIdAndUpdate(id, update, o = {}) {
      let updateObj = { ...update };
      // Run the model's beforeSave hook (e.g. hash passwords) like .save() does.
      if (opts.hooks?.beforeSave) {
        const existing = await model.findById(id).lean();
        const merged = { ...existing, ...update };
        await opts.hooks.beforeSave(merged);
        delete merged._id;
        updateObj = merged;
      }
      const updated = await model.findByIdAndUpdate(id, updateObj, {
        new: o.new ?? true,
        runValidators: o.runValidators,
      });
      return updated ? attachMethods(updated.toObject(), name) : null;
    },

    async findByIdAndDelete(id) {
      const removed = await model.findByIdAndDelete(id);
      return removed ? attachMethods(removed.toObject(), name) : null;
    },

    deleteOne(filter = {}) {
      return model.deleteOne(normalizeFilter(filter));
    },

    deleteMany(filter = {}) {
      return model.deleteMany(normalizeFilter(filter));
    },

    countDocuments(filter = {}) {
      return model.countDocuments(normalizeFilter(filter));
    },

    aggregate(pipeline) {
      return model.aggregate(pipeline).exec();
    },
  };

  COLLECTIONS[name] = collection;
  return collection;
}

export default { defineCollection, genId, COLLECTIONS, connect };
