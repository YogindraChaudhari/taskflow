import { useState } from "react";
import {
  User,
  Mail,
  Calendar,
  Trash2,
  LogOut,
  X,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useTaskStore } from "../store/taskStore";
import toast from "react-hot-toast";

export function UserProfile() {
  const { session } = useTaskStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const user = session?.user;
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown";

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to log out");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    try {
      // First delete all user's tasks
      const { error: tasksError } = await supabase
        .from("tasks")
        .delete()
        .eq("user_id", user?.id);

      if (tasksError) throw tasksError;

      const { error: authError } = await supabase.rpc("delete_user");

      if (authError) {
        // Fallback: just sign out if deletion isn't available
        await supabase.auth.signOut();
        toast.success(
          "Data deleted. Please contact support to remove your account."
        );
      } else {
        toast.success("Account deleted successfully");
      }

      setShowDeleteConfirm(false);
      setDeleteInput("");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-black rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
          <div className="w-16 h-16 bg-linear-to-br from-white to-gray-900 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-gray-800" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-50">
              Profile Settings
            </h2>
            <p className="text-gray-600 text-sm">
              Manage your account and preferences
            </p>
          </div>
        </div>

        {/* User Information */}
        <div className="space-y-6 mb-8">
          <div className="flex items-start gap-4 p-4 bg-black rounded-xl border border-green-200">
            <Mail className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-50">Email Address</p>
              <p className="text-base text-gray-50 font-semibold">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-black rounded-xl border border-gray-200">
            <Calendar className="w-5 h-5 text-gray-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-50">Member Since</p>
              <p className="text-base text-gray-50 font-semibold">
                {createdAt}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-black hover:text-red-600 text-gray-50 rounded-xl font-semibold transition-all duration-200 border-2 border-white hover:border-red-600"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-black hover:bg-red-900 text-gray-50 rounded-xl font-semibold transition-all duration-200 border-3 border-red-900"
          >
            <Trash2 className="w-5 h-5" />
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <h2 className="text-xl font-bold text-gray-800">
                  Delete Account
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteInput("");
                }}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                This action cannot be undone. This will permanently delete your
                account and remove all your tasks from our servers.
              </p>
              <p className="text-sm font-medium text-gray-800 mb-2">
                Type <span className="font-bold text-red-600">DELETE</span> to
                confirm:
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                placeholder="Type DELETE"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteInput("");
                }}
                className="flex-1 py-3 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== "DELETE"}
                className="flex-1 py-3 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
