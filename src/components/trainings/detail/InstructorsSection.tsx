import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Mail, Trash2, UserCheck, UserPlus } from "lucide-react";
import { ConfirmDelete } from "@/components/site/AdminBits";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useTrainingInstructorsList, useAssignAdminTrainingInstructor, useRemoveAdminTrainingInstructorAssignment } from "@/stores/useTrainingInstructorsStore";
import { useAdminInstructorsList } from "@/stores/useInstructorsStore";
import { TRAINING_INSTRUCTOR_ROLE_LABELS } from "@/data/trainingInstructors";
import type { TrainingInstructorRole } from "@/data/trainingInstructors";
import { formatAssignedAt } from "./training-form";

export function TrainingDetailInstructorsSection({ trainingId, mainColor }: { trainingId: string; mainColor: string }) {
  const { assignments, isLoading } = useTrainingInstructorsList(trainingId);
  const { items: allInstructors } = useAdminInstructorsList({ perPage: 100 });
  const assignMutation = useAssignAdminTrainingInstructor();
  const removeMutation = useRemoveAdminTrainingInstructorAssignment();

  const [assignOpen, setAssignOpen] = useState(false);
  const [form, setForm] = useState<{ instructorId: string; role: TrainingInstructorRole }>({ instructorId: "", role: "lead" });
  const [toRemove, setToRemove] = useState<string | null>(null);

  const assignedIds = new Set(assignments.map((a) => a.instructorId));
  const available = allInstructors.filter((i) => !assignedIds.has(i.id) && i.isActive && !i.isBlocked && !i.isPending && !i.needsApproval);

  const submit = () => {
    if (!form.instructorId) return;
    assignMutation.mutate({ trainingId, payload: { instructor_id: form.instructorId, role: form.role } }, {
      onSuccess: () => { toast.success("Formateur assigné"); setAssignOpen(false); setForm({ instructorId: "", role: "lead" }); },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur lors de l'assignation"),
    });
  };

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold"><UserCheck className="h-4 w-4" style={{ color: mainColor }} /> Formateurs assignés</div>
        <Button type="button" size="sm" variant="outline" onClick={() => setAssignOpen(true)}><UserPlus className="mr-1 h-3.5 w-3.5" /> Assigner</Button>
      </div>

      {isLoading ? <div className="text-sm text-muted-foreground">Chargement...</div>
        : assignments.length === 0 ? <p className="text-sm text-muted-foreground">Aucun formateur assigné pour le moment.</p>
          : (
            <div className="space-y-2">
              {assignments.map((a) => (
                <div key={a.assignmentId} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link to="/members/instructors/$id" params={{ id: a.instructorId }} className="truncate font-medium text-primary hover:underline">{a.instructorName}</Link>
                      <span className="inline-flex shrink-0 items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">{TRAINING_INSTRUCTOR_ROLE_LABELS[a.role]}</span>
                      {a.instructorIsBlocked && <span className="inline-flex shrink-0 items-center rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">Bloqué</span>}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" /> {a.instructorEmail}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground/70">Assigné le {formatAssignedAt(a.assignedAt)} par {a.assignedBy}</div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="shrink-0 text-destructive hover:bg-destructive/10"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setToRemove(a.assignmentId); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Assigner un formateur</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Formateur</Label>
              <Select value={form.instructorId} onValueChange={(v) => setForm({ ...form, instructorId: v })}>
                <SelectTrigger><SelectValue placeholder="Choisir un formateur" /></SelectTrigger>
                <SelectContent>{available.map((i) => <SelectItem key={i.id} value={i.id}>{i.name} ({i.email})</SelectItem>)}</SelectContent>
              </Select>
              <p className="mt-1 text-[11px] text-muted-foreground">Seuls les formateurs actifs, non bloqués et sans invitation/approbation en attente sont assignables.</p>
            </div>
            <div>
              <Label>Rôle</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as TrainingInstructorRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Formateur principal</SelectItem>
                  <SelectItem value="assistant">Assistant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Annuler</Button>
            <Button onClick={submit} disabled={!form.instructorId || assignMutation.isPending}>Assigner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!toRemove}
        onOpenChange={(v) => { if (!v) setToRemove(null); }}
        onConfirm={() => {
          if (!toRemove) return;
          removeMutation.mutate({ trainingId, assignmentId: toRemove }, {
            onSuccess: () => { toast.success("Formateur retiré"); setToRemove(null); },
            onError: () => toast.error("Erreur lors du retrait"),
          });
        }}
        title="Retirer ce formateur de la formation ?"
      />
    </div>
  );
}