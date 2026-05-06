require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('./models/Product');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/engineers_ecommerce';

const productsData = [
  {
    name: 'Classic Formal Shirt',
    brandName: 'Engineers',
    price: 1299,
    credits: '12.99',
    discountedPrice: 1299,
    offer: '10% off on first purchase',
    category: 'Clothing',
    subCategory: 'Formal Shirts',
    stockQuantity: 50,
    sku: 'FS-001',
    hsnCode: '62063000',
    fitType: 'Slim Fit',
    type: 'Formal',
    colors: 'White, Blue, Black',
    sizes: 'S, M, L, XL',
    material: '100% Cotton',
    pattern: 'Solid',
    neckType: 'Collar',
    sleeveType: 'Full Sleeve',
    occasion: 'Office, Business Meetings',
    length: 'Regular',
    closureType: 'Button',
    stretchability: 'Low',
    shortDescription: 'A classic formal shirt perfect for office wear and business meetings.',
    fullDescription: 'This premium formal shirt is crafted from high-quality cotton fabric, ensuring comfort throughout day. The slim fit design offers a modern silhouette while maintaining professional appearance.',
    keyFeatures: 'Premium cotton fabric, Slim fit design, Comfortable collar, Wrinkle-resistant, Breathable material',
    washMethod: 'Machine wash cold',
    ironingDetails: 'Iron on medium heat',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=400&h=500&fit=crop'
    ],
    videoLink: '',
    instagramLink: '',
    packageDimensions: '30x20x5 cm',
    weight: '300g',
    deliveryAvailability: 'Pan India',
    codOption: true,
    sellerAddress: 'Engineers Fashion, 123 Fashion Street, Mumbai, Maharashtra, 400001',
    returnPolicy: '7 days return policy. Product must be unused with all tags intact.',
    manufacturerDetails: 'Engineers Fashion Pvt. Ltd., 123 Fashion Street, Mumbai, Maharashtra, 400001',
    countryOfOrigin: 'India'
  },
  {
    name: 'Casual Denim Jeans',
    brandName: 'Engineers',
    price: 1999,
    credits: '19.99',
    discountedPrice: 1999,
    offer: 'Buy 2 get 1 free',
    category: 'Clothing',
    subCategory: 'Jeans',
    stockQuantity: 40,
    sku: 'DJ-002',
    hsnCode: '62034200',
    fitType: 'Regular Fit',
    type: 'Casual',
    colors: 'Blue, Black, Grey',
    sizes: '28, 30, 32, 34, 36',
    material: '98% Cotton, 2% Elastane',
    pattern: 'Solid',
    neckType: 'N/A',
    sleeveType: 'N/A',
    occasion: 'Casual, Everyday Wear',
    length: 'Regular',
    closureType: 'Button, Zipper',
    stretchability: 'Medium',
    shortDescription: 'Comfortable denim jeans for everyday wear.',
    fullDescription: 'These comfortable denim jeans are designed for everyday wear with a perfect blend of style and comfort.',
    keyFeatures: 'Premium denim fabric, Regular fit, Comfortable waistband, Durable stitching, Fade-resistant color',
    washMethod: 'Machine wash cold',
    ironingDetails: 'Iron on low heat',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1516252635089-856262a5a6b4?w=400&h=500&fit=crop'
    ],
    videoLink: '',
    packageDimensions: '35x25x8 cm',
    weight: '500g',
    deliveryAvailability: 'Pan India',
    codOption: true,
    sellerAddress: 'Engineers Fashion, 123 Fashion Street, Mumbai, Maharashtra, 400001',
    returnPolicy: '7 days return policy. Product must be unused with all tags intact.',
    manufacturerDetails: 'Engineers Fashion Pvt. Ltd., 123 Fashion Street, Mumbai, Maharashtra, 400001',
    countryOfOrigin: 'India'
  },
  {
    name: 'Elegant Evening Dress',
    brandName: 'Engineers',
    price: 2999,
    credits: '29.99',
    discountedPrice: 2999,
    offer: '15% off on first purchase',
    category: 'Clothing',
    subCategory: 'Dresses',
    stockQuantity: 30,
    sku: 'ED-003',
    hsnCode: '62044300',
    fitType: 'Body Fit',
    type: 'Party Wear',
    colors: 'Red, Black, Navy',
    sizes: 'XS, S, M, L',
    material: 'Polyester Blend',
    pattern: 'Solid',
    neckType: 'V-Neck',
    sleeveType: 'Sleeveless',
    occasion: 'Party, Evening Events',
    length: 'Knee Length',
    closureType: 'Zipper',
    stretchability: 'Low',
    shortDescription: 'Stunning evening dress for special occasions.',
    fullDescription: 'This stunning evening dress is designed to make you stand out at any special occasion.',
    keyFeatures: 'Elegant design, Premium fabric, Body fit silhouette, Comfortable to wear, Easy to maintain',
    washMethod: 'Dry clean only',
    ironingDetails: 'Iron on low heat',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1574342397350-337b2831e6e2?w=400&h=500&fit=crop'
    ],
    videoLink: '',
    packageDimensions: '30x25x5 cm',
    weight: '400g',
    deliveryAvailability: 'Pan India',
    codOption: true,
    returnPolicy: '7 days return policy. Product must be unused with all tags intact.',
    manufacturerDetails: 'Engineers Fashion Pvt. Ltd., 123 Fashion Street, Mumbai, Maharashtra, 400001',
    countryOfOrigin: 'India'
  },
  {
    name: 'Sporty Track Pants',
    brandName: 'Engineers',
    price: 999,
    credits: '9.99',
    discountedPrice: 999,
    offer: '20% off on sports collection',
    category: 'Clothing',
    subCategory: 'Sports Wear',
    stockQuantity: 60,
    sku: 'SP-004',
    hsnCode: '62034200',
    fitType: 'Regular Fit',
    type: 'Sports',
    colors: 'Black, Grey, Navy',
    sizes: 'S, M, L, XL, XXL',
    material: 'Polyester',
    pattern: 'Solid',
    neckType: 'N/A',
    sleeveType: 'N/A',
    occasion: 'Sports, Casual Wear',
    length: 'Regular',
    closureType: 'Elastic Waistband',
    stretchability: 'High',
    shortDescription: 'Comfortable track pants for workouts and casual wear.',
    fullDescription: 'These comfortable track pants are perfect for workouts and casual wear.',
    keyFeatures: 'Lightweight fabric, Quick-drying, Elastic waistband, Side pockets, Comfortable fit',
    washMethod: 'Machine wash cold',
    ironingDetails: 'Iron on low heat',
    images: [
      'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop'
    ],
    videoLink: '',
    packageDimensions: '30x20x5 cm',
    weight: '350g',
    deliveryAvailability: 'Pan India',
    codOption: true,
    returnPolicy: '7 days return policy. Product must be unused with all tags intact.',
    manufacturerDetails: 'Engineers Fashion Pvt. Ltd., 123 Fashion Street, Mumbai, Maharashtra, 400001',
    countryOfOrigin: 'India'
  },
  {
    name: 'Classic Leather Jacket',
    brandName: 'Engineers',
    price: 4999,
    credits: '49.99',
    discountedPrice: 4999,
    offer: 'Limited time offer',
    category: 'Clothing',
    subCategory: 'Jackets',
    stockQuantity: 20,
    sku: 'LJ-005',
    hsnCode: '62033300',
    fitType: 'Regular Fit',
    type: 'Casual',
    colors: 'Black, Brown',
    sizes: 'S, M, L, XL',
    material: 'Genuine Leather',
    pattern: 'Solid',
    neckType: 'Collar',
    sleeveType: 'Full Sleeve',
    occasion: 'Casual, Party',
    length: 'Regular',
    closureType: 'Zipper',
    stretchability: 'Low',
    shortDescription: 'Premium leather jacket for a stylish look.',
    fullDescription: 'This premium leather jacket is crafted from genuine leather, offering both style and durability.',
    keyFeatures: 'Genuine leather, Premium quality, Stylish design, Comfortable fit, Durable',
    washMethod: 'Professional clean only',
    ironingDetails: 'Professional clean only',
    images: [
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1574342397350-337b2831e6e2?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=500&fit=crop'
    ],
    videoLink: '',
    packageDimensions: '40x30x10 cm',
    weight: '800g',
    deliveryAvailability: 'Pan India',
    codOption: true,
    returnPolicy: '7 days return policy. Product must be unused with all tags intact.',
    manufacturerDetails: 'Engineers Fashion Pvt. Ltd., 123 Fashion Street, Mumbai, Maharashtra, 400001',
    countryOfOrigin: 'India'
  },
  {
    name: 'Summer Floral Dress',
    brandName: 'Engineers',
    price: 1799,
    credits: '17.99',
    discountedPrice: 1799,
    offer: 'Buy 2 get 10% off',
    category: 'Clothing',
    subCategory: 'Dresses',
    stockQuantity: 45,
    sku: 'FD-006',
    hsnCode: '62044300',
    fitType: 'A-line',
    type: 'Casual',
    colors: 'Floral, Yellow, Pink',
    sizes: 'XS, S, M, L, XL',
    material: 'Cotton Blend',
    pattern: 'Floral',
    neckType: 'Round Neck',
    sleeveType: 'Short Sleeve',
    occasion: 'Casual, Summer Wear',
    length: 'Knee Length',
    closureType: 'Button',
    stretchability: 'Medium',
    shortDescription: 'Light and comfortable floral dress for summer.',
    fullDescription: 'This light and comfortable floral dress is perfect for summer.',
    keyFeatures: 'Lightweight fabric, Floral pattern, A-line design, Comfortable fit, Easy to maintain',
    washMethod: 'Machine wash cold',
    ironingDetails: 'Iron on medium heat',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1572804013427-37d909342567?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1578681920702-a10c3186346c?w=400&h=500&fit=crop'
    ],
    videoLink: '',
    packageDimensions: '30x25x5 cm',
    weight: '350g',
    deliveryAvailability: 'Pan India',
    codOption: true,
    returnPolicy: '7 days return policy. Product must be unused with all tags intact.',
    manufacturerDetails: 'Engineers Fashion Pvt. Ltd., 123 Fashion Street, Mumbai, Maharashtra, 400001',
    countryOfOrigin: 'India'
  },
  {
    name: 'Designer Handbag',
    brandName: 'Engineers',
    price: 2499,
    credits: '24.99',
    discountedPrice: 2499,
    offer: '15% off on first purchase',
    category: 'Accessories',
    subCategory: 'Handbags',
    stockQuantity: 25,
    sku: 'HB-007',
    hsnCode: '42022100',
    fitType: 'One Size',
    type: 'Accessories',
    colors: 'Black, Brown, Tan',
    sizes: 'One Size',
    material: 'Genuine Leather',
    pattern: 'Solid',
    neckType: 'N/A',
    sleeveType: 'N/A',
    occasion: 'Formal, Casual',
    length: 'N/A',
    closureType: 'Zipper',
    stretchability: 'N/A',
    shortDescription: 'Elegant designer handbag for special occasions.',
    fullDescription: 'This elegant designer handbag is crafted from genuine leather, offering both style and durability.',
    keyFeatures: 'Genuine leather, Spacious interior, Multiple compartments, Stylish design, Durable',
    washMethod: 'Professional clean only',
    ironingDetails: 'N/A',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1584917865442-8a5f06e68d7a?w=400&h=500&fit=crop'
    ],
    videoLink: '',
    packageDimensions: '30x20x15 cm',
    weight: '600g',
    deliveryAvailability: 'Pan India',
    codOption: true,
    returnPolicy: '7 days return policy. Product must be unused with all tags intact.',
    manufacturerDetails: 'Engineers Fashion Pvt. Ltd., 123 Fashion Street, Mumbai, Maharashtra, 400001',
    countryOfOrigin: 'India'
  },
  {
    name: 'Luxury Watch',
    brandName: 'Engineers',
    price: 5999,
    credits: '59.99',
    discountedPrice: 5999,
    offer: 'Limited time offer',
    category: 'Accessories',
    subCategory: 'Watches',
    stockQuantity: 15,
    sku: 'LW-008',
    hsnCode: '91021100',
    fitType: 'One Size',
    type: 'Accessories',
    colors: 'Silver, Gold, Rose Gold',
    sizes: 'One Size',
    material: 'Stainless Steel, Leather',
    pattern: 'Solid',
    neckType: 'N/A',
    sleeveType: 'N/A',
    occasion: 'Formal, Casual',
    length: 'N/A',
    closureType: 'Buckle',
    stretchability: 'N/A',
    shortDescription: 'Premium luxury watch with leather strap.',
    fullDescription: 'This premium luxury watch features a stainless steel case with a genuine leather strap.',
    keyFeatures: 'Premium quality, Precise movement, Water resistant, Elegant design, Comfortable leather strap',
    washMethod: 'Wipe with damp cloth',
    ironingDetails: 'N/A',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1542496658-e33a6d0d5046?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop'
    ],
    videoLink: '',
    packageDimensions: '15x10x8 cm',
    weight: '200g',
    deliveryAvailability: 'Pan India',
    codOption: true,
    returnPolicy: '7 days return policy. Product must be unused with all tags intact.',
    manufacturerDetails: 'Engineers Fashion Pvt. Ltd., 123 Fashion Street, Mumbai, Maharashtra, 400001',
    countryOfOrigin: 'India'
  }
];

