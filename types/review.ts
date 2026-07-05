export interface ReviewUser {
  id: number;
  name: string;
  avatar: string | null;
}

export interface Review {
  id: number;
  rating: number;
  title: string | null;
  body: string | null;
  is_approved: boolean;
  helpful_count: number;
  instructor_reply: string | null;
  user: ReviewUser;
  created_at: string;
}

export type ReviewSort = 'newest' | 'oldest' | 'helpful' | 'highest' | 'lowest';

export interface ReviewsFilter {
  sort?: ReviewSort;
  rating?: number;
  page?: number;
}

export interface CreateReviewPayload {
  rating: number;
  title?: string;
  body?: string;
}

export interface ReviewsSummary {
  avg_rating: number;
  total: number;
  distribution: Record<string, number>;
}
