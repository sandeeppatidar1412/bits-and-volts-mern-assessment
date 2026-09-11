"use strict";
const { Router } = require("express");
const { z } = require("zod");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const router = Router();
const schema = z.object({ pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode") });
const blocked = new Set((process.env.UNSERVICEABLE_PINCODES || "").split(",").map((value) => value.trim()).filter(Boolean));
router.get("/check", (req, res) => {
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) return sendError(res, parsed.error.issues[0]?.message || "Enter a valid pincode", 400);
  const { pincode } = parsed.data;
  if (blocked.has(pincode)) return sendSuccess(res, "Delivery is not available for this pincode", { serviceable: false, pincode, message: "We do not deliver to this pincode yet. Try another address or contact support." });
  const metro = ["411", "400", "401", "402", "403"].includes(pincode.slice(0, 3));
  return sendSuccess(res, "Delivery available", { serviceable: true, pincode, eta: metro ? "2-4 business days" : "4-7 business days", shipping: metro ? 49 : 79, message: "Delivery is available to this pincode." });
});
module.exports = router;