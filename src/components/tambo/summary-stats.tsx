"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  Hash,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
} from "lucide-react";
import * as React from "react";
import { z } from "zod";

/**
 * Zod schema for a single stat item
 */
const statItemSchema = z.object({
  label: z.string().describe("Label for this statistic"),
  value: z
    .union([z.string(), z.number()])
    .describe("The value of the statistic"),
  description: z
    .string()
    .optional()
    .describe("Optional description or context"),
  trend: z
    .enum(["up", "down", "neutral"])
    .optional()
    .describe("Optional trend direction for the value"),
});

/**
 * Zod schema for SummaryStats component
 */
export const summaryStatsSchema = z.object({
  title: z.string().describe("Title for the statistics section"),
  columnName: z
    .string()
    .optional()
    .describe("The name of the column these stats describe"),
  stats: z
    .array(statItemSchema)
    .describe("Array of statistical values to display"),
});

export type SummaryStatsProps = z.infer<typeof summaryStatsSchema>;

function TrendIcon({ trend }: { trend?: "up" | "down" | "neutral" }) {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
    case "down":
      return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
    case "neutral":
      return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
    default:
      return null;
  }
}

/**
 * SummaryStats -- generative component displaying statistical summary cards.
 */
export const SummaryStats = React.forwardRef<HTMLDivElement, SummaryStatsProps>(
  ({ title, columnName, stats }, ref) => {
    if (!stats || stats.length === 0) {
      return (
        <div
          ref={ref}
          className="rounded-lg border border-border p-4 bg-card"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Calculating statistics...</span>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/50 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-500" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {columnName && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Hash className="h-3 w-3" />
                {columnName}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-border">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                "px-4 py-3 bg-card",
                "hover:bg-muted/30 transition-colors"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  {stat.label}
                </span>
                <TrendIcon trend={stat.trend} />
              </div>
              <div className="text-lg font-bold text-foreground tabular-nums">
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })
                  : stat.value}
              </div>
              {stat.description && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {stat.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
);
SummaryStats.displayName = "SummaryStats";
