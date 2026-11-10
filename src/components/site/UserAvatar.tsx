import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/data/community";
import { resolveStorageUrl } from "@/lib/api/file";

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
