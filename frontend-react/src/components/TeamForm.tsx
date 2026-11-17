import { useState, type SubmitEvent } from 'react'

type TeamFormProps = {
  // Même principe que TournamentForm : le parent fait l'appel API
  onSubmit: (payload: { name: string }) => Promise<void>
}

function TeamForm({ onSubmit }: TeamFormProps) {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({ name: name.trim() })
      setName('')
    } catch {
      // L'erreur est affichée par le parent ; on garde la saisie.
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Ajouter une équipe</h2>

      <label className="form-group">
        Nom de l'équipe
        <input
          type="text"
          placeholder="Ex: Les Dragons"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Ajout…' : 'Ajouter'}
      </button>
    </form>
  )
}

export default TeamForm
