'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';
import {
  Save,
  Store,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  Share2,
  Search,
  DollarSign,
  Server,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

const SOCIALS = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'twitter', label: 'Twitter' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'linkedin', label: 'LinkedIn' },
];

const inputClass =
  'w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all';

function Field({ label, children, hint, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-neutral-400 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-neutral-500 mt-1">{hint}</p>}
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-9 h-9 rounded-lg bg-primary-500/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary-400" />
        </div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

export default function AdminSettings() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setForm(data);
    } catch (error) {
      toast.error('Failed to load settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const setTop = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const setNested = (group, field, value) =>
    setForm((prev) => ({
      ...prev,
      [group]: { ...(prev[group] || {}), [field]: value },
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(form);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Site Settings</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Manage your store identity, contact details, and configuration.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>

      {/* Site Identity */}
      <SectionCard title="Site Identity" icon={Store}>
        <Field label="Site Name">
          <input
            className={inputClass}
            value={form.siteName || ''}
            onChange={(e) => setTop('siteName', e.target.value)}
          />
        </Field>
        <Field label="Tagline">
          <input
            className={inputClass}
            value={form.tagline || ''}
            onChange={(e) => setTop('tagline', e.target.value)}
          />
        </Field>
        <Field label="Logo URL">
          <input
            className={inputClass}
            value={form.logo || ''}
            onChange={(e) => setTop('logo', e.target.value)}
            placeholder="https://..."
          />
        </Field>
        <Field label="Favicon URL">
          <input
            className={inputClass}
            value={form.favicon || ''}
            onChange={(e) => setTop('favicon', e.target.value)}
            placeholder="https://..."
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Description">
            <textarea
              rows={3}
              className={inputClass}
              value={form.description || ''}
              onChange={(e) => setTop('description', e.target.value)}
            />
          </Field>
        </div>
        <Field label="Footer Text">
          <input
            className={inputClass}
            value={form.footerText || ''}
            onChange={(e) => setTop('footerText', e.target.value)}
          />
        </Field>
        <Field label="Copyright Text">
          <input
            className={inputClass}
            value={form.copyrightText || ''}
            onChange={(e) => setTop('copyrightText', e.target.value)}
          />
        </Field>
      </SectionCard>

      {/* Contact */}
      <SectionCard title="Contact Information" icon={Phone}>
        <Field label="Phone">
          <input
            className={inputClass}
            value={form.phone || ''}
            onChange={(e) => setTop('phone', e.target.value)}
          />
        </Field>
        <Field label="Email">
          <input
            className={inputClass}
            value={form.email || ''}
            onChange={(e) => setTop('email', e.target.value)}
          />
        </Field>
        <Field label="WhatsApp" hint="Include country code, e.g. 15551234567">
          <input
            className={inputClass}
            value={form.whatsapp || ''}
            onChange={(e) => setTop('whatsapp', e.target.value)}
          />
        </Field>
      </SectionCard>

      {/* Address */}
      <SectionCard title="Address" icon={MapPin}>
        <Field label="Street">
          <input
            className={inputClass}
            value={form.address?.street || ''}
            onChange={(e) => setNested('address', 'street', e.target.value)}
          />
        </Field>
        <Field label="City">
          <input
            className={inputClass}
            value={form.address?.city || ''}
            onChange={(e) => setNested('address', 'city', e.target.value)}
          />
        </Field>
        <Field label="State / Province">
          <input
            className={inputClass}
            value={form.address?.state || ''}
            onChange={(e) => setNested('address', 'state', e.target.value)}
          />
        </Field>
        <Field label="Zip / Postal Code">
          <input
            className={inputClass}
            value={form.address?.zipCode || ''}
            onChange={(e) => setNested('address', 'zipCode', e.target.value)}
          />
        </Field>
        <Field label="Country" className="md:col-span-2">
          <input
            className={inputClass}
            value={form.address?.country || ''}
            onChange={(e) => setNested('address', 'country', e.target.value)}
          />
        </Field>
      </SectionCard>

      {/* Business Hours */}
      <SectionCard title="Business Hours" icon={Clock}>
        {DAYS.map((day) => (
          <Field key={day.key} label={day.label}>
            <input
              className={inputClass}
              value={form.businessHours?.[day.key] || ''}
              onChange={(e) => setNested('businessHours', day.key, e.target.value)}
              placeholder="9:00 AM - 6:00 PM"
            />
          </Field>
        ))}
      </SectionCard>

      {/* Social Links */}
      <SectionCard title="Social Media Links" icon={Share2}>
        {SOCIALS.map((social) => (
          <Field key={social.key} label={social.label}>
            <input
              className={inputClass}
              value={form.socialLinks?.[social.key] || ''}
              onChange={(e) => setNested('socialLinks', social.key, e.target.value)}
              placeholder="https://..."
            />
          </Field>
        ))}
      </SectionCard>

      {/* SEO */}
      <SectionCard title="SEO" icon={Search}>
        <Field label="Meta Title">
          <input
            className={inputClass}
            value={form.seo?.metaTitle || ''}
            onChange={(e) => setNested('seo', 'metaTitle', e.target.value)}
          />
        </Field>
        <Field label="Meta Keywords">
          <input
            className={inputClass}
            value={form.seo?.metaKeywords || ''}
            onChange={(e) => setNested('seo', 'metaKeywords', e.target.value)}
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Meta Description">
            <textarea
              rows={3}
              className={inputClass}
              value={form.seo?.metaDescription || ''}
              onChange={(e) => setNested('seo', 'metaDescription', e.target.value)}
            />
          </Field>
        </div>
      </SectionCard>

      {/* Currency */}
      <SectionCard title="Currency & Localization" icon={DollarSign}>
        <Field label="Currency Code" hint="e.g. USD, EUR, BDT">
          <input
            className={inputClass}
            value={form.currency?.code || ''}
            onChange={(e) => setNested('currency', 'code', e.target.value)}
          />
        </Field>
        <Field label="Currency Symbol" hint="e.g. $, €, ৳">
          <input
            className={inputClass}
            value={form.currency?.symbol || ''}
            onChange={(e) => setNested('currency', 'symbol', e.target.value)}
          />
        </Field>
      </SectionCard>

      {/* Facebook & Instagram Auto-Posting */}
      <SectionCard title="Facebook & Instagram Auto-Posting" icon={Share2}>
        <div className="md:col-span-2 bg-neutral-800/60 p-4 rounded-xl border border-neutral-700/60 mb-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-white">Enable Social Auto-Posting</p>
              <p className="text-xs text-neutral-400">Automatically publish new products to Meta platforms upon creation</p>
            </div>
            <input
              type="checkbox"
              checked={form.socialAutoPost?.enabled || false}
              onChange={(e) => setNested('socialAutoPost', 'enabled', e.target.checked)}
              className="w-5 h-5 accent-[#7B1E3B] cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-6 pt-3 border-t border-neutral-700/50">
            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.socialAutoPost?.postToFacebook !== false}
                onChange={(e) => setNested('socialAutoPost', 'postToFacebook', e.target.checked)}
                className="w-4 h-4 accent-[#7B1E3B]"
              />
              Post to Facebook Page
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.socialAutoPost?.postToInstagram !== false}
                onChange={(e) => setNested('socialAutoPost', 'postToInstagram', e.target.checked)}
                className="w-4 h-4 accent-[#7B1E3B]"
              />
              Post to Instagram Business
            </label>
          </div>
        </div>

        <Field label="Facebook Page ID" hint="Find in Facebook Page Settings → Page Info">
          <input
            className={inputClass}
            value={form.socialAutoPost?.fbPageId || ''}
            onChange={(e) => setNested('socialAutoPost', 'fbPageId', e.target.value)}
            placeholder="e.g. 102938475647382"
          />
        </Field>

        <Field label="Instagram Business Account ID" hint="Linked Instagram Business Account ID">
          <input
            className={inputClass}
            value={form.socialAutoPost?.igAccountId || ''}
            onChange={(e) => setNested('socialAutoPost', 'igAccountId', e.target.value)}
            placeholder="e.g. 17841401234567890"
          />
        </Field>

        <div className="md:col-span-2">
          <Field label="Meta Page Access Token" hint="Generate Page Access Token from Meta Developer Portal (Graph API Explorer)">
            <textarea
              rows={2}
              className={inputClass}
              value={form.socialAutoPost?.fbAccessToken || ''}
              onChange={(e) => setNested('socialAutoPost', 'fbAccessToken', e.target.value)}
              placeholder="EAAG..."
            />
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="Caption Template" hint="Variables available: {productName}, {price}, {sku}, {sizes}, {productUrl}, {description}">
            <textarea
              rows={4}
              className={inputClass}
              value={form.socialAutoPost?.captionTemplate || ''}
              onChange={(e) => setNested('socialAutoPost', 'captionTemplate', e.target.value)}
              placeholder="✨ NEW ARRIVAL AT SAVANT ✨&#10;&#10;👜 {productName}&#10;💰 Price: {price}&#10;🏷️ {sku}&#10;&#10;🛒 Order now: {productUrl}"
            />
          </Field>
        </div>

        <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={async () => {
              try {
                toast.loading('Publishing test post to Facebook...', { id: 'fbTest' });
                const res = await api.testSocialPost({ platform: 'facebook' });
                toast.success(res.message || 'Facebook test post published successfully!', { id: 'fbTest' });
              } catch (err) {
                toast.error(err.message || 'Facebook test post failed', { id: 'fbTest' });
              }
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            🧪 Test Facebook Post
          </button>

          <button
            type="button"
            onClick={async () => {
              try {
                toast.loading('Publishing test post to Instagram...', { id: 'igTest' });
                const res = await api.testSocialPost({ platform: 'instagram' });
                toast.success(res.message || 'Instagram test post published successfully!', { id: 'igTest' });
              } catch (err) {
                toast.error(err.message || 'Instagram test post failed', { id: 'igTest' });
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            🧪 Test Instagram Post
          </button>
        </div>
      </SectionCard>

      {/* SMTP / Email */}
      <SectionCard title="Email (SMTP) Settings" icon={Server}>
        <Field label="SMTP Host">
          <input
            className={inputClass}
            value={form.smtp?.host || ''}
            onChange={(e) => setNested('smtp', 'host', e.target.value)}
          />
        </Field>
        <Field label="SMTP Port">
          <input
            className={inputClass}
            value={form.smtp?.port || ''}
            onChange={(e) => setNested('smtp', 'port', Number(e.target.value))}
          />
        </Field>
        <Field label="SMTP User">
          <input
            className={inputClass}
            value={form.smtp?.user || ''}
            onChange={(e) => setNested('smtp', 'user', e.target.value)}
          />
        </Field>
        <Field label="SMTP Password">
          <input
            type="password"
            className={inputClass}
            value={form.smtp?.password || ''}
            onChange={(e) => setNested('smtp', 'password', e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        <Field label="From Name">
          <input
            className={inputClass}
            value={form.smtp?.fromName || ''}
            onChange={(e) => setNested('smtp', 'fromName', e.target.value)}
          />
        </Field>
        <Field label="From Email">
          <input
            className={inputClass}
            value={form.smtp?.fromEmail || ''}
            onChange={(e) => setNested('smtp', 'fromEmail', e.target.value)}
          />
        </Field>
      </SectionCard>
    </form>
  );
}
