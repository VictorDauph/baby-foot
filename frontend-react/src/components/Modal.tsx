import type { MouseEvent, ReactNode } from 'react'
import styles from './Modal.module.css'

// Équivalent de defineProps + defineEmits.
// En React, il n'y a pas d'"emit" : le parent passe une FONCTION en prop,
// et l'enfant l'appelle. Convention de nommage : onXxx.
type ModalProps = {
  isOpen: boolean
  onClose: () => void
  // children = ce que le parent met ENTRE <Modal> et </Modal> (≈ <slot />)
  children: ReactNode
}

// Les props arrivent en paramètre de la fonction ; on les déstructure.
function Modal({ isOpen, onClose, children }: ModalProps) {
  // Équivalent de v-if="isOpen" : un composant qui retourne null n'affiche rien
  if (!isOpen) return null

  // Équivalent de @click.self : on ne ferme que si le clic a eu lieu
  // sur l'overlay lui-même, pas sur un élément à l'intérieur de la modale.
  //  - e.target        = l'élément réellement cliqué
  //  - e.currentTarget = l'élément qui porte le onClick (l'overlay)
  function handleOverlayClick(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>{children}</div>
    </div>
  )
}

export default Modal
