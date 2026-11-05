import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MfaStatusCard } from "@/components/pages/mfa/StatusCard";
import { MfaMethodsList } from "@/components/pages/mfa/MethodsList";
import { MfaRecoveryCodesCard } from "@/components/pages/mfa/RecoveryCodesCard";
import { MfaPasswordDialog } from "@/components/pages/mfa/PasswordDialog";
import { RecoveryCodesDialog } from "@/components/pages/mfa/RecoveryCodesDialog";
import { TotpSetupDialog } from "@/components/pages/mfa/TotpSetupDialog";
import {
  useAdminMfaStatus,
  useEnableAdminMfa,
  useDisableAdminMfa,
  useSetAdminMfaDefault,
  useRegenerateAdminMfaRecoveryCodes,
  useDeleteAdminMfaMethod,
  useSetAdminMfaEmailMethod,
} from "@/stores/useMfaStore";
import type { APIAdminMfaMethod } from "@/data/mfa";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/security")({
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Double authentification | ${SITE.name}` },
      { name: "description", content: "Gérez la double authentification et les codes de secours de votre compte administrateur." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MfaManagePage,
});

type PendingAction =
  | { kind: "enable" }
  | { kind: "disable" }
  | { kind: "regenerate" }
  | { kind: "removeEmail" }
  | { kind: "restoreEmail" }
  | { kind: "deleteMethod"; method: APIAdminMfaMethod };

const ACTION_COPY = {
  enable: {
    title: "Activer la double authentification",
    description: "Confirmez votre mot de passe pour activer la vérification en deux étapes.",
    confirmLabel: "Activer",
    destructive: false,
  },
  disable: {
    title: "Désactiver la double authentification",
    description: "Votre compte sera moins protégé. Confirmez votre mot de passe pour continuer.",
    confirmLabel: "Désactiver",
    destructive: true,
  },
  regenerate: {
    title: "Régénérer les codes de secours",
    description: "Les anciens codes seront invalidés. Confirmez votre mot de passe pour continuer.",
    confirmLabel: "Générer",
    destructive: false,
  },
  deleteMethod: {
    title: "Supprimer cette méthode",
    description: "L'e-mail redeviendra votre méthode par défaut. Confirmez votre mot de passe pour continuer.",
    confirmLabel: "Supprimer",
    destructive: true,
  },
  removeEmail: {
    title: "Retirer le code par e-mail",
    description: "Seuls votre application d'authentification et vos codes de secours serviront à vous connecter. Confirmez votre mot de passe.",
    confirmLabel: "Retirer",
    destructive: true,
  },
  restoreEmail: {
    title: "Réactiver le code par e-mail",
    description: "Confirmez votre mot de passe pour autoriser à nouveau le code reçu par e-mail.",
    confirmLabel: "Réactiver",
    destructive: false,
  },
} as const;

function MfaManagePage() {
  const { status, isLoading, isError, refetch } = useAdminMfaStatus();

  const enableMfa = useEnableAdminMfa();
  const disableMfa = useDisableAdminMfa();
  const setDefault = useSetAdminMfaDefault();
  const regenerate = useRegenerateAdminMfaRecoveryCodes();
  const deleteMethod = useDeleteAdminMfaMethod();
  const setEmailMethod = useSetAdminMfaEmailMethod();

  const [action, setAction] = useState<PendingAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [totpOpen, setTotpOpen] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [codesOpen, setCodesOpen] = useState(false);

  const openAction = (next: PendingAction) => {
    setActionError(null);
    setAction(next);
  };

  const feedback = (successMessage: string, after?: () => void) => ({
    onSuccess: () => {
      toast.success(successMessage);
      setAction(null);
      after?.();
    },
    onError: (e: Error) => setActionError(e.message),
  });

  const handleConfirm = (password: string) => {
    if (!action) return;
    switch (action.kind) {
      case "enable":
        enableMfa.mutate({ password }, feedback("Double authentification activée"));
        break;
      case "disable":
        disableMfa.mutate({ password }, feedback("Double authentification désactivée"));
        break;
      case "regenerate":
        regenerate.mutate({ password }, {
          onSuccess: (res) => {
            setAction(null);
            setRecoveryCodes(res.recoveryCodes);
            setCodesOpen(true);
          },
          onError: (e) => setActionError(e.message),
        });
        break;
      case "deleteMethod":
        deleteMethod.mutate({ id: action.method.id as string, password }, feedback("Méthode supprimée"));
        break;
      case "removeEmail":
        setEmailMethod.mutate({ enabled: false, password }, feedback("Code par e-mail retiré"));
        break;
      case "restoreEmail":
        setEmailMethod.mutate({ enabled: true, password }, feedback("Code par e-mail réactivé"));
        break;
    }
  };

  const handleSetDefault = (method: "email" | "totp") => {
    setDefault.mutate({ method }, {
      onSuccess: () => toast.success("Méthode par défaut mise à jour"),
      onError: (e) => toast.error(e.message),
    });
  };

  const isActionPending =
    enableMfa.isPending || disableMfa.isPending || regenerate.isPending ||
    deleteMethod.isPending || setEmailMethod.isPending;
  const copy = action ? ACTION_COPY[action.kind] : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement...
      </div>
    );
  }

  if (isError || !status) {
    return (
      <div className="rounded-2xl border p-8 text-center text-muted-foreground">
        Impossible de charger les paramètres de sécurité.
        <div className="mt-4"><Button variant="outline" size="sm" onClick={() => refetch()}>Réessayer</Button></div>
      </div>
    );
  }

  const hasTotp = status.methods.some((method) => method.type === "totp" && method.enabled);

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Sécurité du compte</h1>
        <p className="text-sm text-muted-foreground">Gérez la double authentification et vos codes de secours.</p>
      </div>

      <div className="max-w-3xl space-y-6">
        <MfaStatusCard
          status={status}
          onEnable={() => openAction({ kind: "enable" })}
          onDisable={() => openAction({ kind: "disable" })}
        />

        {status.enabled && (
          <>
            <MfaMethodsList
              methods={status.methods}
              defaultMethod={status.defaultMethod}
              isSettingDefault={setDefault.isPending}
              onSetDefault={handleSetDefault}
              onDelete={(method) => openAction({ kind: "deleteMethod", method })}
              onAddTotp={hasTotp ? undefined : () => setTotpOpen(true)}
              canRemoveEmail={hasTotp && status.recoveryCodesRemaining > 0}
              onToggleEmail={(enabled) => openAction({ kind: enabled ? "restoreEmail" : "removeEmail" })}
            />
            <MfaRecoveryCodesCard
              remaining={status.recoveryCodesRemaining}
              generatedAt={status.recoveryCodesGeneratedAt}
              onRegenerate={() => openAction({ kind: "regenerate" })}
            />
          </>
        )}
      </div>

      {copy && (
        <MfaPasswordDialog
          open={!!action}
          onOpenChange={(open) => !open && setAction(null)}
          title={copy.title}
          description={copy.description}
          confirmLabel={copy.confirmLabel}
          destructive={copy.destructive}
          isPending={isActionPending}
          errorMessage={actionError}
          onConfirm={handleConfirm}
        />
      )}

      <TotpSetupDialog open={totpOpen} onOpenChange={setTotpOpen} />
      <RecoveryCodesDialog open={codesOpen} onOpenChange={setCodesOpen} codes={recoveryCodes} />
    </>
  );
}