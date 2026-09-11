"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const Category_1 = require("../models/Category");
const apiResponse_1 = require("../utils/apiResponse");
const auth_1 = require('../middleware/auth');
const router = (0, express_1.Router)();
const categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    slug: zod_1.z.string().min(2),
    description: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
    order: zod_1.z.number().optional(),
});
router.get('/', async (_req, res) => {
    try {
        const categories = await Category_1.Category.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
        return (0, apiResponse_1.sendSuccess)(res, 'Categories fetched successfully', categories);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Unable to fetch categories', 400, error);
    }
});
router.post('/', auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    try {
        const data = categorySchema.parse(req.body);
        const category = await Category_1.Category.create(data);
        return (0, apiResponse_1.sendSuccess)(res, 'Category created successfully', category, 201);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Unable to create category', 400, error);
    }
});
router.put('/:id', auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    try {
        const data = categorySchema.partial().parse(req.body);
        const category = await Category_1.Category.findByIdAndUpdate(req.params.id, data, { new: true });
        if (!category) {
            return (0, apiResponse_1.sendError)(res, 'Category not found', 404);
        }
        return (0, apiResponse_1.sendSuccess)(res, 'Category updated successfully', category);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Unable to update category', 400, error);
    }
});
router.delete('/:id', auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    try {
        const category = await Category_1.Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return (0, apiResponse_1.sendError)(res, 'Category not found', 404);
        }
        return (0, apiResponse_1.sendSuccess)(res, 'Category deleted successfully');
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Unable to delete category', 400, error);
    }
});
exports.default = router;

