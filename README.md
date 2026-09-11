# Naik Foods Clone — Food E-Commerce Monorepo

This project is organized as a monorepo with a Next.js frontend and an Express + MongoDB backend.

## Structure

- `frontend/` – Next.js storefront and admin frontend
- `backend/` – Express API server, models, controllers, services, and MongoDB logic
- `.env.example` – root environment template

## Phase 1 status

- Frontend Next.js app bootstrapped
- Backend structure prepared
- MongoDB and env templates configured
- Shared monorepo conventions established

## Audit implementation plan

### Module 1: Catalogue integrity
- Keep inactive and zero-price products out of public detail, wishlist, cart, and checkout.
- Validate admin product updates and maintain positive prices and meaningful product facts.
- Add vegetarian status, allergens, shelf life, storage, country of origin, and pack metadata.

### Module 2: Cart and delivery confidence
- Recalculate cart prices, stock, shipping, tax, and total from current product data.
- Return explicit delivery serviceability, ETA, shipping charge, and retryable error messages.
- Use the advertised INR 999 free-delivery threshold consistently.

### Module 3: Checkout and orders
- Validate address and pincode on the server.
- Create orders from a fresh cart snapshot and clear the cart only after a valid order is created.
- Keep payment state explicit so Razorpay sandbox work can be added without trusting client totals.

### Module 4: Account and admin safety
- Prevent staff/admin role escalation and restrict destructive user management to super admins.
- Never expose password reset fields or credential defaults in API responses/configuration.
- Finish password reset email/token UX before enabling acquisition campaigns.

### Module 5: Storefront UX and mobile
- Keep search visible above products on mobile and preserve query/filter state.
- Remove overflow and prompt overlap at 360, 390, and 430 px; keep support controls away from checkout inputs.
- Add useful empty, error, loading, and success states for cart, wishlist, delivery, and orders.

### Module 6: Facts, SEO, measurement, and accessibility
- Publish verified ingredients, allergens, storage, net weight, maker, reviews, and accurate business details.
- Standardize canonical host, route-aware noindex, concise metadata, Product/Breadcrumb schema, and Merchant Center data.
- Remove undefined analytics configuration and verify commerce events with INR values and deduplication.
- Restore zoom, label icon buttons, announce one button state, and test keyboard/modal/contrast behavior.

### Current delivery status

Implemented: catalogue price/activity enforcement, validated product updates, server-authoritative cart recalculation, delivery API, wishlist product validation, admin role boundaries, profile sanitization, insecure credential fallback removal, checkout address flow, server-authoritative order creation, responsive shop search with URL persistence/reset, product facts and delivery feedback, spelling aliases, product metadata, and zoom-safe viewport settings.

Next validation: run the app against MongoDB, seed representative products with non-zero prices and product facts, then exercise pincode, cart price-change, stock-change, checkout success/failure, and duplicate payment scenarios. Payment gateway integration, review verification, SEO host redirects, analytics events, and mobile visual regression remain follow-up modules.

## Planned phases

1. Project architecture + frontend + backend + MongoDB connection
2. Authentication + Google login + user profile
3. Products + categories + search + filtering
4. Cart + wishlist
5. Checkout + addresses + coupons
6. Razorpay test payment
7. Orders + tracking + cancellation + refunds
8. Admin dashboard
9. Analytics + inventory + reviews + notifications
10. Chatbot + FAQ
11. SEO + performance + security
12. Testing + production cleanup + README

## Getting started

See each app's README or package scripts for local development commands.
