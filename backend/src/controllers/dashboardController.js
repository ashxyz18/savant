import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Total revenue
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    // Monthly revenue
    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    // Last month revenue
    const lastMonthRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    // Order counts
    const totalOrders = await Order.countDocuments();
    const monthlyOrders = await Order.countDocuments({ createdAt: { $gte: startOfMonth } });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const recentOrders = await Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Product stats
    const totalProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 10 }, isActive: true });
    const outOfStockProducts = await Product.countDocuments({ stock: 0, isActive: true });

    // Customer stats
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const newCustomers = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: startOfMonth },
    });

    // Revenue by day (last 30 days)
    const revenueChart = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // Recent orders
    const recentOrdersList = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    // Category distribution
    const categoryDistribution = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const currentMonthRev = monthlyRevenue[0]?.total || 0;
    const lastMonthRev = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastMonthRev > 0
      ? (((currentMonthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(1)
      : 100;

    res.json({
      revenue: {
        total: totalRevenue[0]?.total || 0,
        monthly: currentMonthRev,
        growth: Number(revenueGrowth),
      },
      orders: {
        total: totalOrders,
        monthly: monthlyOrders,
        pending: pendingOrders,
        recent: recentOrders,
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
      },
      customers: {
        total: totalCustomers,
        new: newCustomers,
      },
      charts: {
        revenue: revenueChart,
        ordersByStatus,
        categoryDistribution,
      },
      topProducts,
      recentOrders: recentOrdersList,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
