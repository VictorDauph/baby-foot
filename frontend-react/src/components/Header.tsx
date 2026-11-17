import { Link } from 'react-router'
import styles from './Header.module.css'

// Un composant React = une fonction qui retourne du JSX.
// Pas de props pour l'instant : le Header affiche toujours la même chose.
function Header() {
  return (
    <header className={styles.pageHeader}>
      <h1>
        {/* <Link> génère un vrai <a href="/"> (clic droit, Ctrl+clic, accessible
            au clavier) mais intercepte le clic pour naviguer sans recharger. */}
        <Link to="/" className={styles.homeLink}>🍊</Link> Baby-foot Tournament Manager
      </h1>
      <p className={styles.subtitle}>Organisez et gérez vos tournois simplement</p>
    </header>
  )
}

export default Header
