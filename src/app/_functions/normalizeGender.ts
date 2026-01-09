/**
 * Normalize various gender representations to standardized values
 * @param gender - The gender value to normalize (can be in various formats)
 * @returns Normalized gender value: 'male', 'female', 'other', or empty string
 * @example
 * ```typescript
 * normalizeGenderValue('l') // returns 'male'
 * normalizeGenderValue('laki-laki') // returns 'male'
 * normalizeGenderValue('p') // returns 'female'
 * normalizeGenderValue('perempuan') // returns 'female'
 * normalizeGenderValue('other') // returns 'other'
 * normalizeGenderValue('') // returns ''
 * ```
 */
export function normalizeGenderValue(
  gender: string | number | undefined | null
): string {
  // Handle null, undefined, or empty values
  if (!gender) {
    return ''
  }

  // Convert to lowercase string for comparison
  const genderStr = String(gender).toLowerCase()

  // Male gender variations
  const maleValues = ['l', 'm', 'male', 'laki-laki', 'laki']
  if (maleValues.includes(genderStr)) {
    return 'male'
  }

  // Female gender variations
  const femaleValues = ['p', 'f', 'female', 'perempuan']
  if (femaleValues.includes(genderStr)) {
    return 'female'
  }

  // Any other non-empty value is considered 'other'
  return 'other'
}
