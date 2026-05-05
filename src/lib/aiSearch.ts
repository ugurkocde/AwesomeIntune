const MIN_WORDS = 2;
const MIN_CHARS = 8;

export function shouldUseAiSearch(query: string): boolean {
  const trimmed = query.trim();
  if (trimmed.length < MIN_CHARS) return false;
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  return wordCount >= MIN_WORDS;
}
