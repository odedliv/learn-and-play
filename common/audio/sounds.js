/**
 * Combined Audio Implementation
 * Uses: Error sound from Option 1 (Web Audio API)
 *       Success, Victory, and Game Over from Option 3 (Tone.js)
 *
 * This is the recommended combination based on user preference.
 */

// Web Audio context for error sound (from Option 1)
let audioContext = null;

// Tone.js synthesizers (from Option 3)
let correctSynth = null;
let isInitialized = false;

/**
 * Initialize both audio systems
 * Call this on first user interaction
 */
export function initAudio() {
    // Initialize Web Audio for error sound
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported:", e);
        }
    }

    // Initialize Tone.js for success sounds
    if (!isInitialized && typeof Tone !== 'undefined') {
        try {
            correctSynth = new Tone.Synth({
                oscillator: { type: 'triangle' },
                envelope: {
                    attack: 0.01,
                    decay: 0.2,
                    sustain: 0.2,
                    release: 0.2
                }
            }).toDestination();

            isInitialized = true;
        } catch (e) {
            console.error('Failed to initialize Tone.js:', e);
        }
    } else if (typeof Tone === 'undefined') {
        console.warn('Tone.js library not loaded. Success sounds will not work.');
    }

    return audioContext && isInitialized;
}

/**
 * Play error/fail sound using Web Audio API (from Option 1)
 * Simple descending tone
 */
export function playErrorSound() {
    if (!audioContext) {
        initAudio();
    }

    if (!audioContext) return;

    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Descending tone for error
        oscillator.type = 'sine';
        oscillator.frequency.value = 200; // Lower frequency for error

        const now = audioContext.currentTime;
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        oscillator.start(now);
        oscillator.stop(now + 0.3);
    } catch (e) {
        console.error('Error playing error sound:', e);
    }
}

/**
 * Play incorrect/wrong sound - alias for error sound
 */
export function playIncorrectSound() {
    playErrorSound();
}

/**
 * Play fail sound - alias for error sound
 */
export function playFailSound() {
    playErrorSound();
}

/**
 * Play success sound using Tone.js (from Option 3)
 * Ascending arpeggio: C5 -> E5 -> G5
 */
export function playSuccessSound() {
    if (!isInitialized) {
        initAudio();
    }

    if (!correctSynth || typeof Tone === 'undefined') {
        console.warn('Tone.js not initialized, falling back to Web Audio');
        playWebAudioSuccess();
        return;
    }

    try {
        const now = Tone.now();
        correctSynth.triggerAttackRelease("C5", "8n", now);
        correctSynth.triggerAttackRelease("E5", "8n", now + 0.15);
        correctSynth.triggerAttackRelease("G5", "8n", now + 0.3);
    } catch (e) {
        console.error('Error playing success sound:', e);
        playWebAudioSuccess(); // Fallback
    }
}

/**
 * Play correct sound - alias for success sound
 */
export function playCorrectSound() {
    playSuccessSound();
}

/**
 * Play victory fanfare using Tone.js (from Option 3)
 */
export function playVictorySound() {
    if (!isInitialized) {
        initAudio();
    }

    if (typeof Tone === 'undefined') {
        console.warn('Tone.js not available for victory sound');
        playSuccessSound(); // Fallback to regular success
        return;
    }

    try {
        const synth = new Tone.Synth({
            oscillator: { type: 'triangle' },
            envelope: {
                attack: 0.01,
                decay: 0.1,
                sustain: 0.3,
                release: 0.3
            }
        }).toDestination();

        const now = Tone.now();

        // Victory fanfare sequence
        synth.triggerAttackRelease("C5", "16n", now);
        synth.triggerAttackRelease("E5", "16n", now + 0.1);
        synth.triggerAttackRelease("G5", "16n", now + 0.2);
        synth.triggerAttackRelease("C6", "8n", now + 0.3);
        synth.triggerAttackRelease("G5", "16n", now + 0.5);
        synth.triggerAttackRelease("C6", "4n", now + 0.6);

        // Clean up
        setTimeout(() => {
            synth.dispose();
        }, 2000);

    } catch (e) {
        console.error('Error playing victory sound:', e);
    }
}

/**
 * Play game over sound using Tone.js (from Option 3)
 */
export function playGameOverSound() {
    if (!isInitialized) {
        initAudio();
    }

    if (typeof Tone === 'undefined') {
        console.warn('Tone.js not available for game over sound');
        playErrorSound(); // Fallback to error sound
        return;
    }

    try {
        const synth = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: {
                attack: 0.1,
                decay: 0.2,
                sustain: 0.1,
                release: 0.5
            }
        }).toDestination();

        const now = Tone.now();

        // Descending sad sequence
        synth.triggerAttackRelease("G4", "8n", now);
        synth.triggerAttackRelease("F4", "8n", now + 0.2);
        synth.triggerAttackRelease("E4", "8n", now + 0.4);
        synth.triggerAttackRelease("D4", "8n", now + 0.6);
        synth.triggerAttackRelease("C4", "4n", now + 0.8);

        // Clean up
        setTimeout(() => {
            synth.dispose();
        }, 2500);

    } catch (e) {
        console.error('Error playing game over sound:', e);
    }
}

/**
 * Fallback Web Audio success sound if Tone.js is not available
 */
function playWebAudioSuccess() {
    if (!audioContext) return;

    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
    } catch (e) {
        console.error('Error playing fallback success sound:', e);
    }
}

/**
 * Clean up audio resources
 */
export function disposeAudio() {
    if (correctSynth && typeof Tone !== 'undefined') {
        correctSynth.dispose();
        correctSynth = null;
    }
    isInitialized = false;
    audioContext = null;
}

// Auto-initialize on first user interaction
if (typeof window !== 'undefined') {
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });
}
