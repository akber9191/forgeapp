export type WeightUnit = 'kg' | 'lbs';

// Conversion factor: 1 kg = 2.20462 lbs
const KG_TO_LBS = 2.20462;
const LBS_TO_KG = 1 / KG_TO_LBS;

/**
 * Convert weight between kg and lbs
 */
export function convertWeight(weight: number, fromUnit: WeightUnit, toUnit: WeightUnit): number {
  if (fromUnit === toUnit) return weight;
  
  if (fromUnit === 'kg' && toUnit === 'lbs') {
    return weight * KG_TO_LBS;
  } else if (fromUnit === 'lbs' && toUnit === 'kg') {
    return weight * LBS_TO_KG;
  }
  
  return weight;
}

/**
 * Format weight with unit and appropriate decimal places
 */
export function formatWeight(weight: number, unit: WeightUnit, decimals: number = 1): string {
  const rounded = Math.round(weight * Math.pow(10, decimals)) / Math.pow(10, decimals);
  
  // Show whole numbers when possible
  if (rounded % 1 === 0) {
    return `${rounded}${unit}`;
  }
  
  return `${rounded.toFixed(decimals)}${unit}`;
}

/**
 * Convert weight and format in one step
 */
export function convertAndFormatWeight(
  weight: number, 
  fromUnit: WeightUnit, 
  toUnit: WeightUnit, 
  decimals: number = 1
): string {
  const converted = convertWeight(weight, fromUnit, toUnit);
  return formatWeight(converted, toUnit, decimals);
}

/**
 * Get user's preferred unit from localStorage
 */
export function getUserPreferredUnit(): WeightUnit {
  const stored = localStorage.getItem('forge-preferred-unit');
  return (stored === 'kg' || stored === 'lbs') ? stored : 'kg';
}

/**
 * Set user's preferred unit in localStorage
 */
export function setUserPreferredUnit(unit: WeightUnit): void {
  localStorage.setItem('forge-preferred-unit', unit);
}

/**
 * Toggle between kg and lbs, saving to localStorage
 */
export function toggleUnit(): WeightUnit {
  const current = getUserPreferredUnit();
  const newUnit = current === 'kg' ? 'lbs' : 'kg';
  setUserPreferredUnit(newUnit);
  return newUnit;
}

/**
 * Convert a weight value to user's preferred unit
 */
export function toUserUnit(weight: number, currentUnit: WeightUnit): {
  weight: number;
  unit: WeightUnit;
} {
  const userUnit = getUserPreferredUnit();
  return {
    weight: convertWeight(weight, currentUnit, userUnit),
    unit: userUnit
  };
}

/**
 * Convert from user's preferred unit to a target unit
 */
export function fromUserUnit(weight: number, targetUnit: WeightUnit): number {
  const userUnit = getUserPreferredUnit();
  return convertWeight(weight, userUnit, targetUnit);
}

/**
 * Get common weight suggestions for the given unit
 */
export function getCommonWeights(unit: WeightUnit): number[] {
  if (unit === 'kg') {
    return [12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 53];
  } else {
    return [26, 35, 44, 53, 62, 70, 79, 88, 97, 106, 120];
  }
}

/**
 * Format volume with appropriate unit label
 */
export function formatVolume(volume: number, unit: WeightUnit): string {
  if (volume >= 1000) {
    const thousands = volume / 1000;
    if (thousands % 1 === 0) {
      return `${thousands}k ${unit}`;
    } else {
      return `${thousands.toFixed(1)}k ${unit}`;
    }
  }
  
  return `${Math.round(volume)} ${unit}`;
}

/**
 * Round weight to common kettlebell weights
 */
export function roundToCommonWeight(weight: number, unit: WeightUnit): number {
  const commonWeights = getCommonWeights(unit);
  
  // Find the closest common weight
  let closest = commonWeights[0];
  let minDiff = Math.abs(weight - closest);
  
  for (const commonWeight of commonWeights) {
    const diff = Math.abs(weight - commonWeight);
    if (diff < minDiff) {
      minDiff = diff;
      closest = commonWeight;
    }
  }
  
  return closest;
}