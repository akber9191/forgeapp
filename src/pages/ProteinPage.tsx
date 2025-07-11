
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Target, TrendingUp, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const ProteinPage = () => {
  const { toast } = useToast();
  const [todayProtein, setTodayProtein] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [weeklyData, setWeeklyData] = useState<{ [date: string]: number }>({});
  const [weeklyAverage, setWeeklyAverage] = useState(0);

  const target = 142.5; // Mid-point of 135-150g target

  useEffect(() => {
    loadProteinData();
  }, []);

  const loadProteinData = () => {
    const saved = JSON.parse(localStorage.getItem('forgeProtein') || '{}');
    const today = new Date().toISOString().split('T')[0];
    
    setWeeklyData(saved);
    setTodayProtein(saved[today] || 0);

    // Calculate 7-day average
    const last7Days = Object.entries(saved)
      .slice(-7)
      .map(([_, value]) => value as number);
    
    if (last7Days.length > 0) {
      const avg = last7Days.reduce((sum, val) => sum + val, 0) / last7Days.length;
      setWeeklyAverage(Math.round(avg));
    }
  };

  const updateProtein = (amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    const newAmount = Math.max(0, todayProtein + amount);
    
    const updatedData = { ...weeklyData, [today]: newAmount };
    localStorage.setItem('forgeProtein', JSON.stringify(updatedData));
    
    setTodayProtein(newAmount);
    setWeeklyData(updatedData);
    
    if (amount > 0) {
      toast({
        title: "Protein Added!",
        description: `+${amount}g towards your daily goal`
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

  const addCustomAmount = () => {
    const amount = parseInt(inputValue);
    if (!isNaN(amount) && amount > 0) {
      updateProtein(amount);
      setInputValue('');
    }
  };

  const progressPercentage = Math.min((todayProtein / target) * 100, 100);
  const isOnTrack = todayProtein >= target;

  // Get last 7 days for mini chart
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
        <h1 className="text-2xl font-bold">Protein Tracking</h1>
        <div className="w-10" />
      </div>

      {/* Today's Progress */}
      <div className="forge-card mb-6">
        <div className="text-center mb-6">
          <div className="text-4xl font-bold mb-2">
            <span className={isOnTrack ? 'text-forge-success' : 'text-primary'}>
              {todayProtein}g
            </span>
            <span className="text-muted-foreground text-2xl"> / {target}g</span>
          </div>
          <p className="text-muted-foreground">Today's Protein</p>
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
            <span>0g</span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
            <span>{target}g</span>
          </div>
        </div>

        {/* Status */}
        <div className={`text-center p-3 rounded-lg ${
          isOnTrack 
            ? 'bg-forge-success/10 text-forge-success' 
            : todayProtein > target * 0.7 
              ? 'bg-forge-warning/10 text-forge-warning'
              : 'bg-muted text-muted-foreground'
        }`}>
          {isOnTrack 
            ? '🎯 Target reached! Great work!' 
            : todayProtein > target * 0.7 
              ? '💪 Almost there, keep going!'
              : '🥩 Time to fuel up!'}
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="forge-card mb-6">
        <h3 className="font-semibold mb-4">Quick Add</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[10, 20, 30].map(amount => (
            <Button
              key={amount}
              onClick={() => updateProtein(amount)}
              className="forge-button-secondary h-12"
            >
              +{amount}g
            </Button>
          ))}
        </div>
        
        {/* Custom Amount */}
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Custom amount"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="forge-input"
            onKeyPress={(e) => e.key === 'Enter' && addCustomAmount()}
          />
          <Button 
            onClick={addCustomAmount}
            className="forge-button px-4"
            disabled={!inputValue || isNaN(parseInt(inputValue))}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Remove Protein */}
        {todayProtein > 0 && (
          <div className="flex gap-2 mt-3">
            <Button
              onClick={() => updateProtein(-10)}
              variant="outline"
              size="sm"
            >
              <Minus className="w-4 h-4 mr-1" />
              10g
            </Button>
            <Button
              onClick={() => updateProtein(-todayProtein)}
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
            <span className="font-semibold">{weeklyAverage}g</span>
          </div>
        </div>

        {/* Mini Chart */}
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
              <span className="text-sm w-12 text-right font-medium">
                {day.amount}g
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="forge-card">
        <h3 className="font-semibold mb-3">💡 Protein Tips</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Aim for 20-30g per meal for optimal absorption</p>
          <p>• Post-workout protein within 2 hours helps recovery</p>
          <p>• Spread intake throughout the day for best results</p>
          <p>• Your target: 135-150g daily supports muscle building</p>
        </div>
      </div>
    </div>
  );
};

export default ProteinPage;
