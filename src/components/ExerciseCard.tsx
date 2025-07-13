import React, { useState } from 'react';
import { Exercise, EquipmentType, MuscleGroup } from '@/data/exerciseDatabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Info, 
  Target, 
  Clock, 
  BarChart3,
  Dumbbell,
  Heart,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect?: (exercise: Exercise) => void;
  onViewDetails?: (exercise: Exercise) => void;
  isSelected?: boolean;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

// Equipment type icons
const equipmentIcons: Record<EquipmentType, React.ReactNode> = {
  kettlebell: <Dumbbell className="w-3 h-3" />,
  barbell: <BarChart3 className="w-3 h-3" />,
  dumbbell: <Dumbbell className="w-3 h-3" />,
  bodyweight: <Heart className="w-3 h-3" />,
  cable: <Target className="w-3 h-3" />,
  resistance_band: <Target className="w-3 h-3" />,
  medicine_ball: <Target className="w-3 h-3" />,
  stability_ball: <Target className="w-3 h-3" />,
  suspension_trainer: <Target className="w-3 h-3" />,
  pull_up_bar: <BarChart3 className="w-3 h-3" />,
  parallette: <Target className="w-3 h-3" />,
  foam_roller: <Target className="w-3 h-3" />,
  bosu_ball: <Target className="w-3 h-3" />,
  none: <Heart className="w-3 h-3" />
};

// Difficulty colors
const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  advanced: 'bg-red-100 text-red-800 border-red-200'
};

