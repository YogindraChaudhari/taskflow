import { create } from "zustand";
import { supabase, Task } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";

type View = "list" | "calendar" | "profile";
type SortKey = "updated_at" | "created_at";

interface TaskStore {
  // State
  session: Session | null;
  tasks: Task[];
  loading: boolean;
  showForm: boolean;
  editingTask: Task | null;
  view: View;
  sortBy: SortKey;

  // Actions
  setSession: (session: Session | null) => void;
  setTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  setShowForm: (show: boolean) => void;
  setEditingTask: (task: Task | null) => void;
  setView: (view: View) => void;
  setSortBy: (sortBy: SortKey) => void;

  // Task Operations
  loadTasks: () => Promise<void>;
  createTask: (
    taskData: Omit<Task, "id" | "created_at" | "updated_at" | "user_id"> & {
      user_id?: string;
    }
  ) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  toggleTask: (id: string, completed: boolean) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  pinTask: (id: string, pinned: boolean) => Promise<void>;
  archiveTask: (id: string, archived: boolean) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial State
  session: null,
  tasks: [],
  loading: true,
  showForm: false,
  editingTask: null,
  view: "list",
  sortBy: "updated_at",

  // Basic Setters
  setSession: (session) => set({ session }),
  setTasks: (tasks) => set({ tasks }),
  setLoading: (loading) => set({ loading }),
  setShowForm: (show) => set({ showForm: show }),
  setEditingTask: (task) => set({ editingTask: task }),
  setView: (view) => set({ view }),
  setSortBy: (sortBy) => set({ sortBy }),

  // Load Tasks
  loadTasks: async () => {
    const { session, sortBy } = get();
    if (!session?.user.id) return;

    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", session.user.id)
        .order("pinned", { ascending: false })
        .order(sortBy, { ascending: false });

      if (error) throw error;
      set({ tasks: data || [] });
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      set({ loading: false });
    }
  },

  // Create/Update Task
  createTask: async (taskData) => {
    const { session, editingTask, loadTasks } = get();
    if (!session?.user.id) return;

    const taskToSave = {
      ...taskData,
      user_id: session.user.id,
      pinned: taskData.pinned ?? false,
      archived: taskData.archived ?? false,
    };

    try {
      if (editingTask) {
        const { error } = await supabase
          .from("tasks")
          .update({ ...taskToSave, updated_at: new Date().toISOString() })
          .eq("id", editingTask.id)
          .eq("user_id", session.user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tasks").insert([taskToSave]);
        if (error) throw error;
      }

      await loadTasks();
      set({ showForm: false, editingTask: null });
    } catch (error) {
      console.error("Error saving task:", error);
      throw error;
    }
  },

  // Update Task
  updateTask: async (id, updates) => {
    const { session, loadTasks } = get();
    if (!session?.user.id) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", session.user.id);

      if (error) throw error;
      await loadTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  },

  // Toggle Task Completion
  toggleTask: async (id, completed) => {
    const { updateTask } = get();
    await updateTask(id, { completed });
  },

  // Delete Task
  deleteTask: async (id) => {
    const { session, loadTasks } = get();
    if (!session?.user.id) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .eq("user_id", session.user.id);

      if (error) throw error;
      await loadTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  },

  // Pin Task
  pinTask: async (id, pinned) => {
    const { updateTask } = get();
    await updateTask(id, { pinned: !pinned });
  },

  // Archive Task
  archiveTask: async (id, archived) => {
    const { updateTask } = get();
    await updateTask(id, { archived: !archived });
  },
}));
