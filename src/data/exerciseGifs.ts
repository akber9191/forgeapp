// Curated Exercise Database with GIFs and Comprehensive Information
// This provides a comprehensive list of exercises with visual demonstrations

export interface ExerciseWithGif {
  id: string;
  name: string;
  category: string;
  equipment: string;
  bodyPart: string;
  target: string;
  secondaryMuscles: string[];
  gifUrl: string;
  instructions: string[];
  formCues: string[];
  safetyTips: string[];
  commonMistakes: string[];
  variations: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const exerciseGifDatabase: ExerciseWithGif[] = [
  // Bodyweight Exercises
  {
    id: "bw_001",
    name: "Push-up",
    category: "strength",
    equipment: "bodyweight",
    bodyPart: "chest",
    target: "pectorals",
    secondaryMuscles: ["triceps", "anterior deltoid", "core"],
    gifUrl: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-up.gif",
    instructions: [
      "Start in a plank position with hands slightly wider than shoulders",
      "Lower your body until chest nearly touches the floor",
      "Push back up to starting position",
      "Keep body in straight line throughout"
    ],
    formCues: [
      "Keep core engaged throughout",
      "Don't let hips sag or pike up",
      "Full range of motion to chest",
      "Control the descent"
    ],
    safetyTips: [
      "Start on knees if too difficult",
      "Don't strain neck - look down",
      "Stop if wrists hurt"
    ],
    commonMistakes: [
      "Sagging hips",
      "Partial range of motion",
      "Flared elbows",
      "Head forward"
    ],
    variations: [
      "Knee push-ups",
      "Incline push-ups", 
      "Diamond push-ups",
      "Wide-grip push-ups"
    ],
    difficulty: "beginner"
  },
  {
    id: "bw_002",
    name: "Bodyweight Squat",
    category: "strength",
    equipment: "bodyweight",
    bodyPart: "legs",
    target: "quadriceps",
    secondaryMuscles: ["glutes", "hamstrings", "calves"],
    gifUrl: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Bodyweight-Squat.gif",
    instructions: [
      "Stand with feet shoulder-width apart",
      "Lower by bending knees and pushing hips back",
      "Go down until thighs parallel to floor",
      "Push through heels to stand up"
    ],
    formCues: [
      "Keep chest up and proud",
      "Knees track over toes",
      "Weight on heels",
      "Full depth if possible"
    ],
    safetyTips: [
      "Don't let knees cave inward",
      "Keep core braced",
      "Don't round lower back"
    ],
    commonMistakes: [
      "Knee valgus",
      "Forward lean",
      "Partial range of motion",
      "Rising on toes"
    ],
    variations: [
      "Jump squats",
      "Sumo squats",
      "Single-leg squats",
      "Wall squats"
    ],
    difficulty: "beginner"
  },
  {
    id: "bw_003", 
    name: "Plank",
    category: "strength",
    equipment: "bodyweight",
    bodyPart: "core",
    target: "abs",
    secondaryMuscles: ["shoulders", "back", "glutes"],
    gifUrl: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Plank.gif",
    instructions: [
      "Start in push-up position on forearms",
      "Keep body in straight line from head to heels",
      "Hold position while breathing normally",
      "Engage core throughout"
    ],
    formCues: [
      "Squeeze glutes",
      "Don't hold breath",
      "Neutral spine",
      "Active shoulders"
    ],
    safetyTips: [
      "Don't let hips sag",
      "Start with shorter holds",
      "Stop if lower back hurts"
    ],
    commonMistakes: [
      "Sagging hips",
      "Raised hips",
      "Holding breath",
      "Inactive core"
    ],
    variations: [
      "Side plank",
      "Plank up-downs",
      "Plank with leg lifts",
      "Mountain climbers"
    ],
    difficulty: "beginner"
  },
  {
    id: "bw_004",
    name: "Burpee",
    category: "cardio",
    equipment: "bodyweight",
    bodyPart: "full_body",
    target: "cardiovascular",
    secondaryMuscles: ["chest", "shoulders", "legs", "core"],
    gifUrl: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Burpee.gif",
    instructions: [
      "Start standing, then squat and place hands on floor",
      "Jump feet back into plank position", 
      "Do a push-up (optional)",
      "Jump feet back to squat, then jump up with arms overhead"
    ],
    formCues: [
      "Fast transitions between positions",
      "Land softly on jumps",
      "Maintain good form even when tired",
      "Full extension on jump"
    ],
    safetyTips: [
      "Modify by stepping instead of jumping",
      "Land on balls of feet",
      "Keep core engaged throughout"
    ],
    commonMistakes: [
      "Poor landing mechanics",
      "Rushing the movement",
      "Skipping the push-up",
      "Not fully extending on jump"
    ],
    variations: [
      "Half burpees (no push-up)",
      "Burpee box jumps",
      "Single-arm burpees",
      "Burpee broad jumps"
    ],
    difficulty: "intermediate"
  },

  // Kettlebell Exercises
  {
    id: "kb_001",
    name: "Kettlebell Swing",
    category: "strength",
    equipment: "kettlebell",
    bodyPart: "posterior_chain",
    target: "glutes",
    secondaryMuscles: ["hamstrings", "core", "shoulders"],
    gifUrl: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Kettlebell-Swing.gif",
    instructions: [
      "Stand with feet wider than shoulders, kettlebell in front",
      "Hinge at hips and grab kettlebell with both hands",
      "Drive hips forward explosively to swing kettlebell up",
      "Let kettlebell swing back between legs and repeat"
    ],
    formCues: [
      "Power comes from hips, not arms",
      "Keep back straight",
      "Stand tall at top",
      "Control the descent"
    ],
    safetyTips: [
      "Start with lighter weight",
      "Master hip hinge pattern first",
      "Keep kettlebell close to body"
    ],
    commonMistakes: [
      "Using arms to lift",
      "Squatting instead of hinging",
      "Overextending back",
      "Looking up at kettlebell"
    ],
    variations: [
      "Single-arm swings",
      "American swings (overhead)",
      "Alternating swings",
      "Heavy swings"
    ],
    difficulty: "intermediate"
  },
  {
    id: "kb_002",
    name: "Kettlebell Goblet Squat",
    category: "strength", 
    equipment: "kettlebell",
    bodyPart: "legs",
    target: "quadriceps",
    secondaryMuscles: ["glutes", "core", "upper back"],
    gifUrl: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Goblet-Squat.gif",
    instructions: [
      "Hold kettlebell at chest level with both hands",
      "Stand with feet shoulder-width apart",
      "Squat down keeping chest up and elbows inside knees",
      "Drive through heels to return to standing"
    ],
    formCues: [
      "Keep kettlebell close to chest",
      "Elbows point down",
      "Full depth squat",
      "Proud chest"
    ],
    safetyTips: [
      "Don't let kettlebell pull you forward",
      "Keep core braced",
      "Control the descent"
    ],
    commonMistakes: [
      "Kettlebell drifting away from body",
      "Shallow squats",
      "Knee valgus",
      "Forward lean"
    ],
    variations: [
      "Pause goblet squats",
      "Goblet squat pulses",
      "Offset goblet squats",
      "Goblet squat to press"
    ],
    difficulty: "beginner"
  },

  // Dumbbell Exercises  
  {
    id: "db_001",
    name: "Dumbbell Bench Press",
    category: "strength",
    equipment: "dumbbell",
    bodyPart: "chest", 
    target: "pectorals",
    secondaryMuscles: ["triceps", "anterior deltoid"],
    gifUrl: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Bench-Press.gif",
    instructions: [
      "Lie on bench holding dumbbells above chest",
      "Lower dumbbells with control to chest level",
      "Press dumbbells back up to starting position",
      "Keep wrists straight and core engaged"
    ],
    formCues: [
      "Retract shoulder blades",
      "Keep feet planted",
      "Control the negative",
      "Full range of motion"
    ],
    safetyTips: [
      "Use spotter for heavy weights",
      "Don't bounce dumbbells off chest",
      "Keep core tight"
    ],
    commonMistakes: [
      "Arching back excessively",
      "Partial range of motion",
      "Unstable shoulders",
      "Lifting feet off floor"
    ],
    variations: [
      "Incline dumbbell press",
      "Decline dumbbell press", 
      "Single-arm dumbbell press",
      "Dumbbell flyes"
    ],
    difficulty: "intermediate"
  },
  {
    id: "db_002",
    name: "Dumbbell Row",
    category: "strength",
    equipment: "dumbbell",
    bodyPart: "back",
    target: "latissimus dorsi",
    secondaryMuscles: ["rhomboids", "middle trapezius", "biceps"],
    gifUrl: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Row.gif",
    instructions: [
      "Place one knee and hand on bench for support",
      "Hold dumbbell in opposite hand, arm extended",
      "Pull dumbbell to hip, squeezing shoulder blade",
      "Lower with control and repeat"
    ],
    formCues: [
      "Lead with elbow",
      "Squeeze shoulder blade at top",
      "Keep core stable",
      "Don't rotate torso"
    ],
    safetyTips: [
      "Keep supporting leg stable",
      "Don't jerk the weight",
      "Maintain neutral spine"
    ],
    commonMistakes: [
      "Using momentum",
      "Not squeezing shoulder blade",
      "Rotating torso",
      "Partial range of motion"
    ],
    variations: [
      "Bent-over dumbbell rows",
      "Single-arm dumbbell rows",
      "Chest-supported rows",
      "Renegade rows"
    ],
    difficulty: "beginner"
  },

  // Barbell Exercises
  {
    id: "bb_001", 
    name: "Barbell Deadlift",
    category: "powerlifting",
    equipment: "barbell",
    bodyPart: "posterior_chain",
    target: "erector_spinae",
    secondaryMuscles: ["glutes", "hamstrings", "traps", "lats"],
    gifUrl: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Deadlift.gif",
    instructions: [
      "Stand with feet hip-width apart, bar over mid-foot",
      "Hinge at hips and grab bar with hands outside legs",
      "Keep chest up, drive through heels to lift bar",
      "Stand tall, then lower bar with control"
    ],
    formCues: [
      "Keep bar close to body",
      "Drive hips forward",
      "Maintain neutral spine",
      "Engage lats"
    ],
    safetyTips: [
      "Start with lighter weight",
      "Don't round back",
      "Use proper bar height"
    ],
    commonMistakes: [
      "Rounded back",
      "Bar drifting forward",
      "Hyperextending at top",
      "Looking up"
    ],
    variations: [
      "Sumo deadlifts",
      "Romanian deadlifts",
      "Deficit deadlifts",
      "Trap bar deadlifts"
    ],
    difficulty: "advanced"
  },
  {
    id: "bb_002",
    name: "Barbell Back Squat",
    category: "powerlifting", 
    equipment: "barbell",
    bodyPart: "legs",
    target: "quadriceps",
    secondaryMuscles: ["glutes", "hamstrings", "core"],
    gifUrl: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Squat.gif",
    instructions: [
      "Position bar on upper back, step back from rack",
      "Stand with feet shoulder-width apart",
      "Squat down by bending knees and hips",
      "Drive through heels to return to standing"
    ],
    formCues: [
      "Keep chest up",
      "Knees track over toes", 
      "Break at hips and knees together",
      "Full depth if possible"
    ],
    safetyTips: [
      "Use safety bars in rack",
      "Have spotter for heavy weights",
      "Warm up thoroughly"
    ],
    commonMistakes: [
      "Knee valgus",
      "Forward lean",
      "Partial depth",
      "Shifting weight forward"
    ],
    variations: [
      "Front squats",
      "High bar vs low bar",
      "Pause squats",
      "Box squats"
    ],
    difficulty: "advanced"
  },

  // Core Exercises
  {
    id: "core_001",
    name: "Dead Bug",
    category: "strength",
    equipment: "bodyweight", 
    bodyPart: "core",
    target: "abs",
    secondaryMuscles: ["hip flexors", "shoulders"],
    gifUrl: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dead-Bug.gif",
    instructions: [
      "Lie on back with arms extended up and knees bent at 90°",
      "Slowly extend opposite arm and leg",
      "Return to starting position with control",
      "Repeat with other arm and leg"
    ],
    formCues: [
      "Keep lower back pressed to floor",
      "Move slowly and controlled",
      "Don't hold breath",
      "Opposite arm and leg"
    ],
    safetyTips: [
      "Stop if back arches",
      "Start with small movements",
      "Focus on quality over speed"
    ],
    commonMistakes: [
      "Lower back lifting off floor",
      "Moving too fast",
      "Using momentum",
      "Not breathing"
    ],
    variations: [
      "Dead bug with band",
      "Dead bug holds",
      "Modified dead bug",
      "Dead bug with weight"
    ],
    difficulty: "beginner"
  },

  // Pull-up Variations
  {
    id: "pullup_001",
    name: "Pull-up",
    category: "strength",
    equipment: "pull_up_bar",
    bodyPart: "back",
    target: "latissimus_dorsi", 
    secondaryMuscles: ["biceps", "rhomboids", "middle_trapezius"],
    gifUrl: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-up.gif",
    instructions: [
      "Hang from bar with hands slightly wider than shoulders",
      "Pull body up until chin clears bar",
      "Lower with control to full arm extension",
      "Repeat for desired reps"
    ],
    formCues: [
      "Lead with chest",
      "Pull elbows down and back",
      "Control the descent",
      "Full range of motion"
    ],
    safetyTips: [
      "Use assistance band if needed",
      "Don't kip unless trained",
      "Avoid excessive swinging"
    ],
    commonMistakes: [
      "Partial range of motion",
      "Using momentum", 
      "Not engaging lats",
      "Rushing the movement"
    ],
    variations: [
      "Chin-ups",
      "Wide-grip pull-ups",
      "Assisted pull-ups",
      "Weighted pull-ups"
    ],
    difficulty: "advanced"
  }
];

export const getExercisesByEquipment = (equipment: string): ExerciseWithGif[] => {
  return exerciseGifDatabase.filter(ex => 
    ex.equipment.toLowerCase().includes(equipment.toLowerCase())
  );
};

export const getExercisesByBodyPart = (bodyPart: string): ExerciseWithGif[] => {
  return exerciseGifDatabase.filter(ex => 
    ex.bodyPart.toLowerCase().includes(bodyPart.toLowerCase()) ||
    ex.target.toLowerCase().includes(bodyPart.toLowerCase())
  );
};

export const searchExercises = (query: string): ExerciseWithGif[] => {
  const lowerQuery = query.toLowerCase();
  return exerciseGifDatabase.filter(ex =>
    ex.name.toLowerCase().includes(lowerQuery) ||
    ex.target.toLowerCase().includes(lowerQuery) ||
    ex.bodyPart.toLowerCase().includes(lowerQuery) ||
    ex.equipment.toLowerCase().includes(lowerQuery) ||
    ex.secondaryMuscles.some(muscle => muscle.toLowerCase().includes(lowerQuery))
  );
};