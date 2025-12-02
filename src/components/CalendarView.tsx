import { Task } from "../lib/supabase";
import {
  Edit3,
  Trash2,
  Calendar,
  AlertTriangle,
  Clock,
  ListTodo,
} from "lucide-react";
import { useState } from "react";
import { ConfirmationModal } from "./ConfirmationModal";
import { cn } from "../lib/utils";

// Reusing the parseSimpleMarkdown function logic, updated for dark theme links
const parseSimpleMarkdown = (text: string | null): { __html: string } => {
  if (!text) return { __html: "" };
  let html = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /\[(.*?)\]\((.*?)\)/g,
      // Dark theme link style
      '<a href="$2" target="_blank" class="text-white/80 underline hover:text-white/60 transition-colors font-medium">$1</a>'
    )
    .replace(/\n/g, "<br>");

  const lines = html.split("<br>");
  let result = "";
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) {
        // List for dark theme
        result +=
          '<ul class="list-disc pl-5 text-sm text-muted-foreground space-y-0.5 mt-1">';
        inList = true;
      }
      result += `<li class="ml-2 py-0.5">${line.substring(2)}</li>`;
    } else {
      if (inList) {
        result += "</ul>";
        inList = false;
      }
      // Paragraph for dark theme
      result += `<p class="text-xs sm:text-sm mb-1 text-muted-foreground">${line}</p>`;
    }
  }

  if (inList) {
    result += "</ul>";
  }

  return { __html: result };
};

