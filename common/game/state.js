/**
 * Game state management utilities
 * Common patterns for managing game state
 */

/**
 * Generic game state manager
 */
export class GameState {
    constructor(initialState = {}) {
        this.state = { ...initialState };
        this.initialState = { ...initialState };
        this.listeners = [];
        this.history = [];
        this.maxHistory = 10;
    }

    /**
     * Get state value by key
     * @param {string} key - State key
     * @returns {*} State value
     */
    get(key) {
        return key ? this.state[key] : this.state;
    }

    /**
     * Set state value(s)
     * @param {string|Object} key - Key or object with multiple updates
     * @param {*} value - Value (if key is string)
     */
    set(key, value) {
        const updates = typeof key === 'string' ? { [key]: value } : key;

        // Save to history
        this.history.push({ ...this.state });
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }

        // Update state
        this.state = { ...this.state, ...updates };
        this.notify(updates);
    }

    /**
     * Update state (alias for set)
     */
    update(updates) {
        this.set(updates);
    }

    /**
     * Reset state to initial values
     */
    reset() {
        this.state = { ...this.initialState };
        this.history = [];
        this.notify();
    }

    /**
     * Undo last state change
     */
    undo() {
        if (this.history.length > 0) {
            this.state = this.history.pop();
            this.notify();
        }
    }

    /**
     * Subscribe to state changes
     * @param {Function} listener - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(listener) {
        this.listeners.push(listener);

        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    /**
     * Notify all listeners of state change
     * @param {Object} changes - What changed
     */
    notify(changes = null) {
        this.listeners.forEach(listener => {
            listener(this.state, changes);
        });
    }

    /**
     * Save state to localStorage
     * @param {string} key - Storage key
     */
    saveToStorage(key) {
        try {
            localStorage.setItem(key, JSON.stringify(this.state));
        } catch (e) {
            console.error('Failed to save state:', e);
        }
    }

    /**
     * Load state from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success
     */
    loadFromStorage(key) {
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                this.state = JSON.parse(saved);
                this.notify();
                return true;
            }
        } catch (e) {
            console.error('Failed to load state:', e);
        }
        return false;
    }
}

/**
 * Score manager for games
 */
export class ScoreManager {
    constructor(initialScore = 0) {
        this.score = initialScore;
        this.highScore = this.loadHighScore();
        this.listeners = [];
    }

    /**
     * Add points to score
     * @param {number} points - Points to add
     */
    addPoints(points) {
        this.score += points;
        this.updateHighScore();
        this.notify();
    }

    /**
     * Subtract points from score
     * @param {number} points - Points to subtract
     */
    subtractPoints(points) {
        this.score = Math.max(0, this.score - points);
        this.notify();
    }

    /**
     * Reset score
     */
    reset() {
        this.score = 0;
        this.notify();
    }

    /**
     * Get current score
     */
    getScore() {
        return this.score;
    }

    /**
     * Get high score
     */
    getHighScore() {
        return this.highScore;
    }

    /**
     * Update high score if current score is higher
     */
    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
    }

    /**
     * Save high score to localStorage
     */
    saveHighScore() {
        try {
            localStorage.setItem('highScore', this.highScore.toString());
        } catch (e) {
            console.error('Failed to save high score:', e);
        }
    }

    /**
     * Load high score from localStorage
     */
    loadHighScore() {
        try {
            const saved = localStorage.getItem('highScore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            console.error('Failed to load high score:', e);
            return 0;
        }
    }

    /**
     * Subscribe to score changes
     * @param {Function} listener - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(listener) {
        this.listeners.push(listener);

        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    /**
     * Notify listeners of score change
     */
    notify() {
        this.listeners.forEach(listener => {
            listener(this.score, this.highScore);
        });
    }
}

/**
 * Simple statistics tracker
 */
export class StatsTracker {
    constructor() {
        this.stats = {
            gamesPlayed: 0,
            gamesWon: 0,
            totalScore: 0,
            totalTime: 0,
            correctAnswers: 0,
            wrongAnswers: 0
        };
        this.loadStats();
    }

    /**
     * Record a game result
     */
    recordGame(won, score = 0, time = 0) {
        this.stats.gamesPlayed++;
        if (won) this.stats.gamesWon++;
        this.stats.totalScore += score;
        this.stats.totalTime += time;
        this.saveStats();
    }

    /**
     * Record an answer
     */
    recordAnswer(correct) {
        if (correct) {
            this.stats.correctAnswers++;
        } else {
            this.stats.wrongAnswers++;
        }
        this.saveStats();
    }

    /**
     * Get win rate percentage
     */
    getWinRate() {
        if (this.stats.gamesPlayed === 0) return 0;
        return Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100);
    }

    /**
     * Get accuracy percentage
     */
    getAccuracy() {
        const total = this.stats.correctAnswers + this.stats.wrongAnswers;
        if (total === 0) return 0;
        return Math.round((this.stats.correctAnswers / total) * 100);
    }

    /**
     * Reset all stats
     */
    reset() {
        this.stats = {
            gamesPlayed: 0,
            gamesWon: 0,
            totalScore: 0,
            totalTime: 0,
            correctAnswers: 0,
            wrongAnswers: 0
        };
        this.saveStats();
    }

    /**
     * Save stats to localStorage
     */
    saveStats() {
        try {
            localStorage.setItem('gameStats', JSON.stringify(this.stats));
        } catch (e) {
            console.error('Failed to save stats:', e);
        }
    }

    /**
     * Load stats from localStorage
     */
    loadStats() {
        try {
            const saved = localStorage.getItem('gameStats');
            if (saved) {
                this.stats = { ...this.stats, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('Failed to load stats:', e);
        }
    }
}
