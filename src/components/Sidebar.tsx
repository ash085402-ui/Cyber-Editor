import React, { useState } from 'react';
import { Home, LogOut, Sparkles, Settings, Menu, X, Image as ImageIcon } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useCanvasStore } from '../store/canvasStore';
import { useNavigate } from 'react-router-dom';

// Google Icon
const GoogleIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

// Պատկերասրահ (բոլոր հղումները աշխատող են)
const GALLERY_IMAGES = [
  { id: 'img1', src: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&auto=format&fit=crop&q=60', name: 'Abstract Blue/Purple' },
  { id: 'img2', src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60', name: 'Minimal Shapes' },
  { id: 'img3', src: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=300&auto=format&fit=crop&q=60', name: 'Fluid Gradient' },
  { id: 'img4', src: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&auto=format&fit=crop&q=60', name: 'Liquid Gold' },
  { id: 'img5', src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&auto=format&fit=crop&q=60', name: 'Mountain Sunset' },
  { id: 'img6', src: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=300&auto=format&fit=crop&q=60', name: 'Pink Minimalist' },
  { id: 'img7', src: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&auto=format&fit=crop&q=60', name: 'Holographic Mesh' },
  { id: 'img8', src: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=300&auto=format&fit=crop&q=60', name: 'Abstract Paint' },
];

export const Sidebar: React.FC = () => {
  const { setSelectedId, addShape } = useCanvasStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [user, setUser] = useState({
    name: 'Անուն Ազգանուն',
    email: 'user@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  });

  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2800);
  };

  const hasClientId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const realLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoggingIn(true);
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const data = await res.json();
        setUser({
          name: data.name,
          email: data.email,
          avatar: data.picture,
        });
        setIsLoggedIn(true);
        showToast('Հաջողությամբ մուտք գործեցիք Google-ով');
      } catch (err) {
        console.error('Error fetching user info:', err);
        showToast('Չհաջողվեց ստանալ տվյալները');
      } finally {
        setIsLoggingIn(false);
      }
    },
    onError: (err) => {
      console.error('Google OAuth Error:', err);
      showToast('Google մուտքի սխալ');
      setIsLoggingIn(false);
    },
  });

  const handleLoginClick = () => {
    if (hasClientId) {
      setIsLoggingIn(true);
      realLogin();
    } else {
      setIsLoggingIn(true);
      console.warn("Google Client ID not configured. Using Demo mode.");
      
      setTimeout(() => {
        setIsLoggingIn(false);
        setIsLoggedIn(true);
        setUser({
          name: 'Դեմո Օգտատեր',
          email: 'demo.user@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        });
        showToast('VITE_GOOGLE_CLIENT_ID-ն տեղադրված չէ։ Աշխատում է դեմո ռեժիմը։');
      }, 800);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    showToast('Դուք դուրս եկաք համակարգից');
  };

  const handleHomeClick = () => {
    setSelectedId(null);
    const resetEvent = new CustomEvent('reset-canvas');
    window.dispatchEvent(resetEvent);

    showToast('Կտավը վերագործարկվեց սկզբնական դիրքի');
    setIsMobileOpen(false);
  };

  const handleAddGalleryImage = (src: string, name: string) => {
    addShape({
      type: 'image',
      x: window.innerWidth / 2 - 240,
      y: window.innerHeight / 2 - 150,
      width: 200,
      height: 200,
      fill: '',
      stroke: '',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      src: src,
      glowColor: '#4f46e5',
      glowBlur: 0,
    });
    showToast(`Ավելացվեց՝ ${name}`);
    setIsMobileOpen(false);
  };

  return (
    <React.Fragment>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleMobileMenu}
        className="glass-panel mobile-toggle-btn"
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--purple)',
          zIndex: 1000,
        }}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Main Sidebar */}
      <div className={`nav-sidebar ${isMobileOpen ? 'open' : ''}`}>
        <div className="mobile-swipe-handle" />

        {/* Google Login / Profile */}
        <div style={{ paddingBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          {isLoggingIn ? (
            <div className="flex flex-col items-center gap-2 py-3">
              <div className="w-6 h-6 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
              <span className="text-xs text-gray-500">Կապակցում Google-ին...</span>
            </div>
          ) : isLoggedIn ? (
            <div className="flex items-center gap-3 p-3 bg-slate-100 rounded-xl border border-slate-200">
              <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-purple-500" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">{user.name}</div>
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
                <button onClick={handleLogout} className="text-pink-600 text-xs font-medium flex items-center gap-1 mt-1 hover:underline">
                  <LogOut size={12} /> ՄՈՒՏՔԻՑ ԵԼՔ
                </button>
              </div>
            </div>
          ) : (
            <button onClick={handleLoginClick} className="hud-button w-full flex items-center justify-center py-3">
              <GoogleIcon />
              Google Login
            </button>
          )}
        </div>

        {/* Home Button */}
        <div className="mt-4">
          <button onClick={handleHomeClick} className="hud-button w-full flex items-center gap-3 py-3 px-4 text-purple-700">
            <Home size={17} />
            <span>Գլխավոր Էջ (Home)</span>
          </button>
        </div>

        {/* Image Gallery */}
        <div className="flex-1 flex flex-col mt-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <ImageIcon size={15} />
            <span className="uppercase text-xs font-bold tracking-widest text-slate-700">Պատկերասրահ</span>
          </div>

          <div className="gallery-container flex-1 overflow-y-auto py-4">
            <div className="gallery-grid grid grid-cols-2 gap-3">
              {GALLERY_IMAGES.map((img) => (
                <img
                  key={img.id}
                  src={img.src}
                  alt={img.name}
                  className="gallery-item aspect-square object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform shadow-sm"
                  onClick={() => handleAddGalleryImage(img.src, img.name)}
                  title={img.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="pt-4 border-t border-slate-200 space-y-1">
          <button className="hud-button w-full flex items-center gap-2.5 py-2.5 px-3 opacity-75">
            <Sparkles size={15} className="text-pink-500" />
            <span>Շաբլոններ (Templates)</span>
          </button>

          <button 
            onClick={() => showToast("Նոր կոճակը աշխատում է!")} 
            className="hud-button w-full flex items-center gap-2.5 py-2.5 px-3 opacity-75 cursor-pointer"
          >
            <Settings size={15} className="text-purple-600" />
            <span>Իմ Նոր Կոճակը</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-3.5 rounded-2xl shadow-xl z-[99999] text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Mobile styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (max-width: 768px) {
            .mobile-toggle-btn { display: flex !important; }
          }
        `
      }} />
    </React.Fragment>
  );
};