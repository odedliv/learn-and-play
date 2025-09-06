/**
 * Memory Game Engine
 * Handles the entire memory game logic for both pairs and multiple synonyms data formats
 */

const MemoryGame = {
    // Game state variables
    gameData: null,
    firstCard: null,
    secondCard: null,
    lockBoard: false,
    pairsFound: 0,
    totalPairs: 10, // We'll use 10 pairs (20 cards) for the game
    synonymPairs: {},
    unflipTimeoutId: null,
    resetColorTimeoutId: null,
    audioContext: null,
    gameContainer: null,
    currentFilePath: null,

    /**
     * Initialize the game with data from a JSON file
     * @param {string} filePath - Path to the JSON data file
     */
    async init(filePath) {
        this.currentFilePath = filePath;
        console.log('\n=== INITIALIZING MEMORY GAME ===');
        console.log('Loading data from:', filePath);

        try {
            // Load the JSON data
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to load data from ${filePath}`);
            }

            const jsonData = await response.json();

            // Process the data based on its format
            const gamePairs = this.prepareGameData(jsonData);

            if (gamePairs.length === 0) {
                throw new Error('No valid data found in the file');
            }

            // Setup the game board
            this.setupGameBoard(gamePairs);

        } catch (error) {
            console.error('Error initializing game:', error);
            this.showError('שגיאה בטעינת המשחק. נסה שוב.');
        }
    },

    /**
     * Prepare game data from the JSON file
     * Handles both pairs format and multiple alternatives format
     * @param {Object} jsonData - The parsed JSON data
     * @returns {Array} Array of word pairs for the game
     */
    prepareGameData(jsonData) {
        let allEntries = [];

        // Detect the format and extract entries
        if (jsonData.pairs) {
            // Format from csv_to_json_pairs.py (הפכים.json)
            allEntries = jsonData.pairs.map(pair => [pair.term1, pair.term2]);
        } else if (jsonData.entries) {
            // Format from csv_to_json_multiple.py (מילים_נרדפות.json)
            allEntries = jsonData.entries.map(entry => entry.alternatives);
        } else {
            console.error('Unknown data format');
            return [];
        }

        // Shuffle all entries
        this.shuffleArray(allEntries);

        // Select random entries (limited by totalPairs)
        const selectedEntries = allEntries.slice(0, Math.min(this.totalPairs, allEntries.length));

        // Create pairs from selected entries
        const gamePairs = [];
        this.synonymPairs = {};

        selectedEntries.forEach((entry, index) => {
            let pair = [];

            if (Array.isArray(entry)) {
                if (entry.length === 2) {
                    // Already a pair
                    pair = entry;
                } else if (entry.length > 2) {
                    // Multiple alternatives - pick 2 random ones
                    const shuffled = [...entry];
                    this.shuffleArray(shuffled);
                    pair = shuffled.slice(0, 2);
                }
            }

            if (pair.length === 2) {
                gamePairs.push(pair);
                // Store bidirectional mapping for matching
                this.synonymPairs[pair[0]] = pair[1];
                this.synonymPairs[pair[1]] = pair[0];
                console.log(`Pair ${index + 1}: "${pair[0]}" <-> "${pair[1]}"`);
            }
        });

        console.log('=== GAME SETUP COMPLETE ===');
        console.log('Total pairs created:', gamePairs.length);
        console.log('Synonym pairs mapping:', this.synonymPairs);
        console.log('===========================');

        return gamePairs;
    },

    /**
     * Setup the game board UI
     * @param {Array} gamePairs - Array of word pairs
     */
    setupGameBoard(gamePairs) {
        // Hide the topic selection area
        const topicArea = document.getElementById('topic-selection-area');
        if (topicArea) {
            topicArea.style.display = 'none';
        }

        // Create or get the game container
        if (!this.gameContainer) {
            this.createGameContainer();
        }

        // Show the game container
        this.gameContainer.style.display = 'block';

        // Reset game state
        this.resetGameState();

        // IMPORTANT: Repopulate synonymPairs after reset
        // (resetGameState clears it, but we need it for matching)
        gamePairs.forEach(pair => {
            this.synonymPairs[pair[0]] = pair[1];
            this.synonymPairs[pair[1]] = pair[0];
        });
        console.log('Synonym pairs repopulated after reset:', this.synonymPairs);

        // Create word array (flatten pairs)
        const gameWords = [];
        gamePairs.forEach(pair => {
            gameWords.push(pair[0], pair[1]);
        });

        // Shuffle the words
        this.shuffleArray(gameWords);

        // Render the cards
        this.renderCards(gameWords);

        // Update status
        this.updateStatus();
    },

    /**
     * Create the game container HTML structure
     */
    createGameContainer() {
        // Check if container already exists
        this.gameContainer = document.getElementById('memory-game-container');
        if (this.gameContainer) return;

        // Create the container
        this.gameContainer = document.createElement('div');
        this.gameContainer.id = 'memory-game-container';
        this.gameContainer.style.display = 'none';
        this.gameContainer.className = 'memory-game-wrapper';

        this.gameContainer.innerHTML = `
            <style>
                .memory-game-wrapper {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: 'Assistant', Arial, sans-serif;
                }

                .game-header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .game-header h2 {
                    font-size: 2em;
                    color: #333;
                    margin-bottom: 10px;
                }

                .game-board {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 15px;
                    margin-bottom: 30px;
                    max-width: 800px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .memory-card {
                    position: relative;
                    height: 100px;
                    cursor: pointer;
                    transform-style: preserve-3d;
                    transition: transform 0.6s;
                }

                .memory-card.flipped {
                    transform: rotateY(180deg);
                }

                .memory-card.matched {
                    cursor: default;
                    pointer-events: none;
                    /* Ensure matched cards stay flipped/visible */
                    transform: rotateY(180deg) !important;
                }

                .memory-card.matched .card-front {
                    opacity: 0.6;
                }

                .memory-card.flipped.matched {
                    /* Double ensure matched cards stay visible */
                    transform: rotateY(180deg) !important;
                }

                .card-face {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .card-front {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    font-size: 2em;
                }

                .card-back {
                    background-color: #f0f0f0;
                    color: #333;
                    transform: rotateY(180deg);
                    font-size: 1.2em;
                    padding: 10px;
                    text-align: center;
                }

                .card-back.active {
                    background-color: #ffd93d;
                }

                .card-back.matched {
                    background-color: #6bcf7f !important;
                }

                .game-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .game-status {
                    font-size: 1.2em;
                    color: #555;
                }

                .game-buttons {
                    display: flex;
                    gap: 10px;
                }

                .game-button {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    font-size: 1em;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-weight: 600;
                }

                .btn-primary {
                    background-color: #667eea;
                    color: white;
                }

                .btn-primary:hover {
                    background-color: #5a67d8;
                    transform: translateY(-2px);
                }

                .btn-secondary {
                    background-color: #e2e8f0;
                    color: #4a5568;
                }

                .btn-secondary:hover {
                    background-color: #cbd5e0;
                }

                @keyframes green-flash {
                    50% {
                        box-shadow: 0 0 30px 15px rgba(107, 207, 127, 0.7);
                    }
                }

                .flash-green {
                    animation: green-flash 0.8s ease-in-out;
                }
            </style>

            <div class="game-header">
                <h2>משחק זיכרון</h2>
            </div>

            <div id="game-board" class="game-board">
                <!-- Cards will be generated here -->
            </div>

            <div class="game-controls">
                <div id="game-status" class="game-status">נמצאו 0 מתוך ${this.totalPairs} זוגות</div>
                <div class="game-buttons">
                    <button id="change-topic-btn" class="game-button btn-secondary">החלף נושא</button>
                    <button id="reset-game-btn" class="game-button btn-primary">משחק חדש</button>
                </div>
            </div>
        `;

        // Add to the page
        const mainContainer = document.querySelector('body');
        mainContainer.appendChild(this.gameContainer);

        // Add event listeners
        document.getElementById('reset-game-btn').addEventListener('click', () => this.resetGame());
        document.getElementById('change-topic-btn').addEventListener('click', () => this.changeTopic());
    },

    /**
     * Render the cards on the game board
     * @param {Array} words - Array of words to display on cards
     */
    renderCards(words) {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';

        words.forEach(word => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.word = word;

            card.innerHTML = `
                <div class="card-face card-front">?</div>
                <div class="card-face card-back">${word}</div>
            `;

            // Store the handler function so we can remove it later
            card.clickHandler = () => this.handleCardClick(card);
            card.addEventListener('click', card.clickHandler);
            gameBoard.appendChild(card);
        });
    },

    /**
     * Handle card click event
     * @param {HTMLElement} card - The clicked card element
     */
    handleCardClick(card) {
        console.log('Card clicked:', card.dataset.word);
        console.log('Current state - lockBoard:', this.lockBoard, 'flipped:', card.classList.contains('flipped'), 'matched:', card.classList.contains('matched'));

        // Prevent clicking if board is locked or card is already flipped or matched
        if (this.lockBoard || card.classList.contains('flipped') || card.classList.contains('matched')) {
            console.log('Click ignored (locked/flipped/matched)');
            return;
        }

        // Flip the card
        card.classList.add('flipped');
        const cardBack = card.querySelector('.card-back');
        cardBack.classList.add('active');
        console.log('Card flipped');

        if (!this.firstCard) {
            // First card clicked
            this.firstCard = card;
            console.log('Set as first card');
            return;
        }

        // Prevent clicking the same card twice
        if (this.firstCard === card) {
            console.log('Same card clicked twice - ignoring');
            return;
        }

        // Second card clicked
        this.secondCard = card;
        this.lockBoard = true;
        console.log('Set as second card, locking board');

        // Check for match
        this.checkForMatch();
    },

    /**
     * Check if two flipped cards match
     */
    checkForMatch() {
        const word1 = this.firstCard.dataset.word;
        const word2 = this.secondCard.dataset.word;

        console.log('=== CHECKING FOR MATCH ===');
        console.log('Card 1 word:', word1);
        console.log('Card 2 word:', word2);
        console.log('Expected match for', word1, ':', this.synonymPairs[word1]);
        console.log('Expected match for', word2, ':', this.synonymPairs[word2]);

        const isMatch = this.synonymPairs[word1] === word2;

        console.log('Is Match?', isMatch);
        console.log('Calling:', isMatch ? 'handleMatch()' : 'handleMismatch()');
        console.log('==========================');

        if (isMatch) {
            this.handleMatch();
        } else {
            this.handleMismatch();
        }
    },

    /**
     * Handle matching cards
     */
    handleMatch() {
        console.log('>>> handleMatch() called');

        // Play success sound
        this.playSuccessSound();

        // Store references to cards before resetting turn
        const card1 = this.firstCard;
        const card2 = this.secondCard;

        console.log('Card 1 classes before:', card1.className);
        console.log('Card 2 classes before:', card2.className);

        // Remove event listeners from matched cards (like memory5.html does)
        if (card1.clickHandler) {
            card1.removeEventListener('click', card1.clickHandler);
            console.log('Removed click handler from card 1');
        }
        if (card2.clickHandler) {
            card2.removeEventListener('click', card2.clickHandler);
            console.log('Removed click handler from card 2');
        }

        // Get card back elements
        const firstBack = card1.querySelector('.card-back');
        const secondBack = card2.querySelector('.card-back');

        // Change to green to indicate success
        firstBack.classList.remove('active');
        secondBack.classList.remove('active');
        firstBack.classList.add('matched');
        secondBack.classList.add('matched');

        // Flash animation
        firstBack.classList.add('flash-green');
        secondBack.classList.add('flash-green');

        // Add matched class to cards immediately (not after timeout)
        // This prevents them from being clickable
        card1.classList.add('matched');
        card2.classList.add('matched');

        console.log('Card 1 classes after:', card1.className);
        console.log('Card 2 classes after:', card2.className);
        console.log('Card 1 should stay visible (has flipped class):', card1.classList.contains('flipped'));
        console.log('Card 2 should stay visible (has flipped class):', card2.classList.contains('flipped'));

        // Important: Cards keep their 'flipped' class so they remain visible

        // Update score
        this.pairsFound++;
        this.updateStatus();
        console.log('Pairs found:', this.pairsFound, '/', this.totalPairs);

        // Check for win
        if (this.pairsFound === this.totalPairs) {
            setTimeout(() => {
                this.showWinMessage();
            }, 800);
        }

        // Reset turn (but cards stay flipped and visible)
        this.resetTurn();

        // Final check - cards should still be visible after resetTurn
        console.log('FINAL CHECK after resetTurn:');
        console.log('Card 1 still has flipped?', card1.classList.contains('flipped'));
        console.log('Card 1 still has matched?', card1.classList.contains('matched'));
        console.log('Card 2 still has flipped?', card2.classList.contains('flipped'));
        console.log('Card 2 still has matched?', card2.classList.contains('matched'));
        console.log('>>> handleMatch() complete\n');
    },

    /**
     * Handle non-matching cards
     */
    handleMismatch() {
        console.log('>>> handleMismatch() called');

        // Wait before flipping back
        this.unflipTimeoutId = setTimeout(() => {
            console.log('Flipping cards back (mismatch)');
            this.firstCard.classList.remove('flipped');
            this.secondCard.classList.remove('flipped');

            const firstBack = this.firstCard.querySelector('.card-back');
            const secondBack = this.secondCard.querySelector('.card-back');

            firstBack.classList.remove('active');
            secondBack.classList.remove('active');

            this.resetTurn();
        }, 1200);
    },

    /**
     * Reset turn state
     */
    resetTurn() {
        console.log('resetTurn() called - clearing first/second cards and unlocking board');
        this.firstCard = null;
        this.secondCard = null;
        this.lockBoard = false;
    },

    /**
     * Reset the entire game state
     */
    resetGameState() {
        // Clear timeouts
        if (this.unflipTimeoutId) clearTimeout(this.unflipTimeoutId);
        if (this.resetColorTimeoutId) clearTimeout(this.resetColorTimeoutId);

        // Reset variables
        this.firstCard = null;
        this.secondCard = null;
        this.lockBoard = false;
        this.pairsFound = 0;
        this.synonymPairs = {};
    },

    /**
     * Reset the game with the same topic
     */
    resetGame() {
        if (this.currentFilePath) {
            this.init(this.currentFilePath);
        }
    },

    /**
     * Change topic - go back to topic selection
     */
    changeTopic() {
        // Hide game container
        if (this.gameContainer) {
            this.gameContainer.style.display = 'none';
        }

        // Show topic selection area
        const topicArea = document.getElementById('topic-selection-area');
        if (topicArea) {
            topicArea.style.display = '';
        }

        // Clear game state
        this.resetGameState();
    },

    /**
     * Update game status display
     */
    updateStatus() {
        const statusElement = document.getElementById('game-status');
        if (statusElement) {
            statusElement.textContent = `נמצאו ${this.pairsFound} מתוך ${this.totalPairs} זוגות`;
        }
    },

    /**
     * Show win message
     */
    showWinMessage() {
        const statusElement = document.getElementById('game-status');
        if (statusElement) {
            statusElement.textContent = '🎉 כל הכבוד! ניצחת! 🎉';
            statusElement.style.color = '#22c55e';
            statusElement.style.fontWeight = 'bold';
        }
    },

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        alert(message);
    },

    /**
     * Play success sound when cards match
     */
    playSuccessSound() {
        // Initialize AudioContext on first use
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.error("Web Audio API is not supported");
                return;
            }
        }

        if (!this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.value = 600;

            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

            oscillator.start(now);
            oscillator.stop(now + 0.5);
        } catch (e) {
            console.error("Error playing sound:", e);
        }
    },

    /**
     * Shuffle array using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle (modified in place)
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
};

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MemoryGame;
}
