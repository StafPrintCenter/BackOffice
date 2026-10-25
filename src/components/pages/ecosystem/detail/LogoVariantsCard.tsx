import { Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EcosystemSiteLogoVariants } from "@/data/ecosystemSites";

interface LogoVariantsCardProps {
  logoVariants: EcosystemSiteLogoVariants;
}

export function LogoVariantsCard({ logoVariants }: LogoVariantsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          Variantes du Logo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Object.entries(logoVariants).map(([key, url]) => {
            const isDarkBg = key === "mw" || key === "dw";
            const isLandscape = key === "dc" || key === "dw";

            return (
              <div
                key={key}
                className={`flex flex-col items-center justify-between rounded-lg border p-4 transition-colors ${isDarkBg ? "bg-slate-900 border-slate-800" : "bg-muted/10 border-border"
                  }`}
              >
                <div className="flex h-20 w-full items-center justify-center p-2">
                  <img
                    src={url}
                    alt={key}
                    className={isLandscape ? "h-16 w-full object-contain" : "h-12 w-12 object-contain"}
                  />
                </div>
                <span className={`mt-2 text-[11px] font-mono font-medium uppercase ${isDarkBg ? "text-slate-400" : "text-muted-foreground"}`}>
                  {key}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}