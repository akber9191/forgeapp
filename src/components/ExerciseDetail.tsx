import React, { useState } from 'react';
import { Exercise, MuscleGroup, EquipmentType } from '@/data/exerciseDatabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Target, 
  Dumbbell, 
  Clock, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Lightbulb,
  Shield,
  Play,
  Pause,
  ArrowLeft,
  Heart,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExerciseDetailProps {
  exercise: Exercise;
  onClose?: () => void;
  onAddToWorkout?: (exercise: Exercise) => void;
  className?: string;
}

// Muscle group colors for visual distinction
const muscleColors: Record<MuscleGroup, string> = {
  chest: 'bg-red-100 text-red-800',
  back: 'bg-blue-100 text-blue-800',
  shoulders: 'bg-yellow-100 text-yellow-800',
  biceps: 'bg-purple-100 text-purple-800',
  triceps: 'bg-pink-100 text-pink-800',
  forearms: 'bg-gray-100 text-gray-800',
  core: 'bg-orange-100 text-orange-800',
  glutes: 'bg-green-100 text-green-800',
  quadriceps: 'bg-teal-100 text-teal-800',
  hamstrings: 'bg-indigo-100 text-indigo-800',
  calves: 'bg-cyan-100 text-cyan-800',
  full_body: 'bg-violet-100 text-violet-800',
  cardio: 'bg-rose-100 text-rose-800'
};

// Equipment icons mapping
const equipmentIcons: Record<EquipmentType, React.ReactNode> = {
  kettlebell: <Dumbbell className="w-4 h-4" />,
  barbell: <BarChart3 className="w-4 h-4" />,
  dumbbell: <Dumbbell className="w-4 h-4" />,
  bodyweight: <Heart className="w-4 h-4" />,
  cable: <Target className="w-4 h-4" />,
  resistance_band: <Target className="w-4 h-4" />,
  medicine_ball: <Target className="w-4 h-4" />,
  stability_ball: <Target className="w-4 h-4" />,
  suspension_trainer: <Target className="w-4 h-4" />,
  pull_up_bar: <BarChart3 className="w-4 h-4" />,
  parallette: <Target className="w-4 h-4" />,
  foam_roller: <Target className="w-4 h-4" />,
  bosu_ball: <Target className="w-4 h-4" />,
  none: <Heart className="w-4 h-4" />
};

