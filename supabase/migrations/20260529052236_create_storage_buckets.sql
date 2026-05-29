/*
  # Setup Storage Buckets for Image Uploads

  ## Overview
  Creates two storage buckets for the e-commerce platform:
  1. `product-images` - For product images uploaded by admin
  2. `gallery-images` - For gallery/portfolio images

  ## Security
  - Public read access for all users (products need to be visible)
  - Authenticated upload only (admin users)
  - RLS policies restrict uploads to authenticated users only
*/

-- Create product-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create gallery-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery-images',
  'gallery-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read access to product images
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- Policy: Allow authenticated users to upload product images
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Policy: Allow authenticated users to update their product images
CREATE POLICY "Authenticated users can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

-- Policy: Allow authenticated users to delete product images
CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

-- Policy: Allow public read access to gallery images
CREATE POLICY "Public can view gallery images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'gallery-images');

-- Policy: Allow authenticated users to upload gallery images
CREATE POLICY "Authenticated users can upload gallery images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gallery-images');

-- Policy: Allow authenticated users to update gallery images
CREATE POLICY "Authenticated users can update gallery images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'gallery-images')
  WITH CHECK (bucket_id = 'gallery-images');

-- Policy: Allow authenticated users to delete gallery images
CREATE POLICY "Authenticated users can delete gallery images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'gallery-images');