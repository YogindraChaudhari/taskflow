import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Trash2,
  Edit3,
  Calendar,
  Pin,
  PinOff,
  Archive,
  ArchiveRestore,
  MoreVertical,
  AlertTriangle,
} from "lucide-react";
import { Task } from "../lib/supabase";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "../lib/utils";

const formatRelativeTime = (
  isoDate: string | null,
  isUpdated: boolean = false
): string => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let timeString: string;
  if (minutes < 1) {
    timeString = "just now";
  } else if (minutes < 60) {
    timeString = `${minutes}m ago`;
  } else if (hours < 24) {
    timeString = `${hours}h ago`;
  } else if (days === 1) {
    timeString = "yesterday";
  } else if (days < 7) {
    timeString = `${days}d ago`;
  } else {
    timeString = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return isUpdated ? `edited ${timeString}` : timeString;
};

const parseSimpleMarkdown = (text: string | null): { __html: string } => {
  if (!text) return { __html: "" };
  let html = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" class="text-primary underline hover:text-primary/80 transition-colors">$1</a>'
    );

  const lines = html.split("\n");
  let result = "";

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith("- ")) {
      result += '<ul class="list-disc pl-5 text-sm text-muted-foreground">';
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        result += `<li class="ml-2">${lines[i].trim().substring(2)}</li>`;
        i++;
      }
      result += "</ul>";
      i--;
    } else {
      result += `<p class="text-sm mb-1 text-muted-foreground">${line}</p>`;
    }
  }

  return { __html: result };
};

interface TaskCardProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onPinToggle: (id: string, pinned: boolean) => void;
  onArchiveToggle: (id: string, archived: boolean) => void;
}

// Priority colors for dark theme
const priorityConfig = {
  low: { color: "bg-green-900/50 text-green-300", label: "LOW" },
  medium: { color: "bg-yellow-900/50 text-yellow-300", label: "MED" },
  high: { color: "bg-red-900/50 text-red-300", label: "HIGH" },
};

export function TaskCard({
  task,
  onToggle,
  onDelete,
  onEdit,
  onPinToggle,
  onArchiveToggle,
}: TaskCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Check if today's date is past the due date
  const isOverdue =
    task.due_date &&
    !task.completed &&
    new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0));

  const formattedDueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  const createdAtTime = new Date(task.created_at).getTime();
  const updatedAtTime = new Date(task.updated_at).getTime();
  // Consider a task edited if updated_at is significantly later than created_at
  const isEdited = updatedAtTime - createdAtTime > 5000;
  const displayTime = isEdited ? task.updated_at : task.created_at;
  const timeText = formatRelativeTime(displayTime, isEdited);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={cn(
            "group relative p-5 transition-all hover:border-white",
            task.completed && "opacity-60",
            task.archived && "opacity-40",
            task.pinned && "ring-2 ring-white/30 bg-gray-900"
          )}
        >
          {/* Pin indicator */}
          {task.pinned && (
            <div className="absolute top-3 right-3">
              <Pin className="w-4 h-4 text-white/60" fill="currentColor" />
            </div>
          )}

          <div className="flex items-start gap-4">
            {/* Checkbox */}
            <button
              onClick={() => onToggle(task.id, !task.completed)}
              className="mt-1 transition-transform hover:scale-110"
            >
              {task.completed ? (
                <CheckCircle2 className="w-6 h-6 text-white" />
              ) : (
                <Circle className="w-6 h-6 text-muted-foreground hover:text-white transition-colors" />
              )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3
                  className={cn(
                    "text-base font-semibold transition-all",
                    task.completed && "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </h3>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-black rounded-xl border-2 border-white/40"
                  >
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onPinToggle(task.id, task.pinned)}
                    >
                      {task.pinned ? (
                        <>
                          <PinOff className="w-4 h-4 mr-2" />
                          Unpin
                        </>
                      ) : (
                        <>
                          <Pin className="w-4 h-4 mr-2" />
                          Pin
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onArchiveToggle(task.id, task.archived)}
                    >
                      {task.archived ? (
                        <>
                          <ArchiveRestore className="w-4 h-4 mr-2" />
                          Restore
                        </>
                      ) : (
                        <>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowConfirmDelete(true)}
                      className="text-destructive focus:text-destructive text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2 text-red-800" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {task.description && (
                <div
                  className={cn(
                    "mt-2 prose prose-sm max-w-none",
                    task.completed && "line-through opacity-60"
                  )}
                  dangerouslySetInnerHTML={parseSimpleMarkdown(
                    task.description
                  )}
                />
              )}

              {/* Tags */}
              <div className="flex items-center flex-wrap gap-2 mt-3">
                {/* Priority Tag (Now uses Red/Yellow/Green styles) */}
                <span
                  className={cn(
                    "px-2 py-1 rounded-md text-xs font-medium",
                    priorityConfig[task.priority].color
                  )}
                >
                  {priorityConfig[task.priority].label}
                </span>

                {/* Overdue Tag */}
                {isOverdue && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-red-700/50 text-red-300">
                    <AlertTriangle className="w-3 h-3" />
                    OVERDUE
                  </div>
                )}

                {formattedDueDate && (
                  <div
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-md text-xs",
                      isOverdue
                        ? "bg-red-950/40 text-red-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Calendar className="w-3 h-3" />
                    {formattedDueDate}
                  </div>
                )}

                {displayTime && (
                  <span className="text-xs text-muted-foreground">
                    {timeText}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Delete Confirmation */}
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "
              <span className="text-red-600 font-bold">{task.title}</span>"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(task.id);
                setShowConfirmDelete(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
