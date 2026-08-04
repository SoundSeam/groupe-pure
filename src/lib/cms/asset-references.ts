export function referencedFieldKeys(content: unknown, publicUrl: string) {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return [];
  }

  return Object.entries(content)
    .filter(([, value]) => JSON.stringify(value).includes(publicUrl))
    .map(([key]) => key);
}
