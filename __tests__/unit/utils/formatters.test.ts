import {
  formatDuration,
  formatXp,
  formatLevel,
  getLevelProgress,
  formatPrice,
  truncateText,
} from '@/utils/formatters';

describe('formatDuration', () => {
  it('formats seconds under a minute', () => {
    expect(formatDuration(45)).toBe('45s');
  });
  it('formats minutes', () => {
    expect(formatDuration(120)).toBe('2 min');
  });
  it('formats hours without remainder', () => {
    expect(formatDuration(3600)).toBe('1h');
  });
  it('formats hours with minutes', () => {
    expect(formatDuration(3660)).toBe('1h 1m');
  });
});

describe('formatXp', () => {
  it('formats small xp', () => {
    expect(formatXp(500)).toBe('500 XP');
  });
  it('formats large xp in k', () => {
    expect(formatXp(1500)).toBe('1.5k XP');
  });
});

describe('formatLevel', () => {
  it('returns level 1 at 0 xp', () => {
    expect(formatLevel(0, 1000)).toBe(1);
  });
  it('returns level 2 at exactly 1000 xp', () => {
    expect(formatLevel(1000, 1000)).toBe(2);
  });
  it('returns correct level', () => {
    expect(formatLevel(2500, 1000)).toBe(3);
  });
});

describe('getLevelProgress', () => {
  it('returns correct progress at 0', () => {
    const p = getLevelProgress(0, 1000);
    expect(p.current).toBe(0);
    expect(p.total).toBe(1000);
    expect(p.percentage).toBe(0);
  });
  it('returns 50% at halfway', () => {
    const p = getLevelProgress(500, 1000);
    expect(p.percentage).toBe(50);
  });
  it('resets at new level', () => {
    const p = getLevelProgress(1500, 1000);
    expect(p.current).toBe(500);
    expect(p.percentage).toBe(50);
  });
});

describe('formatPrice', () => {
  it('returns "Bepul" for zero', () => {
    expect(formatPrice(0)).toBe('Bepul');
  });
  it('formats non-zero price', () => {
    expect(formatPrice(50000)).toContain("so'm");
  });
});

describe('truncateText', () => {
  it('returns text unchanged if within limit', () => {
    expect(truncateText('hello', 10)).toBe('hello');
  });
  it('truncates and appends ellipsis', () => {
    const result = truncateText('hello world', 5);
    expect(result).toContain('…');
    expect(result.length).toBeLessThanOrEqual(6);
  });
});
