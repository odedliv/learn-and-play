# Testing Glossary for Web Applications
**Date:** 2025-09-07
**Purpose:** Bridge pytest/Python testing knowledge to JavaScript/Web testing

## 📚 Testing Concepts - Python to JavaScript Translation

### Core Testing Terms

| Pytest/Python Term | JavaScript/Web Equivalent | Description | Example |
|-------------------|---------------------------|-------------|---------|
| **pytest** | Jest, Mocha, or custom framework | Test runner that discovers and executes tests | `pytest test_*.py` → `npm test` or open `test-runner.html` |
| **test fixture** | setup/teardown, beforeEach/afterEach | Code that prepares test environment | `@pytest.fixture` → `beforeEach(() => {...})` |
| **assert** | expect | Statement that verifies expected behavior | `assert x == 5` → `expect(x).toBe(5)` |
| **parametrize** | test.each (Jest) or loop in test | Run same test with different inputs | `@pytest.mark.parametrize` → `test.each([[1,2], [3,4]])` |
| **mock/patch** | jest.mock, sinon, or manual stubs | Replace real implementation with test double | `unittest.mock` → `jest.fn()` |
| **conftest.py** | test setup files, test-framework.js | Shared test configuration | Global test helpers and fixtures |
| **pytest.raises** | expect().toThrow() | Test that code throws exception | `with pytest.raises(ValueError)` → `expect(() => fn()).toThrow()` |
| **markers** | test tags/labels | Categorize tests | `@pytest.mark.slow` → `it.skip()` or `it.only()` |

## 🌐 Web-Specific Testing Terms

### DOM Testing
**DOM (Document Object Model)**: The tree structure representing HTML elements in memory
```javascript
// Python doesn't have this - it's like testing a live UI
const button = document.querySelector('button');
button.click(); // Simulate user clicking
expect(button.classList.contains('active')).toBeTruthy();
```

### Event Testing
**Event**: User interactions (clicks, typing, scrolling) or system events
```javascript
// Simulate user typing - no Python equivalent
const input = document.querySelector('input');
input.value = 'test';
input.dispatchEvent(new Event('change'));
```

### Async Testing
**Promises/Async**: JavaScript's way of handling asynchronous operations
```javascript
// Python: asyncio.run(async_function())
// JavaScript:
it('loads data', async () => {
    const data = await fetchData();
    expect(data).toBeDefined();
});
```

## 🔧 JavaScript Testing Patterns

### 1. **AAA Pattern** (Same as Python)
```javascript
// Arrange
const game = new MemoryGame();
const testData = ['word1', 'word2'];

// Act
const result = game.shuffleArray(testData);

// Assert
expect(result.length).toBe(2);
```

### 2. **Spy/Stub/Mock** (Like Python's Mock)
```javascript
// Spy: Watch if function was called
const spy = jest.fn();
myObject.method = spy;
myObject.method();
expect(spy).toHaveBeenCalled();

// Stub: Replace with simple implementation
const stub = () => 'stubbed value';

// Mock: Full replacement with expectations
const mock = jest.fn(() => 'mocked value');
```

### 3. **Testing Async Code**
```javascript
// Python: pytest.mark.asyncio
// JavaScript: Three ways

// 1. Async/await
it('async test', async () => {
    const result = await asyncFunction();
    expect(result).toBe('value');
});

// 2. Promises
it('promise test', () => {
    return fetchData().then(data => {
        expect(data).toBeDefined();
    });
});

// 3. Callbacks (older style)
it('callback test', (done) => {
    fetchData((data) => {
        expect(data).toBeDefined();
        done();
    });
});
```

## 📋 Test Types in Web Applications

### Unit Tests
**Definition**: Test individual functions/methods in isolation
**Python equivalent**: Same concept as pytest unit tests
```javascript
// Test a pure function
it('shuffles array', () => {
    const result = shuffleArray([1,2,3]);
    expect(result).toContain(1);
    expect(result).toContain(2);
    expect(result).toContain(3);
});
```

