import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['customer', 'admin'],
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    default: '',
  },
  userEmail: {
    type: String,
    default: '',
  },
  subject: {
    type: String,
    default: 'General Inquiry',
    trim: true,
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
  messages: [messageSchema],
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

chatSchema.index({ user: 1, status: 1 });
chatSchema.index({ lastMessageAt: -1 });

export default mongoose.model('Chat', chatSchema);
