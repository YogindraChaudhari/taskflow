import { Task } from "../lib/supabase";

type Filter = "all" | "active" | "completed" | "archived";

interface FilterTabsProps {
  activeFilter: Filter;
  onFilterChange: (filter: Filter) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
    archived: number;
  };
}

const tabs: { id: Filter; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "all", label: "All" },
  { id: "archived", label: "Archived" },
];

export function FilterTabs({
  activeFilter,
  onFilterChange,
  counts,
}: FilterTabsProps) {
  return (
    <div className="flex bg-gray-50 border border-gray-200 p-1 rounded-2xl overflow-x-auto whitespace-nowrap shadow-sm mx-auto max-w-full sm:max-w-xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onFilterChange(tab.id)}
          className={`
      flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium 
      transition-all duration-300 ease-in-out flex-shrink-0 
      
      ${
        activeFilter === tab.id
          ? "bg-white text-gray-900 shadow-lg ring-1 ring-gray-100"
          : "text-gray-600 hover:bg-gray-100"
      }
     `}
        >
          {tab.label}
          {/* Count Badge */}
          <span
            className={`
       px-2 py-0.5 text-xs font-semibold rounded-full 
       transition-colors duration-300
       ${
         activeFilter === tab.id
           ? "bg-gray-800 text-white"
           : "bg-gray-200 text-gray-600"
       }
      `}
          >
            {counts[tab.id]}
          </span>
        </button>
      ))}
    </div>
  );
}
