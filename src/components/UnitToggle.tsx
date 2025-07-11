import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WeightUnit, getUserPreferredUnit, toggleUnit } from "@/utils/unitConversion";

interface UnitToggleProps {
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  onUnitChange?: (unit: WeightUnit) => void;
  className?: string;
}

export const UnitToggle = ({ 
  size = "default", 
  variant = "outline", 
  onUnitChange,
  className = ""
}: UnitToggleProps) => {
  const [currentUnit, setCurrentUnit] = useState<WeightUnit>(() => getUserPreferredUnit());

  useEffect(() => {
    // Listen for unit changes from other components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'forge-preferred-unit' && e.newValue) {
        const newUnit = e.newValue as WeightUnit;
        setCurrentUnit(newUnit);
        onUnitChange?.(newUnit);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [onUnitChange]);

  const handleToggle = () => {
    const newUnit = toggleUnit();
    setCurrentUnit(newUnit);
    onUnitChange?.(newUnit);
    
    // Dispatch custom event for components in the same tab
    window.dispatchEvent(new CustomEvent('unitChanged', { detail: newUnit }));
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      className={`font-mono font-semibold transition-all duration-200 hover:scale-105 ${className}`}
      title={`Switch to ${currentUnit === 'kg' ? 'lbs' : 'kg'}`}
    >
      <span className={currentUnit === 'kg' ? 'text-primary' : 'text-muted-foreground'}>
        KG
      </span>
      <span className="mx-1 text-muted-foreground">⇄</span>
      <span className={currentUnit === 'lbs' ? 'text-primary' : 'text-muted-foreground'}>
        LBS
      </span>
    </Button>
  );
};

export default UnitToggle;