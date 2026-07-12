'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Plus, Edit3, Trash2, X, Upload, Tags, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const UPLOAD_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: 'tag',
    sortOrder: '0',
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', icon: 'tag', sortOrder: '0', isActive: true });
    setImageFile(null);
    setImagePreview('');
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || 'tag',
      sortOrder: (cat.sortOrder || 0).toString(),
      isActive: cat.isActive,
    });
    if (cat.image) {
      setImagePreview(cat.image.startsWith('http') ? cat.image : `${UPLOAD_URL}${cat.image}`);
    } else {
      setImagePreview('');
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('icon', form.icon);
      formData.append('sortOrder', form.sortOrder);
      formData.append('isActive', form.isActive);
      if (imageFile) formData.append('image', imageFile);

      if (editing) {
        await api.updateCategory(editing._id, formData);
        toast.success('Category updated');
      } else {
        await api.createCategory(formData);
        toast.success('Category created');
      }

      setShowModal(false);
      resetForm();
      loadCategories();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.deleteCategory(id);
      toast.success('Category deleted');
      loadCategories();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-neutral-400 text-sm mt-1">{categories.length} categories</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          <Tags className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No categories yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center text-2xl">
                    {cat.icon || 'T'}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{cat.name}</h3>
                    <p className="text-neutral-500 text-sm">{cat.productCount || 0} products</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {cat.description && (
                <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{cat.description}</p>
              )}

              {cat.image && (
                <div className="mb-4 rounded-xl overflow-hidden bg-neutral-800">
                  <img
                    src={cat.image.startsWith('http') ? cat.image : `${UPLOAD_URL}${cat.image}`}
                    alt={cat.name}
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-neutral-500 text-xs">Sort: {cat.sortOrder || 0}</span>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cat.isActive ? 'bg-green-500/20 text-green-400' : 'bg-neutral-500/20 text-neutral-400'}`}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg">
            <div className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editing ? 'Edit Category' : 'Create Category'}</h2>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Category Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Icon (emoji)</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm(f => ({ ...f, icon: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm(f => ({ ...f, sortOrder: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Category Image</label>
                {imagePreview ? (
                  <div className="relative mb-3 rounded-xl overflow-hidden bg-neutral-800">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(''); }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-800 border border-dashed border-neutral-700 rounded-xl cursor-pointer hover:border-primary-500 transition-colors">
                  <Upload className="w-5 h-5 text-neutral-500" />
                  <span className="text-neutral-400 text-sm">Upload Image</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-5 h-5 rounded border-neutral-600 bg-neutral-800 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-neutral-300">Active</span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 text-neutral-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
