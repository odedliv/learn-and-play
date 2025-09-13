/**
 * Audio functions - Option 1: Simple Web Audio API implementation
 * Source: memory_game_engine.js
 */

let audioContext = null;

/**
 * Initialize audio context (call once on user interaction)
 */
export function initAudio() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported");
        }
    }
    return audioContext;
}

/**
 * Play a simple success sound using Web Audio API
 * Single sine wave tone
 */
export function playSuccessSound() {
    if (!audioContext) {
        initAudio();
    }

    if (!audioContext) return;

    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = 600;

        const now = audioContext.currentTime;
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        oscillator.start(now);
        oscillator.stop(now + 0.5);
    } catch (e) {
        console.error("Error playing sound:", e);
    }
}

/**
 * Play an error/incorrect sound
 * Lower frequency tone
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

        oscillator.type = 'sine';
        oscillator.frequency.value = 200; // Lower frequency for error

        const now = audioContext.currentTime;
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        oscillator.start(now);
        oscillator.stop(now + 0.3);
    } catch (e) {
        console.error("Error playing sound:", e);
    }
}
