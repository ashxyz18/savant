'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../lib/image';
import api from '../../lib/api';
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  Lock,
  Check,
  MapPin,
  User,
  Mail,
  Phone,
  Building,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, itemCount } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [shipping, setShipping] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const [payment, setPayment] = useState({
    method: 'card',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  const shippingCost = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const handleShippingChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    setPayment({ ...payment, [e.target.name]: e.target.value });
  };

  const validateShipping = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    for (const field of required) {
      if (!shipping[field].trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    if (!shipping.email.includes('@')) {
      toast.error('Please enter a valid email');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateShipping()) return;

    try {
      setPlacing(true);
      const orderData = {
        items: items.map(({ product, quantity }) => ({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.images?.[0] || '',
        })),
        shippingAddress: {
          firstName: shipping.firstName,
          lastName: shipping.lastName,
          email: shipping.email,
          phone: shipping.phone,
          address: shipping.address,
          city: shipping.city,
          state: shipping.state,
          zipCode: shipping.zipCode,
          country: shipping.country,
        },
        subtotal,
        shippingCost,
        tax,
        total,
        paymentMethod: payment.method,
      };

      const order = await api.createOrder(orderData);
      setOrderId(order.orderNumber || order._id);
      clearCart();
      setStep(3);
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">No items to checkout</h2>
          <p className="text-neutral-500 mb-6">Add some products to your cart first.</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={40} className="text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Sign in to checkout</h2>
          <p className="text-neutral-500 mb-6">You need an account to place an order. Please login or create one.</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="px-6 py-3 border border-neutral-300 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Order Confirmed!</h2>
          <p className="text-neutral-500 mb-2">Thank you for your purchase.</p>
          {orderId && (
            <p className="text-sm text-neutral-600 mb-6">
              Order Number: <span className="font-mono font-bold text-neutral-900">{orderId}</span>
            </p>
          )}
          <p className="text-sm text-neutral-400 mb-8">
            We'll send a confirmation email with tracking details shortly.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/cart')}
            className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-neutral-900">Checkout</h1>
        </div>

        <div className="flex items-center justify-center gap-4 mb-10">
          {[
            { num: 1, label: 'Shipping' },
            { num: 2, label: 'Payment' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s.num
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-200 text-neutral-500'
                }`}
              >
                {step > s.num ? <Check size={16} /> : s.num}
              </div>
              <span
                className={`text-sm font-medium ${
                  step >= s.num ? 'text-neutral-900' : 'text-neutral-400'
                }`}
              >
                {s.label}
              </span>
              {s.num < 2 && (
                <div
                  className={`w-16 sm:w-24 h-0.5 ${
                    step > s.num ? 'bg-primary-600' : 'bg-neutral-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin size={20} className="text-primary-400" />
                  <h2 className="text-lg font-bold text-neutral-900">Shipping Information</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      First Name *
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        name="firstName"
                        value={shipping.firstName}
                        onChange={handleShippingChange}
                        className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                        placeholder="John"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={shipping.lastName}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                      placeholder="Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="email"
                        name="email"
                        value={shipping.email}
                        onChange={handleShippingChange}
                        className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Phone *
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={shipping.phone}
                        onChange={handleShippingChange}
                        className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                        placeholder="+1 (555) 000-0000"
                        required
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Street Address *
                    </label>
                    <div className="relative">
                      <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        name="address"
                        value={shipping.address}
                        onChange={handleShippingChange}
                        className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                        placeholder="123 Main St, Apt 4B"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shipping.city}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shipping.state}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                      placeholder="NY"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={shipping.zipCode}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                      placeholder="10001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Country
                    </label>
                    <select
                      name="country"
                      value={shipping.country}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => {
                      if (validateShipping()) setStep(2);
                    }}
                    className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <CreditCard size={20} className="text-primary-400" />
                    <h2 className="text-lg font-bold text-neutral-900">Payment Method</h2>
                  </div>

                  <div className="space-y-3">
                    <label
                      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        payment.method === 'card'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="method"
                        value="card"
                        checked={payment.method === 'card'}
                        onChange={handlePaymentChange}
                        className="text-primary-400 focus:ring-primary-500"
                      />
                      <CreditCard size={20} className="text-neutral-600" />
                      <span className="font-medium text-neutral-800">Credit / Debit Card</span>
                    </label>
                    <label
                      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        payment.method === 'cod'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="method"
                        value="cod"
                        checked={payment.method === 'cod'}
                        onChange={handlePaymentChange}
                        className="text-primary-400 focus:ring-primary-500"
                      />
                      <Truck size={20} className="text-neutral-600" />
                      <span className="font-medium text-neutral-800">Cash on Delivery</span>
                    </label>
                  </div>

                  {payment.method === 'card' && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                          Card Number
                        </label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <input
                            type="text"
                            name="cardNumber"
                            value={payment.cardNumber}
                            onChange={handlePaymentChange}
                            className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                          Name on Card
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          value={payment.cardName}
                          onChange={handlePaymentChange}
                          className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            name="expiry"
                            value={payment.expiry}
                            onChange={handlePaymentChange}
                            className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            CVV
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            value={payment.cvv}
                            onChange={handlePaymentChange}
                            className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin size={18} className="text-primary-400" />
                    <h3 className="font-semibold text-neutral-900">Shipping Address</h3>
                    <button
                      onClick={() => setStep(1)}
                      className="ml-auto text-sm text-primary-400 hover:text-primary-500"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="text-sm text-neutral-600 space-y-1">
                    <p className="font-medium text-neutral-800">
                      {shipping.firstName} {shipping.lastName}
                    </p>
                    <p>{shipping.address}</p>
                    <p>
                      {shipping.city}, {shipping.state} {shipping.zipCode}
                    </p>
                    <p>{shipping.country}</p>
                    <p>{shipping.phone}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Back to Shipping
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="px-8 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    {placing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        Place Order — ${total.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-neutral-200 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">
                Order Summary ({itemCount} item{itemCount !== 1 ? 's' : ''})
              </h2>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map(({ product, quantity }) => (
                  <div key={product._id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-neutral-100 rounded-lg flex-shrink-0 overflow-hidden relative">
                      {product.images?.[0] ? (
                        <Image
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-neutral-300 absolute inset-0 flex items-center justify-center">{product.name?.charAt(0) || 'R'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">{product.name}</p>
                      <p className="text-xs text-neutral-500">Qty: {quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-neutral-900">
                      ${(product.price * quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-neutral-200 pt-2 flex justify-between font-bold text-neutral-900 text-base">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-neutral-500 bg-neutral-50 p-3 rounded-lg">
                <Shield size={14} className="text-green-500 flex-shrink-0" />
                Your payment information is encrypted and secure.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
