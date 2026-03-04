import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
// Import the new lock provider
import { HackathonLockProvider } from './context/HackathonLockContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {/* Wrap App with it (must be inside AuthProvider) */}
        <HackathonLockProvider>
          <App />
        </HackathonLockProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)