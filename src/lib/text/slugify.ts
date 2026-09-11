// Combining diacritical marks (U+0300–U+036F), stripped after NFKD normalize.
const DIACRITICS = /[̀-ͯ]/g;
const NON_ALNUM = /[^a-z0-9]+/g;
const EDGE_DASHES = /^-+|-+$/g;

/**
 * Convert an arbitrary string into a URL-safe slug.
 *
 * Lowercases, strips diacritics, replaces any run of non-alphanumeric
 * characters with a single hyphen and trims leading/trailing hyphens.
 * Used for page, section and asset identifiers.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(NON_ALNUM, "-")
    .replace(EDGE_DASHES, "");
}
