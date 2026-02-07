"use client";

import { useCsvData } from "@/lib/csv-context";
import { withInteractable } from "@tambo-ai/react";
import { Filter, X, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

/**
 * Schema for filter panel props (used by withInteractable)
 */
const filterSchema = z.object({
  filters: z
    .array(
      z.object({
        column: z.string().describe("Column name to filter"),
        operator: z
          .enum(["equals", "contains", "gt", "lt", "gte", "lte", "notEquals"])
          .describe("Comparison operator"),
        value: z.string().describe("Value to compare against"),
      })
    )
    .describe("Active filters applied to the data"),
});

type FilterItem = {
  column: string;
  operator: "equals" | "contains" | "gt" | "lt" | "gte" | "lte" | "notEquals";
  value: string;
};

type FilterPanelProps = z.infer<typeof filterSchema>;

const operatorLabels: Record<string, string> = {
  equals: "=",
  notEquals: "!=",
  contains: "contains",
  gt: ">",
  lt: "<",
  gte: ">=",
  lte: "<=",
};

/**
 * Base filter panel component.
 * Users can set filters manually, or the AI can update them via chat.
 */
function DataFilterPanelBase(props: FilterPanelProps) {
  const { data } = useCsvData();
  const [filters, setFilters] = useState<FilterItem[]>(props.filters || []);
  const [isAdding, setIsAdding] = useState(false);
  const [newFilter, setNewFilter] = useState<FilterItem>({
    column: "",
    operator: "equals",
    value: "",
  });

  // Sync when AI updates props
  useEffect(() => {
    if (props.filters) {
      setFilters(props.filters);
    }
  }, [props.filters]);

  const addFilter = () => {
    if (newFilter.column && newFilter.value) {
      setFilters((prev) => [...prev, { ...newFilter }]);
      setNewFilter({ column: "", operator: "equals", value: "" });
      setIsAdding(false);
    }
  };

  const removeFilter = (index: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFilters([]);
  };

  if (!data) return null;

  return (
    <div className="border border-border rounded-lg bg-card">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">Filters</span>
          {filters.length > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-blue-500 text-white">
              {filters.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {filters.length > 0 && (
            <button
              onClick={clearAll}
              className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted transition-colors"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Active filters */}
      {filters.length > 0 && (
        <div className="px-3 py-2 space-y-1.5">
          {filters.map((filter, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 text-xs bg-muted/50 rounded px-2 py-1"
            >
              <span className="font-medium text-foreground">
                {filter.column}
              </span>
              <span className="text-muted-foreground">
                {operatorLabels[filter.operator]}
              </span>
              <span className="text-blue-600 dark:text-blue-400">
                {filter.value}
              </span>
              <button
                onClick={() => removeFilter(idx)}
                className="ml-auto p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add filter form */}
      {isAdding && (
        <div className="px-3 py-2 border-t border-border space-y-2">
          <select
            value={newFilter.column}
            onChange={(e) =>
              setNewFilter((f) => ({ ...f, column: e.target.value }))
            }
            className="w-full text-xs px-2 py-1.5 rounded border border-border bg-background text-foreground"
          >
            <option value="">Select column...</option>
            {data.headers.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <select
              value={newFilter.operator}
              onChange={(e) =>
                setNewFilter((f) => ({
                  ...f,
                  operator: e.target.value as FilterItem["operator"],
                }))
              }
              className="text-xs px-2 py-1.5 rounded border border-border bg-background text-foreground"
            >
              {Object.entries(operatorLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newFilter.value}
              onChange={(e) =>
                setNewFilter((f) => ({ ...f, value: e.target.value }))
              }
              placeholder="Value..."
              className="flex-1 text-xs px-2 py-1.5 rounded border border-border bg-background text-foreground placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === "Enter") addFilter();
              }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addFilter}
              disabled={!newFilter.column || !newFilter.value}
              className="flex-1 text-xs px-2 py-1.5 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Filter
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="text-xs px-2 py-1.5 rounded border border-border hover:bg-muted transition-colors text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {filters.length === 0 && !isAdding && (
        <div className="px-3 py-3 text-xs text-muted-foreground text-center">
          No active filters. Click + to add one, or ask the AI.
        </div>
      )}
    </div>
  );
}

/**
 * Interactable filter panel -- AI can update these filters through chat.
 */
export const InteractableFilterPanel = withInteractable(DataFilterPanelBase, {
  componentName: "DataFilterPanel",
  description:
    "A filter panel for CSV data. AI can add, modify, or clear filters on the uploaded dataset through natural language commands.",
  propsSchema: filterSchema,
});

/**
 * Wrapper with default props
 */
export function DataFilterPanel() {
  return (
    <InteractableFilterPanel
      filters={[]}
      onPropsUpdate={(newProps) => {
        console.log("Filters updated from Tambo:", newProps);
      }}
    />
  );
}
