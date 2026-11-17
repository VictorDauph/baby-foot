import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import Header from '@/components/Header'
import Modal from '@/components/Modal'
import ScoreForm from '@/components/ScoreForm'
import TeamForm from '@/components/TeamForm'
import type { TournamentRankingResponseDto } from '@/dto/TournamentRankingResponse.dto'
import type { Match } from '@/models/Match'
import type { Tournament as TournamentModel } from '@/models/Tournament'
import { updateMatchScoreService } from '@/services/match.service'
import {
  addTeamToTournament,
  generateMatchesService,
  getTournamentById,
  getTournamentRanking,
} from '@/services/tournament.service'
import styles from './Tournament.module.css'

// ---------------------------------------------------------------------------
// Fonctions "pures" hors du composant : elles ne dépendent pas de React.
// ---------------------------------------------------------------------------

// Charge tout ce dont la page a besoin, dans l'ordre, et RETOURNE le résultat.
// Corrige le bug de Tournament.vue : "ranking.value = await fetchRanking()"
// alors que fetchRanking ne retournait rien => le classement était écrasé
// par undefined. Ici, chaque appel retourne sa valeur, et on enchaîne avec await.
async function fetchTournamentPage(id: number) {
  const tournament = await getTournamentById(id)
  const ranking = tournament.generated ? await getTournamentRanking(id) : null
  return { tournament, ranking }
}

// Le backend initialise les scores à -1 tant que le match n'est pas joué.
// (Version Vue : 6 conditions ; "?? -1" traite aussi null/undefined.)
function isMatchPlayed(match: Match): boolean {
  return (match.scoreA ?? -1) >= 0 && (match.scoreB ?? -1) >= 0
}

// ---------------------------------------------------------------------------

