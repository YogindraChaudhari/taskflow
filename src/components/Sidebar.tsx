import { motion } from "framer-motion";
import { LayoutList, Calendar, User, Zap } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
import { Button } from "./ui/button.tsx";
import { cn } from "../lib/utils";

interface SidebarProps {
  onNewTask: () => void;
}

export function Sidebar({ onNewTask }: SidebarProps) {
  const { view, setView } = useTaskStore();

  const navItems = [
    { id: "list", label: "Tasks", icon: LayoutList },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 bg-card border-r border-border"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-border">
        <div className="p-2 bg-white rounded-lg">
          <Zap className="w-6 h-6 text-black" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">TaskFlow</h1>
      </div>

      {/* New Task Button */}
      <div className="p-4">
        <Button
          onClick={onNewTask}
          className="w-full justify-center gap-2 bg-white/10 text-white text-xl font-bold border-2 border-gray-50 shadow-lg shadow-amber-200"
          size="lg"
        >
          New Task
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = view === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isActive
                  ? "bg-white text-black shadow-lg"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Stay organized, stay productive
        </p>
      </div>
    </motion.aside>
  );
}
