import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useUpdateAdminProfile } from "@/stores/useAccountStore";
import { FilePreviewModal } from "@/components/site";
import { resolveStorageUrl } from "@/lib/api/file";

const schema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis").max(80),
  lastName: z.string().trim().min(1, "Le nom est requis").max(80),
  bio: z.string().trim().max(500, "500 caractères maximum").optional(),
});

const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_SIZE = 2 * 1024 * 1024;

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileEditDialog({ open, onOpenChange }: ProfileEditDialogProps) {
  const { user, setUser } = useAdminAuth();
  const updateProfile = useUpdateAdminProfile();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<{
    url: string;
    mimeType: string;
  } | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setBio(user.bio ?? "");
    setPhoto(null);
    setRemovePhoto(false);
    setPhotoPreview(null);
    setPhotoError("");
    setErrors({});
  }, [open, user]);

  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse({ firstName, lastName, bio });
    const nextErrors: Record<string, string> = {};
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        nextErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    updateProfile.mutate(
      {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        bio: parsed.data.bio ?? "",
        photo: photo ?? undefined,
        removePhoto,
      },
      {
        onSuccess: (profile) => {
          setUser(profile);
          toast.success("Profil mis à jour");
          onOpenChange(false);
        },
        onError: (error) =>
          toast.error(
            error instanceof Error ? error.message : "Erreur lors de la mise à jour du profil.",
          ),
      },
    );
  };

  const selectPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError("Format non supporté (JPG, PNG ou WebP).");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError("La photo ne doit pas dépasser 2 Mo.");
      return;
    }
    setPhoto(file);
    setPhotoError("");
    setRemovePhoto(false);
  };

  const pending = updateProfile.isPending;
  const savedPhoto = resolveStorageUrl(user?.photo);
  const currentPhoto = removePhoto ? null : (preview ?? savedPhoto);
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "A";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier mon profil</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border bg-muted font-semibold">
              {currentPhoto ? (
                <button
                  type="button"
                  className="h-full w-full cursor-zoom-in"
                  onClick={() =>
                    setPhotoPreview({
                      url: currentPhoto,
                      mimeType: photo?.type ?? "image/*",
                    })
                  }
                  aria-label="Aperçu de la photo de profil"
                >
                  <img src={currentPhoto} alt="" className="h-full w-full object-cover" />
                </button>
              ) : (
                initials
              )}
            </div>
            <div className="space-y-2">
              <Input
                type="file"
                accept={ACCEPTED_PHOTO_TYPES.join(",")}
                disabled={pending}
                onChange={selectPhoto}
              />
              {user?.photo && !removePhoto && (
                <button
                  type="button"
                  className="text-xs text-destructive hover:underline"
                  onClick={() => {
                    setPhoto(null);
                    setRemovePhoto(true);
                  }}
                  disabled={pending}
                >
                  Supprimer ma photo actuelle
                </button>
              )}
            </div>
          </div>
          {photoError && <p className="text-xs text-destructive">{photoError}</p>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="admin-first-name">Prénom</Label>
              <Input
                id="admin-first-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                disabled={pending}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-destructive">{errors.firstName}</p>
              )}
            </div>
            <div>
              <Label htmlFor="admin-last-name">Nom</Label>
              <Input
                id="admin-last-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                disabled={pending}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="admin-bio">Biographie / Note personnelle</Label>
            <Textarea
              id="admin-bio"
              rows={4}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              disabled={pending}
            />
            {errors.bio && <p className="mt-1 text-xs text-destructive">{errors.bio}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <FilePreviewModal
        url={open ? photoPreview?.url ?? null : null}
        title={`Photo de profil - ${firstName} ${lastName}`.trim()}
        mimeType={photoPreview?.mimeType}
        onClose={() => setPhotoPreview(null)}
      />
    </Dialog>
  );
}
