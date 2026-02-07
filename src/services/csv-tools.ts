/**
 * @file csv-tools.ts
 * @description Tambo tools for analyzing CSV data in-memory.
 *
 * These tools operate on the CSV data stored in the module-level ref
 * from csv-context.tsx. They are called by the Tambo AI agent
 * to extract insights from uploaded CSV/Excel files.
 */

import { getCsvDataRef } from "@/lib/csv-context";

type Row = Record<string, string | number | null>;

function getData(): Row[] {
  const ref = getCsvDataRef();
  if (!ref) throw new Error("No CSV data loaded. Please upload a file first.");
  return ref.rows;
}

function getHeaders(): string[] {
  const ref = getCsvDataRef();
  if (!ref) throw new Error("No CSV data loaded. Please upload a file first.");
  return ref.headers;
}

// ──────────────────────────────────────────────
// Tool 1: getColumnStats
// ──────────────────────────────────────────────

export interface ColumnStatsInput {
  column: string;
}

export interface ColumnStatsOutput {
  column: string;
  count: number;
  nullCount: number;
  uniqueCount: number;
  min: number | null;
  max: number | null;
  mean: number | null;
  median: number | null;
  stdDev: number | null;
}

export function getColumnStats(input: ColumnStatsInput): ColumnStatsOutput {
  const rows = getData();
  const headers = getHeaders();

  if (!headers.includes(input.column)) {
    throw new Error(
      `Column "${input.column}" not found. Available columns: ${headers.join(", ")}`
    );
  }

  const values = rows.map((r) => r[input.column]);
  const numericValues = values
    .filter((v) => v !== null && v !== undefined && v !== "")
    .map((v) => Number(v))
    .filter((v) => !isNaN(v));

  const nullCount = values.filter(
    (v) => v === null || v === undefined || v === ""
  ).length;

  const uniqueCount = new Set(values.map((v) => String(v ?? ""))).size;

  if (numericValues.length === 0) {
    return {
      column: input.column,
      count: values.length,
      nullCount,
      uniqueCount,
      min: null,
      max: null,
      mean: null,
      median: null,
      stdDev: null,
    };
  }

  const sorted = [...numericValues].sort((a, b) => a - b);
  const sum = numericValues.reduce((a, b) => a + b, 0);
  const mean = sum / numericValues.length;

  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

  const variance =
    numericValues.reduce((acc, v) => acc + (v - mean) ** 2, 0) /
    numericValues.length;
  const stdDev = Math.sqrt(variance);

  return {
    column: input.column,
    count: values.length,
    nullCount,
    uniqueCount,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
  };
}

// ──────────────────────────────────────────────
// Tool 2: queryData
// ──────────────────────────────────────────────

export interface QueryFilter {
  column: string;
  operator: "equals" | "contains" | "gt" | "lt" | "gte" | "lte" | "notEquals";
  value: string | number;
}

