import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Plus, AlertCircle } from "lucide-react";
import { parseSetInput, formatParsedSet, getInputExamples, type ParsedSet } from "@/utils/parseSetInput";
import { getUserPreferredUnit, convertAndFormatWeight, type WeightUnit } from "@/utils/unitConversion";

interface SetInputProps {
  onSetAdd: (set: ParsedSet) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const SetInput = ({ 
  onSetAdd, 
  placeholder = "Enter set (e.g., '40 5' or 'double 35kg x8')", 
  className = "",
  disabled = false,
  autoFocus = false
}: SetInputProps) => {
  const [input, setInput] = useState("");
  const [currentUnit, setCurrentUnit] = useState<WeightUnit>(() => getUserPreferredUnit());
  const [parsedSet, setParsedSet] = useState<ParsedSet | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen for unit changes
  useEffect(() => {
    const handleUnitChange = ((e: CustomEvent<WeightUnit>) => {
      setCurrentUnit(e.detail);
      // Re-parse current input with new unit
      if (input.trim()) {
        const parsed = parseSetInput(input, { defaultUnit: e.detail });
        setParsedSet(parsed);
      }
    }) as EventListener;

    window.addEventListener('unitChanged', handleUnitChange);
    return () => window.removeEventListener('unitChanged', handleUnitChange);
  }, [input]);

  // Parse input in real-time
  useEffect(() => {
    if (input.trim()) {
      const parsed = parseSetInput(input, { defaultUnit: currentUnit });
      setParsedSet(parsed);
    } else {
      setParsedSet(null);
    }
  }, [input, currentUnit]);

  const handleInputChange = (value: string) => {
    setInput(value);
    setShowExamples(false);
  };

  const handleAddSet = () => {
    if (parsedSet && parsedSet.isValid) {
      onSetAdd(parsedSet);
      setInput("");
      setParsedSet(null);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && parsedSet?.isValid) {
      handleAddSet();
    } else if (e.key === 'Escape') {
      setInput("");
      setParsedSet(null);
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
    setShowExamples(false);
    inputRef.current?.focus();
  };

  const examples = getInputExamples(currentUnit);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowExamples(!input.trim())}
          placeholder={placeholder}
          className="pr-12 forge-input"
          disabled={disabled}
          autoFocus={autoFocus}
        />
        
        {/* Add Button */}
        {parsedSet?.isValid && (
          <Button
            onClick={handleAddSet}
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0 bg-primary hover:bg-primary/90"
            disabled={disabled}
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Live Preview */}
      {parsedSet && (
        <div className="space-y-2">
          {parsedSet.isValid ? (
            <div className="flex items-center p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {formatParsedSet(parsedSet)}
                </p>
                {/* Show in alternate unit */}
                {currentUnit === 'kg' && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ({convertAndFormatWeight(parsedSet.weightPerBell, 'kg', 'lbs')} per bell, {convertAndFormatWeight(parsedSet.totalVolume, 'kg', 'lbs')} total)
                  </p>
                )}
                {currentUnit === 'lbs' && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ({convertAndFormatWeight(parsedSet.weightPerBell, 'lbs', 'kg')} per bell, {convertAndFormatWeight(parsedSet.totalVolume, 'lbs', 'kg')} total)
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-200">
                {parsedSet.error}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Examples */}
      {showExamples && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Examples:</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleExampleClick(example)}
              >
                {example}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      {!input && !showExamples && (
        <p className="text-xs text-muted-foreground">
          Type weight and reps (e.g., "40 5") or use natural language ("double 35kg x8")
        </p>
      )}
    </div>
  );
};

export default SetInput;