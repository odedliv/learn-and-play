/**
 * Modal UI utilities
 * Reusable modal/dialog functions
 */

/**
 * Create and show a modal dialog
 * @param {Object} options - Modal configuration
 * @param {string} options.title - Modal title
 * @param {string} options.message - Modal message/content
 * @param {string} options.emoji - Optional emoji to display
 * @param {boolean} options.autoHide - Auto hide after delay
 * @param {number} options.autoHideDelay - Delay before auto hide (ms)
 * @param {Function} options.onClose - Callback when modal closes
 * @param {Array} options.buttons - Array of button configs
 * @returns {Object} Modal control object
 */
export function createModal(options = {}) {
    const {
        title = '',
        message = '',
        emoji = '',
        autoHide = false,
        autoHideDelay = 3000,
        onClose = null,
        buttons = [{ text: 'סגור', action: 'close' }]
    } = options;

    // Create modal elements
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    const modal = document.createElement('div');
    modal.className = 'modal-content';
    modal.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        transform: scale(0.9);
        transition: transform 0.3s ease;
        text-align: center;
    `;

    // Add emoji if provided
    if (emoji) {
        const emojiDiv = document.createElement('div');
        emojiDiv.style.cssText = 'font-size: 48px; margin-bottom: 16px;';
        emojiDiv.textContent = emoji;
        modal.appendChild(emojiDiv);
    }

    // Add title if provided
    if (title) {
        const titleDiv = document.createElement('h2');
        titleDiv.style.cssText = 'margin: 0 0 16px 0; font-size: 24px; color: #333;';
        titleDiv.textContent = title;
        modal.appendChild(titleDiv);
    }

    // Add message
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = 'margin-bottom: 20px; font-size: 16px; color: #666; line-height: 1.5;';
    messageDiv.innerHTML = message;
    modal.appendChild(messageDiv);

    // Add buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 10px; justify-content: center;';

    buttons.forEach(buttonConfig => {
        const button = document.createElement('button');
        button.textContent = buttonConfig.text;
        button.style.cssText = `
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            background: ${buttonConfig.primary ? '#4CAF50' : '#f0f0f0'};
            color: ${buttonConfig.primary ? 'white' : '#333'};
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = 'none';
        });

        button.addEventListener('click', () => {
            if (buttonConfig.onClick) {
                buttonConfig.onClick();
            }
            if (buttonConfig.action === 'close') {
                modalControl.hide();
            }
        });

        buttonContainer.appendChild(button);
    });

    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);

    // Modal control object
    const modalControl = {
        show() {
            document.body.appendChild(overlay);

            // Trigger animation
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
                modal.style.transform = 'scale(1)';
            });

            if (autoHide) {
                setTimeout(() => this.hide(), autoHideDelay);
            }
        },

        hide() {
            overlay.style.opacity = '0';
            modal.style.transform = 'scale(0.9)';

            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                if (onClose) {
                    onClose();
                }
            }, 300);
        },

        updateMessage(newMessage) {
            messageDiv.innerHTML = newMessage;
        }
    };

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            modalControl.hide();
        }
    });

    return modalControl;
}

/**
 * Show a simple alert modal
 * @param {string} message - Alert message
 * @param {string} title - Optional title
 * @returns {Promise} Resolves when modal is closed
 */
export function showAlert(message, title = '') {
    return new Promise(resolve => {
        const modal = createModal({
            title,
            message,
            buttons: [{ text: 'אישור', action: 'close', primary: true }],
            onClose: resolve
        });
        modal.show();
    });
}

/**
 * Show a confirmation modal
 * @param {string} message - Confirmation message
 * @param {string} title - Optional title
 * @returns {Promise<boolean>} Resolves with true if confirmed, false if cancelled
 */
export function showConfirm(message, title = '') {
    return new Promise(resolve => {
        let result = false;

        const modal = createModal({
            title,
            message,
            buttons: [
                {
                    text: 'ביטול',
                    action: 'close',
                    onClick: () => { result = false; }
                },
                {
                    text: 'אישור',
                    action: 'close',
                    primary: true,
                    onClick: () => { result = true; }
                }
            ],
            onClose: () => resolve(result)
        });
        modal.show();
    });
}

/**
 * Show a temporary notification
 * @param {string} message - Notification message
 * @param {string} type - Type: 'success', 'error', 'info', 'warning'
 * @param {number} duration - Display duration in ms
 */
export function showNotification(message, type = 'info', duration = 3000) {
    const emojis = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const modal = createModal({
        message,
        emoji: emojis[type] || '',
        autoHide: true,
        autoHideDelay: duration,
        buttons: []
    });

    modal.show();
}
