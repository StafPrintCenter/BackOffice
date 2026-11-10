import { useState } from "react";
import { FileText, Paperclip } from "lucide-react";
import { formatFileSize, type APIPostAttachment } from "@/data/community";
import { FilePreviewModal } from "@/components/site";
import { Button } from "@/components/ui/button";
import { resolveStorageUrl } from "@/lib/api/file";

export function AttachmentList({ attachments }: { attachments: APIPostAttachment[] }) {
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    title: string;
    mimeType: string;
  } | null>(null);

  if (attachments.length === 0) return null;
  return (
    <>
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="mb-3 flex items-center gap-2 font-semibold"><Paperclip className="h-4 w-4" />
          Pièces jointes ({attachments.length})
        </h2>

        <ul className="grid gap-3 sm:grid-cols-2">
          {attachments.map((a) => {
            const url = resolveStorageUrl(a.url);
            return (
              <li key={a.url}>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={!url}
                  onClick={() =>
                    url && setPreviewFile({ url, title: a.name, mimeType: a.mime })
                  }
                  className="h-auto w-full justify-start gap-3 rounded-lg border p-3 text-left text-sm transition hover:bg-muted/50"
                  aria-label={`Aperçu de ${a.name}`}
                >
                  {a.mime.startsWith("image/") ? (
                    <img
                      src={url ?? undefined}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </span>
                  )}
                  <span className="min-w-0 text-left">
                    <span className="block truncate font-medium">{a.name}</span>
                    <span className="text-xs text-muted-foreground">{formatFileSize(a.size)}</span>
                  </span>
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
      <FilePreviewModal
        url={previewFile?.url ?? null}
        title={previewFile?.title ?? ""}
        mimeType={previewFile?.mimeType}
        onClose={() => setPreviewFile(null)}
      />
    </>
  );
}