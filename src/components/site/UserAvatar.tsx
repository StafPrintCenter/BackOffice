import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveStorageUrl } from "@/lib/api/file";

export const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean).slice(0, 2)
    .join("")
    .toUpperCase()
  || "?";

interface UserAvatarProps {
  name: string;
  photo?: string | null;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
}

export function UserAvatar({
  name,
  photo,
  className,
  imageClassName,
  fallbackClassName,
}: UserAvatarProps) {
  const photoUrl = resolveStorageUrl(photo);

  return (
    <Avatar className={className}>
      {photoUrl && <AvatarImage src={photoUrl} alt={name} className={imageClassName} />}
      <AvatarFallback className={fallbackClassName}>{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
