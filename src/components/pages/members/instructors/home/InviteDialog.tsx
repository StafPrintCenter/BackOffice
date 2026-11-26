import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminInstructorInvitePayload } from "@/data/instructors";

const schema = z.object({
  firstName: z.string().trim().min(2).max(100),
  lastName: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
});

type FormValues = z.infer<typeof schema>;

const emptyForm: FormValues = { firstName: "", lastName: "", email: "" };

interface InstructorInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: AdminInstructorInvitePayload) => void;
  isPending: boolean;
}

export function InstructorInviteDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: InstructorInviteDialogProps) {
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

    onSubmit({
      first_name: result.data.firstName,
      last_name: result.data.lastName,
      email: result.data.email,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Inviter un instructeur</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="instructor-first-name">Prénom</Label>
            <Input
              id="instructor-first-name"
              value={form.firstName}
              onChange={(event) => setForm({ ...form, firstName: event.target.value })}
            />
            {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName}</p>}
          </div>
          <div>
            <Label htmlFor="instructor-last-name">Nom</Label>
            <Input
              id="instructor-last-name"
              value={form.lastName}
              onChange={(event) => setForm({ ...form, lastName: event.target.value })}
            />
            {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName}</p>}
          </div>
          <div>
            <Label htmlFor="instructor-email">E-mail</Label>
            <Input
              id="instructor-email"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
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
