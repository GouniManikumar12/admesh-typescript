// File generated for AdMesh PII sanitization functionality

/**
 * Main module for PII sanitization and prompt building functionality.
 * Provides the primary sanitizeAndBuild function for the AdMesh TypeScript SDK.
 */

import { PIISanitizer } from './sanitizer';
import { PromptBuilder } from './builder';

interface SanitizeAndBuildResult {
  prompt: string;
  removed: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  extracted_context: {
    age: number | null;
    gender: string | null;
    goal: string | null;
  };
}

/**
 * Sanitizes user input by removing PII and builds a structured prompt.
 * 
 * This function performs the following operations:
 * 1. Detects and removes personally identifiable information (PII)
 * 2. Extracts contextual information (age, gender, goals)
 * 3. Builds a clean, structured prompt for the AdMesh /recommend endpoint
 * 4. Returns comprehensive analysis results
 * 
 * All processing is done locally without external API calls to ensure privacy.
 * 
 * @param userInput - Raw user input containing potential PII
 * @returns Object containing sanitized prompt, removed PII, and extracted context
 * 
 * @example
 * ```typescript
 * const result = sanitizeAndBuild("Hi, I'm Priya (priya@gmail.com). I'm a 27-year-old female building a wellness app.");
 * console.log(result);
 * // {
 * //   "prompt": "Suggest tools for a 27-year-old female building a wellness app.",
 * //   "removed": {
 * //     "name": "Priya",
 * //     "email": "priya@gmail.com",
 * //     "phone": null
 * //   },
 * //   "extracted_context": {
 * //     "age": 27,
 * //     "gender": "female", 
 * //     "goal": "building a wellness app"
 * //   }
 * // }
 * ```
 * 
 * Privacy Assurance:
 * - All processing happens locally on the client side
 * - No data is sent to external services during sanitization
 * - PII is completely removed from the final prompt
 * - Original input is not stored or logged
 * 
 * Performance:
 * - Typical processing time: < 100ms for standard inputs
 * - Memory usage: Minimal, patterns are pre-compiled
 * - No network requests during processing
 */
export function sanitizeAndBuild(userInput: string): SanitizeAndBuildResult {
  // Validate input
  if (!userInput || typeof userInput !== 'string') {
    return {
      prompt: 'Suggest relevant tools and services.',
      removed: {
        name: null,
        email: null,
        phone: null,
      },
      extracted_context: {
        age: null,
        gender: null,
        goal: null,
      },
    };
  }
  
  // Initialize sanitizer and builder
  const sanitizer = new PIISanitizer();
  const builder = new PromptBuilder();
  
  // Perform PII analysis
  const analysisResult = sanitizer.analyzeText(userInput);
  
  // Extract components
  const { sanitizedText, detectedPII, extractedContext } = analysisResult;
  
  // Build structured prompt
  const prompt = builder.buildCompletePrompt(sanitizedText, extractedContext);
  
  // Format removed PII for response
  const removedPII = builder.formatRemovedPII(detectedPII);
  
  // Return structured result
  return {
    prompt,
    removed: removedPII,
    extracted_context: extractedContext,
  };
}

/**
 * Alias for sanitizeAndBuild function for backward compatibility.
 * 
 * @param userInput - Raw user input containing potential PII
 * @returns Same structure as sanitizeAndBuild
 */
export function sanitizeUserInput(userInput: string): SanitizeAndBuildResult {
  return sanitizeAndBuild(userInput);
}

// Export types for external use
export type { SanitizeAndBuildResult };
