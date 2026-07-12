import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: {
    type: String,
    default: '',
  },
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  items: [orderItemSchema],
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'US' },
  },
  subtotal: {
    type: Number,
    required: true,
  },
  shippingCost: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'bank_transfer', 'cod'],
    default: 'card',
  },
  notes: {
    type: String,
    default: '',
  },
  trackingNumber: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model('Order', orderSchema);
