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
    const nestedFields = ['address', 'businessHours', 'socialLinks', 'seo', 'currency', 'smtp'];

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
