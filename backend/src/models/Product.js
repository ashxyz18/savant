import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000,
  },
  shortDescription: {
    type: String,
    maxlength: 300,
    default: '',
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  originalPrice: {
    type: Number,
    default: null,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['men', 'women', 'fragrances', 'backpacks', 'new', 'popular', 'sale', 'featured'],
    default: 'new',
  },
  subcategory: {
    type: String,
    trim: true,
  },
  material: {
    type: String,
    default: 'Premium Leather',
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: 0,
    default: 10,
  },
  colorCount: {
    type: Number,
    default: 3,
  },
  colors: [{
    name: String,
    hex: String,
  }],
  fastShipping: {
    type: Boolean,
    default: false,
  },
  emoji: {
    type: String,
    default: '👜',
  },
  images: [{
    type: String,
  }],
  featured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  tags: [{
    type: String,
  }],
}, {
  timestamps: true,
});

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });

productSchema.pre('save', function (next) {
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  } else if (!this.originalPrice) {
    this.discount = 0;
  }
  next();
});

export default mongoose.model('Product', productSchema);
