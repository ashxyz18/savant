import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { initiateSSLCOMMERZ } from '../lib/sslcommerz.js';

export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      sort = 'createdAt',
      order = 'desc',
      search,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.lastName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.email': { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ [sort]: sortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('user', 'name email');

    res.json({
      orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    // Require a phone number and a complete shipping address before any order
    // can be placed. This is enforced server-side so it cannot be bypassed
    // from the client.
    if (!shippingAddress || typeof shippingAddress !== 'object') {
      return res.status(400).json({ message: 'Shipping address is required' });
    }
    const requiredAddressFields = [
      'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode',
    ];
    for (const field of requiredAddressFields) {
      if (!shippingAddress[field] || !String(shippingAddress[field]).trim()) {
        return res.status(400).json({ message: `Shipping ${field} is required` });
      }
    }
    if (!/^\+?[\d\s()-]{6,}$/.test(shippingAddress.phone)) {
      return res.status(400).json({ message: 'A valid phone number is required' });
    }
    if (!shippingAddress.email.includes('@')) {
      return res.status(400).json({ message: 'A valid email is required' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      item.price = product.price;
      item.name = product.name;
      item.image = product.images?.[0] || product.emoji;
      subtotal += product.price * item.quantity;

      // Decrease stock
      product.stock -= item.quantity;
      await product.save();
    }

    const shippingCost = subtotal > 100 ? 0 : 10;
    const tax = subtotal * 0.08;
    const total = subtotal + shippingCost + tax;

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ROSEO-${String(orderCount + 1).padStart(6, '0')}`;
    const tran_id = `TXN-${Date.now()}-${orderCount + 1}`;
    const currency = 'BDT';

    const order = await Order.create({
      orderNumber,
      tran_id,
      user: req.user?._id || null,
      items,
      shippingAddress,
      subtotal,
      shippingCost,
      tax,
      total,
      currency,
      paymentMethod: paymentMethod || 'card',
    });

    // SSLCOMMERZ hosted checkout: create the order, then redirect the user
    // to the gateway. The frontend receives the URL and navigates there.
    if (paymentMethod === 'sslcommerz') {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0];
      const gatewayUrl = await initiateSSLCOMMERZ({
        tran_id,
        total,
        currency,
        productName: items.map((i) => i.name).join(', ').slice(0, 200),
        customer: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          country: shippingAddress.country,
        },
        successUrl: `${siteUrl}/api/payment/success`,
        failUrl: `${siteUrl}/api/payment/fail`,
        cancelUrl: `${siteUrl}/api/payment/cancel`,
        ipnUrl: `${siteUrl}/api/payment/ipn`,
      });
      return res.status(200).json({ paymentUrl: gatewayUrl, orderNumber, tran_id });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;

    // Auto-update payment status when delivered
    if (status === 'delivered' && order.paymentStatus === 'pending') {
      order.paymentStatus = 'paid';
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addTrackingNumber = async (req, res) => {
  try {
    const { trackingNumber } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { trackingNumber, status: 'shipped' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
