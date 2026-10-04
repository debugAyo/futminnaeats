CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  campus TEXT NOT NULL CHECK (campus IN ('GK', 'Bosso', 'Off-Campus')),
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  whatsapp_number TEXT,
  email TEXT,
  image_url TEXT,
  is_open BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
