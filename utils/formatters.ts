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

// Several API fields (progress_percent, review distribution counts, …) have
// occasionally arrived wrapped as { number/count, percent } objects instead
// of a plain number, which crashed any screen rendering them directly as a
// Text child — coerce defensively at render time, preferring whichever of
// the given keys is present.
const toNumeric = (value: unknown, ...preferredKeys: string[]): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (value && typeof value === 'object') {
    for (const key of preferredKeys) {
      if (key in value) {
        return toNumeric((value as Record<string, unknown>)[key], ...preferredKeys);
      }
    }
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const toPercent = (value: unknown): number => toNumeric(value, 'percent', 'number', 'count');
export const toCount = (value: unknown): number => toNumeric(value, 'count', 'number');

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

const LOCALE_TAGS: Record<string, string> = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en-US',
};

export const formatDate = (dateStr: string, language = 'uz'): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(LOCALE_TAGS[language] ?? LOCALE_TAGS.uz, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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

export const formatPrice = (price: number, t: (key: string) => string, language = 'uz'): string => {
  if (price === 0) return t('common.free');
  const amount = new Intl.NumberFormat(LOCALE_TAGS[language] ?? LOCALE_TAGS.uz).format(price);
  return `${amount} ${t('common.currency')}`;
};

export const paymentProviderLabels: Record<'payme' | 'click', string> = {
  payme: 'Payme',
  click: 'Click',
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

// The API's own lessons array order is unreliable within a module (e.g. a quiz can be
// listed before its module's article despite having a higher `order`) — anything doing
// index-based lock/unlock or "what's next" math needs this canonical order instead of
// the raw array: modules by module_order, each module's items by LESSON_SLOT_ORDER,
// then legacy (no module_id) lessons by their own order.
export const flattenLessonsInModuleOrder = <T extends ModuleGroupable>(lessons: T[]): T[] => {
  const { modules, legacy } = groupLessonsByModule(lessons);
  const ordered: T[] = [];
  for (const mod of modules) {
    for (const slot of LESSON_SLOT_ORDER) {
      const lesson = mod.items[slot];
      if (lesson) ordered.push(lesson);
    }
  }
  return [...ordered, ...legacy];
};
