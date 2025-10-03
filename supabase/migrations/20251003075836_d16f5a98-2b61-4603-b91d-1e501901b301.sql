-- Create storage bucket for training data
INSERT INTO storage.buckets (id, name, public)
VALUES ('training-data', 'training-data', false);

-- Storage policies for training data uploads
CREATE POLICY "Users can upload their own training data"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'training-data' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own training data"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'training-data' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own training data"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'training-data' AND
  auth.uid()::text = (storage.foldername(name))[1]
);