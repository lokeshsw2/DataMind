"use client";

import { cn } from "@/lib/utils";
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import * as React from "react";
import { z } from "zod";

/**
 * Zod schema for InsightCard
 */
export const insightCardSchema = z.object({
  title: z.string().describe("Title of the insight"),
  description: z.string().describe("Detailed description of the insight"),
  metric: z
    .string()
    .optional()
    .describe("Optional highlighted metric value (e.g. '+23%', '$1.2M')"),
  type: z
    .enum(["info", "success", "warning", "trend-up", "trend-down"])
    .optional()
    .describe("Type of insight which determines the icon and accent color"),
});

export type InsightCardProps = z.infer<typeof insightCardSchema>;

const iconMap = {
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" },
  success: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  "trend-up": {
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  "trend-down": {
    icon: TrendingDown,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
};

/**
 * InsightCard -- generative component for displaying narrative insights.
 * AI uses this for textual insights with optional metric highlights.
 */
export const InsightCard = React.forwardRef<HTMLDivElement, InsightCardProps>(
  ({ title, description, metric, type = "info" }, ref) => {
    if (!title) {
      return (
        <div
          ref={ref}
          className="rounded-lg border border-border p-4 bg-card"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lightbulb className="h-4 w-4" />
            <span className="text-sm">Generating insight...</span>
          </div>
        </div>
      );
    }

    const config = iconMap[type || "info"];
    const IconComponent = config.icon;

    return (
      <div
        ref={ref}
        className="rounded-lg border border-border bg-card overflow-hidden"
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                config.bg
              )}
            >
              <IconComponent className={cn("h-4 w-4", config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-foreground">
                  {title}
                </h3>
                {metric && (
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold",
                      config.bg,
                      config.color
                    )}
                  >
                    {metric}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
InsightCard.displayName = "InsightCard";
