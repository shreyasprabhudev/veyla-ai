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

// Sensitive data patterns
const PATTERNS = {
  ssn: {
    pattern: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g,
    description: 'Social Security Number'
  },
  creditCard: {
    pattern: /\b\d{4}[-.]?\d{4}[-.]?\d{4}[-.]?\d{4}\b/g,
    description: 'Credit Card Number'
  },
  email: {
    pattern: /\b[\w\.-]+@[\w\.-]+\.\w+\b/g,
    description: 'Email Address'
  },
  phone: {
    pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    description: 'Phone Number'
  }
};

// Wait for DOM to be ready
function waitForDOM() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      resolve();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        resolve();
      });
    }
  });
}

// Create and inject styles
function injectStyles() {
  // Wait for document.head to be available
  if (!document.head) {
    setTimeout(injectStyles, 100);
    return;
  }

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
      position: absolute;
      background: white;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 12px;
      max-width: 300px;
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      opacity: 0;
      transform: translateY(-10px);
      transition: opacity 0.2s, transform 0.2s;
      pointer-events: none;
    }

    .opaque-ai-tooltip.show {
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    }

    .opaque-ai-tooltip::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 20px;
      width: 12px;
      height: 12px;
      background: white;
      border-right: 1px solid #E5E7EB;
      border-bottom: 1px solid #E5E7EB;
      transform: rotate(45deg);
    }
  `;
  document.head.appendChild(style);
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
    <div class="flex items-center gap-2 mb-2">
      <div style="
        background: #7C3AED;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="color: white; font-size: 12px;">⚠️</span>
      </div>
      <span style="color: #7C3AED; font-weight: 600; font-size: 14px;">
        Sensitive Information Detected
      </span>
    </div>
    <p style="margin: 0 0 8px; color: #6B7280; font-size: 12px;">
      ${warnings} found in your message
    </p>
    <div style="display: flex; gap: 8px; justify-content: flex-end;">
      <button class="opaque-proceed" style="
        padding: 4px 8px;
        background: #7C3AED;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        font-weight: 500;
      ">Keep</button>
      <button class="opaque-edit" style="
        padding: 4px 8px;
        background: #F3F4F6;
        color: #1F2937;
        border: 1px solid #E5E7EB;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        font-weight: 500;
      ">Remove</button>
    </div>
  `;

  // Position tooltip above the element
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  tooltip.style.top = `${rect.top + scrollTop + rect.height + 10}px`;
  tooltip.style.left = `${rect.left}px`;
  
  // Show tooltip with animation
  setTimeout(() => tooltip.classList.add('show'), 10);

  return new Promise((resolve) => {
    const proceed = tooltip.querySelector('.opaque-proceed');
    const edit = tooltip.querySelector('.opaque-edit');
    
    const cleanup = () => {
      tooltip.classList.remove('show');
      setTimeout(() => tooltip.remove(), 200);
      proceed.removeEventListener('click', handleProceed);
      edit.removeEventListener('click', handleEdit);
    };
    
    const handleProceed = () => {
      cleanup();
      resolve(true);
    };
    
    const handleEdit = () => {
      cleanup();
      resolve(false);
    };
    
    proceed.addEventListener('click', handleProceed);
    edit.addEventListener('click', handleEdit);
  });
}

// Wait for specific element to be available
function waitForElement(selector, timeout = 10000) {
  console.log(`[OpaqueAI] Waiting for element: ${selector}`);
  return new Promise((resolve) => {
    // First try: immediate check
    const element = document.querySelector(selector);
    if (element) {
      console.log(`[OpaqueAI] Element found immediately: ${selector}`);
      return resolve(element);
    }

    // Second try: wait for a short time and check again
    setTimeout(() => {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`[OpaqueAI] Element found after short wait: ${selector}`);
        return resolve(element);
      }

      // Third try: set up mutation observer
      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          console.log(`[OpaqueAI] Element found after waiting: ${selector}`);
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
      });

      // Set up timeout
      setTimeout(() => {
        observer.disconnect();
        // One final check before timing out
        const element = document.querySelector(selector);
        if (element) {
          console.log(`[OpaqueAI] Element found in final check: ${selector}`);
          resolve(element);
        } else {
          console.log(`[OpaqueAI] Timeout waiting for element: ${selector}`);
          resolve(null);
        }
      }, timeout);
    }, 100);
  });
}

