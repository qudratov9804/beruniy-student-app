export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface Certificate {
  id: number;
  enrollment_id: number;
  course_title: string;
  student_name: string;
  code: string;
  issued_at: string;
  download_url: string;
  verify_url: string;
}

export interface WishlistItem {
  course: import('./course').Course;
  added_at: string;
}
