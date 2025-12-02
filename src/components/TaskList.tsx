import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "../lib/supabase";
import { TaskCard } from "./TaskCard";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { ListFilter, SlidersHorizontal } from "lucide-react";
import { cn } from "../lib/utils";

type FilterType = "active" | "completed" | "archived";
type SortKey = "updated_at" | "created_at";

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onPinToggle: (id: string, pinned: boolean) => void;
  onArchiveToggle: (id: string, archived: boolean) => void;
  sortBy: SortKey;
  onSortChange: (sortKey: SortKey) => void;
}

export function TaskList({
  tasks,
  onToggle,
  onDelete,
  onEdit,
  onPinToggle,
  onArchiveToggle,
  sortBy,
  onSortChange,
}: TaskListProps) {
  const [filter, setFilter] = useState<FilterType>("active");

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    const timeA = new Date(a[sortBy] as string).getTime();
    const timeB = new Date(b[sortBy] as string).getTime();
    return timeB - timeA;
  });

  const filteredTasks = sortedTasks.filter((task) => {
    switch (filter) {
      case "completed":
        return task.completed && !task.archived;
      case "archived":
        return task.archived;
      case "active":
      default:
        return !task.completed && !task.archived;
    }
  });

  const counts = {
    active: tasks.filter((t) => !t.completed && !t.archived).length,
    completed: tasks.filter((t) => t.completed && !t.archived).length,
    archived: tasks.filter((t) => t.archived).length,
  };

  const renderFilterTab = (type: FilterType, label: string) => {
    const isActive = filter === type;

    const tabClasses = cn(
      "gap-2 shadow-md rounded-md",
      isActive ? "text-gray-50 shadow-white" : ""
    );

    const countClasses = cn(
      "text-xs px-2 py-1 rounded-full",
      isActive ? "bg-white/40 text-white" : "bg-white/20 text-white"
    );

    return (
      <TabsTrigger value={type} className={tabClasses}>
        {label}
        <span className={countClasses}>{counts[type]}</span>
      </TabsTrigger>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <TabsList>
            {renderFilterTab("active", "Active")}
            {renderFilterTab("completed", "Completed")}
            {renderFilterTab("archived", "Archived")}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Sort:</span>
          <Tabs
            value={sortBy}
            onValueChange={(v) => onSortChange(v as SortKey)}
          >
            <TabsList>
              <TabsTrigger value="updated_at">Modified</TabsTrigger>
              <TabsTrigger value="created_at">Created</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Task Grid */}
      {filteredTasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-card border border-dashed border-border rounded-lg"
        >
          <div className="inline-block p-4 bg-muted rounded-full mb-4">
            <ListFilter className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {filter === "active" && "No active tasks"}
            {filter === "completed" && "No completed tasks"}
            {filter === "archived" && "No archived tasks"}
          </h3>
          <p className="text-muted-foreground">
            {filter === "active" && "Create a new task to get started"}
            {filter === "completed" && "Complete some tasks to see them here"}
            {filter === "archived" && "Archived tasks will appear here"}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                onPinToggle={onPinToggle}
                onArchiveToggle={onArchiveToggle}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
