export function stripHtml(value = '') {
  if (!value) return '';
  if (typeof window === 'undefined') return value.replace(/<[^>]+>/g, ' ');
  const element = window.document.createElement('div');
  element.innerHTML = value;
  return element.textContent || element.innerText || '';
}

export function wordCount(value = '') {
  return stripHtml(value).trim().split(/\s+/).filter(Boolean).length;
}

export function readingTime(value = '') {
  const minutes = Math.max(1, Math.ceil(wordCount(value) / 220));
  return `${minutes} min read`;
}

export function excerptFromContent(value = '', maxLength = 180) {
  const text = stripHtml(value).replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

export function isValidOptionalUrl(value?: string | null) {
  if (!value?.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizeTagName(tag: unknown) {
  if (typeof tag === 'string') return tag;
  return (tag as { name?: string })?.name ?? '';
}

export function normalizeCategoryName(category: unknown) {
  if (!category) return '';
  if (typeof category === 'string') return category;
  return (category as { name?: string })?.name ?? '';
}
