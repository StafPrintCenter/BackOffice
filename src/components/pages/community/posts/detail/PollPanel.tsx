import { useState } from "react";
import { Loader2, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useVotePoll } from "@/stores/useCommunityStore";
import type { APIPost } from "@/data/community";

export function PollPanel({ post }: { post: APIPost }) {
  const poll = post.poll;
  const [selectedOption, setSelectedOption] = useState(poll?.myVote ?? "");
  const vote = useVotePoll();

  if (!poll?.options) {
    return (
      <div className="mt-5 rounded-lg border p-4 text-sm text-muted-foreground">
        Les options de ce sondage ne sont pas disponibles.
      </div>
    );
  }

  const hasVoted = Boolean(poll.myVote) || vote.isSuccess;
  const canVote = post.status === "published" && !hasVoted;

  return (
    <section className="mt-5 space-y-3 rounded-xl border p-4" aria-label="Sondage">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Sondage</h2>
        <span className="text-xs text-muted-foreground">
          {poll.totalVotes} vote{poll.totalVotes === 1 ? "" : "s"}
        </span>
      </div>

      <RadioGroup
        value={selectedOption}
        onValueChange={(value) => {
          vote.reset();
          setSelectedOption(value);
        }}
        className="gap-2"
        aria-label="Choisir une option"
      >
        {poll.options.map((option) => {
          const percentage = poll.totalVotes > 0 ? Math.round((option.votesCount / poll.totalVotes) * 100) : 0;
          const isOwnVote = poll.myVote === option.id || (vote.isSuccess && selectedOption === option.id);
          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors has-disabled:cursor-defaultt ${isOwnVote
                  ? "border border-primary bg-primary/10"
                  : "border border-border"
                }`}
            >
              <RadioGroupItem value={option.id} disabled={!canVote || vote.isPending} className="mt-0.5" />
              <span className="min-w-0 flex-1">
                <span className="flex justify-between gap-3 text-sm">
                  <span>{option.label}{poll.myVote === option.id ? " · Votre choix" : ""}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {option.votesCount} ({percentage}%)
                  </span>
                </span>
                <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-primary transition-all" style={{ width: `${percentage}%` }} />
                </span>
              </span>
            </label>
          );
        })}
      </RadioGroup>

      {canVote && (
        <Button
          size="sm"
          disabled={!selectedOption || vote.isPending}
          onClick={() => vote.mutate({ postId: post.id, optionId: selectedOption })}
        >
          {vote.isPending ? <Loader2 className="animate-spin" /> : <Vote />}
          Voter
        </Button>
      )}
      {!canVote && post.status === "published" && (
        <p className="text-xs text-muted-foreground">Votre vote a été enregistré et ne peut pas être modifié.</p>
      )}
      {post.status !== "published" && (
        <p className="text-xs text-muted-foreground">Ce sondage n’accepte plus de votes.</p>
      )}
      {vote.error && <p role="alert" className="text-xs text-destructive">{vote.error.message}</p>}
    </section>
  );
}
