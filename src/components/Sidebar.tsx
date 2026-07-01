import React, { useState } from 'react';
import { Home, LogOut, Sparkles, Settings, Menu, X, Image as ImageIcon } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useCanvasStore } from '../store/canvasStore';
import { useNavigate } from 'react-router-dom';

// Custom Google Icon SVG
const GoogleIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

// Curated list of high-quality abstract images from Unsplash
const GALLERY_IMAGES = [
  { id: 'img1', src: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&auto=format&fit=crop&q=60', name: 'Abstract Blue/Purple' },
  { id: 'img2', src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60', name: 'Minimal Shapes' },
  { id: 'img3', src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEDXoVX3Q4YN8FX8pNhObaDGhqlUJI7kL0FSz_ECQqhA&s=10', name: 'Fluid Gradient' },
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
  const [user, setUser] = useState({
    name: 'Անուն Ազգանուն',
    email: 'user@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  });

  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);

  // Setup Google login (OAuth 2.0)
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
      } catch (err) {
        console.error('Error fetching user info:', err);
      } finally {
        setIsLoggingIn(false);
      }
    },
    onError: (err) => {
      console.error('Google OAuth Error:', err);
      setIsLoggingIn(false);
    },
  });

  const handleLoginClick = () => {
    if (hasClientId) {
      setIsLoggingIn(true);
      realLogin();
    } else {
      // Demo authentication flow for local testing when no ClientID is set
      setIsLoggingIn(true);
      console.warn("Google Client ID not configured in .env. Falling back to Demo mode.");
      setTimeout(() => {
        setIsLoggingIn(false);
        setIsLoggedIn(true);
        setUser({
          name: 'Դեմո Օգտատեր',
          email: 'demo.user@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        });

        // Custom elegant notification toast
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '20px';
        toast.style.background = '#4f46e5';
        toast.style.color = '#fff';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '8px';
        toast.style.fontSize = '12px';
        toast.style.fontFamily = 'var(--font-ui)';
        toast.style.zIndex = '99999';
        toast.innerText = 'VITE_GOOGLE_CLIENT_ID-ն տեղադրված չէ .env ֆայլում, աշխատում է դեմո ռեժիմը։';
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.style.opacity = '0';
          toast.style.transition = 'opacity 0.5s ease';
          setTimeout(() => document.body.removeChild(toast), 500);
        }, 3000);
      }, 1000);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleHomeClick = () => {
    setSelectedId(null);

    // Dispatch reset event to center canvas
    const resetEvent = new CustomEvent('reset-canvas');
    window.dispatchEvent(resetEvent);

    // Notify user
    const alertBox = document.createElement('div');
    alertBox.style.position = 'fixed';
    alertBox.style.top = '24px';
    alertBox.style.left = '50%';
    alertBox.style.transform = 'translateX(-50%)';
    alertBox.style.background = '#4f46e5';
    alertBox.style.color = '#fff';
    alertBox.style.padding = '8px 16px';
    alertBox.style.borderRadius = '20px';
    alertBox.style.fontSize = '12px';
    alertBox.style.fontFamily = 'var(--font-ui)';
    alertBox.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.2)';
    alertBox.style.zIndex = '99999';
    alertBox.innerText = 'Կտավը վերագործարկվեց սկզբնական դիրքի';
    document.body.appendChild(alertBox);
    setTimeout(() => {
      alertBox.style.opacity = '0';
      alertBox.style.transition = 'opacity 0.4s ease';
      setTimeout(() => document.body.removeChild(alertBox), 400);
    }, 1500);

    setIsMobileOpen(false);
  };

  const handleAddGalleryImage = (src: string) => {
    addShape({
      type: 'image',
      x: window.innerWidth / 2 - 240, // Centered inside right canvas area
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
    setIsMobileOpen(false);
  };

  return (
    <React.Fragment>
      {/* Mobile Menu Toggle Button */}
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
          display: 'none', // Only visible via CSS media query on mobile
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--purple)',
          zIndex: 1000,
          outline: 'none',
        }}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Main Sidebar */}
      <div className={`nav-sidebar ${isMobileOpen ? 'open' : ''}`}>
        {/* Mobile drag bar */}
        <div className="mobile-swipe-handle" />

        {/* Section 1: Google Login/Profile */}
        <div style={{ paddingBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          {isLoggingIn ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px 0' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: '2px solid rgba(79, 70, 229, 0.1)',
                  borderTopColor: 'var(--purple)',
                  animation: 'spin 0.8s linear infinite'
                }}
              />
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Կապակցում Google-ին...</span>
            </div>
          ) : isLoggedIn ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                background: '#f1f5f9',
                borderRadius: '8px',
                border: '1px solid rgba(0, 0, 0, 0.04)'
              }}
            >
              <img
                src={user.avatar}
                alt="Profile"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1px solid var(--purple)'
                }}
              />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.name}</div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email}</div>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--pink)',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0'
                  }}
                >
                  <LogOut size={10} /> ՄՈՒՏՔԻՑ ԵԼՔ
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleLoginClick}
              className="hud-button"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px',
                background: '#ffffff',
                borderColor: '#e2e8f0',
                color: '#334155',
                fontSize: '11px',
                fontWeight: '600',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <GoogleIcon />
              Google Login
            </button>
          )}
        </div>

        {/* Section 2: Home Navigation Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            onClick={handleHomeClick}
            className="hud-button"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              justifyContent: 'flex-start',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '8px',
              background: 'rgba(79, 70, 229, 0.04)',
              borderColor: 'rgba(79, 70, 229, 0.1)',
              color: 'var(--purple)'
            }}
          >
            <Home size={16} />
            <span>Գլխավոր Էջ (Home)</span>
          </button>
        </div>

        {/* Section 3: Image Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '6px' }}>
            <ImageIcon size={14} className="text-muted" />
            <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px', color: 'var(--text-main)', textTransform: 'uppercase' }}>
              Պատկերասրահ (Gallery)
            </span>
          </div>

          <div className="gallery-container">
            <div className="gallery-grid">
              {GALLERY_IMAGES.map((img) => (
                <img
                  key={img.id}
                  src={img.src}
                  alt={img.name}
                  className="gallery-item"
                  onClick={() => handleAddGalleryImage(img.src)}
                  title={img.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Settings & Templates placeholders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px' }}>
          <button
            className="hud-button"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              justifyContent: 'flex-start',
              fontSize: '11px',
              opacity: 0.7,
              border: 'none',
              background: 'none'
            }}
          >
            <Sparkles size={14} style={{ color: 'var(--pink)' }} />
            <span>Շաբլոններ (Templates)</span>
          </button>

          <button
            className="hud-button"
            onClick={() => alert("Նոր կոճակը աշխատում է!")}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              justifyContent: 'flex-start',
              fontSize: '11px',
              opacity: 0.7,
              border: 'none',
              background: 'none',
              cursor: 'pointer'
            }}
          >
            <Settings size={14} style={{ color: 'var(--purple)' }} />
            <span>Իմ Նոր Կոճակը</span>
          </button>
        </div>

        {/* Mobile media toggle stylesheet hack inline */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @media (max-width: 768px) {
            .mobile-toggle-btn {
              display: flex !important;
            }
          }
        `}} />
      </div>
    </React.Fragment>
  );
};
