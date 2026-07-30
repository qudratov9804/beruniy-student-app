const escapeHtml = (str: string): string =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// The AI tutor answers math questions with LaTeX (`\( ax^2 + bx + c = 0 \)`), but
// there's no LaTeX engine in this RN/web app — react-native-render-html only renders
// HTML. Rather than pull in KaTeX/MathJax (WebView-only on native, needs a native
// rebuild), convert the common subset used at course level into Unicode math text.
const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', n: 'ⁿ', i: 'ⁱ',
};
const SUBSCRIPTS: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', a: 'ₐ', e: 'ₑ', n: 'ₙ', x: 'ₓ', o: 'ₒ',
};

const toScript = (str: string, table: Record<string, string>, fallback: string): string => {
  let out = '';
  for (const ch of str) {
    const mapped = table[ch];
    if (!mapped) return fallback;
    out += mapped;
  }
  return out;
};
const toSuperscript = (str: string) => toScript(str, SUPERSCRIPTS, `^(${str})`);
const toSubscript = (str: string) => toScript(str, SUBSCRIPTS, `_(${str})`);

const MATH_SYMBOLS: [RegExp, string][] = [
  [/\\cdot/g, '·'], [/\\times/g, '×'], [/\\div/g, '÷'], [/\\pm/g, '±'], [/\\mp/g, '∓'],
  [/\\neq/g, '≠'], [/\\leq/g, '≤'], [/\\geq/g, '≥'], [/\\approx/g, '≈'], [/\\equiv/g, '≡'],
  [/\\infty/g, '∞'], [/\\Rightarrow/g, '⇒'], [/\\rightarrow/g, '→'], [/\\leftarrow/g, '←'],
  [/\\in/g, '∈'], [/\\forall/g, '∀'], [/\\exists/g, '∃'],
  [/\\alpha/g, 'α'], [/\\beta/g, 'β'], [/\\gamma/g, 'γ'], [/\\Gamma/g, 'Γ'],
  [/\\delta/g, 'δ'], [/\\Delta/g, 'Δ'], [/\\epsilon/g, 'ε'], [/\\theta/g, 'θ'],
  [/\\lambda/g, 'λ'], [/\\mu/g, 'μ'], [/\\pi/g, 'π'], [/\\sigma/g, 'σ'], [/\\Sigma/g, 'Σ'],
  [/\\phi/g, 'φ'], [/\\omega/g, 'ω'], [/\\sum/g, 'Σ'], [/\\prod/g, 'Π'], [/\\int/g, '∫'],
  [/\\partial/g, '∂'], [/\\%/g, '%'],
];

const findMatchingBrace = (str: string, openIdx: number): number => {
  let depth = 0;
  for (let i = openIdx; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
};

// \frac{a}{b} and \sqrt{a} arguments routinely nest further LaTeX (e.g. the
// quadratic formula's \sqrt{b^2-4ac} inside a \frac denominator) — a flat
// [^{}]* regex can't match across that nesting, so this walks the braces by hand.
const processFracSqrt = (expr: string): string => {
  let out = '';
  let i = 0;
  while (i < expr.length) {
    if (expr.startsWith('\\frac{', i)) {
      const firstOpen = i + 5;
      const firstClose = findMatchingBrace(expr, firstOpen);
      if (firstClose !== -1 && expr[firstClose + 1] === '{') {
        const secondClose = findMatchingBrace(expr, firstClose + 1);
        if (secondClose !== -1) {
          const num = processFracSqrt(expr.slice(firstOpen + 1, firstClose));
          const denom = processFracSqrt(expr.slice(firstClose + 2, secondClose));
          out += `(${num}/${denom})`;
          i = secondClose + 1;
          continue;
        }
      }
    }
    if (expr.startsWith('\\sqrt{', i)) {
      const open = i + 5;
      const close = findMatchingBrace(expr, open);
      if (close !== -1) {
        out += `√(${processFracSqrt(expr.slice(open + 1, close))})`;
        i = close + 1;
        continue;
      }
    }
    out += expr[i];
    i++;
  }
  return out;
};

const formatMathExpression = (expr: string): string => {
  let out = expr;
  out = out.replace(/\\left|\\right/g, '');
  out = processFracSqrt(out);
  out = out.replace(/\\sqrt([A-Za-z0-9])/g, (_, a) => `√${a}`);
  out = out.replace(/\\text\{([^{}]*)\}/g, (_, a) => a);
  out = out.replace(/\^\{([^{}]*)\}/g, (_, a) => toSuperscript(a));
  out = out.replace(/_\{([^{}]*)\}/g, (_, a) => toSubscript(a));
  out = out.replace(/\^([A-Za-z0-9])/g, (_, a) => toSuperscript(a));
  out = out.replace(/_([A-Za-z0-9])/g, (_, a) => toSubscript(a));
  for (const [re, rep] of MATH_SYMBOLS) out = out.replace(re, rep);
  out = out.replace(/\\([a-zA-Z]+)/g, '$1');
  out = out.replace(/[{}]/g, '');
  return out.trim();
};

const MATH_BLOCK_PATTERNS = [/\\\(([\s\S]+?)\\\)/g, /\\\[([\s\S]+?)\\\]/g, /\$\$([\s\S]+?)\$\$/g];

const renderMath = (text: string): string =>
  MATH_BLOCK_PATTERNS.reduce(
    (acc, pattern) => acc.replace(pattern, (_, expr: string) => formatMathExpression(expr)),
    text
  );

const formatInline = (text: string): string =>
  renderMath(escapeHtml(text))
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/(?<![*\w])\*(?!\s)(.+?)(?<!\s)\*(?!\*)/g, '<em>$1</em>');

const ORDERED_ITEM = /^(\d+)[.)]\s+(.*)$/;
const BULLET_ITEM = /^[-*•]\s+(.*)$/;
const HEADING = /^#{1,6}\s+(.*)$/;

/**
 * Converts the loose Markdown the AI tutor answers with (bold, numbered/bulleted
 * lists, blank-line paragraphs) into HTML for rendering via `HtmlText`. Not a full
 * CommonMark parser — just enough for the LLM's typical output shape.
 */
export const markdownToHtml = (markdown: string): string => {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: string[] = [];
  let paragraphBuffer: string[] = [];
  let i = 0;

  const flushParagraph = () => {
    if (paragraphBuffer.length) {
      blocks.push(`<p>${paragraphBuffer.map(formatInline).join('<br/>')}</p>`);
      paragraphBuffer = [];
    }
  };

  while (i < lines.length) {
    const trimmed = (lines[i] ?? '').trim();

    if (!trimmed) {
      flushParagraph();
      i++;
      continue;
    }

    if (ORDERED_ITEM.test(trimmed)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length) {
        const match = (lines[i] ?? '').trim().match(ORDERED_ITEM);
        if (!match) break;
        items.push(`<li>${formatInline(match[2] ?? '')}</li>`);
        i++;
      }
      blocks.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    if (BULLET_ITEM.test(trimmed)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length) {
        const match = (lines[i] ?? '').trim().match(BULLET_ITEM);
        if (!match) break;
        items.push(`<li>${formatInline(match[1] ?? '')}</li>`);
        i++;
      }
      blocks.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    const heading = trimmed.match(HEADING);
    if (heading) {
      flushParagraph();
      blocks.push(`<p><strong>${formatInline(heading[1] ?? '')}</strong></p>`);
      i++;
      continue;
    }

    paragraphBuffer.push(trimmed);
    i++;
  }
  flushParagraph();

  return blocks.join('');
};
