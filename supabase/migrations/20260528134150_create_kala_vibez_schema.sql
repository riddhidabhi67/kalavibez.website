/*
  # Kala Vibez Ecommerce Schema

  ## Overview
  Complete database schema for the Kala Vibez luxury handcrafted resin art and candle brand ecommerce platform.

  ## New Tables

  ### profiles
  - Extended user profile data linked to auth.users
  - Stores display name, phone, avatar

  ### addresses
  - User saved addresses for delivery
  - Linked to profiles

  ### categories
  - Product categories (Resin, Candles, Wax Melts, Clocks)
  - Supports subcategories

  ### products
  - Full product catalog with pricing, images, customization options
  - Linked to categories

  ### product_images
  - Multiple images per product

  ### gallery_items
  - Portfolio/gallery images with tags for filtering

  ### wishlist
  - User product wishlists

  ### orders
  - Customer orders with status tracking

  ### order_items
  - Individual items within an order

  ### testimonials
  - Customer reviews and testimonials

  ### site_settings
  - Admin-controlled site settings (logo, hero banner, etc.)

  ## Security
  - RLS enabled on all tables
  - Policies restrict access to authenticated users for private data
  - Public read for products, categories, gallery, testimonials
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text DEFAULT '',
  phone text DEFAULT '',
  avatar_url text DEFAULT '',
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label text DEFAULT 'Home',
  full_name text NOT NULL,
  phone text NOT NULL,
  line1 text NOT NULL,
  line2 text DEFAULT '',
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  original_price numeric(10,2),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  images text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  is_customizable boolean DEFAULT false,
  customization_fields jsonb DEFAULT '[]',
  delivery_days_min integer DEFAULT 7,
  delivery_days_max integer DEFAULT 14,
  stock integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active products are publicly readable"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Gallery items
CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text DEFAULT '',
  image_url text NOT NULL,
  tags text[] DEFAULT '{}',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gallery items are publicly readable"
  ON gallery_items FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can insert gallery items"
  ON gallery_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update gallery items"
  ON gallery_items FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can delete gallery items"
  ON gallery_items FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist"
  ON wishlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to wishlist"
  ON wishlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from wishlist"
  ON wishlist FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  order_number text UNIQUE NOT NULL,
  status text DEFAULT 'pending',
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  shipping_address jsonb,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_image text DEFAULT '',
  quantity integer NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL,
  customization jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Users can insert order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_image text DEFAULT '',
  rating integer DEFAULT 5,
  review text NOT NULL,
  product_name text DEFAULT '',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active testimonials are publicly readable"
  ON testimonials FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage testimonials insert"
  ON testimonials FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can manage testimonials update"
  ON testimonials FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can manage testimonials delete"
  ON testimonials FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Site settings
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings are publicly readable"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can insert site settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);

-- Seed categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Resin Products', 'resin-products', 'Handcrafted resin art pieces', 1),
  ('Candle Products', 'candle-products', 'Luxury handcrafted candles', 2),
  ('Wax Melts / Diffuser', 'wax-melts-diffuser', 'Aromatic wax melts and diffusers', 3),
  ('Clocks', 'clocks', 'Artistic resin clocks', 4)
ON CONFLICT (slug) DO NOTHING;

-- Seed subcategories for Resin
INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT 'Coasters', 'resin-coasters', id, 1 FROM categories WHERE slug = 'resin-products'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT 'Trays', 'resin-trays', id, 2 FROM categories WHERE slug = 'resin-products'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT 'Jewelry', 'resin-jewelry', id, 3 FROM categories WHERE slug = 'resin-products'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT 'Wedding Frames', 'wedding-frames', id, 4 FROM categories WHERE slug = 'resin-products'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT 'Corporate Gifts', 'corporate-gifts', id, 5 FROM categories WHERE slug = 'resin-products'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT 'Baby Detailing', 'baby-detailing', id, 6 FROM categories WHERE slug = 'resin-products'
ON CONFLICT (slug) DO NOTHING;

-- Seed subcategories for Candles
INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT 'Everyday Candles', 'everyday-candles', id, 1 FROM categories WHERE slug = 'candle-products'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT 'Scented Candles', 'scented-candles', id, 2 FROM categories WHERE slug = 'candle-products'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT 'Decorative Candles', 'decorative-candles', id, 3 FROM categories WHERE slug = 'candle-products'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT 'Dessert Candles', 'dessert-candles', id, 4 FROM categories WHERE slug = 'candle-products'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT 'Wedding Candles', 'wedding-candles', id, 5 FROM categories WHERE slug = 'candle-products'
ON CONFLICT (slug) DO NOTHING;

-- Seed subcategories for Wax Melts
INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT 'Vanilla', 'wax-vanilla', id, 1 FROM categories WHERE slug = 'wax-melts-diffuser'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT 'Lavender', 'wax-lavender', id, 2 FROM categories WHERE slug = 'wax-melts-diffuser'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT 'Rose', 'wax-rose', id, 3 FROM categories WHERE slug = 'wax-melts-diffuser'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT 'Coffee', 'wax-coffee', id, 4 FROM categories WHERE slug = 'wax-melts-diffuser'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT 'Strawberry', 'wax-strawberry', id, 5 FROM categories WHERE slug = 'wax-melts-diffuser'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT 'Ocean Breeze', 'wax-ocean-breeze', id, 6 FROM categories WHERE slug = 'wax-melts-diffuser'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT 'Sandalwood', 'wax-sandalwood', id, 7 FROM categories WHERE slug = 'wax-melts-diffuser'
ON CONFLICT (slug) DO NOTHING;

-- Seed default site settings
INSERT INTO site_settings (key, value) VALUES
  ('logo_url', ''),
  ('hero_banner_url', ''),
  ('hero_title', 'Handcrafted with Love'),
  ('hero_subtitle', 'Luxury resin art & candles made to order'),
  ('whatsapp_number', '+919876543210'),
  ('instagram_url', 'https://instagram.com/kalavibez'),
  ('about_text', 'Kala Vibez is a luxury handcrafted brand specializing in bespoke resin art, artisanal candles, and aromatic wax melts. Every piece is crafted with passion and precision.')
ON CONFLICT (key) DO NOTHING;

-- Seed testimonials
INSERT INTO testimonials (customer_name, rating, review, product_name, sort_order) VALUES
  ('Priya Sharma', 5, 'Absolutely stunning coasters! The quality is exceptional and they look even better in person. Will definitely order again.', 'Resin Coasters Set', 1),
  ('Rahul Mehta', 5, 'Ordered a custom wedding frame and it was breathtaking. The attention to detail is incredible. Highly recommend Kala Vibez!', 'Wedding Frame', 2),
  ('Ananya Patel', 5, 'The scented candles smell divine and the packaging is so luxurious. Perfect for gifting!', 'Scented Candle Set', 3),
  ('Vikram Singh', 5, 'Got corporate gifts for my entire team — everyone was impressed. Professional, beautiful, and unique.', 'Corporate Gift Set', 4),
  ('Meera Nair', 5, 'The baby detailing kit is absolutely precious. Such a thoughtful keepsake. Thank you Kala Vibez!', 'Baby Detailing Frame', 5)
ON CONFLICT DO NOTHING;
