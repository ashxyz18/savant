import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { uploadToCloudinary } from '../middleware/upload.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1, name: 1 });

    // Update product counts
    for (const cat of categories) {
      const count = await Product.countDocuments({ category: cat.slug, isActive: true });
      cat.productCount = count;
      await cat.save();
    }

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const categoryData = { ...req.body };

    categoryData.slug = categoryData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      categoryData.image = result.secure_url;
    }

    const category = await Category.create(categoryData);
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const categoryData = { ...req.body };

    if (categoryData.name) {
      categoryData.slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      categoryData.image = result.secure_url;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      categoryData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. ${productCount} products are assigned to it.`,
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
