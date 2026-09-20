import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, "L'adresse e-mail est obligatoire.").email('Adresse e-mail invalide.'),
  /**
   * Aucune règle de complexité à la connexion : on vérifie un mot de passe
   * existant, pas on n'en crée un. Exiger « 8 caractères minimum » ici
   * rejetterait un compte ancien parfaitement valide avant même d'interroger
   * le serveur.
   */
  password: z.string().min(1, 'Le mot de passe est obligatoire.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
