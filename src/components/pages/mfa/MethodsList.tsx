import { Mail, Smartphone, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { APIAdminMfaMethod, AdminMfaMethodType } from "@/data/mfa";

interface MfaMethodsListProps {
  methods: APIAdminMfaMethod[];
  defaultMethod: AdminMfaMethodType;
  isSettingDefault: boolean;
  onSetDefault: (type: AdminMfaMethodType) => void;
  onDelete: (method: APIAdminMfaMethod) => void;
  onAddTotp?: () => void; // absent si une application est déjà configurée
}

const formatDateTime = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

export function MfaMethodsList({
  methods, defaultMethod, isSettingDefault, onSetDefault, onDelete, onAddTotp,
}: MfaMethodsListProps) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between border-b pb-4">
        <h3 className="font-display text-lg font-semibold">Méthodes de vérification</h3>
        {onAddTotp && (
          <Button variant="outline" size="sm" onClick={onAddTotp}>
            <Smartphone className="mr-1 h-4 w-4" /> Ajouter une application
          </Button>
        )}
      </div>

      <ul className="space-y-3">
        {methods.map((m) => {
          const isDefault = m.type === defaultMethod;
          const Icon = m.type === "email" ? Mail : Smartphone;
          const lastUsed = formatDateTime(m.lastUsedAt);

          return (
            <li key={m.id ?? m.type} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-primary" />
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {m.label}
                    {isDefault && <Badge variant="secondary">Par défaut</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {m.hint ?? (lastUsed ? `Dernière utilisation : ${lastUsed}` : "Jamais utilisée")}
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
    </div>
  );
}