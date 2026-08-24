/**
 * Turns a string into a URL-friendly slug.
 * @param text - The text to slugify
 * @param separator - Separator to use, `-` by default
 * @returns The slugified string
 * // Exemples d'utilisation
 * (slugger('Bonjour le monde!')); // 'bonjour-le-monde'
 * (slugger('Éléphant d\'Afrique')); // 'elephant-d-afrique'
 * (slugger('Un test avec_underscore', '_')); // 'un_test_avec_underscore'
 */
export function slugger(text: string, separator: string = "-"): string {
  return (
    text
      // Convertir en minuscules
      .toLowerCase()
      // Replace accented characters with their unaccented equivalent
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // Replace non-alphanumeric characters with separators
      .replace(/[^a-z0-9]/g, separator)
      // Collapse repeated separators into one
      .replace(new RegExp(`${separator}+`, "g"), separator)
      // Trim separators from both ends
      .replace(new RegExp(`^${separator}|${separator}$`, "g"), "")
  )
}
