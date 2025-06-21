
-- Create disasters table
CREATE TABLE public.disasters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  location_name TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  owner_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'resolved'))
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  disaster_id UUID REFERENCES public.disasters(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resources table
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('shelter', 'food', 'medical', 'transport')),
  location_name TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  capacity INTEGER,
  current_occupancy INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'limited', 'full')),
  contact TEXT,
  amenities TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create social_media_posts table
CREATE TABLE public.social_media_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  user_handle TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  disaster_id UUID REFERENCES public.disasters(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.disasters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is a public disaster management system)
-- Disasters policies
CREATE POLICY "Anyone can view disasters" ON public.disasters FOR SELECT USING (true);
CREATE POLICY "Anyone can create disasters" ON public.disasters FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update disasters" ON public.disasters FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete disasters" ON public.disasters FOR DELETE USING (true);

-- Reports policies
CREATE POLICY "Anyone can view reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Anyone can create reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update reports" ON public.reports FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete reports" ON public.reports FOR DELETE USING (true);

-- Resources policies
CREATE POLICY "Anyone can view resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Anyone can create resources" ON public.resources FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update resources" ON public.resources FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete resources" ON public.resources FOR DELETE USING (true);

-- Social media posts policies
CREATE POLICY "Anyone can view social media posts" ON public.social_media_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can create social media posts" ON public.social_media_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update social media posts" ON public.social_media_posts FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete social media posts" ON public.social_media_posts FOR DELETE USING (true);

-- Insert some sample data
INSERT INTO public.disasters (title, location_name, description, tags, owner_id, status) VALUES
('NYC Flood', 'Manhattan, NYC', 'Heavy flooding in Manhattan affecting Lower East Side', ARRAY['flood', 'urgent'], 'netrunnerX', 'active'),
('California Wildfire', 'Los Angeles County, CA', 'Forest fire spreading rapidly near residential areas', ARRAY['wildfire', 'evacuation'], 'reliefAdmin', 'monitoring');

INSERT INTO public.resources (name, type, location_name, latitude, longitude, capacity, current_occupancy, status, contact, amenities) VALUES
('Red Cross Emergency Shelter', 'shelter', 'Lower East Side, NYC', 40.7184, -73.9857, 150, 89, 'available', '+1-555-0123', ARRAY['Food', 'Medical', 'Clothing']),
('Community Food Bank', 'food', 'East Village, NYC', 40.7308, -73.9865, 300, 145, 'available', '+1-555-0456', ARRAY['Hot Meals', 'Supplies', 'Water']),
('Emergency Medical Station', 'medical', 'SoHo, NYC', 40.7241, -74.0045, 50, 23, 'available', '+1-555-0789', ARRAY['First Aid', 'Prescriptions', 'Emergency Care']),
('Transportation Hub', 'transport', 'Union Square, NYC', 40.7359, -73.9911, 200, 156, 'limited', '+1-555-0321', ARRAY['Evacuation Transport', 'Shuttle Service']);

INSERT INTO public.social_media_posts (platform, user_handle, content, priority, likes, shares, comments) VALUES
('Twitter', '@citizen_alert', '#FloodAlert Water rising rapidly in downtown Manhattan. Need evacuation assistance. #NYCFlood', 'urgent', 24, 8, 5),
('Twitter', '@reliefworker1', 'Shelter space available at Central Community Center. Can accommodate 50+ people. Hot meals provided. #DisasterRelief', 'normal', 12, 15, 3),
('Twitter', '@emergency_news', 'BREAKING: Wildfire evacuation orders expanded to include residential areas near Highway 101. Follow official channels for updates.', 'high', 89, 156, 23);