export interface QueryDataInput {
  filters?: QueryFilter[];
  columns?: string[];
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface QueryDataOutput {
  rows: Row[];
  totalMatched: number;
  columns: string[];
}

export function queryData(input: QueryDataInput): QueryDataOutput {
  const allRows = getData();
  const allHeaders = getHeaders();

  // Apply filters
  let filtered = allRows;
  if (input.filters && input.filters.length > 0) {
    filtered = allRows.filter((row) =>
      input.filters!.every((f) => {
        const val = row[f.column];
        const strVal = String(val ?? "").toLowerCase();
        const filterVal =
          typeof f.value === "string" ? f.value.toLowerCase() : f.value;

        switch (f.operator) {
          case "equals":
            return strVal === String(filterVal);
          case "notEquals":
            return strVal !== String(filterVal);
          case "contains":
            return strVal.includes(String(filterVal));
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

  // Sort
  if (input.sortBy && allHeaders.includes(input.sortBy)) {
    const dir = input.sortOrder === "desc" ? -1 : 1;
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[input.sortBy!];
      const bVal = b[input.sortBy!];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return (aVal - bVal) * dir;
      }
      return String(aVal).localeCompare(String(bVal)) * dir;
    });
  }

  const totalMatched = filtered.length;

  // Pagination
  const offset = input.offset ?? 0;
  const limit = input.limit ?? 50;
  filtered = filtered.slice(offset, offset + limit);

  // Column selection
  const columns = input.columns?.length
    ? input.columns.filter((c) => allHeaders.includes(c))
    : allHeaders;

  const rows = filtered.map((row) => {
    const result: Row = {};
    for (const col of columns) {
      result[col] = row[col];
    }
    return result;
  });

  return { rows, totalMatched, columns };
}

// ──────────────────────────────────────────────
// Tool 3: getDataSample
// ──────────────────────────────────────────────

export interface DataSampleInput {
  numRows?: number;
}

export interface DataSampleOutput {
  headers: string[];
  rows: Row[];
  totalRows: number;
  columnTypes: Record<string, string>;
}

export function getDataSample(input: DataSampleInput): DataSampleOutput {
  const ref = getCsvDataRef();
  if (!ref) throw new Error("No CSV data loaded. Please upload a file first.");

  const numRows = input.numRows ?? 10;

  return {
    headers: ref.headers,
    rows: ref.rows.slice(0, numRows),
    totalRows: ref.totalRows,
    columnTypes: ref.columnTypes,
  };
}

// ──────────────────────────────────────────────
// Tool 4: getColumnValues
// ──────────────────────────────────────────────

export interface ColumnValuesInput {
  column: string;
  limit?: number;
}

export interface ColumnValueItem {
  value: string;
  count: number;
  percentage: number;
}

export interface ColumnValuesOutput {
  column: string;
  uniqueCount: number;
  values: ColumnValueItem[];
}

export function getColumnValues(input: ColumnValuesInput): ColumnValuesOutput {
  const rows = getData();
  const headers = getHeaders();

  if (!headers.includes(input.column)) {
    throw new Error(
      `Column "${input.column}" not found. Available columns: ${headers.join(", ")}`
    );
  }

  const counts = new Map<string, number>();
  for (const row of rows) {
    const val = String(row[input.column] ?? "");
    counts.set(val, (counts.get(val) ?? 0) + 1);
  }

  const total = rows.length;
  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, input.limit ?? 50);

  return {
    column: input.column,
    uniqueCount: counts.size,
    values: sorted.map(([value, count]) => ({
      value,
      count,
      percentage: Math.round((count / total) * 10000) / 100,
    })),
  };
}

// ──────────────────────────────────────────────
// Tool 5: aggregateData
// ──────────────────────────────────────────────

export interface AggregateDataInput {
  groupBy: string;
  aggregateColumn: string;
  operation: "sum" | "avg" | "count" | "min" | "max";
  sortBy?: "group" | "value";
  sortOrder?: "asc" | "desc";
  limit?: number;
}

export interface AggregateItem {
  group: string;
  value: number;
}

export interface AggregateDataOutput {
  groupBy: string;
  aggregateColumn: string;
  operation: string;
  results: AggregateItem[];
}

export function aggregateData(
  input: AggregateDataInput
): AggregateDataOutput {
  const rows = getData();
  const headers = getHeaders();

  if (!headers.includes(input.groupBy)) {
    throw new Error(
      `Column "${input.groupBy}" not found. Available columns: ${headers.join(", ")}`
    );
  }
  if (!headers.includes(input.aggregateColumn)) {
    throw new Error(
      `Column "${input.aggregateColumn}" not found. Available columns: ${headers.join(", ")}`
    );
  }

  // Group rows
  const groups = new Map<string, number[]>();
  for (const row of rows) {
    const groupVal = String(row[input.groupBy] ?? "");
    const numVal = Number(row[input.aggregateColumn]);
    if (!groups.has(groupVal)) groups.set(groupVal, []);
    if (!isNaN(numVal)) groups.get(groupVal)!.push(numVal);
  }

  // Aggregate
  let results: AggregateItem[] = [];
  for (const [group, values] of groups.entries()) {
    let value: number;
    switch (input.operation) {
      case "sum":
        value = values.reduce((a, b) => a + b, 0);
        break;
      case "avg":
        value =
          values.length > 0
            ? values.reduce((a, b) => a + b, 0) / values.length
            : 0;
        break;
      case "count":
        value = values.length;
        break;
      case "min":
        value = values.length > 0 ? Math.min(...values) : 0;
        break;
      case "max":
        value = values.length > 0 ? Math.max(...values) : 0;
        break;
    }
    results.push({ group, value: Math.round(value * 100) / 100 });
  }

  // Sort
  const dir = input.sortOrder === "desc" ? -1 : 1;
  if (input.sortBy === "value") {
    results.sort((a, b) => (a.value - b.value) * dir);
  } else {
    results.sort((a, b) => a.group.localeCompare(b.group) * dir);
  }

  if (input.limit) {
    results = results.slice(0, input.limit);
  }

  return {
    groupBy: input.groupBy,
    aggregateColumn: input.aggregateColumn,
    operation: input.operation,
    results,
  };
}
