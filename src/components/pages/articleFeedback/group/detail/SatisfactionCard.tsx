import { Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";
import type { APIAdminArticleFeedbackGroup } from "@/data/articleFeedback";

export function FeedbackGroupSatisfactionCard({ group }: { group: APIAdminArticleFeedbackGroup }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-base">
          <Sparkles className="h-4 w-4 text-primary" /> Score global de satisfaction
        </div>
        <span className="text-2xl font-black text-foreground">
          {group.satisfactionRate}%
        </span>
      </div>

      <div className="space-y-2">
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${group.positiveRate}%` }}
          />
          <div
            className="h-full bg-destructive transition-all duration-500"
            style={{ width: `${group.negativeRate}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <ThumbsUp className="h-3 w-3" /> {group.positiveVotes} Utiles ({group.positiveRate}%)
          </span>
          <span className="flex items-center gap-1 text-destructive">
            <ThumbsDown className="h-3 w-3" /> {group.negativeVotes} Pas utiles ({group.negativeRate}%)
          </span>
        </div>
      </div>
    </div>
  );
}