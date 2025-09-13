/**
 * Helper to connect tests to real implementation
 * This bridges the gap between test code and actual game code
 *
 * Usage in tests:
 * import { getRealImplementation } from '../helpers/connect-real-code.js';
 * const { shuffleArray } = getRealImplementation();
 */

// Helper to load real functions from the game engine
export function getRealImplementation() {
    // Check if MemoryGame is available (loaded from memory_game_engine.js)
    if (typeof MemoryGame !== 'undefined') {
        return {
            shuffleArray: MemoryGame.shuffleArray,
            formatTopicName: MemoryGame.formatTopicName,
            prepareGameData: MemoryGame.prepareGameData,
            // Add more functions as needed
        };
    }

    // Fallback to mock implementations for testing the test framework itself
    console.warn('MemoryGame not loaded, using mock implementations');
    return {
        shuffleArray: mockShuffleArray,
        formatTopicName: mockFormatTopicName,
        prepareGameData: mockPrepareGameData,
    };
}

// Mock implementations (same as in tests, for fallback)
function mockShuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function mockFormatTopicName(fileName) {
    return fileName
        .replace('.json', '')
        .replace(/_/g, ' ');
}

function mockPrepareGameData(jsonData) {
    // Simplified mock version
    if (jsonData.pairs) {
        return jsonData.pairs.slice(0, 10);
    } else if (jsonData.entries) {
        return jsonData.entries.slice(0, 10).map(entry => [
            entry.base,
            entry.alternatives[0]
        ]);
    }
    return [];
}

// Helper to load actual game files
export async function loadGameEngine() {
    try {
        // Dynamically import the game engine as ES6 module
        const script = document.createElement('script');
        script.src = '/language/memory_game_engine.js';
        script.type = 'module';
        document.head.appendChild(script);

        // Wait for script to load
        return new Promise((resolve, reject) => {
            script.onload = () => {
                console.log('Game engine loaded successfully');
                resolve(true);
            };
            script.onerror = () => {
                console.error('Failed to load game engine');
                reject(new Error('Failed to load game engine'));
            };
        });
    } catch (error) {
        console.error('Error loading game engine:', error);
        return false;
    }
}

// Helper to create DOM elements for testing
export function createTestDOM() {
    const container = document.createElement('div');
    container.id = 'test-container';
    container.innerHTML = `
        <div id="topic-selection-container">
            <div id="topic-selection-area"></div>
        </div>
        <div id="memory-game-container" style="display: none;">
            <div class="game-board"></div>
            <div class="game-status"></div>
        </div>
    `;
    document.body.appendChild(container);
    return container;
}

// Helper to clean up after tests
export function cleanupTestDOM() {
    const container = document.getElementById('test-container');
    if (container) {
        container.remove();
    }
}

// Helper to wait for async operations
export function waitFor(condition, timeout = 3000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const interval = setInterval(() => {
            if (condition()) {
                clearInterval(interval);
                resolve();
            } else if (Date.now() - start > timeout) {
                clearInterval(interval);
                reject(new Error('Timeout waiting for condition'));
            }
        }, 100);
    });
}

// Helper to simulate user interactions
export const simulate = {
    click(element) {
        const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    },

    type(element, text) {
        element.value = text;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
    },

    keyPress(element, key) {
        const event = new KeyboardEvent('keydown', {
            key: key,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }
};

// Test data fixtures
export const testFixtures = {
    pairsFormat: {
        pairs: [
            ['גדול', 'קטן'],
            ['שמח', 'עצוב'],
            ['חם', 'קר'],
            ['מהר', 'לאט'],
            ['למעלה', 'למטה']
        ]
    },

    entriesFormat: {
        entries: [
            { base: 'יפה', alternatives: ['נאה', 'מהמם', 'נחמד'] },
            { base: 'מהיר', alternatives: ['זריז', 'מהר', 'חפוז'] },
            { base: 'חכם', alternatives: ['פיקח', 'נבון', 'משכיל'] }
        ]
    },

    emptyData: {
        pairs: []
    },

    corruptData: {
        notValid: 'json structure'
    }
};


