import { ParsedSet } from "./parseSetInput";
import { convertWeight, type WeightUnit } from "./unitConversion";

export interface WorkoutSet {
  id: string;
  weightPerBell: number;
  numberOfBells: 1 | 2;
  reps: number;
  totalVolume: number;
  unit: WeightUnit;
  rawInput: string;
  timestamp: number;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
  totalVolume: number; // in kg for consistent storage
}

export interface CompletedWorkout {
  id: string;
  date: string; // ISO date string
  startTime: number;
  endTime: number;
  workoutName?: string;
  exercises: WorkoutExercise[];
  totalVolume: number; // in kg for consistent storage
  notes?: string;
}

const STORAGE_KEY = 'forge-workout-history';

/**
 * Convert ParsedSet to WorkoutSet
 */
export function parsedSetToWorkoutSet(parsedSet: ParsedSet): WorkoutSet {
  return {
    id: generateId(),
    weightPerBell: parsedSet.weightPerBell,
    numberOfBells: parsedSet.numberOfBells,
    reps: parsedSet.reps,
    totalVolume: parsedSet.totalVolume,
    unit: parsedSet.unit,
    rawInput: parsedSet.rawInput,
    timestamp: Date.now()
  };
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Calculate total volume for an exercise in kg
 */
function calculateExerciseVolume(sets: WorkoutSet[]): number {
  return sets.reduce((total, set) => {
    // Convert to kg for consistent storage
    const volumeInKg = set.unit === 'kg' 
      ? set.totalVolume 
      : convertWeight(set.totalVolume, 'lbs', 'kg');
    return total + volumeInKg;
  }, 0);
}

/**
 * Calculate total workout volume in kg
 */
function calculateWorkoutVolume(exercises: WorkoutExercise[]): number {
  return exercises.reduce((total, exercise) => total + exercise.totalVolume, 0);
}

/**
 * Save a completed workout to history
 */
export function saveCompletedWorkout(
  workoutName: string,
  exercises: WorkoutExercise[],
  startTime: number,
  endTime: number = Date.now(),
  notes?: string
): CompletedWorkout {
  // Calculate volumes in kg for consistent storage
  const processedExercises = exercises.map(exercise => ({
    ...exercise,
    totalVolume: calculateExerciseVolume(exercise.sets)
  }));

  const workout: CompletedWorkout = {
    id: generateId(),
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    startTime,
    endTime,
    workoutName,
    exercises: processedExercises,
    totalVolume: calculateWorkoutVolume(processedExercises),
    notes
  };

  // Get existing history
  const history = getWorkoutHistory();
  
  // Add new workout
  history.push(workout);
  
  // Sort by date (newest first)
  history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  
  return workout;
}

/**
 * Get all workout history
 */
export function getWorkoutHistory(): CompletedWorkout[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading workout history:', error);
    return [];
  }
}

/**
 * Get workouts for a specific date
 */
export function getWorkoutsForDate(date: string): CompletedWorkout[] {
  const history = getWorkoutHistory();
  return history.filter(workout => workout.date === date);
}

/**
 * Get workouts in a date range
 */
export function getWorkoutsInRange(startDate: string, endDate: string): CompletedWorkout[] {
  const history = getWorkoutHistory();
  return history.filter(workout => 
    workout.date >= startDate && workout.date <= endDate
  );
}

/**
 * Delete a workout by ID
 */
export function deleteWorkout(workoutId: string): boolean {
  const history = getWorkoutHistory();
  const index = history.findIndex(workout => workout.id === workoutId);
  
  if (index === -1) return false;
  
  history.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return true;
}

/**
 * Get workout statistics
 */
export interface WorkoutStats {
  totalWorkouts: number;
  totalVolumeKg: number;
  totalVolumeLbs: number;
  averageVolumePerWorkout: number;
  topExercises: Array<{ name: string; volume: number; count: number }>;
  lastWorkoutDate?: string;
  currentStreak: number;
}

export function getWorkoutStats(): WorkoutStats {
  const history = getWorkoutHistory();
  
  if (history.length === 0) {
    return {
      totalWorkouts: 0,
      totalVolumeKg: 0,
      totalVolumeLbs: 0,
      averageVolumePerWorkout: 0,
      topExercises: [],
      currentStreak: 0
    };
  }

  const totalVolumeKg = history.reduce((sum, workout) => sum + workout.totalVolume, 0);
  const totalVolumeLbs = convertWeight(totalVolumeKg, 'kg', 'lbs');

  // Calculate exercise stats
  const exerciseStats = new Map<string, { volume: number; count: number }>();
  
  history.forEach(workout => {
    workout.exercises.forEach(exercise => {
      const existing = exerciseStats.get(exercise.name) || { volume: 0, count: 0 };
      exerciseStats.set(exercise.name, {
        volume: existing.volume + exercise.totalVolume,
        count: existing.count + exercise.sets.length
      });
    });
  });

  const topExercises = Array.from(exerciseStats.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  // Calculate current streak (consecutive workout days)
  let currentStreak = 0;
  const sortedDates = [...new Set(history.map(w => w.date))].sort().reverse();
  
  if (sortedDates.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    let checkDate = today;
    
    for (const workoutDate of sortedDates) {
      if (workoutDate === checkDate) {
        currentStreak++;
        // Move to previous day
        const date = new Date(checkDate);
        date.setDate(date.getDate() - 1);
        checkDate = date.toISOString().split('T')[0];
      } else {
        break;
      }
    }
  }

  return {
    totalWorkouts: history.length,
    totalVolumeKg,
    totalVolumeLbs,
    averageVolumePerWorkout: totalVolumeKg / history.length,
    topExercises,
    lastWorkoutDate: history[0]?.date,
    currentStreak
  };
}

/**
 * Get volume trend data for charts
 */
export function getVolumeTrend(days: number = 30): Array<{ date: string; volume: number }> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const history = getWorkoutsInRange(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  );

  // Group by date and sum volume
  const volumeByDate = new Map<string, number>();
  
  history.forEach(workout => {
    const existing = volumeByDate.get(workout.date) || 0;
    volumeByDate.set(workout.date, existing + workout.totalVolume);
  });

  // Create array with all dates (including zeros)
  const trend: Array<{ date: string; volume: number }> = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    trend.push({
      date: dateStr,
      volume: volumeByDate.get(dateStr) || 0
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return trend;
}

/**
 * Export workout history as JSON
 */
export function exportWorkoutHistory(): string {
  const history = getWorkoutHistory();
  return JSON.stringify(history, null, 2);
}

/**
 * Import workout history from JSON
 */
export function importWorkoutHistory(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    if (Array.isArray(data)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error importing workout history:', error);
    return false;
  }
}