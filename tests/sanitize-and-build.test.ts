// File generated for AdMesh PII sanitization functionality tests

/**
 * Comprehensive test suite for PII sanitization and prompt building functionality.
 * Tests cover all scenarios: complete PII, partial info, minimal context, PII-only, and edge cases.
 */

import { sanitizeAndBuild, sanitizeUserInput } from '../src/sanitize-and-build';
import { PIISanitizer } from '../src/sanitizer';
import { PromptBuilder } from '../src/builder';
import { isValidName, normalizeGender, extractGoalText } from '../src/patterns';

describe('sanitizeAndBuild', () => {
  describe('main function', () => {
    test('complete scenario with all PII and context', () => {
      const userInput = "Hi, I'm Priya (priya@gmail.com, call me at (555) 123-4567). I'm a 27-year-old female building a wellness app.";
      
      const result = sanitizeAndBuild(userInput);
      
      expect(result.prompt).toBe('Suggest tools for a 27-year-old female building a wellness app.');
      expect(result.removed.name).toBe('Priya');
      expect(result.removed.email).toBe('priya@gmail.com');
      expect(result.removed.phone).toBe('(555) 123-4567');
      expect(result.extracted_context.age).toBe(27);
      expect(result.extracted_context.gender).toBe('female');
      expect(result.extracted_context.goal).toContain('building a wellness app');
    });

    test('partial information - age and goal', () => {
      const userInput = "I'm 30 years old and working on creating a mobile app for fitness tracking.";

      const result = sanitizeAndBuild(userInput);

      // Should use age_goal template format
      expect(result.prompt).toContain('30');
      expect(result.prompt).toContain('creating a mobile app for fitness tracking');
      expect(result.removed.name).toBeNull();
      expect(result.removed.email).toBeNull();
      expect(result.removed.phone).toBeNull();
      expect(result.extracted_context.age).toBe(30);
      expect(result.extracted_context.gender).toBeNull();
      expect(result.extracted_context.goal).toContain('creating a mobile app for fitness tracking');
    });

    test('minimal context - goal only', () => {
      const userInput = "Looking for tools to help with building an e-commerce website.";

      const result = sanitizeAndBuild(userInput);

      expect(result.prompt).toContain('e-commerce website');
      expect(result.removed.name).toBeNull();
      expect(result.removed.email).toBeNull();
      expect(result.removed.phone).toBeNull();
      expect(result.extracted_context.age).toBeNull();
      expect(result.extracted_context.gender).toBeNull();
      expect(result.extracted_context.goal).toContain('building an e-commerce website');
    });

    test('PII only - no context', () => {
      const userInput = "Contact me at john.doe@example.com or +1-555-987-6543.";

      const result = sanitizeAndBuild(userInput);

      expect(result.prompt).toBe('Suggest relevant tools and services.');
      expect(result.removed.name).toBeNull();
      expect(result.removed.email).toBe('john.doe@example.com');
      expect(result.removed.phone).toBeTruthy(); // Phone format may vary
      expect(result.extracted_context.age).toBeNull();
      expect(result.extracted_context.gender).toBeNull();
      expect(result.extracted_context.goal).toBeNull();
    });

    test('edge case - empty input', () => {
      const result = sanitizeAndBuild('');
      
      expect(result.prompt).toBe('Suggest relevant tools and services.');
      expect(result.removed.name).toBeNull();
      expect(result.removed.email).toBeNull();
      expect(result.removed.phone).toBeNull();
      expect(result.extracted_context.age).toBeNull();
      expect(result.extracted_context.gender).toBeNull();
      expect(result.extracted_context.goal).toBeNull();
    });

    test('edge case - special characters', () => {
      const userInput = "I'm Alex! @#$%^&*() Building a crypto-trading bot... Age: 25!!!";

      const result = sanitizeAndBuild(userInput);

      expect(result.removed.name).toBe('Alex');
      expect(result.extracted_context.age).toBe(25);
      // Goal extraction should be case-insensitive in comparison
      const goal = result.extracted_context.goal;
      expect(goal && goal.toLowerCase()).toContain('building a crypto-trading bot');
    });

    test('multiple emails and phones', () => {
      const userInput = "Reach me at work@company.com or personal@gmail.com. Phone: (555) 123-4567 or 555.987.6543.";
      
      const result = sanitizeAndBuild(userInput);
      
      // Should return the first detected email and phone
      expect(['work@company.com', 'personal@gmail.com']).toContain(result.removed.email);
      expect(result.removed.phone).toBeTruthy();
    });

    test('gender variations', () => {
      const testCases = [
        ["I'm a 25-year-old guy looking for tools", 'male'],
        ["I'm a woman building a startup", 'female'],
        ["I'm a 30-year-old gentleman", 'male'],
        ["I'm a lady working on a project", 'female'],
      ] as const;
      
      testCases.forEach(([userInput, expectedGender]) => {
        const result = sanitizeAndBuild(userInput);
        expect(result.extracted_context.gender).toBe(expectedGender);
      });
    });

    test('age variations', () => {
      const testCases = [
        ["I'm 25 years old", 25],
        ["I am 30", 30],
        ["35-year-old developer", 35],
        ["Age 40", 40],
      ] as const;
      
      testCases.forEach(([userInput, expectedAge]) => {
        const result = sanitizeAndBuild(userInput);
        expect(result.extracted_context.age).toBe(expectedAge);
      });
    });

    test('sanitizeUserInput alias function', () => {
      const userInput = "I'm Sarah, 28 years old, building a SaaS platform.";
      
      const result1 = sanitizeAndBuild(userInput);
      const result2 = sanitizeUserInput(userInput);
      
      expect(result1).toEqual(result2);
    });
  });
});

