import Banner from '../models/Banner.js';
import { uploadToCloudinary } from '../middleware/upload.js';

export const getBanners = async (req, res) => {
  try {
    const { position, isActive } = req.query;
    const filter = {};
    if (position) filter.position = position;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const banners = await Banner.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBanner = async (req, res) => {
  try {
    const bannerData = { ...req.body };

    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      bannerData.image = result.secure_url;
    }

    const banner = await Banner.create(bannerData);
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const bannerData = { ...req.body };

    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      bannerData.image = result.secure_url;
    }

    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      bannerData,
      { new: true, runValidators: true }
    );

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    banner.isActive = !banner.isActive;
    await banner.save();
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
