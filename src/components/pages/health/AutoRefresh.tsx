import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { HEALTH_KEY } from "@/stores/useProfileHealthStore";

const REFRESH_DELAY_MS = 500;

/** Ne rend rien : recharge le score de santé après toute mutation réussie */
export function HealthAutoRefresh() {
  const queryClient = useQueryClient();
  const [successCount, setSuccessCount] = useState(0);
  const debouncedCount = useDebouncedValue(successCount, REFRESH_DELAY_MS);

  useEffect(() => {
    return queryClient.getMutationCache().subscribe((event) => {
      if (event.type === "updated" && event.action.type === "success") {
        setSuccessCount((n) => n + 1);
      }
    });
  }, [queryClient]);

  useEffect(() => {
    if (debouncedCount > 0) {
      queryClient.invalidateQueries({ queryKey: HEALTH_KEY });
    }
  }, [debouncedCount, queryClient]);

  return null;
}