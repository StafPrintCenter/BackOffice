import { FacebookIcon, InstagramIcon, LinkedinIcon, WhatsAppIcon, XIcon, TiktokIcon } from "@/components/site/icons";
import { Globe } from "lucide-react";

export const SOCIAL_LINKS = [
  { label: "Site web", href: "https://stafprint.com", Icon: Globe },
  { label: "LinkedIn", href: "https://linkedin.com/company/stafprintcenter", Icon: LinkedinIcon },
  { label: "Facebook", href: "https://web.facebook.com/StafPrintCenter", Icon: FacebookIcon },
  { label: "Instagram", href: "https://www.instagram.com/stafprintcenter/", Icon: InstagramIcon },
  { label: "X", href: "https://x.com/stafprintcenter", Icon: XIcon },
  { label: "WhatsApp", href: "https://wa.me/2290160300607", Icon: WhatsAppIcon },
  { label: "TikTok", href: "https://www.tiktok.com/@stafprintcenter", Icon: TiktokIcon },
] as const;