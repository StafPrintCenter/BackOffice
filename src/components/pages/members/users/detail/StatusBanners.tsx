import { AlertTriangle } from "lucide-react";
import type { APIAdminUserDetail } from "@/data/users";

interface UserStatusBannersProps {
  user: APIAdminUserDetail;
}

export function UserStatusBanners({ user }: UserStatusBannersProps) {
  if (!user.isBlocked) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="text-sm">
        <p className="font-semibold">Ce compte est actuellement bloqué.</p>
        <p className="mt-0.5 text-xs text-destructive/80">
          Bloqué le {user.blockedAt ? new Date(user.blockedAt).toLocaleString() : "-"}.
          {user.blockedReason && ` Motif : "${user.blockedReason}"`}
        </p>
      </div>
    </div>
  );
}
