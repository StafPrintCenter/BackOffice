import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PasskeyLoginPanelProps {
  loading: boolean;
  onStart: () => void;
}

export function PasskeyLoginPanel({ loading, onStart }: PasskeyLoginPanelProps) {
  return (
    <Button type="button" variant="secondary" className="w-full" disabled={loading} onClick={onStart}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          En attente de votre appareil...
        </>
      ) : (
        <>
          <KeyRound className="mr-2 h-4 w-4" />
          Utiliser ma clé d'accès
        </>
      )}
    </Button>
  );
}