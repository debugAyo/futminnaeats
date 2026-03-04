
import React, { useState, useEffect, useMemo } from 'react';
import { Icons, RESTAURANTS, COLORS, getGoogleMapsDirectionsUrl, AVATAR_OPTIONS, getWhatsAppOrderUrl } from './constants';
import { Restaurant, CartItem, Order, UserProfile, OrderStatus } from './types';
import { getSmartRecommendations } from './services/geminiService';

// --- Authentication Components ---

const AppFooter: React.FC<{ className?: string }> = ({ className = '' }) => (
  <footer className={`text-center text-xs text-emerald-100/90 mt-6 ${className}`}>
    Designed by Mandem • by students, for students.
  </footer>
);

const LoginScreen: React.FC<{ onLogin: (user: UserProfile) => void; onSwitchToSignup: () => void }> = ({ onLogin, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }
    
    // Check localStorage for saved users
    const savedUsers = JSON.parse(localStorage.getItem('futminna_users') || '[]');
    const user = savedUsers.find((u: UserProfile) => u.email === email && u.password === password);
    
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-emerald-700 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 p-3">
            <img src="/logo.png" alt="FUTMinnaEats Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">FUTMinnaEats</h1>
          <p className="text-emerald-100 text-sm">Campus Food Delivery</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome Back</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com" 
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogin}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 mb-4"
          >
            Sign In
          </button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <button 
            onClick={onSwitchToSignup}
            className="w-full bg-gray-50 text-gray-700 py-3 rounded-2xl font-semibold border border-gray-200 hover:bg-gray-100 transition-all"
          >
            Create New Account
          </button>
        </div>

        <AppFooter />
      </div>
    </div>
  );
};

