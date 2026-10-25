import { Link } from "@tanstack/react-router";
import { Folders } from "lucide-react";

export function FeedbackUniqueShortcut() {
  return (
    <div className="mb-4">
      <Link to="/articleFeedback/group" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
        <Folders className="h-4 w-4" />
        Aller aux Feedbacks groupés
      </Link>
    </div>
  );
}