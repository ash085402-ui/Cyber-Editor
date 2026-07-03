import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "dummy-id";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
)

console.log("CLIENT ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID)