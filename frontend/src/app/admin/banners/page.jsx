'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Plus, Edit3, Trash2, X, Upload, Image, ToggleLeft, ToggleRight, Calendar, Link, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const UPLOAD_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

const POSITIONS = [
  { value: 'hero', label: 'Hero Banner' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'popup', label: 'Popup' },
  { value: 'footer', label: 'Footer' },
  { value: 'category', label: 'Category Page' },
];

const POSITION_COLORS = {
  hero: 'bg-purple-500/20 text-purple-400',
  sidebar: 'bg-blue-500/20 text-blue-400',
  popup: 'bg-amber-500/20 text-amber-400',
  footer: 'bg-green-500/20 text-green-400',
  category: 'bg-pink-500/20 text-pink-400',
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPosition, setFilterPosition] = useState('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    link: '',
    buttonText: '',
    position: 'hero',
    isActive: true,
    sortOrder: '0',
    startDate: '',
    endDate: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await api.getBanners();
      setBanners(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      subtitle: '',
      description: '',
      link: '',
      buttonText: '',
      position: 'hero',
      isActive: true,
      sortOrder: '0',
      startDate: '',
      endDate: '',
    });
    setImageFile(null);
    setImagePreview('');
    setEditing(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (banner) => {
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      link: banner.link || '',
      buttonText: banner.buttonText || '',
      position: banner.position || 'hero',
      isActive: banner.isActive,
      sortOrder: String(banner.sortOrder || 0),
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
    });
    setImagePreview(banner.image || '');
    setImageFile(null);
    setEditing(banner._id);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('subtitle', form.subtitle);
      formData.append('description', form.description);
      formData.append('link', form.link);
      formData.append('buttonText', form.buttonText);
      formData.append('position', form.position);
      formData.append('isActive', String(form.isActive));
      formData.append('sortOrder', form.sortOrder);
      if (form.startDate) formData.append('startDate', form.startDate);
      if (form.endDate) formData.append('endDate', form.endDate);
      if (imageFile) formData.append('image', imageFile);

      if (editing) {
        await api.updateBanner(editing, formData);
        toast.success('Banner updated successfully');
      } else {
        await api.createBanner(formData);
        toast.success('Banner created successfully');
      }

      setShowModal(false);
      resetForm();
      loadBanners();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      await api.deleteBanner(id);
      toast.success('Banner deleted');
      loadBanners();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleToggleStatus = async (banner) => {
    try {
      await api.toggleBannerStatus(banner._id);
      toast.success(`Banner ${banner.isActive ? 'deactivated' : 'activated'}`);
      loadBanners();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filteredBanners = filterPosition === 'all'
    ? banners
    : banners.filter((b) => b.position === filterPosition);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Banners</h1>
          <p className="text-neutral-400 text-sm mt-1">{banners.length} total banners</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          Add Banner
        </button>
      </div>

      {/* Position Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterPosition('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterPosition === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          All
        </button>
        {POSITIONS.map((pos) => (
          <button
            key={pos.value}
            onClick={() => setFilterPosition(pos.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterPosition === pos.value
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            {pos.label}
          </button>
        ))}
      </div>

      {/* Banners Grid */}
      {filteredBanners.length === 0 ? (
        <div className="text-center py-12">
          <Image size={48} className="mx-auto text-neutral-600 mb-4" />
          <p className="text-neutral-400">No banners found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBanners.map((banner) => (
            <div
              key={banner._id}
              className={`bg-neutral-900 border rounded-xl overflow-hidden transition-all ${
                banner.isActive ? 'border-neutral-700' : 'border-neutral-800 opacity-60'
              }`}
            >
              {/* Banner Image */}
              <div className="relative h-40 bg-neutral-800">
                {banner.image ? (
                  <img
                    src={banner.image.startsWith('http') ? banner.image : `${UPLOAD_URL}${banner.image}`}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Image size={40} className="text-neutral-600" />
                  </div>
                )}
                {/* Position Badge */}
                <span
                  className={`absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium ${
                    POSITION_COLORS[banner.position] || 'bg-neutral-500/20 text-neutral-400'
                  }`}
                >
                  {POSITIONS.find((p) => p.value === banner.position)?.label || banner.position}
                </span>
                {/* Status Badge */}
                <span
                  className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium ${
                    banner.isActive
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {banner.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Banner Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold text-lg mb-1">{banner.title}</h3>
                {banner.subtitle && (
                  <p className="text-neutral-400 text-sm mb-2">{banner.subtitle}</p>
                )}
                {banner.description && (
                  <p className="text-neutral-500 text-xs mb-3 line-clamp-2">{banner.description}</p>
                )}

                <div className="flex flex-wrap gap-3 text-xs text-neutral-400 mb-4">
                  {banner.buttonText && (
                    <span className="flex items-center gap-1">
                      <ExternalLink size={12} />
                      {banner.buttonText}
                    </span>
                  )}
                  {banner.link && (
                    <span className="flex items-center gap-1">
                      <Link size={12} />
                      {banner.link.length > 25 ? banner.link.substring(0, 25) + '...' : banner.link}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    Sort: {banner.sortOrder}
                  </span>
                </div>

                {/* Date Range */}
                {(banner.startDate || banner.endDate) && (
                  <div className="flex items-center gap-1 text-xs text-neutral-500 mb-4">
                    <Calendar size={12} />
                    {banner.startDate
                      ? new Date(banner.startDate).toLocaleDateString()
                      : '...'}
                    {' — '}
                    {banner.endDate
                      ? new Date(banner.endDate).toLocaleDateString()
                      : '...'}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-neutral-800">
                  <button
                    onClick={() => handleToggleStatus(banner)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                    title={banner.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {banner.isActive ? (
                      <ToggleRight size={16} className="text-green-400" />
                    ) : (
                      <ToggleLeft size={16} className="text-neutral-500" />
                    )}
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => openEditModal(banner)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-red-500/10 hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white">
                {editing ? 'Edit Banner' : 'Create Banner'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500"
                  placeholder="Banner title"
                  required
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500"
                  placeholder="Banner subtitle"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 resize-none"
                  placeholder="Banner description"
                />
              </div>

              {/* Position & Sort Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                    Position <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  >
                    {POSITIONS.map((pos) => (
                      <option key={pos.value} value={pos.value}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Link & Button Text */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                    Link URL
                  </label>
                  <input
                    type="text"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500"
                    placeholder="/products or https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={form.buttonText}
                    onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500"
                    placeholder="Shop Now"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Banner Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-700 border-dashed rounded-lg hover:border-neutral-600 transition-colors">
                  <div className="space-y-2 text-center">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto h-32 w-auto rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setImageFile(null);
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <Upload className="mx-auto h-10 w-10 text-neutral-500" />
                    )}
                    <div className="flex text-sm text-neutral-400">
                      <label className="relative cursor-pointer rounded-md font-medium text-primary-400 hover:text-primary-300">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-neutral-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className="flex items-center gap-2"
                >
                  {form.isActive ? (
                    <ToggleRight size={24} className="text-green-400" />
                  ) : (
                    <ToggleLeft size={24} className="text-neutral-500" />
                  )}
                  <span className="text-sm text-neutral-300">
                    {form.isActive ? 'Active' : 'Inactive'}
                  </span>
                </button>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : editing ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
