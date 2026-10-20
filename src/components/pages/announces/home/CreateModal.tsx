import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCreateAdminAnnouncement } from "@/stores/useAnnouncementsStore";
import type { AdminAnnouncementPayload, AnnouncementType, AnnouncementPosition, AnnouncementStyle } from "@/data/announcements";
import { ANNOUNCEMENT_TYPE_LABELS, ANNOUNCEMENT_POSITION_LABELS, ANNOUNCEMENT_STYLE_LABELS } from "@/data/announcements";
import { AnnouncementTargetPagesInput } from "./TargetPagesInput";
import { AnnouncementActionForm } from "./ActionForm";

const schema = z.object({
  type: z.enum(["banner", "popup", "toast", "modal"]),
  position: z.enum(["top", "bottom", "top-left", "top-right", "bottom-left", "bottom-right", "center"]),
  style: z.enum(["info", "success", "warning", "danger", "neutral"]).optional(),
  title: z.string().trim().min(2).max(255),
  message: z.string().trim().min(2).max(2000),
  icon: z.string().trim().max(100).optional(),
  isClosable: z.boolean(),
  priority: z.number().int().optional(),
  isEnabled: z.boolean(),
  publishedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  targetPages: z.array(z.string().trim()),
  actionLabel: z.string().optional(),
  actionType: z.enum(["link", "route", "dismiss"]).optional(),
  actionUrl: z.string().optional(),
  actionTarget: z.enum(["_self", "_blank"]).optional(),
});

type FormValues = z.infer<typeof schema>;

const empty: FormValues = {
  type: "banner",
  position: "top",
  style: undefined,
  title: "",
  message: "",
  icon: "",
  isClosable: true,
  priority: undefined,
  isEnabled: true,
  publishedAt: "",
  expiresAt: "",
  targetPages: [""],
  actionLabel: "",
  actionType: "link",
  actionUrl: "",
  actionTarget: "_self",
};

interface AnnouncementCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnnouncementCreateModal({ open, onOpenChange }: AnnouncementCreateModalProps) {
  const createMutation = useCreateAdminAnnouncement();
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const cleaned: FormValues = {
      ...form,
      targetPages: form.targetPages.filter((p) => p.trim()),
    };

    const parsed = schema.safeParse(cleaned);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }

    const v = parsed.data;
    const action = v.actionLabel?.trim()
      ? JSON.stringify({
        label: v.actionLabel.trim(),
        type: v.actionType ?? "link",
        url: v.actionUrl?.trim() || undefined,
        target: v.actionTarget ?? "_self",
      })
      : undefined;

    const payload: AdminAnnouncementPayload = {
      type: v.type as AnnouncementType,
      position: v.position as AnnouncementPosition,
      style: v.style as AnnouncementStyle | undefined,
      title: v.title,
      message: v.message,
      icon: v.icon || undefined,
      action,
      is_closable: v.isClosable,
      priority: v.priority,
      is_enabled: v.isEnabled,
      published_at: v.publishedAt ? new Date(v.publishedAt).toISOString() : undefined,
      expires_at: v.expiresAt ? new Date(v.expiresAt).toISOString() : undefined,
      target_pages: v.targetPages.length > 0 ? v.targetPages : undefined,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Annonce créée");
        setForm(empty);
        setErrors({});
        onOpenChange(false);
      },
      onError: () => toast.error("Erreur lors de la création"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nouvelle annonce</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Type</Label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as AnnouncementType })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {Object.entries(ANNOUNCEMENT_TYPE_LABELS).map(([k, l]) => (<option key={k} value={k}>{l}</option>))}
              </select>
            </div>
            <div>
              <Label>Position</Label>
              <select
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value as AnnouncementPosition })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {Object.entries(ANNOUNCEMENT_POSITION_LABELS).map(([k, l]) => (<option key={k} value={k}>{l}</option>))}
              </select>
            </div>
            <div>
              <Label>Style</Label>
              <select
                value={form.style ?? ""}
                onChange={(e) => setForm({ ...form, style: (e.target.value || undefined) as AnnouncementStyle | undefined })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">- Aucun -</option>
                {Object.entries(ANNOUNCEMENT_STYLE_LABELS).map(([k, l]) => (<option key={k} value={k}>{l}</option>))}
              </select>
            </div>
          </div>

          <div>
            <Label>Titre</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label>Message</Label>
            <Textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Icône (optionnel)</Label>
              <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Ex : megaphone" />
            </div>
            <div>
              <Label>Priorité (optionnel)</Label>
              <Input
                type="number"
                value={form.priority ?? ""}
                onChange={(e) => setForm({ ...form, priority: e.target.value === "" ? undefined : Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Publiée le (optionnel)</Label>
              <Input type="datetime-local" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} />
            </div>
            <div>
              <Label>Expire le (optionnel)</Label>
              <Input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-3">
              <Label className="cursor-pointer">Fermable</Label>
              <Switch checked={form.isClosable} onCheckedChange={(v) => setForm({ ...form, isClosable: v })} />
            </div>
            <div className="flex items-center gap-3">
              <Label className="cursor-pointer">Activée</Label>
              <Switch checked={form.isEnabled} onCheckedChange={(v) => setForm({ ...form, isEnabled: v })} />
            </div>
          </div>

          <AnnouncementTargetPagesInput
            value={form.targetPages}
            onChange={(targetPages) => setForm({ ...form, targetPages })}
          />

          <AnnouncementActionForm
            value={{
              actionLabel: form.actionLabel,
              actionType: form.actionType,
              actionUrl: form.actionUrl,
              actionTarget: form.actionTarget,
            }}
            onChange={(action) => setForm({ ...form, ...action })}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={createMutation.isPending}>Créer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}