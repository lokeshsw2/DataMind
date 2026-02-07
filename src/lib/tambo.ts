/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import { Graph, graphSchema } from "@/components/tambo/graph";
import { DataCard, dataCardSchema } from "@/components/ui/card-data";
import { DataTable, dataTableSchema } from "@/components/tambo/data-table";
import {
  SummaryStats,
  summaryStatsSchema,
} from "@/components/tambo/summary-stats";
import {
  InsightCard,
  insightCardSchema,
} from "@/components/tambo/insight-card";
import {
  getColumnStats,
  queryData,
  getDataSample,
  getColumnValues,
  aggregateData,
} from "@/services/csv-tools";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically fetch data based on user interactions.
 */

export const tools: TamboTool[] = [
  // ── CSV Analysis Tools ──
  {
    name: "getColumnStats",
    description:
      "Get statistical summary for a numeric column in the uploaded CSV data. Returns count, min, max, mean, median, standard deviation, null count, and unique count.",
    tool: getColumnStats,
    inputSchema: z.object({
      column: z.string().describe("The column name to compute statistics for"),
    }),
    outputSchema: z.object({
      column: z.string(),
      count: z.number(),
      nullCount: z.number(),
      uniqueCount: z.number(),
      min: z.number().nullable(),
      max: z.number().nullable(),
      mean: z.number().nullable(),
      median: z.number().nullable(),
      stdDev: z.number().nullable(),
    }),
  },
  {
    name: "queryData",
    description:
      "Query and filter rows from the uploaded CSV data. Supports filtering by column conditions (equals, contains, gt, lt, gte, lte, notEquals), column selection, sorting, and pagination. Use this to find specific subsets of data.",
    tool: queryData,
    inputSchema: z.object({
      filters: z
        .array(
          z.object({
            column: z.string().describe("Column to filter on"),
            operator: z
              .enum([
                "equals",
                "contains",
                "gt",
                "lt",
                "gte",
                "lte",
                "notEquals",
              ])
              .describe("Comparison operator"),
            value: z
              .union([z.string(), z.number()])
              .describe("Value to compare against"),
          })
        )
        .optional()
        .describe("Array of filter conditions to apply"),
      columns: z
        .array(z.string())
        .optional()
        .describe("Specific columns to return (defaults to all)"),
      limit: z
        .number()
        .optional()
        .describe("Maximum number of rows to return (default 50)"),
      offset: z
        .number()
        .optional()
        .describe("Number of rows to skip (for pagination)"),
      sortBy: z.string().optional().describe("Column name to sort by"),
      sortOrder: z
        .enum(["asc", "desc"])
        .optional()
        .describe("Sort direction"),
    }),
    outputSchema: z.object({
      rows: z.array(z.record(z.union([z.string(), z.number(), z.null()]))),
      totalMatched: z.number(),
      columns: z.array(z.string()),
    }),
  },
  {
    name: "getDataSample",
    description:
      "Get a sample of rows from the uploaded CSV data to understand the data shape, column names, types, and example values. Always call this first before doing analysis to understand the data structure.",
    tool: getDataSample,
    inputSchema: z.object({
      numRows: z
        .number()
        .optional()
        .describe("Number of sample rows to return (default 10)"),
    }),
    outputSchema: z.object({
      headers: z.array(z.string()),
      rows: z.array(z.record(z.union([z.string(), z.number(), z.null()]))),
      totalRows: z.number(),
      columnTypes: z.record(z.string()),
    }),
  },
  {
    name: "getColumnValues",
    description:
      "Get unique values and their counts for a specific column. Useful for understanding categorical data, finding most/least common values, and data distribution.",
    tool: getColumnValues,
    inputSchema: z.object({
      column: z.string().describe("Column name to get unique values for"),
      limit: z
        .number()
        .optional()
        .describe("Maximum number of unique values to return (default 50)"),
    }),
    outputSchema: z.object({
      column: z.string(),
      uniqueCount: z.number(),
      values: z.array(
        z.object({
          value: z.string(),
          count: z.number(),
          percentage: z.number(),
        })
      ),
    }),
  },
  {
    name: "aggregateData",
    description:
      "Group data by a column and aggregate another column with operations like sum, avg, count, min, max. Perfect for creating chart data (e.g. revenue by category, count by month).",
    tool: aggregateData,
    inputSchema: z.object({
      groupBy: z.string().describe("Column to group rows by"),
      aggregateColumn: z
        .string()
        .describe("Numeric column to aggregate"),
      operation: z
        .enum(["sum", "avg", "count", "min", "max"])
        .describe("Aggregation operation to perform"),
      sortBy: z
        .enum(["group", "value"])
        .optional()
        .describe("Sort results by group name or aggregated value"),
      sortOrder: z
        .enum(["asc", "desc"])
        .optional()
        .describe("Sort direction"),
      limit: z
        .number()
        .optional()
        .describe("Maximum number of groups to return"),
    }),
    outputSchema: z.object({
      groupBy: z.string(),
      aggregateColumn: z.string(),
      operation: z.string(),
      results: z.array(
        z.object({
          group: z.string(),
          value: z.number(),
        })
      ),
    }),
  },
];

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 * Each component is defined with its name, description, and expected props. The components
 * can be controlled by AI to dynamically render UI elements based on user interactions.
 */
export const components: TamboComponent[] = [
  {
    name: "Graph",
    description:
      "A component that renders various types of charts (bar, line, pie) using Recharts. Use this to visualize aggregated data, trends, and distributions. Supports customizable data visualization with labels, datasets, and styling options.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "DataTable",
    description:
      "A component that renders query results as a formatted, sortable table. Use this when the user wants to see specific data rows, filtered results, or tabular output. The 'rows' prop is a 2D array where each inner array has values aligned with the 'columns' array (e.g. columns: ['Name','Age'], rows: [['Alice',30],['Bob',25]]). Supports column highlighting by index and row selection.",
    component: DataTable,
    propsSchema: dataTableSchema,
  },
  {
    name: "SummaryStats",
    description:
      "A component that displays statistical summary cards for data columns. Use this to show count, mean, median, min, max, standard deviation and other stats in a visually appealing grid layout. Supports trend indicators.",
    component: SummaryStats,
    propsSchema: summaryStatsSchema,
  },
  {
    name: "InsightCard",
    description:
      "A card component for displaying narrative data insights with an icon, title, description, and optional metric highlight. Use this for textual analysis results like 'Revenue increased 23% in Q4' or data quality observations.",
    component: InsightCard,
    propsSchema: insightCardSchema,
  },
  {
    name: "DataCard",
    description:
      "A component that displays options as clickable cards with links and summaries with the ability to select multiple items.",
    component: DataCard,
    propsSchema: dataCardSchema,
  },
];
