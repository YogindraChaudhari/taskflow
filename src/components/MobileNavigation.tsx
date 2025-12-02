import { LayoutList, Calendar, User, Plus } from "lucide-react";
import { useTaskStore } from "../store/taskStore";

interface MobileNavigationProps {
  onNewTask: () => void;
}

export function MobileNavigation({ onNewTask }: MobileNavigationProps) {
  const { view, setView } = useTaskStore();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 shadow-2xl z-50 safe-area-inset">
      <div className="grid grid-cols-4 gap-0 px-2 py-2">
        {/* List View */}
        <button
          onClick={() => setView("list")}
          className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
            view === "list"
              ? "bg-green-100 text-green-700"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <LayoutList
            className={`w-6 h-6 mb-1 ${view === "list" ? "stroke-[2.5]" : ""}`}
          />
          <span
            className={`text-xs font-medium ${
              view === "list" ? "font-bold" : ""
            }`}
          >
            Tasks
          </span>
        </button>

        {/* Calendar View */}
        <button
          onClick={() => setView("calendar")}
          className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
            view === "calendar"
              ? "bg-green-100 text-green-700"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Calendar
            className={`w-6 h-6 mb-1 ${
              view === "calendar" ? "stroke-[2.5]" : ""
            }`}
          />
          <span
            className={`text-xs font-medium ${
              view === "calendar" ? "font-bold" : ""
            }`}
          >
            Calendar
          </span>
        </button>

        {/* New Task Button - Central FAB */}
        <button
          onClick={onNewTask}
          className="flex flex-col items-center justify-center relative"
        >
          <div className="absolute -top-4 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-200 active:scale-95">
            <Plus className="w-7 h-7 text-white stroke-[3]" />
          </div>
          <span className="text-xs font-medium text-gray-600 mt-10">
            New Task
          </span>
        </button>

        {/* Profile View */}
        <button
          onClick={() => setView("profile")}
          className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
            view === "profile"
              ? "bg-green-100 text-green-700"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <User
            className={`w-6 h-6 mb-1 ${
              view === "profile" ? "stroke-[2.5]" : ""
            }`}
          />
          <span
            className={`text-xs font-medium ${
              view === "profile" ? "font-bold" : ""
            }`}
          >
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
}
