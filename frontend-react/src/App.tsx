import { Outlet } from 'react-router'

// Composant racine, équivalent de App.vue.
// <Outlet /> affiche la page qui correspond à l'URL (≈ <RouterView />).
// C'est ici qu'on mettra plus tard ce qui est commun à toutes les pages.
function App() {
  return <Outlet />
}

export default App
