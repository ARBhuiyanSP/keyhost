
/**
 * Sanitizes text by removing special characters.
 * Allows letters (Unicode), marks (for diacritics/vowels), numbers, whitespace,
 * and standard punctuation (.,!?'"()-).
 * 
 * @param {string} text - The input text to sanitize
 * @returns {string} - The sanitized text
 */
export const sanitizeText = (text) => {
    if (typeof text !== 'string') return text;
    // Replace any character that is NOT in the allowed set with an empty string.
    // Allowed:
    // \p{L} - Any Unicode letter
    // \p{M} - Any Unicode mark (e.g. accents, vowel signs)
    // \p{N} - Any Unicode number
    // \s - Whitespace
    // allowed: letters, marks, numbers, whitespace, and causing punctuation: . , ! ? ' " ( ) - : / &
    return text.replace(/[^\p{L}\p{M}\p{N}\s.,!?'"():\/&\-]/gu, '');
};
/**
 * Formats a price value.
 * Removes decimals if they are zero.
 * 
 * @param {number|string} price - The price to format
 * @returns {string} - Formatted price
 */
export const formatPrice = (price) => {
    if (price === null || price === undefined || price === '') return '0';
    const num = Number(price);
    if (isNaN(num)) return price;
    
    // Format with commas, remove decimals if they are zero
    return num.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
    });
};
