import { useEffect } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  useAdminProfileHealth,
  useDismissAdminHealthRecommendation,
} from "@/stores/useProfileHealthStore";

const MAX_TOASTS = 3;
const TOAST_DURATION_MS = 15000;
const HEALTH_TOAST_POSITION = "bottom-right" as const;
const shown = new Set<string>(); // userId:recommendationId

export function useHealthToasts() {
  const { user } = useAdminAuth();
  const { recommendations } = useAdminProfileHealth();
  const { mutate: dismiss } = useDismissAdminHealthRecommendation();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    recommendations.slice(0, MAX_TOASTS).forEach((rec) => {
      const key = `${userId}:${rec.id}`;
      if (shown.has(key)) return;
      shown.add(key);

      const show = rec.level === "warning" ? toast.warning : toast.info;
      show(rec.title, {
        id: `health-${rec.id}`,
        description: rec.message,
        duration: TOAST_DURATION_MS,
        position: HEALTH_TOAST_POSITION,
        closeButton: false, // le bouton « Fermer » joue ce rôle
        cancel: { label: "Fermer", onClick: () => { } },
        action: {
          label: "Masquer",
          onClick: () =>
            dismiss(
              { id: rec.id },
              {
                onSuccess: (res) =>
                  toast.success(`Recommandation masquée pour ${res.snoozeDays} jours`, {
                    position: HEALTH_TOAST_POSITION,
                  }),
                onError: (e) => toast.error(e.message, { position: HEALTH_TOAST_POSITION }),
              }
            ),
        },
      });
    });
  }, [recommendations, userId, dismiss]);
}