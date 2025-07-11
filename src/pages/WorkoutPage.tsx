import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, RotateCcw, Check, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { workoutTemplates } from "@/data/workouts";
import { useToast } from "@/hooks/use-toast";
import { SetInput } from "@/components/SetInput";
import { VolumeStats } from "@/components/VolumeStats";
import { UnitToggle } from "@/components/UnitToggle";
import { ParsedSet } from "@/utils/parseSetInput";
import { 
  saveCompletedWorkout, 
  parsedSetToWorkoutSet,
  type WorkoutExercise,
  type WorkoutSet 
} from "@/utils/workoutHistory";
import { 
  convertWeight, 
  formatWeight, 
  formatVolume,
  getUserPreferredUnit,
  type WeightUnit 
} from "@/utils/unitConversion";

interface EnhancedWorkoutSession {
  workoutId: string;
  startTime: number;
  exercises: WorkoutExercise[];
  notes: string;
  restStartTime?: number;
  restDuration?: number;
  lastActiveTime?: number;
}

const WorkoutPage = () => {
  const { workoutId } = useParams();
  const { toast } = useToast();
  const workout = workoutTemplates.find(w => w.id === workoutId);

  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [restTime, setRestTime] = useState(0);
  const [restActive, setRestActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<EnhancedWorkoutSession | null>(null);
  const [notes, setNotes] = useState('');
  const [currentUnit, setCurrentUnit] = useState<WeightUnit>(() => getUserPreferredUnit());
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number>(0);

  // Load active session on component mount
  useEffect(() => {
    const activeSessionKey = `activeWorkoutNew_${workoutId}`;
    const savedSession = localStorage.getItem(activeSessionKey);
    
    if (savedSession) {
      try {
        const session: EnhancedWorkoutSession = JSON.parse(savedSession);
        setCurrentSession(session);
        setWorkoutStarted(true);
        setNotes(session.notes);
        
        // Restore rest timer if it was active
        if (session.restStartTime && session.restDuration) {
          const elapsed = Math.floor((Date.now() - session.restStartTime) / 1000);
          const remaining = session.restDuration - elapsed;
          
          if (remaining > 0) {
            setRestTime(remaining);
            setRestActive(true);
          } else {
            toast({
              title: "Rest Complete!",
              description: "Your rest time finished while you were away"
            });
          }
        }
      } catch (error) {
        console.error('Error loading saved session:', error);
      }
    }
  }, [workoutId, toast]);

  // Listen for unit changes
  useEffect(() => {
    const handleUnitChange = ((e: CustomEvent<WeightUnit>) => {
      setCurrentUnit(e.detail);
    }) as EventListener;

    window.addEventListener('unitChanged', handleUnitChange);
    return () => window.removeEventListener('unitChanged', handleUnitChange);
  }, []);

  // Persist session changes to localStorage
  useEffect(() => {
    if (currentSession && workoutStarted) {
      const activeSessionKey = `activeWorkoutNew_${workoutId}`;
      const sessionToSave = {
        ...currentSession,
        notes,
        lastActiveTime: Date.now(),
        ...(restActive && restTime > 0 ? {
          restStartTime: Date.now() - (currentSession.restDuration! - restTime) * 1000,
          restDuration: currentSession.restDuration
        } : {})
      };
      localStorage.setItem(activeSessionKey, JSON.stringify(sessionToSave));
    }
  }, [currentSession, notes, workoutId, workoutStarted, restActive, restTime]);

  // Timer effect for workout duration (timestamp-based)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (workoutStarted && currentSession) {
      const updateWorkoutTime = () => {
        const elapsed = Math.floor((Date.now() - currentSession.startTime) / 1000);
        setWorkoutTime(elapsed);
      };
      
      updateWorkoutTime();
      interval = setInterval(updateWorkoutTime, 1000);
    }
    return () => clearInterval(interval);
  }, [workoutStarted, currentSession]);

  // Timer effect for rest periods (timestamp-based)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restActive && restTime > 0) {
      interval = setInterval(() => {
        setRestTime(prev => {
          if (prev <= 1) {
            setRestActive(false);
            if (currentSession) {
              const updatedSession = { ...currentSession };
              delete updatedSession.restStartTime;
              delete updatedSession.restDuration;
              setCurrentSession(updatedSession);
            }
            toast({
              title: "Rest Complete!",
              description: "Time for your next set"
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restActive, restTime, toast, currentSession]);

  const startWorkout = () => {
    const session: EnhancedWorkoutSession = {
      workoutId: workoutId!,
      startTime: Date.now(),
      exercises: workout?.exercises.map(exercise => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2)}`,
        name: exercise.name,
        sets: [],
        totalVolume: 0
      })) || [],
      notes: ''
    };

    setCurrentSession(session);
    setWorkoutStarted(true);
    toast({
      title: "Workout Started!",
      description: `Let's forge some strength with ${workout?.name}`
    });
  };

  const handleSetAdd = (parsedSet: ParsedSet) => {
    if (!currentSession || selectedExerciseIndex < 0) return;

    const workoutSet = parsedSetToWorkoutSet(parsedSet);
    const updatedSession = { ...currentSession };
    
    // Add set to the selected exercise
    updatedSession.exercises[selectedExerciseIndex].sets.push(workoutSet);
    
    // Recalculate exercise total volume (store in kg for consistency)
    const exercise = updatedSession.exercises[selectedExerciseIndex];
    exercise.totalVolume = exercise.sets.reduce((total, set) => {
      const volumeInKg = set.unit === 'kg' 
        ? set.totalVolume 
        : convertWeight(set.totalVolume, 'lbs', 'kg');
      return total + volumeInKg;
    }, 0);

    setCurrentSession(updatedSession);
    
    toast({
      title: "Set Added!",
      description: `${formatWeight(parsedSet.weightPerBell, parsedSet.unit)} × ${parsedSet.reps} reps`
    });
  };

  const handleSetDelete = (exerciseIndex: number, setIndex: number) => {
    if (!currentSession) return;

    const updatedSession = { ...currentSession };
    updatedSession.exercises[exerciseIndex].sets.splice(setIndex, 1);
    
    // Recalculate exercise total volume
    const exercise = updatedSession.exercises[exerciseIndex];
    exercise.totalVolume = exercise.sets.reduce((total, set) => {
      const volumeInKg = set.unit === 'kg' 
        ? set.totalVolume 
        : convertWeight(set.totalVolume, 'lbs', 'kg');
      return total + volumeInKg;
    }, 0);

    setCurrentSession(updatedSession);
  };

  const startRestTimer = (seconds: number) => {
    setRestTime(seconds);
    setRestActive(true);
    
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        restStartTime: Date.now(),
        restDuration: seconds
      };
      setCurrentSession(updatedSession);
    }
    
    toast({
      title: `Rest Timer Started`,
      description: `${seconds} seconds - You've earned this break!`
    });
  };

  const finishWorkout = () => {
    if (!currentSession || !workout) return;

    // Save to workout history
    const completedWorkout = saveCompletedWorkout(
      workout.name,
      currentSession.exercises,
      currentSession.startTime,
      Date.now(),
      notes
    );

    // Remove active session
    const activeSessionKey = `activeWorkoutNew_${workoutId}`;
    localStorage.removeItem(activeSessionKey);

    toast({
      title: "Workout Complete!",
      description: `Great job! Total volume: ${formatVolume(convertWeight(completedWorkout.totalVolume, 'kg', currentUnit), currentUnit)}`
    });

    // Reset state
    setWorkoutStarted(false);
    setWorkoutTime(0);
    setRestTime(0);
    setRestActive(false);
    setCurrentSession(null);
    setNotes('');
  };

  const cancelWorkout = () => {
    if (!currentSession) return;

    const activeSessionKey = `activeWorkoutNew_${workoutId}`;
    localStorage.removeItem(activeSessionKey);

    toast({
      title: "Workout Cancelled",
      description: "Your progress was not saved"
    });

    setWorkoutStarted(false);
    setWorkoutTime(0);
    setRestTime(0);
    setRestActive(false);
    setCurrentSession(null);
    setNotes('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!workout) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Workout not found</p>
      </div>
    );
  }

  return (
    <div className="pb-20 px-4 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold">{workout.name}</h1>
        <UnitToggle size="sm" />
      </div>

      {/* Workout Timer & Controls */}
      <Card>
        <CardContent className="p-4">
          {workoutStarted && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-medium text-primary">Workout in progress • Auto-saved</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-primary mr-2" />
              <span className="text-2xl font-bold">{formatTime(workoutTime)}</span>
            </div>
            
            <div className="flex gap-2">
              {!workoutStarted ? (
                <Button onClick={startWorkout} className="forge-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Start Workout
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={cancelWorkout} 
                    variant="outline"
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button onClick={finishWorkout} className="forge-button bg-green-600 hover:bg-green-700">
                    <Check className="w-4 h-4 mr-2" />
                    Finish
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Rest Timer */}
          {restActive && (
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-orange-700 dark:text-orange-300 font-semibold">Rest Time</span>
                <span className="text-2xl font-bold text-orange-700 dark:text-orange-300">{formatTime(restTime)}</span>
              </div>
            </div>
          )}

          {/* Rest Timer Buttons */}
          {workoutStarted && (
            <div className="flex gap-2">
              <Button 
                onClick={() => startRestTimer(60)}
                variant="secondary"
                size="sm"
              >
                60s Rest
              </Button>
              <Button 
                onClick={() => startRestTimer(90)}
                variant="secondary"
                size="sm"
              >
                90s Rest
              </Button>
              {restActive && (
                <Button 
                  onClick={() => {
                    setRestActive(false); 
                    setRestTime(0);
                    if (currentSession) {
                      const updatedSession = { ...currentSession };
                      delete updatedSession.restStartTime;
                      delete updatedSession.restDuration;
                      setCurrentSession(updatedSession);
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Volume Stats */}
      {workoutStarted && currentSession && (
        <VolumeStats exercises={currentSession.exercises} />
      )}

      {/* Exercise Input */}
      {workoutStarted && currentSession && (
        <Card>
          <CardHeader>
            <CardTitle>Add Set</CardTitle>
            
            {/* Exercise Selector */}
            <div className="flex flex-wrap gap-2">
              {currentSession.exercises.map((exercise, index) => (
                <Badge
                  key={exercise.id}
                  variant={selectedExerciseIndex === index ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setSelectedExerciseIndex(index)}
                >
                  {exercise.name} ({exercise.sets.length})
                </Badge>
              ))}
            </div>
          </CardHeader>
          
          <CardContent>
            <SetInput 
              onSetAdd={handleSetAdd}
              placeholder={`Add set for ${currentSession.exercises[selectedExerciseIndex]?.name || 'exercise'}`}
              autoFocus
            />
          </CardContent>
        </Card>
      )}

      {/* Exercise Sets Display */}
      {workoutStarted && currentSession && (
        <div className="space-y-4">
          {currentSession.exercises.map((exercise, exerciseIndex) => {
            if (exercise.sets.length === 0) return null;
            
            return (
              <Card key={exercise.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {formatVolume(convertWeight(exercise.totalVolume, 'kg', currentUnit), currentUnit)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {exercise.sets.map((set, setIndex) => {
                    const displayWeight = convertWeight(set.weightPerBell, set.unit, currentUnit);
                    const displayVolume = convertWeight(set.totalVolume, set.unit, currentUnit);
                    
                    return (
                      <div key={set.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">
                            {set.numberOfBells === 1 ? 'Single' : 'Double'} {' '}
                            {formatWeight(displayWeight, currentUnit)} × {set.reps} reps
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Volume: {formatVolume(displayVolume, currentUnit)}
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDelete(exerciseIndex, setIndex)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Workout Notes */}
      {workoutStarted && (
        <Card>
          <CardHeader>
            <CardTitle>Workout Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="How did this workout feel? Any observations or achievements?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="forge-input"
              rows={3}
            />
          </CardContent>
        </Card>
      )}

      {/* Quick Workout Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Other Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {workoutTemplates.map((w) => (
              <Link key={w.id} to={`/workout/${w.id}`}>
                <Button 
                  variant={w.id === workoutId ? "default" : "secondary"}
                  size="sm"
                >
                  {w.name}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutPage;