import { FileText, Paperclip } from "lucide-react";
import { formatFileSize, type APIPostAttachment } from "@/data/community";

export function AttachmentList({ attachments }: { attachments: APIPostAttachment[] }) {
  if (attachments.length === 0) return null;
  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="mb-3 flex items-center gap-2 font-semibold"><Paperclip className="h-4 w-4" />
        Pièces jointes ({attachments.length})
      </h2>

      <ul className="grid gap-3 sm:grid-cols-2">
        {attachments.map((a) => (
          <li key={a.url}>
            <a
              href={a.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-lg border p-3 text-sm transition hover:bg-muted/50"
            >
              {a.mime.startsWith("image/") ? (
                <
                  img src={a.url}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded object-cover"
                />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate font-medium">{a.name}</span>
                <span className="text-xs text-muted-foreground">{formatFileSize(a.size)}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}