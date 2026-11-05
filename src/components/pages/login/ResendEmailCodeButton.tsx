import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResendEmailCodeButtonProps {
  remaining: number;
  sending: boolean;
  onResend: () => void;
}

export function ResendEmailCodeButton({
  remaining,
  sending,
  onResend,
}: ResendEmailCodeButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="w-full"
      disabled={remaining > 0 || sending}
      onClick={onResend}
    >
      {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {remaining > 0 ? `Renvoyer le code dans ${remaining} s` : "Renvoyer le code"}
    </Button>
  );
}
