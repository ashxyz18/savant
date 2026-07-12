import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Category from './models/Category.js';
import Banner from './models/Banner.js';
import Brand from './models/Brand.js';

dotenv.config();

const generateSKU = (category, count) => {
  const prefixMap = {
    men: 'MN', women: 'WM', fragrances: 'FR', backpacks: 'BP',
    new: 'NW', popular: 'PP', sale: 'SL', featured: 'FT'
  };
  const prefix = prefixMap[category] || 'GN';
  const seq = String(count).padStart(4, '0');
  const random = String(Math.floor(Math.random() * 100)).padStart(2, '0');
  return `${prefix}-${seq}-${random}`;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Category.deleteMany({});
    await Banner.deleteMany({});
    await Brand.deleteMany({});

    // Create admin user (pre-save hook will hash the password)
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@roseo.com',
      password: 'admin123',
      role: 'admin',
      isActive: true,
    });
    console.log('Admin user created:', admin.email);

    // Create some customers (pre-save hook will hash the password)
    const customers = await User.create([
      { name: 'John Doe', email: 'john@example.com', password: 'customer123', role: 'customer' },
      { name: 'Jane Smith', email: 'jane@example.com', password: 'customer123', role: 'customer' },
      { name: 'Mike Johnson', email: 'mike@example.com', password: 'customer123', role: 'customer' },
    ]);
    console.log(`${customers.length} customers created`);

    // Create categories
    const categories = await Category.create([
      { name: "Men's Collection", slug: 'men', description: 'Premium leather goods for men', icon: 'briefcase', sortOrder: 1 },
      { name: "Women's Collection", slug: 'women', description: 'Elegant leather goods for women', icon: 'shopping-bag', sortOrder: 2 },
      { name: 'Fragrances', slug: 'fragrances', description: 'Luxury fragrances for every occasion', icon: 'droplets', sortOrder: 3 },
      { name: 'Backpacks', slug: 'backpacks', description: 'Functional and stylish backpacks', icon: 'backpack', sortOrder: 4 },
      { name: 'New Arrivals', slug: 'new', description: 'Latest additions to our collection', icon: 'sparkles', sortOrder: 5 },
      { name: 'Popular', slug: 'popular', description: 'Customer favorites and bestsellers', icon: 'flame', sortOrder: 6 },
      { name: 'On Sale', slug: 'sale', description: 'Special offers and discounted items', icon: 'percent', sortOrder: 7 },
      { name: 'Featured', slug: 'featured', description: 'Handpicked premium selections', icon: 'star', sortOrder: 8 },
    ]);
    console.log(`${categories.length} categories created`);

    // Create products with SKU auto-generation
    const categoryCounters = {};
    const productsData = [
      {
        name: 'Hobo Small Leather Bag',
        slug: 'hobo-small-leather-bag',
        description: 'Compact yet spacious hobo bag with adjustable strap and multiple compartments. Perfect for everyday use with a touch of elegance.',
        shortDescription: 'Compact hobo bag with adjustable strap',
        price: 150,
        originalPrice: 199,
        category: 'men',
        subcategory: 'Wallets',
        material: 'Full-Grain Leather',
        rating: 4.8,
        reviewCount: 24,
        stock: 8,
        colorCount: 4,
        colors: [{ name: 'Black', hex: '#171717' }, { name: 'Brown', hex: '#8B4513' }, { name: 'Tan', hex: '#D2B48C' }, { name: 'Burgundy', hex: '#800020' }],
        fastShipping: true,
        featured: true,
        isActive: true,
        tags: ['hobo', 'small', 'leather', 'adjustable'],
      },
      {
        name: 'Classic Tote Bag',
        slug: 'classic-tote-bag',
        description: 'Timeless tote design perfect for work and weekend adventures. Spacious interior with organized compartments for all your essentials.',
        shortDescription: 'Timeless tote for work and weekend',
        price: 220,
        originalPrice: 280,
        category: 'women',
        subcategory: 'Handbags',
        material: 'Vegetable-Tanned Leather',
        rating: 4.9,
        reviewCount: 56,
        stock: 15,
        colorCount: 3,
        colors: [{ name: 'Natural', hex: '#C4A882' }, { name: 'Black', hex: '#171717' }, { name: 'Cognac', hex: '#9A4E1C' }],
        fastShipping: true,
        featured: true,
        isActive: true,
        tags: ['tote', 'classic', 'work', 'weekend'],
      },
      {
        name: 'Crossbody Leather Bag',
        slug: 'crossbody-leather-bag',
        description: 'Hands-free crossbody with RFID protection and organized interior. Secure and stylish for the modern professional.',
        shortDescription: 'RFID-protected crossbody bag',
        price: 180,
        category: 'fragrances',
        subcategory: "Men's",
        material: 'Saffiano Leather',
        rating: 4.7,
        reviewCount: 18,
        stock: 5,
        colorCount: 5,
        colors: [{ name: 'Black', hex: '#171717' }, { name: 'Navy', hex: '#1B2A4A' }, { name: 'Red', hex: '#DC2626' }, { name: 'Tan', hex: '#D2B48C' }, { name: 'Olive', hex: '#556B2F' }],
        fastShipping: false,
        featured: false,
        isActive: true,
        tags: ['crossbody', 'rfid', 'professional'],
      },
      {
        name: 'Vintage Satchel',
        slug: 'vintage-satchel',
        description: 'Vintage-inspired satchel with brass hardware and distressed finish. A timeless piece that gets better with age.',
        shortDescription: 'Vintage satchel with brass hardware',
        price: 275,
        category: 'backpacks',
        subcategory: 'Laptop',
        material: 'Aged Leather',
        rating: 4.6,
        reviewCount: 32,
        stock: 3,
        colorCount: 2,
        colors: [{ name: 'Antique Brown', hex: '#6B3A2A' }, { name: 'Distressed Tan', hex: '#B8860B' }],
        fastShipping: true,
        featured: true,
        isActive: true,
        tags: ['vintage', 'satchel', 'brass', 'distressed'],
      },
      {
        name: 'Mini Backpack',
        slug: 'mini-backpack',
        description: 'Modern mini backpack with laptop sleeve and water-resistant lining. Perfect for urban adventures.',
        shortDescription: 'Mini backpack with laptop sleeve',
        price: 195,
        originalPrice: 240,
        category: 'men',
        subcategory: 'Belts',
        material: 'Nubuck Leather',
        rating: 4.8,
        reviewCount: 41,
        stock: 12,
        colorCount: 6,
        colors: [{ name: 'Black', hex: '#171717' }, { name: 'Grey', hex: '#6B7280' }, { name: 'Burgundy', hex: '#800020' }, { name: 'Forest', hex: '#228B22' }, { name: 'Navy', hex: '#1B2A4A' }, { name: 'Camel', hex: '#C19A6B' }],
        fastShipping: true,
        featured: false,
        isActive: true,
        tags: ['backpack', 'mini', 'laptop', 'water-resistant'],
      },
      {
        name: 'Executive Briefcase',
        slug: 'executive-briefcase',
        description: 'Professional briefcase with combination lock and document organizer. Make a statement in the boardroom.',
        shortDescription: 'Professional briefcase with lock',
        price: 320,
        category: 'women',
        subcategory: 'Clutches',
        material: 'Italian Leather',
        rating: 4.9,
        reviewCount: 67,
        stock: 7,
        colorCount: 3,
        colors: [{ name: 'Black', hex: '#171717' }, { name: 'Dark Brown', hex: '#3E2723' }, { name: 'Burgundy', hex: '#800020' }],
        fastShipping: true,
        featured: true,
        isActive: true,
        tags: ['briefcase', 'executive', 'professional', 'lock'],
      },
      {
        name: 'Weekender Duffel',
        slug: 'weekender-duffel',
        description: 'Spacious weekender duffel with shoe compartment and toiletry pocket. Your perfect travel companion.',
        shortDescription: 'Weekender duffel with shoe compartment',
        price: 280,
        originalPrice: 350,
        category: 'backpacks',
        subcategory: 'Travel',
        material: 'Waxed Canvas & Leather',
        rating: 4.7,
        reviewCount: 29,
        stock: 10,
        colorCount: 4,
        colors: [{ name: 'Olive', hex: '#556B2F' }, { name: 'Navy', hex: '#1B2A4A' }, { name: 'Tan', hex: '#D2B48C' }, { name: 'Charcoal', hex: '#36454F' }],
        fastShipping: true,
        featured: false,
        isActive: true,
        tags: ['duffel', 'weekender', 'travel', 'shoe-compartment'],
      },
      {
        name: 'Clutch with Chain',
        slug: 'clutch-with-chain',
        description: 'Convertible clutch with detachable chain for evening or day use. Elegant versatility at its finest.',
        shortDescription: 'Convertible clutch with chain strap',
        price: 120,
        category: 'fragrances',
        subcategory: "Women's",
        material: 'Croc-Embossed Leather',
        rating: 4.5,
        reviewCount: 15,
        stock: 20,
        colorCount: 8,
        colors: [{ name: 'Black', hex: '#171717' }, { name: 'Red', hex: '#DC2626' }, { name: 'Gold', hex: '#FFD700' }, { name: 'Silver', hex: '#C0C0C0' }, { name: 'Nude', hex: '#E3BC9A' }, { name: 'Navy', hex: '#1B2A4A' }, { name: 'Emerald', hex: '#046307' }, { name: 'Blush', hex: '#FFB6C1' }],
        fastShipping: false,
        featured: false,
        isActive: true,
        tags: ['clutch', 'chain', 'evening', 'convertible'],
      },
      {
        name: 'Bucket Bag',
        slug: 'bucket-bag',
        description: 'Trendy bucket bag with drawstring closure and interior pockets. A must-have for the fashion-forward.',
        shortDescription: 'Trendy bucket bag with drawstring',
        price: 210,
        category: 'popular',
        subcategory: '',
        material: 'Suede & Leather',
        rating: 4.8,
        reviewCount: 38,
        stock: 6,
        colorCount: 3,
        colors: [{ name: 'Camel', hex: '#C19A6B' }, { name: 'Black', hex: '#171717' }, { name: 'Chestnut', hex: '#954535' }],
        fastShipping: true,
        featured: false,
        isActive: true,
        tags: ['bucket', 'drawstring', 'suede', 'trendy'],
      },
      {
        name: 'Messenger Bag',
        slug: 'messenger-bag',
        description: 'Classic messenger bag with adjustable strap and quick-access pocket. Built for the urban commuter.',
        shortDescription: 'Classic messenger with quick-access pocket',
        price: 190,
        originalPrice: 230,
        category: 'sale',
        subcategory: '',
        material: 'Waxed Leather',
        rating: 4.6,
        reviewCount: 22,
        stock: 9,
        colorCount: 4,
        colors: [{ name: 'Brown', hex: '#8B4513' }, { name: 'Black', hex: '#171717' }, { name: 'Olive', hex: '#556B2F' }, { name: 'Tan', hex: '#D2B48C' }],
        fastShipping: true,
        featured: false,
        isActive: true,
        tags: ['messenger', 'commuter', 'adjustable', 'waxed'],
      },
      {
        name: 'Laptop Sleeve Bag',
        slug: 'laptop-sleeve-bag',
        description: 'Slim laptop sleeve with extra storage for accessories and documents. Professional protection for your tech.',
        shortDescription: 'Slim laptop sleeve with accessory storage',
        price: 145,
        category: 'new',
        subcategory: '',
        material: 'Neoprene & Leather',
        rating: 4.7,
        reviewCount: 19,
        stock: 14,
        colorCount: 5,
        colors: [{ name: 'Black', hex: '#171717' }, { name: 'Grey', hex: '#6B7280' }, { name: 'Navy', hex: '#1B2A4A' }, { name: 'Burgundy', hex: '#800020' }, { name: 'Forest', hex: '#228B22' }],
        fastShipping: true,
        featured: false,
        isActive: true,
        tags: ['laptop', 'sleeve', 'tech', 'professional'],
      },
      {
        name: 'Travel Backpack',
        slug: 'travel-backpack',
        description: 'Expandable travel backpack with USB port and hidden compartments. Adventure-ready with anti-theft features.',
        shortDescription: 'Expandable travel backpack with USB port',
        price: 295,
        originalPrice: 370,
        category: 'featured',
        subcategory: '',
        material: 'Waterproof Leather',
        rating: 4.9,
        reviewCount: 73,
        stock: 4,
        colorCount: 3,
        colors: [{ name: 'Black', hex: '#171717' }, { name: 'Charcoal', hex: '#36454F' }, { name: 'Navy', hex: '#1B2A4A' }],
        fastShipping: true,
        featured: true,
        isActive: true,
        tags: ['travel', 'backpack', 'usb', 'anti-theft', 'waterproof'],
      },
    ];

    // Assign SKUs based on category
    const productsWithSKU = productsData.map(p => {
      const cat = p.category;
      categoryCounters[cat] = (categoryCounters[cat] || 0) + 1;
      return {
        ...p,
        sku: generateSKU(cat, categoryCounters[cat]),
      };
    });

    const products = await Product.create(productsWithSKU);
    console.log(`${products.length} products created`);

    // Create sample orders
    const orders = await Order.create([
      {
        orderNumber: 'ROSEO-000001',
        user: customers[0]._id,
        items: [
          { product: products[0]._id, name: products[0].name, price: 150, quantity: 1, image: '' },
          { product: products[5]._id, name: products[5].name, price: 320, quantity: 1, image: '' },
        ],
        shippingAddress: { firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '+1234567890', address: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', country: 'US' },
        subtotal: 470,
        shippingCost: 0,
        tax: 37.6,
        total: 507.6,
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'card',
      },
      {
        orderNumber: 'ROSEO-000002',
        user: customers[1]._id,
        items: [
          { product: products[1]._id, name: products[1].name, price: 220, quantity: 2, image: '' },
        ],
        shippingAddress: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '+1234567891', address: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zipCode: '90001', country: 'US' },
        subtotal: 440,
        shippingCost: 0,
        tax: 35.2,
        total: 475.2,
        status: 'shipped',
        paymentStatus: 'paid',
        paymentMethod: 'paypal',
        trackingNumber: 'TRK-123456',
      },
      {
        orderNumber: 'ROSEO-000003',
        user: customers[2]._id,
        items: [
          { product: products[6]._id, name: products[6].name, price: 280, quantity: 1, image: '' },
          { product: products[9]._id, name: products[9].name, price: 190, quantity: 1, image: '' },
        ],
        shippingAddress: { firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com', phone: '+1234567892', address: '789 Pine Rd', city: 'Chicago', state: 'IL', zipCode: '60601', country: 'US' },
        subtotal: 470,
        shippingCost: 0,
        tax: 37.6,
        total: 507.6,
        status: 'processing',
        paymentStatus: 'paid',
        paymentMethod: 'card',
      },
      {
        orderNumber: 'ROSEO-000004',
        items: [
          { product: products[11]._id, name: products[11].name, price: 295, quantity: 1, image: '' },
        ],
        shippingAddress: { firstName: 'Sarah', lastName: 'Wilson', email: 'sarah@example.com', phone: '+1234567893', address: '321 Elm St', city: 'Miami', state: 'FL', zipCode: '33101', country: 'US' },
        subtotal: 295,
        shippingCost: 0,
        tax: 23.6,
        total: 318.6,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'card',
      },
      {
        orderNumber: 'ROSEO-000005',
        user: customers[0]._id,
        items: [
          { product: products[3]._id, name: products[3].name, price: 275, quantity: 1, image: '' },
          { product: products[7]._id, name: products[7].name, price: 120, quantity: 2, image: '' },
        ],
        shippingAddress: { firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '+1234567890', address: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', country: 'US' },
        subtotal: 515,
        shippingCost: 0,
        tax: 41.2,
        total: 556.2,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'bank_transfer',
      },
    ]);
    console.log(`${orders.length} orders created`);

    // Create banners
    const banners = await Banner.create([
      {
        title: 'New Collection 2024',
        subtitle: 'Crafted for Timeless Elegance',
        description: 'Discover our premium leather bag collection where craftsmanship meets contemporary design.',
        image: '/uploads/banner-hero.jpg',
        link: '/collections/new',
        buttonText: 'Shop Now',
        position: 'hero',
        isActive: true,
        sortOrder: 1,
      },
      {
        title: 'Summer Sale',
        subtitle: 'Up to 30% Off',
        description: 'Special offers on selected items. Limited time only.',
        image: '/uploads/banner-sale.jpg',
        link: '/collections/sale',
        buttonText: 'View Sale',
        position: 'sidebar',
        isActive: true,
        sortOrder: 2,
      },
    ]);
    console.log(`${banners.length} banners created`);

    // Create brands
    const brands = await Brand.create([
      { name: 'Gucci', slug: 'gucci', description: 'Italian luxury fashion house known for craftsmanship and innovation', website: 'https://www.gucci.com', isActive: true, sortOrder: 1 },
      { name: 'Prada', slug: 'prada', description: 'Premium Italian luxury brand specializing in leather goods', website: 'https://www.prada.com', isActive: true, sortOrder: 2 },
      { name: 'Louis Vuitton', slug: 'louis-vuitton', description: 'French luxury house renowned for iconic monogram leather goods', website: 'https://www.louisvuitton.com', isActive: true, sortOrder: 3 },
      { name: 'Chanel', slug: 'chanel', description: 'Timeless French luxury brand synonymous with elegance', website: 'https://www.chanel.com', isActive: true, sortOrder: 4 },
      { name: 'Hermès', slug: 'hermes', description: 'French luxury manufacturer of exceptional leather goods', website: 'https://www.hermes.com', isActive: true, sortOrder: 5 },
      { name: 'Burberry', slug: 'burberry', description: 'British luxury brand known for iconic check pattern and craftsmanship', website: 'https://www.burberry.com', isActive: true, sortOrder: 6 },
      { name: 'Fendi', slug: 'fendi', description: 'Italian luxury fashion house famous for leather goods and fur', website: 'https://www.fendi.com', isActive: true, sortOrder: 7 },
      { name: 'Dior', slug: 'dior', description: 'French luxury brand combining elegance with modern sophistication', website: 'https://www.dior.com', isActive: true, sortOrder: 8 },
    ]);
    console.log(`${brands.length} brands created`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📧 Admin credentials:');
    console.log('   Email: admin@roseo.com');
    console.log('   Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
