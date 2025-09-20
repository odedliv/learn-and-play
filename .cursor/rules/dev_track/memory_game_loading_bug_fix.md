# Memory Game Loading Bug Fix
Date: Saturday, September 13, 2025

## Bug Description
When starting a memory game and selecting a topic for training, users received the error:
"שגיאה בטעינת מנוע המשחק" (Error loading game engine)

The error occurred in `topic_list.js`, function `startGame(filePath)`, line 66, when checking if `MemoryGame` was defined.

## Root Cause
The issue was caused by a mismatch in JavaScript module loading:

1. **The problem**: `memory_game_engine.js` contains ES6 `import` statements (importing from the common library), which makes it an ES6 module
2. **The conflict**: In `memory_game.html`, it was being loaded as a regular script: `<script src="memory_game_engine.js" defer></script>`
3. **The result**: The browser failed to parse the file when encountering the import statements, causing a syntax error and preventing the MemoryGame object from being defined

## Solution
Two changes were required:

### 1. Load as ES6 Module
Changed the script tag in `memory_game.html`:
```html
<!-- Before -->
<script src="memory_game_engine.js" defer></script>

<!-- After -->
<script src="memory_game_engine.js" type="module"></script>
```

### 2. Make MemoryGame Globally Accessible
Added to `memory_game_engine.js` (after the MemoryGame object definition):
```javascript
// Make MemoryGame globally accessible
window.MemoryGame = MemoryGame;
```

This is necessary because ES6 modules have their own scope and don't automatically expose variables to the global window object.

## Why This Happened
The bug was introduced when migrating to use the common library. Adding these import statements:
```javascript
import { shuffleArray } from '../common/utils/array.js';
```

...converted the file from a regular script to an ES6 module, requiring different loading semantics.

## Test Coverage
Created `tests/unit/memory-game-loading.test.js` to catch this type of issue:
- Tests if MemoryGame object is defined
- Verifies required methods are present
- Checks if scripts with ES6 imports have `type="module"`
- Ensures MemoryGame is globally accessible

## Important Note for Development
As the user noted, when running from localhost but loading files from a remote repository, changes won't be reflected until pushed. This is a deployment consideration rather than a code issue.

## Lessons Learned
1. When adding ES6 imports to a previously non-module script, remember to:
   - Update all script tags to use `type="module"`
   - Explicitly attach any needed globals to the window object
2. Always test the full user flow after module system changes
3. Consider creating integration tests that verify script loading


