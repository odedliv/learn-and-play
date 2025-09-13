/**
 * Audio functions - Option 3: Tone.js library implementation
 * Source: division_signs.html
 *
 * Note: Requires Tone.js library to be loaded:
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js"></script>
 */

let correctSynth = null;
let wrongSynth = null;
let isInitialized = false;

/**
 * Initialize Tone.js synthesizers
 * Call this on first user interaction
 */
export function initToneAudio() {
    if (isInitialized || typeof Tone === 'undefined') {
        if (typeof Tone === 'undefined') {
            console.error('Tone.js library not loaded. Please include Tone.js script.');
        }
        return;
    }

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

        wrongSynth = new Tone.MembraneSynth({
            pitchDecay: 0.01,
            octaves: 6,
            envelope: {
                attack: 0.001,
                decay: 0.2,
                sustain: 0.01,
                release: 0.2
            }
        }).toDestination();

        isInitialized = true;
    } catch (e) {
        console.error('Failed to initialize Tone.js audio:', e);
    }
}

/**
 * Play success sound using Tone.js
 * Plays an ascending arpeggio: C5 -> E5 -> G5
 */
export function playToneSuccess() {
    if (!isInitialized) {
        initToneAudio();
    }

    if (!correctSynth) {
        console.warn('Tone.js not initialized');
        return;
    }

    try {
        const now = Tone.now();
        correctSynth.triggerAttackRelease("C5", "8n", now);
        correctSynth.triggerAttackRelease("E5", "8n", now + 0.15);
        correctSynth.triggerAttackRelease("G5", "8n", now + 0.3);
    } catch (e) {
        console.error('Error playing success sound:', e);
    }
}

/**
 * Play error/wrong sound using Tone.js
 * Uses MembraneSynth for a drum-like thud
 */
export function playToneError() {
    if (!isInitialized) {
        initToneAudio();
    }

    if (!wrongSynth) {
        console.warn('Tone.js not initialized');
        return;
    }

    try {
        const now = Tone.now();
        wrongSynth.triggerAttackRelease("C2", "8n", now);
    } catch (e) {
        console.error('Error playing error sound:', e);
    }
}

/**
 * Play a custom note sequence
 * @param {Array} notes - Array of note objects with frequency and duration
 * @param {string} synthType - Type of oscillator: 'sine', 'triangle', 'square', 'sawtooth'
 */
export function playToneSequence(notes, synthType = 'triangle') {
    if (!isInitialized) {
        initToneAudio();
    }

    try {
        const synth = new Tone.Synth({
            oscillator: { type: synthType }
        }).toDestination();

        const now = Tone.now();
        let time = now;

        notes.forEach(note => {
            synth.triggerAttackRelease(
                note.frequency || note.note,
                note.duration || "8n",
                time
            );
            time += note.delay || 0.15;
        });

        // Clean up synth after sequence completes
        setTimeout(() => {
            synth.dispose();
        }, (time - now + 1) * 1000);

    } catch (e) {
        console.error('Error playing sequence:', e);
    }
}

/**
 * Play a chord using Tone.js
 * @param {Array} notes - Array of note names (e.g., ["C4", "E4", "G4"])
 * @param {string} duration - Duration (e.g., "4n", "8n")
 */
export function playToneChord(notes, duration = "4n") {
    if (!isInitialized) {
        initToneAudio();
    }

    try {
        const polySynth = new Tone.PolySynth(Tone.Synth).toDestination();
        polySynth.triggerAttackRelease(notes, duration);

        // Clean up after playing
        setTimeout(() => {
            polySynth.dispose();
        }, 2000);

    } catch (e) {
        console.error('Error playing chord:', e);
    }
}

/**
 * Create and play a more complex victory fanfare
 */
export function playToneVictory() {
    if (!isInitialized) {
        initToneAudio();
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
 * Create and play a game over sound
 */
export function playToneGameOver() {
    if (!isInitialized) {
        initToneAudio();
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
 * Clean up all Tone.js resources
 */
export function disposeToneAudio() {
    if (correctSynth) {
        correctSynth.dispose();
        correctSynth = null;
    }
    if (wrongSynth) {
        wrongSynth.dispose();
        wrongSynth = null;
    }
    isInitialized = false;
}
