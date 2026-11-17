import { createBrowserRouter } from 'react-router'
import App from '@/App'
import Home from '@/pages/Home'
import Tournament from '@/pages/Tournament'

// Équivalent de frontend/src/router/index.ts (Vue).
// "createBrowserRouter" = createRouter + createWebHistory :
// URL "propres" (/tournament/42) gérées par l'API History du navigateur.
export const router = createBrowserRouter([
  {
    // Route racine : App sert de "coquille" commune à toutes les pages,
    // et affiche la page courante via <Outlet /> (≈ <RouterView />).
    path: '/',
    element: <App />,
    children: [
      // "index: true" = la page affichée sur "/" exactement
      { index: true, element: <Home /> },
      { path: 'tournament/:id', element: <Tournament /> },
    ],
  },
])
