'use client';

import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Eye,
  ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#8b5cf6',
  shipped: '#06b6d4',
  delivered: '#10b981',
  cancelled: '#ef4444',
  refunded: '#6b7280',
};

const CATEGORY_COLORS = ['#ef6c2e', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, color }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-3">
          {trend >= 0 ? (
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )}
          <span className={`text-sm font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
          <span className="text-xs text-neutral-500">vs last month</span>
        </div>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 shadow-xl">
      <p className="text-xs text-neutral-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold text-white">
          {entry.name === 'revenue' ? '$' : ''}
          {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-neutral-400">Failed to load dashboard data</p>
      </div>
    );
  }

  const revenueChartData = stats.charts.revenue.map((item) => ({
    date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: item.revenue,
    orders: item.orders,
  }));

  const ordersByStatusData = stats.charts.ordersByStatus.map((item) => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count,
    color: STATUS_COLORS[item._id] || '#6b7280',
  }));

  const categoryData = stats.charts.categoryDistribution.map((item, i) => ({
    name: item._id ? item._id.charAt(0).toUpperCase() + item._id.slice(1) : 'Uncategorized',
    count: item.count,
    fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${stats.revenue.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`$${stats.revenue.monthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} this month`}
          icon={DollarSign}
          trend={stats.revenue.growth}
          color="bg-emerald-600"
        />
        <StatCard
          title="Total Orders"
          value={stats.orders.total.toLocaleString()}
          subtitle={`${stats.orders.monthly} this month · ${stats.orders.pending} pending`}
          icon={ShoppingCart}
          color="bg-blue-600"
        />
        <StatCard
          title="Products"
          value={stats.products.total.toLocaleString()}
          subtitle={`${stats.products.lowStock} low stock · ${stats.products.outOfStock} out of stock`}
          icon={Package}
          color="bg-primary-600"
        />
        <StatCard
          title="Customers"
          value={stats.customers.total.toLocaleString()}
          subtitle={`${stats.customers.new} new this month`}
          icon={Users}
          color="bg-purple-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Revenue Overview</h3>
          {revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef6c2e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef6c2e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" stroke="#525252" tick={{ fontSize: 12 }} />
                <YAxis stroke="#525252" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#ef6c2e"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  name="revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-neutral-500">
              No revenue data yet
            </div>
          )}
        </div>

        {/* Orders by Status */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Orders by Status</h3>
          {ordersByStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={ordersByStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {ordersByStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#171717',
                      border: '1px solid #262626',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {ordersByStatusData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-neutral-400">{item.name}</span>
                    </div>
                    <span className="text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-neutral-500">
              No orders yet
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
            <a href="/admin/orders" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          {stats.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-700 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{order.orderNumber}</p>
                      <p className="text-xs text-neutral-500">
                        {order.user?.name || order.shippingAddress?.firstName || 'Guest'} ·{' '}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      ${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <span
                      className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `${STATUS_COLORS[order.status]}20`,
                        color: STATUS_COLORS[order.status],
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-neutral-500">
              No orders yet
            </div>
          )}
        </div>

        {/* Top Products + Category Distribution */}
        <div className="space-y-6">
          {/* Top Products */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top Selling Products</h3>
            {stats.topProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.topProducts.map((product, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary-500/10 text-primary-400 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-sm text-white truncate max-w-[200px]">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-white">{product.totalSold} sold</span>
                      <span className="text-xs text-neutral-500 ml-2">
                        ${product.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-neutral-500">
                No sales data yet
              </div>
            )}
          </div>

          {/* Category Distribution */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Category Distribution</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={categoryData} layout="vertical">
                  <XAxis type="number" stroke="#525252" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#525252"
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#171717',
                      border: '1px solid #262626',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-32 text-neutral-500">
                No products yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.products.lowStock > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-amber-400">Low Stock Alert</h3>
          </div>
          <p className="text-sm text-amber-200/70">
            {stats.products.lowStock} product{stats.products.lowStock > 1 ? 's' : ''} running low on stock
            {stats.products.outOfStock > 0 &&
              ` · ${stats.products.outOfStock} out of stock`}
          </p>
          <a
            href="/admin/products"
            className="inline-flex items-center gap-1 mt-3 text-sm text-amber-400 hover:text-amber-300"
          >
            View products <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
