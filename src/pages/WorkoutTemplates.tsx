import React, { useState, useEffect } from 'react';
import { WorkoutTemplate, DifficultyLevel, exerciseDatabase } from '@/data/exerciseDatabase';
import { workoutTemplates as defaultTemplates } from '@/data/workouts';
import WorkoutTemplateEditor from '@/components/WorkoutTemplateEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Copy, 
  Play, 
  Clock, 
  Target, 
  BarChart3,
  Filter,
  Heart,
  Dumbbell,
  Users,
  Star,
  Download,
  Upload,
  MoreVertical,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

// Storage key for custom templates
const CUSTOM_TEMPLATES_KEY = 'forge-custom-workout-templates';

// Category colors
const categoryColors = {
  strength: 'bg-blue-100 text-blue-800',
  hypertrophy: 'bg-purple-100 text-purple-800',
  conditioning: 'bg-red-100 text-red-800',
  mobility: 'bg-green-100 text-green-800',
  mixed: 'bg-orange-100 text-orange-800'
};

// Difficulty colors
const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

interface WorkoutTemplateCardProps {
  template: WorkoutTemplate;
  onEdit: (template: WorkoutTemplate) => void;
  onDelete: (template: WorkoutTemplate) => void;
  onDuplicate: (template: WorkoutTemplate) => void;
  onStartWorkout: (template: WorkoutTemplate) => void;
  onViewDetails: (template: WorkoutTemplate) => void;
  onExport: (template: WorkoutTemplate) => void;
}

