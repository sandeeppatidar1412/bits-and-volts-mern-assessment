"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const apiResponse_1 = require("../utils/apiResponse");
const router = (0, express_1.Router)();
const profileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    phone: zod_1.z.string().optional(),
    avatar: zod_1.z.string().optional(),
});
const passwordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(6),
    newPassword: zod_1.z.string().min(6),
});
router.get('/profile', auth_1.requireAuth, async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user?.id).select('-password');
        if (!user) {
            return (0, apiResponse_1.sendError)(res, 'User not found', 404);
        }
        return (0, apiResponse_1.sendSuccess)(res, 'Profile fetched successfully', user);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Unable to fetch profile', 500, error);
    }
});
router.put('/profile', auth_1.requireAuth, async (req, res) => {
    try {
        const data = profileSchema.parse(req.body);
        const user = await User_1.User.findById(req.user?.id);
        if (!user) {
            return (0, apiResponse_1.sendError)(res, 'User not found', 404);
        }
        Object.assign(user, data);
        await user.save();
        return (0, apiResponse_1.sendSuccess)(res, 'Profile updated successfully', user);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Unable to update profile', 400, error);
    }
});
router.put('/password', auth_1.requireAuth, async (req, res) => {
    try {
        const data = passwordSchema.parse(req.body);
        const user = await User_1.User.findById(req.user?.id).select('+password');
        if (!user || !user.password) {
            return (0, apiResponse_1.sendError)(res, 'User not found', 404);
        }
        const isValid = await user.comparePassword(data.currentPassword);
        if (!isValid) {
            return (0, apiResponse_1.sendError)(res, 'Current password is incorrect', 401);
        }
        user.password = data.newPassword;
        await user.save();
        return (0, apiResponse_1.sendSuccess)(res, 'Password updated successfully');
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Unable to update password', 400, error);
    }
});
router.get('/orders', auth_1.requireAuth, async (_req, res) => {
    return (0, apiResponse_1.sendSuccess)(res, 'Orders fetched successfully', []);
});
router.get('/wishlist', auth_1.requireAuth, async (_req, res) => {
    return (0, apiResponse_1.sendSuccess)(res, 'Wishlist fetched successfully', []);
});
exports.default = router;
