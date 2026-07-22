export interface APIAdminTestimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTestimonialPayload {
  name: string;
  role: string;
  quote: string;
  rating: number;
  featured: boolean;
}