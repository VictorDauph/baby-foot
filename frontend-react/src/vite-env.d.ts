// Déclare les variables d'environnement exposées au front (préfixe VITE_).
// TypeScript FUSIONNE cette interface avec celle fournie par Vite
// ("declaration merging") : on obtient l'autocomplétion sur
// import.meta.env.VITE_API_URL et une erreur en cas de faute de frappe.
interface ImportMetaEnv {
  readonly VITE_API_URL: string
}
