# Common Library

A collection of reusable JavaScript utilities extracted from the Learn and Play games.

## Structure

```
common/
├── audio/          # Audio playback functions
│   └── sounds.js   # Combined implementation (Web Audio + Tone.js)
├── data/           # Data loading utilities
│   └── loader.js   # JSON loading, caching, preloading
├── game/           # Game state management
│   └── state.js    # GameState, ScoreManager, StatsTracker
├── timer/          # Timer implementations
│   └── countdown_timer.js  # Circular SVG progress countdown timer
├── ui/             # UI components
│   └── modal.js    # Modal dialogs and notifications
├── utils/          # General utilities
│   ├── array.js    # Array manipulation (shuffle, etc.)
│   ├── dom.js      # DOM helpers
│   └── validation.js # Input validation
└── index.js        # Main export file
```

## Usage

### Import Everything
```javascript
import * as Common from '../common/index.js';

// Use utilities
Common.shuffleArray(myArray);
const timer = new Common.GameTimer({ duration: 60 });
```

### Import Specific Functions
```javascript
import { shuffleArray, GameTimer, loadJSON } from '../common/index.js';
```

### Recommended Audio Implementation
```javascript
// Import the combined sound functions (best of both worlds)
import {
    initAudio,
    playSuccessSound,
    playErrorSound,
    playVictorySound,
    playGameOverSound
} from '../common/audio/sounds.js';

// Initialize once on user interaction
document.addEventListener('click', initAudio, { once: true });

// Use in your game
if (isCorrect) {
    playSuccessSound();
} else {
    playErrorSound();
}

// For game completion
if (wonGame) {
    playVictorySound();
} else {
    playGameOverSound();
}
```

### Import from Specific Modules
```javascript
import { shuffleArray } from '../common/utils/array.js';
import { createCircularTimer } from '../common/timer/countdown_timer.js';
```

## Available Functions

### Array Utilities (`utils/array.js`)
- `shuffleArray(array)` - Fisher-Yates shuffle in-place
- `shuffleArrayCopy(array)` - Returns shuffled copy
- `pickRandom(array, count)` - Pick random elements
- `getRandomElement(array)` - Get single random element

### Audio Functions (`audio/sounds.js`)

**Combined implementation using Web Audio API for errors and Tone.js for success sounds**

- `initAudio()` - Initialize both audio systems (call on first user interaction)
- `playSuccessSound()` / `playCorrectSound()` - Ascending arpeggio (C5→E5→G5) using Tone.js
- `playErrorSound()` / `playIncorrectSound()` / `playFailSound()` - Simple error tone using Web Audio
- `playVictorySound()` - Victory fanfare sequence using Tone.js
- `playGameOverSound()` - Descending melody using Tone.js
- `disposeAudio()` - Clean up audio resources

**Note:** Requires Tone.js library for full functionality:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js"></script>
```

### Timer Utilities

#### Countdown Timer with Circular Progress (`timer/countdown_timer.js`)
```javascript
// Create SVG visual timer
const { container, progressCircle, textDisplay } = createTimerSVG();
document.body.appendChild(container);

// Create timer with circular progress
const timer = createCircularTimer({
    duration: 120,
    svgCircle: progressCircle,
    textElement: textDisplay,
    warningTime: 10,
    onComplete: () => endGame()
});
timer.start();
```

### Data Loading (`data/loader.js`)
- `loadJSON(url)` - Load and parse JSON
- `loadMultipleJSON(urls)` - Load multiple files
- `loadJSONWithRetry(url, maxRetries)` - With retry logic
- `loadJSONWithCache(url, cacheKey)` - With caching
- `preloadResources(urls)` - Preload various resources

### UI/Modal (`ui/modal.js`)
```javascript
// Simple alert
await showAlert('Game Over!', 'Results');

// Confirmation dialog
const confirmed = await showConfirm('Start new game?');

// Temporary notification
showNotification('Correct!', 'success', 3000);

// Custom modal
const modal = createModal({
    title: 'Welcome',
    message: 'Choose difficulty',
    buttons: [
        { text: 'Easy', onClick: () => startEasy() },
        { text: 'Hard', onClick: () => startHard() }
    ]
});
modal.show();
```

### Game State (`game/state.js`)

#### GameState Manager
```javascript
const state = new GameState({
    score: 0,
    level: 1,
    lives: 3
});

state.subscribe((newState, changes) => {
    console.log('State changed:', changes);
});

state.set('score', 100);
state.update({ level: 2, lives: 2 });
state.reset();
```

#### Score Manager
```javascript
const score = new ScoreManager();
score.addPoints(10);
score.getHighScore();
```

#### Stats Tracker
```javascript
const stats = new StatsTracker();
stats.recordGame(true, 100, 60);
stats.getWinRate(); // Returns percentage
```

### DOM Utilities (`utils/dom.js`)
```javascript
// Create elements
const button = createElement('button',
    { className: 'btn', onclick: handleClick },
    'Click me!'
);

// Query helpers
const element = $('#game-board');
const cards = $$('.card');

// Event delegation
delegate(document.body, 'click', '.card', handleCardClick);

// Visibility
show(element);
hide(element);
toggle(element);

// Classes
addClass(cards, 'flipped', 'matched');
removeClass(cards, 'hidden');

// Animation
await animate(element, 'fade-in', 500);
```

### Validation (`utils/validation.js`)
```javascript
// Number validation
isValidNumber(value);
isInRange(value, 1, 100);
clamp(value, 0, 10);

// Safe parsing
const num = parseIntSafe(userInput, 0);

// Game settings validation
const result = validateGameSettings(settings, {
    minValue: {
        type: 'number',
        min: 1,
        required: true,
        label: 'מינימום'
    },
    maxValue: {
        type: 'number',
        validate: (val, settings) => val > settings.minValue,
        message: 'מקסימום חייב להיות גדול ממינימום'
    }
});

if (!result.valid) {
    console.error(result.errors);
}
```

## Migration Guide

To migrate existing code to use the common library:

1. **Replace `shuffleArray` implementations:**
```javascript
// Before (in each file)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// After
import { shuffleArray } from '../common/utils/array.js';
```

2. **Replace timer implementations:**
```javascript
// Before
let timerInterval = setInterval(() => {
    timeLeft--;
    updateDisplay(timeLeft);
}, 1000);

// After
import { createCircularTimer } from '../common/timer/countdown_timer.js';
const timer = createCircularTimer({
    duration: 60,
    textElement: timerDisplay,
    onComplete: onComplete
});
timer.start();
```

3. **Replace audio functions:**
```javascript
// Before (custom implementation)
function playSuccessSound() { /* ... */ }

// After
import { playSuccessSoundSimple } from '../common/index.js';
// Call initAudioSimple() on first user interaction
playSuccessSoundSimple();
```

## Notes

- All functions are ES6 modules (use `import`/`export`)
- Multiple implementations provided where patterns differ (see option_1, option_2 files)
- Hebrew language support included where relevant
- No external dependencies required
- Web Audio API requires user interaction to initialize

## Future Additions

Potential additions to the library:
- Animation utilities
- Keyboard input handling
- Touch gesture support
- Local storage wrappers
- Network/API utilities
- Testing utilities
