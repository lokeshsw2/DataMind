"use client";

import { cn } from "@/lib/utils";
import type { TamboThreadMessage } from "@tambo-ai/react";
import { useTambo } from "@tambo-ai/react";
import { Download, FileText, FileCode, Check } from "lucide-react";
import { useCallback, useRef, useState } from "react";

/**
 * Converts a thread of messages into a markdown report.
 */
function threadToMarkdown(
  messages: TamboThreadMessage[],
  threadName?: string
): string {
  const lines: string[] = [];
  const now = new Date().toLocaleString();

  lines.push(`# ${threadName || "CSV Analysis Report"}`);
  lines.push("");
  lines.push(`> Generated on ${now}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  for (const msg of messages) {
    if (msg.role === "tool") continue; // skip raw tool responses

    const role = msg.role === "user" ? "You" : "Assistant";
    const icon = msg.role === "user" ? "**You:**" : "**Assistant:**";

    lines.push(icon);
    lines.push("");

    // Extract text content
    const content = msg.content;
    if (typeof content === "string") {
      lines.push(content);
    } else if (Array.isArray(content)) {
      for (const part of content) {
        if (part?.type === "text" && part.text) {
          lines.push(part.text);
        }
      }
    }

    // Note rendered component if present
    if (msg.renderedComponent) {
      const compDecision = msg.component as Record<string, unknown> | undefined;
      const compName =
        compDecision?.componentName ?? compDecision?.name ?? "UI Component";
      lines.push("");
      lines.push(`> *[Generated ${compName} component]*`);
    }

    // Note tool calls
    const toolCall =
      msg.toolCallRequest ??
      (msg.component as Record<string, unknown> | undefined)?.toolCallRequest as
        | { toolName?: string }
        | undefined;
    if (toolCall?.toolName) {
      lines.push("");
      lines.push(`> *Called tool: ${toolCall.toolName}*`);
    }

    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Converts a thread of messages into an HTML report.
 */
function threadToHtml(
  messages: TamboThreadMessage[],
  threadName?: string
): string {
  const now = new Date().toLocaleString();
  const title = threadName || "CSV Analysis Report";

  const messageHtml = messages
    .filter((m) => m.role !== "tool")
    .map((msg) => {
      const isUser = msg.role === "user";
      let textContent = "";

      if (typeof msg.content === "string") {
        textContent = msg.content;
      } else if (Array.isArray(msg.content)) {
        textContent = msg.content
          .filter((p) => p?.type === "text" && p.text)
          .map((p) => p.text)
          .join(" ");
      }

      // Escape HTML
      textContent = textContent
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");

      const compDecision = msg.component as Record<string, unknown> | undefined;
      const compName =
        compDecision?.componentName ?? compDecision?.name ?? "UI Component";
      const componentNote = msg.renderedComponent
        ? `<div style="margin-top:8px;padding:8px 12px;background:#f0f9ff;border-radius:6px;font-size:12px;color:#0369a1;">Generated ${compName} component</div>`
        : "";

      const toolCall =
        msg.toolCallRequest ??
        (compDecision?.toolCallRequest as { toolName?: string } | undefined);
      const toolNote = toolCall?.toolName
        ? `<div style="margin-top:4px;font-size:11px;color:#6b7280;">Called tool: ${toolCall.toolName}</div>`
        : "";

      return `
        <div style="margin-bottom:16px;display:flex;flex-direction:column;${isUser ? "align-items:flex-end" : "align-items:flex-start"}">
          <div style="font-size:11px;font-weight:600;color:#6b7280;margin-bottom:4px;">${isUser ? "You" : "Assistant"}</div>
          <div style="max-width:80%;padding:12px 16px;border-radius:12px;${isUser ? "background:#3b82f6;color:white;" : "background:#f3f4f6;color:#1f2937;"}font-size:14px;line-height:1.6;">
            ${textContent}
            ${componentNote}
            ${toolNote}
          </div>
        </div>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; background: #ffffff; color: #1f2937; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    .meta { font-size: 12px; color: #6b7280; margin-bottom: 32px; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">Generated on ${now}</div>
  <hr>
  ${messageHtml}
</body>
</html>`;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export chat button with dropdown for format selection.
 */
export function ExportChatButton({ className }: { className?: string }) {
  const { thread } = useTambo();
  const [showMenu, setShowMenu] = useState(false);
  const [exported, setExported] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const messages = thread?.messages || [];
  const hasMessages = messages.filter((m) => m.role !== "tool").length > 0;

  const handleExport = useCallback(
    (format: "md" | "html") => {
      if (!hasMessages) return;

      const threadName = thread?.name || "CSV Analysis Report";
      const timestamp = new Date().toISOString().slice(0, 10);
      const safeFileName = threadName
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();

      if (format === "md") {
        const content = threadToMarkdown(messages, threadName);
        downloadFile(content, `${safeFileName}-${timestamp}.md`, "text/markdown");
      } else {
        const content = threadToHtml(messages, threadName);
        downloadFile(content, `${safeFileName}-${timestamp}.html`, "text/html");
      }

      setExported(format);
      setShowMenu(false);
      setTimeout(() => setExported(null), 2000);
    },
    [messages, hasMessages, thread?.name]
  );

  // Close menu on outside click
  const handleBlur = useCallback(() => {
    setTimeout(() => setShowMenu(false), 150);
  }, []);

  return (
    <div className={cn("relative", className)} ref={menuRef}>
      <button
        onClick={() => hasMessages && setShowMenu(!showMenu)}
        onBlur={handleBlur}
        disabled={!hasMessages}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
          hasMessages
            ? "text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            : "text-muted-foreground/40 cursor-not-allowed"
        )}
        title={hasMessages ? "Export analysis report" : "No messages to export"}
      >
        {exported ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-emerald-500">Exported!</span>
          </>
        ) : (
          <>
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </>
        )}
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[160px]">
          <button
            onMouseDown={() => handleExport("md")}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
          >
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            Markdown (.md)
          </button>
          <button
            onMouseDown={() => handleExport("html")}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
          >
            <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
            HTML Report (.html)
          </button>
        </div>
      )}
    </div>
  );
}
