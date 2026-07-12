'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Mail, Save, TestTube, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminEmailPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    host: 'smtp.gmail.com',
    port: '587',
    user: 'roseobd@mail.com',
    password: '',
    fromName: 'SAVANT',
    fromEmail: 'roseobd@mail.com',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      const smtp = data.smtp || {};
      setForm({
        host: smtp.host || 'smtp.gmail.com',
        port: String(smtp.port || 587),
        user: smtp.user || 'roseobd@mail.com',
        password: smtp.password || '',
        fromName: smtp.fromName || 'SAVANT',
        fromEmail: smtp.fromEmail || 'roseobd@mail.com',
      });
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateSettings({
        smtp: {
          host: form.host,
          port: Number(form.port),
          user: form.user,
          password: form.password,
          fromName: form.fromName,
          fromEmail: form.fromEmail,
        },
      });
      toast.success('Email settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-white">Email Settings</h2>
        <p className="text-neutral-500 text-sm mt-1">Configure SMTP for password resets and customer notifications</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SMTP Configuration */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">SMTP Configuration</h3>
              <p className="text-xs text-neutral-500">Email server settings for sending emails</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">SMTP Host</label>
                <input
                  type="text"
                  value={form.host}
                  onChange={(e) => setForm({ ...form, host: e.target.value })}
                  className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Port</label>
                <input
                  type="text"
                  value={form.port}
                  onChange={(e) => setForm({ ...form, port: e.target.value })}
                  className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
                  placeholder="587"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">SMTP Username (Email)</label>
              <input
                type="email"
                value={form.user}
                onChange={(e) => setForm({ ...form, user: e.target.value })}
                className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
                placeholder="roseobd@mail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">SMTP Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
                placeholder="App-specific password"
              />
              <p className="text-xs text-neutral-600 mt-1.5">
                For Gmail, use an App Password from your Google Account security settings.
              </p>
            </div>
          </div>
        </div>

        {/* Sender Information */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Sender Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">From Name</label>
              <input
                type="text"
                value={form.fromName}
                onChange={(e) => setForm({ ...form, fromName: e.target.value })}
                className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
                placeholder="SAVANT"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">From Email</label>
              <input
                type="email"
                value={form.fromEmail}
                onChange={(e) => setForm({ ...form, fromEmail: e.target.value })}
                className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
                placeholder="roseobd@mail.com"
              />
            </div>
          </div>
        </div>

        {/* Gmail Setup Guide */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-3">Gmail Setup Guide</h3>
          <ol className="text-sm text-neutral-400 space-y-2 list-decimal list-inside">
            <li>Go to your Google Account &rarr; Security</li>
            <li>Enable 2-Step Verification (if not already)</li>
            <li>Go to App Passwords (search in security settings)</li>
            <li>Create a new app password for &quot;Mail&quot;</li>
            <li>Copy the 16-character password and paste it above</li>
            <li>Use <span className="text-neutral-300 font-mono">smtp.gmail.com</span> as host and <span className="text-neutral-300 font-mono">587</span> as port</li>
          </ol>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