// Category colors
const categoryColors = {
  strength: 'bg-blue-100 text-blue-800',
  cardio: 'bg-red-100 text-red-800',
  flexibility: 'bg-purple-100 text-purple-800',
  plyometric: 'bg-orange-100 text-orange-800',
  powerlifting: 'bg-gray-100 text-gray-800',
  olympic: 'bg-yellow-100 text-yellow-800',
  stretching: 'bg-green-100 text-green-800'
};

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onSelect,
  onViewDetails,
  isSelected = false,
  showActions = true,
  compact = false,
  className
}) => {
  const [isGifPlaying, setIsGifPlaying] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleSelect = () => {
    onSelect?.(exercise);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails?.(exercise);
  };

  const toggleGif = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGifPlaying(!isGifPlaying);
  };

  // Check if the image is a GIF
  const isGif = exercise.gifUrl && (
    exercise.gifUrl.toLowerCase().includes('.gif') || 
    exercise.source === 'curated' ||
    exercise.source === 'exercisedb_api'
  );

  // Handle media loading states
  const handleMediaLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleMediaError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const formatMuscleGroups = (muscles: MuscleGroup[]): string => {
    return muscles
      .map(muscle => muscle.replace('_', ' '))
      .map(muscle => muscle.charAt(0).toUpperCase() + muscle.slice(1))
      .join(', ');
  };

  const formatEquipment = (equipment: EquipmentType[]): string => {
    return equipment
      .map(eq => eq.replace('_', ' '))
      .map(eq => eq.charAt(0).toUpperCase() + eq.slice(1))
      .join(', ');
  };

  return (
    <Card 
      className={cn(
        'transition-all duration-200 hover:shadow-lg cursor-pointer',
        isSelected && 'ring-2 ring-primary border-primary',
        compact ? 'p-3' : 'p-4',
        className
      )}
      onClick={handleSelect}
    >
      {/* Exercise Media (GIF/Video/Image) */}
      <div className={cn(
        'relative rounded-lg overflow-hidden bg-gray-100 mb-3',
        compact ? 'h-24' : 'h-32'
      )}>
        {exercise.gifUrl && !imageError ? (
          <div className="relative w-full h-full">
            {/* Loading state */}
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-gray-500">Loading...</p>
                </div>
              </div>
            )}
            
            {/* Image element for GIF/static images */}
            <img
              src={exercise.gifUrl}
              alt={`${exercise.name} demonstration`}
              className="w-full h-full object-cover"
              onLoad={handleMediaLoad}
              onError={handleMediaError}
              loading="lazy"
            />
            
            {/* Media indicator and controls */}
            {isGif && !imageLoading && (
              <>
                {/* GIF Badge */}
                <div className="absolute top-2 left-2">
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-black bg-opacity-70 text-white border-none"
                  >
                    GIF
                  </Badge>
                </div>
                
                {/* GIF Play/Pause Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleGif}
                    className="opacity-0 hover:opacity-100 transition-opacity bg-white bg-opacity-80 hover:bg-opacity-100"
                  >
                    {isGifPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </>
            )}
            
            {/* Exercise source indicator */}
            {exercise.source === 'curated' && !imageLoading && (
              <div className="absolute bottom-2 right-2">
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-green-600 text-white border-none"
                >
                  ✓ Verified
                </Badge>
              </div>
            )}
          </div>
        ) : (
          /* Fallback placeholder with exercise-specific icon */
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              {exercise.equipment.includes('kettlebell') ? (
                <div className="w-8 h-8 text-gray-400 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-2xl">🏋️</span>
                </div>
              ) : exercise.equipment.includes('bodyweight') ? (
                <Heart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              ) : (
                <Dumbbell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              )}
              <p className="text-xs text-gray-500">
                {imageError ? 'Media unavailable' : 'No preview'}
              </p>
            </div>
          </div>
        )}

        {/* Difficulty Badge */}
        <div className="absolute top-2 right-2">
          <Badge 
            variant="secondary" 
            className={cn('text-xs', difficultyColors[exercise.difficulty])}
          >
            {exercise.difficulty}
          </Badge>
        </div>
      </div>

      <CardHeader className={cn('p-0', compact ? 'mb-2' : 'mb-3')}>
        <CardTitle className={cn(
          'font-semibold leading-tight',
          compact ? 'text-sm' : 'text-base'
        )}>
          {exercise.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 space-y-2">
        {/* Category and Equipment */}
        <div className="flex flex-wrap gap-1">
          <Badge 
            variant="outline" 
            className={cn('text-xs', categoryColors[exercise.category])}
          >
            {exercise.category}
          </Badge>
          
          {exercise.equipment.slice(0, 2).map((eq, index) => (
            <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
              {equipmentIcons[eq]}
              {eq.replace('_', ' ')}
            </Badge>
          ))}
          
          {exercise.equipment.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{exercise.equipment.length - 2}
            </Badge>
          )}
        </div>

        {/* Primary Muscles */}
        {!compact && exercise.primaryMuscles.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Target className="w-3 h-3" />
            <span>{formatMuscleGroups(exercise.primaryMuscles.slice(0, 2))}</span>
            {exercise.primaryMuscles.length > 2 && (
              <span>+{exercise.primaryMuscles.length - 2}</span>
            )}
          </div>
        )}

        {/* Exercise Stats */}
        {!compact && (exercise.recommendedSets || exercise.recommendedReps) && (
          <div className="flex items-center gap-3 text-xs text-gray-600">
            {exercise.recommendedSets && (
              <div className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                <span>{exercise.recommendedSets} sets</span>
              </div>
            )}
            {exercise.recommendedReps && (
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>{exercise.recommendedReps} reps</span>
              </div>
            )}
          </div>
        )}

        {/* Instructions Preview */}
        {!compact && exercise.instructions.length > 0 && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {exercise.instructions[0]}
          </p>
        )}

        {/* Warning for missing form cues */}
        {exercise.formCues.length === 0 && exercise.safetyTips.length === 0 && (
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="w-3 h-3" />
            <span>Limited guidance available</span>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              className="flex-1 text-xs"
            >
              <Info className="w-3 h-3 mr-1" />
              Details
            </Button>
            
            {onSelect && (
              <Button
                variant={isSelected ? "default" : "secondary"}
                size="sm"
                onClick={handleSelect}
                className="text-xs"
              >
                {isSelected ? 'Selected' : 'Add'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExerciseCard;