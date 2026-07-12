'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '../../../lib/api';
import { useCart } from '../../../context/CartContext';
import { getImageUrl } from '../../../lib/image';
import {
  ShoppingCart,
  Heart,
  Star,
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
  MessageSquare,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({});
  
  const imageRef = useRef(null);
  
  useEffect(() => {
    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  useEffect(() => {
    if (product?._id) {
      try {
        const stored = localStorage.getItem('recentlyViewed');
        let ids = stored ? JSON.parse(stored) : [];
        ids = ids.filter((id) => id !== product._id);
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
      const data = await api.getProduct(params.id);
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
    addItem(product, quantity);
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push('/checkout');
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
        <nav className="flex items-center gap-2 text-sm text-neutral-400">
          <button onClick={() => router.push('/')} className="hover:text-neutral-900 transition-colors">
            Home
          </button>
          <ChevronRight size={14} />
          <span className="capitalize">{product.category}</span>
          <ChevronRight size={14} />
          <span className="text-neutral-900 font-medium truncate">{product.name}</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Section with Zoom */}
          <div className="space-y-4">
            <div 
              className="relative aspect-square bg-neutral-50 rounded-xl overflow-hidden border border-neutral-200 cursor-zoom-in"
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
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-300"
                  style={zoomStyle}
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-6xl font-bold text-neutral-200">{product.name?.charAt(0) || 'R'}</span>
                </div>
              )}
              
              <div className="absolute top-4 right-4 flex gap-2">
                {discount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-md">
                    -{discount}%
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsWishlisted(!isWishlisted);
                  }}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
                >
                  <Heart
                    size={18}
                    className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-400'}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxOpen(true);
                  }}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
                >
                  <ZoomIn size={18} className="text-neutral-400" />
                </button>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors relative ${activeImage === idx
                      ? 'border-neutral-900' : 'border-neutral-200 hover:border-neutral-400'}`}
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

          {/* Sticky Details Section */}
          <div className="lg:sticky lg:top-24 space-y-6 self-start">
            <div className="text-sm text-neutral-500">
              SKU: {product.sku || 'N/A'}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-md capitalize">
                {product.category}
              </span>
              {product.featured && (
                <span className="px-3 py-1 bg-neutral-900 text-white text-xs font-medium rounded-md">
                  Featured
                </span>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900">
              {product.name}
            </h1>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.floor(product.rating || 0)
                      ? 'fill-neutral-900 text-neutral-900'
                      : 'text-neutral-200'}
                  />
                ))}
              </div>
              <span className="text-neutral-500 text-sm">
                {product.rating?.toFixed(1) || '0.0'} ({product.reviewCount || 0} reviews)
              </span>
            </div>

            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-neutral-900">
                ${product.price?.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-base text-neutral-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                    Save ${(product.originalPrice - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-neutral-100">
              {product.colors && product.colors.length > 0 && (
                <div className="mb-4">
                  <span className="block text-sm font-medium text-neutral-800 mb-3">
                    Color: {typeof product.colors[selectedColor] === 'object' ? product.colors[selectedColor].name : product.colors[selectedColor]}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, idx) => {
                      const colorName = typeof color === 'object' ? color.name : color;
                      const colorHex = typeof color === 'object' ? color.hex : null;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedColor(idx)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border transition-colors ${selectedColor === idx
                            ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'}`}
                        >
                          {colorHex && (
                            <span
                              className={`w-3 h-3 rounded-full border ${selectedColor === idx ? 'border-white/50' : 'border-neutral-300'}`}
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

              <div className="flex items-center gap-2 mb-4">
                {product.stock > 0 ? (
                  <>
                    <Check size={16} className="text-green-600" />
                    <span className="text-sm text-green-600 font-medium">In Stock</span>
                    {product.stock <= 5 && (
                      <span className="text-xs text-amber-600 font-medium">
                        (Only {product.stock} left!)
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-red-500 font-medium">Out of Stock</span>
                )}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center border border-neutral-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-neutral-50 transition-colors rounded-l-lg"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 text-center min-w-[48px] font-medium text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    className="p-3 hover:bg-neutral-50 transition-colors rounded-r-lg"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 hover:bg-neutral-200 disabled:bg-neutral-100 disabled:cursor-not-allowed text-neutral-900 font-semibold rounded-lg transition-colors text-sm"
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Buy Now
                </button>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied!');
                }}
                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-900 transition-colors"
              >
                <Share2 size={14} />
                Share this product
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-neutral-200">
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <Truck size={18} className="text-neutral-400" />
                <div>
                  <p className="text-xs font-medium text-neutral-800">Free Shipping</p>
                  <p className="text-xs text-neutral-400">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <Shield size={18} className="text-neutral-400" />
                <div>
                  <p className="text-xs font-medium text-neutral-800">2-Year Warranty</p>
                  <p className="text-xs text-neutral-400">Quality guaranteed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <RotateCcw size={18} className="text-neutral-400" />
                <div>
                  <p className="text-xs font-medium text-neutral-800">Easy Returns</p>
                  <p className="text-xs text-neutral-400">30-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Content Section */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <div className="flex border-b border-neutral-200 mb-6">
            <button
              onClick={() => setActiveTab('description')}
              className={`py-3 px-6 font-medium text-sm ${activeTab === 'description' ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              <div className="flex items-center gap-2">
                <FileText size={16} />
                Description
              </div>
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`py-3 px-6 font-medium text-sm ${activeTab === 'specs' ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              <div className="flex items-center gap-2">
                <Info size={16} />
                Specifications
              </div>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-3 px-6 font-medium text-sm ${activeTab === 'reviews' ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare size={16} />
                Reviews ({product.reviewCount || 0})
              </div>
            </button>
          </div>

          <div className="prose prose-neutral max-w-none">
            {activeTab === 'description' && (
              <div>
                <h3 className="font-bold text-lg mb-4">Product Description</h3>
                <p className="text-neutral-600 mb-4">
                  {product.description || product.shortDescription || 'No description available.'}
                </p>
                {product.material && (
                  <div className="mb-4">
                    <strong>Material:</strong> {product.material}
                  </div>
                )}
                {product.dimensions && (
                  <div>
                    <strong>Dimensions:</strong> {product.dimensions}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <div>
                <h3 className="font-bold text-lg mb-4">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-600">SKU</span>
                      <span>{product.sku || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-600">Material</span>
                      <span>{product.material || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-600">Weight</span>
                      <span>{product.weight || 'N/A'}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-600">Dimensions</span>
                      <span>{product.dimensions || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-600">Warranty</span>
                      <span>2 years</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-600">Country of Origin</span>
                      <span>Italy</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="font-bold text-lg mb-4">Customer Reviews</h3>
                <div className="bg-neutral-50 rounded-lg p-6 text-center">
                  <div className="text-4xl font-bold text-neutral-900 mb-2">
                    {product.rating?.toFixed(1) || '4.8'}/5
                  </div>
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={`${i < Math.floor(product.rating || 4.8) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-neutral-500">
                    Based on {product.reviewCount || 24} customer reviews
                  </p>
                  <button className="mt-4 px-6 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">
                    Write a Review
                  </button>
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
                    router.push(`/products/${p._id}`);
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
                      <span className="font-bold text-neutral-900 text-sm">${p.price?.toFixed(2)}</span>
                      {p.originalPrice && (
                        <span className="text-xs text-neutral-400 line-through">
                          ${p.originalPrice.toFixed(2)}
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
