// Optimized pattern matching service
import * as tf from '@tensorflow/tfjs';
import cacheService from './cache-service.js';

// Utility functions for pattern validation
const utils = {
  // Luhn algorithm for credit card validation
  luhnCheck: (num) => {
    const arr = (num + '')
      .split('')
      .reverse()
      .map(x => parseInt(x));
    const lastDigit = arr.shift();
    let sum = arr.reduce(
      (acc, val, i) => (i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9) || 9),
      0
    );
    sum += lastDigit;
    return sum % 10 === 0;
  },

  // Email validation with domain check
  isValidEmail: (email) => {
    const [local, domain] = email.split('@');
    if (!local || !domain) return false;
    
    // Check local part length
    if (local.length > 64 || domain.length > 255) return false;
    
    // Check domain has at least one period and valid TLD
    const domainParts = domain.split('.');
    if (domainParts.length < 2) return false;
    
    // Check TLD is valid (basic check)
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) return false;
    
    return true;
  },

  // Phone number validation
  isValidPhone: (phone) => {
    // Remove all non-numeric characters
    const digits = phone.replace(/\D/g, '');
    // Check if length is valid (7-15 digits)
    return digits.length >= 7 && digits.length <= 15;
  }
};

class PatternService {
  constructor() {
    this.model = null;
    this.modelLoading = false;
    this.patterns = {
      ssn: {
        pattern: /\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b/g,
        validate: (match) => {
          const nums = match.replace(/\D/g, '');
          return nums.length === 9 && nums !== '000000000';
        },
        description: 'Social Security Number'
      },
      creditCard: {
        pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})\b/g,
        validate: utils.luhnCheck,
        description: 'Credit Card Number'
      },
      email: {
        pattern: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
        validate: utils.isValidEmail,
        description: 'Email Address'
      },
      phone: {
        pattern: /\b(?:\+\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b/g,
        validate: utils.isValidPhone,
        description: 'Phone Number'
      }
    };
    
    this.initializeModel();
  }

  async initializeModel() {
    if (this.modelLoading) return;
    this.modelLoading = true;

    try {
      // Load model with retry logic
      for (let i = 0; i < 3; i++) {
        try {
          this.model = await tf.loadLayersModel(
            chrome.runtime.getURL('models/transformer-lite/model.json')
          );
          break;
        } catch (error) {
          if (i === 2) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('Model initialization error:', error);
    } finally {
      this.modelLoading = false;
    }
  }

  // Sanitize input text with improved security
  sanitizeInput(text) {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[^\w\s@.-]/g, '') // Remove special chars except those needed for patterns
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  // Batch process multiple matches with validation
  async batchProcessMatches(text) {
    const sanitizedText = this.sanitizeInput(text);
    
    // Check cache first
    const cached = await cacheService.getCached(sanitizedText);
    if (cached) {
      return cached;
    }

    // Process all patterns in parallel with validation
    const results = await Promise.all(
      Object.entries(this.patterns).map(async ([type, {pattern, validate, description}]) => {
        const matches = [...sanitizedText.matchAll(pattern)]
          .filter(match => validate(match[0]))
          .map(match => ({
            value: match[0],
            index: match.index,
            confidence: 1.0
          }));

        return {
          type,
          description,
          matches
        };
      })
    );

    // If model is loaded, enhance with ML-based detection
    if (this.model) {
      try {
        const mlResults = await this.detectWithML(sanitizedText);
        results.push(...mlResults);
      } catch (error) {
        console.error('ML detection error:', error);
      }
    }

    // Filter out empty results and cache
    const finalResults = results.filter(r => r.matches.length > 0);
    await cacheService.setCached(sanitizedText, finalResults);
    
    return finalResults;
  }

  // ML-based pattern detection with improved preprocessing
  async detectWithML(text) {
    if (!this.model) return [];

    try {
      // Preprocess text into overlapping windows
      const windows = [];
      const windowSize = 32;
      const stride = 16;
      
      for (let i = 0; i < text.length - windowSize + 1; i += stride) {
        windows.push(text.slice(i, i + windowSize));
      }

      // Convert windows to tensors
      const tensors = windows.map(window => 
        tf.tensor2d([Array.from(window).map(c => c.charCodeAt(0) % 256)])
      );

      // Batch process windows
      const predictions = await Promise.all(
        tensors.map(async tensor => {
          const pred = await this.model.predict(tensor).array();
          tensor.dispose();
          return pred[0];
        })
      );

      // Aggregate predictions
      return predictions
        .map((probs, idx) => ({
          type: 'ml_detected',
          description: 'ML-Detected Sensitive Data',
          matches: [{
            value: windows[idx],
            index: idx * stride,
            confidence: Math.max(...probs)
          }]
        }))
        .filter(pred => pred.matches[0].confidence > 0.8);
    } catch (error) {
      console.error('ML prediction error:', error);
      return [];
    }
  }
}

export default new PatternService();
