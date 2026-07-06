import type { Course, Module, SectionLesson, LessonProgressItem } from '@/types';

export interface ModuleLesson extends SectionLesson {
  is_completed: boolean;
  watch_seconds: number;
}

/**
 * Merges section lessons (type/duration/is_preview, from GET /courses/{slug})
 * with their completion state (from GET /courses/{courseId}/progress) by id.
 */
export const mergeLessonProgress = (
  lessons: SectionLesson[],
  progressLessons: LessonProgressItem[] | undefined
): ModuleLesson[] => {
  const progressById = new Map((progressLessons ?? []).map((p) => [p.id, p]));
  return lessons.map((lesson) => {
    const progress = progressById.get(lesson.id);
    return {
      ...lesson,
      is_completed: progress?.is_completed ?? lesson.is_completed ?? false,
      watch_seconds: progress?.watch_seconds ?? 0,
    };
  });
};

// Sections carry real modules straight from the API now (no more guessing module
// boundaries from lesson ids) — this just flattens them in section/module order.
export const getAllModules = (course: Pick<Course, 'sections'>): Module[] =>
  (course.sections ?? []).flatMap((section) => section.modules ?? []);

export const isModuleCompleted = (lessons: ModuleLesson[]): boolean =>
  lessons.length > 0 && lessons.every((l) => l.is_completed);
