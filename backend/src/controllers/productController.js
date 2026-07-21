import Product from '../models/Product.js';
import { uploadToCloudinary } from '../middleware/upload.js';

export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      sort = 'createdAt',
      order = 'desc',
      search,
      minPrice,
      maxPrice,
      featured,
      isActive,
    } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (featured === 'true') filter.featured = { $in: [true, 'true'] };
    // `isActive` from the admin panel is sent as `null` (no filter). Treat
    // 'true'/'false' as explicit states, 'null'/'all'/'' as "show all", and
    // undefined (storefront) as active-only by default. Accept both boolean
    // and string forms since FormData serializes booleans to strings.
    if (isActive === 'true') filter.isActive = { $in: [true, 'true'] };
    else if (isActive === 'false') filter.isActive = { $in: [false, 'false'] };
    else if (isActive === 'null' || isActive === 'all' || isActive === '') {
      // no isActive filter — show active and inactive
    } else filter.isActive = { $in: [true, 'true'] };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Map frontend sort values to MongoDB sort objects
    const sortMap = {
      featured: { featured: -1, createdAt: -1 },
      newest: { createdAt: -1 },
      'price-low': { price: 1 },
      'price-high': { price: -1 },
    };
    const sortObj = sortMap[sort] || { createdAt: -1 };

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateSKU = async (category = 'GEN') => {
  const prefix = {
    men: 'MN',
    women: 'WM',
    fragrances: 'FR',
    backpacks: 'BP',
    new: 'NW',
    popular: 'PP',
    sale: 'SL',
    featured: 'FT',
  }[category] || 'GN';

  const count = await Product.countDocuments({ category });
  const seq = String(count + 1).padStart(4, '0');
  const random = String(Math.floor(Math.random() * 100)).padStart(2, '0');
  return `${prefix}-${seq}-${random}`;
};

const coerceProductFields = (data) => {
  // FormData serializes booleans/numbers to strings. Normalize so storefront
  // filters (which compare against real booleans/numbers) match correctly.
  if (data.isActive !== undefined) data.isActive = data.isActive === true || data.isActive === 'true';
  if (data.featured !== undefined) data.featured = data.featured === true || data.featured === 'true';
  if (data.price !== undefined && data.price !== '') data.price = Number(data.price);
  if (data.originalPrice !== undefined && data.originalPrice !== '') data.originalPrice = Number(data.originalPrice);
  if (data.stock !== undefined && data.stock !== '') data.stock = Number(data.stock);
  if (data.colorCount !== undefined && data.colorCount !== '') data.colorCount = Number(data.colorCount);
  // New products default to active so they appear in the storefront.
  if (data.isActive === undefined) data.isActive = true;
  return data;
};

export const createProduct = async (req, res) => {
  try {
    const productData = coerceProductFields({ ...req.body });

    // Generate slug from name
    productData.slug = productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Auto-generate SKU if not provided
    if (!productData.sku) {
      productData.sku = await generateSKU(productData.category);
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      const uploadResults = await Promise.all(req.files.map((file) => uploadToCloudinary(file)));
      productData.images = uploadResults.map((result) => result.secure_url);
    } else if (req.body.images) {
      productData.images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    // Parse colors if sent as string
    if (typeof productData.colors === 'string') {
      try {
        productData.colors = JSON.parse(productData.colors);
      } catch {
        productData.colors = [];
      }
    }

    // Parse tags if sent as string
    if (typeof productData.tags === 'string') {
      try {
        productData.tags = JSON.parse(productData.tags);
      } catch {
        productData.tags = productData.tags.split(',').map((t) => t.trim());
      }
    }

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk-create products from an array of product objects. Auto-generates slug
// and SKU (like createProduct) and coerces field types. Skips duplicates that
// share an existing slug so re-running an import is idempotent.
export const bulkCreateProducts = async (req, res) => {
  try {
    const incoming = Array.isArray(req.body) ? req.body : req.body?.products;
    if (!Array.isArray(incoming) || incoming.length === 0) {
      return res.status(400).json({ message: 'Provide a non-empty array of products' });
    }

    const existingSlugs = new Set(
      (await Product.find({ slug: { $in: incoming.map((p) => slugify(p.name)) } }).lean()).map((p) => p.slug)
    );

    const toInsert = [];
    const skipped = [];
    const errors = [];

    for (const raw of incoming) {
      try {
        if (!raw.name) {
          errors.push({ row: raw, error: 'name is required' });
          continue;
        }
        const slug = slugify(raw.name);
        if (existingSlugs.has(slug)) {
          skipped.push(slug);
          continue;
        }
        const data = coerceProductFields({ ...raw });
        data.slug = slug;
        if (!data.sku) data.sku = await generateSKU(data.category);
        if (typeof data.tags === 'string') {
          data.tags = data.tags.split(',').map((t) => t.trim()).filter(Boolean);
        }
        if (typeof data.colors === 'string') {
          try { data.colors = JSON.parse(data.colors); } catch { data.colors = []; }
        }
        toInsert.push(data);
        existingSlugs.add(slug);
      } catch (e) {
        errors.push({ row: raw, error: e.message });
      }
    }

    let inserted = [];
    if (toInsert.length) {
      inserted = await Product.create(toInsert);
    }

    res.status(201).json({
      created: inserted.length,
      skipped: skipped.length,
      errors: errors.length,
      details: { skipped, errors },
      products: inserted,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const slugify = (name) =>
  String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const updateProduct = async (req, res) => {
  try {
    const productData = coerceProductFields({ ...req.body });

    // Regenerate slug if name changed
    if (productData.name) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      const uploadResults = await Promise.all(req.files.map((file) => uploadToCloudinary(file)));
      const newImages = uploadResults.map((result) => result.secure_url);
      productData.images = [...(productData.existingImages || []), ...newImages];
    }

    // Parse colors if sent as string
    if (typeof productData.colors === 'string') {
      try {
        productData.colors = JSON.parse(productData.colors);
      } catch {
        productData.colors = [];
      }
    }

    // Parse tags if sent as string
    if (typeof productData.tags === 'string') {
      try {
        productData.tags = JSON.parse(productData.tags);
      } catch {
        productData.tags = productData.tags.split(',').map((t) => t.trim());
      }
    }

    delete productData.existingImages;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    product.isActive = !product.isActive;
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLowStockProducts = async (req, res) => {
  try {
    const threshold = req.query.threshold || 10;
    const products = await Product.find({
      stock: { $lte: threshold },
      isActive: true,
    }).sort({ stock: 1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
