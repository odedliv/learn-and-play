# Common Library Implementation Plan
**Date:** 2025-09-07
**Project:** Learn and Play - Common Utilities Library

## 🎯 Objective
Create a reusable common library to eliminate code duplication and standardize functionality across all games in the Learn and Play application.

## 📊 Current State Analysis

### Duplicate Code Found
1. **shuffleArray function**: Appears in 2+ files with identical implementation
2. **Audio feedback**: 4 different implementations across files
3. **Timer logic**: 3 different timer implementations
4. **JSON loading**: 2 similar but separate implementations

### Most Critical Issues
- No standardized success/error sounds across games
- Each game implements its own timer differently
- Fisher-Yates shuffle is copy-pasted instead of imported

## 🏗️ Proposed File Structure

```
learn-and-play/
├── common/
│   ├── audio/
│   │   ├── AudioManager.js
│   │   ├── sounds.js
│   │   └── tones.js
│   ├── utils/
│   │   ├── array.js
│   │   ├── random.js
│   │   └── validation.js
│   ├── game/
│   │   ├── Timer.js
│   │   ├── Score.js
│   │   └── GameState.js
│   ├── data/
│   │   ├── loader.js
│   │   └── cache.js
│   └── ui/
│       ├── modal.js
│       └── notifications.js
├── language/
├── index.html
└── [other game files]
```

## 📝 Implementation Files

### File 1: `common/utils/array.js`
```javascript
/**
 * Shuffles array in place using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} The shuffled array
 */
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Pick random elements from array
 * @param {Array} array - Source array
 * @param {number} count - Number of elements to pick
 * @returns {Array} Array of random elements
 */
export function pickRandom(array, count) {
    const shuffled = shuffleArray([...array]);
    return shuffled.slice(0, count);
}

/**
 * Remove duplicates from array
 * @param {Array} array - Array with potential duplicates
 * @returns {Array} Array with unique values
 */
export function unique(array) {
    return [...new Set(array)];
}
```

### File 2: `common/audio/AudioManager.js`
```javascript
/**
 * Centralized audio management for all games
 */
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 1.0;
        this.sounds = {
            success: { frequency: 600, duration: 0.5, type: 'sine' },
            error: { frequency: 200, duration: 0.3, type: 'sawtooth' },
            click: { frequency: 1000, duration: 0.1, type: 'square' },
            victory: {
                notes: [
                    { frequency: 392, duration: 0.2 },
                    { frequency: 330, duration: 0.1 },
                    { frequency: 262, duration: 0.1 },
                    { frequency: 523, duration: 0.3 }
                ]
            }
        };
    }

    init() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.error("Web Audio API not supported:", e);
                return false;
            }
        }
        return true;
    }

    playSound(soundName) {
        if (!this.init()) return;

        const sound = this.sounds[soundName];
        if (!sound) {
            console.warn(`Sound "${soundName}" not found`);
            return;
        }

        if (sound.notes) {
            this.playSequence(sound.notes);
        } else {
            this.playTone(sound.frequency, sound.duration, sound.type);
        }
    }

    playTone(frequency, duration, type = 'sine') {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0.3 * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    playSequence(notes) {
        let time = this.audioContext.currentTime;
        notes.forEach(note => {
            this.scheduleTone(note.frequency, note.duration, time, note.type || 'sine');
            time += note.duration + 0.05;
        });
    }

    scheduleTone(frequency, duration, startTime, type = 'sine') {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.5 * this.masterVolume, startTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0.3 * this.masterVolume, startTime + duration - 0.1);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }

    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
}

// Export singleton instance
export const audioManager = new AudioManager();
```

### File 3: `common/game/Timer.js`
```javascript
/**
 * Reusable game timer with countdown and countup modes
 */
export class GameTimer {
    constructor(options = {}) {
        this.mode = options.mode || 'countdown'; // 'countdown' or 'countup'
        this.duration = options.duration || 120; // seconds
        this.onTick = options.onTick || (() => {});
        this.onComplete = options.onComplete || (() => {});
        this.onWarning = options.onWarning || (() => {});
        this.warningTime = options.warningTime || 10; // seconds

        this.timeLeft = this.mode === 'countdown' ? this.duration : 0;
        this.intervalId = null;
        this.isPaused = false;
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.intervalId = setInterval(() => {
            if (!this.isPaused) {
                this.tick();
            }
        }, 1000);
    }

    tick() {
        if (this.mode === 'countdown') {
            this.timeLeft--;

            if (this.timeLeft === this.warningTime) {
                this.onWarning(this.timeLeft);
            }

            this.onTick(this.timeLeft);

            if (this.timeLeft <= 0) {
                this.stop();
                this.onComplete();
            }
        } else {
            this.timeLeft++;
            this.onTick(this.timeLeft);
        }
    }

    stop() {
        clearInterval(this.intervalId);
        this.isRunning = false;
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    reset() {
        this.stop();
        this.timeLeft = this.mode === 'countdown' ? this.duration : 0;
        this.isPaused = false;
    }

    getFormattedTime() {
        const minutes = Math.floor(Math.abs(this.timeLeft) / 60);
        const seconds = Math.abs(this.timeLeft) % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    getProgress() {
        if (this.mode === 'countdown') {
            return (this.duration - this.timeLeft) / this.duration;
        }
        return this.timeLeft / this.duration;
    }
}
```

## 🔄 Migration Example

### Before (in color_game.html):
```javascript
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Usage
cards = shuffleArray(gameCards);
```

### After:
```javascript
import { shuffleArray } from '/common/utils/array.js';

// Usage remains the same
cards = shuffleArray(gameCards);
```

## 📋 Migration Checklist

### Phase 1: Setup (Week 1)
- [ ] Create `/common` directory structure
- [ ] Implement `array.js` with shuffleArray
- [ ] Implement `AudioManager.js`
- [ ] Implement `Timer.js`
- [ ] Add basic tests

### Phase 2: Integration (Week 2)
- [ ] Update `memory_game_engine.js` to use common/utils
- [ ] Update `color_game.html` to use common/utils
- [ ] Update all games to use AudioManager
- [ ] Update timer implementations

### Phase 3: Enhancement (Week 3)
- [ ] Add data loader utilities
- [ ] Add game state management
- [ ] Add UI components
- [ ] Complete documentation

### Phase 4: Testing & Polish (Week 4)
- [ ] Unit tests for all common functions
- [ ] Integration testing
- [ ] Performance optimization
- [ ] Final documentation

## 🎯 Success Metrics

1. **Code Reduction**: At least 30% reduction in duplicate code
2. **Consistency**: All games use same audio feedback
3. **Maintainability**: Changes to common functions affect all games
4. **Performance**: No degradation in game performance
5. **Developer Experience**: Easier to add new games

## 📌 Notes for Implementation

1. **Browser Compatibility**: Ensure all common functions work in target browsers
2. **Module Loading**: Consider using ES6 modules or a bundler
3. **Fallbacks**: Provide fallbacks for unsupported features
4. **Documentation**: Use JSDoc for all public functions
5. **Testing**: Create test suite for common library

## 🚀 Quick Start Commands

```bash
# Create directory structure
mkdir -p common/{audio,utils,game,data,ui}

# Create initial files
touch common/utils/array.js
touch common/audio/AudioManager.js
touch common/game/Timer.js

# Add to git
git add common/
git commit -m "feat: Initialize common library structure"
```

## 📝 Next Session Tasks

1. Implement `common/utils/array.js` with tests
2. Implement `common/audio/AudioManager.js`
3. Update one game (suggest `memory_game_engine.js`) to use common library
4. Document usage patterns
5. Create migration guide for remaining games

