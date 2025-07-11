import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  TrendingUp, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Trophy,
  Flame,
  Target,
  Download,
  Upload
} from "lucide-react";
import { UnitToggle } from "@/components/UnitToggle";
import { 
  getWorkoutHistory, 
  getWorkoutStats, 
  deleteWorkout,
  exportWorkoutHistory,
  type CompletedWorkout,
  type WorkoutStats 
} from "@/utils/workoutHistory";
import { 
  convertWeight, 
  formatVolume, 
  formatWeight,
  getUserPreferredUnit, 
  type WeightUnit 
} from "@/utils/unitConversion";
import { useToast } from "@/hooks/use-toast";

const HistoryPage = () => {
  const [history, setHistory] = useState<CompletedWorkout[]>([]);
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [currentUnit, setCurrentUnit] = useState<WeightUnit>(() => getUserPreferredUnit());
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setHistory(getWorkoutHistory());
    setStats(getWorkoutStats());
  };

  const handleUnitChange = (unit: WeightUnit) => {
    setCurrentUnit(unit);
  };

  const handleDeleteWorkout = (workoutId: string) => {
    if (deleteWorkout(workoutId)) {
      loadData();
      toast({
        title: "Workout Deleted",
        description: "The workout has been removed from your history."
      });
    }
  };

  const toggleWorkoutExpansion = (workoutId: string) => {
    const newExpanded = new Set(expandedWorkouts);
    if (newExpanded.has(workoutId)) {
      newExpanded.delete(workoutId);
    } else {
      newExpanded.add(workoutId);
    }
    setExpandedWorkouts(newExpanded);
  };

  const handleExportHistory = () => {
    try {
      const data = exportWorkoutHistory();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forge-workout-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Your workout history has been exported."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatDuration = (startTime: number, endTime: number) => {
    const duration = Math.round((endTime - startTime) / 1000 / 60); // minutes
    if (duration < 60) {
      return `${duration}m`;
    } else {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  // Group workouts by date
  const workoutsByDate = history.reduce((groups, workout) => {
    const date = workout.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(workout);
    return groups;
  }, {} as Record<string, CompletedWorkout[]>);

  if (!stats) {
    return (
      <div className="pb-20 px-4 pt-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="pb-20 px-4 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workout History</h1>
        <UnitToggle onUnitChange={handleUnitChange} />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalWorkouts}</div>
            <div className="text-sm text-muted-foreground">Total Workouts</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {formatVolume(
                currentUnit === 'kg' ? stats.totalVolumeKg : stats.totalVolumeLbs, 
                currentUnit
              )}
            </div>
            <div className="text-sm text-muted-foreground">Total Volume</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {formatVolume(
                convertWeight(stats.averageVolumePerWorkout, 'kg', currentUnit), 
                currentUnit
              )}
            </div>
            <div className="text-sm text-muted-foreground">Avg/Workout</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame className="w-5 h-5 text-orange-500" />
              <div className="text-2xl font-bold text-primary">{stats.currentStreak}</div>
            </div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Exercises */}
      {stats.topExercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Top Exercises
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.topExercises.slice(0, 3).map((exercise, index) => (
              <div key={exercise.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    #{index + 1}
                  </Badge>
                  <span className="font-medium">{exercise.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatVolume(convertWeight(exercise.volume, 'kg', currentUnit), currentUnit)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Export Button */}
      <div className="flex justify-center">
        <Button onClick={handleExportHistory} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export History
        </Button>
      </div>

      {/* Workout History */}
      {Object.keys(workoutsByDate).length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No Workouts Yet</h3>
            <p className="text-muted-foreground">
              Complete your first workout to start tracking your progress!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Workouts</h2>
          
          {Object.entries(workoutsByDate).map(([date, workouts]) => (
            <div key={date} className="space-y-2">
              {/* Date Header */}
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {formatDate(date)}
              </div>

              {/* Workouts for this date */}
              {workouts.map((workout) => {
                const isExpanded = expandedWorkouts.has(workout.id);
                const workoutVolume = currentUnit === 'kg' 
                  ? workout.totalVolume 
                  : convertWeight(workout.totalVolume, 'kg', currentUnit);

                return (
                  <Card key={workout.id}>
                    <CardContent className="p-4">
                      {/* Workout Summary */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-semibold">{workout.workoutName || 'Workout'}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatVolume(workoutVolume, currentUnit)} • {' '}
                            {formatDuration(workout.startTime, workout.endTime)} • {' '}
                            {workout.exercises.length} exercises
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleWorkoutExpansion(workout.id)}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteWorkout(workout.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="space-y-3 pt-3 border-t">
                          {workout.exercises.map((exercise) => (
                            <div key={exercise.id} className="space-y-2">
                              <div className="font-medium">{exercise.name}</div>
                              <div className="grid gap-2">
                                {exercise.sets.map((set, setIndex) => {
                                  const displayWeight = convertWeight(set.weightPerBell, set.unit, currentUnit);
                                  const displayVolume = convertWeight(set.totalVolume, set.unit, currentUnit);
                                  
                                  return (
                                    <div key={setIndex} className="flex items-center justify-between text-sm bg-muted/30 p-2 rounded">
                                      <span>
                                        {set.numberOfBells === 1 ? 'Single' : 'Double'} {' '}
                                        {formatWeight(displayWeight, currentUnit)} × {set.reps} reps
                                      </span>
                                      <span className="text-muted-foreground">
                                        {formatVolume(displayVolume, currentUnit)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="text-sm text-muted-foreground text-right">
                                Exercise total: {formatVolume(convertWeight(exercise.totalVolume, 'kg', currentUnit), currentUnit)}
                              </div>
                            </div>
                          ))}
                          
                          {workout.notes && (
                            <div className="pt-2 border-t">
                              <div className="text-sm font-medium mb-1">Notes:</div>
                              <div className="text-sm text-muted-foreground">{workout.notes}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;