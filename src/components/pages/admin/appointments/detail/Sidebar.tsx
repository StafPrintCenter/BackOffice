import { Loader2, Pencil, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type AppointmentStatus } from "@/data/appointments";
import { AppointmentBadge } from "../shared/Badge";

interface AppointmentSidebarProps {
  currentStatus: AppointmentStatus;
  adminNotes?: string | null;
  isEditing: boolean;
  status: AppointmentStatus;
  notes: string;
  isPending: boolean;
  onEditToggle: (editing: boolean) => void;
  onStatusChange: (status: AppointmentStatus) => void;
  onNotesChange: (notes: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function AppointmentSidebar({
  currentStatus,
  adminNotes,
  isEditing,
  status,
  notes,
  isPending,
  onEditToggle,
  onStatusChange,
  onNotesChange,
  onSave,
  onCancel,
}: AppointmentSidebarProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border bg-card p-6">
        <div className="flex items-center justify-between border-b pb-3">
          <span className="font-display font-semibold">Suivi du rendez-vous</span>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={() => onEditToggle(true)}>
              <Pencil className="h-4 w-4 mr-1" /> Modifier
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Statut actuel</Label>
            {isEditing ? (
              <Select value={status} onValueChange={(v) => onStatusChange(v as AppointmentStatus)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="confirmed">Confirmé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="mt-1">
                <AppointmentBadge status={currentStatus} />
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Notes internes admin</Label>
            {isEditing ? (
              <Textarea
                rows={6}
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Ajouter des notes privées sur le traitement..."
                className="mt-1 text-xs"
              />
            ) : (
              <div className="mt-1 rounded-xl border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {adminNotes || "Aucune note enregistrée."}
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="flex-1" onClick={onSave} disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" /> Enregistrer</>}
              </Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={onCancel}>
                <X className="h-4 w-4 mr-1" /> Annuler
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}