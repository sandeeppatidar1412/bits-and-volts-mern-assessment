"use strict";
const { connectDatabase } = require("../config/db");
const { User } = require("../models/User");
const { Category } = require("../models/Category");
const { Product } = require("../models/Product");
const { env } = require("../config/env");
const categories = [
  ["Snacks & Namkeen", "snacks-namkeen"], ["Pickles", "pickles"], ["Sweets", "sweets"], ["Beverages", "beverages"], ["Spices", "spices"], ["Instant Food", "instant-food"]
];
const products = [
  ["Maharaja Mixture", "maharaja-mixture", "snacks-namkeen", 179, 35], ["Mango Pickle", "mango-pickle", "pickles", 149, 42], ["Motichoor Laddu", "motichoor-laddu", "sweets", 399, 18], ["Rose Lemon Cooler", "rose-lemon-cooler", "beverages", 129, 27], ["Garam Masala", "garam-masala", "spices", 169, 40], ["Jowar Chakli", "jowar-chakli", "snacks-namkeen", 210, 22], ["Amla Pickle", "amla-pickle", "pickles", 175, 24], ["Kesar Peda", "kesar-peda", "sweets", 299, 20], ["Masala Chai", "masala-chai", "beverages", 110, 48], ["Poha Upma", "poha-upma", "instant-food", 99, 60]
];
(async () => { try {
  await connectDatabase();
  for (const [name, slug] of categories) await Category.updateOne({ slug }, { $setOnInsert: { name, slug, description: `${name} from Naik Foods`, isActive: true } }, { upsert: true });
  const categoryRows = await Category.find(); const categoryMap = new Map(categoryRows.map((category) => [category.slug, category._id]));
  for (const [name, slug, categorySlug, price, stock] of products) await Product.updateOne({ slug }, { $setOnInsert: { name, slug, category: categoryMap.get(categorySlug), description: `${name} is a quality Naik Foods product for everyday shopping.`, shortDescription: `Fresh ${name}`, images: [], price, compareAtPrice: Math.round(price * 1.15), stock, rating: 4.5, isActive: true, isFeatured: true, discount: 15 } }, { upsert: true });
  await User.updateOne({ email: env.adminEmail }, { $setOnInsert: { name: "System Admin", email: env.adminEmail, password: env.adminPassword, role: "SUPER_ADMIN", isActive: true } }, { upsert: true });
  await User.updateOne({ email: "demo@naikfoods.test" }, { $setOnInsert: { name: "Demo Customer", email: "demo@naikfoods.test", password: "demo123", role: "USER", isActive: true } }, { upsert: true });
  console.log(`Seed complete. Admin: ${env.adminEmail}; demo user: demo@naikfoods.test / demo123`); process.exit(0);
} catch (error) { console.error("Seed failed:", error); process.exit(1); } })();