const WorkoutTemplateCard: React.FC<WorkoutTemplateCardProps> = ({
  template,
  onEdit,
  onDelete,
  onDuplicate,
  onStartWorkout,
  onViewDetails,
  onExport
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={categoryColors[template.category]}>
                {template.category}
              </Badge>
              <Badge className={difficultyColors[template.difficulty]}>
                {template.difficulty}
              </Badge>
              {!template.isCustom && (
                <Badge variant="outline" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            {template.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {template.description}
              </p>
            )}
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
            
            {showActions && (
              <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    onViewDetails(template);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    onDuplicate(template);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    onExport(template);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                {template.isCustom && (
                  <>
                    <button
                      onClick={() => {
                        onEdit(template);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        onDelete(template);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Workout Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
              <Dumbbell className="w-4 h-4" />
              Exercises
            </div>
            <p className="font-semibold">{template.exercises.length}</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              Duration
            </div>
            <p className="font-semibold">{formatDuration(template.estimatedDuration)}</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
              <Target className="w-4 h-4" />
              Equipment
            </div>
            <p className="font-semibold">{template.equipment.length}</p>
          </div>
        </div>

        {/* Equipment Tags */}
        {template.equipment.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {template.equipment.slice(0, 3).map((eq, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {eq.replace('_', ' ')}
                </Badge>
              ))}
              {template.equipment.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{template.equipment.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={() => onStartWorkout(template)} 
          className="w-full"
        >
          <Play className="w-4 h-4 mr-2" />
          Start Workout
        </Button>
      </CardContent>
    </Card>
  );
};

const WorkoutTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<WorkoutTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [showCustomOnly, setShowCustomOnly] = useState(false);
  
  const [editorState, setEditorState] = useState<{
    isOpen: boolean;
    template?: WorkoutTemplate;
  }>({ isOpen: false });
  
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    template?: WorkoutTemplate;
  }>({ isOpen: false });

  const [templateDetailDialog, setTemplateDetailDialog] = useState<{
    isOpen: boolean;
    template?: WorkoutTemplate;
  }>({ isOpen: false });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [templates, searchTerm, categoryFilter, difficultyFilter, showCustomOnly]);

  const loadTemplates = () => {
    try {
      // Load custom templates from localStorage
      const customTemplatesData = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
      const customTemplates: WorkoutTemplate[] = customTemplatesData 
        ? JSON.parse(customTemplatesData) 
        : [];

      // Convert default templates to new format and merge with custom
      const convertedDefaultTemplates: WorkoutTemplate[] = defaultTemplates.map(template => {
        // For old templates, we'll create placeholder exercise IDs and let the workout page handle the matching
        const templateExercises = template.exercises.map((ex, index) => {
          // Try to find matching exercise in database
          const exerciseResults = exerciseDatabase.searchExercises({
            searchTerm: ex.name
          });
          
          const matchingExercise = exerciseResults.exercises.find(dbEx => 
            dbEx.name.toLowerCase() === ex.name.toLowerCase() ||
            dbEx.alternativeNames.some(alt => alt.toLowerCase() === ex.name.toLowerCase())
          );

          return {
            exerciseId: matchingExercise?.id || `legacy_${ex.name.toLowerCase().replace(/\s+/g, '_')}`,
            order: index + 1,
            targetSets: ex.sets,
            targetReps: ex.reps,
            notes: ex.notes,
            // Store original name for fallback
            originalName: ex.name
          };
        });

        return {
          id: template.id,
          name: template.name,
          description: `${template.exercises.length} exercise kettlebell workout`,
          category: 'strength',
          difficulty: 'intermediate' as DifficultyLevel,
          estimatedDuration: template.exercises.length * 12, // Rough estimate
          equipment: ['kettlebell'], // Default kettlebell workouts
          exercises: templateExercises,
          tags: ['kettlebell', 'strength', 'featured'],
          isCustom: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
      });

      const allTemplates = [...convertedDefaultTemplates, ...customTemplates];
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Failed to load workout templates:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load workout templates.",
        variant: "destructive",
      });
    }
  };

  const saveCustomTemplates = (customTemplates: WorkoutTemplate[]) => {
    try {
      localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(customTemplates));
    } catch (error) {
      console.error('Failed to save custom templates:', error);
      toast({
        title: "Save Error",
        description: "Failed to save workout templates.",
        variant: "destructive",
      });
    }
  };

  const applyFilters = () => {
    let filtered = templates;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(term) ||
        template.description?.toLowerCase().includes(term) ||
        template.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(template => template.category === categoryFilter);
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(template => template.difficulty === difficultyFilter);
    }

    // Custom only filter
    if (showCustomOnly) {
      filtered = filtered.filter(template => template.isCustom);
    }

    setFilteredTemplates(filtered);
  };

  const handleCreateNew = () => {
    setEditorState({ isOpen: true });
  };

  const handleEdit = (template: WorkoutTemplate) => {
    setEditorState({ isOpen: true, template });
  };

  const handleSaveTemplate = (template: WorkoutTemplate) => {
    const customTemplates = templates.filter(t => t.isCustom);
    const existingIndex = customTemplates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      customTemplates[existingIndex] = template;
    } else {
      customTemplates.push(template);
    }

    saveCustomTemplates(customTemplates);
    loadTemplates();
    setEditorState({ isOpen: false });
    
    toast({
      title: "Template Saved",
      description: `"${template.name}" has been saved successfully.`,
    });
  };

  const handleDelete = (template: WorkoutTemplate) => {
    setDeleteDialog({ isOpen: true, template });
  };

  const confirmDelete = () => {
    if (!deleteDialog.template) return;

    const customTemplates = templates
      .filter(t => t.isCustom)
      .filter(t => t.id !== deleteDialog.template!.id);

    saveCustomTemplates(customTemplates);
    loadTemplates();
    setDeleteDialog({ isOpen: false });
    
    toast({
      title: "Template Deleted",
      description: `"${deleteDialog.template.name}" has been deleted.`,
    });
  };

  const handleDuplicate = (template: WorkoutTemplate) => {
    const duplicatedTemplate: WorkoutTemplate = {
      ...template,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${template.name} (Copy)`,
      isCustom: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const customTemplates = [...templates.filter(t => t.isCustom), duplicatedTemplate];
    saveCustomTemplates(customTemplates);
    loadTemplates();
    
    toast({
      title: "Template Duplicated",
      description: `"${duplicatedTemplate.name}" has been created.`,
    });
  };

  const handleStartWorkout = (template: WorkoutTemplate) => {
    // Navigate to workout page with template
    navigate(`/workout/${template.id}`);
  };

  const handleViewDetails = (template: WorkoutTemplate) => {
    setTemplateDetailDialog({ isOpen: true, template });
  };

  const handleExportTemplate = (template: WorkoutTemplate) => {
    try {
      const exportData = {
        template,
        exportedAt: Date.now(),
        exportedBy: 'Forge Workout App',
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Template Exported",
        description: `${template.name} has been exported successfully.`,
      });
    } catch (error) {
      console.error('Failed to export template:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export the template.",
        variant: "destructive",
      });
    }
  };

  const handleExportAllTemplates = () => {
    try {
      const customTemplates = templates.filter(t => t.isCustom);
      
      if (customTemplates.length === 0) {
        toast({
          title: "No Templates to Export",
          description: "You don't have any custom templates to export.",
          variant: "destructive",
        });
        return;
      }

      const exportData = {
        templates: customTemplates,
        exportedAt: Date.now(),
        exportedBy: 'Forge Workout App',
        version: '1.0',
        count: customTemplates.length
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `forge_workout_templates_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Templates Exported",
        description: `${customTemplates.length} templates exported successfully.`,
      });
    } catch (error) {
      console.error('Failed to export templates:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export templates.",
        variant: "destructive",
      });
    }
  };

  const handleImportTemplate = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importData = JSON.parse(content);
          
          // Handle both single template and multiple templates export formats
          const templatesToImport: WorkoutTemplate[] = [];
          
          if (importData.template) {
            // Single template format
            templatesToImport.push(importData.template);
          } else if (importData.templates && Array.isArray(importData.templates)) {
            // Multiple templates format
            templatesToImport.push(...importData.templates);
          } else {
            throw new Error('Invalid template file format');
          }

          // Validate and import templates
          const validTemplates: WorkoutTemplate[] = [];
          
          for (const template of templatesToImport) {
            if (validateTemplateStructure(template)) {
              // Generate new ID to avoid conflicts
              const importedTemplate: WorkoutTemplate = {
                ...template,
                id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: template.name + ' (Imported)',
                isCustom: true,
                createdAt: Date.now(),
                updatedAt: Date.now()
              };
              validTemplates.push(importedTemplate);
            }
          }

          if (validTemplates.length === 0) {
            toast({
              title: "Import Failed",
              description: "No valid templates found in the file.",
              variant: "destructive",
            });
            return;
          }

          // Add to custom templates
          const existingCustomTemplates = templates.filter(t => t.isCustom);
          const allCustomTemplates = [...existingCustomTemplates, ...validTemplates];
          saveCustomTemplates(allCustomTemplates);
          loadTemplates();

          toast({
            title: "Templates Imported",
            description: `${validTemplates.length} template(s) imported successfully.`,
          });

        } catch (error) {
          console.error('Failed to import template:', error);
          toast({
            title: "Import Failed",
            description: "Failed to read or parse the template file.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const validateTemplateStructure = (template: any): template is WorkoutTemplate => {
    return (
      template &&
      typeof template.name === 'string' &&
      typeof template.category === 'string' &&
      typeof template.difficulty === 'string' &&
      Array.isArray(template.exercises) &&
      Array.isArray(template.equipment) &&
      typeof template.estimatedDuration === 'number'
    );
  };

  const customTemplatesCount = templates.filter(t => t.isCustom).length;
  const featuredTemplatesCount = templates.filter(t => !t.isCustom).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Workout Templates</h1>
              <p className="text-gray-600">
                {filteredTemplates.length} of {templates.length} templates
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleImportTemplate}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button
                variant="outline"
                onClick={handleExportAllTemplates}
                disabled={templates.filter(t => t.isCustom).length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
              <Button onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="hypertrophy">Hypertrophy</SelectItem>
                  <SelectItem value="conditioning">Conditioning</SelectItem>
                  <SelectItem value="mobility">Mobility</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <Tabs defaultValue="all" className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4 self-start">
            <TabsTrigger value="all" onClick={() => setShowCustomOnly(false)}>
              All Templates ({templates.length})
            </TabsTrigger>
            <TabsTrigger value="featured" onClick={() => setShowCustomOnly(false)}>
              Featured ({featuredTemplatesCount})
            </TabsTrigger>
            <TabsTrigger value="custom" onClick={() => setShowCustomOnly(true)}>
              My Templates ({customTemplatesCount})
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 p-4">
            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <WorkoutTemplateCard
                    key={template.id}
                    template={template}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                    onStartWorkout={handleStartWorkout}
                    onViewDetails={handleViewDetails}
                    onExport={handleExportTemplate}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {searchTerm || categoryFilter !== 'all' || difficultyFilter !== 'all'
                      ? 'No templates match your filters'
                      : 'No workout templates'
                    }
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || categoryFilter !== 'all' || difficultyFilter !== 'all'
                      ? 'Try adjusting your search or filters to find more templates.'
                      : 'Create your first custom workout template to get started.'
                    }
                  </p>
                  {!searchTerm && categoryFilter === 'all' && difficultyFilter === 'all' && (
                    <Button onClick={handleCreateNew}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Template
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </Tabs>
      </div>

      {/* Template Editor Dialog */}
      <Dialog open={editorState.isOpen} onOpenChange={(open) => setEditorState({ isOpen: open })}>
        <DialogContent className="max-w-7xl h-[95vh] p-0">
          <WorkoutTemplateEditor
            template={editorState.template}
            onSave={handleSaveTemplate}
            onCancel={() => setEditorState({ isOpen: false })}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => setDeleteDialog({ isOpen: open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.template?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Template Detail Dialog */}
      <Dialog 
        open={templateDetailDialog.isOpen} 
        onOpenChange={(open) => setTemplateDetailDialog({ isOpen: open })}
      >
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{templateDetailDialog.template?.name}</DialogTitle>
            <DialogDescription>
              {templateDetailDialog.template?.description}
            </DialogDescription>
          </DialogHeader>
          
          {templateDetailDialog.template && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                {/* Template Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm">Category</h4>
                    <Badge className={categoryColors[templateDetailDialog.template.category]}>
                      {templateDetailDialog.template.category}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Difficulty</h4>
                    <Badge className={difficultyColors[templateDetailDialog.template.difficulty]}>
                      {templateDetailDialog.template.difficulty}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Duration</h4>
                    <p>{templateDetailDialog.template.estimatedDuration} minutes</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Exercises</h4>
                    <p>{templateDetailDialog.template.exercises.length} exercises</p>
                  </div>
                </div>

                {/* Equipment */}
                {templateDetailDialog.template.equipment.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Required Equipment</h4>
                    <div className="flex flex-wrap gap-2">
                      {templateDetailDialog.template.equipment.map((eq, index) => (
                        <Badge key={index} variant="outline">
                          {eq.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exercise List */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Exercises</h4>
                  <div className="space-y-2">
                    {templateDetailDialog.template.exercises
                      .sort((a, b) => a.order - b.order)
                      .map((exercise, index) => {
                        const exerciseData = exerciseDatabase.getExerciseById(exercise.exerciseId);
                        // Use original name for legacy exercises, or database name for new ones
                        const displayName = exerciseData?.name || (exercise as any).originalName || 'Unknown Exercise';
                        
                        return (
                          <div key={exercise.exerciseId} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">
                                  {index + 1}. {displayName}
                                </p>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                  <span>{exercise.targetSets} sets</span>
                                  <span>{exercise.targetReps} reps</span>
                                  {exercise.restTime && <span>{exercise.restTime}s rest</span>}
                                </div>
                                {exercise.notes && (
                                  <p className="text-sm text-gray-600 mt-1">{exercise.notes}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkoutTemplates;