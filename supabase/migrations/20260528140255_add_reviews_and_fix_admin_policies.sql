/*
  # Add Reviews Table and Fix Admin Policies

  ## Overview
  Adds a product_reviews table for customer reviews with star ratings (1-5),
  and ensures only admins can manage products (insert/update/delete).

  ## New Table: product_reviews
  - Customer reviews on products
  - Star rating (1-5)
  - Review text
  - Customer name (optional for guests)
  - Linked to authenticated users when logged in

  ## Policy Updates
  - Products: Only admins can INSERT/UPDATE/DELETE
  - Gallery items: Only admins can INSERT/UPDATE/DELETE
  - Testimonials: Only admins can INSERT/UPDATE/DELETE
  - Reviews: Anyone can submit (with email verification for guests)
*/

-- Product Reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text DEFAULT '',
  customer_name text DEFAULT '',
  email text DEFAULT '',
  is_verified boolean DEFAULT false,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Reviews: Anyone can view visible reviews
CREATE POLICY "Visible reviews are publicly readable"
  ON product_reviews FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

-- Reviews: Authenticated users can submit reviews
CREATE POLICY "Authenticated users can submit reviews"
  ON product_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Reviews: Allow anonymous reviews (for guests who provided email)
CREATE POLICY "Guests can submit reviews with email"
  ON product_reviews FOR INSERT
  TO anon
  WITH CHECK (email IS NOT NULL AND email != '');

-- Reviews: Admins can manage all reviews
CREATE POLICY "Admins can view all reviews"
  ON product_reviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update reviews"
  ON product_reviews FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can delete reviews"
  ON product_reviews FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Drop existing non-admin product policies
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

-- Re-create with stricter admin-only check (must be signed in AND admin)
CREATE POLICY "Only admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Only admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Only admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Drop and re-create gallery policies for admin-only
DROP POLICY IF EXISTS "Admins can insert gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Admins can update gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Admins can delete gallery items" ON gallery_items;

CREATE POLICY "Only admins can insert gallery items"
  ON gallery_items FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Only admins can update gallery items"
  ON gallery_items FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Only admins can delete gallery items"
  ON gallery_items FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Drop and re-create testimonial policies for admin-only
DROP POLICY IF EXISTS "Admins can manage testimonials insert" ON testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials update" ON testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials delete" ON testimonials;

CREATE POLICY "Only admins can insert testimonials"
  ON testimonials FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Only admins can update testimonials"
  ON testimonials FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Only admins can delete testimonials"
  ON testimonials FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Index for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(rating);
