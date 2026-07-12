import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Brand name is required'],
    trim: true,
    maxlength: 100,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  logo: {
    type: String,
    default: '',
  },
  website: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

brandSchema.index({ sortOrder: 1 });

export default mongoose.model('Brand', brandSchema);
