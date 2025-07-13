// Exercise Database - Comprehensive exercise data models and management
// Integrates with Free Exercise DB and ExerciseDB APIs for comprehensive exercise library

export type ExerciseCategory = 'strength' | 'cardio' | 'flexibility' | 'plyometric' | 'powerlifting' | 'olympic' | 'stretching';

export type EquipmentType = 
  | 'kettlebell' 
  | 'barbell' 
  | 'dumbbell' 
  | 'bodyweight' 
  | 'cable' 
  | 'resistance_band' 
  | 'medicine_ball' 
  | 'stability_ball' 
  | 'suspension_trainer' 
  | 'pull_up_bar' 
  | 'parallette' 
  | 'foam_roller' 
  | 'bosu_ball' 
  | 'none';

export type MuscleGroup = 
  | 'chest' 
  | 'back' 
  | 'shoulders' 
  | 'biceps' 
  | 'triceps' 
  | 'forearms' 
  | 'core' 
  | 'glutes' 
  | 'quadriceps' 
  | 'hamstrings' 
  | 'calves' 
  | 'full_body' 
  | 'cardio';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type ForceType = 'push' | 'pull' | 'static' | 'isometric';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  equipment: EquipmentType[];
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  difficulty: DifficultyLevel;
  force?: ForceType;
  mechanic?: 'compound' | 'isolation';
  
  // Visual and instructional content
  instructions: string[];
  formCues: string[];
  safetyTips: string[];
  commonMistakes: string[];
  variations: string[];
  
  // Media URLs
  gifUrl?: string;
  imageUrls: string[];
  
  // Metadata
  source: 'local' | 'free_exercise_db' | 'exercisedb_api';
  tags: string[];
  alternativeNames: string[];
  
  // Workout planning
  recommendedSets?: string;
  recommendedReps?: string;
  recommendedRest?: string;
  
  // Progressive overload suggestions
  beginnerModification?: string;
  advancedVariation?: string;
}

export interface ExerciseSet {
  exerciseId: string;
  weightPerBell?: number;
  numberOfBells?: 1 | 2;
  reps: number;
  duration?: number; // for time-based exercises
  distance?: number; // for cardio exercises
  restTime?: number;
  notes?: string;
  completed: boolean;
  timestamp: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'strength' | 'hypertrophy' | 'conditioning' | 'mobility' | 'mixed';
  difficulty: DifficultyLevel;
  estimatedDuration: number; // minutes
  equipment: EquipmentType[];
  exercises: WorkoutExercise[];
  tags: string[];
  isCustom: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: string; // e.g., "8-12", "5", "AMRAP"
  targetWeight?: string; // e.g., "50% 1RM", "bodyweight"
  restTime?: number; // seconds
  notes?: string;
  isSuperset?: boolean;
  supersetGroup?: string;
}

export interface ExerciseFilter {
  category?: ExerciseCategory[];
  equipment?: EquipmentType[];
  primaryMuscles?: MuscleGroup[];
  difficulty?: DifficultyLevel[];
  hasGif?: boolean;
  searchTerm?: string;
}

export interface ExerciseSearchResult {
  exercises: Exercise[];
  totalCount: number;
  categories: Record<ExerciseCategory, number>;
  equipment: Record<EquipmentType, number>;
  muscles: Record<MuscleGroup, number>;
}

