import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck, ShieldOff, ShieldAlert, Mail, Smartphone, KeyRound, Trash2, Star, Copy, Download, Loader2, Eye, EyeOff, Plus, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/site";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  useAdminMfaStatus, useEnableAdminMfa, useDisableAdminMfa, useSetAdminMfaDefaultMethod,
  useRegenerateAdminMfaRecoveryCodes, useSetupAdminMfaTotp, useConfirmAdminMfaTotp,
  useDeleteAdminMfaMethod,
} from "@/stores/useMfaStore";
import type { APIAdminMfaMethod, APIAdminMfaTotpSetup } from "@/data/mfa";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/mfa-manage")({
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Double authentification | ${SITE.name}` },
      { name: "description", content: "Gérez la double authentification, les méthodes de vérification et les codes de secours de votre compte." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MfaManagePage,
});

const passwordSchema = z.object({ password: z.string().min(1, "Le mot de passe est requis") });
const codeSchema = z.object({ code: z.string().trim().regex(/^\d{6}$/, "Le code contient 6 chiffres") });

const formatDateTime = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

type PendingAction =
  | { kind: "enable" }
  | { kind: "disable" }
  | { kind: "regenerate" }
  | { kind: "setup" }
  | { kind: "delete"; method: APIAdminMfaMethod };

function MfaManagePage() {
  const { status, isLoading, isError, refetch } = useAdminMfaStatus();

  const enableMutation = useEnableAdminMfa();
  const disableMutation = useDisableAdminMfa();
  const defaultMutation = useSetAdminMfaDefaultMethod();
  const regenerateMutation = useRegenerateAdminMfaRecoveryCodes();
  const setupMutation = useSetupAdminMfaTotp();
  const deleteMutation = useDeleteAdminMfaMethod();

  const [action, setAction] = useState<PendingAction | null>(null);
  const [totpSetup, setTotpSetup] = useState<APIAdminMfaTotpSetup | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);

  // Configuration de la boîte "mot de passe" selon l'action en cours
  const actionConfig = (() => {
    if (!action) return null;
    switch (action.kind) {
      case "enable":
        return {
          title: "Activer la double authentification",
          description: "Confirmez votre mot de passe pour activer la vérification en deux étapes.",
          confirmLabel: "Activer",
          destructive: false,
          run: async (password: string) => {
            await enableMutation.mutateAsync({ password });
            toast.success("Double authentification activée");
          },
        };
      case "disable":
        return {
          title: "Désactiver la double authentification",
          description: "Votre compte sera protégé uniquement par votre mot de passe. Confirmez avec votre mot de passe.",
          confirmLabel: "Désactiver",
          destructive: true,
          run: async (password: string) => {
            await disableMutation.mutateAsync({ password });
            toast.success("Double authentification désactivée");
          },
        };
      case "regenerate":
        return {
          title: "Générer de nouveaux codes de secours",
          description: "Les nouveaux codes remplacent les précédents. Confirmez avec votre mot de passe.",
          confirmLabel: "Générer",
          destructive: false,
          run: async (password: string) => {
            const res = await regenerateMutation.mutateAsync({ password });
            setRecoveryCodes(res.recoveryCodes);
          },
        };
      case "setup":
        return {
          title: "Configurer une application d'authentification",
          description: "Confirmez votre mot de passe pour afficher le QR code à scanner.",
          confirmLabel: "Continuer",
          destructive: false,
          run: async (password: string) => {
            const res = await setupMutation.mutateAsync({ password });
            setTotpSetup(res);
          },
        };
      case "delete":
        return {
          title: `Supprimer « ${action.method.label} »`,
          description: "Cette méthode ne pourra plus être utilisée pour vous connecter. Confirmez avec votre mot de passe.",
          confirmLabel: "Supprimer",
          destructive: true,
          run: async (password: string) => {
            await deleteMutation.mutateAsync({ id: action.method.id as string, password });
            toast.success("Méthode supprimée");
          },
        };
    }
  })();

  const onSetDefault = (method: APIAdminMfaMethod) => {
    defaultMutation.mutate(
      { method: method.type },
      {
        onSuccess: () => toast.success(`« ${method.label} » est maintenant la méthode par défaut`),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors du changement de méthode"),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement...
      </div>
    );
  }

  if (isError || !status) {
    return (
      <>
        <PageHeader title="Double authentification" description="Renforcez la sécurité de votre compte." />
        <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Impossible de charger l'état de la double authentification.
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-1 h-4 w-4" /> Réessayer
            </Button>
          </div>
        </div>
      </>
    );
  }

  const hasTotp = status.methods.some((m) => m.type === "totp");
  const noRecoveryCodes = status.recoveryCodesRemaining === 0;
  const lowRecoveryCodes = !noRecoveryCodes && status.recoveryCodesRemaining <= 2;
  const generatedAt = formatDateTime(status.recoveryCodesGeneratedAt);

  return (
    <>
      <PageHeader
        title="Double authentification"
        description="Protégez votre compte avec une seconde vérification à chaque connexion."
      />

      <div className="max-w-3xl space-y-6">
        {/* ---------------- État global ---------------- */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${status.enabled ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                  }`}
              >
                {status.enabled ? <ShieldCheck className="h-6 w-6" /> : <ShieldOff className="h-6 w-6" />}
              </div>
              <div>
                <div className="font-display text-lg font-semibold">
                  {status.enabled ? "Double authentification activée" : "Double authentification désactivée"}
                </div>
                <p className="text-sm text-muted-foreground">
                  {status.enabled
                    ? "Un code vous est demandé en plus de votre mot de passe à chaque connexion."
                    : "Activez-la pour sécuriser votre compte avec un second facteur."}
                </p>
              </div>
            </div>

            {status.enabled ? (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                disabled={status.enforced}
                onClick={() => setAction({ kind: "disable" })}
              >
                Désactiver
              </Button>
            ) : (
              <Button size="sm" onClick={() => setAction({ kind: "enable" })}>
                Activer
              </Button>
            )}
          </div>

          {status.enforced && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              La double authentification est imposée sur ce compte : elle ne peut pas être désactivée.
            </div>
          )}
        </div>

        {/* ---------------- Méthodes ---------------- */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-semibold">Méthodes de vérification</h3>
            </div>
            {!hasTotp && (
              <Button variant="outline" size="sm" onClick={() => setAction({ kind: "setup" })}>
                <Plus className="mr-1 h-4 w-4" /> Application d'authentification
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {status.methods.map((m) => {
              const isDefault = m.type === status.defaultMethod;
              const lastUsed = formatDateTime(m.lastUsedAt);
              const Icon = m.type === "email" ? Mail : Smartphone;
              const settingThis = defaultMutation.isPending && defaultMutation.variables?.method === m.type;

              return (
                <div
                  key={`${m.type}-${m.id ?? "default"}`}
                  className={`flex flex-wrap items-center gap-3 rounded-xl border p-4 ${isDefault ? "border-primary/30 bg-primary/5" : ""
                    }`}
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{m.label}</span>
                      {isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          <Star className="h-3 w-3" /> Par défaut
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {m.hint && <span>{m.hint}</span>}
                      {m.hint && lastUsed && " · "}
                      {lastUsed && <span>Dernière utilisation : {lastUsed}</span>}
                      {!m.hint && !lastUsed && <span>Jamais utilisée</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isDefault && m.enabled && (
                      <Button variant="outline" size="sm" disabled={defaultMutation.isPending} onClick={() => onSetDefault(m)}>
                        {settingThis && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
                        Par défaut
                      </Button>
                    )}
                    {m.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setAction({ kind: "delete", method: m })}
                        aria-label={`Supprimer ${m.label}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------------- Codes de secours ---------------- */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-semibold">Codes de secours</h3>
            </div>
            <Button variant="outline" size="sm" onClick={() => setAction({ kind: "regenerate" })}>
              <RefreshCw className="mr-1 h-4 w-4" /> {noRecoveryCodes ? "Générer" : "Régénérer"}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            À utiliser si vous n'avez plus accès à votre application ou à votre boîte mail. Chaque code ne sert qu'une fois.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            <span>
              <span className="font-semibold">{status.recoveryCodesRemaining}</span> code
              {status.recoveryCodesRemaining > 1 ? "s" : ""} restant{status.recoveryCodesRemaining > 1 ? "s" : ""}
            </span>
            {generatedAt && <span className="text-xs text-muted-foreground">Générés le {generatedAt}</span>}
          </div>

          {(noRecoveryCodes || lowRecoveryCodes) && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              {noRecoveryCodes
                ? "Vous n'avez aucun code de secours. Générez-en pour ne pas perdre l'accès à votre compte."
                : "Il vous reste peu de codes de secours. Pensez à en générer de nouveaux."}
            </div>
          )}
        </div>
      </div>

      {/* ---------------- Dialogues ---------------- */}
      <PasswordConfirmDialog
        open={!!action}
        onOpenChange={(v) => { if (!v) setAction(null); }}
        config={actionConfig}
      />

      <TotpSetupDialog setup={totpSetup} onClose={() => setTotpSetup(null)} />

      <RecoveryCodesDialog codes={recoveryCodes} onClose={() => setRecoveryCodes(null)} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Confirmation par mot de passe (réutilisée par toutes les actions)         */
/* -------------------------------------------------------------------------- */

function PasswordConfirmDialog({
  open,
  onOpenChange,
  config,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  config: {
    title: string;
    description: string;
    confirmLabel: string;
    destructive: boolean;
    run: (password: string) => Promise<void>;
  } | null;
}) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setShow(false);
      setError("");
      setPending(false);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    const parsed = passwordSchema.safeParse({ password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Le mot de passe est requis");
      return;
    }
    setError("");
    setPending(true);
    try {
      await config.run(parsed.data.password);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!pending) onOpenChange(v); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{config?.title}</DialogTitle>
          <DialogDescription>{config?.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="mfa-password">Mot de passe actuel</Label>
            <div className="relative mt-1.5">
              <Input
                id="mfa-password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="pr-10"
                disabled={pending}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Annuler
            </Button>
            <Button type="submit" variant={config?.destructive ? "destructive" : "default"} disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {config?.confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  TOTP 2/2 : QR code + code à 6 chiffres                                    */
/* -------------------------------------------------------------------------- */

function TotpSetupDialog({ setup, onClose }: { setup: APIAdminMfaTotpSetup | null; onClose: () => void }) {
  const confirmMutation = useConfirmAdminMfaTotp();

  const [code, setCode] = useState("");
  const [makeDefault, setMakeDefault] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!setup) {
      setCode("");
      setMakeDefault(true);
      setError("");
    }
  }, [setup]);

  const copySecret = async () => {
    if (!setup) return;
    try {
      await navigator.clipboard.writeText(setup.secret);
      toast.success("Clé copiée");
    } catch {
      toast.error("Impossible de copier la clé");
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = codeSchema.safeParse({ code });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Code invalide");
      return;
    }
    setError("");

    confirmMutation.mutate(
      { code: parsed.data.code, makeDefault },
      {
        onSuccess: () => {
          toast.success("Application d'authentification configurée");
          onClose();
        },
        onError: (err) => setError(err instanceof Error ? err.message : "Code invalide ou expiré"),
      },
    );
  };

  return (
    <Dialog open={!!setup} onOpenChange={(v) => { if (!v && !confirmMutation.isPending) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Scanner le QR code</DialogTitle>
          <DialogDescription>
            Scannez-le avec votre application d'authentification, puis saisissez le code à 6 chiffres affiché.
          </DialogDescription>
        </DialogHeader>

        {setup && (
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="flex justify-center">
              <div className="rounded-xl border bg-white p-3">
                <QRCodeSVG value={setup.otpauthUri} size={176} />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Ou saisissez cette clé manuellement</Label>
              <div className="mt-1.5 flex items-center gap-2">
                <code className="flex-1 break-all rounded-lg border bg-muted/30 px-3 py-2 font-mono text-xs">
                  {setup.secret.match(/.{1,4}/g)?.join(" ")}
                </code>
                <Button type="button" variant="outline" size="sm" onClick={copySecret} aria-label="Copier la clé">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="totp-code">Code de l'application</Label>
              <Input
                id="totp-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="mt-1.5 text-center font-mono text-lg tracking-[0.5em]"
                disabled={confirmMutation.isPending}
              />
              {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="totp-default" className="cursor-pointer">Définir comme méthode par défaut</Label>
              <Switch id="totp-default" checked={makeDefault} onCheckedChange={setMakeDefault} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={confirmMutation.isPending}>
                Annuler
              </Button>
              <Button type="submit" disabled={confirmMutation.isPending}>
                {confirmMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Vérification...</>
                ) : (
                  "Confirmer"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Codes de secours : affichés une seule fois                                */
/* -------------------------------------------------------------------------- */

function RecoveryCodesDialog({ codes, onClose }: { codes: string[] | null; onClose: () => void }) {
  const copyAll = async () => {
    if (!codes) return;
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      toast.success("Codes copiés");
    } catch {
      toast.error("Impossible de copier les codes");
    }
  };

  const download = () => {
    if (!codes) return;
    const blob = new Blob([`Codes de secours - ${SITE.name}\n\n${codes.join("\n")}\n`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "codes-de-secours.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={!!codes} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Vos codes de secours</DialogTitle>
          <DialogDescription>
            Conservez-les en lieu sûr. Ils ne seront plus affichés après la fermeture de cette fenêtre.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          {codes?.map((c) => (
            <code key={c} className="rounded-lg border bg-muted/30 px-3 py-2 text-center font-mono text-sm">
              {c}
            </code>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={copyAll}>
              <Copy className="mr-1 h-4 w-4" /> Copier
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={download}>
              <Download className="mr-1 h-4 w-4" /> Télécharger
            </Button>
          </div>
          <Button onClick={onClose}>J'ai conservé ces codes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}