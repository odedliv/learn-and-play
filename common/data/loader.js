/**
 * Data loading utilities
 * Common patterns for loading JSON and other data files
 */

/**
 * Load JSON data from a URL
 * @param {string} url - URL to fetch JSON from
 * @returns {Promise<Object>} Parsed JSON data
 */
export async function loadJSON(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error loading JSON:', error);
        throw error;
    }
}

/**
 * Load multiple JSON files in parallel
 * @param {string[]} urls - Array of URLs to fetch
 * @returns {Promise<Object[]>} Array of parsed JSON data
 */
export async function loadMultipleJSON(urls) {
    try {
        const promises = urls.map(url => loadJSON(url));
        return await Promise.all(promises);
    } catch (error) {
        console.error('Error loading multiple JSON files:', error);
        throw error;
    }
}

/**
 * Load JSON with retry logic
 * @param {string} url - URL to fetch JSON from
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} retryDelay - Delay between retries in milliseconds
 * @returns {Promise<Object>} Parsed JSON data
 */
export async function loadJSONWithRetry(url, maxRetries = 3, retryDelay = 1000) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await loadJSON(url);
        } catch (error) {
            lastError = error;
            console.warn(`Attempt ${i + 1} failed, retrying...`);

            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }

    throw lastError;
}

/**
 * Load and cache JSON data
 * Uses browser sessionStorage for caching
 * @param {string} url - URL to fetch JSON from
 * @param {string} cacheKey - Key for cache storage
 * @param {number} cacheTime - Cache validity time in milliseconds (default: 5 minutes)
 * @returns {Promise<Object>} Parsed JSON data
 */
export async function loadJSONWithCache(url, cacheKey, cacheTime = 5 * 60 * 1000) {
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
        const { data, timestamp } = JSON.parse(cached);

        if (Date.now() - timestamp < cacheTime) {
            console.log(`Using cached data for ${cacheKey}`);
            return data;
        }
    }

    const data = await loadJSON(url);

    sessionStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
    }));

    return data;
}

/**
 * Preload multiple resources
 * @param {string[]} urls - Array of URLs to preload
 * @returns {Promise<void>}
 */
export async function preloadResources(urls) {
    const promises = urls.map(url => {
        if (url.endsWith('.json')) {
            return loadJSON(url);
        } else if (url.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
            return preloadImage(url);
        } else if (url.match(/\.(mp3|wav|ogg)$/i)) {
            return preloadAudio(url);
        }
        return fetch(url);
    });

    await Promise.all(promises);
}

/**
 * Preload an image
 * @param {string} url - Image URL
 * @returns {Promise<HTMLImageElement>}
 */
function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

/**
 * Preload an audio file
 * @param {string} url - Audio URL
 * @returns {Promise<HTMLAudioElement>}
 */
function preloadAudio(url) {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
        audio.addEventListener('error', reject, { once: true });
        audio.src = url;
    });
}
