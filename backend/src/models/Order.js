"use strict";
const mongoose = require("mongoose");
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true }, image: String, price: { type: Number, required: true }, quantity: { type: Number, required: true, min: 1 },
}, { _id: false });
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  address: { fullName: String, phone: String, address: String, city: String, state: String, pincode: String, country: { type: String, default: "India" } },
  subtotal: Number, shipping: Number, tax: Number, total: Number,
  paymentStatus: { type: String, enum: ["PENDING", "PAID", "FAILED"], default: "PENDING" },
  status: { type: String, enum: ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"], default: "PLACED" },
}, { timestamps: true });
module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);