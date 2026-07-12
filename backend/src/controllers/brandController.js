import Brand from '../models/Brand.js';
import { uploadToCloudinary } from '../middleware/upload.js';

export const getBrands = async (req, res) => {
  try {
    const { isActive, sort } = req.query;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const sortOption = sort === 'name' ? { name: 1 } : { sortOrder: 1, createdAt: -1 };
    const brands = await Brand.find(filter).sort(sortOption);

    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBrand = async (req, res) => {
  try {
    const { name, slug, website, description, isActive, sortOrder } = req.body;
    let logo = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      logo = result.secure_url;
    }

    const brand = await Brand.create({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      logo,
      website,
      description,
      isActive: isActive !== undefined ? isActive === 'true' : true,
      sortOrder: sortOrder ? Number(sortOrder) : 0,
    });

    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { name, slug, website, description, isActive, sortOrder } = req.body;
    const updateData = {
      name,
      slug: slug || name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      website,
      description,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      sortOrder: sortOrder ? Number(sortOrder) : undefined,
    };

    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      updateData.logo = result.secure_url;
    }

    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

    const brand = await Brand.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleBrandStatus = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    brand.isActive = !brand.isActive;
    await brand.save();
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
