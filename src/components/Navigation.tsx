
import { NavLink, useLocation } from "react-router-dom";
import { Home, Dumbbell, Beef, Activity, BarChart3 } from "lucide-react";

export const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/workout/a", icon: Dumbbell, label: "Workouts" },
    { path: "/history", icon: BarChart3, label: "History" },
    { path: "/protein", icon: Beef, label: "Protein" },
    { path: "/steps", icon: Activity, label: "Steps" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2 safe-area-pb">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path.includes('workout') && location.pathname.includes('workout'));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
