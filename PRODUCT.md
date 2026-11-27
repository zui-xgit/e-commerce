# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are local Tanzanian shoppers, in and around Dar es Salaam, who come to browse a locally managed catalogue and buy everyday goods. A second confirmed audience is the store admin who manages products, categories, banners and site-wide settings. Customer accounts are a confirmed part of the shopping flow.

## Product Purpose

ShopHub is an e-commerce storefront: a single place to discover products, add them to a cart, check out, and later review orders and saved addresses. Success means a shopper can find what they need and complete a purchase without friction, and an admin can keep the catalogue and store information current.

## Positioning

One local, admin-managed catalogue with honest prices and support you can reach. ShopHub's claim is local availability and human support, not a global marketplace or a novelty gimmick.

## Operating Context

The storefront runs as a Laravel web app under a local `*.test` domain during development. Shopping happens through product listing and detail pages, a cart, and a checkout restricted to users with the customer role. The admin area manages products, categories, banners and site settings. Policies (privacy, refund, shipping, terms), about, contact and FAQ pages are part of the storefront. Store identity, contact details, timezone, display currency, SEO metadata, social links and maintenance mode are all editable in the site-settings screen.

## Capabilities and Constraints

- Storefront: home, catalogue browsing and search, product detail, cart, checkout, customer account (orders and addresses).
- Admin: product/category/banner CRUD and site settings; access controlled by the `admin` role. Roles `admin` and `customer` are implemented; Google OAuth is implemented.
- The product catalogue is seeded test data (194 products across 24 categories) used for testing; do not present it as real inventory or invent products, reviews or testimonials.
- Display currency is a saved site setting read on the client via `useSiteSettings().currency`; the default is `TZS`, with `KES`, `UGX` and `USD` available as options. Prices must follow the setting rather than a hardcoded currency. Current on-screen copy that says "Prices in USD" is stale relative to the setting and is not product truth.
- The brand name is ShopHub. Some current footer copy mentions "Laptop City, established 2012 in Dar es Salaam"; the user confirmed the brand name is ShopHub, so do not promote that copy into a brand claim without asking.
- No deployment target, launch date, pricing strategy, or accessibility standard has been confirmed.

## Brand Commitments

Name: ShopHub. No other name, voice guide, logo, or visual asset has been confirmed as binding.

## Evidence on Hand

- Seeded catalogue and banners in `database/seeders/` for testing only.
- Site-setting definitions in `config/site-settings.php` (Store identity, Contact details, Locale & currency, Search & sharing, Social links, Maintenance).
- Implemented routes in `routes/web.php` and `routes/admin.php`.
- Live local storefront at `http://e-commerce.test/`.

## Product Principles

- Serve local shoppers first: local defaults for currency and time zone, and a catalogue that reflects what the store actually carries.
- Keep catalogue and price claims honest: no invented stock, reviews, or success stories.
- Keep the store reachable: clear contact details, policies, and support paths.
- Make the purchase loop simple: discover, cart, checkout, then account — with admin tooling that keeps the catalogue current.

## Open Decisions

- Whether the seeded catalogue will be replaced by real inventory before launch.
- Whether any store-specific accessibility requirement or compliance standard applies.
