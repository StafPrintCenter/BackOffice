export interface APIAdminProject {
  id: string;
  title: string;
  categoryId: string;
  category: string;
  client: string;
  cover: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProjectPayload {
  title: string;
  category_id: string;
  client: string;
  cover: string;
  description: string;
  is_public: boolean;
}