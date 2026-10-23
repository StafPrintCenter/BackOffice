import { Link } from "@tanstack/react-router";
import { Users, UserRoundPlus, UserRoundMinus } from "lucide-react";
import { formatSessionDate, type APISessionDetail } from "@/data/trainingSessions";

export function SessionResponsesCard({ session: s }: { session: APISessionDetail }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold"><Users className="h-4 w-4" /> Réponses des apprenants</h2>
        <span className="text-xs text-muted-foreground">
          {s.invitedCount ?? "-"} invité(s) · <span className="text-emerald-600">{s.confirmedCount} ✓</span> · <span className="text--destructive">{s.declinedCount} ✗</span>
        </span>
      </div>
      {s.responses.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune réponse pour le moment.</p>
      ) : (
        <ul className="space-y-2">
          {s.responses.map((r) => (
            <li key={r.studentId} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
              <Link
                to="/members/students/$id"
                params={{ id: r.studentId }}
                className="font-medium text-primary hover:underline">
                {r.studentName}
              </Link>

              <span className="flex items-center gap-3 text-xs text-muted-foreground">
                {r.response === "confirmed"
                  ? <span className="inline-flex items-center gap-1 text-emerald-600">
                    <UserRoundPlus className="h-3.5 w-3.5" /> Confirmé
                  </span>
                  : <span className="inline-flex items-center gap-1 text--destructive">
                    <UserRoundMinus className="h-3.5 w-3.5" /> Décliné
                  </span>}
                {formatSessionDate(r.respondedAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}