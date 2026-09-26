import { FacebookIcon, InstagramIcon, LinkedinIcon, WhatsAppIcon, XIcon } from "@/components/site/icons";

export const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://linkedin.com/company/stafprintcenter", Icon: LinkedinIcon },
  { label: "Facebook", href: "https://web.facebook.com/StafPrintCenter", Icon: FacebookIcon },
  { label: "Instagram", href: "https://www.instagram.com/stafprintcenter/", Icon: InstagramIcon },
  { label: "X", href: "https://x.com/stafprintcenter", Icon: XIcon },
  { label: "WhatsApp", href: "https://wa.me/2290160300607", Icon: WhatsAppIcon },
] as const;