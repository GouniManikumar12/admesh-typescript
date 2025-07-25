// File generated for AdMesh PII sanitization functionality

/**
 * Regex patterns for PII detection and context extraction.
 * All patterns are compiled for performance and designed to be privacy-preserving.
 */

// PII Detection Patterns
export const NAME_PATTERNS = [
  // "I'm [Name]", "My name is [Name]", "I am [Name]"
  /\b(?:I'?m|my name is|I am|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/gi,
  // "Hi, I'm [Name]", "Hello, I'm [Name]"
  /\b(?:hi|hello|hey),?\s+(?:I'?m|my name is|I am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/gi,
  // "This is [Name]" - more specific to avoid capturing too much
  /\b(?:this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+here\b/gi,
];

export const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

export const PHONE_PATTERNS = [
  // +1-xxx-xxx-xxxx, +1 xxx xxx xxxx
  /\+1[-\s]?\(?(\d{3})\)?[-\s]?(\d{3})[-\s]?(\d{4})\b/g,
  // (xxx) xxx-xxxx
  /\((\d{3})\)\s?(\d{3})[-\s]?(\d{4})\b/g,
  // xxx-xxx-xxxx, xxx.xxx.xxxx
  /\b(\d{3})[-.](\d{3})[-.](\d{4})\b/g,
  // xxx xxx xxxx
  /\b(\d{3})\s(\d{3})\s(\d{4})\b/g,
  // International formats
  /\+\d{1,3}[-\s]?\d{1,14}\b/g,
];

// Context Extraction Patterns
export const AGE_PATTERNS = [
  // "I'm 27", "I am 27", "27 years old", "27-year-old"
  /\b(?:I'?m|I am)\s+(\d{1,2})\b/gi,
  /\b(\d{1,2})\s*(?:years?\s*old|yr\s*old|y\.?o\.?)\b/gi,
  /\b(\d{1,2})[-\s]?year[-\s]?old\b/gi,
  /\bage[:\s]+(\d{1,2})\b/gi,
];

export const GENDER_PATTERNS = [
  // Direct mentions
  /\b(male|female|man|woman|guy|girl|boy|gentleman|lady)\b/gi,
  // Contextual mentions
  /\b(?:I'?m a|I am a)\s+(male|female|man|woman|guy|girl)\b/gi,
];

export const GOAL_PATTERNS = [
  // Action-oriented goals - capture the full phrase including the action
  /\b((?:building|creating|developing|making|working on|starting|launching)\s+(?:a\s+)?[^.!?,]+)/gi,
  /\b((?:want to|need to|trying to|planning to|looking to)\s+[^.!?,]+)/gi,
  /\b(?:project|app|website|business|startup|company|tool|platform|service)\s+(?:for|about|that)\s+([^.!?]+)/gi,
];

// Compiled pattern collections for easy access
export const COMPILED_PATTERNS = {
  names: NAME_PATTERNS,
  phones: PHONE_PATTERNS,
  ages: AGE_PATTERNS,
  genders: GENDER_PATTERNS,
  goals: GOAL_PATTERNS,
} as const;

export const SINGLE_PATTERNS = {
  email: EMAIL_PATTERN,
} as const;

// Common words to exclude from name detection (to reduce false positives)
export const COMMON_WORDS = new Set([
  'about', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'did',
  'do', 'does', 'doing', 'don', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more',
  'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only',
  'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 's', 'same', 'she',
  'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which',
  'while', 'who', 'whom', 'why', 'will', 'with', 'would', 'you', 'your', 'yours', 'yourself',
  'yourselves', 'hello', 'hi', 'hey', 'thanks', 'thank', 'please', 'yes', 'yeah', 'ok', 'okay'
]);

/**
 * Validate if a detected name is likely to be a real name.
 * Filters out common words and single letters.
 */
export function isValidName(name: string): boolean {
  if (!name || name.trim().length < 2) {
    return false;
  }
  
  // Check if it's a common word
  if (COMMON_WORDS.has(name.toLowerCase().trim())) {
    return false;
  }
  
  // Check if it contains only letters and spaces
  if (!/^[A-Za-z\s]+$/.test(name)) {
    return false;
  }
  
  // Check if it's not all uppercase (likely acronym)
  if (name === name.toUpperCase() && name.length > 3) {
    return false;
  }
  
  return true;
}

/**
 * Normalize gender terms to standard values.
 */
export function normalizeGender(gender: string): string {
  const genderLower = gender.toLowerCase();
  
  if (['male', 'man', 'guy', 'boy', 'gentleman'].includes(genderLower)) {
    return 'male';
  } else if (['female', 'woman', 'girl', 'lady'].includes(genderLower)) {
    return 'female';
  }
  
  return genderLower;
}

/**
 * Clean and extract meaningful goal text from regex matches.
 */
export function extractGoalText(matchText: string): string {
  // Remove common prefixes and clean up
  let goal = matchText.trim();
  
  // Remove trailing punctuation
  goal = goal.replace(/[.!?]+$/, '');
  
  // Limit length to avoid overly long extractions
  if (goal.length > 100) {
    goal = goal.substring(0, 100) + '...';
  }
  
  return goal.trim();
}
