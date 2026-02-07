"use client";

import { cn } from "@/lib/utils";
import { useTamboComponentState } from "@tambo-ai/react";
import { ArrowUpDown } from "lucide-react";
import * as React from "react";
import { useState, useMemo } from "react";
import { z } from "zod";

/**
 * Zod schema for DataTable component props.
 * Uses a 2D array for rows instead of z.record() (which Tambo doesn't support).
 * Each inner array corresponds to one row, with values aligned to the columns array.
 */
export const dataTableSchema = z.object({
  title: z.string().describe("Title displayed above the table"),
  columns: z
    .array(z.string())
    .describe("Column headers for the table"),
  rows: z
    .array(
      z
        .array(z.union([z.string(), z.number(), z.null()]))
        .describe("A single row of cell values, aligned with the columns array")
    )
    .describe(
      "2D array of rows. Each inner array has values in the same order as columns."
    ),
  highlightColumnIndex: z
    .number()
    .optional()
    .describe("Optional 0-based column index to highlight"),
  maxRows: z
    .number()
    .optional()
    .describe("Maximum number of rows to display (default 20)"),
});

export type DataTableProps = z.infer<typeof dataTableSchema>;

/**
 * DataTable -- a generative component that renders query results as a table.
 * Uses useTamboComponentState to track selected rows.
 */
export const DataTable = React.forwardRef<HTMLDivElement, DataTableProps>(
  ({ title, columns, rows, highlightColumnIndex, maxRows = 20 }, ref) => {
    const [selectedRows, setSelectedRows] = useTamboComponentState<number[]>(
      "selectedRows",
      []
    );
    const [sortColIdx, setSortColIdx] = useState<number | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const displayRows = useMemo(() => {
      if (!rows) return [];
      let result = rows.slice(0, maxRows);

      if (sortColIdx !== null) {
        result = [...result].sort((a, b) => {
          const aVal = a[sortColIdx];
          const bVal = b[sortColIdx];
          if (aVal === null || aVal === undefined) return 1;
          if (bVal === null || bVal === undefined) return -1;
          if (typeof aVal === "number" && typeof bVal === "number") {
            return sortDir === "asc" ? aVal - bVal : bVal - aVal;
          }
          return sortDir === "asc"
            ? String(aVal).localeCompare(String(bVal))
            : String(bVal).localeCompare(String(aVal));
        });
      }

      return result;
    }, [rows, maxRows, sortColIdx, sortDir]);

    const handleSort = (colIdx: number) => {
      if (sortColIdx === colIdx) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortColIdx(colIdx);
        setSortDir("asc");
      }
    };

    const toggleRow = (idx: number) => {
      if (!selectedRows) return;
      const next = selectedRows.includes(idx)
        ? selectedRows.filter((i) => i !== idx)
        : [...selectedRows, idx];
      setSelectedRows(next);
    };

    if (!columns || !rows) {
      return (
        <div ref={ref} className="rounded-lg border border-border p-4">
          <div className="text-muted-foreground text-sm text-center">
            Building table...
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className="rounded-lg border border-border overflow-hidden bg-card"
      >
        {title && (
          <div className="px-4 py-3 border-b border-border bg-muted/50">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {rows.length} row{rows.length !== 1 ? "s" : ""}
              {rows.length > maxRows ? ` (showing ${maxRows})` : ""}
            </p>
          </div>
        )}
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 bg-muted z-10">
              <tr>
                {columns.map((col, colIdx) => (
                  <th
                    key={colIdx}
                    className={cn(
                      "px-3 py-2 text-left font-medium text-muted-foreground border-b border-border cursor-pointer hover:bg-muted/80 whitespace-nowrap",
                      highlightColumnIndex === colIdx &&
                        "text-blue-600 dark:text-blue-400"
                    )}
                    onClick={() => handleSort(colIdx)}
                  >
                    <div className="flex items-center gap-1">
                      {col}
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  onClick={() => toggleRow(rowIdx)}
                  className={cn(
                    "cursor-pointer transition-colors border-b border-border/50",
                    selectedRows?.includes(rowIdx)
                      ? "bg-blue-500/10"
                      : "hover:bg-muted/30"
                  )}
                >
                  {columns.map((_, colIdx) => (
                    <td
                      key={colIdx}
                      className={cn(
                        "px-3 py-1.5 text-foreground",
                        highlightColumnIndex === colIdx &&
                          "font-medium text-blue-600 dark:text-blue-400"
                      )}
                    >
                      {row[colIdx] !== null && row[colIdx] !== undefined
                        ? String(row[colIdx])
                        : "\u2014"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);
DataTable.displayName = "DataTable";
