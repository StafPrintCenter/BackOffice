import { Link } from "@tanstack/react-router";
import { Sticker } from "lucide-react";

export function FeedbackGroupShortcut() {
  return (
    <div className="mb-4">
      <Link to="/articleFeedback/unique"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
        <Sticker className="h-4 w-4" />
        Aller aux Feedbacks uniques
      </Link>
    </div>
  );
}