import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Flame, Trophy } from "lucide-react";
import { WorkoutExercise } from "@/utils/workoutHistory";
import { convertWeight, formatVolume, getUserPreferredUnit, type WeightUnit } from "@/utils/unitConversion";

interface VolumeStatsProps {
  exercises: WorkoutExercise[];
  className?: string;
  showGoals?: boolean;
}

export const VolumeStats = ({ exercises, className = "", showGoals = true }: VolumeStatsProps) => {
  const [currentUnit, setCurrentUnit] = useState<WeightUnit>(() => getUserPreferredUnit());

  // Listen for unit changes
  useEffect(() => {
    const handleUnitChange = ((e: CustomEvent<WeightUnit>) => {
      setCurrentUnit(e.detail);
    }) as EventListener;

    window.addEventListener('unitChanged', handleUnitChange);
    return () => window.removeEventListener('unitChanged', handleUnitChange);
  }, []);

  // Calculate session totals
  const sessionStats = exercises.reduce((acc, exercise) => {
    const exerciseVolumeKg = exercise.totalVolume;
    const exerciseSets = exercise.sets.length;
    const exerciseReps = exercise.sets.reduce((sum, set) => sum + set.reps, 0);
    
    return {
      totalVolume: acc.totalVolume + exerciseVolumeKg,
      totalSets: acc.totalSets + exerciseSets,
      totalReps: acc.totalReps + exerciseReps,
      exerciseCount: acc.exerciseCount + 1
    };
  }, { totalVolume: 0, totalSets: 0, totalReps: 0, exerciseCount: 0 });

  // Convert volume to display unit
  const displayVolume = currentUnit === 'kg' 
    ? sessionStats.totalVolume 
    : convertWeight(sessionStats.totalVolume, 'kg', currentUnit);

  // Volume goals (in kg)
  const goals = {
    beginner: 1000, // kg
    intermediate: 2000,
    advanced: 3000
  };

  const currentGoal = sessionStats.totalVolume < goals.beginner ? goals.beginner :
                     sessionStats.totalVolume < goals.intermediate ? goals.intermediate :
                     goals.advanced;

  const goalProgress = Math.min((sessionStats.totalVolume / currentGoal) * 100, 100);
  const goalLabel = currentGoal === goals.beginner ? 'Beginner' :
                   currentGoal === goals.intermediate ? 'Intermediate' : 'Advanced';

  // Get highest volume exercise
  const topExercise = exercises.reduce((top, exercise) => 
    !top || exercise.totalVolume > top.totalVolume ? exercise : top
  , null as WorkoutExercise | null);

  if (sessionStats.exerciseCount === 0) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Start adding sets to see your volume stats!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4 space-y-4">
        {/* Main Volume Display */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Session Volume</span>
          </div>
          <div className="text-3xl font-bold text-primary">
            {formatVolume(displayVolume, currentUnit)}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold">{sessionStats.exerciseCount}</div>
            <div className="text-xs text-muted-foreground">Exercises</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{sessionStats.totalSets}</div>
            <div className="text-xs text-muted-foreground">Sets</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{sessionStats.totalReps}</div>
            <div className="text-xs text-muted-foreground">Reps</div>
          </div>
        </div>

        {/* Progress toward goal */}
        {showGoals && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Goal Progress</span>
              <Badge variant="secondary" className="text-xs">
                {goalLabel}
              </Badge>
            </div>
            <Progress value={goalProgress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatVolume(displayVolume, currentUnit)}</span>
              <span>{formatVolume(convertWeight(currentGoal, 'kg', currentUnit), currentUnit)}</span>
            </div>
          </div>
        )}

        {/* Top Exercise */}
        {topExercise && (
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
            <Trophy className="w-4 h-4 text-amber-500" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{topExercise.name}</div>
              <div className="text-xs text-muted-foreground">
                {formatVolume(convertWeight(topExercise.totalVolume, 'kg', currentUnit), currentUnit)} volume
              </div>
            </div>
          </div>
        )}

        {/* Achievement Badges */}
        {goalProgress >= 100 && (
          <div className="flex items-center justify-center gap-1 p-2 bg-primary/10 rounded-lg">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Goal Achieved! 🎉</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VolumeStats;