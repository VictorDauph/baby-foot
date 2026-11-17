import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Modal from '@/components/Modal'
import TournamentCard from '@/components/TournamentCard'
import TournamentForm from '@/components/TournamentForm'
import type { CreateTournamentPayload } from '@/dto/CreateTournamentPayload.dto'
import type { Tournament } from '@/models/Tournament'
import { createTournamentService, getTournaments } from '@/services/tournament.service'
import styles from './Home.module.css'

function Home() {
  // ---- État (≈ les ref() de Home.vue) ----
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  // true dès le départ : le premier rendu a lieu AVANT la fin du chargement
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [createError, setCreateError] = useState('')
  const [shrink, setShrink] = useState(false)

  // ---- Effet n°1 : charger les tournois (≈ onMounted + loadTournaments) ----
  useEffect(() => {
    // Si le composant est démonté avant la réponse (ou en StrictMode, qui
    // monte/démonte/remonte), on ignore la réponse de l'appel devenu obsolète.
    let ignore = false

    // La fonction passée à useEffect ne peut pas être "async" : elle doit
    // retourner une fonction de nettoyage, pas une Promise.
    // On déclare donc une fonction async à l'intérieur, et on l'appelle.
    async function loadTournaments() {
      try {
        const data = await getTournaments()
        if (!ignore) setTournaments(data)
      } catch (error) {
        console.error(error)
        if (!ignore) setErrorMessage('Impossible de charger les tournois.')
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadTournaments()

    // Nettoyage : appelé au démontage (≈ onUnmounted)
    return () => {
      ignore = true
    }
  }, []) // [] = une seule fois, après le premier rendu

  // ---- Effet n°2 : animation du ballon ----
  // Un effet = UNE responsabilité : on ne mélange pas avec le chargement.
  useEffect(() => {
    const timer = setTimeout(() => setShrink(true), 50)
    // Sans ce nettoyage, un timer "orphelin" survivrait au démontage
    return () => clearTimeout(timer)
  }, [])

  // ---- Actions ----
  function openModal() {
    setCreateError('') // on n'affiche pas l'erreur d'une tentative précédente
    setModalOpen(true)
  }

  // Appelée par TournamentForm. Un gestionnaire d'événement (contrairement
  // à la fonction d'un useEffect) PEUT être async.
  async function handleCreateTournament(payload: CreateTournamentPayload) {
    setCreateError('')
    try {
      const response = await createTournamentService(payload)
      // Pas de rechargement : l'API renvoie le tournoi créé, on l'AJOUTE.
      // - Nouveau tableau ([...prev, x]) et pas prev.push(x) : React compare
      //   les références, une mutation passerait inaperçue.
      // - Forme "prev => ..." : on part de la valeur la plus récente.
      setTournaments((prev) => [...prev, response.tournament])
      setModalOpen(false) // on ferme seulement APRÈS le succès
    } catch (error) {
      console.error(error)
      setCreateError('Impossible de créer le tournoi.')
      throw error // prévient TournamentForm de ne pas vider la saisie
    }
  }

  // ---- Rendu ----
  // Deux éléments racines (la page + l'image) => fragment <>...</>
  return (
    <>
      <div className={styles.page}>
        <Header />

        <main className={styles.container}>
          <div className={styles.actions}>
            <button className={styles.primaryButton} onClick={openModal}>
              Créer un tournoi
            </button>
          </div>

          {isLoading && <p className={styles.info}>Chargement des tournois…</p>}

          <section className={styles.tournamentList}>
            {tournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </section>

          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
            <TournamentForm onSubmit={handleCreateTournament} />
            {/* Classe globale "error" (styles/global.css) */}
            {createError && <p className="error">{createError}</p>}
          </Modal>

          {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        </main>
      </div>

      {/* Classes GLOBALES (définies dans styles/global.css), d'où des
          chaînes et pas styles.xxx. Pas de syntaxe :class="{...}" en React :
          on construit la chaîne nous-mêmes. */}
      <img
        className={`splash-image ${shrink ? 'splash-image-shrink' : ''}`}
        src="/ballon.png"
        alt=""
      />
    </>
  )
}

export default Home
