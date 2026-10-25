import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HistorySidebarCardProps {
  createdAt: string;
  updatedAt: string;
}

export function HistorySidebarCard({ createdAt, updatedAt }: HistorySidebarCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Historique
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Création :</span>
          <span className="font-medium text-foreground">{new Date(createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>
        </div>
        <div className="flex justify-between">
          <span>Dernière MAJ :</span>
          <span className="font-medium text-foreground">{new Date(updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>
        </div>
      </CardContent>
    </Card>
  );
}