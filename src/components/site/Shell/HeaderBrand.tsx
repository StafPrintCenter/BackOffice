import { Link } from "@tanstack/react-router";
import { SidebarHeader } from "@/components/ui/sidebar";
import logo from "@/assets/logos.json";
import { SITE } from "@/data/site";

export function InstructorHeaderBrand({ onNavClick }: { onNavClick: () => void }) {
  return (
    <SidebarHeader className="px-3.5 py-4">
      <Link to="/dashboard" onClick={onNavClick} className="flex items-center gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden">
          <img src={logo.mw} alt="Logo SPC" className="h-7 w-auto object-contain" />
        </span>
        <span className="flex flex-col group-data-[collapsible=icon]:hidden min-w-0">
          <span className="font-display font-bold text-sm tracking-tight truncate">{SITE.name}</span>
          <span className="text-[10px] opacity-60 truncate">{SITE.tool}</span>
        </span>
      </Link>
    </SidebarHeader>
  );
}