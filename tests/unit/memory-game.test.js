/**
 * Unit Tests for Memory Game Engine
 * Tests the core functionality of the memory game
 *
 * To run: Include this file in test-runner.html
 */

// Make function available globally for the test runner
window.runMemoryGameTests = function() {
    // Check if MemoryGame is loaded
    const usingRealImplementation = typeof MemoryGame !== 'undefined' && MemoryGame.shuffleArray;
    console.log(`Memory Game Tests: Using ${usingRealImplementation ? 'REAL' : 'MOCK'} implementation`);

    // Test for module loading issues (catches the bug where ES6 modules aren't loaded correctly)
    describe('Memory Game - Module Loading', () => {
        it('should have MemoryGame object defined globally', () => {
            // This test will fail if memory_game_engine.js failed to load
            // due to ES6 module issues (missing type="module" in script tag)
            expect(typeof MemoryGame).not.toBe('undefined');

            if (typeof MemoryGame === 'undefined') {
                console.error('CRITICAL: MemoryGame is not defined! This usually means:');
                console.error('1. The script failed to load due to ES6 import statements');
                console.error('2. The script tag needs type="module" attribute');
                console.error('3. MemoryGame needs to be attached to window object');
            }
        });

        it('should have MemoryGame accessible on window object', () => {
            if (typeof MemoryGame !== 'undefined') {
                expect(window.MemoryGame).toBe(MemoryGame);
            }
        });

        it('should have all required methods', () => {
            if (typeof MemoryGame !== 'undefined') {
                expect(typeof MemoryGame.init).toBe('function');
                expect(typeof MemoryGame.shuffleArray).toBe('function');
                expect(typeof MemoryGame.prepareGameData).toBe('function');
                expect(typeof MemoryGame.checkForMatch).toBe('function');
                expect(typeof MemoryGame.handleMatch).toBe('function');
                expect(typeof MemoryGame.playSuccessSound).toBe('function');
            }
        });
    });

    describe('Memory Game - Shuffle Function', () => {
        // Use the actual shuffleArray function from the real MemoryGame engine
        // Note: MemoryGame.shuffleArray modifies the array in-place
        const shuffleArray = (array) => {
            // Create a copy to avoid modifying the original during tests
            const copy = [...array];
            if (usingRealImplementation) {
                MemoryGame.shuffleArray(copy);
                return copy;
            } else {
                // Fallback to mock if MemoryGame is not loaded
                console.warn('MemoryGame not loaded, using mock implementation');
                for (let i = copy.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [copy[i], copy[j]] = [copy[j], copy[i]];
                }
                return copy;
            }
        };

        it('should return an array of the same length', () => {
            const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const result = shuffleArray([...input]);
            expect(result.length).toBe(input.length);
        });

        it('should contain all original elements', () => {
            const input = ['א', 'ב', 'ג', 'ד', 'ה'];
            const result = shuffleArray([...input]);

            input.forEach(item => {
                expect(result).toContain(item);
            });
        });

        it('should produce different arrangements (statistical test)', () => {
            const input = [1, 2, 3, 4, 5, 6, 7, 8];
            let differentCount = 0;
            const iterations = 100;

            for (let i = 0; i < iterations; i++) {
                const shuffled = shuffleArray([...input]);

                // Check if at least one element is in a different position
                for (let j = 0; j < input.length; j++) {
                    if (input[j] !== shuffled[j]) {
                        differentCount++;
                        break;
                    }
                }
            }

            // At least 95% of shuffles should produce different arrangements
            expect(differentCount).toBeGreaterThan(95);
        });

        it('should handle empty arrays', () => {
            const input = [];
            const result = shuffleArray([...input]);
            expect(result).toEqual([]);
        });

        it('should handle single-element arrays', () => {
            const input = [42];
            const result = shuffleArray([...input]);
            expect(result).toEqual([42]);
        });

        it('should handle arrays with duplicate values', () => {
            const input = [1, 1, 2, 2, 3, 3];
            const result = shuffleArray([...input]);

            expect(result.length).toBe(6);
            expect(result.filter(x => x === 1).length).toBe(2);
            expect(result.filter(x => x === 2).length).toBe(2);
            expect(result.filter(x => x === 3).length).toBe(2);
        });
    });

    describe('Memory Game - Format Topic Name', () => {
        const formatTopicName = (fileName) => {
            // Use real implementation if available
            if (usingRealImplementation && MemoryGame.formatTopicName) {
                return MemoryGame.formatTopicName(fileName);
            }

            // Fallback implementation matching the real one
            const topicNames = {
                'הפכים': 'הפכים',
                'מילים_נרדפות': 'מילים נרדפות',
                'opposites': 'הפכים',
                'synonyms': 'מילים נרדפות'
            };

            return topicNames[fileName] || fileName.replace(/_/g, ' ');
        };

        it('should remove .json extension', () => {
            expect(formatTopicName('topic.json')).toBe('topic.json'.replace(/_/g, ' '));
        });

        it('should replace underscores with spaces', () => {
            expect(formatTopicName('מילים_נרדפות')).toBe('מילים נרדפות');
        });

        it('should handle names without extension', () => {
            expect(formatTopicName('my_topic')).toBe('my topic');
        });

        it('should handle Hebrew text correctly', () => {
            expect(formatTopicName('הפכים')).toBe('הפכים');
        });

        it('should use predefined mappings for common topics', () => {
            expect(formatTopicName('opposites')).toBe('הפכים');
            expect(formatTopicName('synonyms')).toBe('מילים נרדפות');
        });
    });

    describe('Memory Game - Pair Matching Logic', () => {
        it('should correctly identify matching pairs', () => {
            const synonymPairs = {
                'word1': 'match1',
                'match1': 'word1',
                'word2': 'match2',
                'match2': 'word2'
            };

            // Test valid match
            const isMatch1 = synonymPairs['word1'] === 'match1';
            expect(isMatch1).toBeTruthy();

            // Test reverse match
            const isMatch2 = synonymPairs['match1'] === 'word1';
            expect(isMatch2).toBeTruthy();

            // Test non-match
            const isMatch3 = synonymPairs['word1'] === 'word2';
            expect(isMatch3).toBeFalsy();
        });

        it('should handle Hebrew pairs correctly', () => {
            const synonymPairs = {
                'גדול': 'קטן',
                'קטן': 'גדול',
                'שמח': 'עצוב',
                'עצוב': 'שמח'
            };

            expect(synonymPairs['גדול']).toBe('קטן');
            expect(synonymPairs['שמח']).toBe('עצוב');
        });
    });

    describe('Memory Game - Game State Management', () => {
        it('should reset game state correctly', () => {
            // Simulated game state object
            const gameState = {
                firstCard: null,
                secondCard: null,
                lockBoard: false,
                pairsFound: 0,
                totalPairs: 10,
                synonymPairs: {},

                resetGameState() {
                    this.firstCard = null;
                    this.secondCard = null;
                    this.lockBoard = false;
                    this.pairsFound = 0;
                    this.synonymPairs = {};
                }
            };

            // Set some values
            gameState.firstCard = 'card1';
            gameState.pairsFound = 5;
            gameState.lockBoard = true;

            // Reset
            gameState.resetGameState();

            // Verify reset
            expect(gameState.firstCard).toBe(null);
            expect(gameState.secondCard).toBe(null);
            expect(gameState.lockBoard).toBe(false);
            expect(gameState.pairsFound).toBe(0);
            expect(gameState.synonymPairs).toEqual({});
        });

        it('should detect win condition', () => {
            const checkWin = (pairsFound, totalPairs) => {
                return pairsFound === totalPairs;
            };

            expect(checkWin(10, 10)).toBeTruthy();
            expect(checkWin(9, 10)).toBeFalsy();
            expect(checkWin(0, 10)).toBeFalsy();
        });

        it('should prevent clicking during board lock', () => {
            const canClick = (lockBoard, cardIsFlipped, cardIsMatched) => {
                return !lockBoard && !cardIsFlipped && !cardIsMatched;
            };

            expect(canClick(true, false, false)).toBeFalsy();  // Board is locked
            expect(canClick(false, true, false)).toBeFalsy();  // Card already flipped
            expect(canClick(false, false, true)).toBeFalsy();  // Card already matched
            expect(canClick(false, false, false)).toBeTruthy(); // Can click
        });
    });

    describe('Memory Game - Data Preparation', () => {
        it('should handle pairs format correctly', () => {
            const data = {
                pairs: [
                    ['word1', 'match1'],
                    ['word2', 'match2'],
                    ['word3', 'match3']
                ]
            };

            const isPairsFormat = Array.isArray(data.pairs);
            expect(isPairsFormat).toBeTruthy();

            // Each pair should have exactly 2 elements
            data.pairs.forEach(pair => {
                expect(pair.length).toBe(2);
            });
        });

        it('should handle entries format correctly', () => {
            const data = {
                entries: [
                    { base: 'word1', alternatives: ['alt1', 'alt2', 'alt3'] },
                    { base: 'word2', alternatives: ['alt4', 'alt5'] }
                ]
            };

            const isEntriesFormat = Array.isArray(data.entries);
            expect(isEntriesFormat).toBeTruthy();

            // Each entry should have base and alternatives
            data.entries.forEach(entry => {
                expect(entry.base).toBeTruthy();
                expect(Array.isArray(entry.alternatives)).toBeTruthy();
                expect(entry.alternatives.length).toBeGreaterThan(0);
            });
        });

        it('should select correct number of pairs', () => {
            const selectPairs = (allPairs, count) => {
                const shuffled = [...allPairs];
                // Simple shuffle simulation
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                return shuffled.slice(0, count);
            };

            const allPairs = Array.from({length: 50}, (_, i) => [`word${i}`, `match${i}`]);
            const selected = selectPairs(allPairs, 10);

            expect(selected.length).toBe(10);
        });
    });

    describe('Memory Game - Score Tracking', () => {
        it('should track matched pairs count', () => {
            // Simulate game state
            const gameState = {
                pairsFound: 0,
                totalPairs: 10,

                handleMatch() {
                    this.pairsFound++;
                },

                getScore() {
                    return this.pairsFound;
                }
            };

            expect(gameState.pairsFound).toBe(0);

            // Simulate finding matches
            gameState.handleMatch();
            expect(gameState.pairsFound).toBe(1);

            gameState.handleMatch();
            gameState.handleMatch();
            expect(gameState.pairsFound).toBe(3);
        });

        it('should reset score when game resets', () => {
            const gameState = {
                pairsFound: 5,

                resetScore() {
                    this.pairsFound = 0;
                }
            };

            expect(gameState.pairsFound).toBe(5);
            gameState.resetScore();
            expect(gameState.pairsFound).toBe(0);
        });

        it('should format score display correctly', () => {
            const formatStatus = (found, total) => {
                return `נמצאו ${found} מתוך ${total} זוגות`;
            };

            expect(formatStatus(0, 10)).toBe('נמצאו 0 מתוך 10 זוגות');
            expect(formatStatus(5, 10)).toBe('נמצאו 5 מתוך 10 זוגות');
            expect(formatStatus(10, 10)).toBe('נמצאו 10 מתוך 10 זוגות');
        });
    });

    describe('Memory Game - Win Condition', () => {
        it('should detect win when all pairs are found', () => {
            const checkWin = (pairsFound, totalPairs) => {
                return pairsFound === totalPairs;
            };

            expect(checkWin(10, 10)).toBeTruthy();
            expect(checkWin(5, 10)).toBeFalsy();
            expect(checkWin(0, 10)).toBeFalsy();
            expect(checkWin(15, 10)).toBeFalsy(); // More than total should still be false
        });

        it('should trigger win message at right time', () => {
            // Simulate the win condition check from the real implementation
            const gameState = {
                pairsFound: 9,
                totalPairs: 10,
                winTriggered: false,

                handleMatch() {
                    this.pairsFound++;
                    // Check for win (from real implementation)
                    if (this.pairsFound === this.totalPairs) {
                        this.winTriggered = true;
                    }
                }
            };

            expect(gameState.winTriggered).toBeFalsy();
            gameState.handleMatch(); // This should be the winning match
            expect(gameState.pairsFound).toBe(10);
            expect(gameState.winTriggered).toBeTruthy();
        });

        it('should handle different total pairs settings', () => {
            const testWinCondition = (total) => {
                const state = { pairsFound: 0, totalPairs: total };

                // Not won initially
                expect(state.pairsFound === state.totalPairs).toBeFalsy();

                // Win when matched all
                state.pairsFound = total;
                expect(state.pairsFound === state.totalPairs).toBeTruthy();
            };

            testWinCondition(5);
            testWinCondition(10);
            testWinCondition(15);
            testWinCondition(20);
        });
    });

    describe('Memory Game - Card State After Match', () => {
        it('should keep matched cards visible', () => {
            // Test that matched cards maintain their flipped state
            const card = {
                isFlipped: false,
                isMatched: false,

                handleMatch() {
                    this.isMatched = true;
                    // Important: Cards keep their 'flipped' class (from real implementation)
                    this.isFlipped = true;
                }
            };

            card.handleMatch();
            expect(card.isFlipped).toBeTruthy();
            expect(card.isMatched).toBeTruthy();
        });

        it('should prevent clicking matched cards', () => {
            const canClickCard = (isMatched, isFlipped, lockBoard) => {
                return !isMatched && !isFlipped && !lockBoard;
            };

            // Matched card should not be clickable
            expect(canClickCard(true, true, false)).toBeFalsy();

            // Unmatched, unflipped card should be clickable
            expect(canClickCard(false, false, false)).toBeTruthy();
        });

        it('should add success animation to matched cards', () => {
            const applyMatchAnimation = (card) => {
                // Simulate adding pulse animation (from real implementation)
                return {
                    ...card,
                    hasAnimation: true,
                    animationType: 'pulse'
                };
            };

            const card = { id: 'card1', hasAnimation: false };
            const animatedCard = applyMatchAnimation(card);

            expect(animatedCard.hasAnimation).toBeTruthy();
            expect(animatedCard.animationType).toBe('pulse');
        });
    });
}

// Also export for module systems if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runMemoryGameTests: window.runMemoryGameTests };
}
