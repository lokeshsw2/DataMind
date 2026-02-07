"use client";

import { CsvUpload } from "@/components/csv-upload";
import { CsvPreview } from "@/components/csv-preview";
import { ExportChatButton } from "@/components/export-chat";
import { ResizeHandle } from "@/components/resize-handle";
import { DataFilterPanel } from "@/components/tambo/data-filter-panel";
import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { CsvDataProvider, getCsvDataRef } from "@/lib/csv-context";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";
import { FileSpreadsheet, MessageSquare } from "lucide-react";
import { useCallback, useState } from "react";

const MIN_PANEL_WIDTH = 320;
const MAX_PANEL_WIDTH = 1100;
const DEFAULT_PANEL_WIDTH = 600;

/**
 * Context helper that provides CSV metadata to the Tambo agent
 * on every message so the AI always knows what data is available.
 */
function csvContextHelper() {
  const csvData = getCsvDataRef();
  if (!csvData) {
    return {
      csvStatus:
        "No CSV file uploaded yet. Ask the user to upload a CSV or Excel file first.",
    };
  }

  return {
    csvStatus: "CSV file is loaded and ready for analysis",
    fileName: csvData.fileName,
    totalRows: csvData.totalRows,
    totalColumns: csvData.headers.length,
    columns: csvData.headers.map((h) => ({
      name: h,
      type: csvData.columnTypes[h],
    })),
    instructions:
      "Use the available tools (getDataSample, getColumnStats, queryData, getColumnValues, aggregateData) to analyze this data. Always call getDataSample first to understand the data structure before doing deeper analysis. Use the Graph component for visualizations, DataTable for tabular results, SummaryStats for statistical summaries, and InsightCard for narrative insights.",
  };
}

/**
 * Inner component that uses CsvDataProvider context
 */
function ChatPageContent() {
  const mcpServers = useMcpServers();
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);

  const handleResize = useCallback((deltaX: number) => {
    setPanelWidth((prev) =>
      Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, prev + deltaX))
    );
  }, []);

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
      mcpServers={mcpServers}
      contextHelpers={{
        csvData: csvContextHelper,
      }}
    >
      <div className="h-screen flex">
        {/* Left Panel - CSV Viewer (resizable) */}
        <div
          className="flex flex-col bg-background border-r border-border"
          style={{ width: panelWidth, minWidth: MIN_PANEL_WIDTH, maxWidth: MAX_PANEL_WIDTH }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-muted/30">
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-semibold text-foreground">
              Data Explorer
            </h2>
          </div>

          {/* Upload area */}
          <div className="p-3">
            <CsvUpload />
          </div>

          {/* Filter panel */}
          <div className="px-3 pb-2">
            <DataFilterPanel />
          </div>

          {/* Data preview table */}
          <CsvPreview />
        </div>

        {/* Resize Handle */}
        <ResizeHandle onResize={handleResize} />

        {/* Right Panel - Chat */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Chat header with export button */}
          <div className="px-4 py-2.5 border-b border-border flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-foreground">
                AI Analysis
              </h2>
            </div>
            <ExportChatButton />
          </div>

          {/* Chat thread */}
          <div className="flex-1 min-h-0">
            <MessageThreadFull className="h-full" />
          </div>
        </div>
      </div>
    </TamboProvider>
  );
}

/**
 * Chat page with split-panel layout.
 * Left: CSV upload, preview, filters (resizable).
 * Right: Tambo AI chat for data analysis with export.
 */
export default function Home() {
  return (
    <CsvDataProvider>
      <ChatPageContent />
    </CsvDataProvider>
  );
}
