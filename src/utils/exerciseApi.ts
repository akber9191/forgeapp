// Exercise API Integration Layer
// Handles data fetching from Free Exercise DB and other exercise APIs

import { Exercise, ExerciseCategory, EquipmentType, MuscleGroup, DifficultyLevel } from '@/data/exerciseDatabase';
import { exerciseGifDatabase, type ExerciseWithGif } from '@/data/exerciseGifs';

// Free Exercise DB API types
interface FreeExerciseDBExercise {
  id: string;
  name: string;
  aliases?: string[];
  primary_muscles: string[];
  secondary_muscles: string[];
  force?: string;
  level: string;
  mechanic?: string;
  equipment?: string;
  category: string;
  instructions: string[];
  description?: string;
  tips?: string[];
  images?: string[];
}

// ExerciseDB API types (for future integration)
interface ExerciseDBExercise {
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  id: string;
  name: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
}

export class ExerciseAPIService {
  private readonly FREE_EXERCISE_DB_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
  private readonly EXERCISE_DB_BASE_URL = 'https://exercisedb.p.rapidapi.com/exercises';
  
  // ExerciseDB requires API key - using free public endpoints when possible
  private readonly EXERCISE_DB_PUBLIC_URL = 'https://exercisedb.p.rapidapi.com/exercises';
  
