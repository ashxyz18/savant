'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, ShoppingCart, Star, Eye, Zap, Check, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../lib/image';
import toast from 'react-hot-toast';

const ProductCard = ({ product, onQuickView }) => {
  const router = useRouter();
  const { addItem, items } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const isInCart = items.some((item) => item.product._id === product._id);

  const handleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      toast.success('Added to wishlist', { icon: '❤️' });
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(product, 1);
    setAddedToCart(true);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    addItem(product, 1);
    router.push('/cart');
  };

  const handleCardClick = () => {
    router.push(`/products/${product._id}`);
  };

  const getBadgeConfig = (category) => {
    switch (category) {
      case 'men':
        return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'MEN' };
      case 'women':
        return { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', label: 'WOMEN' };
      case 'fragrances':
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'FRAGRANCES' };
      case 'backpacks':
        return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', label: 'BACKPACKS' };
      case 'new':
        return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'NEW' };
      case 'popular':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'POPULAR' };
      case 'sale':
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'SALE' };
      case 'featured':
        return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'FEATURED' };
      default:
        return { bg: 'bg-neutral-50', text: 'text-neutral-700', border: 'border-neutral-200', label: category?.toUpperCase() || 'PRODUCT' };
    }
  };

  const badge = getBadgeConfig(product.category);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0;

  const hasSecondImage = product.images && product.images.length > 1;

  return (
    <div
      className="group bg-white rounded-xl border border-neutral-200 overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:border-neutral-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="relative aspect-square bg-neutral-50 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <>
            <Image
              src={getImageUrl(product.images[0])}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transform transition-all duration-700 ${
                isHovered && hasSecondImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
            {hasSecondImage && (
              <Image
                src={getImageUrl(product.images[1])}
                alt={`${product.name} - alternate view`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`absolute inset-0 object-cover transform transition-all duration-700 ${
                  isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
              />
            )}
            {!imageLoaded && (
              <div className="absolute inset-0 shimmer" />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 bg-neutral-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-neutral-500 font-bold text-xl">{product.name?.charAt(0) || 'R'}</span>
            </div>
          </div>
        )}

        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-center pb-6 transition-all duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView?.(product._id);
            }}
            className="bg-white text-neutral-900 px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-primary-900 hover:text-white transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 shadow-lg"
          >
            <Eye className="w-4 h-4" />
            Quick View
          </button>
        </div>

        <div className={`absolute top-3 left-3 transition-all duration-300 ${
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-0 opacity-100'
        }`}>
          <span className={`${badge.bg} ${badge.text} ${badge.border} border px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm`}>
            {badge.label}
          </span>
        </div>

        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-lg transition-all duration-300 transform ${
            isWishlisted
              ? 'bg-white text-red-500 shadow-md scale-100'
              : isHovered
                ? 'bg-white/90 text-neutral-500 hover:text-red-500 shadow-sm scale-100 translate-y-0'
                : 'bg-white/70 text-neutral-400 scale-90 -translate-y-1'
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform duration-300 ${isWishlisted ? 'fill-red-500 scale-110' : ''}`} />
        </button>

        {discount > 0 && (
          <div className="absolute bottom-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">
            -{discount}%
          </div>
        )}

        {product.fastShipping && (
          <div className={`absolute bottom-3 right-3 bg-white px-2 py-1 rounded-md flex items-center gap-1 shadow-sm transition-all duration-300 ${
            isHovered ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}>
            <Zap className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-medium text-neutral-600">Fast</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-primary-900 transition-colors duration-300 line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-medium text-neutral-700">{product.rating?.toFixed(1) || '4.8'}</span>
          </div>
        </div>

        <p className="text-xs text-neutral-500 mb-3">{product.material || 'Premium Leather'}</p>

        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            {product.colors.slice(0, 5).map((color, idx) => (
              <div
                key={idx}
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ring-neutral-200 hover:scale-125 transition-transform duration-200 cursor-pointer"
                style={{ backgroundColor: color.hex || '#ccc' }}
                title={color.name || color}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-[10px] text-neutral-400 ml-1">+{product.colors.length - 5}</span>
            )}
          </div>
        )}

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-lg font-bold text-neutral-900">${product.price?.toFixed(2) || product.price}</span>
          {product.originalPrice && (
            <span className="text-xs text-neutral-400 line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>

        <div className={`flex gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'
        }`}>
          <button
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-300 ${
              addedToCart
                ? 'bg-success-500 text-white scale-95'
                : isInCart
                  ? 'bg-neutral-100 text-neutral-700 border border-neutral-200 hover:border-primary-300'
                  : 'bg-neutral-900 text-white hover:bg-primary-900 active:scale-95'
            }`}
          >
            {addedToCart ? (
              <>
                <Check className="w-3.5 h-3.5 animate-bounce-in" />
                Added!
              </>
            ) : isInCart ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Add to Cart
              </>
            )}
          </button>

          <button
            onClick={handleBuyNow}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium bg-primary-900 text-white hover:bg-primary-800 transition-all duration-300 active:scale-95"
          >
            Buy Now
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
          </button>
        </div>

        {product.stock !== undefined && product.stock <= 10 && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] text-neutral-500 flex items-center gap-1">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                product.stock <= 5 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
              }`} />
              {product.stock <= 5 ? `Only ${product.stock} left` : `${product.stock} in stock`}
            </span>
            <div className="w-16 bg-neutral-100 rounded-full h-1 overflow-hidden">
              <div
                className={`h-1 rounded-full transition-all duration-1000 ${
                  product.stock <= 5 ? 'bg-red-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, (product.stock / 20) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
