
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw, Check, Clock, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { workoutTemplates } from "@/data/workouts";
import { useToast } from "@/hooks/use-toast";

interface SetData {
  completed: boolean;
  weight?: string;
}

interface WorkoutSession {
  workoutId: string;
  date: string;
  startTime: number;
  endTime?: number;
  sets: { [exerciseIndex: number]: SetData[] };
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
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [notes, setNotes] = useState('');

  // Load active session on component mount
  useEffect(() => {
    const activeSessionKey = `activeWorkout_${workoutId}`;
    const savedSession = localStorage.getItem(activeSessionKey);
    
    if (savedSession) {
      const session: WorkoutSession = JSON.parse(savedSession);
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
          // Rest period completed while away
          toast({
            title: "Rest Complete!",
            description: "Your rest time finished while you were away"
          });
        }
      }
    }
  }, [workoutId, toast]);

  // Persist session changes to localStorage
  useEffect(() => {
    if (currentSession && workoutStarted) {
      const activeSessionKey = `activeWorkout_${workoutId}`;
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
      
      updateWorkoutTime(); // Initial calculation
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
            // Clear rest data from session
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
    const session: WorkoutSession = {
      workoutId: workoutId!,
      date: new Date().toISOString(),
      startTime: Date.now(),
      sets: {},
      notes: ''
    };

    // Initialize sets for each exercise
    workout?.exercises.forEach((exercise, exerciseIndex) => {
      session.sets[exerciseIndex] = Array(exercise.sets).fill(null).map(() => ({
        completed: false,
        weight: ''
      }));
    });

    setCurrentSession(session);
    setWorkoutStarted(true);
    toast({
      title: "Workout Started!",
      description: `Let's forge some strength with ${workout?.name}`
    });
  };

  const toggleSetCompletion = (exerciseIndex: number, setIndex: number) => {
    if (!currentSession) return;

    const newSession = { ...currentSession };
    newSession.sets[exerciseIndex][setIndex].completed = 
      !newSession.sets[exerciseIndex][setIndex].completed;
    
    setCurrentSession(newSession);

    if (newSession.sets[exerciseIndex][setIndex].completed) {
      toast({
        title: "Set Complete!",
        description: "Great work, keep it up!"
      });
    }
  };

  const updateSetWeight = (exerciseIndex: number, setIndex: number, weight: string) => {
    if (!currentSession) return;

    const newSession = { ...currentSession };
    newSession.sets[exerciseIndex][setIndex].weight = weight;
    setCurrentSession(newSession);
  };

  const startRestTimer = (seconds: number) => {
    setRestTime(seconds);
    setRestActive(true);
    
    // Update session with rest timing data
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
    if (!currentSession) return;

    const completedSession = {
      ...currentSession,
      endTime: Date.now(),
      notes
    };

    // Save completed workout to localStorage
    const savedWorkouts = JSON.parse(localStorage.getItem('forgeWorkouts') || '[]');
    savedWorkouts.push(completedSession);
    localStorage.setItem('forgeWorkouts', JSON.stringify(savedWorkouts));

    // Remove active session
    const activeSessionKey = `activeWorkout_${workoutId}`;
    localStorage.removeItem(activeSessionKey);

    toast({
      title: "Workout Complete!",
      description: "Another step forward in your forge journey"
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

    // Remove active session
    const activeSessionKey = `activeWorkout_${workoutId}`;
    localStorage.removeItem(activeSessionKey);

    toast({
      title: "Workout Cancelled",
      description: "Your progress was not saved"
    });

    // Reset state
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
    <div className="pb-20 px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold">{workout.name}</h1>
        <div className="w-10" />
      </div>

      {/* Workout Timer & Controls */}
      <div className="forge-card mb-6">
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
                <Play className="w-4 h-4 mr-2" />
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
                <Button onClick={finishWorkout} className="forge-button bg-forge-success hover:bg-forge-success/90">
                  <Check className="w-4 h-4 mr-2" />
                  Finish
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Rest Timer */}
        {restActive && (
          <div className="bg-forge-warning/10 border border-forge-warning/20 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-forge-warning font-semibold">Rest Time</span>
              <span className="text-2xl font-bold text-forge-warning">{formatTime(restTime)}</span>
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
                  // Clear rest data from session
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
      </div>

      {/* Exercises */}
      <div className="space-y-6">
        {workout.exercises.map((exercise, exerciseIndex) => (
          <div key={exerciseIndex} className="forge-card">
            <h3 className="font-semibold text-lg mb-2">{exercise.name}</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {exercise.sets} sets × {exercise.reps}
            </p>
            {exercise.notes && (
              <p className="text-xs text-muted-foreground bg-muted p-2 rounded mb-4">
                💡 {exercise.notes}
              </p>
            )}

            {/* Sets */}
            <div className="space-y-3">
              {Array(exercise.sets).fill(null).map((_, setIndex) => {
                const setData = currentSession?.sets[exerciseIndex]?.[setIndex];
                const isCompleted = setData?.completed || false;
                
                return (
                  <div 
                    key={setIndex} 
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isCompleted 
                        ? 'bg-forge-success/10 border-forge-success/20' 
                        : 'bg-muted/30 border-border'
                    }`}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSetCompletion(exerciseIndex, setIndex)}
                      className={`w-8 h-8 p-0 ${
                        isCompleted 
                          ? 'bg-forge-success text-white border-forge-success' 
                          : ''
                      }`}
                      disabled={!workoutStarted}
                    >
                      {isCompleted && <Check className="w-4 h-4" />}
                    </Button>
                    
                    <span className="font-medium">Set {setIndex + 1}</span>
                    
                    <Input
                      placeholder="Weight (e.g., Double 40s)"
                      value={setData?.weight || ''}
                      onChange={(e) => updateSetWeight(exerciseIndex, setIndex, e.target.value)}
                      className="flex-1 forge-input"
                      disabled={!workoutStarted}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Workout Notes */}
      {workoutStarted && (
        <div className="forge-card mt-6">
          <h3 className="font-semibold mb-3">Workout Notes</h3>
          <Textarea
            placeholder="How did this workout feel? Any observations or achievements?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="forge-input"
            rows={3}
          />
        </div>
      )}

      {/* Quick Workout Selection */}
      <div className="forge-card mt-6">
        <h3 className="font-semibold mb-3">Other Workouts</h3>
        <div className="flex gap-2">
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
      </div>
    </div>
  );
};

export default WorkoutPage;
