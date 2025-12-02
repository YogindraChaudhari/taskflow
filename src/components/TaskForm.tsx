import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Task } from "../lib/supabase";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Calendar,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  Eye,
  Edit,
} from "lucide-react";
import { cn } from "../lib/utils"; // Assuming cn utility is available

interface TaskFormProps {
  onSubmit: (
    task: Omit<Task, "id" | "created_at" | "updated_at" | "user_id"> & {
      user_id?: string;
    }
  ) => void;
  onClose: () => void;
  editingTask?: Task | null;
}

const parseSimpleMarkdown = (text: string): { __html: string } => {
  if (!text) return { __html: "" };
  let html = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" class="text-primary underline">$1</a>'
    );
  const lines = html.split("\n");
  let result = "";
  for (const line of lines) {
    // Basic list handling
    if (line.trim().startsWith("- ")) {
      // Assuming a simple ul/li structure is created externally or needs to be wrapped
      // For this simplified parser, we'll just output the li
      result += `<li class="ml-4">${line.trim().substring(2)}</li>`;
    } else if (line.trim()) {
      result += `<p class="mb-2">${line}</p>`;
    }
  }
  return { __html: result };
};

// 💡 NEW: Configuration for priority colors
const priorityColorMap = {
  low: "bg-green-600 hover:bg-green-700 text-white",
  medium: "bg-yellow-600 hover:bg-yellow-700 text-black", // Black text for better contrast on yellow
  high: "bg-red-600 hover:bg-red-700 text-white",
};

// 💡 NEW: Configuration for priority labels
const priorityLabelMap = {
  low: "Low",
  medium: "Med", // Changed to 'Med'
  high: "High",
};

export function TaskForm({ onSubmit, onClose, editingTask }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [markdownTab, setMarkdownTab] = useState("write");

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setPriority(editingTask.priority);
      setDueDate(
        editingTask.due_date ? editingTask.due_date.substring(0, 10) : ""
      );
    }
  }, [editingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      completed: editingTask?.completed || false,
      due_date: dueDate || null,
      pinned: editingTask?.pinned || false,
      archived: editingTask?.archived || false,
    });
  };

  const insertMarkdown = (syntax: string) => {
    setDescription((prev) => prev + syntax);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Tabs value={markdownTab} onValueChange={setMarkdownTab}>
              <TabsList className="w-full">
                {/* 💡 STYLED: Active tab background to white with black text */}
                <TabsTrigger
                  value="write"
                  className={cn(
                    "flex-1",
                    markdownTab === "write" && "bg-white text-black shadow-md"
                  )}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Write
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className={cn(
                    "flex-1",
                    markdownTab === "preview" && "bg-white text-black shadow-md"
                  )}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="write" className="space-y-2">
                <div className="flex gap-1 p-1 bg-muted rounded-md">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => insertMarkdown("**bold**")}
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => insertMarkdown("*italic*")}
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => insertMarkdown("[link](url)")}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => insertMarkdown("\n- list item")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details using Markdown..."
                  rows={6}
                />
              </TabsContent>

              <TabsContent value="preview">
                <div
                  className="min-h-[150px] p-3 bg-muted rounded-md prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={parseSimpleMarkdown(description)}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <div className="flex gap-2">
                {(["low", "medium", "high"] as const).map((p) => (
                  <Button
                    key={p}
                    type="button"
                    size="sm"
                    // 💡 STYLED: Apply color based on priority if selected
                    variant={priority === p ? "default" : "outline"}
                    onClick={() => setPriority(p)}
                    className={cn(
                      "flex-1 capitalize",
                      // Apply the custom color map if the button is selected
                      priority === p && priorityColorMap[p]
                    )}
                  >
                    {/* 💡 UPDATED: Use 'Med' for medium priority */}
                    {priorityLabelMap[p]}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()} className="flex-1">
              {editingTask ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
