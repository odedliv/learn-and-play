/**
 * Audio functions - Option 2: Musical notes sequence
 * Source: division_with_remainder.html
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
            console.error("Web Audio API is not supported in this browser:", e);
        }
    }
    return audioContext;
}

/**
 * Play a sequence of musical notes for correct answer
 * Plays ascending melody: G4 -> E4 -> C4 -> C5
 */
export function playCorrectSound() {
    if (!audioContext) {
        initAudio();
    }

    if (!audioContext) return;

    const notes = [
        { frequency: 392, duration: 0.2 }, // G4 (Sol)
        { frequency: 330, duration: 0.1 }, // E4 (Mi)
        { frequency: 262, duration: 0.1 }, // C4 (Do)
        { frequency: 523, duration: 0.1 }  // C5 (High Do)
    ];

    let time = audioContext.currentTime;
    notes.forEach(note => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = note.frequency;

        gainNode.gain.setValueAtTime(0.3, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + note.duration);

        oscillator.start(time);
        oscillator.stop(time + note.duration);

        time += note.duration + 0.05; // Add a small pause between notes
    });
}

/**
 * Play a "wood tap" sound for incorrect answer using base64 WAV
 */
export function playIncorrectSound() {
    // This is a valid Base64 encoded WAV file for a simple tap/click sound
    const incorrectSoundBase64 = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARgAAIAAAACAAAACsAAAByAAAAAEACABAAAAAAAAAgAIAQACABQAAAEACABAAAAABAAIAAAAABAAEAIAAAAEABAAEAAAAAByAAA//w=';
    const incorrectSound = new Audio(incorrectSoundBase64);
    incorrectSound.play().catch(e => console.error("Error playing incorrect sound:", e));
}

/**
 * Play a descending sequence for error/wrong answer (alternative)
 */
export function playErrorSound() {
    if (!audioContext) {
        initAudio();
    }

    if (!audioContext) return;

    const notes = [
        { frequency: 392, duration: 0.15 }, // G4
        { frequency: 349, duration: 0.15 }, // F4
        { frequency: 330, duration: 0.15 }, // E4
        { frequency: 262, duration: 0.2 }   // C4
    ];

    let time = audioContext.currentTime;
    notes.forEach(note => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = note.frequency;

        gainNode.gain.setValueAtTime(0.25, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + note.duration);

        oscillator.start(time);
        oscillator.stop(time + note.duration);

        time += note.duration;
    });
}
