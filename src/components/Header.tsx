import { Zap, Plus, LayoutList, Calendar, User } from "lucide-react";
import { useTaskStore } from "../store/taskStore";

interface HeaderProps {
  onNewTask: () => void;
  taskCount: number;
  completedCount: number;
}

export function Header({ onNewTask, taskCount, completedCount }: HeaderProps) {
  const { view, setView } = useTaskStore();
  const progress = taskCount > 0 ? (completedCount / taskCount) * 100 : 0;

  return (
    <header className="fixed top-0 w-full z-50 bg-gradient-to-r from-green-700 to-emerald-900 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Main Header Row */}
        <div className="flex items-start justify-between mb-4 sm:mb-6 flex-wrap gap-4">
          {/* Logo and Title - Clickable */}
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-3 flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <div className="p-2 sm:p-3 bg-green-300/30 rounded-xl backdrop-blur-sm">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                TaskFlow
              </h1>
              <p className="text-green-200 text-xs sm:text-sm">
                Stay organized, stay productive
              </p>
            </div>
          </button>

          {/* Desktop: Action and View Controls */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
            {/* View Switcher */}
            <div className="flex bg-green-800/50 p-1 rounded-xl flex-shrink-0">
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-1 px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-all ${
                  view === "list"
                    ? "bg-white text-green-800 shadow-lg"
                    : "text-green-200 hover:text-white hover:bg-green-700"
                }`}
              >
                <LayoutList className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>List</span>
              </button>
              <button
                onClick={() => setView("calendar")}
                className={`flex items-center gap-1 px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-all ${
                  view === "calendar"
                    ? "bg-white text-green-800 shadow-lg"
                    : "text-green-200 hover:text-white hover:bg-green-700"
                }`}
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Calendar</span>
              </button>
              <button
                onClick={() => setView("profile")}
                className={`flex items-center gap-1 px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-all ${
                  view === "profile"
                    ? "bg-white text-green-800 shadow-lg"
                    : "text-green-200 hover:text-white hover:bg-green-700"
                }`}
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Profile</span>
              </button>
            </div>

            {/* New Task Button */}
            <button
              onClick={onNewTask}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-white text-green-600 rounded-xl font-bold hover:bg-green-300 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg flex-shrink-0"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {view !== "profile" && (
          <div className="bg-white bg-opacity-10 rounded-xl p-3 sm:p-4 backdrop-blur-sm border border-green-600/30">
            <div className="flex justify-between text-xs sm:text-sm mb-2">
              <span className="font-medium">Progress</span>
              <span className="font-bold text-green-300">
                {completedCount} / {taskCount} completed
              </span>
            </div>
            <div className="h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
