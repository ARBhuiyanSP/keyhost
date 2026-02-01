// Utility functions for managing recently viewed properties

const STORAGE_KEY = 'recently_viewed_properties';
const MAX_RECENT_ITEMS = 20; // Maximum number of recently viewed properties to store

/**
 * Add a property to recently viewed list
 * @param {Object} property - Property object with at least { id, title, base_price, city, state, main_image }
 */
export const addToRecentlyViewed = (property) => {
  try {
    if (!property || !property.id) return;

    // Get existing recently viewed properties
    const existing = getRecentlyViewed();
    
    // Remove the property if it already exists (to avoid duplicates)
    const filtered = existing.filter(p => p.id !== property.id);
    
    // Add the new property at the beginning
    const updated = [
      {
        id: property.id,
        title: property.title,
        base_price: property.base_price,
        city: property.city,
        state: property.state,
        main_image: property.main_image || property.images?.[0]?.image_url || null,
        average_rating: property.average_rating,
        total_reviews: property.total_reviews,
        viewedAt: new Date().toISOString()
      },
      ...filtered
    ].slice(0, MAX_RECENT_ITEMS); // Keep only the most recent items

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('recentlyViewedUpdated', { detail: updated }));
  } catch (error) {
    console.error('Error adding to recently viewed:', error);
  }
};

/**
 * Get recently viewed properties
 * @param {number} limit - Maximum number of properties to return
 * @returns {Array} Array of recently viewed properties
 */
export const getRecentlyViewed = (limit = 10) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const properties = JSON.parse(stored);
    return properties.slice(0, limit);
  } catch (error) {
    console.error('Error getting recently viewed:', error);
    return [];
  }
};

/**
 * Clear all recently viewed properties
 */
export const clearRecentlyViewed = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing recently viewed:', error);
  }
};

/**
 * Remove a specific property from recently viewed
 * @param {number} propertyId - ID of the property to remove
 */
export const removeFromRecentlyViewed = (propertyId) => {
  try {
    const existing = getRecentlyViewed();
    const filtered = existing.filter(p => p.id !== propertyId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from recently viewed:', error);
  }
};

