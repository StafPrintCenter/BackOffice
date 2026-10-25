import { useState } from "react";
import { ArrowLeft, ExternalLink, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SITE_LINK } from "@/data/site";
import type { APIAdminArticleFeedbackGroup } from "@/data/articleFeedback";

interface HeaderProps {
  group?: APIAdminArticleFeedbackGroup;
  articleKey: string;
  onBack: () => void;
}

export function FeedbackGroupDetailHeader({ group, articleKey, onBack }: HeaderProps) {
  const [copied, setCopied] = useState(false);

  const currentKey = group?.articleKey ?? articleKey;
  const docsBaseUrl = SITE_LINK.docsUrl?.replace(/\/$/, "") ?? "";
  const fullDocUrl = `${docsBaseUrl}/docs/${currentKey}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullDocUrl);
    setCopied(true);
    toast.success("Lien copié dans le presse-papier");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {currentKey}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 mr-1.5 text-emerald-600" /> : <Copy className="h-4 w-4 mr-1.5" />}
          {copied ? "Copié !" : "Copier le lien"}
        </Button>

        <Button variant="default" size="sm" asChild>
          <a href={fullDocUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-1.5" /> Voir l'article
          </a>
        </Button>
      </div>
    </div>
  );
}