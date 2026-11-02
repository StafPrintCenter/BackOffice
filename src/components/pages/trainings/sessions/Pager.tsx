import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { page: number; lastPage: number; total?: number; onChange: (p: number) => void }

export function Pager({ page, lastPage, total, onChange }: Props) {
  if (lastPage <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Précédent
      </Button>

      <span className="text-muted-foreground">
        Page {page} / {lastPage}{total !== undefined && ` · ${total}`}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={page >= lastPage}
        onClick={() => onChange(page + 1)}
      >
        Suivant
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}