// Check text for sensitive information and highlight it
async function checkAndHighlightSensitiveInfo(input) {
  // Get text content based on input type and platform
  let text = '';
  
  // Special handling for Claude's interface
  if (window.location.hostname.includes('claude.ai')) {
    // Try to get text from all possible locations
    const proseMirror = input.querySelector('.ProseMirror');
    if (proseMirror) {
      text = proseMirror.textContent;
    } else if (input.classList.contains('ProseMirror')) {
      text = input.textContent;
    } else {
      // Fallback to checking all paragraphs
      const paragraphs = input.querySelectorAll('p');
      text = Array.from(paragraphs).map(p => p.textContent).join('\n');
    }
  } else {
    // Default text extraction for other platforms
    text = input.value || input.textContent || input.innerText || '';
  }

  console.log('[OpaqueAI] Checking text:', text);
  
  if (!text) {
    console.log('[OpaqueAI] No text to check');
    return null;
  }

  // Remove any existing highlights
  const existingHighlights = input.querySelectorAll('.opaque-ai-highlight');
  existingHighlights.forEach(highlight => {
    const parent = highlight.parentElement;
    if (parent) {
      parent.replaceChild(document.createTextNode(highlight.textContent || ''), highlight);
      parent.normalize();
    }
  });

  let sensitiveParts = null;
  let highlightedRange = null;

  for (const [type, { pattern, description }] of Object.entries(PATTERNS)) {
    const matches = Array.from(text.matchAll(pattern));
    if (matches.length > 0) {
      console.log(`[OpaqueAI] Found ${matches.length} matches for ${type}`);
      sensitiveParts = { [type]: matches.map(m => m[0]) };
      
      try {
        // For contenteditable elements
        if (input.isContentEditable || input.querySelector('[contenteditable="true"]')) {
          // Find the specific contenteditable element
          const editableElement = input.isContentEditable ? input : input.querySelector('[contenteditable="true"]');
          if (!editableElement) return;

          // Find all text nodes
          const walker = document.createTreeWalker(
            editableElement,
            NodeFilter.SHOW_TEXT,
            null,
            false
          );

          let node;
          while (node = walker.nextNode()) {
            const nodeText = node.textContent;
            const match = nodeText.match(pattern);
            if (match) {
              const range = document.createRange();
              const startPos = nodeText.indexOf(match[0]);
              const endPos = startPos + match[0].length;
              
              range.setStart(node, startPos);
              range.setEnd(node, endPos);
              
              // Create highlight span
              const span = document.createElement('span');
              span.className = 'opaque-ai-highlight';
              range.surroundContents(span);
              highlightedRange = range;
              
              // Update walker to continue from new position
              walker.currentNode = span;
            }
          }
        } 
      } catch (e) {
        console.error('[OpaqueAI] Failed to highlight text:', e);
      }
      break;
    }
  }

  if (sensitiveParts && highlightedRange) {
    console.log('[OpaqueAI] Showing warning tooltip');
    const shouldKeep = await showWarningTooltip(
      highlightedRange.commonAncestorContainer?.parentElement || highlightedRange,
      sensitiveParts
    );
    
    if (!shouldKeep) {
      console.log('[OpaqueAI] Removing sensitive text');
      if (input.isContentEditable || input.querySelector('[contenteditable="true"]')) {
        const span = highlightedRange.commonAncestorContainer.parentElement;
        if (span && span.parentElement) {
          // Replace the sensitive text with an empty string
          span.parentElement.replaceChild(document.createTextNode(''), span);
          // Normalize to merge adjacent text nodes
          span.parentElement.normalize();
        }
      }
    }
  }

  return sensitiveParts;
}

// Debounce function to limit how often we check input
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

// Handle submit event
async function handleSubmit(e) {
  console.log('OpaqueAI: Submit button clicked');
  const input = document.querySelector(LLM_PLATFORMS[window.location.hostname].inputSelector);
  if (!input) return;

  const text = LLM_PLATFORMS[window.location.hostname].getInputText 
    ? LLM_PLATFORMS[window.location.hostname].getInputText(input)
    : input.value;

  const sensitiveParts = await checkAndHighlightSensitiveInfo(input);
  if (sensitiveParts) {
    e.preventDefault();
    e.stopPropagation();
  }
}

// Initialize the extension
async function initialize(retryCount = 0) {
  console.log(`[OpaqueAI] Initializing... (attempt ${retryCount + 1})`);
  
  try {
    // Wait for DOM to be ready first
    await waitForDOM();
    console.log('[OpaqueAI] DOM is ready');

    // Then inject styles
    injectStyles();

    // Get current platform config
    const hostname = window.location.hostname;
    const platformConfig = LLM_PLATFORMS[hostname];
    
    if (!platformConfig) {
      console.log('[OpaqueAI] Platform not supported:', hostname);
      return;
    }

    console.log('[OpaqueAI] Platform config:', platformConfig);

    // Function to check initial content
    const checkInitialContent = async (element) => {
      if (!element) return;
      console.log('[OpaqueAI] Checking initial content');
      await checkAndHighlightSensitiveInfo(element);
    };

    // Wait for input element with retry
    const findInput = async () => {
      const input = document.querySelector(platformConfig.inputSelector);
      if (input) {
        await checkInitialContent(input);
        return input;
      }
      
      // Wait for ProseMirror to be ready
      return new Promise((resolve) => {
        const observer = new MutationObserver(async (mutations, obs) => {
          const input = document.querySelector(platformConfig.inputSelector);
          if (input) {
            obs.disconnect();
            await checkInitialContent(input);
            resolve(input);
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      });
    };

    const input = await findInput();
    if (!input) {
      throw new Error('Failed to find input element');
    }

    // Function to get the actual text content
    const getTextContent = (element) => {
      if (element.classList.contains('ProseMirror')) {
        return Array.from(element.childNodes)
          .filter(node => node.nodeType === Node.TEXT_NODE || node.nodeName === 'P')
          .map(node => node.textContent)
          .join('\n')
          .trim();
      }
      return element.textContent?.trim() || '';
    };

    // Add input event listeners for real-time checking
    const checkInput = debounce(async (event) => {
      console.log('[OpaqueAI] Input event triggered');
      const target = event.target.closest('.ProseMirror') || event.target;
      const text = getTextContent(target);
      console.log('[OpaqueAI] Detected text:', text);
      
      if (text) {
        await checkAndHighlightSensitiveInfo(target);
      }
    }, 300);

    // For Claude's interface, we need to listen to the actual editable element
    const editableElement = input.querySelector('[contenteditable="true"]') || input;
    
    // Remove any existing listeners
    const existingListeners = editableElement._opaqueListeners || [];
    existingListeners.forEach(([event, listener]) => {
      editableElement.removeEventListener(event, listener);
    });

    // Add new listeners
    const events = ['input', 'change', 'paste', 'focus'];
    const newListeners = [];
    events.forEach(event => {
      editableElement.addEventListener(event, checkInput);
      newListeners.push([event, checkInput]);
    });
    editableElement._opaqueListeners = newListeners;

    // Check content on initialization
    await checkInitialContent(editableElement);

    // Setup mutation observer to watch for submit button
    const observer = new MutationObserver((mutations) => {
      const submit = document.querySelector(platformConfig.submitSelector);
      if (submit && !submit.hasOpaqueListener) {
        console.log('[OpaqueAI] Submit button found, attaching listener');
        submit.addEventListener(platformConfig.submitEvent, handleSubmit, true);
        submit.hasOpaqueListener = true;
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true
    });

    console.log('[OpaqueAI] Initialization complete');
  } catch (error) {
    console.error('[OpaqueAI] Initialization error:', error);
    if (retryCount < 3) {
      console.log(`[OpaqueAI] Retrying after error... (attempt ${retryCount + 2})`);
      setTimeout(() => initialize(retryCount + 1), 2000);
    }
  }
}

// Start initialization
(function() {
  'use strict';
  initialize();
})();
