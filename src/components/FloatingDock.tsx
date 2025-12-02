import { motion } from "framer-motion";
import { LayoutList, Calendar, User, Plus } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
import { cn } from "../lib/utils";

interface FloatingDockProps {
  onNewTask: () => void;
}

export function FloatingDock({ onNewTask }: FloatingDockProps) {
  const { view, setView } = useTaskStore();

  const navItems = [
    {
      id: "list",
      icon: LayoutList,
      label: "Tasks",
      action: () => setView("list"),
    },
    {
      id: "calendar",
      icon: Calendar,
      label: "Calendar",
      action: () => setView("calendar"),
    },
    // 💡 ADDED: The 'Plus' icon as a standard navigation item
    {
      id: "new-task",
      icon: Plus,
      label: "New",
      action: onNewTask,
      isNewTaskButton: true,
    },
    {
      id: "profile",
      icon: User,
      label: "Profile",
      action: () => setView("profile"),
    },
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-2 flex items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          // For the 'New Task' button, we don't treat it as an 'active' view
          const isActive = view === item.id && !item.isNewTaskButton;

          return (
            <div key={item.id} className="relative">
              {/* Removed the conditional floating 'Plus' button logic */}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={item.action as any} // Use the specific action for the item
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all",
                  item.isNewTaskButton
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" // Custom style for the Plus button
                    : isActive
                    ? "bg-white text-black shadow-lg"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </motion.button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
