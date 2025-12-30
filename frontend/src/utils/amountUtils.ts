/**
 * Utility functions for handling amounts that can be either numbers or arrays
 */

/**
 * Get the total amount from a Montant field (handles both number and array)
 * @param montant - The amount field (number or number[])
 * @returns The total amount as a number
 */
export const getTotalAmount = (montant: number | number[]): number => {
  if (Array.isArray(montant)) {
    return montant.reduce((sum, amount) => sum + amount, 0)
  }
  return montant
}

/**
 * Check if a Montant field is an array
 * @param montant - The amount field (number or number[])
 * @returns True if the amount is an array
 */
export const isArrayAmount = (montant: number | number[]): montant is number[] => {
  return Array.isArray(montant)
}

/**
 * Format an amount for display (handles both number and array)
 * @param montant - The amount field (number or number[])
 * @param showIndividual - Whether to show individual amounts for arrays
 * @returns Formatted string
 */
export const formatAmountDisplay = (
  montant: number | number[],
  showIndividual: boolean = false
): string => {
  if (Array.isArray(montant)) {
    const total = getTotalAmount(montant)
    if (showIndividual) {
      return `${total.toFixed(2)}€ (${montant.map(a => a.toFixed(2)).join(', ')})`
    }
    return `${total.toFixed(2)}€`
  }
  return `${montant.toFixed(2)}€`
}

/**
 * Create tooltip content for array amounts showing individual breakdown
 * @param montant - The amount field (number or number[])
 * @param people - Array of people names (optional, for individual breakdown)
 * @returns Tooltip content or null if not an array
 */
export const getAmountTooltip = (
  montant: number | number[],
  people?: string[]
): string | null => {
  if (!Array.isArray(montant)) {
    return null
  }

  if (people && people.length === montant.length) {
    return people.map((person, index) => `${person}: ${montant[index].toFixed(2)}€`).join('\n')
  }

  return montant.map((amount, index) => `Person ${index + 1}: ${amount.toFixed(2)}€`).join('\n')
}

/**
 * Truncate text and determine if tooltip is needed
 * @param text - The text to potentially truncate
 * @param maxLength - Maximum length before truncation
 * @returns Object with truncated text and whether tooltip is needed
 */
export const getTruncatedText = (text: string, maxLength: number = 25) => {
  const needsTooltip = text.length > maxLength
  const truncated = needsTooltip ? text.substring(0, maxLength) + '...' : text

  return {
    truncated,
    needsTooltip,
    original: text
  }
}
