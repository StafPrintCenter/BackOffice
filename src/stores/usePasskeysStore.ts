import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MFA_KEY, buildForm, mfaRequest } from "@/stores/useMfaStore";
import type {
  APIAdminPasskeyCreationOptions,
  APIAdminPasskeyRegisterResponse,
  AdminPasskeyOptionsPayload,
  AdminPasskeyRegisterPayload,
} from "@/data/passkeys";

export const fetchAdminPasskeyOptions = (payload: AdminPasskeyOptionsPayload) =>
  mfaRequest<APIAdminPasskeyCreationOptions>(
    "/passkeys/options",
    "Impossible de démarrer l'enregistrement de la clé d'accès.",
    { method: "POST", body: buildForm({ password: payload.password }) }
  );

export const registerAdminPasskey = (payload: AdminPasskeyRegisterPayload) => {
  const fields: Record<string, string> = {
    credential: payload.credential,
    makeDefault: payload.makeDefault ? "1" : "0",
  };
  if (payload.name) fields.name = payload.name;

  return mfaRequest<APIAdminPasskeyRegisterResponse>(
    "/passkeys/register",
    "Impossible d'enregistrer la clé d'accès.",
    { method: "POST", body: buildForm(fields) }
  );
};

export function useAdminPasskeyOptions() {
  return useMutation({ mutationFn: fetchAdminPasskeyOptions });
}

/** Le résultat complet (avec `recoveryCodes`) est renvoyé à l'appelant ; le cache ne garde que l'état MFA */
export function useRegisterAdminPasskey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: registerAdminPasskey,
    onSuccess: ({ recoveryCodes: _recoveryCodes, ...status }) => qc.setQueryData(MFA_KEY, status),
  });
}