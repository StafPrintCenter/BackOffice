import { BarChart3, ThumbsUp, ThumbsDown, MessageSquare, Scale, Percent } from "lucide-react";
import { SITE_LINK } from "@/data/site";
import type { APIAdminArticleFeedbackGroup } from "@/data/articleFeedback";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export function FeedbackGroupDocCard({ group, articleKey }: { group: APIAdminArticleFeedbackGroup; articleKey: string }) {
  const currentKey = group?.articleKey ?? articleKey;
  const docsBaseUrl = SITE_LINK.docsUrl?.replace(/\/$/, "") ?? "";
  const fullDocUrl = `${docsBaseUrl}/docs/${currentKey}`;

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
      <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Lien Documentation
      </h2>
      <div className="rounded-xl border bg-background/50 p-3">
        <a
          href={fullDocUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-primary hover:underline break-all block"
        >
          {fullDocUrl}
        </a>
      </div>
    </div>
  );
}

export function FeedbackGroupStatsCard({ group }: { group: APIAdminArticleFeedbackGroup }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
      <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Statistiques API
      </h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <div className="flex items-center justify-between rounded-xl border bg-background/50 p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Total votes</span>
          </div>
          <span className="text-lg font-bold">{group.totalVotes}</span>
        </div>

        <div className="flex items-center justify-between rounded-xl border bg-background/50 p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
              <ThumbsUp className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Votes positifs</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {group.positiveVotes}
            </span>
            <span className="block text-[10px] text-muted-foreground">{group.positiveRate}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border bg-background/50 p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
              <ThumbsDown className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Votes négatifs</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-destructive">{group.negativeVotes}</span>
            <span className="block text-[10px] text-muted-foreground">{group.negativeRate}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border bg-background/50 p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-sky-500/10 p-2 text-sky-600">
              <MessageSquare className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Commentaires</span>
          </div>
          <span className="text-lg font-bold">{group.commentsCount}</span>
        </div>

        <div className="flex items-center justify-between rounded-xl border bg-background/50 p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600">
              <Scale className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Ratio (+/-)</span>
          </div>
          <span className="text-lg font-bold">{group.upDownRatio != null ? group.upDownRatio : "-"}</span>
        </div>

        <div className="flex items-center justify-between rounded-xl border bg-background/50 p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
              <Percent className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Satisfaction</span>
          </div>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {group.satisfactionRate}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function FeedbackGroupTimestampCard({ group }: { group: APIAdminArticleFeedbackGroup }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
      <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Horodatage
      </h2>
      <div className="space-y-2 text-xs">
        <div className="flex flex-col gap-0.5 rounded-lg bg-background/50 p-3 border">
          <span className="text-muted-foreground font-medium">Premier retour</span>
          <span className="font-semibold text-foreground">{formatDate(group.firstFeedbackAt)}</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg bg-background/50 p-3 border">
          <span className="text-muted-foreground font-medium">Dernier retour</span>
          <span className="font-semibold text-foreground">{formatDate(group.lastFeedbackAt)}</span>
        </div>
      </div>
    </div>
  );
}