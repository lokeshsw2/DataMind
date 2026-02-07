"use client";

import { cn } from "@/lib/utils";
import type { TamboThreadMessage } from "@tambo-ai/react";
import { useTambo } from "@tambo-ai/react";
import { Download, FileText, FileCode, FileDown, Check, Loader2 } from "lucide-react";
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

  lines.push(`# ${threadName || "DataMind Report"}`);
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
  const title = threadName || "DataMind Report";

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
 * Captures the rendered chat area (including React components, charts, etc.)
 * and exports it as a multi-page PDF.
 */
async function exportChatAsPdf(threadName?: string) {
  const { default: html2canvas } = await import("html2canvas-pro");
  const { jsPDF } = await import("jspdf");

  // Find the scrollable message container that holds all rendered messages
  const container = document.querySelector(
    '[data-slot="scrollable-message-container"]'
  ) as HTMLElement | null;

  if (!container) {
    console.error("Could not find message container for PDF export");
    return;
  }

  const title = threadName || "DataMind Report";
  const timestamp = new Date().toISOString().slice(0, 10);
  const safeFileName = title
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

  // Save and temporarily override scroll position so html2canvas captures everything
  const originalScrollTop = container.scrollTop;
  const originalOverflow = container.style.overflow;
  const originalHeight = container.style.height;
  const originalMaxHeight = container.style.maxHeight;

  container.style.overflow = "visible";
  container.style.height = "auto";
  container.style.maxHeight = "none";

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: null, // Preserve existing background
      windowWidth: container.scrollWidth,
      windowHeight: container.scrollHeight,
    });

    // Restore container styles
    container.style.overflow = originalOverflow;
    container.style.height = originalHeight;
    container.style.maxHeight = originalMaxHeight;
    container.scrollTop = originalScrollTop;

    // Create PDF with proper dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 10; // margin in mm
    const contentWidth = imgWidth - margin * 2;

    const imgHeight = (canvas.height * contentWidth) / canvas.width;
    const availableHeight = pageHeight - margin * 2 - 15; // space for header

    const pdf = new jsPDF("p", "mm", "a4");

    // Add header on first page
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(title, margin, margin + 8);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(120, 120, 120);
    pdf.text(
      `Generated on ${new Date().toLocaleString()}`,
      margin,
      margin + 14
    );
    pdf.setDrawColor(220, 220, 220);
    pdf.line(margin, margin + 17, imgWidth - margin, margin + 17);
    pdf.setTextColor(0, 0, 0);

    const headerOffset = 22; // space taken by header in mm
    const imgData = canvas.toDataURL("image/png");

    if (imgHeight <= availableHeight - headerOffset + 15) {
      // Content fits on one page
      pdf.addImage(
        imgData,
        "PNG",
        margin,
        margin + headerOffset,
        contentWidth,
        imgHeight
      );
    } else {
      // Multi-page: slice the canvas into page-sized chunks
      let yOffset = 0;
      let isFirstPage = true;

      while (yOffset < imgHeight) {
        if (!isFirstPage) {
          pdf.addPage();
        }

        const currentAvailableHeight = isFirstPage
          ? availableHeight - headerOffset + 15
          : availableHeight + 15;
        const currentTopMargin = isFirstPage ? margin + headerOffset : margin;

        // Calculate what portion of the source canvas to draw on this page
        const sourceY = (yOffset / imgHeight) * canvas.height;
        const pageContentHeight = Math.min(
          currentAvailableHeight,
          imgHeight - yOffset
        );
        const sourceHeight = (pageContentHeight / imgHeight) * canvas.height;

        // Create a temporary canvas for this page slice
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;

        const ctx = pageCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            sourceHeight,
            0,
            0,
            canvas.width,
            sourceHeight
          );
        }

        const pageImgData = pageCanvas.toDataURL("image/png");
        pdf.addImage(
          pageImgData,
          "PNG",
          margin,
          currentTopMargin,
          contentWidth,
          pageContentHeight
        );

        yOffset += currentAvailableHeight;
        isFirstPage = false;
      }
    }

    pdf.save(`${safeFileName}-${timestamp}.pdf`);
  } catch (err) {
    // Restore container styles on error
    container.style.overflow = originalOverflow;
    container.style.height = originalHeight;
    container.style.maxHeight = originalMaxHeight;
    container.scrollTop = originalScrollTop;
    console.error("PDF export failed:", err);
    throw err;
  }
}

/**
 * Export chat button with dropdown for format selection.
 */
export function ExportChatButton({ className }: { className?: string }) {
  const { thread } = useTambo();
  const [showMenu, setShowMenu] = useState(false);
  const [exported, setExported] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const messages = thread?.messages || [];
  const hasMessages = messages.filter((m) => m.role !== "tool").length > 0;

  const handleExport = useCallback(
    (format: "md" | "html") => {
      if (!hasMessages) return;

      const threadName = thread?.name || "DataMind Report";
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

  const handlePdfExport = useCallback(async () => {
    if (!hasMessages) return;

    setPdfLoading(true);
    setShowMenu(false);

    try {
      const threadName = thread?.name || "DataMind Report";
      await exportChatAsPdf(threadName);
      setExported("pdf");
      setTimeout(() => setExported(null), 2000);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setPdfLoading(false);
    }
  }, [hasMessages, thread?.name]);

  // Close menu on outside click
  const handleBlur = useCallback(() => {
    setTimeout(() => setShowMenu(false), 150);
  }, []);

  return (
    <div className={cn("relative", className)} ref={menuRef}>
      <button
        onClick={() => hasMessages && !pdfLoading && setShowMenu(!showMenu)}
        onBlur={handleBlur}
        disabled={!hasMessages || pdfLoading}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
          hasMessages && !pdfLoading
            ? "text-foreground hover:bg-muted cursor-pointer"
            : "text-muted-foreground/40 cursor-not-allowed"
        )}
        title={hasMessages ? "Export analysis report" : "No messages to export"}
      >
        {pdfLoading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
            <span className="text-blue-500">Generating PDF…</span>
          </>
        ) : exported ? (
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
        <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[180px]">
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
          <div className="border-t border-border my-1" />
          <button
            onMouseDown={handlePdfExport}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
          >
            <FileDown className="h-3.5 w-3.5 text-red-500" />
            PDF with Components (.pdf)
          </button>
        </div>
      )}
    </div>
  );
}