export const ExerciseDetail: React.FC<ExerciseDetailProps> = ({
  exercise,
  onClose,
  onAddToWorkout,
  className
}) => {
  const [isGifPlaying, setIsGifPlaying] = useState(true);
  const [imageError, setImageError] = useState(false);

  const toggleGif = () => {
    setIsGifPlaying(!isGifPlaying);
  };

  const formatMuscleGroup = (muscle: MuscleGroup): string => {
    return muscle.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatEquipment = (equipment: EquipmentType): string => {
    return equipment.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 border-green-200',
      intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      advanced: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[difficulty as keyof typeof colors] || colors.intermediate;
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold">{exercise.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getDifficultyColor(exercise.difficulty)}>
                {exercise.difficulty}
              </Badge>
              <Badge variant="outline">
                {exercise.category.replace(/([A-Z])/g, ' $1').trim()}
              </Badge>
            </div>
          </div>
        </div>
        
        {onAddToWorkout && (
          <Button onClick={() => onAddToWorkout(exercise)}>
            <Dumbbell className="w-4 h-4 mr-2" />
            Add to Workout
          </Button>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Exercise Demonstration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Exercise Demonstration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative rounded-lg overflow-hidden bg-gray-100 h-64 mb-4">
                {exercise.gifUrl && !imageError ? (
                  <div className="relative w-full h-full">
                    <img
                      src={exercise.gifUrl}
                      alt={`${exercise.name} demonstration`}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                    
                    {/* GIF Controls */}
                    <div className="absolute bottom-4 right-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={toggleGif}
                        className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
                      >
                        {isGifPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="text-center">
                      <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">No visual demonstration available</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Follow the written instructions below
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Exercise Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                {exercise.recommendedSets && (
                  <div>
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                      <BarChart3 className="w-4 h-4" />
                      Sets
                    </div>
                    <p className="font-semibold">{exercise.recommendedSets}</p>
                  </div>
                )}
                
                {exercise.recommendedReps && (
                  <div>
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                      <Target className="w-4 h-4" />
                      Reps
                    </div>
                    <p className="font-semibold">{exercise.recommendedReps}</p>
                  </div>
                )}
                
                {exercise.recommendedRest && (
                  <div>
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      Rest
                    </div>
                    <p className="font-semibold">{exercise.recommendedRest}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Exercise Information Tabs */}
          <Tabs defaultValue="instructions" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="form">Form & Safety</TabsTrigger>
              <TabsTrigger value="muscles">Muscles</TabsTrigger>
              <TabsTrigger value="variations">Variations</TabsTrigger>
            </TabsList>

            {/* Instructions Tab */}
            <TabsContent value="instructions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Step-by-Step Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {exercise.instructions.length > 0 ? (
                    <ol className="space-y-3">
                      {exercise.instructions.map((instruction, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <p className="text-gray-700">{instruction}</p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                      <p>No detailed instructions available for this exercise.</p>
                      <p className="text-sm mt-1">Consider consulting a fitness professional.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Form & Safety Tab */}
            <TabsContent value="form" className="space-y-4">
              {/* Form Cues */}
              {exercise.formCues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Form Cues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {exercise.formCues.map((cue, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{cue}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Safety Tips */}
              {exercise.safetyTips.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Safety Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {exercise.safetyTips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Common Mistakes */}
              {exercise.commonMistakes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <XCircle className="w-5 h-5" />
                      Common Mistakes to Avoid
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {exercise.commonMistakes.map((mistake, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* If no form guidance available */}
              {exercise.formCues.length === 0 && exercise.safetyTips.length === 0 && exercise.commonMistakes.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                    <p>Limited form guidance available for this exercise.</p>
                    <p className="text-sm mt-1">Consider consulting a qualified trainer for proper form instruction.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Muscles Tab */}
            <TabsContent value="muscles" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Targeted Muscle Groups
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Primary Muscles */}
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Primary Targets</h4>
                    <div className="flex flex-wrap gap-2">
                      {exercise.primaryMuscles.map((muscle, index) => (
                        <Badge 
                          key={index} 
                          className={muscleColors[muscle]}
                          variant="secondary"
                        >
                          {formatMuscleGroup(muscle)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Secondary Muscles */}
                  {exercise.secondaryMuscles.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Secondary Assistance</h4>
                        <div className="flex flex-wrap gap-2">
                          {exercise.secondaryMuscles.map((muscle, index) => (
                            <Badge 
                              key={index} 
                              variant="outline"
                              className="text-xs"
                            >
                              {formatMuscleGroup(muscle)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Equipment Required */}
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Equipment Required</h4>
                    <div className="flex flex-wrap gap-2">
                      {exercise.equipment.map((eq, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {equipmentIcons[eq]}
                          {formatEquipment(eq)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Variations Tab */}
            <TabsContent value="variations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Exercise Variations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {exercise.variations.length > 0 ? (
                    <div className="space-y-3">
                      {exercise.variations.map((variation, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{variation}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Settings className="w-8 h-8 mx-auto mb-2" />
                      <p>No variations documented for this exercise.</p>
                    </div>
                  )}

                  {/* Difficulty Modifications */}
                  {(exercise.beginnerModification || exercise.advancedVariation) && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-gray-700">Difficulty Modifications</h4>
                        
                        {exercise.beginnerModification && (
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-green-100 text-green-800">Beginner</Badge>
                            </div>
                            <p className="text-sm text-gray-700">{exercise.beginnerModification}</p>
                          </div>
                        )}
                        
                        {exercise.advancedVariation && (
                          <div className="p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-red-100 text-red-800">Advanced</Badge>
                            </div>
                            <p className="text-sm text-gray-700">{exercise.advancedVariation}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ExerciseDetail;