const SignupScreen: React.FC<{ onSignup: (user: UserProfile) => void; onSwitchToLogin: () => void }> = ({ onSignup, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    campus: 'GK' as const,
    level: 'Level 100',
    course: ''
  });
  const [selectedAvatar, setSelectedAvatar] = useState('👨‍🎓');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.course) {
      setError('Please fill all fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Check if email already exists
    const savedUsers = JSON.parse(localStorage.getItem('futminna_users') || '[]');
    if (savedUsers.find((u: UserProfile) => u.email === formData.email)) {
      setError('Email already registered');
      return;
    }

    const newUser: UserProfile = {
      id: `USER-${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name,
      email: formData.email,
      password: formData.password,
      avatar: selectedAvatar,
      campus: formData.campus,
      level: formData.level,
      course: formData.course,
      createdAt: Date.now()
    };

    // Save user to localStorage
    savedUsers.push(newUser);
    localStorage.setItem('futminna_users', JSON.stringify(savedUsers));

    onSignup(newUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-emerald-700 flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-3 p-2">
            <img src="/logo.png" alt="FUTMinnaEats Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black text-white mb-1">FUTMinnaEats</h1>
          <p className="text-emerald-100 text-sm">Create Your Account</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 block mb-3">Choose Avatar</label>
            <div className="grid grid-cols-7 gap-2">
              {AVATAR_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`text-3xl p-2 rounded-xl transition-all ${
                    selectedAvatar === emoji ? 'bg-emerald-100 ring-2 ring-emerald-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Your name" 
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="your@email.com" 
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Course/Dept</label>
              <input 
                type="text" 
                value={formData.course}
                onChange={(e) => setFormData({...formData, course: e.target.value})}
                placeholder="e.g., Computer Science" 
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Campus</label>
                <select 
                  value={formData.campus}
                  onChange={(e) => setFormData({...formData, campus: e.target.value as any})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                >
                  <option>GK</option>
                  <option>Bosso</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Level</label>
                <select 
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                >
                  {['100', '200', '300', '400', '500'].map(l => (
                    <option key={l}>Level {l}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSignup}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 mb-4"
          >
            Create Account
          </button>

          <button 
            onClick={onSwitchToLogin}
            className="w-full text-emerald-600 py-2 font-semibold hover:text-emerald-700 transition-colors"
          >
            Already have an account? Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components ---

const AppHeader: React.FC<{ title: string; onBack?: () => void; user?: UserProfile | null }> = ({ title, onBack, user }) => (
  <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center">
    {onBack && (
      <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
    )}
    <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
    <div className="ml-auto flex items-center space-x-3">
      {user && (
        <div className="text-2xl">{user.avatar}</div>
      )}
    </div>
  </header>
);

// Toast Notification Component
const Toast: React.FC<{ message: string; show: boolean }> = ({ message, show }) => (
  <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 px-4 ${show ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
    <div className="bg-emerald-600 text-white px-4 sm:px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 sm:gap-3 font-semibold text-sm sm:text-base max-w-xs sm:max-w-sm">
      <div className="bg-white/20 rounded-full p-1 flex-shrink-0">
        <Icons.Check />
      </div>
      <span className="line-clamp-2">{message}</span>
    </div>
  </div>
);

const RestaurantDetail: React.FC<{ 
    restaurant: Restaurant; 
    onAddToCart: (item: any) => void;
    onBack: () => void;
}> = ({ restaurant, onAddToCart, onBack }) => (
  <div className="pb-24">
    <AppHeader title={restaurant.name} onBack={onBack} />
    <div className="h-48 w-full overflow-hidden relative">
        <img src={restaurant.image} className="w-full h-full object-cover" alt={restaurant.name} />
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg">
            <Icons.Store />
            <span className="font-bold text-sm text-gray-800">{restaurant.name}</span>
        </div>
    </div>
    <div className="p-6">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-gray-500 text-sm mb-2">{restaurant.location}</p>
                <div className="flex items-center space-x-2 mb-2">
                    <Icons.Star filled />
                    <span className="font-bold text-lg">{restaurant.rating}</span>
                    <span className="text-gray-400 text-sm">({restaurant.reviews.length} reviews)</span>
                </div>
            </div>
            <button 
                onClick={() => {
                    const mapsUrl = getGoogleMapsDirectionsUrl(restaurant.name, restaurant.coordinates);
                    window.open(mapsUrl, '_blank');
                }}
                className="bg-emerald-50 text-emerald-600 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1 sm:gap-2">
                <Icons.Map />
                <span className="hidden sm:inline">Navigate</span>
                <span className="sm:hidden">Map</span>
            </button>
        </div>

        {/* Contact Buttons */}
        <div className="flex gap-2 mb-6">
            <a 
                href={`tel:${restaurant.phone}`}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
                <Icons.Phone />
                Call
            </a>
            <a 
                href={`https://wa.me/${restaurant.whatsapp?.replace(/\D/g, '').replace(/^0/, '234')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-100 text-green-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-200 transition-colors"
            >
                <Icons.WhatsApp />
                WhatsApp
            </a>
        </div>

        <h2 className="text-lg font-bold mb-4">Menu</h2>
        <div className="space-y-4">
            {restaurant.menu.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 overflow-hidden material-shadow hover:shadow-lg transition-all">
                    <div className="flex gap-4">
                        {item.image && (
                            <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                <p className="text-gray-500 text-xs line-clamp-2 mt-1">{item.description || "Freshly prepared campus favorite."}</p>
                            </div>
                            <div className="flex justify-between items-end">
                                <p className="text-emerald-600 font-bold">₦{item.price.toLocaleString()}</p>
                                <button 
                                    onClick={() => onAddToCart({ ...item, restaurantId: restaurant.id })}
                                    className="bg-emerald-600 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                                    title="Add to cart"
                                >
                                    <Icons.CartPlus />
                                </button>
                            </div>
                        </div>

                          <AppFooter />
                    </div>
                </div>
            ))}
        </div>
    </div>
  </div>
);

const OrderModal: React.FC<{ 
    total: number; 
    cart: CartItem[];
    user: UserProfile;
    onConfirm: () => void; 
    onCancel: () => void 
}> = ({ total, cart, user, onConfirm, onCancel }) => {
    const [step, setStep] = useState<'summary' | 'sending'>('summary');
    
    // Get the restaurant for the order
    const restaurant = RESTAURANTS.find(r => r.id === cart[0]?.restaurantId);
    const [copied, setCopied] = useState(false);
    
    // Generate order text for copying
    const getOrderText = () => {
        const itemsList = cart.map(c => `• ${c.quantity}x ${c.name} - ₦${(c.price * c.quantity).toLocaleString()}`).join('\n');
        return `🍽️ New Order from FUTMinnaEats\n\n` +
            `Customer: ${user.name}\n` +
            `Location: ${user.campus} Campus\n\n` +
            `Order Items:\n${itemsList}\n\n` +
            `Delivery Fee: ₦200\n` +
            `Total: ₦${total.toLocaleString()}\n\n` +
            `Please confirm this order. Thank you! 🙏`;
    };

    const handleSendWhatsApp = () => {
        if (!restaurant) return;
        const url = getWhatsAppOrderUrl(
            restaurant.whatsapp,
            restaurant.name,
            cart.map(c => ({ name: c.name, quantity: c.quantity, price: c.price })),
            total,
            user.name,
            user.campus
        );
        window.open(url, '_blank');
        setStep('sending');
        setTimeout(onConfirm, 1000);
    };

    const handleCopyOrder = async () => {
        try {
            await navigator.clipboard.writeText(getOrderText());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            alert('Could not copy. Please try WhatsApp instead.');
        }
    };

    const handleCallRestaurant = () => {
        if (!restaurant) return;
        window.location.href = `tel:${restaurant.phone}`;
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="bg-emerald-600 p-6 text-white text-center">
                    <div className="text-4xl mb-4">📦</div>
                    <h3 className="text-xl font-bold">Send Your Order</h3>
                    {restaurant && <p className="text-emerald-100 text-sm mt-1">to {restaurant.name}</p>}
                </div>
                <div className="p-6">
                    {step === 'summary' && (
                        <>
                            {/* Order Summary */}
                            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                                <h4 className="font-bold text-sm text-gray-700 mb-3">Order Summary</h4>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-gray-600">{item.quantity}x {item.name}</span>
                                            <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
                                    <span className="text-sm text-gray-500">Delivery</span>
                                    <span className="font-medium">₦200</span>
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="font-bold">Total</span>
                                    <span className="font-black text-emerald-600 text-lg">₦{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <p className="text-center text-sm text-gray-500 mb-4">
                                Choose how to send your order to the restaurant:
                            </p>

                            {/* WhatsApp Button */}
                            <button 
                                onClick={handleSendWhatsApp}
                                className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-600 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-3 mb-3"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                                Send via WhatsApp
                            </button>

                            {/* Call & Copy Buttons */}
                            <div className="flex gap-3 mb-3">
                                <button 
                                    onClick={handleCallRestaurant}
                                    className="flex-1 bg-blue-500 text-white py-3 rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                    </svg>
                                    Call
                                </button>
                                <button 
                                    onClick={handleCopyOrder}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                >
                                    {copied ? '✓ Copied!' : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                                            </svg>
                                            Copy Order
                                        </>
                                    )}
                                </button>
                            </div>

                            <button onClick={onCancel} className="w-full mt-2 text-gray-400 font-medium py-2">Cancel</button>
                            
                            <p className="text-center text-xs text-gray-400 mt-4">
                                ℹ️ Pay on delivery or as agreed with the restaurant
                            </p>
                        </>
                    )}

                    {step === 'sending' && (
                        <div className="text-center py-8">
                            <div className="text-5xl mb-4">✅</div>
                            <h4 className="font-bold text-xl text-gray-900 mb-2">Order Sent!</h4>
                            <p className="text-gray-500 text-sm">The restaurant will confirm your order shortly.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main App ---

export default function App() {
  const [authScreen, setAuthScreen] = useState<'login' | 'signup' | null>('login');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'cart' | 'profile'>('home');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaying, setIsPaying] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Filter restaurants based on search - searches both restaurant name AND menu items
  const filteredRestaurants = useMemo(() => {
    if (!searchQuery.trim()) return RESTAURANTS;
    const query = searchQuery.toLowerCase();
    return RESTAURANTS.filter(r => 
      r.name.toLowerCase().includes(query) ||
      r.location.toLowerCase().includes(query) ||
      r.menu.some((item: any) => item.name.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  // Scroll to restaurant list
  const scrollToRestaurants = () => {
    const element = document.getElementById('restaurant-list');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check if user already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('futminna_current_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setAuthScreen(null);
    }
  }, []);

  // Simulate AI initial recommendation
  useEffect(() => {
    if (currentUser) {
      setIsLoadingAi(true);
      getSmartRecommendations("What's a good lunch for a hungry engineering student near GK campus?", "GK")
          .then(res => {
              setAiRecommendation(res);
              setIsLoadingAi(false);
          });
    }
  }, [currentUser]);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('futminna_current_user', JSON.stringify(user));
    setAuthScreen(null);
  };

  const handleSignup = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('futminna_current_user', JSON.stringify(user));
    setAuthScreen(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('futminna_current_user');
    setAuthScreen('login');
    setCart([]);
  };

  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const addToCart = (item: any) => {
    setCart(prev => {
        const existing = prev.find(i => i.id === item.id);
        if (existing) {
            return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
        }
        return [...prev, { ...item, quantity: 1 }];
    });
    
    // Show success toast
    setToastMessage(`${item.name} added to cart!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleOrderConfirmed = () => {
    const newOrder: Order = {
        id: `ORDER-${Math.floor(Math.random() * 100000)}`,
        items: [...cart],
        total: cartTotal,
        status: 'preparing',
        timestamp: Date.now(),
        restaurantId: cart[0]?.restaurantId || ''
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    setIsPaying(false);
    setActiveTab('profile');
  };

  // Auth screens
  if (authScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} onSwitchToSignup={() => setAuthScreen('signup')} />;
  }

  if (authScreen === 'signup') {
    return <SignupScreen onSignup={handleSignup} onSwitchToLogin={() => setAuthScreen('login')} />;
  }

  if (!currentUser) {
    return null;
  }

  if (selectedRestaurant) {
    return (
      <>
        <Toast message={toastMessage} show={showToast} />
        <RestaurantDetail restaurant={selectedRestaurant} onBack={() => setSelectedRestaurant(null)} onAddToCart={addToCart} />
      </>
    );
  }

  return (
    <div className="min-h-screen pb-24 max-w-lg mx-auto bg-gray-50 shadow-xl">
      <Toast message={toastMessage} show={showToast} />
      {isPaying && currentUser && <OrderModal total={cartTotal + 200} cart={cart} user={currentUser} onConfirm={handleOrderConfirmed} onCancel={() => setIsPaying(false)} />}

      {/* Dynamic Content based on tab */}
      {activeTab === 'home' && (
        <div className="animate-in fade-in duration-500">
          <AppHeader title="FUTMinnaEats" user={currentUser} />
          
          <div className="px-6 py-4">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-emerald-600 rounded-3xl p-6 text-white mb-8 shadow-xl shadow-emerald-100">
                <div className="relative z-10">
                    <h2 className="text-2xl font-black leading-tight mb-2">Order FUT Minna favorites!</h2>
                    <p className="text-emerald-100 text-sm mb-4">Fresh meals from H&M, Bilkibab & Alewa delivered to your location.</p>
                    <button 
                        onClick={scrollToRestaurants}
                        className="bg-white text-emerald-600 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-gray-50 transition-colors"
                    >
                        Browse
                    </button>
                </div>
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500 rounded-full blur-3xl opacity-50"></div>
            </div>

            {/* AI Recommendation */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8">
                <div className="flex items-center mb-2">
                    <div className="bg-amber-500 w-2 h-2 rounded-full animate-pulse mr-2"></div>
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Smart Pick for You</span>
                </div>
                <p className="text-sm text-amber-900 leading-relaxed italic">
                    {isLoadingAi ? "Thinking of the perfect meal for you..." : `"${aiRecommendation}"`}
                </p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                    <Icons.Search />
                </div>
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Rice, Shawarma, Doughnuts..." 
                    className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Search Results Info */}
            {searchQuery && (
                <div className="mb-4 px-1">
                    <p className="text-sm text-gray-500">
                        {filteredRestaurants.length === 0 
                            ? `No restaurants found for "${searchQuery}"` 
                            : `Found ${filteredRestaurants.length} restaurant${filteredRestaurants.length > 1 ? 's' : ''} with "${searchQuery}"`
                        }
                    </p>
                </div>
            )}

            {/* Restaurant List */}
            <h3 id="restaurant-list" className="text-lg font-bold mb-4 flex items-center">
                {searchQuery ? 'Search Results' : 'Restaurants Near You'}
                {!searchQuery && <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] uppercase font-black rounded">Top Rated</span>}
            </h3>
            <div className="space-y-6">
                {filteredRestaurants.map(r => (
                    <div 
                        key={r.id} 
                        onClick={() => setSelectedRestaurant(r)}
                        className="material-card overflow-hidden cursor-pointer"
                    >
                        <div className="h-40 relative">
                            <img src={r.image} className="w-full h-full object-cover" alt={r.name} />
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold flex items-center shadow-sm">
                                <Icons.Star filled />
                                <span className="ml-1">{r.rating}</span>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-gray-900 text-lg">{r.name}</h4>
                                <span className="text-[10px] text-gray-400 font-medium">1.2 km</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">{r.location}</p>
                            <div className="flex gap-2 flex-wrap">
                                {r.menu.slice(0, 3).map((m: any) => (
                                    <span key={m.id} className="text-[10px] bg-gray-100 px-2 py-1 rounded-md text-gray-600">#{m.name.split(' ')[0]}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'map' && (
        <div className="h-[85vh] relative animate-in slide-in-from-bottom-4 duration-300">
             <AppHeader title="Campus Food Map" user={currentUser} />
             <div className="absolute inset-0 bg-gray-200 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-full h-full bg-slate-100 relative overflow-hidden rounded-3xl border-4 border-white shadow-inner">
                    {/* Simulated Map Markers */}
                    <div className="absolute top-1/4 left-1/3 group cursor-pointer">
                        <div className="bg-emerald-600 p-2 rounded-full text-white shadow-lg animate-bounce">
                            <Icons.Map />
                        </div>
                        <div className="mt-1 bg-white px-2 py-1 rounded shadow text-[10px] font-bold">H&M Garden</div>
                    </div>
                    <div className="absolute bottom-1/3 right-1/4 group cursor-pointer">
                        <div className="bg-blue-600 p-2 rounded-full text-white shadow-lg">
                            <Icons.Map />
                        </div>
                        <div className="mt-1 bg-white px-2 py-1 rounded shadow text-[10px] font-bold">Bilkibab</div>
                    </div>
                    <div className="absolute top-1/2 right-1/3 group cursor-pointer">
                        <div className="bg-purple-600 p-2 rounded-full text-white shadow-lg">
                            <Icons.Map />
                        </div>
                        <div className="mt-1 bg-white px-2 py-1 rounded shadow text-[10px] font-bold">Alewa</div>
                    </div>
                </div>
                <div className="mt-8">
                    <h4 className="font-bold text-gray-700">Live Delivery Tracking</h4>
                    <p className="text-sm text-gray-500 mt-1">Click on restaurants to view details and place orders.</p>
                </div>
             </div>
        </div>
      )}

      {activeTab === 'cart' && (
        <div className="p-6 animate-in fade-in duration-300">
          <AppHeader title="Your Basket" user={currentUser} />
          {cart.length === 0 ? (
            <div className="text-center mt-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-3xl">
                    🛒
                </div>
                <h3 className="font-bold text-lg">Your cart is empty</h3>
                <p className="text-sm text-gray-500 mt-1">Start adding some FUT favorites!</p>
                <button onClick={() => setActiveTab('home')} className="mt-6 bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg">Browse Restaurants</button>
            </div>
          ) : (
            <div className="mt-4">
                <div className="space-y-4 mb-10">
                    {cart.map(item => (
                        <div key={item.id} className="flex items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-800">{item.name}</h4>
                                <p className="text-emerald-600 font-black text-sm">₦{item.price.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center space-x-3 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                <button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i).filter(i => i.quantity > 0))} className="text-gray-400 hover:text-red-500">-</button>
                                <span className="font-bold w-4 text-center">{item.quantity}</span>
                                <button onClick={() => addToCart(item)} className="text-emerald-600 font-black">+</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-bold">₦{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Delivery ({currentUser.campus} Campus)</span>
                        <span className="font-bold">₦200</span>
                    </div>
                    <div className="h-[1px] bg-gray-100 w-full my-1"></div>
                    <div className="flex justify-between text-xl font-black">
                        <span>Total</span>
                        <span className="text-emerald-600">₦{(cartTotal + 200).toLocaleString()}</span>
                    </div>
                    <button 
                        onClick={() => setIsPaying(true)}
                        className="w-full mt-4 bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-emerald-100 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        Checkout Order
                    </button>
                </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="p-6 animate-in fade-in duration-300">
            <AppHeader title="Profile" user={currentUser} />
            <div className="mt-6 flex items-center space-x-4 mb-10">
                <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-4xl font-black shadow-inner">
                    {currentUser.avatar}
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900">{currentUser.name}</h3>
                    <p className="text-sm text-gray-500">{currentUser.course} • {currentUser.level}</p>
                    <div className="mt-2 inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-md border border-emerald-100">
                        {currentUser.campus} CAMPUS
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div>
                    <h4 className="text-lg font-bold mb-4">Recent Orders</h4>
                    {orders.length === 0 ? (
                        <p className="text-sm text-gray-400 bg-white p-6 rounded-2xl text-center border border-dashed border-gray-200">No orders yet. Start by browsing restaurants!</p>
                    ) : (
                        <div className="space-y-4">
                            {orders.map(order => (
                                <div key={order.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">{order.id}</p>
                                            <h5 className="font-bold">Order from {RESTAURANTS.find(r => r.id === order.restaurantId)?.name}</h5>
                                        </div>
                                        <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold animate-pulse">
                                            {order.status.toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-3">
                                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                    </div>
                                    <div className="flex justify-between items-end border-t pt-3 border-gray-50">
                                        <p className="font-black text-lg text-emerald-600">₦{order.total.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h4 className="font-bold mb-4">Account</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm font-medium text-gray-600">Email</span>
                            <span className="text-sm font-semibold text-gray-800">{currentUser.email}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm font-medium text-gray-600">Campus</span>
                            <span className="text-sm font-bold text-emerald-600">{currentUser.campus}</span>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="w-full mt-6 text-red-500 py-3 font-semibold bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      <AppFooter className="text-gray-500 px-6 pb-2" />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bottom-nav-blur border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50">
        <button 
            onClick={() => { setActiveTab('home'); setSelectedRestaurant(null); }}
            className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'home' ? 'text-emerald-600' : 'text-gray-400'}`}
        >
            <Icons.Home />
            <span className="text-[10px] font-bold">Home</span>
        </button>
        <button 
            onClick={() => { setActiveTab('map'); setSelectedRestaurant(null); }}
            className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'map' ? 'text-emerald-600' : 'text-gray-400'}`}
        >
            <Icons.Map />
            <span className="text-[10px] font-bold">Map</span>
        </button>
        <button 
            onClick={() => { setActiveTab('cart'); setSelectedRestaurant(null); }}
            className={`relative flex flex-col items-center space-y-1 transition-colors ${activeTab === 'cart' ? 'text-emerald-600' : 'text-gray-400'}`}
        >
            <Icons.Cart />
            <span className="text-[10px] font-bold">Cart</span>
            {cart.length > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                </div>
            )}
        </button>
        <button 
            onClick={() => { setActiveTab('profile'); setSelectedRestaurant(null); }}
            className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'profile' ? 'text-emerald-600' : 'text-gray-400'}`}
        >
            <Icons.User />
            <span className="text-[10px] font-bold">Me</span>
        </button>
      </nav>
    </div>
  );
}
