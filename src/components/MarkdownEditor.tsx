import { useState } from "react";
import { Bold, Italic, Link, List, Eye, Edit } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const parseSimpleMarkdown = (text: string | null) => {
  if (!text) return { __html: "" };

  let html = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-green-600 underline hover:text-green-700 transition-colors font-medium">$1</a>'
    );

  const lines = html.split("\n");
  let result = "";
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) {
      if (inList) {
        result += "</ul>";
        inList = false;
      }
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) {
        result +=
          '<ul class="list-disc pl-5 text-sm text-gray-700 space-y-1 mt-2 mb-2">';
        inList = true;
      }
      result += `<li class="ml-2">${line.substring(2)}</li>`;
    } else {
      if (inList) {
        result += "</ul>";
        inList = false;
      }
      result += `<p class="text-sm mb-2 text-gray-700 leading-relaxed">${line}</p>`;
    }
  }

  if (inList) {
    result += "</ul>";
  }

  return { __html: result };
};

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [cursorPosition, setCursorPosition] = useState(0);

  const insertMarkdown = (
    before: string,
    after: string = "",
    placeholder: string = ""
  ) => {
    const textarea = document.getElementById(
      "markdown-textarea"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = selectedText || placeholder;

    const newValue =
      value.substring(0, start) +
      before +
      replacement +
      after +
      value.substring(end);
    onChange(newValue);

    // Set cursor position after insertion
    setTimeout(() => {
      const newCursorPos = start + before.length + replacement.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      onChange(value.substring(0, start) + "  " + value.substring(end));
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100 transition-all">
      {/* Tabs */}
      <div className="flex bg-gray-50 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("write")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium text-sm transition-all ${
            activeTab === "write"
              ? "bg-white text-green-700 border-b-2 border-green-600"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Edit className="w-4 h-4" /> Write
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium text-sm transition-all ${
            activeTab === "preview"
              ? "bg-white text-green-700 border-b-2 border-green-600"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Eye className="w-4 h-4" /> Preview
        </button>
      </div>

      {/* Toolbar - Only in Write Mode */}
      {activeTab === "write" && (
        <div className="flex flex-wrap gap-1 p-2 bg-white border-b border-gray-200">
          <button
            type="button"
            onClick={() => insertMarkdown("**", "**", "bold text")}
            title="Bold (Ctrl+B)"
            className="p-2 rounded-lg hover:bg-green-100 text-gray-700 hover:text-green-700 transition-colors"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown("*", "*", "italic text")}
            title="Italic (Ctrl+I)"
            className="p-2 rounded-lg hover:bg-green-100 text-gray-700 hover:text-green-700 transition-colors"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown("[", "](url)", "link text")}
            title="Insert Link"
            className="p-2 rounded-lg hover:bg-green-100 text-gray-700 hover:text-green-700 transition-colors"
          >
            <Link className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              const textarea = document.getElementById(
                "markdown-textarea"
              ) as HTMLTextAreaElement;
              const start = textarea.selectionStart;
              const lineStart = value.lastIndexOf("\n", start - 1) + 1;
              const newValue =
                value.substring(0, lineStart) +
                "- " +
                value.substring(lineStart);
              onChange(newValue);
              setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(lineStart + 2, lineStart + 2);
              }, 0);
            }}
            title="Bullet List"
            className="p-2 rounded-lg hover:bg-green-100 text-gray-700 hover:text-green-700 transition-colors"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor Area */}
      {activeTab === "write" ? (
        <textarea
          id="markdown-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-3 resize-none outline-none min-h-[160px] text-sm text-gray-800 leading-relaxed"
          placeholder={
            placeholder ||
            "Add details using Markdown...\n\nTry:\n**bold** *italic* [link](url)\n- list item"
          }
          rows={6}
        />
      ) : (
        <div
          className="px-4 py-3 min-h-[160px] bg-gray-50 overflow-y-auto prose prose-sm max-w-none"
          dangerouslySetInnerHTML={
            value
              ? parseSimpleMarkdown(value)
              : {
                  __html:
                    '<p class="text-gray-400 italic">Nothing to preview yet. Start writing in the Write tab.</p>',
                }
          }
        />
      )}

      {/* Helper Text */}
      {activeTab === "write" && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          Supports: <span className="font-mono">**bold**</span>,{" "}
          <span className="font-mono">*italic*</span>,
          <span className="font-mono"> [link](url)</span>,{" "}
          <span className="font-mono">- lists</span>
        </div>
      )}
    </div>
  );
}
