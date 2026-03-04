
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  location: string;
  campus: 'GK' | 'Bosso' | 'Off-Campus';
  rating: number;
  phone: string;
  menu: MenuItem[];
  reviews: string[];
  image: string;
  coordinates: { lat: number; lng: number };
}

export interface CartItem extends MenuItem {
  quantity: number;
  restaurantId: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'on-way' | 'delivered';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  timestamp: number;
  restaurantId: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string; // Avatar emoji or image URL
  campus: 'GK' | 'Bosso' | 'Off-Campus';
  level: string;
  course: string;
  createdAt: number;
}
