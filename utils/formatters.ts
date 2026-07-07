export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const formatTimestamp = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

export const formatXp = (xp: number): string => {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k XP`;
  return `${xp} XP`;
};

export const formatLevel = (xp: number, xpPerLevel: number): number => {
  return Math.floor(xp / xpPerLevel) + 1;
};

export const getLevelProgress = (
  xp: number,
  xpPerLevel: number
): { current: number; total: number; percentage: number } => {
  const currentLevelXp = xp % xpPerLevel;
  return {
    current: currentLevelXp,
    total: xpPerLevel,
    percentage: (currentLevelXp / xpPerLevel) * 100,
  };
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Bugun';
  if (diffDays === 1) return 'Kecha';
  if (diffDays < 7) return `${diffDays} kun oldin`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta oldin`;
  return `${Math.floor(diffDays / 30)} oy oldin`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '…';
};

export const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const formatPrice = (price: number): string => {
  if (price === 0) return 'Bepul';
  return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
};

export const paymentProviderLabels: Record<'payme' | 'click', string> = {
  payme: 'Payme',
  click: 'Click',
};

export const paymentStatusLabels: Record<'pending' | 'completed' | 'failed' | 'cancelled', string> = {
  pending: 'Kutilmoqda',
  completed: 'Muvaffaqiyatli',
  failed: 'Muvaffaqiyatsiz',
  cancelled: 'Bekor qilindi',
};

export const subscriptionTypeLabels: Record<'lifetime' | 'monthly' | 'yearly', string> = {
  lifetime: 'Umrbod',
  monthly: 'Oylik',
  yearly: 'Yillik',
};

export const lessonTypeLabels: Record<'video' | 'article' | 'quiz' | 'assignment', string> = {
  video: 'Video',
  article: 'Maqola',
  quiz: 'Test',
  assignment: 'Topshiriq',
};

type LessonType = 'video' | 'article' | 'quiz' | 'assignment';

interface ModuleGroupable {
  type: LessonType;
  module_id: number | null;
  module_title: string | null;
  module_order: number | null;
}

export interface LessonModuleGroup<T> {
  id: number;
  title: string;
  order: number;
  items: Partial<Record<LessonType, T>>;
}

// The API groups lessons into a "Dars" (video+article+quiz+assignment) via
// module_id/module_title/module_order on each lesson — lessons with no module_id
// predate modules and are returned ungrouped ("legacy").
export const groupLessonsByModule = <T extends ModuleGroupable>(
  lessons: T[]
): { modules: LessonModuleGroup<T>[]; legacy: T[] } => {
  const map = new Map<number, LessonModuleGroup<T>>();
  const legacy: T[] = [];

  for (const lesson of lessons) {
    if (lesson.module_id == null) {
      legacy.push(lesson);
      continue;
    }
    let group = map.get(lesson.module_id);
    if (!group) {
      group = {
        id: lesson.module_id,
        title: lesson.module_title ?? String(lesson.module_id),
        order: lesson.module_order ?? 0,
        items: {},
      };
      map.set(lesson.module_id, group);
    }
    group.items[lesson.type] = lesson;
  }

  return { modules: [...map.values()].sort((a, b) => a.order - b.order), legacy };
};

export const LESSON_SLOT_ORDER: LessonType[] = ['video', 'article', 'quiz', 'assignment'];
