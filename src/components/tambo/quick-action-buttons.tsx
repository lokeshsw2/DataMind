"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipProvider,
} from "@/components/tambo/suggestions-tooltip";
import {
  useTamboThread,
  useTamboThreadInput,
} from "@tambo-ai/react";
import { Sparkles, BarChart3 } from "lucide-react";
import * as React from "react";

// ---------------------------------------------------------------------------
// Shared helper: auto-submit a prompt
// ---------------------------------------------------------------------------

function useAutoSubmit() {
  const { setValue, submit } = useTamboThreadInput();
  const { isIdle } = useTamboThread();
  const [sending, setSending] = React.useState(false);

  const send = React.useCallback(
    async (prompt: string) => {
      if (!isIdle || sending) return;
      setSending(true);
      try {
        setValue(prompt);
        await new Promise((r) => setTimeout(r, 50));
        await submit({ streamResponse: true, resourceNames: {} });
      } catch (err) {
        console.error("Auto-submit failed:", err);
      } finally {
        setSending(false);
      }
    },
    [isIdle, sending, setValue, submit],
  );

  return { send, sending, isIdle };
}

// ---------------------------------------------------------------------------
// Summarize Data Button
// ---------------------------------------------------------------------------

const SUMMARIZE_PROMPT =
  "Give me a comprehensive overview of the dataset. Include key statistics for numeric columns, the distribution of categorical columns, notable patterns or trends, and any interesting insights. Use charts and summary cards where appropriate.";

/**
 * Toolbar button that auto-sends a data summarization prompt.
 * Disabled when the AI is already processing.
 */
export const SummarizeDataButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { send, sending, isIdle } = useAutoSubmit();

  return (
    <TooltipProvider>
      <Tooltip content="Summarize dataset" side="top">
        <button
          ref={ref}
          type="button"
          onClick={() => send(SUMMARIZE_PROMPT)}
          disabled={!isIdle || sending}
          className={cn(
            "w-10 h-10 rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            className,
          )}
          aria-label="Summarize dataset"
          data-slot="message-input-summarize"
          {...props}
        >
          <Sparkles
            className={cn(
              "w-4 h-4",
              sending && "animate-pulse text-amber-500",
            )}
          />
        </button>
      </Tooltip>
    </TooltipProvider>
  );
});
SummarizeDataButton.displayName = "SummarizeDataButton";

// ---------------------------------------------------------------------------
// Visualize Data Button
// ---------------------------------------------------------------------------

const VISUALIZE_PROMPT =
  "Create the best charts to visualize the key trends and distributions in this dataset. Pick the most appropriate chart types (bar, line, or pie) for each insight. Show at least 2-3 different visualizations that highlight the most interesting patterns in the data.";

/**
 * Toolbar button that auto-sends a data visualization prompt.
 * Disabled when the AI is already processing.
 */
export const VisualizeDataButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { send, sending, isIdle } = useAutoSubmit();

  return (
    <TooltipProvider>
      <Tooltip content="Visualize data" side="top">
        <button
          ref={ref}
          type="button"
          onClick={() => send(VISUALIZE_PROMPT)}
          disabled={!isIdle || sending}
          className={cn(
            "w-10 h-10 rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            className,
          )}
          aria-label="Visualize data"
          data-slot="message-input-visualize"
          {...props}
        >
          <BarChart3
            className={cn(
              "w-4 h-4",
              sending && "animate-pulse text-blue-500",
            )}
          />
        </button>
      </Tooltip>
    </TooltipProvider>
  );
});
VisualizeDataButton.displayName = "VisualizeDataButton";