// Default kettlebell exercises to maintain current functionality
export const defaultKettlebellExercises: Exercise[] = [
  {
    id: 'kb_front_squat_double',
    name: 'Double Kettlebell Front Squat',
    category: 'strength',
    equipment: ['kettlebell'],
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['core', 'back'],
    difficulty: 'intermediate',
    force: 'push',
    mechanic: 'compound',
    instructions: [
      'Hold two kettlebells in the front rack position',
      'Keep your elbows up and core tight',
      'Squat down by pushing your hips back and bending your knees',
      'Go down until your hip crease is below your knee line',
      'Drive through your heels to return to standing'
    ],
    formCues: [
      'Keep your chest up and proud',
      'Don\'t let your knees cave inward',
      'Maintain upright torso throughout the movement',
      'Breathe in on the way down, out on the way up'
    ],
    safetyTips: [
      'Start with lighter weights to master the form',
      'Ensure proper front rack position before adding weight',
      'Stop if you feel knee pain'
    ],
    commonMistakes: [
      'Allowing knees to collapse inward',
      'Leaning forward excessively',
      'Not reaching proper depth'
    ],
    variations: [
      'Single kettlebell goblet squat',
      'Kettlebell front squat with pause',
      'Kettlebell front squat to press'
    ],
    imageUrls: [],
    source: 'local',
    tags: ['legs', 'squat', 'compound', 'lower_body'],
    alternativeNames: ['Double KB Front Squat', 'Dual Kettlebell Front Squat'],
    recommendedSets: '3-4',
    recommendedReps: '6-10',
    recommendedRest: '90-120 seconds'
  },
  {
    id: 'kb_swing',
    name: 'Kettlebell Swing',
    category: 'strength',
    equipment: ['kettlebell'],
    primaryMuscles: ['glutes', 'hamstrings'],
    secondaryMuscles: ['core', 'shoulders', 'back'],
    difficulty: 'beginner',
    force: 'pull',
    mechanic: 'compound',
    instructions: [
      'Stand with feet slightly wider than shoulder-width',
      'Hold kettlebell with both hands between your legs',
      'Hinge at the hips, pushing your butt back',
      'Explosively drive your hips forward',
      'Let the kettlebell swing up to chest height'
    ],
    formCues: [
      'Power comes from your hips, not your arms',
      'Keep your back straight throughout',
      'Think "hike the football" on the way down',
      'Stand tall at the top of each rep'
    ],
    safetyTips: [
      'Start with a lighter weight to learn the hip hinge',
      'Keep the kettlebell close to your body',
      'Never let the kettlebell pull you forward'
    ],
    commonMistakes: [
      'Using arms to lift the weight',
      'Squatting instead of hinging at hips',
      'Overextending the back at the top'
    ],
    variations: [
      'American swing (overhead)',
      'Single-arm swing',
      'Alternating swing'
    ],
    imageUrls: [],
    source: 'local',
    tags: ['posterior_chain', 'explosive', 'cardio', 'conditioning'],
    alternativeNames: ['KB Swing', 'Two-Handed Swing'],
    recommendedSets: '3-5',
    recommendedReps: '15-25',
    recommendedRest: '60-90 seconds'
  },
  {
    id: 'kb_clean_press',
    name: 'Kettlebell Clean and Press',
    category: 'strength',
    equipment: ['kettlebell'],
    primaryMuscles: ['shoulders', 'core'],
    secondaryMuscles: ['back', 'glutes', 'triceps'],
    difficulty: 'advanced',
    force: 'push',
    mechanic: 'compound',
    instructions: [
      'Start with kettlebell on the ground between your feet',
      'Clean the kettlebell to the rack position in one fluid motion',
      'Press the kettlebell overhead',
      'Lower with control back to rack position',
      'Return to starting position'
    ],
    formCues: [
      'Keep the kettlebell close to your body during the clean',
      'Think "zip up your jacket" during the clean',
      'Press straight up, not forward',
      'Keep your core tight throughout'
    ],
    safetyTips: [
      'Master the clean and press separately before combining',
      'Start light and focus on technique',
      'Ensure proper wrist position in rack'
    ],
    commonMistakes: [
      'Allowing the kettlebell to crash on the wrist',
      'Pressing the kettlebell forward instead of up',
      'Using momentum instead of strength'
    ],
    variations: [
      'Single clean and press',
      'Clean and push press',
      'Clean and jerk'
    ],
    imageUrls: [],
    source: 'local',
    tags: ['full_body', 'explosive', 'overhead', 'complex'],
    alternativeNames: ['KB Clean and Press', 'Clean to Press'],
    recommendedSets: '3-4',
    recommendedReps: '5-8 each side',
    recommendedRest: '90-120 seconds'
  }
];

