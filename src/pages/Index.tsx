
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Dumbbell, Target, TrendingUp, Flame, Calendar, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [stats, setStats] = useState({
    workoutsThisWeek: 0,
    avgProtein: 0,
    avgSteps: 0,
    currentStreak: 0
  });

  useEffect(() => {
    // Load stats from localStorage
    const workoutData = JSON.parse(localStorage.getItem('forgeWorkouts') || '[]');
    const proteinData = JSON.parse(localStorage.getItem('forgeProtein') || '{}');
    const stepsData = JSON.parse(localStorage.getItem('forgeSteps') || '{}');

    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    
    // Calculate workouts this week
    const workoutsThisWeek = workoutData.filter((workout: any) => 
      new Date(workout.date) >= weekStart
    ).length;

    // Calculate average protein (last 7 days)
    const proteinValues = Object.values(proteinData).slice(-7) as number[];
    const avgProtein = proteinValues.length > 0 
      ? Math.round(proteinValues.reduce((a, b) => a + b, 0) / proteinValues.length)
      : 0;

    // Calculate average steps (last 7 days)  
    const stepsValues = Object.values(stepsData).slice(-7) as number[];
    const avgSteps = stepsValues.length > 0
      ? Math.round(stepsValues.reduce((a, b) => a + b, 0) / stepsValues.length)
      : 0;

    // Calculate current streak
    const currentStreak = calculateStreak(workoutData, proteinData, stepsData);

    setStats({
      workoutsThisWeek,
      avgProtein,
      avgSteps,
      currentStreak
    });
  }, []);

  const calculateStreak = (workouts: any[], protein: { [key: string]: number }, steps: { [key: string]: number }) => {
    let streak = 0;
    const today = new Date();
    
    // Check each day going backwards from today
    for (let i = 0; i < 30; i++) { // Check up to 30 days back
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      // Check if this day had all three goals met
      const hasWorkout = workouts.some(w => w.date.split('T')[0] === dateStr);
      const hasProtein = (protein[dateStr] || 0) >= 135; // Minimum protein target
      const hasSteps = (steps[dateStr] || 0) >= 10000; // Step target
      
      // If this day met all goals, increment streak
      if (hasWorkout && hasProtein && hasSteps) {
        streak++;
      } else if (i === 0) {
        // If today doesn't meet goals, streak is 0
        break;
      } else {
        // If any past day breaks the streak, stop counting
        break;
      }
    }
    
    return streak;
  };

  return (
    <div className="pb-20 px-4 pt-8 bg-gradient-to-br from-forge-yellow-300/20 to-forge-orange-400/20 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mr-3 shadow-lg forge-bounce">
            <Dumbbell className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Forge
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">Building strength, one day at a time ✨</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="forge-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-forge-orange-500">{stats.workoutsThisWeek}</p>
              <p className="text-sm text-muted-foreground">This Week</p>
            </div>
            <Dumbbell className="w-8 h-8 text-forge-orange-500" />
          </div>
        </div>

        <div className="forge-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-forge-success">{stats.avgProtein}g</p>
              <p className="text-sm text-muted-foreground">Avg Protein</p>
            </div>
            <Target className="w-8 h-8 text-forge-success" />
          </div>
        </div>

        <div className="forge-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-forge-info">{stats.avgSteps.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Avg Steps</p>
            </div>
            <TrendingUp className="w-8 h-8 text-forge-info" />
          </div>
        </div>

        <div className="forge-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-forge-coral-500">{stats.currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
            <Flame className="w-8 h-8 text-forge-coral-500" />
          </div>
        </div>
      </div>

      {/* Today's Action */}
      <div className="forge-card mb-6 bg-gradient-to-r from-white to-forge-yellow-300/10">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-primary" />
          Today's Focus
        </h2>
        <p className="text-muted-foreground mb-4">Ready to forge your strength? 💪</p>
        <div className="space-y-3">
          <Link to="/workout/a">
            <Button className="forge-button w-full justify-start">
              <Dumbbell className="w-5 h-5 mr-3" />
              Start Workout A
            </Button>
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/protein">
              <Button variant="secondary" className="forge-button-secondary w-full">
                🥩 Log Protein
              </Button>
            </Link>
            <Link to="/steps">
              <Button variant="secondary" className="forge-button-secondary w-full">
                👟 Log Steps
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="forge-card bg-gradient-to-r from-white to-forge-orange-400/10">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-primary" />
          Your Progress
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Weekly Goal</span>
            <div className="flex items-center">
              <div className="forge-progress-bar w-24 mr-3">
                <div 
                  className="forge-progress-fill" 
                  style={{ width: `${Math.min((stats.workoutsThisWeek / 3) * 100, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {stats.workoutsThisWeek}/3
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Protein Target</span>
            <div className="flex items-center">
              <div className="forge-progress-bar w-24 mr-3">
                <div 
                  className="forge-progress-fill" 
                  style={{ width: `${Math.min((stats.avgProtein / 142.5) * 100, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {Math.round((stats.avgProtein / 142.5) * 100)}%
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Step Goal</span>
            <div className="flex items-center">
              <div className="forge-progress-bar w-24 mr-3">
                <div 
                  className="forge-progress-fill" 
                  style={{ width: `${Math.min((stats.avgSteps / 10000) * 100, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {Math.round((stats.avgSteps / 10000) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
