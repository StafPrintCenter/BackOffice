import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CleanupSettingsDialog } from "@/components/pages/notifications/shared";

export function PreferencesHeader() {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Préférences de notifications</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Choisissez ce que vous recevez, et à quels moments.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <CleanupSettingsDialog />
        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
          <Link to="/notifications">
            <ArrowLeft className="mr-1 h-4 w-4" /> Notifications
          </Link>
        </Button>
      </div>
    </div>
  );
}