
import React from 'react';

export const COLORS = {
  primary: '#059669', // Emerald 600
  secondary: '#10b981', // Emerald 500
  accent: '#f59e0b', // Amber 500
  bg: '#f9fafb',
};

// Utility function to generate Google Maps directions URL
export const getGoogleMapsDirectionsUrl = (
  restaurantName: string,
  coordinates: { lat: number; lng: number }
): string => {
  const { lat, lng } = coordinates;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=driving&dir_action=navigate`;
};

// Generate WhatsApp order message URL
export const getWhatsAppOrderUrl = (
  whatsapp: string,
  restaurantName: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number,
  customerName: string,
  customerCampus: string
): string => {
  const itemsList = items.map(i => `• ${i.quantity}x ${i.name} - ₦${(i.price * i.quantity).toLocaleString()}`).join('\n');
  const message = `🍽️ *New Order from FUTMinnaEats*\n\n` +
    `*Customer:* ${customerName}\n` +
    `*Location:* ${customerCampus} Campus\n\n` +
    `*Order Items:*\n${itemsList}\n\n` +
    `*Delivery Fee:* ₦200\n` +
    `*Total:* ₦${total.toLocaleString()}\n\n` +
    `Please confirm this order. Thank you! 🙏`;
  
  const phoneNumber = whatsapp.replace(/\D/g, ''); // Remove non-digits
  return `https://wa.me/${phoneNumber.startsWith('234') ? phoneNumber : '234' + phoneNumber.slice(1)}?text=${encodeURIComponent(message)}`;
};

// Generate Email order mailto link
export const getEmailOrderUrl = (
  email: string,
  restaurantName: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number,
  customerName: string,
  customerCampus: string
): string => {
  const itemsList = items.map(i => `- ${i.quantity}x ${i.name}: ₦${(i.price * i.quantity).toLocaleString()}`).join('\n');
  const subject = `New Order from ${customerName} - FUTMinnaEats`;
  const body = `New Order from FUTMinnaEats\n\n` +
    `Customer: ${customerName}\n` +
    `Location: ${customerCampus} Campus\n\n` +
    `Order Items:\n${itemsList}\n\n` +
    `Delivery Fee: ₦200\n` +
    `Total: ₦${total.toLocaleString()}\n\n` +
    `Please confirm this order. Thank you!`;
  
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

export const Icons = {
  Home: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  Map: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
  ),
  Cart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Star: ({ filled }: { filled?: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={filled ? "text-amber-500" : ""}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  Store: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
  ),
  WhatsApp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
  ),
  Phone: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
  ),
  CartPlus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  )
};

