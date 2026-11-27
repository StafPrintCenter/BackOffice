import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import type {
  AdminMemberActor,
  APIAdminMemberSessionsResponse,
  APIAdminSessionRevokeResponse,
} from "@/data/security-session";

const SESSION_QUERY_KEY = ["admin-member-sessions"] as const;

const MEMBER_RESOURCE_KEYS: Record<AdminMemberActor, string> = {
  admin: "admins",
  instructor: "instructors",
  student: "students",
  user: "users",
};

function getMemberSessionsPath(actor: AdminMemberActor, memberId: string) {
  return `/api/admin/members/${actor}/${encodeURIComponent(memberId)}/sessions`;
}

async function memberSessionsRequest<T>(
  path: string,
  fallbackMessage: string,
  init?: RequestInit
): Promise<T> {
  const response = await adminFetch(path, init);
  if (!response.ok) throw await parseApiError(response, fallbackMessage);
  return response.json();
}

async function fetchMemberSessions(
  actor: AdminMemberActor,
  memberId: string,
  page: number,
  perPage: number
) {
  const query = new URLSearchParams({ page: String(page), perPage: String(perPage) });
  return memberSessionsRequest<APIAdminMemberSessionsResponse>(
    `${getMemberSessionsPath(actor, memberId)}?${query}`,
    "Impossible de charger les sessions de ce membre."
  );
}

async function invalidateMemberSessions(
  queryClient: ReturnType<typeof useQueryClient>,
  actor: AdminMemberActor,
  memberId: string
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: [...SESSION_QUERY_KEY, actor, memberId],
    }),
    queryClient.invalidateQueries({
      queryKey: [MEMBER_RESOURCE_KEYS[actor], "admin-detail", memberId],
    }),
  ]);
}

export function useAdminMemberSessions(
  actor: AdminMemberActor,
  memberId: string,
  page: number,
  perPage: number,
  enabled: boolean
) {
  const query = useQuery({
    queryKey: [...SESSION_QUERY_KEY, actor, memberId, page, perPage],
    queryFn: () => fetchMemberSessions(actor, memberId, page, perPage),
    enabled,
  });

  return {
    sessions: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    meta: query.data?.meta ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useRevokeAdminMemberSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      actor,
      memberId,
      sessionId,
    }: {
      actor: AdminMemberActor;
      memberId: string;
      sessionId: number;
    }) =>
      memberSessionsRequest<APIAdminSessionRevokeResponse>(
        `${getMemberSessionsPath(actor, memberId)}/${sessionId}`,
        "Impossible de révoquer cette session.",
        { method: "DELETE" }
      ),
    onSuccess: (_response, variables) =>
      invalidateMemberSessions(queryClient, variables.actor, variables.memberId),
  });
}

export function useRevokeSelectedAdminMemberSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      actor,
      memberId,
      sessionIds,
    }: {
      actor: AdminMemberActor;
      memberId: string;
      sessionIds: number[];
    }) => {
      const body = new FormData();
      body.append("sessionIds", sessionIds.join(","));
      return memberSessionsRequest<APIAdminSessionRevokeResponse>(
        `${getMemberSessionsPath(actor, memberId)}/revoke`,
        "Impossible de révoquer les sessions sélectionnées.",
        { method: "POST", body }
      );
    },
    onSuccess: (_response, variables) =>
      invalidateMemberSessions(queryClient, variables.actor, variables.memberId),
  });
}

export function useRevokeAllAdminMemberSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ actor, memberId }: { actor: AdminMemberActor; memberId: string }) =>
      memberSessionsRequest<APIAdminSessionRevokeResponse>(
        `${getMemberSessionsPath(actor, memberId)}/revoke-all`,
        "Impossible de révoquer toutes les sessions de ce membre.",
        { method: "POST" }
      ),
    onSuccess: (_response, variables) =>
      invalidateMemberSessions(queryClient, variables.actor, variables.memberId),
  });
}
