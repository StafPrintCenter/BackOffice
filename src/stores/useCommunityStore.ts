import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import type {
  APICommunityCategory, APIPost, CreatePostPayload, PostsListParams, UpdatePostPayload, CommentsListParams, APIComment
} from "@/data/community";

type Meta = { currentPage: number; lastPage: number; perPage: number; total: number };

async function ensureOk(response: Response, fallback: string): Promise<void> {
  if (!response.ok) throw await parseApiError(response, fallback);
}

function toQuery(params: Record<string, unknown>): string {
  const qp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "" || v === false) continue;
    qp.append(k, v === true ? "1" : String(v));
  }
  return qp.toString();
}

export function useCommunityCategories({ includeInactive = false }: { includeInactive?: boolean } = {}) {
  const q = useQuery({
    queryKey: ["community", "categories", includeInactive],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const response = await adminFetch(`/api/community/categories/list?includeInactive=${includeInactive}`);
      await ensureOk(response, "Erreur lors du chargement des catégories.");
      return ((await response.json()) as { data: APICommunityCategory[] }).data;
    },
  });
  const categories = [...(q.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  return { categories, isLoading: q.isLoading };
}

export function usePostDetail(id: string | undefined) {
  const q = useQuery({
    queryKey: ["community", "posts", "detail", id],
    enabled: !!id,
    retry: false,
    queryFn: async () => {
      const response = await adminFetch(`/api/community/posts/${id}`);
      if (response.status === 404) return null;
      await ensureOk(response, "Erreur lors du chargement de la publication.");
      return ((await response.json()) as { data: APIPost }).data;
    },
  });
  return { post: q.data ?? null, isLoading: q.isLoading, error: q.error as Error | null };
}

export function usePostsList(params: PostsListParams = {}) {
  const q = useQuery({
    queryKey: ["community", "posts", "list", params],
    staleTime: 15_000,
    queryFn: async () => {
      const response = await adminFetch(`/api/community/posts/list?${toQuery(params)}`);
      await ensureOk(response, "Erreur lors du chargement des publications.");
      return (await response.json()) as { data: APIPost[]; meta: Meta };
    },
  });
  return { posts: q.data?.data ?? [], meta: q.data?.meta ?? null, isLoading: q.isLoading, isError: q.isError };
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["community"] });
}

export function useCreatePost() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (p: CreatePostPayload) => {
      const fd = new FormData();
      fd.append("title", p.title);
      fd.append("body", p.body);
      fd.append("categoryId", p.categoryId);
      fd.append("type", p.type);
      if (p.trainingId) fd.append("trainingId", p.trainingId);
      if (p.tags.length) fd.append("tags", p.tags.join(","));
      p.attachments.forEach((f) => fd.append("attachments[]", f));

      const response = await adminFetch(`/api/community/posts/create`, { method: "POST", body: fd });
      await ensureOk(response, "Impossible de publier.");
      return ((await response.json()) as { data: APIPost }).data;
    },
    onSuccess: invalidate,
  });
}

export function useUpdatePost() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdatePostPayload }) => {
      const fd = new FormData();
      fd.append("title", payload.title);
      fd.append("body", payload.body);
      fd.append("categoryId", payload.categoryId);
      fd.append("type", payload.type);
      if (payload.tags.length) fd.append("tags", payload.tags.join(","));

      const response = await adminFetch(`/api/community/posts/${id}`, { method: "PUT", body: fd });
      await ensureOk(response, "Impossible de modifier la publication.");
      return ((await response.json()) as { data: APIPost }).data;
    },
    onSuccess: invalidate,
  });
}

export function useDeletePost() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await adminFetch(`/api/community/posts/${id}?${toQuery({ reason })}`, { method: "DELETE" });
      await ensureOk(response, "Impossible de supprimer la publication.");
    },
    onSuccess: invalidate,
  });
}

export function useCommentsList(postId: string, params: CommentsListParams = {}) {
  const q = useQuery({
    queryKey: ["community", "comments", postId, params],
    staleTime: 15_000,
    queryFn: async () => {
      const response = await adminFetch(`/api/community/posts/${postId}/comments/list?${toQuery(params)}`);
      await ensureOk(response, "Erreur lors du chargement des commentaires.");
      return (await response.json()) as { data: APIComment[]; meta: Meta };
    },
  });
  return { comments: q.data?.data ?? [], meta: q.data?.meta ?? null, isLoading: q.isLoading, isError: q.isError };
}

export function useReplies(commentId: string, page: number, enabled: boolean) {
  const q = useQuery({
    queryKey: ["community", "replies", commentId, page],
    enabled,
    staleTime: 15_000,
    queryFn: async () => {
      const response = await adminFetch(`/api/community/comments/${commentId}/replies?${toQuery({ page, perPage: 12 })}`);
      await ensureOk(response, "Erreur lors du chargement des réponses.");
      return (await response.json()) as { data: APIComment[]; meta: Meta };
    },
  });
  return { replies: q.data?.data ?? [], meta: q.data?.meta ?? null, isLoading: q.isLoading, isError: q.isError };
}

export function useCreateComment() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ postId, body, parentId }: { postId: string; body: string; parentId?: string }) => {
      const fd = new FormData();
      fd.append("body", body);
      if (parentId) fd.append("parentId", parentId);
      const response = await adminFetch(`/api/community/posts/${postId}/comments/create`, { method: "POST", body: fd });
      await ensureOk(response, "Impossible d'envoyer le commentaire.");
      return ((await response.json()) as { data: APIComment }).data;
    },
    onSuccess: invalidate, // liste, réponses, compteurs de la publication
  });
}

export function useUpdateComment() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: string }) => {
      const fd = new FormData();
      fd.append("body", body);
      const response = await adminFetch(`/api/community/comments/${id}`, { method: "PUT", body: fd });
      await ensureOk(response, "Impossible de modifier le commentaire.");
      return ((await response.json()) as { data: APIComment }).data;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteComment() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await adminFetch(`/api/community/comments/${id}?${toQuery({ reason })}`, { method: "DELETE" });
      await ensureOk(response, "Impossible de supprimer le commentaire.");
    },
    onSuccess: invalidate,
  });
}