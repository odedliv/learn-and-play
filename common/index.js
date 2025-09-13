/**
 * Common Library Index
 * Central export point for all common utilities
 *
 * Usage:
 * import { shuffleArray, GameTimer, loadJSON } from '../common/index.js';
 *
 * Or import specific modules:
 * import { shuffleArray } from '../common/utils/array.js';
 */

// Array utilities
export {
    shuffleArray,
    shuffleArrayCopy,
    pickRandom,
    getRandomElement
} from './utils/array.js';

// DOM utilities
export {
    createElement,
    $,
    $$,
    on,
    delegate,
    show,
    hide,
    toggle,
    addClass,
    removeClass,
    toggleClass,
    empty,
    setChildren,
    animate,
    waitForElement,
    isInViewport
} from './utils/dom.js';

// Validation utilities
export {
    isValidNumber,
    isInRange,
    clamp,
    validateRange,
    parseIntSafe,
    parseFloatSafe,
    isEmpty,
    isValidEmail,
    containsHebrew,
    validateDivisionAnswer,
    sanitizeInput,
    validateGameSettings
} from './utils/validation.js';

// Audio functions - Option 1 (Simple Web Audio)
export {
    initAudio as initAudioSimple,
    playSuccessSound as playSuccessSoundSimple,
    playErrorSound as playErrorSoundSimple
} from './audio/sounds_option_1.js';

// Audio functions - Option 2 (Musical notes)
export {
    initAudio as initAudioMusical,
    playCorrectSound as playCorrectSoundMusical,
    playIncorrectSound as playIncorrectSoundMusical,
    playErrorSound as playErrorSoundMusical
} from './audio/sounds_option_2.js';

// Timer utilities - Option 1 (Function-based)
export {
    createCountdownTimer,
    createStopwatch,
    formatTime,
    formatTimeHebrew
} from './timer/timer_option_1.js';

// Timer utilities - Option 2 (Class-based)
export { GameTimer } from './timer/timer_option_2.js';

// Timer utilities - Option 3 (Circular progress)
export {
    createCircularTimer,
    createTimerSVG
} from './timer/timer_option_3.js';

// Audio functions - Option 3 (Tone.js library)
export {
    initToneAudio,
    playToneSuccess,
    playToneError,
    playToneSequence,
    playToneChord,
    playToneVictory,
    playToneGameOver,
    disposeToneAudio
} from './audio/sounds_option_3.js';

// Data loading utilities
export {
    loadJSON,
    loadMultipleJSON,
    loadJSONWithRetry,
    loadJSONWithCache,
    preloadResources
} from './data/loader.js';

// UI/Modal utilities
export {
    createModal,
    showAlert,
    showConfirm,
    showNotification
} from './ui/modal.js';

// Game state utilities
export {
    GameState,
    ScoreManager,
    StatsTracker
} from './game/state.js';

/**
 * Version information
 */
export const VERSION = '1.0.0';

/**
 * Library initialization (if needed)
 * Call this once when your app starts
 */
export function initCommonLibrary() {
    console.log(`Common Library v${VERSION} initialized`);

    // Add any global initialization here if needed
    // For example, polyfills or global event listeners

    return {
        version: VERSION,
        modules: {
            array: true,
            dom: true,
            validation: true,
            audio: true,
            timer: true,
            data: true,
            ui: true,
            game: true
        }
    };
}
