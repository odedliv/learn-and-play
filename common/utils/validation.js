/**
 * Validation utilities
 * Common validation functions for games
 */

/**
 * Check if value is a valid number
 * @param {*} value - Value to check
 * @returns {boolean} Is valid number
 */
export function isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Check if value is in range
 * @param {number} value - Value to check
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {boolean} Is in range
 */
export function isInRange(value, min, max) {
    return isValidNumber(value) && value >= min && value <= max;
}

/**
 * Clamp value to range
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Validate range settings
 * @param {number} minValue - Minimum value
 * @param {number} maxValue - Maximum value
 * @returns {Object} Validation result
 */
export function validateRange(minValue, maxValue) {
    const errors = [];

    if (!isValidNumber(minValue)) {
        errors.push('מינימום חייב להיות מספר תקין');
    }

    if (!isValidNumber(maxValue)) {
        errors.push('מקסימום חייב להיות מספר תקין');
    }

    if (minValue < 0) {
        errors.push('מינימום לא יכול להיות שלילי');
    }

    if (maxValue < 0) {
        errors.push('מקסימום לא יכול להיות שלילי');
    }

    if (minValue > maxValue) {
        errors.push('מינימום לא יכול להיות גדול ממקסימום');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Parse integer with default value
 * @param {*} value - Value to parse
 * @param {number} defaultValue - Default value if parse fails
 * @returns {number} Parsed integer or default
 */
export function parseIntSafe(value, defaultValue = 0) {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parse float with default value
 * @param {*} value - Value to parse
 * @param {number} defaultValue - Default value if parse fails
 * @returns {number} Parsed float or default
 */
export function parseFloatSafe(value, defaultValue = 0) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Check if string is empty or whitespace
 * @param {string} str - String to check
 * @returns {boolean} Is empty or whitespace
 */
export function isEmpty(str) {
    return !str || str.trim().length === 0;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate Hebrew text
 * @param {string} text - Text to validate
 * @returns {boolean} Contains Hebrew characters
 */
export function containsHebrew(text) {
    const hebrewRegex = /[\u0590-\u05FF]/;
    return hebrewRegex.test(text);
}

/**
 * Validate answer format for division problems
 * @param {string} quotient - Quotient input
 * @param {string} remainder - Remainder input
 * @returns {Object} Validation result
 */
export function validateDivisionAnswer(quotient, remainder) {
    const errors = [];

    const q = parseIntSafe(quotient, NaN);
    const r = parseIntSafe(remainder, NaN);

    if (isNaN(q)) {
        errors.push('מנה חייבת להיות מספר שלם');
    }

    if (isNaN(r)) {
        errors.push('שארית חייבת להיות מספר שלם');
    }

    if (r < 0) {
        errors.push('שארית לא יכולה להיות שלילית');
    }

    return {
        valid: errors.length === 0,
        errors,
        quotient: q,
        remainder: r
    };
}

/**
 * Sanitize user input
 * @param {string} input - User input
 * @param {Object} options - Sanitization options
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input, options = {}) {
    const {
        allowNumbers = true,
        allowLetters = true,
        allowHebrew = true,
        allowSpaces = true,
        allowPunctuation = false,
        maxLength = 100
    } = options;

    let sanitized = input;

    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Build allowed pattern
    let pattern = '';
    if (allowNumbers) pattern += '0-9';
    if (allowLetters) pattern += 'a-zA-Z';
    if (allowHebrew) pattern += '\u0590-\u05FF';
    if (allowSpaces) pattern += '\\s';
    if (allowPunctuation) pattern += '.,!?;:\'"-';

    // Remove disallowed characters
    if (pattern) {
        const regex = new RegExp(`[^${pattern}]`, 'g');
        sanitized = sanitized.replace(regex, '');
    }

    // Limit length
    if (maxLength > 0) {
        sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
}

/**
 * Validate game settings
 * @param {Object} settings - Game settings object
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result
 */
export function validateGameSettings(settings, rules) {
    const errors = [];

    Object.entries(rules).forEach(([key, rule]) => {
        const value = settings[key];

        // Required check
        if (rule.required && (value === undefined || value === null || value === '')) {
            errors.push(`${rule.label || key} הוא שדה חובה`);
            return;
        }

        // Type check
        if (rule.type === 'number' && !isValidNumber(value)) {
            errors.push(`${rule.label || key} חייב להיות מספר`);
        }

        // Range check
        if (rule.min !== undefined && value < rule.min) {
            errors.push(`${rule.label || key} חייב להיות לפחות ${rule.min}`);
        }

        if (rule.max !== undefined && value > rule.max) {
            errors.push(`${rule.label || key} לא יכול להיות יותר מ-${rule.max}`);
        }

        // Custom validation
        if (rule.validate && !rule.validate(value, settings)) {
            errors.push(rule.message || `${rule.label || key} לא תקין`);
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
}