interface CalendarViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function CalendarView({ tasks, onEdit, onDelete }: CalendarViewProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const tasksByDate = tasks.reduce((acc, task) => {
    // Exclude archived tasks from the Calendar View
    if (task.archived) return acc;

    // Only include tasks with a due date
    if (!task.due_date) {
      if (!acc["No Due Date"]) {
        acc["No Due Date"] = [];
      }
      acc["No Due Date"].push(task);
      return acc;
    }

    // Use only the date part for grouping (YYYY-MM-DD)
    const dateKey = task.due_date.substring(0, 10);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Sort the keys (dates) chronologically
  const sortedDates = Object.keys(tasksByDate).sort((a, b) => {
    if (a === "No Due Date") return 1;
    if (b === "No Due Date") return -1;
    return new Date(a).getTime() - new Date(b).getTime();
  });

  const formatDate = (dateString: string) => {
    if (dateString === "No Due Date") {
      return "No Due Date";
    }
    const date = new Date(dateString);
    const now = new Date(new Date().setHours(0, 0, 0, 0)); // Start of today
    const dateToCheck = new Date(dateString);

    // Calculate Today/Tomorrow/Yesterday
    const diffDays = Math.round(
      (dateToCheck.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays < -1) return "Past Due"; // Group all past dates

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: diffDays > 365 || diffDays < -365 ? "numeric" : undefined,
    });
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      onDelete(taskToDelete.id);
    }
    setShowConfirmDelete(false);
    setTaskToDelete(null);
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setShowConfirmDelete(true);
  };

  // Empty state for dark theme
  if (tasks.filter((t) => !t.archived).length === 0) {
    return (
      <div className="text-center py-20 bg-card border border-border rounded-2xl shadow-xl">
        <div className="inline-block p-4 bg-background rounded-xl shadow-lg mb-4">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6 text-white/80" />
          </div>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
          No Tasks Scheduled
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground px-4">
          Add a due date to your active tasks to start building your schedule.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header for dark theme */}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-white border-b-4 pb-4 border-white/30">
        Task Schedule
      </h2>

      {sortedDates.map((dateKey) => (
        <div key={dateKey} className="relative pl-6 sm:pl-10">
          {/* Vertical Timeline Line for dark theme */}
          <div className="absolute top-0 left-0 h-full w-1 bg-white/10 rounded-full"></div>

          {/* Date Header Block - Visually Prominent */}
          <div className="relative flex items-center mb-6 ml-4">
            {/* Timeline Marker for dark theme (White/Primary Ring) */}
            <div className="absolute left-[-1.9rem] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary border-4 border-background shadow-lg z-10"></div>

            <h3
              className={`text-2xl font-extrabold pr-3 py-1 
              ${
                dateKey === "No Due Date"
                  ? "text-white/70" // Muted date for No Due Date
                  : "text-white"
              }`}
            >
              {formatDate(dateKey)}
            </h3>
            {/* Task count badge for dark theme */}
            <span
              className={cn(
                "ml-3 text-sm font-semibold px-3 py-1 rounded-full",
                dateKey === "No Due Date"
                  ? "text-muted-foreground bg-white/5"
                  : "bg-white/10 text-white/80"
              )}
            >
              {tasksByDate[dateKey].length}
            </span>
          </div>

          <div className="space-y-4 ml-4">
            {tasksByDate[dateKey].map((task) => {
              const isOverdue =
                dateKey !== "No Due Date" &&
                new Date(dateKey) < new Date(new Date().setHours(0, 0, 0, 0)) &&
                !task.completed;

              // Priority colors for left border accent
              const priorityBorderLeft =
                task.priority === "high"
                  ? "border-l-red-500"
                  : task.priority === "medium"
                  ? "border-l-yellow-500"
                  : "border-l-green-500";

              // 💡 NEW: Border color for the entire card based on status
              const statusBorder = isOverdue
                ? "border-red-600 ring-1 ring-red-600" // Overdue: Strong red border/ring
                : task.completed
                ? "border-gray-700 opacity-80" // Completed: Muted gray border
                : "border-border hover:border-white/50"; // Upcoming/Default: Subtle white hover

              return (
                <div
                  key={task.id}
                  className={cn(
                    // Base Card Styles
                    `flex flex-col sm:flex-row sm:items-start justify-between p-5 rounded-xl border-l-4 border-2 shadow-xl transition-all duration-200 hover:shadow-2xl`,

                    // Background
                    "bg-card", // Removed conditional backgrounds

                    // Left Priority Accent
                    !task.completed && priorityBorderLeft,

                    // 💡 STATUS BORDER (Replaces explicit status background colors)
                    statusBorder
                  )}
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p
                      className={cn(
                        "font-bold text-lg mb-1 transition-colors",
                        task.completed
                          ? "line-through text-muted-foreground"
                          : "text-white"
                      )}
                    >
                      {task.title}
                    </p>

                    {task.description && (
                      <div
                        className="text-sm mb-2"
                        dangerouslySetInnerHTML={parseSimpleMarkdown(
                          task.description
                        )}
                      />
                    )}

                    {/* Status and Priority Tags */}
                    <div className="flex items-center flex-wrap gap-2 mt-2">
                      {/* Priority Tag */}
                      <span
                        className={cn(
                          `inline-block px-3 py-1.5 rounded-full text-xs font-medium`,
                          task.priority === "high"
                            ? "bg-red-800/50 text-red-300"
                            : task.priority === "medium"
                            ? "bg-yellow-800/50 text-yellow-300"
                            : "bg-green-800/50 text-green-300"
                        )}
                      >
                        {task.priority.toUpperCase()}
                      </span>

                      {dateKey !== "No Due Date" && (
                        <div
                          className={cn(
                            `inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors`,
                            isOverdue
                              ? "text-red-200 bg-red-700"
                              : task.completed
                              ? "text-gray-400 bg-gray-700"
                              : "text-green-200 bg-green-700"
                          )}
                        >
                          {isOverdue && <AlertTriangle className="w-3 h-3" />}
                          {task.completed && <ListTodo className="w-3 h-3" />}
                          {!isOverdue && !task.completed && (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>
                            {isOverdue
                              ? "Overdue"
                              : task.completed
                              ? "Completed"
                              : "Upcoming"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3 sm:mt-0 flex-shrink-0">
                    {/* Edit Button (White/Muted Accent) */}
                    <button
                      onClick={() => onEdit(task)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors duration-200 shadow-sm"
                      title="Edit Task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Button (Destructive/Red Accent) */}
                    <button
                      onClick={() => handleDeleteClick(task)}
                      className="p-2 rounded-lg bg-red-900/50 hover:bg-red-900 text-red-400 transition-colors duration-200 shadow-sm"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message={`Are you sure you want to delete the task: "${
          taskToDelete?.title || ""
        }"? This action cannot be undone.`}
        confirmText="Delete Permanently"
      />
    </div>
  );
}
