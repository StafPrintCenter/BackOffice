import { useEffect, useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { AdminAdminInvitePayload, AdminLevel } from "@/data/admins";
import { ADMIN_LEVEL_LABELS } from "@/data/admins";

const schema = z.object({
  first_name: z.string().trim().min(1, "Le prénom est requis"),
  last_name: z.string().trim().min(1, "Le nom est requis"),
  email: z.string().trim().email("E-mail invalide"),
  level: z.enum(["default", "super_admin", "editor"]),
});

type FormValues = z.infer<typeof schema>;

const emptyForm: FormValues = {
  first_name: "",
  last_name: "",
  email: "",
  level: "default",
};

interface AdminInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: AdminAdminInvitePayload) => void;
  isPending: boolean;
}

export function AdminInviteDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: AdminInviteDialogProps) {
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setErrors({});
    }
  }, [open]);

  const handleSubmit = () => {
    const result = schema.safeParse(form);
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        nextErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }
    onSubmit(result.data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inviter un administrateur</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="admin-first-name">Prénom</Label>
              <Input
                id="admin-first-name"
                value={form.first_name}
                onChange={(event) => setForm({ ...form, first_name: event.target.value })}
              />
              {errors.first_name && <p className="mt-1 text-xs text-destructive">{errors.first_name}</p>}
            </div>
            <div>
              <Label htmlFor="admin-last-name">Nom</Label>
              <Input
                id="admin-last-name"
                value={form.last_name}
                onChange={(event) => setForm({ ...form, last_name: event.target.value })}
              />
              {errors.last_name && <p className="mt-1 text-xs text-destructive">{errors.last_name}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="admin-email">E-mail</Label>
            <Input
              id="admin-email"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="admin-level">Niveau</Label>
            <select
              id="admin-level"
              value={form.level}
              onChange={(event) => setForm({ ...form, level: event.target.value as AdminLevel })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {(Object.keys(ADMIN_LEVEL_LABELS) as AdminLevel[]).map((level) => (
                <option key={level} value={level}>{ADMIN_LEVEL_LABELS[level]}</option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            Envoyer l'invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