export const RESTAURANTS: any[] = [
  {
    id: "hm-garden",
    name: "H&M Garden",
    location: "GK Campus, FUT Minna",
    campus: 'GK',
    rating: 4.9,
    phone: "07063373229",
    whatsapp: "07063373229",
    email: "codestudydebug@gmail.com",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
    menu: [
      { id: "hm1", name: "Grilled Chicken + Fried Rice", price: 2200, description: "Perfectly grilled chicken with seasoned fried rice.", image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop" },
      { id: "hm2", name: "Beef Suya Plate", price: 2500, description: "Spicy grilled beef with onions and peppers.", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop" },
      { id: "hm3", name: "Garden Salad", price: 800, description: "Fresh mixed vegetables with vinaigrette.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop" },
      { id: "hm4", name: "Pepper Soup", price: 1200, description: "Hot spicy soup with assorted meat.", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop" }
    ],
    reviews: ["Best ambiance on campus!", "Quality food and service.", "Highly recommended!", "My go-to spot for dates.", "Fresh ingredients always."],
    coordinates: { lat: 9.5315, lng: 6.4480 }
  },
  {
    id: "bilkibab",
    name: "Bilkibab",
    location: "Opposite FUT Minna, Main Gate Area",
    campus: 'GK',
    rating: 4.7,
    phone: "08098765432",
    whatsapp: "08098765432",
    email: "bilkibab@gmail.com",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
    menu: [
      { id: "bk1", name: "Shawarma (Large)", price: 2500, description: "Beef & Chicken mix with special cream sauce.", image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop" },
      { id: "bk2", name: "Chicken Kebab Plate", price: 3000, description: "Three juicy grilled chicken kebab skewers.", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop" },
      { id: "bk3", name: "Beef Kebab", price: 3200, description: "Premium beef kebab with fresh vegetables.", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop" },
      { id: "bk4", name: "Mini Shawarma", price: 1500, description: "Perfect snack-sized shawarma.", image: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400&h=300&fit=crop" }
    ],
    reviews: ["Legendary shawarma!", "Perfect late-night food.", "Always fresh and tasty.", "Best shawarma in Minna!"],
    coordinates: { lat: 9.5325, lng: 6.4490 }
  },
  {
    id: "alewa-canteen",
    name: "Alewa Canteen",
    location: "Faculty Road, FUT Minna",
    campus: 'GK',
    rating: 4.5,
    phone: "07063373229",
    whatsapp: "07063373229",
    email: "acodestudydebug@gmail.com",
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=600&fit=crop",
    menu: [
      { id: "ac1", name: "Jollof Rice + Stew", price: 1500, description: "Aromatic jollof rice with rich tomato stew.", image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop" },
      { id: "ac2", name: "Fried Rice + Egg", price: 1600, description: "Tasty fried rice with fried egg.", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop" },
      { id: "ac3", name: "Milky Doughnuts", price: 500, description: "Fluffy doughnuts with milk glaze.", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop" }
    ],
    reviews: ["Affordable and filling!", "Student favorite.", "Quick service."],
    coordinates: { lat: 9.5300, lng: 6.4470 }
  },
  {
    id: "mama-cass",
    name: "Mama Cass Kitchen",
    location: "Behind SEET, GK Campus",
    campus: 'GK',
    rating: 4.6,
    phone: "08011223344",
    whatsapp: "08011223344",
    email: "mamacass@gmail.com",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop",
    menu: [
      { id: "mc1", name: "Egusi Soup + Pounded Yam", price: 1800, description: "Traditional egusi with smooth pounded yam.", image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=300&fit=crop" },
      { id: "mc2", name: "Amala + Ewedu", price: 1500, description: "Soft amala with ewedu and gbegiri.", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop" },
      { id: "mc3", name: "Beans + Plantain", price: 1000, description: "Honey beans with fried plantain.", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop" },
      { id: "mc4", name: "White Rice + Stew", price: 1200, description: "Fluffy white rice with rich tomato stew.", image: "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=400&h=300&fit=crop" }
    ],
    reviews: ["Tastes like home!", "Best native food on campus.", "Mama Cass never disappoints.", "Affordable and delicious."],
    coordinates: { lat: 9.5310, lng: 6.4465 }
  },
  {
    id: "de-tastee",
    name: "De Tastee Spot",
    location: "Library Road, GK Campus",
    campus: 'GK',
    rating: 4.3,
    phone: "07033445566",
    whatsapp: "07033445566",
    email: "detastee@gmail.com",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
    menu: [
      { id: "dt1", name: "Spaghetti Bolognese", price: 1800, description: "Italian pasta with rich meat sauce.", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop" },
      { id: "dt2", name: "Chicken Wings", price: 2000, description: "6 pieces crispy fried wings.", image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop" },
      { id: "dt3", name: "Meat Pie", price: 600, description: "Freshly baked meat pie.", image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop" }
    ],
    reviews: ["Good variety!", "Meat pies are amazing.", "Nice place to chill."],
    coordinates: { lat: 9.5320, lng: 6.4485 }
  },
  {
    id: "sweet-sensation",
    name: "Sweet Sensation GK",
    location: "Near Lecture Theatre, GK",
    campus: 'GK',
    rating: 4.4,
    phone: "08055667788",
    whatsapp: "08055667788",
    email: "sweetsensation@gmail.com",
    image: "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&h=600&fit=crop",
    menu: [
      { id: "ss1", name: "Chicken Burger", price: 2200, description: "Juicy chicken patty with fresh veggies.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop" },
      { id: "ss2", name: "Ice Cream Sundae", price: 800, description: "Vanilla ice cream with toppings.", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop" },
      { id: "ss3", name: "Pizza Slice", price: 1200, description: "Cheesy pepperoni pizza slice.", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop" },
      { id: "ss4", name: "French Fries", price: 700, description: "Crispy golden fries.", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop" }
    ],
    reviews: ["Ice cream is the best!", "Good fast food.", "Clean environment.", "Burgers are fire!"],
    coordinates: { lat: 9.5305, lng: 6.4475 }
  },
  {
    id: "baba-suya",
    name: "Baba Suya Joint",
    location: "Hostel Area, GK Campus",
    campus: 'GK',
    rating: 4.8,
    phone: "08099887766",
    whatsapp: "08099887766",
    email: "babasuya@gmail.com",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
    menu: [
      { id: "bs1", name: "Beef Suya (Full)", price: 2000, description: "Generous portion of spicy beef suya.", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop" },
      { id: "bs2", name: "Chicken Suya", price: 1800, description: "Spicy grilled chicken suya.", image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop" },
      { id: "bs3", name: "Ram Suya", price: 2500, description: "Premium ram suya special.", image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=300&fit=crop" },
      { id: "bs4", name: "Kidney", price: 500, description: "Grilled kidney with yaji.", image: "https://images.unsplash.com/photo-1606502973842-f64bc2785fe5?w=400&h=300&fit=crop" }
    ],
    reviews: ["Best suya in Minna!", "Night time vibes.", "Always fresh and hot.", "5-star suya!", "My favorite spot."],
    coordinates: { lat: 9.5330, lng: 6.4495 }
  },
  {
    id: "iya-basira",
    name: "Iya Basira Restaurant",
    location: "Student Center, GK Campus",
    campus: 'GK',
    rating: 4.2,
    phone: "07044556677",
    whatsapp: "07044556677",
    email: "iyabasira@gmail.com",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop",
    menu: [
      { id: "ib1", name: "Rice & Beans", price: 800, description: "Local rice and beans combo.", image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop" },
      { id: "ib2", name: "Eba + Vegetable Soup", price: 1000, description: "Solid eba with fresh vegetable soup.", image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop" },
      { id: "ib3", name: "Yam + Egg Sauce", price: 900, description: "Boiled yam with rich egg sauce.", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop" }
    ],
    reviews: ["Budget friendly!", "Good for broke students.", "Filling meals."],
    coordinates: { lat: 9.5295, lng: 6.4460 }
  },
  {
    id: "chops-n-drinks",
    name: "Chops & Drinks",
    location: "SUG Building, GK Campus",
    campus: 'GK',
    rating: 4.1,
    phone: "08012345678",
    whatsapp: "08012345678",
    email: "chopsndrinks@gmail.com",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop",
    menu: [
      { id: "cd1", name: "Small Chops Platter", price: 3000, description: "Assorted small chops for sharing.", image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop" },
      { id: "cd2", name: "Spring Rolls (6pcs)", price: 1200, description: "Crispy vegetable spring rolls.", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop" },
      { id: "cd3", name: "Puff Puff (10pcs)", price: 500, description: "Sweet fluffy puff puff.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop" },
      { id: "cd4", name: "Smoothie", price: 1500, description: "Fresh fruit smoothie.", image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop" }
    ],
    reviews: ["Perfect for events!", "Small chops are the best.", "Drinks are cold."],
    coordinates: { lat: 9.5308, lng: 6.4472 }
  },
  {
    id: "quick-bites",
    name: "Quick Bites Cafe",
    location: "Engineering Block, GK Campus",
    campus: 'GK',
    rating: 4.0,
    phone: "07077889900",
    whatsapp: "07077889900",
    email: "quickbites@gmail.com",
    image: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop",
    menu: [
      { id: "qb1", name: "Indomie Special", price: 800, description: "Indomie with egg and sausage.", image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=300&fit=crop" },
      { id: "qb2", name: "Toast & Tea", price: 500, description: "Buttered toast with hot tea.", image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop" },
      { id: "qb3", name: "Egg Sandwich", price: 700, description: "Fresh egg sandwich.", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop" },
      { id: "qb4", name: "Coffee", price: 400, description: "Hot brewed coffee.", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop" }
    ],
    reviews: ["Quick service!", "Perfect for morning classes.", "Affordable breakfast."],
    coordinates: { lat: 9.5318, lng: 6.4478 }
  }
];

export const AVATAR_OPTIONS = ['👨‍🎓', '👩‍🎓', '😊', '🧑‍💻', '👦', '👧', '🎓'];
