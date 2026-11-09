import { createElement, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  useAdminProfileHealth,
  useDismissAdminHealthRecommendation,
} from "@/stores/useProfileHealthStore";
import { resolveHealthTarget } from "./Targets";
import { HealthToastBody } from "./ToastBody";

const MAX_TOASTS = 2;
const TOAST_DURATION_MS = 15000;
const HEALTH_TOAST_POSITION = "bottom-right" as const;
const HEALTH_PAGE = "/health";
const MORE_KEY = "__more";
const shown = new Set<string>(); // userId:recommendationId

export function useHealthToasts() {
  const navigate = useNavigate();
  const { user } = useAdminAuth();
  const { recommendations } = useAdminProfileHealth();
  const { mutate: dismiss } = useDismissAdminHealthRecommendation();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    const goTo = (route: string) => navigate({ to: route as any });

    recommendations.slice(0, MAX_TOASTS).forEach((rec) => {
      const key = `${userId}:${rec.id}`;
      if (shown.has(key)) return;
      shown.add(key);

      const toastId = `health-${rec.id}`;
      const route = resolveHealthTarget(rec.action.target);
      const show = rec.level === "warning" ? toast.warning : toast.info;

      show(rec.title, {
        id: toastId,
        duration: TOAST_DURATION_MS,
        position: HEALTH_TOAST_POSITION,
        closeButton: true,
        description: createElement(HealthToastBody, {
          message: rec.message,
          onDismiss: () => {
            toast.dismiss(toastId);
            dismiss(
              { id: rec.id },
              {
                onSuccess: (res) =>
                  toast.success(`Recommandation masquée pour ${res.snoozeDays} jours`, {
                    position: HEALTH_TOAST_POSITION,
                  }),
                onError: (e) => toast.error(e.message, { position: HEALTH_TOAST_POSITION }),
              }
            );
          },
          actionLabel: route ? rec.action.label : undefined,
          onAction: route
            ? () => {
              toast.dismiss(toastId);
              goTo(route);
            }
            : undefined,
        }),
      });
    });

    // Plus de deux recommandations : un toast supplémentaire renvoie vers la page santé
    if (recommendations.length > MAX_TOASTS) {
      const moreKey = `${userId}:${MORE_KEY}`;
      if (shown.has(moreKey)) return;
      shown.add(moreKey);

      const remaining = recommendations.length - MAX_TOASTS;
      toast.info(`${remaining} autre${remaining > 1 ? "s" : ""} recommandation${remaining > 1 ? "s" : ""}`, {
        id: "health-more",
        duration: TOAST_DURATION_MS,
        position: HEALTH_TOAST_POSITION,
        closeButton: true,
        description: createElement(HealthToastBody, {
          message: "Consultez-les toutes pour améliorer la santé de votre compte.",
          actionLabel: "Voir tout",
          onAction: () => {
            toast.dismiss("health-more");
            goTo(HEALTH_PAGE);
          },
        }),
      });
    }
  }, [recommendations, userId, dismiss, navigate]);
}