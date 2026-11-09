import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const MISSING_LABELS: Record<string, string> = {
  names: "Prénom et nom",
  bio: "Biographie",
  phone: "Téléphone",
  birthDate: "Date de naissance",
  address: "Adresse",
  occupation: "Profession",
};

export function MissingFieldsTooltip({ missing }: { missing: string[] }) {
  const count = missing.length;
  const label = `${count} élément${count > 1 ? "s" : ""} manquant${count > 1 ? "s" : ""}`;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Info className="h-3 w-3" />
            {label}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" align="start" className="max-w-xs">
          <p className="mb-1 text-xs font-semibold">À compléter :</p>
          <ul className="list-disc space-y-0.5 pl-4 text-xs">
            {missing.map((key) => (
              <li key={key}>{MISSING_LABELS[key] ?? key}</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}