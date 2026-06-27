export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
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

export const formatPrice = (price: number): string => {
  if (price === 0) return 'Bepul';
  return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
};