const foundersData = [
  {
    userId: 'FOUND001',
    name: 'Founder Alpha',
    email: 'founder1@engineers.com',
    password: 'founder123',
    contact: '9999999001',
    userType: 'founder',
    level: 0,
    leftChildId: 'FOUND002',
    rightChildId: 'FOUND003',
    directReferrals: ['FOUND002', 'FOUND003'],
  },
  {
    userId: 'FOUND002',
    name: 'Founder Beta',
    email: 'founder2@engineers.com',
    password: 'founder123',
    contact: '9999999002',
    userType: 'founder',
    level: 1,
    directParentId: 'FOUND001',
  },
  {
    userId: 'FOUND003',
    name: 'Founder Gamma',
    email: 'founder3@engineers.com',
    password: 'founder123',
    contact: '9999999003',
    userType: 'founder',
    level: 1,
    directParentId: 'FOUND001',
  },
];

// Static admin user — NOT part of the MLM tree
const adminData = {
  userId: 'ADMIN001',
  name: 'System Admin',
  email: 'admin@engineers.com',
  password: 'admin123',
  contact: '9999999000',
  userType: 'admin',
  level: 0,
};

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Seed products
    await Product.insertMany(productsData);
    console.log(`✅ Seeded ${productsData.length} products`);

    // Seed founders
    for (const founder of foundersData) {
      const hashedPassword = await bcrypt.hash(founder.password, 12);
      await User.create({
        ...founder,
        password: hashedPassword,
      });
    }
    console.log(`✅ Seeded ${foundersData.length} founders`);

    // Seed static admin user (not part of MLM tree)
    const adminHashedPassword = await bcrypt.hash(adminData.password, 12);
    await User.create({
      ...adminData,
      password: adminHashedPassword,
    });
    console.log('✅ Seeded 1 admin user');

    console.log('\n🎉 Seed complete!');
    console.log('Founder credentials:');
    console.log('  FOUND001 / founder123');
    console.log('  FOUND002 / founder123');
    console.log('  FOUND003 / founder123');
    console.log('Admin credentials:');
    console.log('  ADMIN001 / admin123');
    console.log('  admin@engineers.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
