import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { TradesProvider } from './contexts/TradesContext'
import { ClerkProvider } from './providers/ClerkProvider'
import router from './router'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider>
      <ThemeProvider>
        <TradesProvider>
          <RouterProvider router={router} />
        </TradesProvider>
      </ThemeProvider>
    </ClerkProvider>
  </React.StrictMode>
)
