import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import type { Tournament } from '@/models/Tournament'
import styles from './TournamentCard.module.css'

type TournamentCardProps = {
  tournament: Tournament
}

// Fonction "pure" (ne dépend que de son paramètre) : on la définit HORS du
// composant. Dedans, elle serait recréée à chaque rendu, pour rien.
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function TournamentCard({ tournament }: TournamentCardProps) {
  // Équivalent de useRouter() : renvoie une fonction pour naviguer par le code
  const navigate = useNavigate()

  // Note : l'emit "select" de la version Vue n'était écouté par personne,
  // on ne le reproduit pas.
  function goToTournament() {
    navigate(`/tournament/${tournament.id}`)
  }

  // Équivalent de @keydown.enter + @keydown.space.prevent :
  // pas de modificateurs en React, on teste la touche nous-mêmes.
  function handleKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault() // sinon Espace fait défiler la page
      goToTournament()
    }
  }

  return (
    <article
      className={styles.tournamentCard}
      role="button"
      tabIndex={0}
      onClick={goToTournament}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.cardContent}>
        <p className={styles.cardLabel}>Tournoi</p>
        <h2 className={styles.cardTitle}>{tournament.name}</h2>
        <p className={styles.cardDate}>{formatDate(tournament.date)}</p>
      </div>

      <div className={styles.cardArrow}>
        <span>Voir</span>
      </div>
    </article>
  )
}

export default TournamentCard