  private exerciseCache: Map<string, Exercise[]> = new Map();
  private exerciseDBCache: Map<string, ExerciseDBExercise[]> = new Map();
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Fetch exercises from Free Exercise DB
   */
  async fetchFromFreeExerciseDB(): Promise<Exercise[]> {
    try {
      console.log('Fetching exercises from Free Exercise DB...');
      const response = await fetch(this.FREE_EXERCISE_DB_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const exercises: FreeExerciseDBExercise[] = await response.json();
      console.log(`Fetched ${exercises.length} exercises from Free Exercise DB`);
      
      return exercises.map(ex => this.transformFreeExerciseDB(ex)).filter(Boolean) as Exercise[];
    } catch (error) {
      console.error('Failed to fetch from Free Exercise DB:', error);
      return [];
    }
  }

  /**
   * Transform Free Exercise DB format to our Exercise interface
   */
  private transformFreeExerciseDB = (exercise: FreeExerciseDBExercise): Exercise | null => {
    try {
      // Validate required fields
      if (!exercise || !exercise.id || !exercise.name) {
        console.warn('Invalid exercise data:', exercise);
        return null;
      }

      return {
        id: `free_${exercise.id}`,
        name: this.cleanExerciseName(exercise.name),
        category: this.mapCategory(exercise.category || 'strength'),
        equipment: [this.mapEquipment(exercise.equipment)],
        primaryMuscles: (exercise.primary_muscles && Array.isArray(exercise.primary_muscles) ? exercise.primary_muscles : []).map(muscle => this.mapMuscleGroup(muscle)).filter(Boolean) as MuscleGroup[],
        secondaryMuscles: (exercise.secondary_muscles && Array.isArray(exercise.secondary_muscles) ? exercise.secondary_muscles : []).map(muscle => this.mapMuscleGroup(muscle)).filter(Boolean) as MuscleGroup[],
        difficulty: this.mapDifficulty(exercise.level || 'intermediate'),
        force: exercise.force as any,
        mechanic: exercise.mechanic as 'compound' | 'isolation',
        instructions: exercise.instructions || [],
        formCues: exercise.tips || [],
        safetyTips: [],
        commonMistakes: [],
        variations: [],
        gifUrl: this.selectBestImage(exercise),
        imageUrls: exercise.images || [],
        source: 'free_exercise_db' as const,
        tags: this.generateTags(exercise),
        alternativeNames: exercise.aliases || [],
        recommendedSets: this.getDefaultSets(exercise.category || 'strength'),
        recommendedReps: this.getDefaultReps(exercise.category || 'strength'),
        recommendedRest: this.getDefaultRest(exercise.category || 'strength')
      };
    } catch (error) {
      console.error('Failed to transform exercise:', exercise?.name || 'Unknown', error);
      return null;
    }
  }

  /**
   * Map Free Exercise DB categories to our categories
   */
  private mapCategory(category: string): ExerciseCategory {
    const categoryMap: Record<string, ExerciseCategory> = {
      'strength': 'strength',
      'stretching': 'stretching',
      'plyometrics': 'plyometric',
      'strongman': 'strength',
      'powerlifting': 'powerlifting',
      'cardio': 'cardio',
      'olympic_weightlifting': 'olympic'
    };
    
    return categoryMap[category.toLowerCase()] || 'strength';
  }

  /**
   * Map equipment names to our EquipmentType
   */
  private mapEquipment(equipment?: string): EquipmentType {
    if (!equipment) return 'bodyweight';
    
    const equipmentMap: Record<string, EquipmentType> = {
      'barbell': 'barbell',
      'dumbbell': 'dumbbell',
      'kettlebells': 'kettlebell',
      'kettlebell': 'kettlebell',
      'body_only': 'bodyweight',
      'body only': 'bodyweight',
      'cable': 'cable',
      'bands': 'resistance_band',
      'medicine_ball': 'medicine_ball',
      'exercise_ball': 'stability_ball',
      'foam_roll': 'foam_roller',
      'none': 'bodyweight'
    };
    
    const normalized = equipment.toLowerCase().replace(/[\s_-]/g, '_');
    return equipmentMap[normalized] || 'bodyweight';
  }

  /**
   * Map muscle group names to our MuscleGroup enum
   */
  private mapMuscleGroup(muscle: string): MuscleGroup | null {
    const muscleMap: Record<string, MuscleGroup> = {
      'chest': 'chest',
      'back': 'back',
      'shoulders': 'shoulders',
      'biceps': 'biceps',
      'triceps': 'triceps',
      'forearms': 'forearms',
      'abdominals': 'core',
      'core': 'core',
      'glutes': 'glutes',
      'quadriceps': 'quadriceps',
      'hamstrings': 'hamstrings',
      'calves': 'calves',
      'lower_back': 'back',
      'middle_back': 'back',
      'lats': 'back',
      'traps': 'back'
    };
    
    const normalized = muscle.toLowerCase().replace(/[\s_-]/g, '_');
    return muscleMap[normalized] || null;
  }

  /**
   * Map difficulty levels
   */
  private mapDifficulty(level: string): DifficultyLevel {
    const difficultyMap: Record<string, DifficultyLevel> = {
      'beginner': 'beginner',
      'intermediate': 'intermediate',
      'expert': 'advanced'
    };
    
    return difficultyMap[level.toLowerCase()] || 'intermediate';
  }

  /**
   * Generate relevant tags for an exercise
   */
  private generateTags(exercise: FreeExerciseDBExercise): string[] {
    const tags: string[] = [];
    
    // Add category as tag
    if (exercise.category) {
      tags.push(exercise.category.toLowerCase());
    }
    
    // Add equipment as tag
    if (exercise.equipment) {
      tags.push(exercise.equipment.toLowerCase().replace(/[\s_]/g, '_'));
    }
    
    // Add muscle groups as tags
    if (exercise.primary_muscles && Array.isArray(exercise.primary_muscles)) {
      exercise.primary_muscles.forEach(muscle => {
        if (muscle) {
          tags.push(muscle.toLowerCase().replace(/[\s_]/g, '_'));
        }
      });
    }
    
    // Add force type as tag
    if (exercise.force) {
      tags.push(exercise.force.toLowerCase());
    }
    
    // Add mechanic as tag
    if (exercise.mechanic) {
      tags.push(exercise.mechanic.toLowerCase());
    }
    
    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Select the best image URL for an exercise from Free Exercise DB
   */
  private selectBestImage(exercise: FreeExerciseDBExercise): string | undefined {
    if (!exercise.images || exercise.images.length === 0) {
      return undefined;
    }

    // Prefer GIFs over static images
    const gifs = exercise.images.filter(img => img.toLowerCase().includes('.gif'));
    if (gifs.length > 0) {
      return gifs[0];
    }

    // Fallback to first available image
    return exercise.images[0];
  }

  /**
   * Clean exercise names for better display
   */
  private cleanExerciseName(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .replace(/\b(And|Or|Of|The|A|An)\b/g, word => word.toLowerCase())
      .replace(/^(And|Or|Of|The|A|An)\b/, word => word.charAt(0).toUpperCase() + word.slice(1));
  }

  /**
   * Get default sets based on exercise category
   */
  private getDefaultSets(category: string): string {
    const setMap: Record<string, string> = {
      'strength': '3-4',
      'powerlifting': '3-5',
      'olympic_weightlifting': '3-5',
      'cardio': '1-3',
      'stretching': '1-3',
      'plyometrics': '3-4'
    };
    
    return setMap[category.toLowerCase()] || '3';
  }

  /**
   * Get default reps based on exercise category
   */
  private getDefaultReps(category: string): string {
    const repMap: Record<string, string> = {
      'strength': '8-12',
      'powerlifting': '1-5',
      'olympic_weightlifting': '3-6',
      'cardio': '30-60s',
      'stretching': '30-60s',
      'plyometrics': '8-15'
    };
    
    return repMap[category.toLowerCase()] || '8-12';
  }

  /**
   * Get default rest time based on exercise category
   */
  private getDefaultRest(category: string): string {
    const restMap: Record<string, string> = {
      'strength': '60-90s',
      'powerlifting': '120-180s',
      'olympic_weightlifting': '120-180s',
      'cardio': '30-60s',
      'stretching': '15-30s',
      'plyometrics': '60-90s'
    };
    
    return restMap[category.toLowerCase()] || '60-90s';
  }

  /**
   * Load curated exercise database with GIFs
   */
  async loadCuratedExercises(): Promise<Exercise[]> {
    try {
      console.log('Loading curated exercise database with GIFs...');
      
      const curatedExercises = exerciseGifDatabase.map(ex => this.transformCuratedExercise(ex));
      console.log(`Loaded ${curatedExercises.length} curated exercises with GIFs`);
      
      return curatedExercises;
    } catch (error) {
      console.error('Failed to load curated exercises:', error);
      return [];
    }
  }

  /**
   * Transform curated exercise format to our Exercise interface
   */
  private transformCuratedExercise(exercise: ExerciseWithGif): Exercise {
    return {
      id: exercise.id,
      name: exercise.name,
      category: this.mapStringToCategory(exercise.category),
      equipment: [this.mapEquipment(exercise.equipment)],
      primaryMuscles: [this.mapMuscleGroup(exercise.target)].filter(Boolean) as MuscleGroup[],
      secondaryMuscles: exercise.secondaryMuscles.map(this.mapMuscleGroup).filter(Boolean) as MuscleGroup[],
      difficulty: exercise.difficulty as DifficultyLevel,
      instructions: exercise.instructions,
      formCues: exercise.formCues,
      safetyTips: exercise.safetyTips,
      commonMistakes: exercise.commonMistakes,
      variations: exercise.variations,
      gifUrl: exercise.gifUrl,
      imageUrls: [exercise.gifUrl],
      source: 'curated' as const,
      tags: [exercise.bodyPart, exercise.equipment, exercise.target, ...exercise.secondaryMuscles],
      alternativeNames: [],
      recommendedSets: this.getDefaultSets(exercise.category),
      recommendedReps: this.getDefaultReps(exercise.category),
      recommendedRest: this.getDefaultRest(exercise.category)
    };
  }

  /**
   * Map string category to ExerciseCategory enum
   */
  private mapStringToCategory(category: string): ExerciseCategory {
    const categoryMap: Record<string, ExerciseCategory> = {
      'strength': 'strength',
      'cardio': 'cardio',
      'flexibility': 'flexibility',
      'plyometric': 'plyometric',
      'powerlifting': 'powerlifting',
      'olympic': 'olympic',
      'stretching': 'stretching'
    };
    
    return categoryMap[category.toLowerCase()] || 'strength';
  }

  /**
   * Transform ExerciseDB format to our Exercise interface
   */
  private transformExerciseDB(exercise: ExerciseDBExercise): Exercise {
    return {
      id: `exercisedb_${exercise.id}`,
      name: this.cleanExerciseName(exercise.name),
      category: this.mapCategoryFromBodyPart(exercise.bodyPart),
      equipment: [this.mapEquipment(exercise.equipment)],
      primaryMuscles: [this.mapMuscleGroup(exercise.target)].filter(Boolean) as MuscleGroup[],
      secondaryMuscles: exercise.secondaryMuscles.map(this.mapMuscleGroup).filter(Boolean) as MuscleGroup[],
      difficulty: 'intermediate' as DifficultyLevel,
      instructions: exercise.instructions,
      formCues: [],
      safetyTips: [],
      commonMistakes: [],
      variations: [],
      gifUrl: exercise.gifUrl,
      imageUrls: [exercise.gifUrl],
      source: 'exercisedb_api' as const,
      tags: [exercise.bodyPart, exercise.equipment, exercise.target],
      alternativeNames: [],
      recommendedSets: this.getDefaultSets('strength'),
      recommendedReps: this.getDefaultReps('strength'),
      recommendedRest: this.getDefaultRest('strength')
    };
  }

  /**
   * Map ExerciseDB body parts to our categories
   */
  private mapCategoryFromBodyPart(bodyPart: string): ExerciseCategory {
    const categoryMap: Record<string, ExerciseCategory> = {
      'chest': 'strength',
      'back': 'strength',
      'shoulders': 'strength',
      'arms': 'strength',
      'legs': 'strength',
      'core': 'strength',
      'cardio': 'cardio',
      'neck': 'flexibility'
    };
    
    return categoryMap[bodyPart.toLowerCase()] || 'strength';
  }

  /**
   * Merge exercises from different sources, prioritizing those with GIFs
   */
  private mergeExercises(freeExercises: Exercise[], exerciseDBExercises: Exercise[]): Exercise[] {
    const merged: Exercise[] = [...freeExercises];
    const existingNames = new Set(freeExercises.map(ex => ex.name.toLowerCase()));

    // Add ExerciseDB exercises that don't already exist
    for (const dbExercise of exerciseDBExercises) {
      if (!existingNames.has(dbExercise.name.toLowerCase())) {
        merged.push(dbExercise);
        existingNames.add(dbExercise.name.toLowerCase());
      } else {
        // If exercise exists, enhance it with GIF from ExerciseDB
        const existingIndex = merged.findIndex(ex => 
          ex.name.toLowerCase() === dbExercise.name.toLowerCase()
        );
        if (existingIndex >= 0 && dbExercise.gifUrl && !merged[existingIndex].gifUrl) {
          merged[existingIndex] = {
            ...merged[existingIndex],
            gifUrl: dbExercise.gifUrl,
            imageUrls: [...merged[existingIndex].imageUrls, dbExercise.gifUrl]
          };
        }
      }
    }

    return merged;
  }

  /**
   * Load and cache exercises from all sources
   */
  async loadAllExercises(): Promise<Exercise[]> {
    // Check cache first
    const now = Date.now();
    if (this.exerciseCache.has('all') && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      console.log('Using cached exercise data');
      return this.exerciseCache.get('all')!;
    }

    console.log('Loading fresh exercise data from APIs...');
    const allExercises: Exercise[] = [];

    // Load from Free Exercise DB
    let freeExercises: Exercise[] = [];
    try {
      freeExercises = await this.fetchFromFreeExerciseDB();
      console.log(`Loaded ${freeExercises.length} exercises from Free Exercise DB`);
    } catch (error) {
      console.error('Failed to load from Free Exercise DB:', error);
    }

    // Load curated exercises with GIFs
    let curatedExercises: Exercise[] = [];
    try {
      curatedExercises = await this.loadCuratedExercises();
      console.log(`Loaded ${curatedExercises.length} curated exercises with GIFs`);
    } catch (error) {
      console.error('Failed to load curated exercises:', error);
    }

    // Merge exercises from both sources - prioritize curated exercises with GIFs
    const mergedExercises = this.mergeExercises(freeExercises, curatedExercises);
    allExercises.push(...mergedExercises);

    // Cache the results
    this.exerciseCache.set('all', allExercises);
    this.lastFetchTime = now;

    // Save to localStorage for offline access
    try {
      localStorage.setItem('forge-exercise-api-cache', JSON.stringify({
        exercises: allExercises,
        timestamp: now
      }));
    } catch (error) {
      console.error('Failed to save exercise cache:', error);
    }

    console.log(`Total exercises loaded: ${allExercises.length} (${curatedExercises.length} curated with GIFs + ${freeExercises.length} from Free Exercise DB)`);
    return allExercises;
  }

  /**
   * Load exercises from localStorage cache
   */
  loadCachedExercises(): Exercise[] {
    try {
      const cached = localStorage.getItem('forge-exercise-api-cache');
      if (!cached) return [];

      const data = JSON.parse(cached);
      const isExpired = (Date.now() - data.timestamp) > this.CACHE_DURATION;
      
      if (isExpired) {
        localStorage.removeItem('forge-exercise-api-cache');
        return [];
      }

      console.log(`Loaded ${data.exercises.length} exercises from cache`);
      return data.exercises;
    } catch (error) {
      console.error('Failed to load cached exercises:', error);
      return [];
    }
  }

  /**
   * Search for exercises by equipment type
   */
  async searchByEquipment(equipment: EquipmentType): Promise<Exercise[]> {
    const allExercises = await this.loadAllExercises();
    return allExercises.filter(ex => ex.equipment.includes(equipment));
  }

  /**
   * Search for exercises by muscle group
   */
  async searchByMuscleGroup(muscleGroup: MuscleGroup): Promise<Exercise[]> {
    const allExercises = await this.loadAllExercises();
    return allExercises.filter(ex => 
      ex.primaryMuscles.includes(muscleGroup) || 
      ex.secondaryMuscles.includes(muscleGroup)
    );
  }

  /**
   * Get exercises similar to a given exercise (same muscle groups or equipment)
   */
  async getSimilarExercises(exercise: Exercise, limit: number = 5): Promise<Exercise[]> {
    const allExercises = await this.loadAllExercises();
    
    return allExercises
      .filter(ex => ex.id !== exercise.id)
      .filter(ex => 
        // Same primary muscle groups
        ex.primaryMuscles.some(muscle => exercise.primaryMuscles.includes(muscle)) ||
        // Same equipment
        ex.equipment.some(eq => exercise.equipment.includes(eq))
      )
      .slice(0, limit);
  }
}

// Singleton instance
export const exerciseAPI = new ExerciseAPIService();