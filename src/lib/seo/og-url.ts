/**
 * Builds the `/og` card URL for an item. Kept dependency-free so both server
 * metadata and tests can use it.
 */
export function ogImageUrl(input: { src?: string | null; title: string; eyebrow?: string }): string {
  const params = new URLSearchParams();
  if (input.src) params.set("src", input.src);
  params.set("title", input.title);
  if (input.eyebrow) params.set("eyebrow", input.eyebrow);
  return `/og?${params.toString()}`;
}
