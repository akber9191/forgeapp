export interface ParsedSet {
  weightPerBell: number;
  numberOfBells: 1 | 2;
  reps: number;
  totalVolume: number;
  rawInput: string;
  unit: 'kg' | 'lbs';
  isValid: boolean;
  error?: string;
}

export interface ParseOptions {
  defaultUnit?: 'kg' | 'lbs';
  defaultBells?: 1 | 2;
}

/**
 * Parse natural language set input into structured data
 * Examples:
 * - "40 5" → 40kg × 2 bells × 5 reps
 * - "double 40s x5" → 40kg × 2 bells × 5 reps  
 * - "single 53 x10" → 53kg × 1 bell × 10 reps
 * - "88 lbs x3" → 88lbs × 2 bells × 3 reps
 * - "2x40 5 reps" → 40kg × 2 bells × 5 reps
 */
export function parseSetInput(input: string, options: ParseOptions = {}): ParsedSet {
  const { defaultUnit = 'kg', defaultBells = 2 } = options;
  
  const rawInput = input.trim();
  
  if (!rawInput) {
    return {
      weightPerBell: 0,
      numberOfBells: defaultBells,
      reps: 0,
      totalVolume: 0,
      rawInput,
      unit: defaultUnit,
      isValid: false,
      error: 'Please enter a set (e.g., "40 5" or "double 35kg x8")'
    };
  }

  try {
    // Normalize input - lowercase and clean up
    let normalized = rawInput.toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[×x]/g, 'x')
      .trim();

    // Extract unit if present
    let unit: 'kg' | 'lbs' = defaultUnit;
    if (normalized.includes('kg')) {
      unit = 'kg';
      normalized = normalized.replace(/kg/g, '').trim();
    } else if (normalized.includes('lb') || normalized.includes('lbs')) {
      unit = 'lbs';
      normalized = normalized.replace(/lbs?/g, '').trim();
    }

    // Extract number of bells
    let numberOfBells: 1 | 2 = defaultBells;
    
    // Check for explicit bell count indicators
    if (normalized.includes('single') || normalized.includes('1x')) {
      numberOfBells = 1;
      normalized = normalized.replace(/single|1x/g, '').trim();
    } else if (normalized.includes('double') || normalized.includes('2x')) {
      numberOfBells = 2;
      normalized = normalized.replace(/double|2x/g, '').trim();
    }

    // Remove common words
    normalized = normalized
      .replace(/\b(reps?|rep|x|for|times)\b/g, ' ')
      .replace(/\bs\b/g, ' ') // Remove 's' from "40s"
      .replace(/\s+/g, ' ')
      .trim();

    // Extract numbers
    const numbers = normalized.match(/\d+(?:\.\d+)?/g);
    
    if (!numbers || numbers.length === 0) {
      return {
        weightPerBell: 0,
        numberOfBells,
        reps: 0,
        totalVolume: 0,
        rawInput,
        unit,
        isValid: false,
        error: 'No numbers found. Try "40 5" or "35kg x8"'
      };
    }

    let weight: number;
    let reps: number;

    if (numbers.length === 1) {
      // Only one number - assume it's weight, prompt for reps
      weight = parseFloat(numbers[0]);
      return {
        weightPerBell: weight,
        numberOfBells,
        reps: 0,
        totalVolume: 0,
        rawInput,
        unit,
        isValid: false,
        error: 'Please add reps (e.g., "40 5" for 5 reps)'
      };
    } else if (numbers.length >= 2) {
      // Two or more numbers - first is weight, last is reps
      weight = parseFloat(numbers[0]);
      reps = parseFloat(numbers[numbers.length - 1]);
    } else {
      throw new Error('Invalid format');
    }

    // Validation
    if (weight <= 0) {
      return {
        weightPerBell: weight,
        numberOfBells,
        reps,
        totalVolume: 0,
        rawInput,
        unit,
        isValid: false,
        error: 'Weight must be greater than 0'
      };
    }

    if (reps <= 0 || reps > 100) {
      return {
        weightPerBell: weight,
        numberOfBells,
        reps,
        totalVolume: 0,
        rawInput,
        unit,
        isValid: false,
        error: 'Reps must be between 1 and 100'
      };
    }

    if (weight > 200 && unit === 'kg') {
      return {
        weightPerBell: weight,
        numberOfBells,
        reps,
        totalVolume: 0,
        rawInput,
        unit,
        isValid: false,
        error: 'Weight seems high for kg. Did you mean lbs?'
      };
    }

    if (weight > 500 && unit === 'lbs') {
      return {
        weightPerBell: weight,
        numberOfBells,
        reps,
        totalVolume: 0,
        rawInput,
        unit,
        isValid: false,
        error: 'Weight seems very high. Please check your input.'
      };
    }

    // Calculate total volume
    const totalVolume = weight * numberOfBells * reps;

    return {
      weightPerBell: weight,
      numberOfBells,
      reps,
      totalVolume,
      rawInput,
      unit,
      isValid: true
    };

  } catch (error) {
    return {
      weightPerBell: 0,
      numberOfBells: defaultBells,
      reps: 0,
      totalVolume: 0,
      rawInput,
      unit: defaultUnit,
      isValid: false,
      error: 'Invalid format. Try "40 5", "double 35kg x8", or "single 53 x10"'
    };
  }
}

/**
 * Format a parsed set for display
 */
export function formatParsedSet(set: ParsedSet): string {
  if (!set.isValid) {
    return set.error || 'Invalid set';
  }

  const bellText = set.numberOfBells === 1 ? 'single' : 'double';
  return `${bellText} ${set.weightPerBell}${set.unit} × ${set.reps} reps = ${set.totalVolume}${set.unit} total`;
}

/**
 * Get examples for the current unit
 */
export function getInputExamples(unit: 'kg' | 'lbs'): string[] {
  if (unit === 'kg') {
    return [
      '40 5',
      'double 35kg x8', 
      'single 53 x10',
      '2x24 12 reps'
    ];
  } else {
    return [
      '88 5',
      'double 70lbs x8',
      'single 120 x6', 
      '2x53 12 reps'
    ];
  }
}