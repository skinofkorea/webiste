# Mii Korean — Skincare Storefront

Miikorean storefront conversion of the existing React/Vercel commerce app. The customer-facing catalog, collections, content pages, delivery policies, and Renude skin-analysis experience are based on [miikorean.com](https://www.miikorean.com/). Cart and order records remain in this application; checkout is configured for GBP.

---

## 🏛️ System Architecture

The project is structured as a streamlined full-stack application optimized for serverless edge deployment on **Vercel**:

```
├── api/                       # Vercel Serverless Function Endpoints
│   ├── data/                  # Local fallback and checkout catalog data
│   │   ├── miikorean-storefront.json
│   │   └── store_banners.json
│   └── index.js               # Unified Serverless REST API router
│
├── client/                    # Frontend React 18 + TypeScript Application
│   ├── public/                # Static assets and imported Miikorean catalog
│   ├── src/
│   │   ├── assets/            # Local images, logos, and vector assets
│   │   ├── components/        # Reusable UI components (Navbar, Footer, Cart, Checkout)
│   │   ├── constants/         # Category definitions, navigation links
│   │   ├── pages/             # Page views & Admin CMS Dashboard
│   │   ├── redux/             # Redux Toolkit state slices & RTK Query APIs
│   │   ├── types/             # TypeScript interfaces & domain models
│   │   ├── utils/             # Cloudinary helpers, analytics, service worker utils
│   │   ├── App.tsx            # Main application router & route boundaries
│   │   └── main.tsx           # Application entry point
│   ├── index.html             # HTML5 template with SEO meta tags & preconnects
│   ├── vite.config.ts         # Vite build configuration with chunk splitting
│   └── tsconfig.json          # TypeScript strict configuration
│
├── .env.example               # Root environment variable template
├── package.json               # Monorepo root scripts & backend dependencies
├── schema.sql                 # Canonical PostgreSQL schema & RLS policies
└── vercel.json                # Vercel routing, rewrites & deployment spec
```

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Type-safe, component-driven user interface |
| **Bundler** | [Vite](https://vitejs.dev/) | Lightning-fast HMR and optimized production bundling |
| **State Management** | [Redux Toolkit](https://redux-toolkit.js.org/) | Global cart, user session, and modal state management |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Utility-first responsive design tokens |
| **Backend API** | Node.js Serverless Functions | Serverless Express-compatible handler (`/api/*`) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) | Managed relational database with Row Level Security |
| **Media CDN** | [Cloudinary](https://cloudinary.com/) | Auto-formatting, image optimization & unsigned uploads |
| **Payments** | [Razorpay](https://razorpay.com/) | UPI, Cards, NetBanking, and Wallets gateway integration |
| **Hosting** | [Vercel](https://vercel.com/) | Edge network CDN hosting with zero-config serverless support |

---

## 🚀 Key Features

### 🛒 Customer Storefront
- **Imported catalog**: All 445 published products, variants, product descriptions, and image galleries, plus the published collections and store pages.
- **Product discovery**: Search, brand/category/collection filters, sorting, pagination, product variants, related products, and a persistent wishlist.
- **Renude skin analysis**: Embedded skin quiz, three-photo upload, and personalised routine recommendations.
- **GBP cart and checkout**: UK delivery details, £3.75 shipping below £35, and free delivery from £35. Checkout validates catalog prices and the GBP Razorpay payment before saving an order.

### ⚙️ Admin CMS Dashboard
- **Collapsible Sidebar**: Clean, space-efficient administration layout with toggleable navigation.
- **Banner & Media Manager**: Real-time management of storefront carousel slides, video spotlights, and promotional placements.
- **Product Inventory**: Full CRUD capabilities for adding, updating, and categorizing catalog items.
- **Order Processing**: Live order stream with status updates (`Pending`, `Processing`, `Shipped`, `Delivered`).
- **Analytics & Demographics**: Sales overviews, top revenue categories, and monthly velocity charts.

---

## 🏁 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) `>= 18.0.0`
- [npm](https://www.npmjs.com/) `>= 9.0.0`

### 1. Installation

Install root and frontend dependencies:

```bash
npm install
cd client && npm install && cd ..
```

### 2. Refreshing the Miikorean Store Data

The committed snapshot is used by both the storefront and the order API. Refresh both copies from the public Miikorean Shopify feeds before publishing catalog changes:

```powershell
.\scripts\sync-miikorean-storefront.ps1
```

The script exports product variants and images, collection metadata, and published pages to `client/public/miikorean-storefront.json` and `api/data/miikorean-storefront.json`.

### 3. Environment Variables

Copy the provided `.env.example` templates to `.env` and `client/.env`:

```bash
cp .env.example .env
cp client/.env.example client/.env
```

Configure the credentials in `.env`:
- **Supabase**: Set `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- **Razorpay**: Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`; the merchant account must support GBP and international payments. Set `VITE_RAZORPAY_KEY_ID` in `client/.env` to the matching public key.
- **Email (optional)**: Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.

### 4. Database Initialization

Execute the schema/migration script in your Supabase SQL Editor:
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Copy and paste the contents of [`schema.sql`](./schema.sql).
3. Run the query to create/update the tables and RLS policies. Existing order rows are marked as INR; new orders explicitly store GBP.

### 5. Running Locally

Start the storefront development server:

```bash
npm run dev
```

The storefront is accessible at **`http://localhost:5173`**. The Vercel `/api/*` functions and Razorpay checkout require a compatible deployed/serverless runtime and configured credentials.

---

## 📦 Scripts Reference

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server with HMR |
| `npm run build` | Runs TypeScript compiler checks (`tsc`) and compiles production assets |
| `npm run lint` | Runs ESLint over the client source tree |
| `.\scripts\sync-miikorean-storefront.ps1` | Refreshes the catalog snapshot for the storefront and API |

---

## 🔒 Security & Best Practices

- **Zero Hardcoded Secrets**: All sensitive API keys and secrets are loaded via environment variables.
- **Row Level Security (RLS)**: Enforced across all Supabase database tables to prevent unauthorized data manipulation.
- **Defensive API Architecture**: Fallback persistence ensures storefront banners and critical content remain operable even during database network interruptions.
- **Payment Verification**: GBP order totals are checked against the imported product catalog and the captured Razorpay order before saving.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

**Mii Korean** — Korean skincare, curated for your routine.
