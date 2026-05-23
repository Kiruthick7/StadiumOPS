import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'sonner'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster 
      theme="dark" 
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#0f172a',
          border: '1px solid #334155',
          color: '#f8fafc',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
        }
      }}
    />
  </React.StrictMode>,
)
