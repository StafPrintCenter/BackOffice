import type {
  APIAdminPasskeyCreationOptions,
  APIAdminPasskeyRequestOptions,
  APIPasskeyDescriptor,
} from "@/data/passkeys";

export class PasskeyError extends Error { }

export function isWebAuthnSupported(): boolean {
  return typeof window !== "undefined" && !!window.PublicKeyCredential && !!navigator.credentials;
}

export function base64UrlToBuffer(value: string): ArrayBuffer {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const toDescriptors = (list?: APIPasskeyDescriptor[]): PublicKeyCredentialDescriptor[] | undefined =>
  list?.map((d) => ({
    type: "public-key",
    id: base64UrlToBuffer(d.id),
    transports: d.transports as AuthenticatorTransport[] | undefined,
  }));

function toPasskeyError(err: unknown): PasskeyError {
  if (err instanceof PasskeyError) return err;
  if (err instanceof DOMException) {
    switch (err.name) {
      case "NotAllowedError":
        return new PasskeyError("L'opération a été annulée ou a expiré. Réessayez.");
      case "InvalidStateError":
        return new PasskeyError("Cette clé d'accès est déjà enregistrée sur votre compte.");
      case "SecurityError":
        return new PasskeyError("Le domaine du site ne correspond pas à celui des clés d'accès.");
      case "NotSupportedError":
        return new PasskeyError("Cet appareil ne prend pas en charge ce type de clé d'accès.");
    }
  }
  return new PasskeyError(err instanceof Error ? err.message : "Erreur lors de l'utilisation de la clé d'accès.");
}

/** Enregistrement : retourne le JSON à envoyer dans le champ `credential` */
export async function createPasskeyCredential(options: APIAdminPasskeyCreationOptions): Promise<string> {
  if (!isWebAuthnSupported()) throw new PasskeyError("Ce navigateur ne prend pas en charge les clés d'accès.");

  try {
    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge: base64UrlToBuffer(options.challenge),
        rp: options.rp,
        user: {
          id: base64UrlToBuffer(options.user.id),
          name: options.user.name,
          displayName: options.user.displayName,
        },
        pubKeyCredParams: options.pubKeyCredParams,
        timeout: options.timeout,
        attestation: options.attestation,
        excludeCredentials: toDescriptors(options.excludeCredentials),
        authenticatorSelection: options.authenticatorSelection,
      },
    })) as PublicKeyCredential | null;

    if (!credential) throw new PasskeyError("Aucune clé d'accès n'a été créée.");

    const response = credential.response as AuthenticatorAttestationResponse;
    return JSON.stringify({
      id: credential.id,
      rawId: bufferToBase64Url(credential.rawId),
      type: credential.type,
      authenticatorAttachment: credential.authenticatorAttachment ?? null,
      clientExtensionResults: credential.getClientExtensionResults(),
      response: {
        clientDataJSON: bufferToBase64Url(response.clientDataJSON),
        attestationObject: bufferToBase64Url(response.attestationObject),
        transports: response.getTransports?.() ?? [],
      },
    });
  } catch (err) {
    throw toPasskeyError(err);
  }
}

/** Connexion : retourne le JSON à envoyer dans le champ `code` (method=passkey) */
export async function getPasskeyAssertion(options: APIAdminPasskeyRequestOptions): Promise<string> {
  if (!isWebAuthnSupported()) throw new PasskeyError("Ce navigateur ne prend pas en charge les clés d'accès.");

  try {
    const credential = (await navigator.credentials.get({
      publicKey: {
        challenge: base64UrlToBuffer(options.challenge),
        rpId: options.rpId,
        timeout: options.timeout,
        allowCredentials: toDescriptors(options.allowCredentials),
        userVerification: options.userVerification,
      },
    })) as PublicKeyCredential | null;

    if (!credential) throw new PasskeyError("Aucune clé d'accès n'a été utilisée.");

    const response = credential.response as AuthenticatorAssertionResponse;
    return JSON.stringify({
      id: credential.id,
      rawId: bufferToBase64Url(credential.rawId),
      type: credential.type,
      authenticatorAttachment: credential.authenticatorAttachment ?? null,
      clientExtensionResults: credential.getClientExtensionResults(),
      response: {
        clientDataJSON: bufferToBase64Url(response.clientDataJSON),
        authenticatorData: bufferToBase64Url(response.authenticatorData),
        signature: bufferToBase64Url(response.signature),
        userHandle: response.userHandle ? bufferToBase64Url(response.userHandle) : null,
      },
    });
  } catch (err) {
    throw toPasskeyError(err);
  }
}