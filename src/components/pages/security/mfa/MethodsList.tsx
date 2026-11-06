import { Mail, Smartphone, KeyRound, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { APIAdminMfaMethod, AdminMfaMethodType } from "@/data/mfa";

interface MfaMethodsListProps {
  methods: APIAdminMfaMethod[];
  defaultMethod: AdminMfaMethodType;
  isSettingDefault: boolean;
  canRemoveEmail: boolean; // TOTP confirmé + au moins un code de secours restant
  onSetDefault: (type: AdminMfaMethodType) => void;
  onDelete: (method: APIAdminMfaMethod) => void;
  onToggleEmail: (enabled: boolean) => void;
  onAddTotp?: () => void; // absent si une application est déjà configurée
  onAddPasskey?: () => void; // absent si le navigateur ne supporte pas WebAuthn
}

const METHOD_ICONS = { email: Mail, totp: Smartphone, passkey: KeyRound } as const;

const formatDateTime = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

const TRANSPORT_LABELS: Record<string, string> = {
  internal: "Cet appareil",
  hybrid: "Téléphone",
  usb: "Clé USB",
  nfc: "NFC",
  ble: "Bluetooth",
};

function describeMethod(m: APIAdminMfaMethod): string {
  const lastUsed = formatDateTime(m.lastUsedAt);
  const usage = lastUsed ? `Dernière utilisation : ${lastUsed}` : "Jamais utilisée";

  if (m.type === "passkey") {
    const where = (m.transports ?? []).map((t) => TRANSPORT_LABELS[t]).filter(Boolean).join(", ");
    return ["Clé d'accès", where, m.backedUp ? "Synchronisée" : "", usage].filter(Boolean).join(" · ");
  }
  return m.hint ?? usage;
}

export function MfaMethodsList({
  methods, defaultMethod, isSettingDefault, canRemoveEmail,
  onSetDefault, onDelete, onToggleEmail, onAddTotp, onAddPasskey,
}: MfaMethodsListProps) {
  const emailMethod = methods.find((m) => m.type === "email");
  const showEmailHelp = !!emailMethod?.enabled && !canRemoveEmail;

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b pb-4">
        <h3 className="font-display text-lg font-semibold">Méthodes de vérification</h3>
        <div className="flex flex-wrap gap-2">
          {onAddTotp && (
            <Button variant="outline" size="sm" onClick={onAddTotp}>
              <Smartphone className="mr-1 h-4 w-4" /> Ajouter une application
            </Button>
          )}
          {onAddPasskey && (
            <Button variant="outline" size="sm" onClick={onAddPasskey}>
              <KeyRound className="mr-1 h-4 w-4" /> Ajouter une clé d'accès
            </Button>
          )}
        </div>
      </div>

      <ul className="space-y-3">
        {methods.map((m) => {
          const isDefault = m.type === defaultMethod;
          const Icon = METHOD_ICONS[m.type] ?? KeyRound;

          return (
            <li key={m.id ?? m.type} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-primary" />
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    {m.label}
                    {isDefault && <Badge variant="secondary">Par défaut</Badge>}
                    {!m.enabled && <Badge variant="outline">Retirée</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {describeMethod(m)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isDefault && m.enabled && (
                  <Button variant="outline" size="sm" disabled={isSettingDefault} onClick={() => onSetDefault(m.type)}>
                    {isSettingDefault && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                    Définir par défaut
                  </Button>
                )}

                {m.type === "email" && (
                  m.enabled ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      disabled={!canRemoveEmail}
                      onClick={() => onToggleEmail(false)}
                    >
                      Retirer
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => onToggleEmail(true)}>
                      Réactiver
                    </Button>
                  )
                )}

                {m.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(m)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" /> Supprimer
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {showEmailHelp && (
        <p className="mt-4 text-xs text-muted-foreground">
          Pour retirer le code par e-mail, configurez d'abord une application d'authentification et gardez au moins un code de secours.
        </p>
      )}
    </div>
  );
}