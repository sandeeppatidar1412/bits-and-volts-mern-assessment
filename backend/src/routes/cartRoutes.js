"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const Cart_1 = require("../models/Cart");
const Product_1 = require("../models/Product");
const auth_1 = require("../middleware/auth");
const apiResponse_1 = require("../utils/apiResponse");
const router = (0, express_1.Router)();
const recalculateCart = async (cart) => {
    const productIds = cart.items.map((item) => item.product);
    const products = await Product_1.Product.find({ _id: { $in: productIds }, isActive: true, price: { $gt: 0 } }).lean();
    const byId = new Map(products.map((product) => [product._id.toString(), product]));
    cart.items = cart.items.filter((item) => {
        const product = byId.get(item.product.toString());
        if (!product || product.stock < 1)
            return false;
        item.name = product.name;
        item.image = product.images?.[0] || product.featuredImage;
        item.price = product.price;
        if (item.quantity > product.stock)
            item.quantity = product.stock;
        return true;
    });
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cart.shipping = cart.subtotal === 0 || cart.subtotal >= 999 ? 0 : 49;
    cart.tax = Number((cart.subtotal * 0.05).toFixed(2));
    cart.total = cart.subtotal + cart.shipping + cart.tax - (cart.couponDiscount || 0);
    return cart;
};
const cartItemSchema = zod_1.z.object({
    productId: zod_1.z.string(),
    quantity: zod_1.z.number().min(1).default(1),
});
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const cart = await Cart_1.Cart.findOne({ user: req.user?.id });
        if (cart) await recalculateCart(cart);
        return (0, apiResponse_1.sendSuccess)(res, 'Cart fetched successfully', cart || { items: [], subtotal: 0, shipping: 0, tax: 0, total: 0 });
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Unable to fetch cart', 400, error);
    }
});
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { productId, quantity } = cartItemSchema.parse(req.body);
        const product = await Product_1.Product.findOne({ _id: productId, isActive: true, price: { $gt: 0 } });
        if (!product) {
            return (0, apiResponse_1.sendError)(res, 'Product not found', 404);
        }
        if (product.stock < quantity) {
            return (0, apiResponse_1.sendError)(res, 'Not enough stock available', 400);
        }
        let cart = await Cart_1.Cart.findOne({ user: req.user?.id });
        if (!cart) {
            cart = new Cart_1.Cart({ user: req.user?.id, items: [] });
        }
        const existingItem = cart.items.find((item) => item.product.toString() === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
            if (product.stock < existingItem.quantity) {
                return (0, apiResponse_1.sendError)(res, 'Quantity exceeds available stock', 400);
            }
        }
        else {
            cart.items.push({
                product: product._id,
                name: product.name,
                image: product.images?.[0],
                price: product.price,
                quantity,
            });
        }
        await recalculateCart(cart);
        await cart.save();
        return (0, apiResponse_1.sendSuccess)(res, 'Product added to cart', cart, 201);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Unable to add product to cart', 400, error);
    }
});
router.put('/:productId', auth_1.requireAuth, async (req, res) => {
    try {
        const { quantity } = zod_1.z.object({ quantity: zod_1.z.number().min(1) }).parse(req.body);
        const cart = await Cart_1.Cart.findOne({ user: req.user?.id });
        if (!cart) {
            return (0, apiResponse_1.sendError)(res, 'Cart not found', 404);
        }
        const item = cart.items.find((cartItem) => cartItem.product.toString() === req.params.productId);
        if (!item) {
            return (0, apiResponse_1.sendError)(res, 'Cart item not found', 404);
        }
        const product = await Product_1.Product.findOne({ _id: req.params.productId, isActive: true, price: { $gt: 0 } });
        if (!product) {
            return (0, apiResponse_1.sendError)(res, 'Product not found', 404);
        }
        if (product.stock < quantity) {
            return (0, apiResponse_1.sendError)(res, 'Not enough stock available', 400);
        }
        item.quantity = quantity;
        await recalculateCart(cart);
        await cart.save();
        return (0, apiResponse_1.sendSuccess)(res, 'Cart updated successfully', cart);
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Unable to update cart', 400, error);
    }
});
router.delete('/:productId', auth_1.requireAuth, async (req, res) => {
    try {
        const cart = await Cart_1.Cart.findOne({ user: req.user?.id });
        if (!cart) {
            return (0, apiResponse_1.sendError)(res, 'Cart not found', 404);
        }
        cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
        await recalculateCart(cart);
        await cart.save();
        return (0, apiResponse_1.sendSuccess)(res, 'Item removed from cart');
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Unable to remove cart item', 400, error);
    }
});
router.delete('/', auth_1.requireAuth, async (req, res) => {
    try {
        await Cart_1.Cart.findOneAndDelete({ user: req.user?.id });
        return (0, apiResponse_1.sendSuccess)(res, 'Cart cleared successfully');
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Unable to clear cart', 400, error);
    }
});
exports.default = router;
