'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Plus, Edit3, Trash2, Search, X, Upload, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight, Package, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['men', 'women', 'fragrances', 'backpacks', 'new', 'popular', 'sale', 'featured'];

const SUBCATEGORIES = {
  men: ['Wallets', 'Belts', 'Bags', 'Accessories'],
  women: ['Handbags', 'Clutches', 'Wallets', 'Accessories'],
  fragrances: ["Men's", "Women's", 'Unisex'],
  backpacks: ['Laptop', 'Travel', 'Casual'],
};
const UPLOAD_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    originalPrice: '',
    category: 'new',
    subcategory: '',
    sku: '',
    material: 'Premium Leather',
    stock: '10',
    colorCount: '3',
    fastShipping: false,
    featured: false,
    isActive: true,
    tags: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12, isActive: null };
      if (search) params.search = search;
      const data = await api.getProducts(params);
      setProducts(data.products);
      setTotalPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      shortDescription: '',
      price: '',
      originalPrice: '',
      category: 'new',
      subcategory: '',
      sku: '',
      material: 'Premium Leather',
      stock: '10',
      colorCount: '3',
      fastShipping: false,
      featured: false,
      isActive: true,
      tags: '',
    });
    setImageFiles([]);
    setExistingImages([]);
    setImagePreviews([]);
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription || '',
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      category: product.category,
      subcategory: product.subcategory || '',
      sku: product.sku || '',
      material: product.material || 'Premium Leather',
      stock: product.stock.toString(),
      colorCount: (product.colorCount || 3).toString(),
      fastShipping: product.fastShipping || false,
      featured: product.featured || false,
      isActive: product.isActive,
      tags: product.tags?.join(', ') || '',
    });
    setExistingImages(product.images || []);
    setImagePreviews((product.images || []).map(img => img.startsWith('http') ? img : `${UPLOAD_URL}${img}`));
    setImageFiles([]);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    if (index < existingImages.length) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingImages.length;
      setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('shortDescription', form.shortDescription);
      formData.append('price', form.price);
      if (form.originalPrice) formData.append('originalPrice', form.originalPrice);
      formData.append('category', form.category);
      if (form.subcategory) formData.append('subcategory', form.subcategory);
      if (form.sku) formData.append('sku', form.sku);
      formData.append('material', form.material);
      formData.append('stock', form.stock);
      formData.append('colorCount', form.colorCount);
      formData.append('fastShipping', form.fastShipping);
      formData.append('featured', form.featured);
      formData.append('isActive', form.isActive);
      formData.append('tags', form.tags);
      formData.append('existingImages', JSON.stringify(existingImages));
      imageFiles.forEach(f => formData.append('images', f));

      if (editing) {
        await api.updateProduct(editing._id, formData);
        toast.success('Product updated successfully');
      } else {
        await api.createProduct(formData);
        toast.success('Product created successfully');
      }

      setShowModal(false);
      resetForm();
      loadProducts();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      toast.success('Product deleted');
      loadProducts();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      await api.toggleProductStatus(product._id);
      toast.success(`Product ${product.isActive ? 'deactivated' : 'activated'}`);
      loadProducts();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getCategoryBadge = (cat) => {
    const styles = {
      men: 'bg-indigo-500/20 text-indigo-400',
      women: 'bg-pink-500/20 text-pink-400',
      fragrances: 'bg-amber-500/20 text-amber-400',
      backpacks: 'bg-teal-500/20 text-teal-400',
      new: 'bg-green-500/20 text-green-400',
      popular: 'bg-blue-500/20 text-blue-400',
      sale: 'bg-red-500/20 text-red-400',
      featured: 'bg-purple-500/20 text-purple-400',
    };
    return styles[cat] || 'bg-neutral-500/20 text-neutral-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-neutral-400 text-sm mt-1">{total} total products</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-12 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Products Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-400">Product</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-400">SKU</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-400">Category</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-400">Price</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-400">Stock</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-400">Status</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No products found</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {product.images && product.images[0] ? (
                            <img src={product.images[0].startsWith('http') ? product.images[0] : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')}${product.images[0]}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg font-bold text-neutral-500">{product.name?.charAt(0) || 'R'}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{product.name}</p>
                          <p className="text-neutral-500 text-sm truncate">{product.material}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-neutral-300 font-mono text-sm">{product.sku || 'â€”'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium w-fit ${getCategoryBadge(product.category)}`}>
                          {product.category}
                        </span>
                        {product.subcategory && (
                          <span className="text-neutral-500 text-xs">{product.subcategory}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">${product.price}</p>
                        {product.originalPrice && (
                          <p className="text-neutral-500 text-sm line-through">${product.originalPrice}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${product.stock <= 5 ? 'text-red-400' : product.stock <= 10 ? 'text-yellow-400' : 'text-white'}`}>
                          {product.stock}
                        </span>
                        {product.stock <= 5 && <AlertTriangle className="w-4 h-4 text-red-400" />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleToggleStatus(product)} className="text-neutral-400 hover:text-white transition-colors">
                        {product.isActive ? (
                          <ToggleRight className="w-8 h-8 text-green-400" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-neutral-600" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800">
            <p className="text-sm text-neutral-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-white">
                {editing ? 'Edit Product' : 'Create Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Product Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Description *</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                      required
                      rows={4}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Short Description</label>
                    <input
                      type="text"
                      value={form.shortDescription}
                      onChange={(e) => setForm(f => ({ ...f, shortDescription: e.target.value }))}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Price ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={form.price}
                        onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                        required
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Original Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={form.originalPrice}
                        onChange={(e) => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Category *</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm(f => ({ ...f, category: e.target.value, subcategory: '' }))}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Subcategory</label>
                      <select
                        value={form.subcategory}
                        onChange={(e) => setForm(f => ({ ...f, subcategory: e.target.value }))}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        disabled={!SUBCATEGORIES[form.category]}
                      >
                        <option value="">None</option>
                        {(SUBCATEGORIES[form.category] || []).map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">SKU (Product ID)</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={form.sku}
                          onChange={(e) => setForm(f => ({ ...f, sku: e.target.value }))}
                          placeholder="Auto-generated on create"
                          className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        {!editing && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">Auto</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Material</label>
                      <input
                        type="text"
                        value={form.material}
                        onChange={(e) => setForm(f => ({ ...f, material: e.target.value }))}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Stock *</label>
                      <input
                        type="number"
                        value={form.stock}
                        onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))}
                        required
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Color Count</label>
                      <input
                        type="number"
                        value={form.colorCount}
                        onChange={(e) => setForm(f => ({ ...f, colorCount: e.target.value }))}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={form.tags}
                      onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
                      placeholder="leather, bag, luxury"
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.fastShipping}
                        onChange={(e) => setForm(f => ({ ...f, fastShipping: e.target.checked }))}
                        className="w-5 h-5 rounded border-neutral-600 bg-neutral-800 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-neutral-300">Fast Shipping</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) => setForm(f => ({ ...f, featured: e.target.checked }))}
                        className="w-5 h-5 rounded border-neutral-600 bg-neutral-800 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-neutral-300">Featured</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
                        className="w-5 h-5 rounded border-neutral-600 bg-neutral-800 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-neutral-300">Active</span>
                    </label>
                  </div>
                </div>

                {/* Right Column - Images */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Product Images</label>
                    <div className="grid grid-cols-3 gap-3">
                      {imagePreviews.map((src, index) => (
                        <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-neutral-800">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square rounded-xl border-2 border-dashed border-neutral-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-neutral-800/50 transition-colors">
                        <Upload className="w-6 h-6 text-neutral-500 mb-1" />
                        <span className="text-xs text-neutral-500">Upload</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">PNG, JPG, WEBP up to 5MB. Max 5 images.</p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 text-neutral-400 hover:text-white font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
