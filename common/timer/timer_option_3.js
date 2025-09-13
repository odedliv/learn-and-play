/**
 * Timer functions - Option 3: Timer with circular SVG progress
 * Source: division_signs.html
 */

/**
 * Create a timer with circular SVG progress indicator
 * @param {Object} options - Configuration options
 * @param {number} options.duration - Total duration in seconds
 * @param {HTMLElement} options.svgCircle - SVG circle element for progress
 * @param {HTMLElement} options.textElement - Element to display time text
 * @param {number} options.circumference - Circle circumference (default: 283)
 * @param {Function} options.onTick - Called every second
 * @param {Function} options.onComplete - Called when timer completes
 * @param {Function} options.onWarning - Called when time is running low
 * @param {number} options.warningTime - When to trigger warning (default: 10)
 * @returns {Object} Timer control object
 */
export function createCircularTimer(options) {
    const {
        duration = 120,
        svgCircle,
        textElement,
        circumference = 283, // 2 * Math.PI * 45 for radius 45
        onTick = () => {},
        onComplete = () => {},
        onWarning = () => {},
        warningTime = 10
    } = options;

    let timeLeft = duration;
    let intervalId = null;
    let isWarningTriggered = false;

    const updateDisplay = () => {
        // Update circular progress
        if (svgCircle) {
            const offset = circumference - (timeLeft / duration) * circumference;
            svgCircle.style.strokeDashoffset = offset;
        }

        // Update text display
        if (textElement) {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            const secondsStr = seconds < 10 ? '0' + seconds : seconds;
            textElement.textContent = `${minutes}:${secondsStr}`;
        }

        // Handle warning state
        if (timeLeft <= warningTime && !isWarningTriggered) {
            isWarningTriggered = true;
            if (svgCircle) {
                svgCircle.classList.remove('text-blue-500');
                svgCircle.classList.add('text-red-500');
            }
            onWarning(timeLeft);
        }
    };

    return {
        start() {
            if (intervalId) return;

            // Initialize display
            updateDisplay();

            intervalId = setInterval(() => {
                timeLeft--;
                updateDisplay();
                onTick(timeLeft);

                if (timeLeft <= 0) {
                    this.stop();
                    onComplete();
                }
            }, 1000);
        },

        stop() {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        },

        reset() {
            this.stop();
            timeLeft = duration;
            isWarningTriggered = false;

            if (svgCircle) {
                svgCircle.classList.remove('text-red-500');
                svgCircle.classList.add('text-blue-500');
                svgCircle.style.strokeDashoffset = 0;
            }

            updateDisplay();
        },

        getTimeLeft() {
            return timeLeft;
        },

        addTime(seconds) {
            timeLeft = Math.min(duration, timeLeft + seconds);
            if (timeLeft > warningTime && isWarningTriggered) {
                isWarningTriggered = false;
                if (svgCircle) {
                    svgCircle.classList.remove('text-red-500');
                    svgCircle.classList.add('text-blue-500');
                }
            }
            updateDisplay();
        }
    };
}

/**
 * Create SVG timer element
 * @param {Object} options - SVG configuration
 * @returns {Object} Object with container and circle elements
 */
export function createTimerSVG(options = {}) {
    const {
        size = 100,
        strokeWidth = 10,
        radius = 45,
        baseColor = 'text-gray-200',
        progressColor = 'text-blue-500'
    } = options;

    const container = document.createElement('div');
    container.className = 'relative';
    container.style.width = `${size}px`;
    container.style.height = `${size}px`;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.classList.add('w-full', 'h-full');

    // Background circle
    const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bgCircle.classList.add(baseColor);
    bgCircle.setAttribute('stroke-width', strokeWidth);
    bgCircle.setAttribute('stroke', 'currentColor');
    bgCircle.setAttribute('fill', 'transparent');
    bgCircle.setAttribute('r', radius);
    bgCircle.setAttribute('cx', size / 2);
    bgCircle.setAttribute('cy', size / 2);

    // Progress circle
    const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    progressCircle.classList.add(progressColor, 'transition-all', 'duration-500');
    progressCircle.setAttribute('stroke-width', strokeWidth);
    progressCircle.setAttribute('stroke-linecap', 'round');
    progressCircle.setAttribute('stroke', 'currentColor');
    progressCircle.setAttribute('fill', 'transparent');
    progressCircle.setAttribute('r', radius);
    progressCircle.setAttribute('cx', size / 2);
    progressCircle.setAttribute('cy', size / 2);

    const circumference = 2 * Math.PI * radius;
    progressCircle.style.strokeDasharray = circumference;
    progressCircle.style.strokeDashoffset = 0;
    progressCircle.style.transform = 'rotate(-90deg)';
    progressCircle.style.transformOrigin = '50% 50%';

    svg.appendChild(bgCircle);
    svg.appendChild(progressCircle);
    container.appendChild(svg);

    // Text display overlay
    const textDisplay = document.createElement('div');
    textDisplay.className = 'absolute inset-0 flex items-center justify-center text-2xl font-bold';
    container.appendChild(textDisplay);

    return {
        container,
        progressCircle,
        textDisplay,
        circumference
    };
}
