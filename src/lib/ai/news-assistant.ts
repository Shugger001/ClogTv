export function generateHeadlineSuggestions(title: string, category?: string) {
  const clean = title.trim().replace(/\s+/g, " ");
  if (!clean) return [];
  const prefix = category ? `${category}: ` : "";
  return [
    `${prefix}${clean}`,
    `${prefix}${clean} - What It Means Right Now`,
    `${prefix}Explained: ${clean}`,
    `${prefix}${clean} as Events Accelerate`,
  ].slice(0, 4);
}

export function generateSummary(content: string, maxWords = 38) {
  const normalized = content
    .replace(/\s+/g, " ")
    .replace(/[#>*`_\-\[\]\(\)!]/g, "")
    .trim();
  if (!normalized) return "";
  const words = normalized.split(" ");
  const clipped = words.slice(0, maxWords).join(" ");
  return words.length > maxWords ? `${clipped}...` : clipped;
}
