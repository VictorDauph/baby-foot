import { useState, type SubmitEvent } from 'react'
import type { CreateTournamentPayload } from '@/dto/CreateTournamentPayload.dto'

type TournamentFormProps = {
  // Le parent fait l'appel API. On ATTEND sa Promise : si elle échoue,
  // on ne vide pas le formulaire (l'utilisateur garde sa saisie).
  onSubmit: (payload: CreateTournamentPayload) => Promise<void>
}

function getTodayPlusDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function TournamentForm({ onSubmit }: TournamentFormProps) {
  // Initialisation "paresseuse" : avec une fonction, getTodayPlusDays n'est
  // appelée qu'au PREMIER rendu (et pas à chaque rendu pour rien).
  const [name, setName] = useState('')
  const [date, setDate] = useState(() => getTodayPlusDays(7))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const today = getTodayPlusDays(0)

  // Équivalent de @submit.prevent="submit"
  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault() // sinon le navigateur recharge la page (submit HTML classique)
    if (!name.trim() || !date) return

    setIsSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), date })
      // Remise à zéro UNIQUEMENT si la création a réussi
      setName('')
      setDate(getTodayPlusDays(7))
    } catch {
      // L'erreur est affichée par le parent ; on garde juste la saisie.
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Créer un tournoi</h2>

      {/* Champ imbriqué dans son <label> : association implicite
          (clic sur le libellé = focus dans le champ), sans id. */}
      <label className="form-group">
        Nom du tournoi
        {/* Input CONTRÔLÉ (≈ v-model) : la valeur affichée vient de l'état,
            et chaque frappe met à jour l'état via onChange. */}
        <input
          type="text"
          placeholder="Nom du tournoi"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label className="form-group">
        Date du tournoi
        <input
          type="date"
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>

      {/* Désactivé pendant l'envoi : évite les doubles clics = doubles tournois */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Création…' : 'Créer'}
      </button>
    </form>
  )
}

export default TournamentForm
