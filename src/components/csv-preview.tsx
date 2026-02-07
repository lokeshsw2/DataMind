"use client";

import { useCsvData, type ActiveFilter } from "@/lib/csv-context";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Hash,
  Type,
  Calendar,
  Filter,
} from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

const MAX_DISPLAY_ROWS = 500;

type Row = Record<string, string | number | null>;

type SortConfig = {
  column: string;
  direction: "asc" | "desc";
} | null;

/**
 * Column type icon helper
 */
function ColumnTypeIcon({ type }: { type: "string" | "number" | "date" }) {
  switch (type) {
    case "number":
      return <Hash className="h-3 w-3" />;
    case "date":
      return <Calendar className="h-3 w-3" />;
    default:
      return <Type className="h-3 w-3" />;
  }
}

/**
 * Apply active filters to rows
 */
function applyFilters(rows: Row[], filters: ActiveFilter[]): Row[] {
  if (filters.length === 0) return rows;

  return rows.filter((row) =>
    filters.every((f) => {
      const val = row[f.column];
      const strVal = String(val ?? "").toLowerCase();
      const filterVal = f.value.toLowerCase();

      switch (f.operator) {
        case "equals":
          return strVal === filterVal;
        case "notEquals":
          return strVal !== filterVal;
        case "contains":
          return strVal.includes(filterVal);
        case "gt":
          return Number(val) > Number(f.value);
        case "lt":
          return Number(val) < Number(f.value);
        case "gte":
          return Number(val) >= Number(f.value);
        case "lte":
          return Number(val) <= Number(f.value);
        default:
          return true;
      }
    })
  );
}

/**
 * Scrollable data table showing the uploaded CSV data.
 * Supports column sorting and active filters from context.
 * Limited to MAX_DISPLAY_ROWS for performance.
 */
export function CsvPreview() {
  const { data, activeFilters } = useCsvData();
  const [sort, setSort] = useState<SortConfig>(null);
  const [columnsExpanded, setColumnsExpanded] = useState(false);

  const filteredAndSortedRows = useMemo(() => {
    if (!data) return [];

    // Apply filters first
    let rows = applyFilters(data.rows, activeFilters);

    // Limit for performance
    rows = rows.slice(0, MAX_DISPLAY_ROWS);

    // Sort
    if (!sort) return rows;

    return [...rows].sort((a, b) => {
      const aVal = a[sort.column];
      const bVal = b[sort.column];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sort.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal);
      const bStr = String(bVal);
      return sort.direction === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [data, sort, activeFilters]);

  const totalFilteredCount = useMemo(() => {
    if (!data) return 0;
    return applyFilters(data.rows, activeFilters).length;
  }, [data, activeFilters]);

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p className="text-sm">Upload a file to preview your data</p>
      </div>
    );
  }

  const handleSort = (column: string) => {
    setSort((prev) => {
      if (prev?.column === column) {
        if (prev.direction === "asc") return { column, direction: "desc" };
        return null; // third click removes sort
      }
      return { column, direction: "asc" };
    });
  };

  const isFiltered = activeFilters.length > 0;
  const truncated = totalFilteredCount > MAX_DISPLAY_ROWS;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Collapsible column info bar */}
      <div className="border-b border-border">
        <button
          onClick={() => setColumnsExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/30 transition-colors"
        >
          <span className="font-medium">
            Columns ({data.headers.length})
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              !columnsExpanded && "-rotate-90"
            )}
          />
        </button>
        {columnsExpanded && (
          <div className="flex items-center gap-1.5 px-3 pb-2 flex-wrap">
            {data.headers.map((header) => (
              <span
                key={header}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs"
              >
                <ColumnTypeIcon type={data.columnTypes[header]} />
                {header}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Filter active indicator */}
      {isFiltered && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border-b border-blue-500/20 text-xs text-blue-600 dark:text-blue-400">
          <Filter className="h-3 w-3" />
          <span>
            Showing {totalFilteredCount.toLocaleString()} of{" "}
            {data.totalRows.toLocaleString()} rows ({activeFilters.length}{" "}
            filter{activeFilters.length !== 1 ? "s" : ""} active)
          </span>
        </div>
      )}

      {/* Scrollable table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-muted">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground border-b border-border w-12">
                #
              </th>
              {data.headers.map((header) => (
                <th
                  key={header}
                  className="px-3 py-2 text-left font-medium text-muted-foreground border-b border-border cursor-pointer hover:bg-muted/80 select-none whitespace-nowrap"
                  onClick={() => handleSort(header)}
                >
                  <div className="flex items-center gap-1">
                    <span>{header}</span>
                    {sort?.column === header ? (
                      sort.direction === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-30" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={data.headers.length + 1}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  No rows match the active filters.
                </td>
              </tr>
            ) : (
              filteredAndSortedRows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="hover:bg-muted/30 transition-colors border-b border-border/50"
                >
                  <td className="px-3 py-1.5 text-muted-foreground tabular-nums">
                    {rowIdx + 1}
                  </td>
                  {data.headers.map((header) => (
                    <td
                      key={header}
                      className="px-3 py-1.5 text-foreground max-w-[200px] truncate"
                      title={String(row[header] ?? "")}
                    >
                      {row[header] !== null && row[header] !== undefined
                        ? String(row[header])
                        : ""}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      {truncated && (
        <div className="px-3 py-1.5 text-xs text-muted-foreground border-t border-border bg-muted/50">
          Showing {MAX_DISPLAY_ROWS.toLocaleString()} of{" "}
          {totalFilteredCount.toLocaleString()} matched rows
        </div>
      )}
    </div>
  );
}