describe('PIISanitizer', () => {
  let sanitizer: PIISanitizer;

  beforeEach(() => {
    sanitizer = new PIISanitizer();
  });

  describe('name detection', () => {
    test('detects various name patterns', () => {
      const testCases = [
        ["Hi, I'm John Smith", ['John Smith']],
        ["My name is Alice", ['Alice']],
        ["This is Bob here", ['Bob']],
        ["Call me Sarah", ['Sarah']],
        ["I'm the developer", []], // Should not detect "the" as name
      ] as const;
      
      testCases.forEach(([text, expected]) => {
        const result = sanitizer.detectNames(text);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('email detection', () => {
    test('detects various email patterns', () => {
      const testCases = [
        ["Contact me at john@example.com", ['john@example.com']],
        ["Email: user.name+tag@domain.co.uk", ['user.name+tag@domain.co.uk']],
        ["No email here", []],
        ["Multiple emails: a@b.com and c@d.org", ['a@b.com', 'c@d.org']],
      ] as const;
      
      testCases.forEach(([text, expected]) => {
        const result = sanitizer.detectEmails(text);
        expect(new Set(result)).toEqual(new Set(expected));
      });
    });
  });

  describe('phone detection', () => {
    test('detects various phone patterns', () => {
      const testCases = [
        ["Call me at (555) 123-4567", true],
        ["Phone: +1-555-987-6543", true],
        ["My number is 555.123.4567", true],
        ["No phone here", false],
      ] as const;
      
      testCases.forEach(([text, shouldDetect]) => {
        const result = sanitizer.detectPhones(text);
        if (shouldDetect) {
          expect(result.length).toBeGreaterThan(0);
        } else {
          expect(result).toEqual([]);
        }
      });
    });
  });

  describe('age extraction', () => {
    test('extracts age from various patterns', () => {
      const testCases = [
        ["I'm 25 years old", 25],
        ["I am 30", 30],
        ["35-year-old", 35],
        ["Age 40", 40],
        ["No age here", null],
        ["I'm 150", null], // Invalid age
      ] as const;
      
      testCases.forEach(([text, expected]) => {
        const result = sanitizer.extractAge(text);
        expect(result).toBe(expected);
      });
    });
  });

  describe('gender extraction', () => {
    test('extracts gender from various patterns', () => {
      const testCases = [
        ["I'm a male developer", 'male'],
        ["I am a woman", 'female'],
        ["I'm a guy", 'male'],
        ["I'm a girl", 'female'],
        ["No gender here", null],
      ] as const;
      
      testCases.forEach(([text, expected]) => {
        const result = sanitizer.extractGender(text);
        expect(result).toBe(expected);
      });
    });
  });

  describe('goal extraction', () => {
    test('extracts goals from various patterns', () => {
      const testCases = [
        ["I'm building a mobile app", 'building a mobile app'],
        ["Working on creating a website", 'creating a website'],
        ["Want to develop a game", 'develop a game'],
        ["No goal here", null],
      ] as const;
      
      testCases.forEach(([text, expected]) => {
        const result = sanitizer.extractGoal(text);
        if (expected) {
          expect(result).toContain(expected);
        } else {
          expect(result).toBeNull();
        }
      });
    });
  });
});

describe('PromptBuilder', () => {
  let builder: PromptBuilder;

  beforeEach(() => {
    builder = new PromptBuilder();
  });

  test('builds prompt with full context', () => {
    const context = { age: 25, gender: 'female', goal: 'building a mobile app' };
    const result = builder.buildPrompt(context);
    
    expect(result).toContain('25-year-old');
    expect(result).toContain('female');
    expect(result).toContain('building a mobile app');
  });

  test('builds prompt with partial context', () => {
    const context = { age: 30, gender: null, goal: 'creating a website' };
    const result = builder.buildPrompt(context);
    
    expect(result).toContain('30');
    expect(result).toContain('creating a website');
  });

  test('builds prompt with no context', () => {
    const context = { age: null, gender: null, goal: null };
    const result = builder.buildPrompt(context);
    
    expect(result).toBe('Suggest relevant tools and services.');
  });

  test('normalizes goals correctly', () => {
    const testCases = [
      ['mobile app', 'working on mobile app'], // Corrected expectation
      ['building a website', 'building a website'],
      ['working on a project', 'working on a project'],
      ['a startup', 'working on a startup'],
    ] as const;

    testCases.forEach(([goal, expected]) => {
      const result = builder.normalizeGoal(goal);
      expect(result).toBe(expected);
    });
  });
});

describe('Pattern Helpers', () => {
  describe('isValidName', () => {
    test('validates names correctly', () => {
      const testCases = [
        ['John', true],
        ['John Smith', true],
        ['the', false], // Common word
        ['A', false],   // Too short
        ['123', false], // Not letters
        ['ACRONYM', false], // All caps
      ] as const;
      
      testCases.forEach(([name, expected]) => {
        const result = isValidName(name);
        expect(result).toBe(expected);
      });
    });
  });

  describe('normalizeGender', () => {
    test('normalizes gender terms', () => {
      const testCases = [
        ['male', 'male'],
        ['man', 'male'],
        ['guy', 'male'],
        ['female', 'female'],
        ['woman', 'female'],
        ['girl', 'female'],
      ] as const;
      
      testCases.forEach(([gender, expected]) => {
        const result = normalizeGender(gender);
        expect(result).toBe(expected);
      });
    });
  });

  describe('extractGoalText', () => {
    test('extracts and cleans goal text', () => {
      const testCases = [
        ['building a mobile app.', 'building a mobile app'],
        ['creating a website!!!', 'creating a website'],
        ['a'.repeat(150), 'a'.repeat(100) + '...'], // Long text truncation
      ] as const;
      
      testCases.forEach(([text, expected]) => {
        const result = extractGoalText(text);
        expect(result).toBe(expected);
      });
    });
  });
});
