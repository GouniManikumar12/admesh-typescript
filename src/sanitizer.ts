// File generated for AdMesh PII sanitization functionality

/**
 * PII sanitization module for detecting and removing personally identifiable information.
 * All processing is done locally without external API calls for privacy preservation.
 */

import {
  COMPILED_PATTERNS,
  SINGLE_PATTERNS,
  isValidName,
  normalizeGender,
  extractGoalText,
} from './patterns';

interface DetectedPII {
  names: string[];
  emails: string[];
  phones: string[];
}

interface ExtractedContext {
  age: number | null;
  gender: string | null;
  goal: string | null;
}

interface AnalysisResult {
  sanitizedText: string;
  detectedPII: DetectedPII;
  extractedContext: ExtractedContext;
}

/**
 * Handles detection and removal of personally identifiable information from user input.
 * 
 * This class provides methods to:
 * - Detect names, emails, and phone numbers
 * - Extract contextual information (age, gender, goals)
 * - Remove PII while preserving context
 * - Maintain privacy by processing everything locally
 */
export class PIISanitizer {
  private namePatterns: RegExp[];
  private phonePatterns: RegExp[];
  private agePatterns: RegExp[];
  private genderPatterns: RegExp[];
  private goalPatterns: RegExp[];
  private emailPattern: RegExp;

  constructor() {
    this.namePatterns = COMPILED_PATTERNS.names;
    this.phonePatterns = COMPILED_PATTERNS.phones;
    this.agePatterns = COMPILED_PATTERNS.ages;
    this.genderPatterns = COMPILED_PATTERNS.genders;
    this.goalPatterns = COMPILED_PATTERNS.goals;
    this.emailPattern = SINGLE_PATTERNS.email;
  }

  /**
   * Detect names in the input text using multiple patterns.
   */
  detectNames(text: string): string[] {
    const names: string[] = [];

    for (const pattern of this.namePatterns) {
      // Reset regex lastIndex to ensure proper matching
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1];
        if (name && isValidName(name)) {
          // Additional check to avoid common phrases
          if (!['the ', 'a ', 'an '].some(phrase => name.toLowerCase().includes(phrase))) {
            names.push(name.trim());
          }
        }
      }
    }

    // Remove duplicates while preserving order
    const seen = new Set<string>();
    const uniqueNames: string[] = [];
    for (const name of names) {
      if (!seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        uniqueNames.push(name);
      }
    }

    return uniqueNames;
  }

  /**
   * Detect email addresses in the input text.
   */
  detectEmails(text: string): string[] {
    this.emailPattern.lastIndex = 0;
    const matches: string[] = [];
    let match;
    while ((match = this.emailPattern.exec(text)) !== null) {
      matches.push(match[0]);
    }
    return [...new Set(matches)]; // Remove duplicates
  }

  /**
   * Detect phone numbers in the input text using multiple patterns.
   */
  detectPhones(text: string): string[] {
    const phones: string[] = [];
    
    for (const pattern of this.phonePatterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match.length > 1) {
          // Reconstruct phone number from groups
          if (match.length === 4) {
            const phone = `(${match[1]}) ${match[2]}-${match[3]}`;
            phones.push(phone);
          } else {
            const phone = match.slice(1).join('-');
            phones.push(phone);
          }
        } else {
          phones.push(match[0]);
        }
      }
    }
    
    return [...new Set(phones)]; // Remove duplicates
  }

  /**
   * Extract age information from the input text.
   */
  extractAge(text: string): number | null {
    for (const pattern of this.agePatterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(text);
      if (match) {
        try {
          const age = parseInt(match[1], 10);
          // Validate reasonable age range
          if (age >= 13 && age <= 100) {
            return age;
          }
        } catch {
          continue;
        }
      }
    }
    
    return null;
  }

  /**
   * Extract gender information from the input text.
   */
  extractGender(text: string): string | null {
    for (const pattern of this.genderPatterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(text);
      if (match) {
        const gender = match[1];
        return normalizeGender(gender);
      }
    }
    
    return null;
  }

  /**
   * Extract goal/purpose information from the input text.
   */
  extractGoal(text: string): string | null {
    for (const pattern of this.goalPatterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(text);
      if (match) {
        const goalText = match[1];
        const cleanedGoal = extractGoalText(goalText);
        if (cleanedGoal && cleanedGoal.length > 3) {
          return cleanedGoal;
        }
      }
    }
    
    return null;
  }

  /**
   * Remove detected PII from the input text.
   */
  removePII(text: string, detectedPII: DetectedPII): string {
    let sanitizedText = text;
    
    // Remove names
    if (detectedPII.names.length > 0) {
      for (const name of detectedPII.names) {
        // Use word boundaries to avoid partial matches
        const pattern = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        sanitizedText = sanitizedText.replace(pattern, '[NAME]');
      }
    }
    
    // Remove emails
    if (detectedPII.emails.length > 0) {
      for (const email of detectedPII.emails) {
        sanitizedText = sanitizedText.replace(email, '[EMAIL]');
      }
    }
    
    // Remove phones
    if (detectedPII.phones.length > 0) {
      for (const phone of detectedPII.phones) {
        sanitizedText = sanitizedText.replace(phone, '[PHONE]');
      }
    }
    
    // Clean up multiple spaces and normalize
    sanitizedText = sanitizedText.replace(/\s+/g, ' ').trim();
    
    return sanitizedText;
  }

  /**
   * Perform complete PII analysis on the input text.
   */
  analyzeText(text: string): AnalysisResult {
    // Detect all PII
    const names = this.detectNames(text);
    const emails = this.detectEmails(text);
    const phones = this.detectPhones(text);
    
    // Extract context
    const age = this.extractAge(text);
    const gender = this.extractGender(text);
    const goal = this.extractGoal(text);
    
    // Prepare detected PII object
    const detectedPII: DetectedPII = {
      names,
      emails,
      phones,
    };
    
    // Remove PII from text
    const sanitizedText = this.removePII(text, detectedPII);
    
    // Prepare extracted context
    const extractedContext: ExtractedContext = {
      age,
      gender,
      goal,
    };
    
    return {
      sanitizedText,
      detectedPII,
      extractedContext,
    };
  }
}
