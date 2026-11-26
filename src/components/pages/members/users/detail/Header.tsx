import { AlertTriangle, ArrowLeft, Ban, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { APIAdminUserDetail } from "@/data/users";

interface UserDetailHeaderProps {
  user: APIAdminUserDetail;
  isReactivatePending: boolean;
  onBack: () => void;
  onAlert: () => void;
  onBlock: () => void;
  onReactivate: () => void;
}

export function UserDetailHeader({
  user,
  isReactivatePending,
  onBack,
  onAlert,
  onBlock,
  onReactivate,
}: UserDetailHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <Button variant="outline" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Retour
      </Button>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onAlert}>
          <AlertTriangle className="mr-1.5 h-4 w-4 text-amber-500" /> Avertir l'utilisateur
        </Button>
        {user.isBlocked ? (
          <Button size="sm" onClick={onReactivate} disabled={isReactivatePending}>
            <ShieldCheck className="mr-1.5 h-4 w-4" /> Réactiver le compte
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={onBlock}
          >
            <Ban className="mr-1.5 h-4 w-4" /> Bloquer l'accès
          </Button>
        )}
      </div>
    </div>
  );
}
