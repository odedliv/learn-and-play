/**
 * Timer functions - Option 2: Class-based timer with more features
 * Source: Derived from common patterns in multiple games
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
        this.startTime = null;
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.startTime = Date.now();

        this.intervalId = setInterval(() => {
            if (!this.isPaused) {
                this.tick();
            }
        }, 1000);
    }

    tick() {
        if (this.mode === 'countdown') {
            this.timeLeft--;

            // Call warning callback if we hit warning time
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
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
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
        this.startTime = null;
    }

    getTime() {
        return this.timeLeft;
    }

    getFormattedTime() {
        const minutes = Math.floor(Math.abs(this.timeLeft) / 60);
        const seconds = Math.abs(this.timeLeft) % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    getElapsedTime() {
        if (!this.startTime) return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    addTime(seconds) {
        this.timeLeft += seconds;
    }

    setWarningTime(seconds) {
        this.warningTime = seconds;
    }

    isWarningTime() {
        return this.mode === 'countdown' && this.timeLeft <= this.warningTime;
    }
}
