import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price: number | null;
  category_id: string | null;
  images: string[];
  tags: string[];
  is_customizable: boolean;
  customization_fields: CustomizationField[];
  delivery_days_min: number;
  delivery_days_max: number;
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories?: Category;
};

export type CustomizationField = {
  type: 'text' | 'date' | 'image';
  label: string;
  required: boolean;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string;
  image_url: string;
  sort_order: number;
  created_at: string;
};

export type Profile = {
  id: string;
  display_name: string;
  phone: string;
  avatar_url: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type Address = {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: Address | null;
  notes: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  customization: Record<string, string>;
};

export type GalleryItem = {
  id: string;
  title: string;
  image_url: string;
  tags: string[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type Testimonial = {
  id: string;
  customer_name: string;
  customer_image: string;
  rating: number;
  review: string;
  product_name: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type WishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: Product;
};

export type ProductReview = {
  id: string;
  product_id: string;
  user_id: string | null;
  rating: number;
  review: string;
  customer_name: string;
  email: string;
  is_verified: boolean;
  is_visible: boolean;
  created_at: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
  customization: Record<string, string>;
};
