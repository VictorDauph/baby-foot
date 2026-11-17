import { useState, type SubmitEvent } from 'react'
import styles from './ScoreForm.module.css'

type ScoreFormProps = {
  teamAName: string
  teamBName: string
  onSubmit: (payload: { scoreA: number; scoreB: number }) => Promise<void>
}

// Pas de props "initialScoreA/B" ni de watch comme dans ScoreForm.vue :
// l'interface ne permet de saisir que les matchs NON joués, donc le
// formulaire part toujours de 0. (En Vue, il était prérempli avec -1,
// la valeur "non joué" du backend.)
// La réinitialisation entre deux matchs est assurée par le parent, via "key".
function ScoreForm({ teamAName, teamBName, onSubmit }: ScoreFormProps) {
  // Les scores sont stockés en STRING, pas en number :
  // e.target.value est toujours une string, et un état number empêcherait
  // de vider le champ pendant la saisie (Number('') vaut 0).
  // On convertit seulement à l'envoi (≈ v-model.number).
  const [scoreA, setScoreA] = useState('0')
  const [scoreB, setScoreB] = useState('0')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const a = Number(scoreA)
    const b = Number(scoreB)
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) return

    setIsSubmitting(true)
    try {
      await onSubmit({ scoreA: a, scoreB: b })
    } catch {
      // L'erreur est affichée par le parent ; on garde la saisie.
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={styles.scoreForm} onSubmit={handleSubmit}>
      <h2>Entrer le score</h2>

      <label className={styles.formGroup}>
        {teamAName}
        <input
          type="number"
          min={0}
          required
          value={scoreA}
          onChange={(e) => setScoreA(e.target.value)}
        />
      </label>

      <label className={styles.formGroup}>
        {teamBName}
        <input
          type="number"
          min={0}
          required
          value={scoreB}
          onChange={(e) => setScoreB(e.target.value)}
        />
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  )
}

export default ScoreForm
