import React, { useState, useEffect, useMemo } from 'react';
import { 
  Exercise, 
  ExerciseFilter, 
  ExerciseCategory, 
  EquipmentType, 
  MuscleGroup, 
  DifficultyLevel,
  exerciseDatabase 
} from '@/data/exerciseDatabase';
import { exerciseAPI } from '@/utils/exerciseApi';
import ExerciseCard from '@/components/ExerciseCard';
import ExerciseDetail from '@/components/ExerciseDetail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  X, 
  Dumbbell, 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const ExerciseLibrary: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<ExerciseFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  // Load exercises on component mount
  useEffect(() => {
    loadExercises();
  }, []);

  // Filter exercises when search term or filters change
  useEffect(() => {
    applyFilters();
  }, [exercises, searchTerm, activeFilters]);

  const loadExercises = async () => {
    try {
      setIsLoading(true);
      
      // Load local exercises first
      await exerciseDatabase.loadExercises();
      
      // Try to load from API cache
      const cachedExercises = exerciseAPI.loadCachedExercises();
      
      if (cachedExercises.length > 0) {
        // Merge local and cached exercises
        const localResults = exerciseDatabase.searchExercises();
        const allExercises = [...localResults.exercises, ...cachedExercises];
        setExercises(removeDuplicateExercises(allExercises));
      } else {
        // Load from API in background
        loadFromAPI();
        // Show local exercises for now
        const localResults = exerciseDatabase.searchExercises();
        setExercises(localResults.exercises);
      }
    } catch (error) {
      console.error('Failed to load exercises:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load exercise library. Showing local exercises only.",
        variant: "destructive",
      });
      
      // Fallback to local exercises
      const localResults = exerciseDatabase.searchExercises();
      setExercises(localResults.exercises);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromAPI = async () => {
    try {
      setIsRefreshing(true);
      const apiExercises = await exerciseAPI.loadAllExercises();
      
      if (apiExercises.length > 0) {
        const localResults = exerciseDatabase.searchExercises();
        const allExercises = [...localResults.exercises, ...apiExercises];
        setExercises(removeDuplicateExercises(allExercises));
        
        toast({
          title: "Library Updated",
          description: `Loaded ${apiExercises.length} additional exercises from database.`,
        });
      }
    } catch (error) {
      console.error('Failed to refresh exercises:', error);
      toast({
        title: "Refresh Failed",
        description: "Unable to fetch latest exercises. Using cached data.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const removeDuplicateExercises = (exercises: Exercise[]): Exercise[] => {
    const seen = new Set<string>();
    const uniqueExercises: Exercise[] = [];
    
    for (const exercise of exercises) {
      const key = `${exercise.name.toLowerCase()}_${exercise.equipment.join(',')}_${exercise.primaryMuscles.join(',')}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueExercises.push(exercise);
      }
    }
    
    return uniqueExercises;
  };

  const applyFilters = () => {
    let filtered = exercises;

    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(term) ||
        exercise.alternativeNames.some(name => name.toLowerCase().includes(term)) ||
        exercise.tags.some(tag => tag.toLowerCase().includes(term)) ||
        exercise.primaryMuscles.some(muscle => muscle.toLowerCase().includes(term)) ||
        exercise.equipment.some(eq => eq.toLowerCase().includes(term))
      );
    }

    // Apply category filter
    if (activeFilters.category?.length) {
      filtered = filtered.filter(ex => activeFilters.category!.includes(ex.category));
    }

    // Apply equipment filter
    if (activeFilters.equipment?.length) {
      filtered = filtered.filter(ex => 
        ex.equipment.some(eq => activeFilters.equipment!.includes(eq))
      );
    }

    // Apply muscle group filter
    if (activeFilters.primaryMuscles?.length) {
      filtered = filtered.filter(ex => 
        ex.primaryMuscles.some(muscle => activeFilters.primaryMuscles!.includes(muscle))
      );
    }

    // Apply difficulty filter
    if (activeFilters.difficulty?.length) {
      filtered = filtered.filter(ex => activeFilters.difficulty!.includes(ex.difficulty));
    }

    // Filter by GIF availability
    if (activeFilters.hasGif) {
      filtered = filtered.filter(ex => ex.gifUrl);
    }

    setFilteredExercises(filtered);
  };

  const handleFilterChange = (filterType: keyof ExerciseFilter, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
  };

  const handleViewDetails = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailOpen(false);
    setSelectedExercise(null);
  };

  const handleAddToWorkout = (exercise: Exercise) => {
    const newSelected = new Set(selectedExercises);
    if (newSelected.has(exercise.id)) {
      newSelected.delete(exercise.id);
      toast({
        title: "Removed from Selection",
        description: `${exercise.name} removed from workout selection.`,
      });
    } else {
      newSelected.add(exercise.id);
      toast({
        title: "Added to Selection",
        description: `${exercise.name} added to workout selection.`,
      });
    }
    setSelectedExercises(newSelected);
  };

  const handleCreateWorkoutFromSelection = () => {
    if (selectedExercises.size === 0) {
      toast({
        title: "No Exercises Selected",
        description: "Please select exercises to create a workout.",
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to template creation with selected exercises
    const selectedIds = Array.from(selectedExercises).join(',');
    window.location.href = `/templates?exercises=${selectedIds}`;
  };

  const clearSelection = () => {
    setSelectedExercises(new Set());
    toast({
      title: "Selection Cleared",
      description: "All exercises have been removed from selection.",
    });
  };

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const categories = [...new Set(exercises.map(ex => ex.category))];
    const equipment = [...new Set(exercises.flatMap(ex => ex.equipment))];
    const muscles = [...new Set(exercises.flatMap(ex => ex.primaryMuscles))];
    const difficulties = [...new Set(exercises.map(ex => ex.difficulty))];

    return { categories, equipment, muscles, difficulties };
  }, [exercises]);

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading exercise library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Exercise Library</h1>
              <p className="text-gray-600">
                {filteredExercises.length} of {exercises.length} exercises
                {selectedExercises.size > 0 && (
                  <span className="ml-2 text-primary font-medium">
                    • {selectedExercises.size} selected
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex gap-2">
              {selectedExercises.size > 0 && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleCreateWorkoutFromSelection}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Workout ({selectedExercises.size})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                  >
                    Clear
                  </Button>
                </>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadFromAPI()}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(activeFilterCount > 0 && "bg-primary text-primary-foreground")}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search exercises, muscles, equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Active Filters */}
          {(activeFilterCount > 0 || searchTerm) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Active filters:</span>
              
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchTerm}"
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm('')} />
                </Badge>
              )}
              
              {activeFilters.category?.map(cat => (
                <Badge key={cat} variant="secondary" className="flex items-center gap-1">
                  {cat}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleFilterChange('category', 
                      activeFilters.category?.filter(c => c !== cat)
                    )} 
                  />
                </Badge>
              ))}
              
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="border-t bg-gray-50/50 p-4">
            <Tabs defaultValue="equipment" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
                <TabsTrigger value="muscles">Muscles</TabsTrigger>
                <TabsTrigger value="category">Category</TabsTrigger>
                <TabsTrigger value="difficulty">Difficulty</TabsTrigger>
              </TabsList>

              <TabsContent value="equipment" className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {filterOptions.equipment.map(eq => (
                    <Badge
                      key={eq}
                      variant={activeFilters.equipment?.includes(eq) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const current = activeFilters.equipment || [];
                        const updated = current.includes(eq)
                          ? current.filter(e => e !== eq)
                          : [...current, eq];
                        handleFilterChange('equipment', updated.length > 0 ? updated : undefined);
                      }}
                    >
                      {eq.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="muscles" className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {filterOptions.muscles.map(muscle => (
                    <Badge
                      key={muscle}
                      variant={activeFilters.primaryMuscles?.includes(muscle) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const current = activeFilters.primaryMuscles || [];
                        const updated = current.includes(muscle)
                          ? current.filter(m => m !== muscle)
                          : [...current, muscle];
                        handleFilterChange('primaryMuscles', updated.length > 0 ? updated : undefined);
                      }}
                    >
                      {muscle.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="category" className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {filterOptions.categories.map(category => (
                    <Badge
                      key={category}
                      variant={activeFilters.category?.includes(category) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const current = activeFilters.category || [];
                        const updated = current.includes(category)
                          ? current.filter(c => c !== category)
                          : [...current, category];
                        handleFilterChange('category', updated.length > 0 ? updated : undefined);
                      }}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="difficulty" className="mt-4">
                <div className="flex gap-2 mb-4">
                  {filterOptions.difficulties.map(difficulty => (
                    <Badge
                      key={difficulty}
                      variant={activeFilters.difficulty?.includes(difficulty) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const current = activeFilters.difficulty || [];
                        const updated = current.includes(difficulty)
                          ? current.filter(d => d !== difficulty)
                          : [...current, difficulty];
                        handleFilterChange('difficulty', updated.length > 0 ? updated : undefined);
                      }}
                    >
                      {difficulty}
                    </Badge>
                  ))}
                </div>
                
                {/* Special filters */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="has-gif"
                      checked={activeFilters.hasGif || false}
                      onChange={(e) => handleFilterChange('hasGif', e.target.checked || undefined)}
                      className="rounded"
                    />
                    <label htmlFor="has-gif" className="text-sm cursor-pointer">
                      Show only exercises with GIF demonstrations
                    </label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Exercise Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredExercises.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredExercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onViewDetails={handleViewDetails}
                  onSelect={handleAddToWorkout}
                  isSelected={selectedExercises.has(exercise.id)}
                  showActions={true}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No exercises found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search terms or filters to find more exercises.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Exercise Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          {selectedExercise && (
            <ExerciseDetail
              exercise={selectedExercise}
              onClose={handleCloseDetails}
              onAddToWorkout={handleAddToWorkout}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExerciseLibrary;