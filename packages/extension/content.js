// LLM Platform Selectors
const LLM_PLATFORMS = {
  'chatgpt.com': {
    inputSelector: '#prompt-textarea',
    submitSelector: 'button[data-testid="send-button"]',
    submitEvent: 'click'
  },
  'claude.ai': {
    inputSelector: 'div[contenteditable="true"]',
    submitSelector: 'button[aria-label="Send message"]',
    submitEvent: 'click'
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

// Create warning overlay
function createWarningOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'opaque-ai-warning';
  overlay.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    max-width: 400px;
    width: 90%;
  `;
  return overlay;
}

// Show warning modal
function showWarningModal(sensitiveParts) {
  const overlay = createWarningOverlay();
  const warnings = Object.entries(sensitiveParts)
    .map(([type, matches]) => `<li>${PATTERNS[type].description} detected</li>`)
    .join('');
    
  overlay.innerHTML = `
    <h3 style="color: #dc2626; margin: 0 0 10px; font-size: 18px;">⚠️ Sensitive Information Detected</h3>
    <p style="margin: 0 0 15px;">The following sensitive information was found in your message:</p>
    <ul style="margin: 0 0 15px; padding-left: 20px;">${warnings}</ul>
    <div style="display: flex; justify-content: flex-end; gap: 10px;">
      <button id="opaque-ai-proceed" style="padding: 8px 16px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">Proceed Anyway</button>
      <button id="opaque-ai-edit" style="padding: 8px 16px; background: #4b5563; color: white; border: none; border-radius: 4px; cursor: pointer;">Edit Message</button>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  return new Promise((resolve) => {
    const proceed = document.getElementById('opaque-ai-proceed');
    const edit = document.getElementById('opaque-ai-edit');
    
    const cleanup = () => {
      proceed.removeEventListener('click', handleProceed);
      edit.removeEventListener('click', handleEdit);
      overlay.remove();
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

// Check text for sensitive information
function checkSensitiveInfo(text) {
  if (!text) return null;
  
  const sensitiveParts = {};
  for (const [type, { pattern }] of Object.entries(PATTERNS)) {
    const matches = text.match(pattern);
    if (matches) {
      sensitiveParts[type] = matches;
    }
  }
  return Object.keys(sensitiveParts).length > 0 ? sensitiveParts : null;
}

// Monitor specific platform
function monitorPlatform() {
  const hostname = window.location.hostname;
  const platform = LLM_PLATFORMS[hostname];
  
  if (!platform) {
    console.log('OpaqueAI: Platform not supported');
    return;
  }
  
  let isProcessing = false;
  
  function handleSubmit(e) {
    if (isProcessing) return;
    
    const input = document.querySelector(platform.inputSelector);
    if (!input) return;
    
    const text = input.value || input.textContent;
    console.log('OpaqueAI: Checking text:', text);
    
    const sensitiveParts = checkSensitiveInfo(text);
    console.log('OpaqueAI: Detected sensitive parts:', sensitiveParts);
    
    if (sensitiveParts) {
      e.preventDefault();
      e.stopImmediatePropagation();
      isProcessing = true;
      
      showWarningModal(sensitiveParts)
        .then((proceed) => {
          isProcessing = false;
          if (proceed) {
            const submitButton = document.querySelector(platform.submitSelector);
            if (submitButton) {
              submitButton.click();
            }
          }
        })
        .catch(() => {
          isProcessing = false;
        });
    }
  }
  
  // Add event listener to the submit button
  const submitButton = document.querySelector(platform.submitSelector);
  if (submitButton) {
    submitButton.addEventListener(platform.submitEvent, handleSubmit, true);
  }
  
  // Re-attach listener when button changes (for dynamic UIs)
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        const newSubmitButton = document.querySelector(platform.submitSelector);
        if (newSubmitButton && !newSubmitButton.hasOpaqueListener) {
          newSubmitButton.addEventListener(platform.submitEvent, handleSubmit, true);
          newSubmitButton.hasOpaqueListener = true;
        }
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initialize monitoring
monitorPlatform();
