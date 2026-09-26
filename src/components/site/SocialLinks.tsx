import { SOCIAL_LINKS } from "@/data/socials";
import { cn } from "@/lib/utils";

interface SocialLinksProps {
  className?: string;
  linkClassName?: string;
  iconClassName?: string;
}

export function SocialLinks({
  className,
  linkClassName,
  iconClassName = "size-4",
}: SocialLinksProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {SOCIAL_LINKS.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={cn(
            "rounded-md p-1.5 transition-colors hover:bg-accent text-muted-foreground hover:text-foreground",
            linkClassName
          )}
        >
          <Icon className={iconClassName} />
        </a>
      ))}
    </div>
  );
}