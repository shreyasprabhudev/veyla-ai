(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    DEBOUNCE_DELAY: 300,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    DEBUG: true // Debug is now on by default
  };

  // Debug logging
  const debug = {
    log: (...args) => CONFIG.DEBUG && console.log('[VeylaAI Debug]:', ...args),
    warn: (...args) => CONFIG.DEBUG && console.warn('[VeylaAI Debug]:', ...args),
    error: (...args) => CONFIG.DEBUG && console.error('[VeylaAI Debug]:', ...args)
  };

  // Track initialization state
  let isInitialized = false;

  // LLM Platform Selectors
  const LLM_PLATFORMS = {
    'chatgpt.com': {
      inputSelector: '#prompt-textarea',
      submitSelector: 'button[data-testid="send-button"]',
      submitEvent: 'click'
    },
    'chat.openai.com': {
      inputSelector: '#prompt-textarea',
      submitSelector: 'button[data-testid="send-button"]',
      submitEvent: 'click'
    },
    'claude.ai': {
      inputSelector: [
        '.ProseMirror[contenteditable="true"]',
        '[role="textbox"]',
        'div[contenteditable="true"]',
        '.editor-wrapper [contenteditable="true"]'
      ].join(','),
      submitSelector: [
        'button[type="submit"]',
        'button:has(svg)',
        'button.absolute',
        'button[aria-label*="send" i]',
        'button[aria-label*="submit" i]'
      ].join(','),
      submitEvent: 'click',
      getInputText: (input) => input.textContent || input.innerText
    },
    'gemini.google.com': {
      inputSelector: 'textarea[aria-label="Input box"]',
      submitSelector: 'button[aria-label="Send message"]',
      submitEvent: 'click'
    }
  };

  // Cache for processed text
  const textCache = new Map();

  // Sensitive data patterns with improved validation
  const PATTERNS = {
    ssn: {
      pattern: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g,
      validate: (match) => {
        const nums = match.replace(/\D/g, '');
        // Additional SSN validation rules
        if (nums.length !== 9) return false;
        if (nums === '000000000') return false;
        if (nums.startsWith('000')) return false;
        if (nums.startsWith('666')) return false;
        if (parseInt(nums.substr(0, 3)) >= 900) return false;
        if (nums.substr(3, 2) === '00') return false;
        if (nums.substr(5, 4) === '0000') return false;
        return true;
      },
      description: 'Social Security Number'
    },
    creditCard: {
      pattern: /\b\d{4}[-.]?\d{4}[-.]?\d{4}[-.]?\d{4}\b/g,
      validate: (num) => {
        const digits = num.replace(/\D/g, '');
        if (digits.length < 13 || digits.length > 19) return false;
        // Luhn algorithm for credit card validation
        let sum = 0;
        let isEven = false;
        for (let i = digits.length - 1; i >= 0; i--) {
          let digit = parseInt(digits[i]);
          if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
          }
          sum += digit;
          isEven = !isEven;
        }
        return sum % 10 === 0;
      },
      description: 'Credit Card Number'
    },
    email: {
      pattern: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
      validate: (email) => {
        const [local, domain] = email.split('@');
        return local && domain && domain.includes('.');
      },
      description: 'Email Address'
    },
    phone: {
      pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      validate: (phone) => {
        const digits = phone.replace(/\D/g, '');
        if (digits.length !== 10) return false;
        // Reject if all digits are the same
        if (new Set(digits).size === 1) return false;
        // Reject if first digit is 0 or 1
        if (digits[0] === '0' || digits[0] === '1') return false;
        return true;
      },
      description: 'Phone Number'
    }
  };

  // Check text for sensitive information
  async function checkAndHighlightSensitiveInfo(input) {
    try {
      const text = input.value || input.textContent || '';
      if (!text.trim()) return null;

      // Check cache
      const cacheKey = text.trim();
      if (textCache.has(cacheKey)) {
        debug.log('Using cached result for text');
        return textCache.get(cacheKey);
      }

      debug.log('Checking text for sensitive information');
      const sensitiveParts = {};
      
      for (const [type, {pattern, validate, description}] of Object.entries(PATTERNS)) {
        const matches = Array.from(text.matchAll(pattern))
          .filter(match => validate(match[0]));
        
        if (matches.length > 0) {
          debug.log(`Found ${matches.length} matches for ${type}`);
          sensitiveParts[type] = matches;
        }
      }

      if (Object.keys(sensitiveParts).length === 0) {
        debug.log('No sensitive information found');
        textCache.set(cacheKey, null);
        return null;
      }

      debug.log('Found sensitive information:', Object.keys(sensitiveParts));
      textCache.set(cacheKey, sensitiveParts);
      return sensitiveParts;
    } catch (error) {
      debug.error('Error checking sensitive info:', error);
      return null;
    }
  }

  // Create warning tooltip
  function createWarningTooltip() {
    const tooltip = document.createElement('div');
    tooltip.className = 'opaque-ai-tooltip';
    document.body.appendChild(tooltip);
    return tooltip;
  }

  // Show warning tooltip
  function showWarningTooltip(element, sensitiveParts) {
    const tooltip = document.querySelector('.opaque-ai-tooltip') || createWarningTooltip();
    const rect = element.getBoundingClientRect();
    
    const warnings = Object.entries(sensitiveParts)
      .map(([type, matches]) => PATTERNS[type].description)
      .join(' and ');

    tooltip.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <div class="opaque-ai-warning-icon">⚠️</div>
        <span style="color: #7C3AED; font-weight: 600;">Sensitive Information Detected</span>
      </div>
      <p style="margin: 0 0 8px; color: #6B7280;">
        ${warnings} found in your message
      </p>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button class="opaque-ai-proceed">Keep</button>
        <button class="opaque-ai-edit">Remove</button>
      </div>
    `;

    // Position tooltip
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    tooltip.style.top = `${rect.top + scrollTop - tooltip.offsetHeight - 10}px`;
    tooltip.style.left = `${rect.left}px`;
    
    // Show tooltip with animation
    requestAnimationFrame(() => tooltip.classList.add('show'));

    return new Promise((resolve) => {
      const proceed = tooltip.querySelector('.opaque-ai-proceed');
      const edit = tooltip.querySelector('.opaque-ai-edit');
      
      const cleanup = () => {
        tooltip.classList.remove('show');
        setTimeout(() => tooltip.remove(), 200);
      };

      proceed.onclick = () => {
        debug.log('User clicked Keep button');
        cleanup();
        resolve(true);
      };

      edit.onclick = () => {
        debug.log('User clicked Remove button');
        // Remove sensitive information
        const input = element;
        const text = input.value || input.textContent || '';
        
        // Replace sensitive parts with redacted text
        let redactedText = text;
        Object.entries(sensitiveParts).forEach(([type, matches]) => {
          matches.forEach(match => {
            redactedText = redactedText.replace(match[0], '[REDACTED]');
          });
        });

        // Update input
        if (typeof input.value !== 'undefined') {
          input.value = redactedText;
        } else {
          input.textContent = redactedText;
        }

        // Trigger input event to update UI
        input.dispatchEvent(new Event('input', { bubbles: true }));
        
        cleanup();
        resolve(false);
      };
    });
  }

  // Handle submit event
  async function handleSubmit(e) {
    const input = document.querySelector(LLM_PLATFORMS[window.location.hostname].inputSelector);
    if (!input) return;

    const result = await checkAndHighlightSensitiveInfo(input);
    if (result) {
      e.preventDefault();
      e.stopPropagation();
      
      const shouldProceed = await showWarningTooltip(input, result);
      if (!shouldProceed) {
        debug.log('User chose to edit sensitive info');
        return;
      }
      debug.log('User chose to proceed with sensitive info');
    }
  }

  // Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Initialize the extension
  function initialize() {
    if (isInitialized) {
      debug.log('Already initialized, skipping');
      return;
    }

    try {
      // Get current platform
      const hostname = window.location.hostname;
      const platform = Object.entries(LLM_PLATFORMS)
        .find(([domain]) => hostname.includes(domain));

      if (!platform) {
        debug.warn('Unsupported platform:', hostname);
        return;
      }

      const [_, config] = platform;
      
      // Setup input listener
      const inputElement = document.querySelector(config.inputSelector);
      if (!inputElement) {
        debug.warn('Input element not found, will retry on DOM changes');
        return;
      }

      const debouncedCheck = debounce(async (e) => {
        const result = await checkAndHighlightSensitiveInfo(e.target);
        if (result) {
          showWarningTooltip(e.target, result);
        }
      }, CONFIG.DEBOUNCE_DELAY);

      inputElement.addEventListener('input', debouncedCheck);
      
      // Setup submit protection
      const submitButton = document.querySelector(config.submitSelector);
      if (submitButton) {
        submitButton.addEventListener(config.submitEvent, handleSubmit);
      }

      isInitialized = true;
      debug.log('VeylaAI initialized successfully');
    } catch (error) {
      debug.error('Initialization error:', error);
    }
  }

  // Start monitoring for dynamic content changes
  function startMonitoring() {
    debug.log('Starting content monitoring');
    
    // Initial check
    initialize();

    // Setup mutation observer for dynamic content
    const observer = new MutationObserver(() => {
      if (!isInitialized) {
        initialize();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    debug.log('Mutation observer setup complete');
  }

  // Start the extension when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startMonitoring);
  } else {
    startMonitoring();
  }

  // Initialize styles
  function initializeStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .opaque-ai-highlight {
        border-bottom: 2px solid #7C3AED;
        background: rgba(124, 58, 237, 0.1);
        transition: background-color 0.2s;
        cursor: pointer;
        display: inline;
      }
      
      .opaque-ai-tooltip {
        position: fixed;
        background: white;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 16px;
        max-width: 320px;
        z-index: 2147483647;
        font-family: system-ui, -apple-system, sans-serif;
        opacity: 0;
        transform: translateY(10px);
        transition: opacity 0.2s, transform 0.2s;
        pointer-events: none;
      }

      .opaque-ai-tooltip.show {
        opacity: 1;
        transform: translateY(0);
        pointer-events: all;
      }
    `;
    document.head.appendChild(style);
  }

  initializeStyles();

})();
