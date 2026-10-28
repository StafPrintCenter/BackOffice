/**
 * Extrait le message d'erreur réel renvoyé par le backend (403: { message },
 * 422: { errors: { champ: [messages] } }) plutôt que d'afficher un message générique.
 */
export async function parseApiError(response: Response, fallback: string): Promise<Error> {
  try {
    const json = await response.json();
    if (typeof json?.message === "string" && json.message.trim()) {
      return new Error(json.message);
    }
    if (json?.errors && typeof json.errors === "object") {
      const messages = Object.values(json.errors).flat().filter(Boolean).join(" ");
      if (messages) return new Error(messages);
    }
  } catch {
    // réponse non-JSON (ex: erreur réseau, HTML d'erreur serveur) - on garde le fallback
  }
  return new Error(fallback);
}