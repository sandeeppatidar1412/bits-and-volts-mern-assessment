"use strict";
const { Router } = require("express");
const { z } = require("zod");
const axios = require("axios");
const { env } = require("../config/env");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const router = Router();
router.post("/", async (req, res) => { try { const { message } = z.object({ message: z.string().trim().min(1).max(1000) }).parse(req.body); if (!env.geminiApiKey) return sendError(res, "Chat service is not configured yet.", 503); const prompt = "You are the helpful Naik Foods shopping assistant for an Indian food e-commerce site. Help with product discovery, general shopping, delivery and site navigation. Do not claim you can see accounts, place orders, change orders, or access live stock. Keep answers concise.\n\nCustomer: " + message; const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent`, { contents: [{ parts: [{ text: prompt }] }] }, { headers: { "x-goog-api-key": env.geminiApiKey }, timeout: 30000 }); const reply = response.data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join("").trim(); if (!reply) return sendError(res, "The assistant could not generate a reply. Please try again.", 502); return sendSuccess(res, "Chat response generated", { reply }); } catch (error) { if (error instanceof z.ZodError) return sendError(res, "Please enter a question of up to 1000 characters.", 400); return sendError(res, "The assistant is unavailable right now. Please try again.", 502); } });
module.exports = router;