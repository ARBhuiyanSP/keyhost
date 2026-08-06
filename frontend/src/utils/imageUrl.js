/**
 * imageUrl.js — Utility to build correct image URLs
 *
 * Handles:
 * - Data URIs (base64)
 * - Malformed concatenated paths like 'https://keyhost24.com/.keyhost24.com/api/uploads/...'
 * - Legacy localhost paths like 'http://localhost:5000/uploads/...'
 * - Relative paths like '/uploads/...' or '/api/uploads/...'
 * - External CDN URLs
 */

const getBackendUrl = () => {
    let apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    apiUrl = apiUrl.trim();

    // Ensure protocol exists
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
        const protocol = typeof window !== 'undefined' && window.location && window.location.protocol ? window.location.protocol : 'https:';
        apiUrl = `${protocol}//${apiUrl}`;
    }

    // Strip trailing /api or /api/
    apiUrl = apiUrl.replace(/\/api\/?$/i, '');

    // Strip trailing slash
    apiUrl = apiUrl.replace(/\/+$/, '');

    return apiUrl;
};

/**
 * Normalize any image URL into a full, valid backend URL:
 * @param {string} url
 * @returns {string}
 */
export const getImageUrl = (url) => {
    if (!url || typeof url !== 'string') return '';

    const cleanUrl = url.trim();
    if (!cleanUrl) return '';

    // 1. Base64 / data URI — return as-is
    if (cleanUrl.startsWith('data:')) return cleanUrl;

    // 2. Extract relative upload path if it contains 'uploads/'
    const uploadsIdx = cleanUrl.indexOf('uploads/');
    if (uploadsIdx !== -1) {
        const backendUrl = getBackendUrl();
        const relativeUploadPath = cleanUrl.substring(uploadsIdx); // 'uploads/properties/...'
        if (cleanUrl.includes('api/uploads/')) {
            const apiUploadsIdx = cleanUrl.indexOf('api/uploads/');
            return `${backendUrl}/${cleanUrl.substring(apiUploadsIdx)}`;
        }
        return `${backendUrl}/api/${relativeUploadPath}`;
    }

    // 3. External full HTTP/HTTPS URL (e.g. Cloudinary, AWS S3)
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        return cleanUrl;
    }

    // 4. Relative fallback
    const backendUrl = getBackendUrl();
    const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
    return `${backendUrl}${path}`;
};

/**
 * Get the first valid image URL from an array or JSON string of images.
 * @param {Array|string} images
 * @returns {string|null}
 */
export const getFirstImageUrl = (images) => {
    let list = images;
    if (typeof list === 'string') {
        try { list = JSON.parse(list); } catch (e) { return null; }
    }
    if (!Array.isArray(list) || list.length === 0) return null;
    const first = list[0];
    if (!first) return null;
    return getImageUrl(first);
};

export default getImageUrl;