function Tournament() {
  // useParams donne une string (morceau d'URL) : on la convertit en nombre
  const { id } = useParams()
  const tournamentId = Number(id)
  const isValidId = Number.isInteger(tournamentId) && tournamentId > 0

  // ---- État ----
  const [tournament, setTournament] = useState<TournamentModel | null>(null)
  const [ranking, setRanking] = useState<TournamentRankingResponseDto | null>(null)
  const [loadError, setLoadError] = useState('')
  const [errorMessage, setErrorMessage] = useState('') // erreurs d'action sur la page
  const [modalError, setModalError] = useState('') // erreurs affichées DANS les modales
  const [teamModalOpen, setTeamModalOpen] = useState(false)
  // Pas de booléen "scoreModalOpen" en plus : la modale est ouverte
  // si et seulement si un match est sélectionné. Un état qui se déduit
  // d'un autre ne doit pas être stocké (sinon ils finissent par diverger).
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  // Incrémenter ce compteur relance l'effet de chargement (voir reload)
  const [reloadKey, setReloadKey] = useState(0)

  // ---- Chargement : au montage, puis à chaque changement d'id ou de reloadKey ----
  useEffect(() => {
    if (!isValidId) return
    let ignore = false

    fetchTournamentPage(tournamentId)
      .then((data) => {
        if (ignore) return
        setTournament(data.tournament)
        setRanking(data.ranking)
      })
      .catch((error) => {
        console.error(error)
        if (!ignore) setLoadError('Impossible de charger le tournoi.')
      })

    return () => {
      ignore = true
    }
  }, [tournamentId, isValidId, reloadKey])

  // Après une action, l'API ne renvoie pas le tournoi à jour :
  // on redemande tout au serveur en relançant l'effet.
  function reload() {
    setReloadKey((k) => k + 1)
  }

  // ---- Actions ----
  function openTeamModal() {
    setModalError('')
    setTeamModalOpen(true)
  }

  function openScoreModal(match: Match) {
    setModalError('')
    setSelectedMatch(match)
  }

  async function handleAddTeam(payload: { name: string }) {
    setModalError('')
    try {
      await addTeamToTournament({ tournamentId, teamName: payload.name })
      setTeamModalOpen(false)
      reload()
    } catch (error) {
      console.error(error)
      setModalError("Impossible d'ajouter l'équipe.")
      throw error // TeamForm garde la saisie
    }
  }

  async function handleGenerateMatches() {
    setErrorMessage('')
    try {
      await generateMatchesService(tournamentId)
      reload()
    } catch (error) {
      console.error(error)
      setErrorMessage('Impossible de générer les matchs.')
    }
  }

  async function handleSubmitScore(payload: { scoreA: number; scoreB: number }) {
    if (!selectedMatch) return
    setModalError('')
    try {
      // IMMUABILITÉ : la version Vue modifiait selectedMatch directement
      // (selectedMatch.value!.scoreA = ...), c.-à-d. un objet qui appartient
      // à l'état "tournament". En React, on ne mute jamais l'état :
      // on crée un NOUVEL objet avec { ...ancien, champs modifiés }.
      await updateMatchScoreService({ ...selectedMatch, ...payload })
      setSelectedMatch(null) // ferme la modale
      reload()
    } catch (error) {
      console.error(error)
      setModalError("Impossible d'enregistrer le score.")
      throw error // ScoreForm garde la saisie
    }
  }

  // ---- Rendus anticipés (early returns) ----
  // Ils viennent APRÈS tous les hooks : un hook ne doit jamais être
  // sauté par un return (règle n°1 des hooks).
  if (!isValidId || loadError) {
    return (
      <div className={styles.page}>
        <Header />
        <p className="error">{loadError || 'Tournoi introuvable.'}</p>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className={styles.page}>
        <Header />
        <p className={styles.empty}>Chargement du tournoi…</p>
      </div>
    )
  }

  // ---- Données dérivées (≈ computed) : recalculées à chaque rendu ----
  // Une Map id => nom, plutôt qu'un teams.find() par match dans le JSX
  const teamNames = new Map(tournament.teams.map((team) => [team.id, team.name]))
  const teamName = (teamId: number) => teamNames.get(teamId) ?? ''

  // ---- Rendu principal ----
  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.container}>
        {/* ===== Équipes ===== */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Équipes</h2>
            {!tournament.generated && (
              <button className={styles.primaryButton} onClick={openTeamModal}>
                Ajouter une équipe
              </button>
            )}
          </div>

          {tournament.teams.length === 0 && (
            <div className={styles.empty}>Aucune équipe enregistrée</div>
          )}

          <ul className={styles.teamList}>
            {tournament.teams.map((team) => (
              <li key={team.id}>{team.name}</li>
            ))}
          </ul>
        </section>

        {/* ===== Matchs ===== */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Matchs</h2>
            {tournament.teams.length >= 2 && !tournament.generated && (
              <button className={styles.primaryButton} onClick={handleGenerateMatches}>
                Générer les matchs
              </button>
            )}
          </div>

          {tournament.matches.length === 0 && (
            <div className={styles.empty}>Aucun match généré</div>
          )}

          <div className={styles.matchList}>
            {tournament.matches.map((match) => {
              // Dans un .map(), on peut ouvrir un bloc { } pour calculer
              // des valeurs avant de retourner le JSX
              const played = isMatchPlayed(match)
              return (
                <div key={match.id} className={styles.matchCard}>
                  <span>{teamName(match.teamAId)}</span>
                  {played && <span>| {match.scoreA} |</span>}
                  <strong>vs</strong>
                  {played && <span>| {match.scoreB} |</span>}
                  <span>{teamName(match.teamBId)}</span>
                  {!played && (
                    <button
                      className={styles.secondaryButton}
                      onClick={() => openScoreModal(match)}
                    >
                      Saisir le score
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* ===== Classement ===== */}
        {tournament.generated && (
          <section className={styles.section}>
            <h2>Classement</h2>

            {!ranking || ranking.ranking.length === 0 ? (
              <div className={styles.empty}>Classement disponible après les matchs</div>
            ) : (
              <div className={styles.rankingTableWrapper}>
                <table className={styles.rankingTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Équipe</th>
                      <th>Pts</th>
                      <th>V</th>
                      <th>N</th>
                      <th>D</th>
                      <th>BP</th>
                      <th>BC</th>
                      <th>Diff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.ranking.map((team, index) => (
                      <tr key={team.id}>
                        <td>{index + 1}</td>
                        <td>{team.name}</td>
                        <td>
                          <strong>{team.points}</strong>
                        </td>
                        <td>{team.wins}</td>
                        <td>{team.draws}</td>
                        <td>{team.losses}</td>
                        <td>{team.goalsFor}</td>
                        <td>{team.goalsAgainst}</td>
                        <td>
                          <span
                            className={
                              team.goalDifference >= 0 ? styles.positiveDiff : styles.negativeDiff
                            }
                          >
                            {team.goalDifference > 0 ? '+' : ''}
                            {team.goalDifference}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ===== Modales ===== */}
        <Modal isOpen={teamModalOpen} onClose={() => setTeamModalOpen(false)}>
          <TeamForm onSubmit={handleAddTeam} />
          {modalError && <p className="error">{modalError}</p>}
        </Modal>

        <Modal isOpen={selectedMatch !== null} onClose={() => setSelectedMatch(null)}>
          {selectedMatch && (
            // key = l'id du match : si le match sélectionné change, React
            // considère que c'est un AUTRE formulaire, le détruit et en crée
            // un neuf (état remis à zéro). Remplace le watch de ScoreForm.vue.
            <ScoreForm
              key={selectedMatch.id}
              teamAName={teamName(selectedMatch.teamAId)}
              teamBName={teamName(selectedMatch.teamBId)}
              onSubmit={handleSubmitScore}
            />
          )}
          {modalError && <p className="error">{modalError}</p>}
        </Modal>

        {errorMessage && <p className="error">{errorMessage}</p>}
      </main>
    </div>
  )
}

export default Tournament
