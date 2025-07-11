
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Activity, Target, TrendingUp, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const StepsPage = () => {
  const { toast } = useToast();
  const [todaySteps, setTodaySteps] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [weeklyData, setWeeklyData] = useState<{ [date: string]: number }>({});
  const [weeklyAverage, setWeeklyAverage] = useState(0);

  const target = 10000;

  useEffect(() => {
    loadStepsData();
  }, []);

  const loadStepsData = () => {
    const saved = JSON.parse(localStorage.getItem('forgeSteps') || '{}');
    const today = new Date().toISOString().split('T')[0];
    
    setWeeklyData(saved);
    setTodaySteps(saved[today] || 0);

    // Calculate 7-day average
    const last7Days = Object.entries(saved)
      .slice(-7)
      .map(([_, value]) => value as number);
    
    if (last7Days.length > 0) {
      const avg = last7Days.reduce((sum, val) => sum + val, 0) / last7Days.length;
      setWeeklyAverage(Math.round(avg));
    }
  };

  const updateSteps = (amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    const newAmount = Math.max(0, todaySteps + amount);
    
    const updatedData = { ...weeklyData, [today]: newAmount };
    localStorage.setItem('forgeSteps', JSON.stringify(updatedData));
    
    setTodaySteps(newAmount);
    setWeeklyData(updatedData);
    
    if (amount > 0) {
      toast({
        title: "Steps Added!",
        description: `+${amount.toLocaleString()} steps towards your goal`
      });
    }

    // Recalculate average
    const last7Days = Object.entries(updatedData)
      .slice(-7)
      .map(([_, value]) => value as number);
    
    if (last7Days.length > 0) {
      const avg = last7Days.reduce((sum, val) => sum + val, 0) / last7Days.length;
      setWeeklyAverage(Math.round(avg));
    }
  };

  const setCustomSteps = () => {
    const amount = parseInt(inputValue);
    if (!isNaN(amount) && amount >= 0) {
      const today = new Date().toISOString().split('T')[0];
      const updatedData = { ...weeklyData, [today]: amount };
      localStorage.setItem('forgeSteps', JSON.stringify(updatedData));
      
      setTodaySteps(amount);
      setWeeklyData(updatedData);
      setInputValue('');
      
      toast({
        title: "Steps Updated!",
        description: `Set to ${amount.toLocaleString()} steps`
      });

      // Recalculate average
      const last7Days = Object.entries(updatedData)
        .slice(-7)
        .map(([_, value]) => value as number);
      
      if (last7Days.length > 0) {
        const avg = last7Days.reduce((sum, val) => sum + val, 0) / last7Days.length;
        setWeeklyAverage(Math.round(avg));
      }
    }
  };

  const progressPercentage = Math.min((todaySteps / target) * 100, 100);
  const isOnTrack = todaySteps >= target;

  // Get last 7 days for chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    return {
      date: dateStr,
      amount: weeklyData[dateStr] || 0,
      day: date.toLocaleDateString('en', { weekday: 'short' })
    };
  });

  return (
    <div className="pb-20 px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold">Step Tracking</h1>
        <div className="w-10" />
      </div>

      {/* Today's Progress */}
      <div className="forge-card mb-6">
        <div className="text-center mb-6">
          <div className="text-4xl font-bold mb-2">
            <span className={isOnTrack ? 'text-forge-success' : 'text-primary'}>
              {todaySteps.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-2xl"> / {target.toLocaleString()}</span>
          </div>
          <p className="text-muted-foreground">Today's Steps</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="forge-progress-bar h-4 mb-2">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                isOnTrack 
                  ? 'bg-gradient-to-r from-forge-success to-forge-success' 
                  : 'bg-gradient-to-r from-primary to-accent'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0</span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
            <span>{target.toLocaleString()}</span>
          </div>
        </div>

        {/* Status */}
        <div className={`text-center p-3 rounded-lg ${
          isOnTrack 
            ? 'bg-forge-success/10 text-forge-success' 
            : todaySteps > target * 0.7 
              ? 'bg-forge-warning/10 text-forge-warning'
              : 'bg-muted text-muted-foreground'
        }`}>
          {isOnTrack 
            ? '🎯 Goal smashed! Keep moving!' 
            : todaySteps > target * 0.7 
              ? '🚶 Almost there, final push!'
              : '👟 Time to get moving!'}
        </div>
      </div>

      {/* Quick Add & Set */}
      <div className="forge-card mb-6">
        <h3 className="font-semibold mb-4">Update Steps</h3>
        
        {/* Quick Add */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1000, 2500, 5000].map(amount => (
            <Button
              key={amount}
              onClick={() => updateSteps(amount)}
              className="forge-button-secondary h-12"
            >
              +{amount.toLocaleString()}
            </Button>
          ))}
        </div>
        
        {/* Set Custom Amount */}
        <div className="flex gap-2 mb-3">
          <Input
            type="number"
            placeholder="Set total steps"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="forge-input"
            onKeyPress={(e) => e.key === 'Enter' && setCustomSteps()}
          />
          <Button 
            onClick={setCustomSteps}
            className="forge-button px-4"
            disabled={!inputValue || isNaN(parseInt(inputValue))}
          >
            Set
          </Button>
        </div>

        {/* Remove Steps */}
        {todaySteps > 0 && (
          <div className="flex gap-2">
            <Button
              onClick={() => updateSteps(-1000)}
              variant="outline"
              size="sm"
            >
              <Minus className="w-4 h-4 mr-1" />
              1K
            </Button>
            <Button
              onClick={() => updateSteps(-todaySteps)}
              variant="outline"
              size="sm"
            >
              Reset
            </Button>
          </div>
        )}
      </div>

      {/* Weekly Stats */}
      <div className="forge-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">7-Day Average</h3>
          <div className="flex items-center text-primary">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="font-semibold">{weeklyAverage.toLocaleString()}</span>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="space-y-2">
          {last7Days.map((day, index) => (
            <div key={day.date} className="flex items-center gap-3">
              <span className="text-sm w-8 text-muted-foreground">{day.day}</span>
              <div className="flex-1">
                <div className="forge-progress-bar h-2">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((day.amount / target) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-sm w-16 text-right font-medium">
                {day.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Walking Tips */}
      <div className="forge-card">
        <h3 className="font-semibold mb-3">🚶 Walking Tips</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Take the stairs whenever possible</p>
          <p>• Park farther away or get off transit early</p>
          <p>• Walk during phone calls or meetings</p>
          <p>• Set hourly reminders to take short walks</p>
          <p>• ~2,000 steps = 1 mile for most people</p>
        </div>
      </div>
    </div>
  );
};

export default StepsPage;
