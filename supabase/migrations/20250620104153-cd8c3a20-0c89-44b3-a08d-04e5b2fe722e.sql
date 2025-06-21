
-- Create a profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS on disasters table for authenticated users
ALTER TABLE public.disasters ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all disasters
CREATE POLICY "Authenticated users can view all disasters" 
  ON public.disasters 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow authenticated users to create disasters
CREATE POLICY "Authenticated users can create disasters" 
  ON public.disasters 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid()::text = owner_id);

-- Allow users to update their own disasters
CREATE POLICY "Users can update their own disasters" 
  ON public.disasters 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid()::text = owner_id);

-- Enable real-time for disasters table
ALTER TABLE public.disasters REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.disasters;

-- Add latitude and longitude columns to disasters table for mapping
ALTER TABLE public.disasters 
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- Update existing disasters with some sample global coordinates
UPDATE public.disasters 
SET latitude = CASE 
  WHEN location_name ILIKE '%new york%' THEN 40.7128
  WHEN location_name ILIKE '%california%' THEN 34.0522
  WHEN location_name ILIKE '%tokyo%' THEN 35.6762
  WHEN location_name ILIKE '%london%' THEN 51.5074
  ELSE 40.7128 + (RANDOM() - 0.5) * 20
END,
longitude = CASE 
  WHEN location_name ILIKE '%new york%' THEN -74.0060
  WHEN location_name ILIKE '%california%' THEN -118.2437
  WHEN location_name ILIKE '%tokyo%' THEN 139.6503
  WHEN location_name ILIKE '%london%' THEN -0.1278
  ELSE -74.0060 + (RANDOM() - 0.5) * 40
END
WHERE latitude IS NULL OR longitude IS NULL;
