import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/site/AdminShell";
import { PageHeader, ConfirmDelete } from "@/components/site/AdminBits";
import { DataTable } from "@/components/site/DataTable";
import { messagesApi } from "@/api/extra.api";
import type { Message, MessageStatus } from "@/types";

export const Route = createFileRoute("/admin/messages/")({
  head: () => ({ meta: [{ title: "Messages — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminMessages,
});

const statusBadge = (s: MessageStatus) => ({
  nouveau: "bg-blue-100 text-blue-700",
  en_cours: "bg-amber-100 text-amber-700",
  traite: "bg-emerald-100 text-emerald-700",
  archive: "bg-muted text-muted-foreground",
}[s]);
const statusLabel = (s: MessageStatus) => ({ nouveau: "Nouveau", en_cours: "En cours", traite: "Traité", archive: "Archivé" }[s]);

function AdminMessages() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["messages"], queryFn: messagesApi.list });
  const [toDelete, setToDelete] = useState<Message | null>(null);
  const remove = useMutation({ mutationFn: (id: string) => messagesApi.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["messages"] }); toast.success("Supprimé"); setToDelete(null); } });

  return (
    <AdminShell>
      <PageHeader title="Messages" description="Messages reçus depuis le formulaire de contact." />
      <DataTable<Message>
        data={data ?? []}
        isLoading={isLoading}
        searchKeys={["name", "email", "ticketNumber", "message"]}
        onDelete={(r) => setToDelete(r)}
        columns={[
          { key: "ticketNumber", label: "Ticket", render: (r) => <Link to="/admin/messages/$id" params={{ id: r.id }} className="font-mono text-xs font-medium text-primary hover:underline">{r.ticketNumber}</Link> },
          { key: "name", label: "Expéditeur", render: (r) => <div><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.email}</div></div> },
          { key: "service", label: "Service", render: (r) => <span className="text-xs">{r.customService || r.service}</span> },
          { key: "message", label: "Aperçu", render: (r) => <div className="max-w-md line-clamp-2 text-xs text-muted-foreground">{r.message}</div> },
          { key: "status", label: "Statut", render: (r) => <span className={"rounded-full px-2 py-0.5 text-xs " + statusBadge(r.status)}>{statusLabel(r.status)}</span> },
        ]}
      />
      <ConfirmDelete open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)} onConfirm={() => toDelete && remove.mutate(toDelete.id)} title={`Supprimer le message "${toDelete?.ticketNumber}" ?`} />
    </AdminShell>
  );
}
