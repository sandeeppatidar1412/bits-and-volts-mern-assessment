"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const Wishlist_1 = require("../models/Wishlist");
const auth_1 = require("../middleware/auth");
const apiResponse_1 = require("../utils/apiResponse");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const items = await Wishlist_1.Wishlist.find({ user: req.user?.id }).populate('product');
        return (0, apiResponse_1.sendSuccess)(res, 'Wishlist fetched successfully', items);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Unable to fetch wishlist', 400, error);
    }
});
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { productId } = zod_1.z.object({ productId: zod_1.z.string() }).parse(req.body);
        const existing = await Wishlist_1.Wishlist.findOne({ user: req.user?.id, product: productId });
        if (existing) {
            return (0, apiResponse_1.sendError)(res, 'Item already in wishlist', 409);
        }
        const item = await Wishlist_1.Wishlist.create({ user: req.user?.id, product: productId });
        return (0, apiResponse_1.sendSuccess)(res, 'Item added to wishlist', item, 201);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Unable to add item to wishlist', 400, error);
    }
});
router.delete('/:productId', auth_1.requireAuth, async (req, res) => {
    try {
        await Wishlist_1.Wishlist.deleteOne({ user: req.user?.id, product: req.params.productId });
        return (0, apiResponse_1.sendSuccess)(res, 'Item removed from wishlist');
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Unable to remove wishlist item', 400, error);
    }
});
exports.default = router;
