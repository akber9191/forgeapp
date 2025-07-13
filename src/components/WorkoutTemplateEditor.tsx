import React, { useState, useEffect } from 'react';
import { 
  WorkoutTemplate, 
  WorkoutExercise, 
  Exercise,
  EquipmentType,
  DifficultyLevel,
  exerciseDatabase
} from '@/data/exerciseDatabase';
import { exerciseAPI } from '@/utils/exerciseApi';
import ExerciseCard from '@/components/ExerciseCard';
import ExerciseDetail from '@/components/ExerciseDetail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Save, 
  ArrowUp, 
  ArrowDown,
  Clock,
  Target,
  BarChart3,
  GripVertical,
  X,
  CheckCircle2,
  AlertCircle,
  Dumbbell,
  Link,
  Unlink,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface WorkoutTemplateEditorProps {
  template?: WorkoutTemplate;
  onSave: (template: WorkoutTemplate) => void;
  onCancel: () => void;
  className?: string;
}

interface ExerciseSelectionState {
  isOpen: boolean;
  selectedExercises: Set<string>;
  searchTerm: string;
  availableExercises: Exercise[];
}

export const WorkoutTemplateEditor: React.FC<WorkoutTemplateEditorProps> = ({
  template,
  onSave,
  onCancel,
  className
}) => {
  const [workoutData, setWorkoutData] = useState<Partial<WorkoutTemplate>>({
    name: '',
    description: '',
    category: 'strength',
    difficulty: 'intermediate',
    estimatedDuration: 45,
    equipment: [],
    exercises: [],
    tags: [],
    isCustom: true,
    ...template
  });

  const [exerciseSelection, setExerciseSelection] = useState<ExerciseSelectionState>({
    isOpen: false,
    selectedExercises: new Set(),
    searchTerm: '',
    availableExercises: []
  });

  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<Exercise | null>(null);
  const [editingExercise, setEditingExercise] = useState<WorkoutExercise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedForSuperset, setSelectedForSuperset] = useState<Set<string>>(new Set());

  const { toast } = useToast();

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    // Update equipment list based on selected exercises
    updateEquipmentList();
  }, [workoutData.exercises]);

  const loadExercises = async () => {
    try {
      setIsLoading(true);
      await exerciseDatabase.loadExercises();
      
      // Load cached API exercises
      const cachedExercises = exerciseAPI.loadCachedExercises();
      const localResults = exerciseDatabase.searchExercises();
      const allExercises = [...localResults.exercises, ...cachedExercises];
      
      setExerciseSelection(prev => ({
        ...prev,
        availableExercises: removeDuplicateExercises(allExercises)
      }));
    } catch (error) {
      console.error('Failed to load exercises:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load exercise library.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeDuplicateExercises = (exercises: Exercise[]): Exercise[] => {
    const seen = new Set<string>();
    return exercises.filter(exercise => {
      const key = `${exercise.name.toLowerCase()}_${exercise.equipment.join(',')}_${exercise.primaryMuscles.join(',')}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const updateEquipmentList = () => {
    if (!workoutData.exercises?.length) return;

    const exerciseIds = workoutData.exercises.map(ex => ex.exerciseId);
    const exercises = exerciseDatabase.getExercisesByIds(exerciseIds);
    const equipment = [...new Set(exercises.flatMap(ex => ex.equipment))];
    
    setWorkoutData(prev => ({
      ...prev,
      equipment: equipment as EquipmentType[]
    }));
  };

  const handleInputChange = (field: keyof WorkoutTemplate, value: any) => {
    setWorkoutData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddExercises = () => {
    setExerciseSelection(prev => ({
      ...prev,
      isOpen: true
    }));
  };

  const handleSelectExercise = (exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      exerciseId: exercise.id,
      order: (workoutData.exercises?.length || 0) + 1,
      targetSets: 3,
      targetReps: exercise.recommendedReps || '8-12',
      restTime: 90,
      notes: ''
    };

    setWorkoutData(prev => ({
      ...prev,
      exercises: [...(prev.exercises || []), newExercise]
    }));

    setExerciseSelection(prev => ({
      ...prev,
      selectedExercises: new Set([...prev.selectedExercises, exercise.id])
    }));
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setWorkoutData(prev => ({
      ...prev,
      exercises: prev.exercises?.filter(ex => ex.exerciseId !== exerciseId) || []
    }));

    setExerciseSelection(prev => ({
      ...prev,
      selectedExercises: new Set([...prev.selectedExercises].filter(id => id !== exerciseId))
    }));
  };

  const handleEditExercise = (exercise: WorkoutExercise) => {
    setEditingExercise(exercise);
  };

  const handleUpdateExercise = (updatedExercise: WorkoutExercise) => {
    setWorkoutData(prev => ({
      ...prev,
      exercises: prev.exercises?.map(ex => 
        ex.exerciseId === updatedExercise.exerciseId ? updatedExercise : ex
      ) || []
    }));
    setEditingExercise(null);
  };

  const handleMoveExercise = (exerciseId: string, direction: 'up' | 'down') => {
    if (!workoutData.exercises) return;

    const exercises = [...workoutData.exercises];
    const index = exercises.findIndex(ex => ex.exerciseId === exerciseId);
    
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === exercises.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [exercises[index], exercises[targetIndex]] = [exercises[targetIndex], exercises[index]];
    
    // Update order numbers
    exercises.forEach((ex, idx) => {
      ex.order = idx + 1;
    });

    setWorkoutData(prev => ({
      ...prev,
      exercises
    }));
  };

  const createSuperset = (exerciseIds: string[]) => {
    if (exerciseIds.length < 2) return;
    
    const supersetId = `superset_${Date.now()}`;
    const exercises = workoutData.exercises?.map(ex => {
      if (exerciseIds.includes(ex.exerciseId)) {
        return {
          ...ex,
          isSuperset: true,
          supersetGroup: supersetId
        };
      }
      return ex;
    }) || [];

    setWorkoutData(prev => ({
      ...prev,
      exercises
    }));

    toast({
      title: "Superset Created",
      description: `${exerciseIds.length} exercises grouped into superset.`,
    });
  };

  const removeFromSuperset = (exerciseId: string) => {
    const exercises = workoutData.exercises?.map(ex => {
      if (ex.exerciseId === exerciseId) {
        return {
          ...ex,
          isSuperset: false,
          supersetGroup: undefined
        };
      }
      return ex;
    }) || [];

    setWorkoutData(prev => ({
      ...prev,
      exercises
    }));

    toast({
      title: "Removed from Superset",
      description: "Exercise removed from superset group.",
    });
  };

  const breakSuperset = (supersetGroup: string) => {
    const exercises = workoutData.exercises?.map(ex => {
      if (ex.supersetGroup === supersetGroup) {
        return {
          ...ex,
          isSuperset: false,
          supersetGroup: undefined
        };
      }
      return ex;
    }) || [];

    setWorkoutData(prev => ({
      ...prev,
      exercises
    }));

    toast({
      title: "Superset Broken",
      description: "All exercises removed from superset group.",
    });
  };

  const handleSave = () => {
    if (!workoutData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a workout name.",
        variant: "destructive",
      });
      return;
    }

    if (!workoutData.exercises?.length) {
      toast({
        title: "Validation Error",
        description: "Please add at least one exercise to the workout.",
        variant: "destructive",
      });
      return;
    }

    const finalTemplate: WorkoutTemplate = {
      id: template?.id || `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: workoutData.name!,
      description: workoutData.description,
      category: workoutData.category as any,
      difficulty: workoutData.difficulty as DifficultyLevel,
      estimatedDuration: workoutData.estimatedDuration || 45,
      equipment: workoutData.equipment || [],
      exercises: workoutData.exercises || [],
      tags: workoutData.tags || [],
      isCustom: true,
      createdAt: template?.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    onSave(finalTemplate);
  };

  const filteredExercises = exerciseSelection.availableExercises.filter(exercise => {
    if (!exerciseSelection.searchTerm) return true;
    const term = exerciseSelection.searchTerm.toLowerCase();
    return exercise.name.toLowerCase().includes(term) ||
           exercise.primaryMuscles.some(muscle => muscle.toLowerCase().includes(term)) ||
           exercise.equipment.some(eq => eq.toLowerCase().includes(term));
  });

  const getExerciseById = (id: string): Exercise | undefined => {
    return exerciseSelection.availableExercises.find(ex => ex.id === id);
  };

  const toggleExerciseForSuperset = (exerciseId: string) => {
    setSelectedForSuperset(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  const handleCreateSuperset = () => {
    if (selectedForSuperset.size < 2) {
      toast({
        title: "Invalid Selection",
        description: "Please select at least 2 exercises to create a superset.",
        variant: "destructive",
      });
      return;
    }

    createSuperset(Array.from(selectedForSuperset));
    setSelectedForSuperset(new Set());
  };

  const handleCancelSupersetSelection = () => {
    setSelectedForSuperset(new Set());
  };

  // Group exercises by superset for display
  const groupedExercises = () => {
    if (!workoutData.exercises) return [];
    
    const exercises = [...workoutData.exercises].sort((a, b) => a.order - b.order);
    const groups: Array<{ type: 'single' | 'superset', exercises: WorkoutExercise[], supersetGroup?: string }> = [];
    const processedIds = new Set<string>();

    exercises.forEach(exercise => {
      if (processedIds.has(exercise.exerciseId)) return;

      if (exercise.isSuperset && exercise.supersetGroup) {
        // Find all exercises in this superset
        const supersetExercises = exercises.filter(ex => 
          ex.supersetGroup === exercise.supersetGroup
        );
        
        groups.push({
          type: 'superset',
          exercises: supersetExercises,
          supersetGroup: exercise.supersetGroup
        });

        // Mark all superset exercises as processed
        supersetExercises.forEach(ex => processedIds.add(ex.exerciseId));
      } else {
        groups.push({
          type: 'single',
          exercises: [exercise]
        });
        processedIds.add(exercise.exerciseId);
      }
    });

    return groups;
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-xl font-bold">
          {template ? 'Edit Workout Template' : 'Create New Workout'}
        </h2>
        <p className="text-gray-600">
          Design your custom workout by selecting exercises and setting parameters.
        </p>
      </div>

      <div className="flex-1 flex">
        {/* Main Editor */}
        <div className="flex-1 p-4 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Workout Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Workout Name *</label>
                  <Input
                    value={workoutData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Push Day, Full Body Strength"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={workoutData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strength">Strength</SelectItem>
                      <SelectItem value="hypertrophy">Hypertrophy</SelectItem>
                      <SelectItem value="conditioning">Conditioning</SelectItem>
                      <SelectItem value="mobility">Mobility</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select
                    value={workoutData.difficulty}
                    onValueChange={(value) => handleInputChange('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Estimated Duration (minutes)</label>
                  <Input
                    type="number"
                    value={workoutData.estimatedDuration || ''}
                    onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value) || 0)}
                    min="15"
                    max="180"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={workoutData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the workout goals, focus areas, or any special notes..."
                  rows={3}
                />
              </div>
              
              {/* Equipment Display */}
              {workoutData.equipment && workoutData.equipment.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Required Equipment</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {workoutData.equipment.map((eq, index) => (
                      <Badge key={index} variant="outline">
                        {eq.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exercise List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Exercises ({workoutData.exercises?.length || 0})</CardTitle>
                <Button onClick={handleAddExercises}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercises
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {workoutData.exercises && workoutData.exercises.length > 0 ? (
                <div className="space-y-4">
                  {/* Superset Creation Controls */}
                  {selectedForSuperset.size > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            {selectedForSuperset.size} exercises selected for superset
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelSupersetSelection}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleCreateSuperset}
                            disabled={selectedForSuperset.size < 2}
                          >
                            <Link className="w-4 h-4 mr-1" />
                            Create Superset
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {groupedExercises().map((group, groupIndex) => (
                    <div key={groupIndex}>
                      {group.type === 'superset' ? (
                        /* Superset Group */
                        <div className="border-2 border-orange-200 rounded-lg bg-orange-50">
                          {/* Superset Header */}
                          <div className="flex items-center justify-between p-3 border-b border-orange-200 bg-orange-100 rounded-t-lg">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-orange-600" />
                              <span className="text-sm font-medium text-orange-800">
                                Superset - {group.exercises.length} exercises
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => breakSuperset(group.supersetGroup!)}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <Unlink className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {/* Superset Exercises */}
                          <div className="p-3 space-y-2">
                            {group.exercises.map((workoutExercise, index) => {
                              const exercise = getExerciseById(workoutExercise.exerciseId);
                              if (!exercise) return null;

                              return (
                                <div key={workoutExercise.exerciseId} className="bg-white border rounded-lg p-3">
                                  <div className="flex items-center gap-4">
                                    {/* Exercise Order */}
                                    <div className="flex items-center">
                                      <span className="text-xs font-medium text-gray-500 bg-orange-100 px-2 py-1 rounded">
                                        {String.fromCharCode(65 + index)}
                                      </span>
                                    </div>

                                    {/* Exercise Info */}
                                    <div className="flex-1">
                                      <h4 className="font-semibold">{exercise.name}</h4>
                                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                        <div className="flex items-center gap-1">
                                          <BarChart3 className="w-3 h-3" />
                                          {workoutExercise.targetSets} sets
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Target className="w-3 h-3" />
                                          {workoutExercise.targetReps} reps
                                        </div>
                                        {workoutExercise.restTime && (
                                          <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {workoutExercise.restTime}s rest
                                          </div>
                                        )}
                                      </div>
                                      {workoutExercise.notes && (
                                        <p className="text-sm text-gray-600 mt-1">
                                          {workoutExercise.notes}
                                        </p>
                                      )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedExerciseDetail(exercise)}
                                      >
                                        <Dumbbell className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditExercise(workoutExercise)}
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFromSuperset(workoutExercise.exerciseId)}
                                        className="text-orange-600 hover:text-orange-700"
                                      >
                                        <Unlink className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveExercise(workoutExercise.exerciseId)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        /* Single Exercise */
                        group.exercises.map((workoutExercise) => {
                          const exercise = getExerciseById(workoutExercise.exerciseId);
                          if (!exercise) return null;

                          const isSelectedForSuperset = selectedForSuperset.has(workoutExercise.exerciseId);

                          return (
                            <div 
                              key={workoutExercise.exerciseId} 
                              className={cn(
                                "border rounded-lg p-4 transition-all",
                                isSelectedForSuperset && "border-blue-300 bg-blue-50"
                              )}
                            >
                              <div className="flex items-center gap-4">
                                {/* Superset Selection Checkbox */}
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelectedForSuperset}
                                    onChange={() => toggleExerciseForSuperset(workoutExercise.exerciseId)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                </div>

                                {/* Exercise Order & Move Controls */}
                                <div className="flex flex-col items-center">
                                  <span className="text-sm font-medium text-gray-500">
                                    #{workoutExercise.order}
                                  </span>
                                  <div className="flex flex-col gap-1 mt-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleMoveExercise(workoutExercise.exerciseId, 'up')}
                                      className="h-6 w-6 p-0"
                                      disabled={workoutExercise.order === 1}
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleMoveExercise(workoutExercise.exerciseId, 'down')}
                                      className="h-6 w-6 p-0"
                                      disabled={workoutExercise.order === workoutData.exercises!.length}
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Exercise Info */}
                                <div className="flex-1">
                                  <h4 className="font-semibold">{exercise.name}</h4>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                    <div className="flex items-center gap-1">
                                      <BarChart3 className="w-3 h-3" />
                                      {workoutExercise.targetSets} sets
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Target className="w-3 h-3" />
                                      {workoutExercise.targetReps} reps
                                    </div>
                                    {workoutExercise.restTime && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {workoutExercise.restTime}s rest
                                      </div>
                                    )}
                                  </div>
                                  {workoutExercise.notes && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      {workoutExercise.notes}
                                    </p>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedExerciseDetail(exercise)}
                                  >
                                    <Dumbbell className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditExercise(workoutExercise)}
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveExercise(workoutExercise.exerciseId)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No exercises added yet</p>
                  <p className="text-sm">Click "Add Exercises" to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="border-l p-4 w-64 space-y-4">
          <div className="space-y-2">
            <Button onClick={handleSave} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Workout
            </Button>
            <Button variant="outline" onClick={onCancel} className="w-full">
              Cancel
            </Button>
          </div>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Workout Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Exercises:</span>
                <span>{workoutData.exercises?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{workoutData.estimatedDuration || 0} min</span>
              </div>
              <div className="flex justify-between">
                <span>Equipment:</span>
                <span>{workoutData.equipment?.length || 0} types</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Exercise Selection Dialog */}
      <Dialog 
        open={exerciseSelection.isOpen} 
        onOpenChange={(open) => setExerciseSelection(prev => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Exercises</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col h-full">
            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search exercises..."
                  value={exerciseSelection.searchTerm}
                  onChange={(e) => setExerciseSelection(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Exercise Grid */}
            <ScrollArea className="flex-1 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onSelect={handleSelectExercise}
                    onViewDetails={setSelectedExerciseDetail}
                    isSelected={exerciseSelection.selectedExercises.has(exercise.id)}
                    compact={true}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exercise Detail Dialog */}
      <Dialog 
        open={!!selectedExerciseDetail} 
        onOpenChange={(open) => !open && setSelectedExerciseDetail(null)}
      >
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          {selectedExerciseDetail && (
            <ExerciseDetail
              exercise={selectedExerciseDetail}
              onClose={() => setSelectedExerciseDetail(null)}
              onAddToWorkout={handleSelectExercise}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Exercise Edit Dialog */}
      {editingExercise && (
        <Dialog open={!!editingExercise} onOpenChange={(open) => !open && setEditingExercise(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Exercise Parameters</DialogTitle>
            </DialogHeader>
            <ExerciseParameterEditor
              exercise={editingExercise}
              onSave={handleUpdateExercise}
              onCancel={() => setEditingExercise(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Exercise Parameter Editor Component
interface ExerciseParameterEditorProps {
  exercise: WorkoutExercise;
  onSave: (exercise: WorkoutExercise) => void;
  onCancel: () => void;
}

const ExerciseParameterEditor: React.FC<ExerciseParameterEditorProps> = ({
  exercise,
  onSave,
  onCancel
}) => {
  const [params, setParams] = useState(exercise);

  const handleSave = () => {
    onSave(params);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Sets</label>
          <Input
            type="number"
            value={params.targetSets}
            onChange={(e) => setParams(prev => ({ ...prev, targetSets: parseInt(e.target.value) || 1 }))}
            min="1"
            max="20"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Reps</label>
          <Input
            value={params.targetReps}
            onChange={(e) => setParams(prev => ({ ...prev, targetReps: e.target.value }))}
            placeholder="e.g., 8-12, 15, AMRAP"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Rest (seconds)</label>
          <Input
            type="number"
            value={params.restTime || ''}
            onChange={(e) => setParams(prev => ({ ...prev, restTime: parseInt(e.target.value) || undefined }))}
            min="15"
            max="600"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Target Weight</label>
          <Input
            value={params.targetWeight || ''}
            onChange={(e) => setParams(prev => ({ ...prev, targetWeight: e.target.value }))}
            placeholder="e.g., 50% 1RM, bodyweight"
          />
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium">Notes</label>
        <Textarea
          value={params.notes || ''}
          onChange={(e) => setParams(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional instructions or notes..."
          rows={3}
        />
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default WorkoutTemplateEditor;