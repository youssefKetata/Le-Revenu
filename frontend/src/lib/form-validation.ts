export function textError(value: string, min: number, max: number) {
  const length = value.trim().length;
  if (!length) return "Ce champ est obligatoire.";
  if (length < min) return `Saisissez au moins ${min} caractères.`;
  if (length > max)
    return `Ne dépassez pas ${max.toLocaleString("fr-FR")} caractères.`;
}

export function passwordError(value: string) {
  if (!value) return "Saisissez votre mot de passe.";
  if (value.length > 72 || new TextEncoder().encode(value).length > 72)
    return "Le mot de passe est trop long.";
}
