"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Category_1 = require("../models/Category");
const Product_1 = require("../models/Product");
const db_1 = require("../config/db");
const categories = [
    { name: 'Snacks & Namkeen', slug: 'snacks-namkeen', order: 1, description: 'Crunchy savory bites' },
    { name: 'Pickles', slug: 'pickles', order: 2, description: 'Traditional handmade pickles' },
    { name: 'Sweets', slug: 'sweets', order: 3, description: 'Festive and everyday sweets' },
    { name: 'Beverages', slug: 'beverages', order: 4, description: 'Refreshing and healthy drinks' },
    { name: 'Spices', slug: 'spices', order: 5, description: 'Freshly ground spice blends' },
    { name: 'Instant Food', slug: 'instant-food', order: 6, description: 'Quick meal solutions' },
];
const products = [
    { name: 'Maharaja Mixture', slug: 'maharaja-mixture', description: 'Crispy mix with peanuts, sev, and chana.', shortDescription: 'Classic crunchy namkeen', category: 'snacks-namkeen', price: 179, compareAtPrice: 220, stock: 35, tags: ['snack', 'namkeen'], isFeatured: true, isBestSeller: true, rating: 4.8 },
    { name: 'Mango Pickle', slug: 'mango-pickle', description: 'Slow-cured mango pickle with authentic spices.', shortDescription: 'Traditional homemade taste', category: 'pickles', price: 149, compareAtPrice: 180, stock: 42, tags: ['pickle', 'traditional'], isFeatured: true, rating: 4.7 },
    { name: 'Motichoor Laddu', slug: 'motichoor-laddu', description: 'Soft saffron-laced laddus made for festive gifting.', shortDescription: 'Festive favorite sweet', category: 'sweets', price: 399, compareAtPrice: 520, stock: 18, tags: ['sweet', 'festival'], isBestSeller: true, rating: 4.9 },
    { name: 'Rose Lemon Cooler', slug: 'rose-lemon-cooler', description: 'Refreshing summer-ready fruit beverage concentrate.', shortDescription: 'Refreshing ready-to-mix drink', category: 'beverages', price: 129, compareAtPrice: 160, stock: 27, tags: ['drink', 'beverage'], isNewArrival: true, rating: 4.5 },
    { name: 'Garam Masala', slug: 'garam-masala', description: 'Premium house blend of fresh roasted spices.', shortDescription: 'Signature Indian spice mix', category: 'spices', price: 169, compareAtPrice: 215, stock: 40, tags: ['spice', 'masala'], isFeatured: true, rating: 4.8 },
    { name: 'Jowar Chakli', slug: 'jowar-chakli', description: 'Crunchy jowar chakli made without refined flour.', shortDescription: 'Healthy snack option', category: 'snacks-namkeen', price: 210, compareAtPrice: 260, stock: 22, tags: ['healthy', 'snack'], isBestSeller: true, rating: 4.7 },
    { name: 'Amla Pickle', slug: 'amla-pickle', description: 'Tangy and rich in flavor with whole amla and spices.', shortDescription: 'Vitamin-rich pickle', category: 'pickles', price: 175, compareAtPrice: 220, stock: 24, tags: ['pickle', 'amla'], rating: 4.6 },
    { name: 'Kesar Peda', slug: 'kesar-peda', description: 'Rich milk peda with saffron and cardamom.', shortDescription: 'Silky milk sweet', category: 'sweets', price: 299, compareAtPrice: 340, stock: 20, tags: ['sweet', 'milk'], isFeatured: true, rating: 4.9 },
    { name: 'Masala Chai', slug: 'masala-chai', description: 'Authentic Indian chai with ginger and whole spices.', shortDescription: 'Warm comforting tea', category: 'beverages', price: 110, compareAtPrice: 150, stock: 48, tags: ['tea', 'chai'], isBestSeller: true, rating: 4.8 },
    { name: 'Poha Upma', slug: 'poha-upma', description: 'Quick and tasty instant breakfast poha with spice blend.', shortDescription: 'Ready in minutes', category: 'instant-food', price: 99, compareAtPrice: 125, stock: 60, tags: ['instant', 'breakfast'], isNewArrival: true, rating: 4.4 },
];
(async () => {
    try {
        await (0, db_1.connectDatabase)();
        await Category_1.Category.deleteMany({});
        await Product_1.Product.deleteMany({});
        const createdCategories = await Category_1.Category.insertMany(categories);
        const categoryMap = new Map(createdCategories.map((category) => [category.slug, category._id]));
        const mappedProducts = products.map((product) => ({
            ...product,
            category: categoryMap.get(product.category),
            images: [`https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80`],
            stock: product.stock ?? 10,
            isActive: true,
            numReviews: 0,
            rating: product.rating ?? 4.5,
            discount: product.compareAtPrice ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 0,
        }));
        await Product_1.Product.insertMany(mappedProducts);
        console.log('Seed catalog created successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('Seed catalog failed:', error);
        process.exit(1);
    }
})();