### Integration Tests
**Definition**: Test multiple components working together
**Web-specific**: Often involves DOM manipulation
```javascript
// Test game flow
it('completes game cycle', () => {
    const game = new MemoryGame();
    game.init('./data/test.json');
    game.handleCardClick(card1);
    game.handleCardClick(card2);
    expect(game.pairsFound).toBe(1);
});
```

### E2E (End-to-End) Tests
**Definition**: Test complete user workflows
**Tools**: Selenium, Cypress, Playwright (like Python's Selenium)
```javascript
// Cypress example
it('user can play full game', () => {
    cy.visit('/memory-game.html');
    cy.contains('בחר נושא').click();
    cy.get('.memory-card').first().click();
    // ... complete game flow
});
```

### Visual Regression Tests
**Definition**: Compare screenshots to detect UI changes
**No Python equivalent**: Specific to UI testing
```javascript
// Using Percy or similar
it('game board looks correct', () => {
    cy.screenshot('game-board');
    cy.percySnapshot();
});
```

## 🛠️ Current Project's Testing Setup

### Our Custom Test Framework
```javascript
// Similar to pytest's structure but simpler
describe('Test Suite Name', () => {      // Like Python's class TestSuite:
    it('test case name', () => {         // Like def test_something(self):
        expect(value).toBe(expected);    // Like assert value == expected
    });
});
```

### Assertion Methods in Our Framework
| Our Method | Pytest Equivalent | Description |
|------------|------------------|-------------|
| `expect(x).toBe(y)` | `assert x is y` | Strict equality (===) |
| `expect(x).toEqual(y)` | `assert x == y` | Deep equality |
| `expect(x).toContain(y)` | `assert y in x` | Contains check |
| `expect(x).toBeTruthy()` | `assert x` | Truthy check |
| `expect(x).toBeFalsy()` | `assert not x` | Falsy check |
| `expect(fn).toThrow()` | `pytest.raises()` | Exception check |

## 🎯 Web Testing Challenges (Not in Python)

### 1. **Browser Differences**
Different browsers may behave differently
```javascript
// Feature detection needed
if (window.AudioContext || window.webkitAudioContext) {
    // Use Web Audio API
}
```

### 2. **Timing Issues**
UI updates aren't instant
```javascript
// Wait for DOM update
setTimeout(() => {
    expect(element.classList.contains('visible')).toBeTruthy();
}, 100);
```

### 3. **Local Storage / Session Storage**
Browser storage that persists between tests
```javascript
beforeEach(() => {
    localStorage.clear();  // Clean state between tests
});
```

### 4. **CORS (Cross-Origin Resource Sharing)**
Security restrictions when loading resources
```javascript
// May need to mock fetch for local files
global.fetch = jest.fn(() => Promise.resolve({
    json: () => Promise.resolve(mockData)
}));
```

## 📊 Coverage Terms

| Term | Description | Python Equivalent |
|------|-------------|-------------------|
| **Line Coverage** | % of code lines executed | Same - pytest-cov |
| **Branch Coverage** | % of if/else branches tested | Same concept |
| **Function Coverage** | % of functions called | Same concept |
| **Statement Coverage** | % of statements executed | Same concept |
| **Istanbul/nyc** | JavaScript coverage tool | coverage.py |

## 🔍 Debugging Web Tests

### Browser DevTools (No Python Equivalent)
```javascript
// Add breakpoints in test
it('debug this test', () => {
    debugger;  // Browser will pause here
    console.log('Current state:', gameState);
    expect(result).toBe(expected);
});
```

### Console Methods
```javascript
console.log(value);        // print(value)
console.table(array);      // Pretty print arrays/objects
console.group('Group');    // Group related logs
console.time('timer');     // Performance timing
console.trace();           // Stack trace
```

## 🎮 Game-Specific Testing Terms

### State Testing
Testing game state transitions
```javascript
// Verify game state after actions
expect(game.state).toBe('playing');
game.findPair();
expect(game.state).toBe('checking');
```

### Animation Testing
Testing CSS transitions/animations
```javascript
// Wait for animation to complete
card.click();
await waitFor(() =>
    card.style.transform === 'rotateY(180deg)'
);
```

### Sound Testing
Testing audio feedback
```javascript
// Mock AudioContext for testing
const mockAudioContext = {
    createOscillator: jest.fn(),
    createGain: jest.fn()
};
```

## 💡 Key Differences from Pytest

### 1. **No Built-in Test Discovery**
- **Pytest**: Automatically finds `test_*.py` files
- **JavaScript**: Must explicitly import/include test files

### 2. **Multiple Test Runners**
- **Pytest**: One standard tool
- **JavaScript**: Many options (Jest, Mocha, Jasmine, Karma, our custom)

### 3. **Browser Context**
- **Pytest**: Tests run in Python runtime
- **JavaScript**: Tests can run in browser OR Node.js

### 4. **Real DOM vs Virtual DOM**
- **Pytest**: No UI to test (unless using Selenium)
- **JavaScript**: Can test actual UI elements

### 5. **Sync vs Async by Default**
- **Pytest**: Synchronous by default
- **JavaScript**: Many operations are async (fetch, setTimeout, animations)

## 📝 Quick Reference Card

### Running Tests
```bash
# Pytest
pytest test_file.py
pytest -v                    # Verbose
pytest -k "test_name"        # Run specific test
pytest --cov                 # With coverage

# JavaScript (our project)
python -m http.server 8000
# Open http://localhost:8000/tests/test-runner.html
# Click "Run All Tests"

# JavaScript (with npm)
npm test
npm test -- --watch          # Watch mode
npm test -- --coverage       # With coverage
```

### Writing Tests
```javascript
// Basic test structure (like pytest)
describe('Calculator', () => {                    // class TestCalculator:
    let calc;

    beforeEach(() => {                           // def setup_method(self):
        calc = new Calculator();                  //     self.calc = Calculator()
    });

    it('should add numbers', () => {             // def test_add(self):
        expect(calc.add(2, 3)).toBe(5);          //     assert self.calc.add(2, 3) == 5
    });

    afterEach(() => {                            // def teardown_method(self):
        calc = null;                             //     self.calc = None
    });
});
```

## 🚀 Getting Started Tips

1. **Start with Unit Tests**: Test pure functions first (like `shuffleArray`)
2. **Use Console.log**: Liberal use of console.log for debugging (like print())
3. **Test in Browser**: Use browser DevTools to debug (F12)
4. **Keep Tests Fast**: Each test should run in < 100ms
5. **Test One Thing**: Each test should verify one behavior

## 📚 Resources for Learning

### From Pytest Background
1. **Jest Documentation**: Most similar to pytest in philosophy
2. **MDN Web Testing**: Mozilla's guide to testing web apps
3. **JavaScript Testing Best Practices**: github.com/goldbergyoni/javascript-testing-best-practices

### Tools Similar to Pytest
- **Jest**: Most pytest-like JavaScript test runner
- **Mocha + Chai**: Flexible like pytest with plugins
- **Vitest**: Modern, fast, with good DX (developer experience)

## 🎯 Common Gotchas from Python → JavaScript

1. **Equality**: `==` vs `===` (use `===` for strict equality)
2. **Undefined vs Null**: Two different "nothing" values
3. **this binding**: `this` context changes (arrow functions help)
4. **Hoisting**: Variables/functions can be used before declaration
5. **Type Coercion**: `'5' + 3 = '53'` (string concatenation)
6. **Promises**: Forgetting `await` leads to testing promises, not results
7. **Mutations**: Arrays/objects are references (like Python lists/dicts)

## 📌 Testing Checklist for Memory Game

- [ ] **Unit Tests**
  - [ ] shuffleArray maintains length
  - [ ] Card matching logic
  - [ ] Score calculation
  - [ ] Timer functions

- [ ] **Integration Tests**
  - [ ] Topic loading from JSON
  - [ ] Game initialization
  - [ ] Card flip animations
  - [ ] Win condition

- [ ] **Browser Tests**
  - [ ] Works in Chrome
  - [ ] Works in Firefox
  - [ ] Works in Safari
  - [ ] Mobile responsive

- [ ] **Edge Cases**
  - [ ] Empty data files
  - [ ] Network errors
  - [ ] Rapid clicking
  - [ ] Browser back button

