CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id),
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'preparing', 'confirmed', 'on_the_way', 'delivered', 'cancelled'
  )),
  delivery_fee DECIMAL(10,2) DEFAULT 200.00,
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_address TEXT,
  notes TEXT,
  confirmation_code CHAR(4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
