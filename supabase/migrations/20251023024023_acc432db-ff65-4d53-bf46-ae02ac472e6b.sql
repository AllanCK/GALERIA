-- Create storage policies for galeria-assets bucket
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'galeria-assets');

-- Allow authenticated users to view files
CREATE POLICY "Authenticated users can view files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'galeria-assets');

-- Allow authenticated users to update their files
CREATE POLICY "Authenticated users can update files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'galeria-assets');

-- Allow authenticated users to delete their files
CREATE POLICY "Authenticated users can delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'galeria-assets');