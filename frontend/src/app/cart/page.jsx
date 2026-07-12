'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import { getImageUrl } from '../../lib/image';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Truck,
  Shield,
  RotateCcw,
  Tag,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, subtotal, itemCount } = useCart();

  const shippingCost = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-neutral-300 mb-4" />
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">Your cart is empty</h2>
          <p className="text-neutral-500 mb-6">Looks like you haven't added anything yet.</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Shopping Cart</h1>
            <p className="text-neutral-500 mt-1">{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-500 font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div
                key={product._id}
                className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-6 flex gap-4 sm:gap-6"
              >
                <button
                  onClick={() => router.push(`/products/${product._id}`)}
                  className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-lg overflow-hidden relative"
                >
                  {product.images && product.images[0] ? (
                    <Image
                      src={getImageUrl(product.images[0])}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 96px, 128px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-2xl font-bold text-neutral-200">{product.name?.charAt(0) || 'R'}</span>
                    </div>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => router.push(`/products/${product._id}`)}
                    className="text-left"
                  >
                    <h3 className="font-semibold text-neutral-900 hover:text-primary-400 transition-colors truncate">
                      {product.name}
                    </h3>
                  </button>
                  {product.material && (
                    <p className="text-sm text-neutral-500 mt-0.5">{product.material}</p>
                  )}
                  {product.colors && product.colors.length > 0 && (
                    <p className="text-sm text-neutral-500 mt-0.5">Color: {typeof product.colors[0] === 'object' ? product.colors[0].name : product.colors[0]}</p>
                  )}

                  <div className="flex items-end justify-between mt-4">
                    <div className="flex items-center border border-neutral-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(product._id, quantity - 1)}
                        className="p-2 hover:bg-neutral-50 transition-colors rounded-l-lg"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm font-medium min-w-[36px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product._id, quantity + 1)}
                        className="p-2 hover:bg-neutral-50 transition-colors rounded-r-lg"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-neutral-900">
                          ${(product.price * quantity).toFixed(2)}
                        </p>
                        {quantity > 1 && (
                          <p className="text-xs text-neutral-400">${product.price.toFixed(2)} each</p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          removeItem(product._id);
                          toast.success('Item removed from cart');
                        }}
                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <button
                onClick={() => {
                  clearCart();
                  toast.success('Cart cleared');
                }}
                className="text-sm text-neutral-500 hover:text-red-500 transition-colors"
              >
                Clear entire cart
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-neutral-200 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Order Summary</h2>

              <div className="flex gap-2 mb-6">
                <div className="flex-1 relative">
                  <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Coupon code"
                    className="w-full pl-9 pr-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
                <button className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">
                  Apply
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? <span className="text-green-600 font-medium">Free</span> : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {shippingCost === 0 && (
                  <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    <Truck size={14} />
                    You qualify for free shipping!
                  </div>
                )}
                <div className="border-t border-neutral-200 pt-3 flex justify-between font-bold text-neutral-900 text-base">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full mt-6 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
              >
                Proceed to Checkout
              </button>

              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Truck size={14} className="text-primary-400" />
                  Free shipping on orders over $50
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Shield size={14} className="text-primary-400" />
                  Secure checkout with SSL encryption
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <RotateCcw size={14} className="text-primary-400" />
                  30-day hassle-free returns
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
