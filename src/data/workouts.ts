
export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  notes?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Exercise[];
}

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: 'a',
    name: 'Workout A',
    exercises: [
      {
        name: 'Double Kettlebell Front Squat',
        sets: 4,
        reps: '6-8',
        notes: 'Keep chest up, knees tracking over toes'
      },
      {
        name: 'Double Kettlebell Clean',
        sets: 3,
        reps: '6',
        notes: 'Explosive hip drive, soft catch'
      },
      {
        name: 'Kettlebell Overhead Press',
        sets: 3,
        reps: '6-10',
        notes: 'Tight core, full lockout overhead'
      },
      {
        name: 'Plank Hold or Stir-the-Pot',
        sets: 3,
        reps: '30-60 sec',
        notes: 'Maintain neutral spine throughout'
      }
    ]
  },
  {
    id: 'b',
    name: 'Workout B',
    exercises: [
      {
        name: 'Clean to Front Squat Complex',
        sets: 3,
        reps: '5',
        notes: 'Clean + Front Squat = 1 rep'
      },
      {
        name: 'Kettlebell Push Press',
        sets: 3,
        reps: '6-8',
        notes: 'Use legs to initiate drive'
      },
      {
        name: 'Kettlebell Suitcase Carry',
        sets: 3,
        reps: '30-40 sec per side',
        notes: 'Keep shoulders level, tall posture'
      },
      {
        name: 'Dead Bug or Bird-Dog',
        sets: 3,
        reps: '8-10 slow reps',
        notes: 'Focus on control and stability'
      }
    ]
  },
  {
    id: 'c',
    name: 'Workout C',
    exercises: [
      {
        name: 'Kettlebell Swings',
        sets: 5,
        reps: '20',
        notes: 'Hip hinge pattern, bell floats to shoulder height'
      },
      {
        name: 'Goblet Step-ups or Split Squats',
        sets: 3,
        reps: '8 per leg',
        notes: 'Control the eccentric, drive through heel'
      },
      {
        name: 'Clean & Press Ladder',
        sets: 3,
        reps: '1,2,3 reps × 3 rounds',
        notes: 'Rest as needed between ladder rungs'
      },
      {
        name: 'Side Plank (with reach-under or weight)',
        sets: 2,
        reps: 'per side',
        notes: 'Hold 30-45 seconds, maintain straight line'
      }
    ]
  }
];
