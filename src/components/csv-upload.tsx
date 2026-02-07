"use client";

import { useCsvData, inferColumnTypes } from "@/lib/csv-context";
import { Upload, FileSpreadsheet, X, Loader2 } from "lucide-react";
import Papa from "papaparse";
import { useCallback, useRef, useState } from "react";
import * as XLSX from "xlsx";

/**
 * Drag-and-drop file upload component for CSV and Excel files.
 * Parses files client-side and pushes data into CsvDataContext.
 */
export function CsvUpload() {
  const { data, setData, isLoading, setIsLoading, clearData } = useCsvData();
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsLoading(true);

      try {
        const extension = file.name.split(".").pop()?.toLowerCase();

        if (extension === "csv") {
          // Parse CSV with PapaParse
          Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.errors.length > 0 && results.data.length === 0) {
                setError("Failed to parse CSV: " + results.errors[0].message);
                setIsLoading(false);
                return;
              }

              const rows = results.data as Record<string, string | number | null>[];
              const headers = results.meta.fields || [];
              const columnTypes = inferColumnTypes(headers, rows);

              setData({
                fileName: file.name,
                headers,
                rows,
                columnTypes,
                totalRows: rows.length,
              });
              setIsLoading(false);
            },
            error: (err) => {
              setError("Failed to parse CSV: " + err.message);
              setIsLoading(false);
            },
          });
        } else if (
          extension === "xlsx" ||
          extension === "xls" ||
          extension === "xlsb"
        ) {
          // Parse Excel with SheetJS
          const arrayBuffer = await file.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json<Record<string, string | number | null>>(firstSheet);

          if (jsonData.length === 0) {
            setError("The spreadsheet appears to be empty.");
            setIsLoading(false);
            return;
          }

          const headers = Object.keys(jsonData[0]);
          const columnTypes = inferColumnTypes(headers, jsonData);

          setData({
            fileName: file.name,
            headers,
            rows: jsonData,
            columnTypes,
            totalRows: jsonData.length,
          });
          setIsLoading(false);
        } else {
          setError("Unsupported file type. Please upload a CSV or Excel file.");
          setIsLoading(false);
        }
      } catch (err) {
        setError(
          "Failed to read file: " +
            (err instanceof Error ? err.message : "Unknown error")
        );
        setIsLoading(false);
      }
    },
    [setData, setIsLoading]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) parseFile(file);
    },
    [parseFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) parseFile(file);
    },
    [parseFile]
  );

  // If data is loaded, show file info instead of upload zone
  if (data) {
    return (
      <div className="border border-border rounded-lg p-4 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {data.fileName}
              </p>
              <p className="text-xs text-muted-foreground">
                {data.totalRows.toLocaleString()} rows &middot;{" "}
                {data.headers.length} columns
              </p>
            </div>
          </div>
          <button
            onClick={clearData}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${
            isDragOver
              ? "border-blue-500 bg-blue-500/10"
              : "border-border hover:border-muted-foreground hover:bg-muted/50"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.xlsb"
          onChange={handleFileInput}
          className="hidden"
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            <p className="text-sm text-muted-foreground">Parsing file...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Drop your CSV or Excel file here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports .csv, .xlsx, .xls files
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 p-2 rounded-md bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
