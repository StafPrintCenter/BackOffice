export interface APIAdminFaq {
  id: string;
  categoryId: string;
  category: string;
  question: string;
  answer: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminFaqPayload {
  category_id: string;
  question: string;
  answer: string;
  order: number;
}