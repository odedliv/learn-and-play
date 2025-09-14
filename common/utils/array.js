/**
 * Array utility functions
 */

/**
 * Shuffles array in place using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle (will be modified in place)
 * @returns {Array} The shuffled array (same reference)
 */
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Creates a shuffled copy of an array
 * @param {Array} array - Array to shuffle
 * @returns {Array} A new shuffled array
 */
export function shuffleArrayCopy(array) {
    const newArray = [...array];
    return shuffleArray(newArray);
}

/**
 * Pick random elements from array
 * @param {Array} array - Source array
 * @param {number} count - Number of elements to pick
 * @returns {Array} Array of randomly picked elements
 */
export function pickRandom(array, count) {
    // Handle invalid count values
    if (count <= 0 || !Number.isFinite(count)) {
        return [];
    }
    const shuffled = shuffleArrayCopy(array);
    return shuffled.slice(0, count);
}

/**
 * Get a random element from array
 * @param {Array} array - Source array
 * @returns {*} Random element from array
 */
export function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}
