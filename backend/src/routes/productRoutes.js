"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
const Category_1 = require("../models/Category");
const Product_1 = require("../models/Product");
const apiResponse_1 = require("../utils/apiResponse");
const auth_1 = require('../middleware/auth');
const router = (0, express_1.Router)();
const productQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    sort: zod_1.z.string().optional(),
    minPrice: zod_1.z.coerce.number().optional(),
    maxPrice: zod_1.z.coerce.number().optional(),
    featured: zod_1.z.coerce.boolean().optional(),
    bestSeller: zod_1.z.coerce.boolean().optional(),
    limit: zod_1.z.coerce.number().optional(),
    page: zod_1.z.coerce.number().optional(),
});
router.get('/', async (req, res) => {
    try {
        const query = productQuerySchema.parse(req.query);
        const page = Number(query.page || 1);
        const limit = Number(query.limit || 12);
        const skip = (page - 1) * limit;
        const filter = { isActive: true };
        if (query.category) {
            const categoryFilter = mongoose_1.isObjectIdOrHexString(query.category)
                ? { $or: [{ _id: query.category }, { slug: query.category }] }
                : { slug: query.category };
            const category = await Category.findOne(categoryFilter).select('_id');
            if (!category) {
                return (0, apiResponse_1.sendSuccess)(res, 'Products fetched successfully', {
                    products: [],
                    pagination: { page, limit, total: 0, totalPages: 0 },
                });
            }
            filter.category = category._id;
        }
        if (query.featured)
            filter.isFeatured = true;
        if (query.bestSeller)
            filter.isBestSeller = true;
        if (query.minPrice !== undefined || query.maxPrice !== undefined) {
            filter.price = {};
            if (query.minPrice !== undefined)
                filter.price.$gte = query.minPrice;
            if (query.maxPrice !== undefined)
                filter.price.$lte = query.maxPrice;
        }
        const sortMap = {
            newest: { createdAt: -1 },
            'price-asc': { price: 1 },
            'price-desc': { price: -1 },
            popular: { rating: -1 },
            'rating-desc': { rating: -1 },
        };
        const aliases = { chakli: ['chakli', 'chakali'], chakali: ['chakli', 'chakali'], thalipeeth: ['thalipeeth', 'thalipith'], thalipith: ['thalipeeth', 'thalipith'] };
        const searchTerms = aliases[query.search?.trim().toLowerCase()] || [query.search];
        const searchFilter = query.search
            ? {
                $or: [
                    { name: { $in: searchTerms.map((term) => new RegExp(term, 'i')) } },
                    { description: { $in: searchTerms.map((term) => new RegExp(term, 'i')) } },
                    { tags: { $in: searchTerms.map((term) => new RegExp(term, 'i')) } },
                    { brand: { $in: searchTerms.map((term) => new RegExp(term, 'i')) } },
                ],
            }
            : {};
        const products = await Product_1.Product.find({ ...filter, ...searchFilter })
            .populate('category')
            .sort(sortMap[query.sort || 'newest'] || { createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await Product_1.Product.countDocuments({ ...filter, ...searchFilter });
        return (0, apiResponse_1.sendSuccess)(res, 'Products fetched successfully', {
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Unable to fetch products', 400, error);
    }
});
router.get('/:id', async (req, res) => {
    try {
        const product = await Product_1.Product.findOne({ _id: req.params.id, isActive: true, price: { $gt: 0 } }).populate('category').lean();
        if (!product) {
            return (0, apiResponse_1.sendError)(res, 'Product not found', 404);
        }
        return (0, apiResponse_1.sendSuccess)(res, 'Product fetched successfully', product);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Unable to fetch product', 400, error);
    }
});
router.post('/', auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    try {
        const payload = zod_1.z.object({
            name: zod_1.z.string().min(2),
            slug: zod_1.z.string().min(2),
            description: zod_1.z.string().min(10),
            shortDescription: zod_1.z.string().min(10),
            category: zod_1.z.string(),
            price: zod_1.z.coerce.number().positive(),
            compareAtPrice: zod_1.z.coerce.number().positive().optional(),
            stock: zod_1.z.coerce.number().min(0).optional(),
            images: zod_1.z.array(zod_1.z.string()).optional(),
            tags: zod_1.z.array(zod_1.z.string()).optional(),
            isFeatured: zod_1.z.boolean().optional(),
            isBestSeller: zod_1.z.boolean().optional(),
            isNewArrival: zod_1.z.boolean().optional(),
            allergens: zod_1.z.array(zod_1.z.string()).optional(),
            shelfLife: zod_1.z.string().optional(),
            storage: zod_1.z.string().optional(),
            countryOfOrigin: zod_1.z.string().optional(),
            vegetarian: zod_1.z.boolean().optional(),
        }).parse(req.body);
        const categoryExists = await Category_1.Category.findById(payload.category);
        if (!categoryExists) {
            return (0, apiResponse_1.sendError)(res, 'Category not found', 404);
        }
        const product = await Product_1.Product.create({
            ...payload,
            stock: payload.stock ?? 0,
            discount: payload.compareAtPrice ? Math.max(0, ((payload.compareAtPrice - payload.price) / payload.compareAtPrice) * 100) : 0,
            isActive: true,
            rating: 0,
            numReviews: 0,
        });
        return (0, apiResponse_1.sendSuccess)(res, 'Product created successfully', product, 201);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Unable to create product', 400, error);
    }
});
router.put('/:id', auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    try {
        const payload = zod_1.z.object({
            name: zod_1.z.string().min(2).optional(), slug: zod_1.z.string().min(2).optional(),
            description: zod_1.z.string().min(10).optional(), shortDescription: zod_1.z.string().min(10).optional(),
            category: zod_1.z.string().optional(), price: zod_1.z.coerce.number().positive().optional(),
            compareAtPrice: zod_1.z.coerce.number().positive().optional(), stock: zod_1.z.coerce.number().min(0).optional(),
            images: zod_1.z.array(zod_1.z.string()).optional(), tags: zod_1.z.array(zod_1.z.string()).optional(),
            isFeatured: zod_1.z.boolean().optional(), isBestSeller: zod_1.z.boolean().optional(), isNewArrival: zod_1.z.boolean().optional(),
            isActive: zod_1.z.boolean().optional(), allergens: zod_1.z.array(zod_1.z.string()).optional(), shelfLife: zod_1.z.string().optional(),
            storage: zod_1.z.string().optional(), countryOfOrigin: zod_1.z.string().optional(), vegetarian: zod_1.z.boolean().optional(),
        }).strict().parse(req.body);
        if (payload.category && !await Category_1.Category.exists({ _id: payload.category })) return (0, apiResponse_1.sendError)(res, 'Category not found', 404);
        if (payload.price || payload.compareAtPrice) {
            const current = await Product_1.Product.findById(req.params.id).select('price compareAtPrice');
            if (!current) return (0, apiResponse_1.sendError)(res, 'Product not found', 404);
            const price = payload.price ?? current.price;
            const compareAtPrice = payload.compareAtPrice ?? current.compareAtPrice;
            payload.discount = compareAtPrice ? Math.max(0, ((compareAtPrice - price) / compareAtPrice) * 100) : 0;
        }
        const product = await Product_1.Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
        if (!product) {
            return (0, apiResponse_1.sendError)(res, 'Product not found', 404);
        }
        return (0, apiResponse_1.sendSuccess)(res, 'Product updated successfully', product);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Unable to update product', 400, error);
    }
});
router.delete('/:id', auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    try {
        const product = await Product_1.Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return (0, apiResponse_1.sendError)(res, 'Product not found', 404);
        }
        return (0, apiResponse_1.sendSuccess)(res, 'Product deleted successfully');
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Unable to delete product', 400, error);
    }
});
exports.default = router;

