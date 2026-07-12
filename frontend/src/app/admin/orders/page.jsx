'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Search, Eye, Truck, CreditCard, X, ChevronLeft, ChevronRight, Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending: { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock, label: 'Pending' },
  confirmed: { color: 'bg-blue-500/20 text-blue-400', icon: CheckCircle, label: 'Confirmed' },
  processing: { color: 'bg-purple-500/20 text-purple-400', icon: Package, label: 'Processing' },
  shipped: { color: 'bg-cyan-500/20 text-cyan-400', icon: Truck, label: 'Shipped' },
  delivered: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle, label: 'Delivered' },
  cancelled: { color: 'bg-red-500/20 text-red-400', icon: XCircle, label: 'Cancelled' },
  refunded: { color: 'bg-neutral-500/20 text-neutral-400', icon: AlertCircle, label: 'Refunded' },
};

const PAYMENT_CONFIG = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  paid: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
  refunded: 'bg-neutral-500/20 text-neutral-400',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Detail modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Tracking modal
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showTracking, setShowTracking] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [page, search, statusFilter, paymentFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;
      const data = await api.getOrders(params);
      setOrders(data.orders);
      setTotalPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (order) => {
    try {
      const full = await api.getOrder(order._id);
      setSelectedOrder(full);
      setShowDetail(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated');
      loadOrders();
      if (selectedOrder?._id === orderId) {
        const updated = await api.getOrder(orderId);
        setSelectedOrder(updated);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handlePaymentStatus = async (orderId, paymentStatus) => {
    try {
      await api.updatePaymentStatus(orderId, paymentStatus);
      toast.success('Payment status updated');
      loadOrders();
      if (selectedOrder?._id === orderId) {
        const updated = await api.getOrder(orderId);
        setSelectedOrder(updated);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openTracking = (orderId) => {
    setTrackingOrderId(orderId);
    setTrackingNumber('');
    setShowTracking(true);
  };

  const handleAddTracking = async () => {
    try {
      await api.addTrackingNumber(trackingOrderId, trackingNumber);
      toast.success('Tracking number added');
      setShowTracking(false);
      loadOrders();
      if (selectedOrder?._id === trackingOrderId) {
        const updated = await api.getOrder(trackingOrderId);
        setSelectedOrder(updated);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await api.deleteOrder(id);
      toast.success('Order deleted');
      loadOrders();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <p className="text-neutral-400 text-sm mt-1">{total} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by order #, name, or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-12 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
          className="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Payments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-400">Order</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-400">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-400">Items</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-400">Total</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-400">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-400">Payment</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-400">Date</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-neutral-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No orders found</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusCfg.icon;
                  return (
                    <tr key={order._id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-white font-mono text-sm">{order.orderNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white text-sm">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                          <p className="text-neutral-500 text-xs">{order.shippingAddress?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-neutral-300 text-sm">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">${order.total?.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`text-xs font-medium px-2.5 py-1.5 rounded-full border-0 cursor-pointer ${statusCfg.color}`}
                        >
                          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <option key={key} value={key}>{cfg.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => handlePaymentStatus(order._id, e.target.value)}
                          className={`text-xs font-medium px-2.5 py-1.5 rounded-full border-0 cursor-pointer ${PAYMENT_CONFIG[order.paymentStatus] || ''}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-neutral-400 text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openDetail(order)}
                            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openTracking(order._id)}
                            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                            title="Add Tracking"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(order._id)}
                            className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800">
            <p className="text-sm text-neutral-400">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetail && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowDetail(false)} />
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-white">Order {selectedOrder.orderNumber}</h2>
              <button onClick={() => setShowDetail(false)} className="text-neutral-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status Row */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] bg-neutral-800 rounded-xl p-4">
                  <p className="text-neutral-400 text-sm mb-1">Order Status</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[selectedOrder.status]?.color}`}>
                    {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                  </span>
                </div>
                <div className="flex-1 min-w-[200px] bg-neutral-800 rounded-xl p-4">
                  <p className="text-neutral-400 text-sm mb-1">Payment Status</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${PAYMENT_CONFIG[selectedOrder.paymentStatus]}`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
                <div className="flex-1 min-w-[200px] bg-neutral-800 rounded-xl p-4">
                  <p className="text-neutral-400 text-sm mb-1">Payment Method</p>
                  <p className="text-white capitalize">{selectedOrder.paymentMethod}</p>
                </div>
              </div>

              {/* Tracking */}
              {selectedOrder.trackingNumber && (
                <div className="bg-neutral-800 rounded-xl p-4">
                  <p className="text-neutral-400 text-sm mb-1">Tracking Number</p>
                  <p className="text-white font-mono">{selectedOrder.trackingNumber}</p>
                </div>
              )}

              {/* Customer */}
              <div className="bg-neutral-800 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3">Customer & Shipping</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-400">Name</p>
                    <p className="text-white">{selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400">Email</p>
                    <p className="text-white">{selectedOrder.shippingAddress?.email}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400">Phone</p>
                    <p className="text-white">{selectedOrder.shippingAddress?.phone}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400">Address</p>
                    <p className="text-white">{selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city} {selectedOrder.shippingAddress?.zipCode}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-neutral-800 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-700 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-neutral-400">{item.name?.charAt(0) || 'R'}</span>
                        </div>
                        <div>
                          <p className="text-white text-sm">{item.name}</p>
                          <p className="text-neutral-500 text-xs">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-white font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-neutral-800 rounded-xl p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Subtotal</span>
                    <span className="text-white">${selectedOrder.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Shipping</span>
                    <span className="text-white">{selectedOrder.shippingCost === 0 ? 'Free' : `$${selectedOrder.shippingCost?.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Tax</span>
                    <span className="text-white">${selectedOrder.tax?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-neutral-700">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-white font-bold text-lg">${selectedOrder.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="bg-neutral-800 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">Notes</h3>
                  <p className="text-neutral-300 text-sm">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {showTracking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowTracking(false)} />
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Add Tracking Number</h2>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number..."
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowTracking(false)} className="px-4 py-2 text-neutral-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleAddTracking} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors">Save & Mark Shipped</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
