'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import api from '../../../lib/api';
import { useCart } from '../../../context/CartContext';
import { getImageUrl } from '../../../lib/image';
import { productUrl } from '../../../lib/routes';
import { formatBDT } from '../../../lib/format';
import {
  ShoppingCart,
  Heart,
  ArrowLeft,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Share2,
  ChevronRight,
  ZoomIn,
  Info,
  FileText,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

function ProductDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({});

  const imageRef = useRef(null);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  useEffect(() => {
    if (product?._id) {
      try {
        const stored = localStorage.getItem('recentlyViewed');
        let ids = stored ? JSON.parse(stored) : [];
        ids = ids.filter((x) => x !== product._id);
        ids.unshift(product._id);
        ids = ids.slice(0, 10);
        localStorage.setItem('recentlyViewed', JSON.stringify(ids));
      } catch {
        // localStorage not available
      }
    }
  }, [product?._id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await api.getProduct(id);
      setProduct(data);
      if (data.images && data.images.length > 0) {
        setActiveImage(0);
      }
      if (data.category) {
        const related = await api.getProducts({ category: data.category, limit: 4 });
        const filtered = (related.products || related).filter(
          (p) => p._id !== data._id
        );
        setRelatedProducts(filtered.slice(0, 4));
      }
    } catch (error) {
      toast.error('Product not found');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    const chosenColor = product?.colors && product.colors.length > 0
      ? (typeof product.colors[selectedColor] === 'object' ? product.colors[selectedColor].name : product.colors[selectedColor])
      : null;
    const chosenSize = product?.sizes && product.sizes.length > 0 ? product.sizes[selectedSize] : null;
    addItem(product, quantity, chosenSize, chosenColor);
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    const chosenColor = product?.colors && product.colors.length > 0
      ? (typeof product.colors[selectedColor] === 'object' ? product.colors[selectedColor].name : product.colors[selectedColor])
      : null;
    const chosenSize = product?.sizes && product.sizes.length > 0 ? product.sizes[selectedSize] : null;
    addItem(product, quantity, chosenSize, chosenColor);
    router.push('/cart');
  };

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;

    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900" />
      </div>
    );
  }

  if (!product) return null;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0;

  return (
    <div className="min-h-screen bg-white animate-fade-in">
      {/* Back Navigation & Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-3 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
          Back
        </button>
        <nav className="flex items-center gap-2 text-sm text-neutral-400 font-medium">
          <button onClick={() => router.push('/')} className="hover:text-[#7B1E3B] transition-colors">
            Home
          </button>
          <ChevronRight size={14} />
          <button onClick={() => router.push(`/products?category=${product.category}`)} className="capitalize hover:text-[#7B1E3B] transition-colors">
            {product.category}
          </button>
          <ChevronRight size={14} />
          <span className="text-neutral-900 font-semibold truncate">{product.name}</span>
        </nav>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Image Gallery (7 cols on LG) */}
          <div className="lg:col-span-7 space-y-4">
            <div
              className="relative aspect-square bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200/80 shadow-sm cursor-zoom-in group"
              onClick={() => setLightboxOpen(true)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              ref={imageRef}
            >
              {product.images && product.images.length > 0 ? (
                <Image
                  src={getImageUrl(product.images[activeImage])}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover transition-transform duration-300"
                  style={zoomStyle}
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-neutral-100">
                  <span className="text-7xl font-bold text-neutral-300 font-display">{product.name?.charAt(0) || 'S'}</span>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {discount > 0 && (
                  <span className="bg-[#7B1E3B] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md tracking-wider">
                    -{discount}% OFF
                  </span>
                )}
                <span className="bg-amber-800 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-md shadow-sm">
                  100% Genuine Leather
                </span>
              </div>

              {/* Action Floating Buttons */}
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsWishlisted(!isWishlisted);
                    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
                  }}
                  className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl shadow-md hover:bg-white transition-all active:scale-95"
                  title="Wishlist"
                >
                  <Heart
                    size={20}
                    className={isWishlisted ? 'fill-[#7B1E3B] text-[#7B1E3B]' : 'text-neutral-500'}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxOpen(true);
                  }}
                  className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl shadow-md hover:bg-white transition-all active:scale-95"
                  title="Full Screen View"
                >
                  <ZoomIn size={20} className="text-neutral-600" />
                </button>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all relative ${
                      activeImage === idx
                        ? 'border-[#7B1E3B] ring-2 ring-[#7B1E3B]/20 scale-105'
                        : 'border-neutral-200 hover:border-neutral-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={getImageUrl(img)}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Buy Controls (5 cols on LG) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold tracking-widest text-[#7B1E3B] uppercase bg-[#7B1E3B]/10 px-3 py-1 rounded-full">
                  {product.category || 'Leather Goods'}
                </span>
                {product.sku && (
                  <span className="text-xs font-mono font-medium text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-md">
                    SKU: {product.sku}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">
                {product.name}
              </h1>

              {/* Rating Review Summary */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center text-amber-500">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                </div>
                <span className="text-sm font-bold text-neutral-800">4.9</span>
                <span className="text-xs text-neutral-400">(32 Customer Reviews)</span>
              </div>

              {/* Price & Savings */}
              <div className="flex items-baseline gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <span className="text-3xl font-extrabold text-[#7B1E3B]">
                  {formatBDT(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-neutral-400 line-through">
                      {formatBDT(product.originalPrice)}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      Save {formatBDT(product.originalPrice - product.price)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Options Selection (Sizes & Colors) */}
            <div className="space-y-4 pt-2 border-t border-neutral-100">
              
              {/* Dimensions Info Box */}
              {product.dimensions && (product.dimensions.height || product.dimensions.width) && (
                <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-0.5">
                    📐 Bag / Product Dimensions
                  </div>
                  <p className="text-sm font-mono font-bold text-neutral-800">
                    {[product.dimensions.height, product.dimensions.width, product.dimensions.depth].filter(Boolean).join(' × ')} {product.dimensions.unit || 'in'}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">(Height × Width × Depth)</p>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-sm font-bold text-neutral-800">
                      Select Size: <span className="text-[#7B1E3B] font-extrabold">{product.sizes[selectedSize]}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => toast('Standard sizing guide: Bags (Small/Medium/Large), Belts (32"-42")', { icon: '📏' })}
                      className="text-xs text-[#7B1E3B] font-semibold hover:underline flex items-center gap-1"
                    >
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.sizes.map((size, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(idx)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                          selectedSize === idx
                            ? 'border-[#7B1E3B] bg-[#7B1E3B] text-white shadow-md shadow-[#7B1E3B]/20 scale-105'
                            : 'border-neutral-200 text-neutral-700 hover:border-neutral-400 bg-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <span className="block text-sm font-bold text-neutral-800 mb-2.5">
                    Color: <span className="text-neutral-900 font-semibold">{typeof product.colors[selectedColor] === 'object' ? product.colors[selectedColor].name : product.colors[selectedColor]}</span>
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((color, idx) => {
                      const colorName = typeof color === 'object' ? color.name : color;
                      const colorHex = typeof color === 'object' ? color.hex : null;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedColor(idx)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                            selectedColor === idx
                              ? 'border-[#7B1E3B] bg-[#7B1E3B] text-white shadow-md shadow-[#7B1E3B]/20'
                              : 'border-neutral-200 text-neutral-700 hover:border-neutral-400 bg-white'
                          }`}
                        >
                          {colorHex && (
                            <span
                              className={`w-3.5 h-3.5 rounded-full border ${selectedColor === idx ? 'border-white/50' : 'border-neutral-300'}`}
                              style={{ backgroundColor: colorHex }}
                            />
                          )}
                          {colorName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="flex items-center gap-2 pt-1">
                {product.stock > 0 ? (
                  <>
                    <Check size={16} className="text-emerald-600 font-bold" />
                    <span className="text-sm text-emerald-700 font-semibold">In Stock & Ready to Ship</span>
                    {product.stock <= 5 && (
                      <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                        Only {product.stock} left!
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-red-500 font-bold">Currently Out of Stock</span>
                )}
              </div>

              {/* Quantity & Buy Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-neutral-200 rounded-xl bg-white p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2.5 hover:bg-neutral-100 transition-colors rounded-lg text-neutral-700"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 text-center min-w-[44px] font-bold text-sm text-neutral-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                      className="p-2.5 hover:bg-neutral-100 transition-colors rounded-lg text-neutral-700"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:bg-neutral-300 text-sm"
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                </div>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="w-full py-3.5 bg-[#7B1E3B] hover:bg-[#651828] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#7B1E3B]/25 active:scale-[0.98] disabled:bg-neutral-300 text-sm"
                >
                  Buy Now — Fast Checkout
                </button>
              </div>

              {/* Share button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                  }}
                  className="flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-[#7B1E3B] transition-colors"
                >
                  <Share2 size={14} />
                  Share this product
                </button>
                <span className="text-xs text-neutral-400">⚡ Fast Shipping Nationwide</span>
              </div>
            </div>

            {/* Trust Features Cards */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-100">
              <div className="p-3 bg-neutral-50 rounded-xl text-center border border-neutral-100">
                <Shield size={18} className="text-[#7B1E3B] mx-auto mb-1" />
                <p className="text-xs font-bold text-neutral-800">2-Year Warranty</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">Leather Guarantee</p>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl text-center border border-neutral-100">
                <RotateCcw size={18} className="text-[#7B1E3B] mx-auto mb-1" />
                <p className="text-xs font-bold text-neutral-800">Easy Returns</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">30 Days Return</p>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl text-center border border-neutral-100">
                <Truck size={18} className="text-[#7B1E3B] mx-auto mb-1" />
                <p className="text-xs font-bold text-neutral-800">Fast Delivery</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">All Over BD 🇧🇩</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Detail Section */}
        <div className="mt-16 pt-8 border-t border-neutral-200">
          <div className="flex border-b border-neutral-200 gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('description')}
              className={`py-3 px-6 font-bold text-sm transition-all border-b-2 ${
                activeTab === 'description'
                  ? 'text-[#7B1E3B] border-[#7B1E3B]'
                  : 'text-neutral-500 border-transparent hover:text-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText size={16} />
                Description
              </div>
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`py-3 px-6 font-bold text-sm transition-all border-b-2 ${
                activeTab === 'specs'
                  ? 'text-[#7B1E3B] border-[#7B1E3B]'
                  : 'text-neutral-500 border-transparent hover:text-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Info size={16} />
                Specifications
              </div>
            </button>

            <button
              onClick={() => setActiveTab('care')}
              className={`py-3 px-6 font-bold text-sm transition-all border-b-2 ${
                activeTab === 'care'
                  ? 'text-[#7B1E3B] border-[#7B1E3B]'
                  : 'text-neutral-500 border-transparent hover:text-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield size={16} />
                Leather Care
              </div>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="py-6">
            {activeTab === 'description' && (
              <div className="max-w-3xl space-y-4">
                <h3 className="font-bold text-lg text-neutral-900">Craftsmanship & Design</h3>
                <p className="text-neutral-600 leading-relaxed text-sm">
                  {product.description || product.shortDescription || 'Every SAVANT piece is handcrafted by master artisans using full-grain leather, ensuring unmatched durability and timeless elegance.'}
                </p>
                {product.material && (
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 text-sm">
                    <strong className="text-neutral-900">Material & Construction:</strong> {product.material}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-3xl">
                <h3 className="font-bold text-lg text-neutral-900 mb-4">Product Specifications</h3>
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100 text-sm">
                  <div className="flex justify-between p-3.5 bg-neutral-50">
                    <span className="text-neutral-500 font-medium">SKU</span>
                    <span className="font-mono font-bold text-neutral-900">{product.sku || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between p-3.5">
                    <span className="text-neutral-500 font-medium">Material</span>
                    <span className="font-semibold text-neutral-900">{product.material || 'Full Grain Premium Leather'}</span>
                  </div>
                  <div className="flex justify-between p-3.5 bg-neutral-50">
                    <span className="text-neutral-500 font-medium">Dimensions</span>
                    <span className="font-mono font-semibold text-neutral-900">
                      {product.dimensions && (product.dimensions.height || product.dimensions.width)
                        ? `${[product.dimensions.height, product.dimensions.width, product.dimensions.depth].filter(Boolean).join(' × ')} ${product.dimensions.unit || 'in'}`
                        : 'Standard Size'}
                    </span>
                  </div>
                  <div className="flex justify-between p-3.5">
                    <span className="text-neutral-500 font-medium">Available Sizes</span>
                    <span className="font-semibold text-neutral-900">{product.sizes?.join(', ') || 'Standard'}</span>
                  </div>
                  <div className="flex justify-between p-3.5 bg-neutral-50">
                    <span className="text-neutral-500 font-medium">Warranty</span>
                    <span className="font-semibold text-neutral-900">2-Year Full Leather Warranty</span>
                  </div>
                  <div className="flex justify-between p-3.5">
                    <span className="text-neutral-500 font-medium">Origin</span>
                    <span className="font-semibold text-neutral-900">Handcrafted in Bangladesh 🇧🇩</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="max-w-3xl space-y-4">
                <h3 className="font-bold text-lg text-neutral-900">Leather Care & Maintenance</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                    <h4 className="font-bold text-[#7B1E3B] mb-1">🧼 Cleaning</h4>
                    <p className="text-neutral-600 text-xs leading-relaxed">
                      Wipe gently with a soft dry cloth. For stains, use a damp cloth with leather cleaner. Avoid water soaking.
                    </p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                    <h4 className="font-bold text-[#7B1E3B] mb-1">✨ Conditioning</h4>
                    <p className="text-neutral-600 text-xs leading-relaxed">
                      Apply quality leather conditioner every 3-6 months to preserve softness, prevent cracks, and enrich patina.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-neutral-200">
            <h2 className="text-2xl font-bold text-neutral-900 mb-8">Similar Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <button
                  key={p._id}
                  onClick={() => {
                    router.push(productUrl(p._id));
                    window.scrollTo(0, 0);
                  }}
                  className="group bg-white rounded-lg border border-neutral-200 overflow-hidden hover:border-neutral-400 transition-colors text-left"
                >
                  <div className="aspect-square bg-neutral-50 flex items-center justify-center relative overflow-hidden">
                    {p.images && p.images[0] ? (
                      <Image
                        src={getImageUrl(p.images[0])}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-neutral-200">{p.name?.charAt(0) || 'R'}</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-neutral-800 text-sm truncate">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-neutral-900 text-sm">{formatBDT(p.price)}</span>
                      {p.originalPrice && (
                        <span className="text-xs text-neutral-400 line-through">
                          {formatBDT(p.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-4" onClick={() => setLightboxOpen(false)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
            >
              <X size={24} />
            </button>

            {product.images && product.images[activeImage] && (
              <div className="relative w-full" style={{ height: '80vh' }}>
                <Image
                  src={getImageUrl(product.images[activeImage])}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 896px"
                  className="object-contain"
                  priority
                />
              </div>
            )}

            {product.images && product.images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors relative ${activeImage === idx
                      ? 'border-white' : 'border-white/30 hover:border-white/60'}`}
                  >
                    <Image
                      src={getImageUrl(img)}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductViewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900" />
        </div>
      }
    >
      <ProductDetailPage />
    </Suspense>
  );
}
