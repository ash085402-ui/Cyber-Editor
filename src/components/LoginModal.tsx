import React from 'react';
import { X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
  isLoggingIn: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onGoogleLogin,
  isLoggingIn,
}) => {

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay">

      <div className="login-modal-content">

        <div className="login-modal-header">

          <h2 className="login-modal-title">
            Cyber Editor
          </h2>

          <button onClick={onClose} className="login-modal-close">
            <X size={18} />
          </button>

        </div>


        <button
          onClick={onGoogleLogin}
          disabled={isLoggingIn}
          className="google-login-btn"
        >

          {isLoggingIn 
            ? "Loading..."
            : "Մուտք Google-ով"
          }

        </button>


      </div>

    </div>
  );
};