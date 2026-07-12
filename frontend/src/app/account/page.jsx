'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { 
  User, Package, Settings, LogOut, Edit, 
  Calendar, MapPin, CreditCard, Truck, CheckCircle, Clock, XCircle 
} from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Clock },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function AccountPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const data = await api.getMyOrders({ limit: 10 });
      setOrders(data.orders || []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateProfile(profileForm);
      toast.success('Profile updated successfully');
      setEditProfile(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {user.role === 'admin' ? 'Administrator' : 'Customer'}
                  </p>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'profile' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <User size={18} />
                  <span className="font-medium">Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'orders' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <Package size={18} />
                  <span className="font-medium">My Orders</span>
                  {orders.length > 0 && (
                    <span className="ml-auto bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-1 rounded-full">
                      {orders.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'settings' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <Settings size={18} />
                  <span className="font-medium">Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  <span className="font-medium">Log Out</span>
                </button>
              </nav>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Account Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-semibold">{orders.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {user.role === 'admin' && (
                  <a
                    href="/admin"
                    className="block mt-4 w-full py-2 bg-primary-600 text-white text-center rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    Go to Admin Panel
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                  <button
                    onClick={() => setEditProfile(!editProfile)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <Edit size={16} />
                    {editProfile ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                {editProfile ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditProfile(false)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <User className="text-gray-400" size={20} />
                          <h3 className="font-medium text-gray-900">Personal Details</h3>
                        </div>
                        <p className="text-gray-600">{user.name}</p>
                        <p className="text-gray-500 text-sm mt-1">{user.email}</p>
                        {user.phone && <p className="text-gray-500 text-sm mt-1">{user.phone}</p>}
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="text-gray-400" size={20} />
                          <h3 className="font-medium text-gray-900">Member Since</h3>
                        </div>
                        <p className="text-gray-600">
                          {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin className="text-gray-400" size={20} />
                        <h3 className="font-medium text-gray-900">Default Shipping Address</h3>
                      </div>
                      <p className="text-gray-600">No default address set</p>
                      <button className="mt-3 text-primary-600 hover:text-primary-700 font-medium">
                        Add a shipping address
                      </button>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="text-gray-400" size={20} />
                        <h3 className="font-medium text-gray-900">Payment Methods</h3>
                      </div>
                      <p className="text-gray-600">No saved payment methods</p>
                      <button className="mt-3 text-primary-600 hover:text-primary-700 font-medium">
                        Add a payment method
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
                  <button
                    onClick={loadOrders}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Refresh
                  </button>
                </div>

                {ordersLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-6">Your order history will appear here.</p>
                    <button
                      onClick={() => router.push('/')}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Order #</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Items</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Total</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => {
                          const StatusIcon = STATUS_CONFIG[order.status]?.icon || Clock;
                          return (
                            <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-4">
                                <div className="font-medium text-gray-900">{order.orderNumber}</div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="text-gray-600">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="text-gray-600">
                                  {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="font-semibold text-gray-900">
                                  ${order.total?.toFixed(2) || '0.00'}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[order.status]?.color || 'bg-gray-100 text-gray-800'}`}
                                  >
                                    <StatusIcon size={12} />
                                    {STATUS_CONFIG[order.status]?.label || order.status}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <button
                                  onClick={() => router.push(`/orders/${order._id}`)}
                                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                        <span className="text-gray-700">Email notifications for orders</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                        <span className="text-gray-700">Promotional emails</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                        <span className="text-gray-700">Order status updates</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h3>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                        <span className="text-gray-700">Share profile with sellers</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-gray-700">Show purchase history</span>
                      </label>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}