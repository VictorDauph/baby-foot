import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { router } from './router'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Équivalent de app.use(router) : le routeur affiche App puis la page */}
    <RouterProvider router={router} />
  </StrictMode>,
)
