import * as Dialog from "@radix-ui/react-dialog";
import { X, ExternalLink, Download, FileSpreadsheet } from "lucide-react";

interface FilePreviewModalProps {
  url: string | null;
  title: string;
  onClose: () => void;
  mimeType?: string;
}

export function FilePreviewModal({ url, title, onClose, mimeType }: FilePreviewModalProps) {
  if (!url) return null;

  const absoluteUrl =
    typeof window !== "undefined" ? new URL(url, window.location.origin).toString() : url;
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const extension = url.split(/[?#]/, 1)[0].split(".").pop()?.toLowerCase() || "";

  const isPdf = extension === "pdf";
  const isImage =
    mimeType?.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif"].includes(extension);
  const isDocx = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(extension);

  // Visionneuse Google pour les fichiers Office
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    absoluteUrl,
  )}&embedded=true`;

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[85vh] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl outline-none">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/30">
            <Dialog.Title className="truncate text-sm font-semibold text-foreground">
              {title}
            </Dialog.Title>

            <div className="flex items-center gap-2">
              <a
                href={url}
                download
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Download size={14} /> Télécharger
              </a>

              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card p-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                title="Ouvrir le fichier dans un nouvel onglet"
              >
                <ExternalLink size={14} />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                aria-label="Fermer l'aperçu"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 bg-muted/10 p-2 overflow-auto flex items-center justify-center">
            {isPdf ? (
              <iframe
                src={url}
                className="w-full h-full rounded-lg border-0"
                title={title}
              />
            ) : isImage ? (
              <img
                src={url}
                alt={title}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            ) : isDocx && isLocalhost ? (
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 max-w-md">
                <div className="p-3 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  <FileSpreadsheet size={32} />
                </div>
                <div className="space-y-1">
                  <h5 className="font-semibold text-foreground text-base">
                    Aperçu non disponible en local
                  </h5>
                  <p className="text-xs text-muted-foreground">
                    Les fichiers Word requirent un serveur public accessible pour la prévisualisation intégrée.
                  </p>
                </div>
                <a
                  href={url}
                  download
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <Download size={14} /> Télécharger pour consulter ({extension.toUpperCase()})
                </a>
              </div>
            ) : isDocx ? (
              <iframe
                src={googleViewerUrl}
                className="w-full h-full rounded-lg border-0"
                title={title}
              />
            ) : (
              <iframe
                src={url}
                className="w-full h-full rounded-lg border-0"
                title={title}
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}