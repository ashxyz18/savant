import SiteSettings from '../models/SiteSettings.js';

export const getSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.getSingleton();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.getSingleton();

    // Update top-level fields
    const topLevelFields = [
      'phone', 'email', 'whatsapp',
      'siteName', 'tagline', 'description', 'logo', 'favicon',
      'footerText', 'copyrightText',
    ];

    topLevelFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    // Update nested objects
    const nestedFields = ['address', 'businessHours', 'socialLinks', 'seo', 'currency', 'smtp', 'socialAutoPost'];

    nestedFields.forEach((field) => {
      if (req.body[field] && typeof req.body[field] === 'object') {
        if (!settings[field]) settings[field] = {};
        Object.keys(req.body[field]).forEach((key) => {
          settings[field][key] = req.body[field][key];
        });
        settings.markModified(field);
      }
    });

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const testSocialPost = async (req, res) => {
  try {
    const { platform = 'facebook' } = req.body;
    const settings = await SiteSettings.getSingleton();
    const config = settings?.socialAutoPost || {};

    const dummyProduct = {
      _id: 'test_product',
      name: 'SAVANT Test Product',
      price: 2500,
      sku: 'SAV-TEST-01',
      sizes: ['M', 'L'],
      images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'],
      shortDescription: 'Test social auto-post publishing from SAVANT Admin Panel',
    };

    const socialConfig = {
      fbPageId: config.fbPageId || process.env.FB_PAGE_ID,
      fbAccessToken: config.fbAccessToken || process.env.FB_PAGE_TOKEN,
      igAccountId: config.igAccountId || process.env.IG_ACCOUNT_ID,
      captionTemplate: config.captionTemplate,
    };

    const { postToFacebookPage, postToInstagramBusiness } = await import('../services/socialPoster.js');

    if (platform === 'instagram') {
      const resIg = await postToInstagramBusiness(dummyProduct, socialConfig);
      return res.json({ message: 'Successfully published test post to Instagram!', mediaId: resIg.mediaId });
    } else {
      const resFb = await postToFacebookPage(dummyProduct, socialConfig);
      return res.json({ message: 'Successfully published test post to Facebook Page!', postId: resFb.postId });
    }
  } catch (error) {
    res.status(400).json({ message: error.message || 'Social post test failed' });
  }
};
