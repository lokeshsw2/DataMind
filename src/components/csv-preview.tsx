"use client";

import { useCsvData } from "@/lib/csv-context";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Hash,
  Type,
  Calendar,
} from "lucide-react";
import { useMemo, useState } from "react";

const MAX_DISPLAY_ROWS = 500;

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
 * Scrollable data table showing the uploaded CSV data.
 * Supports column sorting. Limited to MAX_DISPLAY_ROWS for performance.
 */
export function CsvPreview() {
  const { data } = useCsvData();
  const [sort, setSort] = useState<SortConfig>(null);

  const sortedRows = useMemo(() => {
    if (!data) return [];

    const rows = data.rows.slice(0, MAX_DISPLAY_ROWS);

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
  }, [data, sort]);

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

  const truncated = data.totalRows > MAX_DISPLAY_ROWS;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Column info bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border text-xs text-muted-foreground flex-wrap">
        {data.headers.map((header) => (
          <span
            key={header}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted"
          >
            <ColumnTypeIcon type={data.columnTypes[header]} />
            {header}
          </span>
        ))}
      </div>

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
            {sortedRows.map((row, rowIdx) => (
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      {truncated && (
        <div className="px-3 py-1.5 text-xs text-muted-foreground border-t border-border bg-muted/50">
          Showing {MAX_DISPLAY_ROWS.toLocaleString()} of{" "}
          {data.totalRows.toLocaleString()} rows
        </div>
      )}
    </div>
  );
}
