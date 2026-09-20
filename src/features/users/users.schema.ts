import { z } from 'zod';

/**
 * Schéma de validation du formulaire utilisateur.
 *
 * Il sert deux fois : à valider la saisie *et* à typer le formulaire
 * (`z.infer`). Un type écrit à la main à côté du schéma dérive au premier
 * champ ajouté — ici, c'est impossible par construction.
 *
 * ⚠️ Cette validation est une commodité, pas une garantie : elle vit dans le
 * navigateur et se contourne en trois lignes de console. Le serveur doit
 * valider les mêmes règles.
 */
export const userSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Le nom doit faire au moins 2 caractères.')
    .max(80, 'Le nom ne peut pas dépasser 80 caractères.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "L'adresse e-mail est obligatoire.")
    .email('Adresse e-mail invalide.'),
  role: z.enum(['admin', 'manager', 'viewer'], {
    // Message explicite : sans lui, un champ vide affiche l'erreur technique
    // de zod (« Invalid enum value… »), incompréhensible pour l'utilisateur.
    required_error: 'Choisissez un rôle.',
  }),
  status: z.enum(['active', 'invited', 'suspended'], {
    required_error: 'Choisissez un statut.',
  }),
});

export type UserFormValues = z.infer<typeof userSchema>;
