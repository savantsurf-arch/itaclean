-- ====================================================================
-- ITACLEAN - SUPABASE STORAGE BUCKETS & POLICIES
-- MIGRATION: 20261028000001_storage_setup.sql
-- ====================================================================

-- 1. Create public storage buckets for product images, banners and technical documents (FISPQ)
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('product-images', 'product-images', true),
    ('banners', 'banners', true),
    ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage RLS Policies - Allow public read access to all assets
DO $$ BEGIN
    CREATE POLICY "Public Read product-images" ON storage.objects
        FOR SELECT USING (bucket_id = 'product-images');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Public Read banners" ON storage.objects
        FOR SELECT USING (bucket_id = 'banners');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Public Read documents" ON storage.objects
        FOR SELECT USING (bucket_id = 'documents');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Storage Admin Upload/Manage Policies
DO $$ BEGIN
    CREATE POLICY "Admin/Service Upload product-images" ON storage.objects
        FOR INSERT WITH CHECK (
            bucket_id = 'product-images' 
            AND (auth.role() = 'service_role' OR public.is_admin(auth.uid()) OR auth.uid() IS NOT NULL)
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admin/Service Upload banners" ON storage.objects
        FOR INSERT WITH CHECK (
            bucket_id = 'banners' 
            AND (auth.role() = 'service_role' OR public.is_admin(auth.uid()) OR auth.uid() IS NOT NULL)
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admin/Service Upload documents" ON storage.objects
        FOR INSERT WITH CHECK (
            bucket_id = 'documents' 
            AND (auth.role() = 'service_role' OR public.is_admin(auth.uid()) OR auth.uid() IS NOT NULL)
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
