-- ========================================================
-- URVA E-Commerce Production Database Schema
-- Compatible with Supabase / PostgreSQL
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. UPDATED_AT TRIGGER FUNCTION ───
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── 2. USERS TABLE ───
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  uid VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  photo_url TEXT,
  provider VARCHAR(50) DEFAULT 'email',
  role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  gender VARCHAR(50),
  dob DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Safely add columns if users table already existed
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS uid VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'email';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gender VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS dob DATE;

-- Ensure users trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── 3. PRODUCTS TABLE ───
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  photo TEXT NOT NULL,
  photo_public_id VARCHAR(255),
  featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  variants JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT products_pkey PRIMARY KEY (id)
);

-- Safely add columns if products table already existed
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS photo TEXT DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS photo_public_id VARCHAR(255);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;

-- Safely make legacy columns optional if they exist from an older template
DO $$
BEGIN
  ALTER TABLE public.products ALTER COLUMN event_id DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.products ALTER COLUMN title DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── 4. COUPONS TABLE ───
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT coupons_pkey PRIMARY KEY (id)
);

-- Safely add is_active column if coupons table already existed
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- ─── 5. ORDERS TABLE ───
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_uid VARCHAR(255),
  shipping_info JSONB NOT NULL,
  order_items JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  tax NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  shipping_charges NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_charges >= 0),
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'GBP',
  status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT orders_pkey PRIMARY KEY (id)
);

-- Safely add columns if orders table already existed
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS short_id VARCHAR(50);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_uid VARCHAR(255);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_info JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tax NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_charges NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS currency CHAR(3);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending';
UPDATE public.orders SET currency = 'INR' WHERE currency IS NULL;
ALTER TABLE public.orders ALTER COLUMN currency SET DEFAULT 'GBP';
ALTER TABLE public.orders ALTER COLUMN currency SET NOT NULL;

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── 6. PERFORMANCE INDEXES ───
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_uid ON public.users(uid);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ─── 7. ROW LEVEL SECURITY (RLS) POLICIES ───
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products
  FOR SELECT USING (true);

-- Allow product inserts and updates for catalog management
DROP POLICY IF EXISTS "Public Manage Products" ON public.products;
CREATE POLICY "Public Manage Products" ON public.products
  FOR ALL USING (true) WITH CHECK (true);

-- Allow public read access to coupons
DROP POLICY IF EXISTS "Public Read Coupons" ON public.coupons;
CREATE POLICY "Public Read Coupons" ON public.coupons
  FOR SELECT USING (true);

-- Allow public insert, select & update for orders (guest checkout & payment updates)
DROP POLICY IF EXISTS "Public Insert Orders" ON public.orders;
CREATE POLICY "Public Insert Orders" ON public.orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Select Orders" ON public.orders;
CREATE POLICY "Public Select Orders" ON public.orders
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Update Orders" ON public.orders;
CREATE POLICY "Public Update Orders" ON public.orders
  FOR UPDATE USING (true);

-- Allow public insert, select & update for users (guest user registration)
DROP POLICY IF EXISTS "Public Insert Users" ON public.users;
CREATE POLICY "Public Insert Users" ON public.users
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Select Users" ON public.users;
CREATE POLICY "Public Select Users" ON public.users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Update Users" ON public.users;
CREATE POLICY "Public Update Users" ON public.users
  FOR UPDATE USING (true);

-- ─── MIGRATION: Fix orders status constraint to include 'Pending' ───
-- Run this in Supabase SQL Editor if the orders table already exists
-- (the CREATE TABLE above only applies to fresh installs)
DO $$
BEGIN
  ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
  ALTER TABLE public.orders
    ADD CONSTRAINT orders_status_check
    CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'));
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- ─── 7. STORE BANNERS & CAMPAIGNS TABLE ───
CREATE TABLE IF NOT EXISTS public.store_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL DEFAULT 'hero' CHECK (type IN ('hero', 'festival_banner', 'showcase_banner', 'announcement', 'spotlight', 'story_video')),
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  tagline TEXT,
  image_url TEXT DEFAULT '',
  mobile_image_url TEXT,
  link_url VARCHAR(255) DEFAULT '/products',
  button_text VARCHAR(100) DEFAULT 'Explore Now',
  badge VARCHAR(100),
  theme VARCHAR(50) DEFAULT 'dark',
  background_color VARCHAR(50) DEFAULT '#111111',
  text_color VARCHAR(50) DEFAULT '#FFFFFF',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT store_banners_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_store_banners_type ON public.store_banners(type);
CREATE INDEX IF NOT EXISTS idx_store_banners_active ON public.store_banners(is_active);

ALTER TABLE public.store_banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read store_banners" ON public.store_banners;
CREATE POLICY "Public Read store_banners" ON public.store_banners FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write store_banners" ON public.store_banners;
CREATE POLICY "Public Write store_banners" ON public.store_banners FOR ALL USING (true);

-- ─── 8. CMS & LOOKUP TABLES ───

-- Shippers (Delivery Partner Login)
CREATE TABLE IF NOT EXISTS public.shippers (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  auth_token TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT shippers_pkey PRIMARY KEY (id)
);

-- Trust Highlights (Homepage trust badges)
CREATE TABLE IF NOT EXISTS public.trust_highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT trust_highlights_pkey PRIMARY KEY (id)
);

-- Company Values (About Page)
CREATE TABLE IF NOT EXISTS public.company_values (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT company_values_pkey PRIMARY KEY (id)
);

-- Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  photo TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT testimonials_pkey PRIMARY KEY (id)
);

-- FAQs
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT faqs_pkey PRIMARY KEY (id)
);

-- Team Members
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  bio TEXT,
  photo TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT team_members_pkey PRIMARY KEY (id)
);

-- Gallery
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  photo TEXT NOT NULL,
  category VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT gallery_pkey PRIMARY KEY (id)
);

-- Blogs
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  excerpt TEXT,
  photo TEXT,
  author VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT blogs_pkey PRIMARY KEY (id)
);

-- Recipes
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  photo TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT recipes_pkey PRIMARY KEY (id)
);

-- RLS Policies
ALTER TABLE public.shippers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read trust_highlights" ON public.trust_highlights FOR SELECT USING (true);
CREATE POLICY "Public Read company_values" ON public.company_values FOR SELECT USING (true);
CREATE POLICY "Public Read testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Public Read faqs" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Public Read team_members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Public Read gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Public Read blogs" ON public.blogs FOR SELECT USING (true);
CREATE POLICY "Public Read recipes" ON public.recipes FOR SELECT USING (true);

-- ─── 9. SEED DATA ───
-- Default Super Admin User
INSERT INTO public.users (uid, email, name, role)
VALUES 
  ('admin_001', 'admin@miikorean.com', 'Mii Korean Admin', 'admin'),
  ('admin_002', 'admin@urvaa.in', 'Store Manager', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Default K-Beauty Welcome Coupons (GBP £)
INSERT INTO public.coupons (code, amount, is_active)
VALUES 
  ('WELCOME10', 10.00, true),
  ('GLOW15', 15.00, true),
  ('MIIKOREAN20', 20.00, true)
ON CONFLICT (code) DO NOTHING;

