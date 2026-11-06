import { Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RecoveryCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  codes: string[];
}

export function RecoveryCodesDialog({ open, onOpenChange, codes }: RecoveryCodesDialogProps) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      toast.success("Codes copiés");
    } catch {
      toast.error("Impossible de copier les codes");
    }
  };

  const download = () => {
    const blob = new Blob([codes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "codes-de-secours.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* overflow-hidden et max-h bloquent tout dépassement hors de la modale */}
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col overflow-hidden">

        {/* En-tête fixe (ne rétrécit pas) */}
        <DialogHeader className="shrink-0">
          <DialogTitle>Vos codes de secours</DialogTitle>
          <DialogDescription>
            Conservez-les dès maintenant dans un endroit sûr. Ils ne seront plus affichés après la fermeture de cette fenêtre.
          </DialogDescription>
        </DialogHeader>

        {/* Zone de codes avec défilement automatique si la liste est longue */}
        <div className="flex-1 overflow-y-auto my-3 pr-1 min-h-0">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl border bg-muted/20 p-4">
            {codes.map((code, index) => (
              <li key={`${code}-${index}`} className="font-mono text-sm tracking-wide text-center sm:text-left">
                {code}
              </li>
            ))}
          </ul>
        </div>

        {/* Pied de page fixe avec disposition adaptative pour éviter les débordements */}
        <DialogFooter className="shrink-0 flex-col sm:flex-row gap-2 pt-2 border-t">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-initial" onClick={copy}>
              <Copy className="mr-1 h-4 w-4" /> Copier
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-initial" onClick={download}>
              <Download className="mr-1 h-4 w-4" /> Télécharger
            </Button>
          </div>
          <Button className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            J'ai sauvegardé
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}