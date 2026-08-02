
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

/**
 * Gets a contextual subtitle/description for a given city to display in suggestions.
 * 
 * @param {string} city - The city name
 * @returns {string} - The descriptive subtitle
 */
export const getLocationSubtitle = (city) => {
    if (!city || typeof city !== 'string') return 'Popular curated destination';
    const c = city.toLowerCase().trim();
    if (c.includes('dhaka')) return 'Explore the rich history, museums, and food';
    if (c.includes("cox's bazar") || c.includes('coxs bazar') || c.includes('cox')) return 'World\'s longest natural sandy beach';
    if (c.includes('sylhet')) return 'Enjoy rolling tea gardens and swamp forests';
    if (c.includes('chittagong') || c.includes('chattogram')) return 'Green hills, scenic lakes, and historic ports';
    if (c.includes('sajek')) return 'Relax above the clouds in the hills';
    if (c.includes('kuala lumpur') || c.includes('kuala') || c.includes('lumpur')) return 'For sights like Petronas Twin Towers';
    if (c.includes('bangkok')) return 'Bustling street life and shrines';
    if (c.includes('dubai')) return 'Popular luxury shopping and architecture';
    return 'Popular curated destination to stay';
};
