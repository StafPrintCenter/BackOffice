import { AlertTriangle, Info, MailWarning } from "lucide-react";
import type { APIAdminAdminDetail } from "@/data/admins";

interface AdminStatusBannersProps {
  admin: APIAdminAdminDetail;
  isSelf: boolean;
}

export function AdminStatusBanners({ admin, isSelf }: AdminStatusBannersProps) {
  const isInviteRevoked = Boolean(admin.invitationRevokedAt);

  return (
    <div className="space-y-4">
      {isSelf && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-400">
          <Info className="h-5 w-5 shrink-0" />
          <p className="text-sm">
            C'est votre propre compte : vous ne pouvez pas vous alerter ni vous bloquer vous-même.
          </p>
        </div>
      )}

      {admin.isPending && (
        <div
          className={[
            "flex items-start gap-3 rounded-xl border p-4",
            isInviteRevoked
              ? "border-destructive/20 bg-destructive/10 text-destructive"
              : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
          ].join(" ")}
        >
          <MailWarning className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">
              {isInviteRevoked
                ? "Cette invitation a été révoquée."
                : "Cette invitation n'a pas encore été acceptée."}
            </p>
            <p className="mt-0.5 text-xs opacity-80">
              Invitée le {admin.invitedAt ? new Date(admin.invitedAt).toLocaleString("fr-FR") : "-"} par{" "}
              {admin.invitedBy || "-"}.
              {isInviteRevoked &&
                admin.invitationRevokedAt &&
                ` Révoquée le ${new Date(admin.invitationRevokedAt).toLocaleString("fr-FR")}.`}
              {isInviteRevoked && " Vous pouvez la renvoyer pour réactiver le lien d'invitation."}
            </p>
          </div>
        </div>
      )}

      {admin.isBlocked && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Ce compte administrateur est actuellement bloqué.</p>
            <p className="mt-0.5 text-xs text-destructive/80">
              Bloqué le {admin.blockedAt ? new Date(admin.blockedAt).toLocaleString("fr-FR") : "-"}.
              {admin.blockedReason && ` Motif : "${admin.blockedReason}"`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
