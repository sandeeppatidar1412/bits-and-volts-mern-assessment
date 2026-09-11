"use strict";
const { Router } = require("express");
const { z } = require("zod");
const { Cart } = require("../models/Cart");
const { Product } = require("../models/Product");
const Order = require("../models/Order");
const { requireAuth } = require("../middleware/auth");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const router = Router();
const addressSchema = z.object({ fullName: z.string().min(2), phone: z.string().min(10), address: z.string().min(5), city: z.string().min(2), state: z.string().min(2), pincode: z.string().regex(/^\d{6}$/), country: z.string().default("India") });
router.get("/", requireAuth, async (req, res) => { try { return sendSuccess(res, "Orders fetched successfully", await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).lean()); } catch { return sendError(res, "Unable to fetch orders", 500); } });
router.post("/", requireAuth, async (req, res) => {
  try {
    const address = addressSchema.parse(req.body.address);
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart || !cart.items.length) return sendError(res, "Your cart is empty", 400);
    const products = await Product.find({ _id: { $in: cart.items.map((item) => item.product) }, isActive: true, price: { $gt: 0 } }).lean();
    const byId = new Map(products.map((product) => [product._id.toString(), product]));
    const items = cart.items.map((item) => { const product = byId.get(item.product.toString()); return product && product.stock >= item.quantity ? { product: product._id, name: product.name, image: product.images?.[0], price: product.price, quantity: item.quantity } : null; }).filter(Boolean);
    if (items.length !== cart.items.length) return sendError(res, "Some items changed or are no longer available. Refresh your cart.", 409);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 999 ? 0 : 49;
    const tax = Number((subtotal * 0.05).toFixed(2));
    const order = await Order.create({ user: req.user.id, items, address, subtotal, shipping, tax, total: subtotal + shipping + tax });
    await Cart.findOneAndDelete({ user: req.user.id });
    return sendSuccess(res, "Order placed successfully", order, 201);
  } catch (error) { return sendError(res, error?.issues?.[0]?.message || "Unable to place order", 400); }
});
module.exports = router;