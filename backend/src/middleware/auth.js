"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireAuth = void 0;
const jwt_1 = require("../utils/jwt");
const User_1 = require("../models/User");
const apiResponse_1 = require("../utils/apiResponse");
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || '';
        const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        const token = tokenFromHeader || (req.cookies && req.cookies.token) || null;
        if (!token) {
            return (0, apiResponse_1.sendError)(res, 'Authentication required', 401);
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await User_1.User.findById(decoded.id).select('-password');
        if (!user || !user.isActive) {
            return (0, apiResponse_1.sendError)(res, 'User account is not active', 401);
        }
        req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        next();
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Invalid or expired token', 401, error);
    }
};
exports.requireAuth = requireAuth;
const requireAdmin = async (req, res, next) => {
    if (!req.user) {
        return (0, apiResponse_1.sendError)(res, 'Authentication required', 401);
    }
    if (!['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(req.user.role)) {
        return (0, apiResponse_1.sendError)(res, 'Admin access required', 403);
    }
    next();
};
exports.requireAdmin = requireAdmin;
