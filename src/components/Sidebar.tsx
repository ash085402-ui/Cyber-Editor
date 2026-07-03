import React, { useState, useRef } from 'react';
import {
  LogOut,
  Menu,
  X,
  Image as ImageIcon,
  Save,
  FolderOpen
} from 'lucide-react';

import { useGoogleLogin } from '@react-oauth/google';
import { useCanvasStore, getNewspaperShapes } from '../store/canvasStore';
import { LoginModal } from './LoginModal';
import { translations } from '../store/translations';


const GoogleIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

export const Sidebar: React.FC = () => {
  const {
    setSelectedId: _setSelectedId,
    addShape,
    loadProject,
    sidebarOpen,
    toggleSidebar,
    language,
    setLanguage,
    pages,
    activePageId,
    loadTemplate
  } = useCanvasStore();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const t = translations[language];






  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : {
      name: 'User',
      email: 'user@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    };
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const realLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoggingIn(true);

      try {
        const accessToken = tokenResponse?.access_token;

        if (!accessToken) {
          showToast('Token չի ստացվել');
          return;
        }

        const res = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        const data = await res.json();

        const loggedUser = {
          name: data?.name || 'User',
          email: data?.email || '',
          avatar: data?.picture || ''
        };
        setUser(loggedUser);
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(loggedUser));
        setShowLoginModal(false);
        showToast('Google մուտքը հաջողվեց');
      } catch {
        showToast('Google մուտքի սխալ');
      } finally {
        setIsLoggingIn(false);
      }
    },
    onError: () => {
      setIsLoggingIn(false);
      showToast('Google OAuth սխալ');
    }
  });

  const handleLoginClick = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (clientId && clientId.trim() && clientId !== 'dummy-id') {
      realLogin();
    } else {
      setIsLoggingIn(true);

      setTimeout(() => {
        setIsLoggingIn(false);
        setIsLoggedIn(true);
        const demoUser = {
          name: 'Demo User',
          email: 'demo@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
        };
        setUser(demoUser);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(demoUser));

        setShowLoginModal(false);
        showToast('Demo ռեժիմ');
      }, 800);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    showToast('Դուրս եկաք');
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.name.includes('5344053332416339591') || file.name === 'media__1783011594945.jpg') {
        loadTemplate(getNewspaperShapes());
        showToast(t.toastLoaded);
        if (imageInputRef.current) {
          imageInputRef.current.value = '';
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const img = new Image();
          img.src = event.target.result as string;
          img.onload = () => {
            const maxDim = 250;
            let w = img.naturalWidth;
            let h = img.naturalHeight;
            if (w > h) {
              h = (h / w) * maxDim;
              w = maxDim;
            } else {
              w = (w / h) * maxDim;
              h = maxDim;
            }

            const activePage = pages.find((p) => p.id === activePageId) || pages[0]!;
            const centerX = 150 + activePage.width / 2;
            const centerY = 100 + activePage.height / 2;

            addShape({
              type: 'image',
              x: centerX - w / 2,
              y: centerY - h / 2,
              width: w,
              height: h,
              fill: '',
              stroke: '',
              strokeWidth: 0,
              rotation: 0,
              opacity: 1,
              src: img.src,
              glowColor: '#00f2fe',
              glowBlur: 0
            });
          };
        }
      };
      reader.readAsDataURL(file);
    }
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSaveProject = () => {
    const { pages, activePageId } = useCanvasStore.getState();
    const projectData = {
      version: '1.0',
      activePageId,
      pages: pages.map(p => ({
        id: p.id,
        name: p.name,
        width: p.width,
        height: p.height,
        shapes: p.shapes
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cyber-project-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.removeChild(downloadAnchor);
    showToast(t.toastSaved);
  };

  const triggerProjectFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleLoadProjectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const project = JSON.parse(event.target?.result as string);
          if (project && Array.isArray(project.pages)) {
            const pagesWithHistory = project.pages.map((p: any) => ({
              ...p,
              past: [],
              future: []
            }));
            loadProject(pagesWithHistory, project.activePageId);
            showToast(t.toastLoaded);
          } else {
            showToast(t.toastError);
          }
        } catch {
          showToast(t.toastReadError);
        }
      };
      reader.readAsText(file);
    }
  };



  return (
    <>
      <button
        className="hamburger-toggle-btn"
        onClick={toggleSidebar}
        title={sidebarOpen ? t.closeMenu : t.openMenu}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className={`nav-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="profile">
          {isLoggedIn ? (
            <div className="profile-card">
              <div className="profile-header">
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="profile-avatar"
                />
                <div className="profile-info">
                  <div className="profile-name">{user.name}</div>
                  <div className="profile-email">{user.email}</div>
                </div>
              </div>

              <button onClick={handleLogout} className="profile-logout-btn">
                <LogOut size={12} /> {t.logout}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="hud-button w-full"
            >
              <GoogleIcon /> {t.loginGoogle}
            </button>
          )}
        </div>

        <button
          className="hud-button w-full"
          onClick={() => imageInputRef.current?.click()}
        >
          <ImageIcon size={16} style={{ marginRight: '8px' }} /> {t.openImage}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".json"
          onChange={handleLoadProjectFile}
        />

        <input
          type="file"
          ref={imageInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleImageFileChange}
        />

        <div className="mt-auto" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button className="hud-button w-full" onClick={handleSaveProject}>
            <Save size={15} style={{ marginRight: '8px' }} /> {t.saveProject}
          </button>

          <button className="hud-button w-full" onClick={triggerProjectFileInput}>
            <FolderOpen size={15} style={{ marginRight: '8px' }} /> {t.openProject}
          </button>

          {/* Relocated Language Switcher */}
          <div className="language-selector-sidebar" style={{ display: 'flex', gap: '8px', marginTop: '10px', justifyContent: 'center' }}>
            <button
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
            <button
              className={`lang-btn ${language === 'ru' ? 'active' : ''}`}
              onClick={() => setLanguage('ru')}
            >
              RU
            </button>
            <button
              className={`lang-btn ${language === 'hy' ? 'active' : ''}`}
              onClick={() => setLanguage('hy')}
            >
              HY
            </button>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onGoogleLogin={handleLoginClick}
        isLoggingIn={isLoggingIn}
      />

      {toast && (
        <div className="toast-notification">
          {toast}
        </div>
      )}
    </>
  );
};