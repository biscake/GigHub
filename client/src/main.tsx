import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider.tsx'
import App from './App.tsx'
import { E2EEProvider } from './context/E2EEProvider.tsx'
import { ChatProvider } from './context/ChatProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <E2EEProvider>
          <ChatProvider>
            <App />
          </ChatProvider>
        </E2EEProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
