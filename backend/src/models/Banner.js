import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Banner title is required'],
    trim: true,
    maxlength: 200,
  },
  subtitle: {
    type: String,
    default: '',
    maxlength: 300,
  },
  description: {
    type: String,
    default: '',
    maxlength: 500,
  },
  image: {
    type: String,
    required: [true, 'Banner image is required'],
  },
  link: {
    type: String,
    default: '',
  },
  buttonText: {
    type: String,
    default: '',
  },
  position: {
    type: String,
    enum: ['hero', 'sidebar', 'popup', 'footer', 'category'],
    default: 'hero',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
    default: null,
  },
  endDate: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Banner', bannerSchema);
