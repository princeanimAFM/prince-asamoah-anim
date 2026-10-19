# KACE COLLECTIONS

Online store for Ghanaian designer fashion, delivering to the UK and Ghana. Built and maintained by RMR Dev Works.

## Status

Stage 1 (this): the shop front with **sample products**. Includes the homepage, Women, Men, New in, Sale,
product pages, bag, FAQ, About and Contact. Prices can be shown in £ or ₵. The site shows a preview banner
and checkout is switched off while `SITE.preview` is `true` in `src/lib/site.ts`.

Next stages:

1. Checkout with Stripe (cards, Apple Pay, Google Pay; charged in £) and order emails.
2. Customer accounts, reviews from verified buyers, back-in-stock alerts and item requests.
3. Admin for products, photos, stock, orders and reviews, with the price calculator built in.
4. Mobile money (Paystack) for customers in Ghana.

## Before opening the shop

- Fill in the owner's name, UK address, email and WhatsApp in `src/lib/site.ts` (required by law).
- Confirm delivery prices and the returns policy, then update the FAQ items marked "to confirm".
- Add a privacy notice and terms of sale (before collecting any customer details).

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm test
npm run typecheck
npx next build
```

Settings are in `.env.example`. On Netlify, create a site from this repo with the base directory set to
`kace-collections`.

Fonts (Archivo, Hanken Grotesk) are SIL Open Font Licence and served from `public/fonts`.

Product photos in `public/products` belong to the designer Kwadwo Man and are used with his permission for
selling his pieces on this site; they are credited on each product page. Location and camera data are
removed before adding a photo. Products without a photo show a drawn illustration. Never add photos
from other brands, influencers or AI generators as product photos.
