'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Plus, Pencil, Trash2, Upload, X, Globe, Eye, EyeOff, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

const UPLOAD_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    website: '',
    description: '',
    isActive: true,
    sortOrder: 0,
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const data = await api.getBrands();
      setBrands(data.brands || data);
    } catch (error) {
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', slug: '', website: '', description: '', isActive: true, sortOrder: 0 });
    setLogoFile(null);
    setLogoPreview('');
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (brand) => {
    setForm({
      name: brand.name || '',
      slug: brand.slug || '',
      website: brand.website || '',
      description: brand.description || '',
      isActive: brand.isActive !== false,
      sortOrder: brand.sortOrder || 0,
    });
    setLogoPreview(brand.logo ? (brand.logo.startsWith('http') ? brand.logo : `${UPLOAD_URL}${brand.logo}`) : '');
    setLogoFile(null);
    setEditing(brand._id);
    setShowModal(true);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Brand name is required');
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('slug', form.slug || generateSlug(form.name));
      formData.append('website', form.website);
      formData.append('description', form.description);
      formData.append('isActive', form.isActive);
      formData.append('sortOrder', form.sortOrder);
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      if (editing) {
        await api.updateBrand(editing, formData);
        toast.success('Brand updated');
      } else {
        await api.createBrand(formData);
        toast.success('Brand created');
      }

      setShowModal(false);
      resetForm();
      loadBrands();
    } catch (error) {
      toast.error(error.message || 'Failed to save brand');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      await api.deleteBrand(id);
      toast.success('Brand deleted');
      loadBrands();
    } catch (error) {
      toast.error('Failed to delete brand');
    }
  };

  const handleToggle = async (brand) => {
    try {
      await api.toggleBrandStatus(brand._id);
      toast.success(`Brand ${brand.isActive ? 'disabled' : 'enabled'}`);
      loadBrands();
    } catch (error) {
      toast.error('Failed to toggle brand status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Brands</h1>
          <p className="text-sm text-neutral-400 mt-1">Manage brand logos and information</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Brand
        </button>
      </div>

      {/* Brands Grid */}
      {brands.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900 rounded-xl border border-neutral-800">
          <p className="text-neutral-400">No brands yet. Create your first brand.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <div
              key={brand._id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 group hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {/* Logo */}
                  <div className="w-14 h-14 bg-neutral-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {brand.logo ? (
                      <img
                        src={brand.logo.startsWith('http') ? brand.logo : `${UPLOAD_URL}${brand.logo}`}
                        alt={brand.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-neutral-500">
                        {brand.name?.charAt(0)?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{brand.name}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">/{brand.slug}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    brand.isActive
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-neutral-700 text-neutral-400'
                  }`}
                >
                  {brand.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {brand.description && (
                <p className="text-sm text-neutral-400 mb-4 line-clamp-2">{brand.description}</p>
              )}

              {brand.website && (
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-4">
                  <Globe className="w-3 h-3" />
                  {brand.website}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                <span className="text-xs text-neutral-500">Order: {brand.sortOrder}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggle(brand)}
                    className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                    title={brand.isActive ? 'Disable' : 'Enable'}
                  >
                    {brand.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(brand)}
                    className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(brand._id)}
                    className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-lg font-bold text-white">
                {editing ? 'Edit Brand' : 'Add Brand'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Brand Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-neutral-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-neutral-600">
                        {form.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg cursor-pointer transition-colors text-sm">
                      <Upload className="w-4 h-4" />
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-neutral-500 mt-1.5">PNG, JPG, SVG. Recommended 200x200px.</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Brand Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm({
                      ...form,
                      name,
                      slug: generateSlug(name),
                    });
                  }}
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Gucci"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
                  placeholder="auto-generated-from-name"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
                  placeholder="https://www.example.com"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500 resize-none"
                  placeholder="Brief brand description"
                />
              </div>

              {/* Sort Order & Active */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Status</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      form.isActive
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                    }`}
                  >
                    {form.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2.5 bg-neutral-800 text-neutral-300 rounded-lg font-medium text-sm hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg font-medium text-sm hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : editing ? 'Update Brand' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