// Exercise database class for managing exercises
export class ExerciseDatabase {
  private exercises: Exercise[] = [...defaultKettlebellExercises];
  private isLoaded = false;

  async loadExercises(): Promise<void> {
    if (this.isLoaded) return;
    
    try {
      // Load from localStorage cache first
      const cached = localStorage.getItem('forge-exercise-database');
      if (cached) {
        const cachedData = JSON.parse(cached);
        if (this.isValidCache(cachedData)) {
          this.exercises = [...defaultKettlebellExercises, ...cachedData.exercises];
          this.isLoaded = true;
          return;
        }
      }
      
      // If no valid cache, will implement API loading in next step
      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load exercise database:', error);
      this.isLoaded = true;
    }
  }

  private isValidCache(data: any): boolean {
    return data && 
           data.exercises && 
           Array.isArray(data.exercises) && 
           data.timestamp && 
           Date.now() - data.timestamp < 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  searchExercises(filter: ExerciseFilter = {}): ExerciseSearchResult {
    let filtered = this.exercises;

    // Apply filters
    if (filter.category?.length) {
      filtered = filtered.filter(ex => filter.category!.includes(ex.category));
    }

    if (filter.equipment?.length) {
      filtered = filtered.filter(ex => 
        ex.equipment.some(eq => filter.equipment!.includes(eq))
      );
    }

    if (filter.primaryMuscles?.length) {
      filtered = filtered.filter(ex => 
        ex.primaryMuscles.some(muscle => filter.primaryMuscles!.includes(muscle))
      );
    }

    if (filter.difficulty?.length) {
      filtered = filtered.filter(ex => filter.difficulty!.includes(ex.difficulty));
    }

    if (filter.hasGif) {
      filtered = filtered.filter(ex => ex.gifUrl);
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(term) ||
        ex.alternativeNames.some(name => name.toLowerCase().includes(term)) ||
        ex.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Generate aggregated counts
    const categories: Record<ExerciseCategory, number> = {} as any;
    const equipment: Record<EquipmentType, number> = {} as any;
    const muscles: Record<MuscleGroup, number> = {} as any;

    this.exercises.forEach(ex => {
      categories[ex.category] = (categories[ex.category] || 0) + 1;
      ex.equipment.forEach(eq => {
        equipment[eq] = (equipment[eq] || 0) + 1;
      });
      ex.primaryMuscles.forEach(muscle => {
        muscles[muscle] = (muscles[muscle] || 0) + 1;
      });
    });

    return {
      exercises: filtered,
      totalCount: filtered.length,
      categories,
      equipment,
      muscles
    };
  }

  getExerciseById(id: string): Exercise | undefined {
    return this.exercises.find(ex => ex.id === id);
  }

  getExercisesByIds(ids: string[]): Exercise[] {
    return ids.map(id => this.getExerciseById(id)).filter(Boolean) as Exercise[];
  }

  addCustomExercise(exercise: Omit<Exercise, 'id' | 'source'>): Exercise {
    const newExercise: Exercise = {
      ...exercise,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source: 'local'
    };
    
    this.exercises.push(newExercise);
    this.saveToCache();
    return newExercise;
  }

  private saveToCache(): void {
    try {
      const customExercises = this.exercises.filter(ex => ex.source !== 'local' || !defaultKettlebellExercises.find(def => def.id === ex.id));
      localStorage.setItem('forge-exercise-database', JSON.stringify({
        exercises: customExercises,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save exercise database to cache:', error);
    }
  }
}

// Singleton instance
export const exerciseDatabase = new ExerciseDatabase();