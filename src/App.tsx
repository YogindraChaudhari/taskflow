import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, Task } from "./lib/supabase";
import { useTaskStore } from "./store/taskStore";
import { Sidebar } from "./components/Sidebar";
import { FloatingDock } from "./components/FloatingDock";
import { TaskList } from "./components/TaskList";
import { TaskForm } from "./components/TaskForm";
import { CalendarView } from "./components/CalendarView";
import { UserProfile } from "./components/UserProfile";
import { AuthPage } from "./components/AuthPage";
import { Loader2 } from "lucide-react";
import { Toaster } from "react-hot-toast";

function App() {
  const {
    session,
    setSession,
    tasks,
    loading,
    showForm,
    editingTask,
    view,
    sortBy,
    setShowForm,
    setEditingTask,
    loadTasks,
    createTask,
    toggleTask,
    deleteTask,
    pinTask,
    archiveTask,
    setSortBy,
  } = useTaskStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  useEffect(() => {
    if (session) {
      loadTasks();
    }
  }, [session, loadTasks]);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const completedCount = tasks.filter((t) => t.completed && !t.archived).length;
  const activeTaskCount = tasks.filter((t) => !t.archived).length;

  if (!session) {
    return (
      <>
        <AuthPage />
        <Toaster
          position="top-center"
          toastOptions={{
            className: "bg-card border-border text-foreground",
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster
        position="top-center"
        toastOptions={{
          className: "bg-card border-border text-foreground",
        }}
      />

      {/* Desktop Sidebar */}
      <Sidebar
        onNewTask={() => {
          setEditingTask(null);
          setShowForm(true);
        }}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pb-24 lg:pb-8">
          {/* Header with Progress */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  {view === "list"
                    ? "My Tasks"
                    : view === "calendar"
                    ? "Calendar"
                    : "Profile"}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {view === "list" &&
                    `${activeTaskCount} active tasks, ${completedCount} completed`}
                  {view === "calendar" && "View your tasks by date"}
                  {view === "profile" && "Manage your account settings"}
                </p>
              </div>
            </div>

            {view !== "profile" && (
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Progress</span>
                  <span className="text-muted-foreground">
                    {completedCount} / {activeTaskCount} completed
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        activeTaskCount > 0
                          ? (completedCount / activeTaskCount) * 100
                          : 0
                      }%`,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-20"
              >
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {view === "list" && (
                  <TaskList
                    tasks={tasks}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onEdit={handleEditTask}
                    onPinToggle={pinTask}
                    onArchiveToggle={archiveTask}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                  />
                )}
                {view === "calendar" && (
                  <CalendarView
                    tasks={tasks}
                    onEdit={handleEditTask}
                    onDelete={deleteTask}
                  />
                )}
                {view === "profile" && <UserProfile />}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Navigation */}
      <FloatingDock
        onNewTask={() => {
          setEditingTask(null);
          setShowForm(true);
        }}
      />

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          onSubmit={createTask}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          editingTask={editingTask}
        />
      )}
    </div>
  );
}

export default App;
