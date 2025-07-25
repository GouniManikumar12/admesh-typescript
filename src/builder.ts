// File generated for AdMesh PII sanitization functionality

/**
 * Prompt building module for reconstructing clean, structured prompts from sanitized input.
 * Builds contextual prompts using extracted information while maintaining natural language flow.
 */

interface ExtractedContext {
  age: number | null;
  gender: string | null;
  goal: string | null;
}

interface DetectedPII {
  names: string[];
  emails: string[];
  phones: string[];
}

interface FormattedPII {
  name: string | null;
  email: string | null;
  phone: string | null;
}

/**
 * Handles reconstruction of clean, structured prompts from sanitized input and extracted context.
 * 
 * This class provides methods to:
 * - Build contextual prompts using extracted information
 * - Use fallback templates when context is incomplete
 * - Maintain natural language flow
 * - Generate privacy-preserving prompts
 */
export class PromptBuilder {
  private contextTemplates: Record<string, string>;
  private goalPrefixes: Record<string, string>;

  constructor() {
    this.contextTemplates = {
      full: 'Suggest tools for a {age}-year-old {gender} {goal}.',
      age_gender: 'Suggest tools for a {age}-year-old {gender}.',
      age_goal: 'Suggest tools for someone {goal} (age {age}).',
      gender_goal: 'Suggest tools for a {gender} {goal}.',
      age_only: 'Suggest tools for a {age}-year-old.',
      gender_only: 'Suggest tools for a {gender}.',
      goal_only: 'Suggest tools for {goal}.',
      fallback: 'Suggest relevant tools and services.',
    };
    
    this.goalPrefixes = {
      building: 'building',
      creating: 'creating',
      developing: 'developing',
      making: 'making',
      'working on': 'working on',
      starting: 'starting',
      launching: 'launching',
    };
  }

  /**
   * Normalize goal text to ensure proper grammar in templates.
   */
  normalizeGoal(goal: string): string {
    if (!goal) {
      return '';
    }

    const normalizedGoal = goal.trim().toLowerCase();
    
    // Ensure goal starts with appropriate verb or article
    for (const prefix of Object.keys(this.goalPrefixes)) {
      if (normalizedGoal.startsWith(prefix)) {
        return normalizedGoal;
      }
    }
    
    // Add appropriate prefix if missing
    if (normalizedGoal.startsWith('a ') || normalizedGoal.startsWith('an ') || normalizedGoal.startsWith('the ')) {
      return `working on ${normalizedGoal}`;
    } else if (['app', 'website', 'business', 'startup', 'tool', 'platform'].some(word => normalizedGoal.startsWith(word))) {
      return `building ${normalizedGoal}`;
    } else {
      return `working on ${normalizedGoal}`;
    }
  }

  /**
   * Select the most appropriate template based on available context.
   */
  selectTemplate(age: number | null, gender: string | null, goal: string | null): string {
    const hasAge = age !== null;
    const hasGender = gender !== null;
    const hasGoal = goal !== null && goal.trim().length > 0;
    
    if (hasAge && hasGender && hasGoal) {
      return 'full';
    } else if (hasAge && hasGender) {
      return 'age_gender';
    } else if (hasAge && hasGoal) {
      return 'age_goal';
    } else if (hasGender && hasGoal) {
      return 'gender_goal';
    } else if (hasAge) {
      return 'age_only';
    } else if (hasGender) {
      return 'gender_only';
    } else if (hasGoal) {
      return 'goal_only';
    } else {
      return 'fallback';
    }
  }

  /**
   * Build a structured prompt from extracted context information.
   */
  buildPrompt(extractedContext: ExtractedContext): string {
    const { age, gender, goal } = extractedContext;
    
    // Normalize goal if present
    const normalizedGoal = goal ? this.normalizeGoal(goal) : null;
    
    // Select appropriate template
    const templateKey = this.selectTemplate(age, gender, normalizedGoal);
    const template = this.contextTemplates[templateKey];
    
    // Build prompt using template
    try {
      switch (templateKey) {
        case 'full':
          return template
            .replace('{age}', age!.toString())
            .replace('{gender}', gender!)
            .replace('{goal}', normalizedGoal!);
        case 'age_gender':
          return template
            .replace('{age}', age!.toString())
            .replace('{gender}', gender!);
        case 'age_goal':
          return template
            .replace('{age}', age!.toString())
            .replace('{goal}', normalizedGoal!);
        case 'gender_goal':
          return template
            .replace('{gender}', gender!)
            .replace('{goal}', normalizedGoal!);
        case 'age_only':
          return template.replace('{age}', age!.toString());
        case 'gender_only':
          return template.replace('{gender}', gender!);
        case 'goal_only':
          return template.replace('{goal}', normalizedGoal!);
        default:
          return template;
      }
    } catch {
      // Fallback to basic template if formatting fails
      return this.contextTemplates.fallback;
    }
  }

  /**
   * Enhance the base prompt with additional context from sanitized text.
   */
  enhanceWithSanitizedText(basePrompt: string, sanitizedText: string): string {
    if (!sanitizedText || ['', '[NAME]', '[EMAIL]', '[PHONE]'].includes(sanitizedText.trim())) {
      return basePrompt;
    }

    // Clean up sanitized text
    const cleanedText = sanitizedText.trim();

    // Remove placeholder tokens if they're the only content or mostly placeholders
    const placeholderTokens = ['[NAME]', '[EMAIL]', '[PHONE]'];
    const words = cleanedText.split(/\s+/);
    const placeholderCount = words.filter(word =>
      placeholderTokens.some(token => word.includes(token))
    ).length;

    // If more than 50% of words are placeholders, don't add context
    if (words.length > 0 && placeholderCount / words.length > 0.5) {
      return basePrompt;
    }

    // Don't add context if it's too short or starts with common phrases
    if (cleanedText.length <= 20 || ['Suggest', 'I need', 'Looking for', 'Hi,', 'Hello,'].some(prefix => cleanedText.startsWith(prefix))) {
      return basePrompt;
    }

    return basePrompt;
  }

  /**
   * Build a complete prompt combining extracted context and sanitized text.
   */
  buildCompletePrompt(sanitizedText: string, extractedContext: ExtractedContext): string {
    // Build base prompt from context
    const basePrompt = this.buildPrompt(extractedContext);
    
    // Enhance with sanitized text if meaningful
    const enhancedPrompt = this.enhanceWithSanitizedText(basePrompt, sanitizedText);
    
    return enhancedPrompt;
  }

  /**
   * Format detected PII for the response structure.
   */
  formatRemovedPII(detectedPII: DetectedPII): FormattedPII {
    return {
      name: detectedPII.names.length > 0 ? detectedPII.names[0] : null,
      email: detectedPII.emails.length > 0 ? detectedPII.emails[0] : null,
      phone: detectedPII.phones.length > 0 ? detectedPII.phones[0] : null,
    };
  }
}
