import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  // Contact Information
  phone: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  whatsapp: {
    type: String,
    default: '',
  },

  // Address
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: '' },
  },

  // Business Hours
  businessHours: {
    monday: { type: String, default: '9:00 AM - 6:00 PM' },
    tuesday: { type: String, default: '9:00 AM - 6:00 PM' },
    wednesday: { type: String, default: '9:00 AM - 6:00 PM' },
    thursday: { type: String, default: '9:00 AM - 6:00 PM' },
    friday: { type: String, default: '9:00 AM - 6:00 PM' },
    saturday: { type: String, default: '10:00 AM - 4:00 PM' },
    sunday: { type: String, default: 'Closed' },
  },

  // Social Media
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' },
    tiktok: { type: String, default: '' },
    linkedin: { type: String, default: '' },
  },

  // Site Identity
  siteName: {
    type: String,
    default: 'ROSEO',
  },
  tagline: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  logo: {
    type: String,
    default: '',
  },
  favicon: {
    type: String,
    default: '',
  },

  // SEO
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    metaKeywords: { type: String, default: '' },
  },

  // Currency & Localization
  currency: {
    code: { type: String, default: 'USD' },
    symbol: { type: String, default: '$' },
  },

  // Email Settings
  smtp: {
    host: { type: String, default: 'smtp.gmail.com' },
    port: { type: Number, default: 587 },
    user: { type: String, default: 'roseobd@mail.com' },
    password: { type: String, default: '' },
    fromName: { type: String, default: 'ROSEO' },
    fromEmail: { type: String, default: 'roseobd@mail.com' },
  },

  // Footer
  footerText: {
    type: String,
    default: '',
  },
  copyrightText: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Singleton pattern - only one settings document
siteSettingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model('SiteSettings', siteSettingsSchema);
