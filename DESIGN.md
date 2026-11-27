---
name: ShopHub
description: A market-aisle storefront and a restrained shadcn admin, both built mobile first.
colors:
  brand: oklch(0.52 0.23 277)
  brand-deep: oklch(0.36 0.17 278)
  brand-soft: oklch(0.96 0.025 275)
  coral: oklch(0.72 0.19 33)
  coral-soft: oklch(0.965 0.035 35)
  mint: oklch(0.86 0.15 166)
  mint-soft: oklch(0.96 0.04 166)
  surface: oklch(0.985 0.005 260)
  surface-alt: oklch(0.955 0.012 265)
  ink: oklch(0.23 0.035 268)
  ink-muted: oklch(0.49 0.025 268)
  line: oklch(0.9 0.013 265)
  success: oklch(0.58 0.14 155)
  warning: oklch(0.75 0.14 75)
  error: oklch(0.58 0.21 22)
  background: oklch(1 0 0)
  foreground: oklch(0.145 0 0)
  primary: oklch(0.205 0 0)
  primary-foreground: oklch(0.985 0 0)
  card: oklch(1 0 0)
  border: oklch(0.922 0 0)
typography:
  display:
    fontFamily: "Bricolage Grotesque, Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 800
    lineHeight: "0.98"
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    lineHeight: "1.6"
rounded:
  sm: "calc(var(--radius) - 4px)"
  md: "calc(var(--radius) - 2px)"
  lg: "var(--radius)"
components:
  storefront-primary-button:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
    rounded: "12px"
    padding: "12px 24px"
  storefront-deep-panel:
    backgroundColor: "{colors.brand-deep}"
    textColor: "{colors.surface}"
    rounded: "24px"
  admin-primary-button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
---

## Overview

ShopHub has two visual families in one Laravel/React app: a saturated **storefront market-aisle world** and a restrained **shadcn admin world**. Both are mobile first: clean, neat, readable on the smallest phone, and scaled up deliberately rather than squeezed down from desktop.

## Colors

**Storefront.** Every file under `resources/js/pages/storefront` and every new component under `resources/js/components/storefront` must use the storefront-only palette defined in `resources/css/app.css`: `brand`, `brand-deep`, `brand-soft`, `coral`, `coral-soft`, `mint`, `mint-soft`, `surface`, `surface-alt`, `ink`, `ink-muted`, `line`, `star`, `success`, `warning`, and `error`. Keep work inside the `.storefront` scope so its focus rings, selection, caret, and scrollbars stay on-world.

**Admin.** Every file under `resources/js/pages/admin` uses the default shadcn tokens from `resources/css/app.css` (`background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, the chart tokens, and the sidebar tokens). Do not borrow storefront palette tokens into admin screens.

## Typography

Both families use `Instrument Sans` for body and `Bricolage Grotesque` for display. Storefront headings are heavy, tight, and balanced, with scale from `Heading`. Admin typography follows the shadcn defaults. Keep body copy conversational and short enough to scan on a phone.

## Layout

Build the phone layout first at 320px and up: single column, no horizontal scroll, comfortable tap targets, and text that wraps cleanly. Add `sm`, `md`, and `lg` composition only where the content earns it. The storefront `Container` is `max-w-[90rem]` with `px-4 sm:px-6 lg:px-8`; keep that rhythm. On both storefront and admin, verify every breakpoint the change affects, especially 320, 375, 430, and 768px.

## Elevation & Depth

Storefront depth uses soft, offset shadows tinted from the palette, never hard offset blocks. Admin depth follows shadcn elevation. Prefer tonal layering with `surface`, `surface-alt`, and `brand-soft` before adding a shadow.

## Shapes

Storefront surfaces favor `rounded-xl`, `rounded-2xl`, and `rounded-3xl` with `border-line`; pills are `rounded-full`. Admin components use the shadcn radius scale (`--radius`, `--radius-md`, `--radius-sm`).

## Components

- Storefront: reuse components from `resources/js/components/storefront` first. If a needed component is not there, create it there — never in `resources/js/components/ui`.
- Storefront: do **not** use shadcn/ui components unless the user explicitly asks. If asked, style that specific component with storefront CSS properties and tokens.
- Admin: shadcn/ui components from `resources/js/components/ui` are the expected building blocks.
- If an admin design needs a shadcn/ui component that is not installed, ask the user to install it first. Do not install it yourself.
- Never edit the core shadcn/ui component code in `resources/js/components/ui`.

## Do's and Don'ts

- Do design mobile first, clean and neat, for every storefront and admin surface.
- Do use storefront tokens in storefront pages and shadcn tokens in admin pages.
- Do keep controls visible with clear focus states and enough room for thumbs.
- Don't mix the two token systems or introduce unrequested shadcn/ui primitives into storefront.
- Don't assume a desktop composition will survive at 375px; check the render.
