const DIACRITICS_REGEX = new RegExp("[̀-ͯ]", "g");

export function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
