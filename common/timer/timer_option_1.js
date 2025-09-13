/**
 * Timer functions - Option 1: Simple countdown/countup timer
 * Source: Multiple games (color_game.html, analogy_chase.html)
 */

/**
 * Simple countdown timer
 * @param {number} duration - Duration in seconds
 * @param {Function} onTick - Callback function called every second with remaining time
 * @param {Function} onComplete - Callback function called when timer reaches 0
 * @returns {Object} Timer control object with start, stop, pause, resume methods
 */
export function createCountdownTimer(duration, onTick, onComplete) {
    let timeLeft = duration;
    let intervalId = null;
    let isPaused = false;

    return {
        start() {
            if (intervalId) return; // Already running

            intervalId = setInterval(() => {
                if (!isPaused) {
                    timeLeft--;
                    onTick(timeLeft);

                    if (timeLeft <= 0) {
                        this.stop();
                        if (onComplete) onComplete();
                    }
                }
            }, 1000);
        },

        stop() {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        },

        pause() {
            isPaused = true;
        },

        resume() {
            isPaused = false;
        },

        reset() {
            this.stop();
            timeLeft = duration;
            isPaused = false;
        },

        getTimeLeft() {
            return timeLeft;
        },

        setTimeLeft(newTime) {
            timeLeft = newTime;
        }
    };
}

/**
 * Simple count-up timer (stopwatch)
 * @param {Function} onTick - Callback function called every second with elapsed time
 * @returns {Object} Timer control object
 */
export function createStopwatch(onTick) {
    let elapsed = 0;
    let intervalId = null;
    let isPaused = false;

    return {
        start() {
            if (intervalId) return; // Already running

            intervalId = setInterval(() => {
                if (!isPaused) {
                    elapsed++;
                    if (onTick) onTick(elapsed);
                }
            }, 1000);
        },

        stop() {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        },

        pause() {
            isPaused = true;
        },

        resume() {
            isPaused = false;
        },

        reset() {
            this.stop();
            elapsed = 0;
            isPaused = false;
        },

        getElapsed() {
            return elapsed;
        }
    };
}

/**
 * Format seconds to MM:SS display
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format seconds to Hebrew time display
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted Hebrew time string
 */
export function formatTimeHebrew(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (minutes === 0) {
        return `${secs} שניות`;
    } else if (minutes === 1) {
        return `דקה ו-${secs} שניות`;
    } else {
        return `${minutes} דקות ו-${secs} שניות`;
    }
}
