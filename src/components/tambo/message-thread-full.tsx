"use client";

import type { messageVariants } from "@/components/tambo/message";
import {
  MessageInput,
  MessageInputError,
  MessageInputMcpConfigButton,
  MessageInputSubmitButton,
  MessageInputTextarea,
  MessageInputToolbar,
} from "@/components/tambo/message-input";
import {
  MessageSuggestions,
  MessageSuggestionsStatus,
} from "@/components/tambo/message-suggestions";
import { ScrollableMessageContainer } from "@/components/tambo/scrollable-message-container";
import {
  SummarizeDataButton,
  VisualizeDataButton,
} from "@/components/tambo/quick-action-buttons";
import {
  AddSelectionContextButton,
  ContextAttachmentBadges,
  ContextAutoClear,
} from "@/components/tambo/selection-context";
import { ThreadContainer, useThreadContainerContext } from "./thread-container";
import {
  ThreadContent,
  ThreadContentMessages,
} from "@/components/tambo/thread-content";
import {
  ThreadHistory,
  ThreadHistoryHeader,
  ThreadHistoryList,
  ThreadHistoryNewButton,
  ThreadHistorySearch,
} from "@/components/tambo/thread-history";
import { useMergeRefs } from "@/lib/thread-hooks";
import { cn } from "@/lib/utils";
import { useTamboThread, useTamboThreadInput } from "@tambo-ai/react";
import type { VariantProps } from "class-variance-authority";
import { BarChart3, Database, Search, TrendingUp } from "lucide-react";
import * as React from "react";

// ---------------------------------------------------------------------------
// Initial suggestions shown once above the input when chat is empty
// ---------------------------------------------------------------------------

const initialQueries = [
  {
    icon: Database,
    label: "Show data overview",
    prompt: "Give me an overview of the dataset with key statistics and column summaries.",
  },
  {
    icon: BarChart3,
    label: "Visualize trends",
    prompt: "Create charts that highlight the most interesting trends and distributions in this data.",
  },
  {
    icon: TrendingUp,
    label: "Find top performers",
    prompt: "Which categories or items have the highest and lowest values? Show me a comparison.",
  },
  {
    icon: Search,
    label: "Data quality check",
    prompt: "Check the data quality — are there missing values, outliers, or inconsistencies?",
  },
];

function InitialSuggestions() {
  const { thread } = useTamboThread();
  const { setValue, submit } = useTamboThreadInput();

  const hasMessages = (thread?.messages?.length ?? 0) > 0;
  if (hasMessages) return null;

  const handleClick = async (prompt: string) => {
    setValue(prompt);
    await new Promise((r) => setTimeout(r, 50));
    await submit({ streamResponse: true, resourceNames: {} });
  };

  return (
    <div className="px-4 pb-3">
      <p className="text-xs text-muted-foreground mb-2 font-medium">
        Quick start — try one of these:
      </p>
      <div className="grid grid-cols-2 gap-2">
        {initialQueries.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => handleClick(q.prompt)}
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-left",
              "border border-border bg-background",
              "hover:bg-muted hover:border-foreground/20 transition-colors cursor-pointer",
            )}
          >
            <q.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="font-medium text-foreground">{q.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MessageThreadFull
// ---------------------------------------------------------------------------

/**
 * Props for the MessageThreadFull component
 */
export interface MessageThreadFullProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Controls the visual styling of messages in the thread.
   * Possible values include: "default", "compact", etc.
   * These values are defined in messageVariants from "@/components/tambo/message".
   * @example variant="compact"
   */
  variant?: VariantProps<typeof messageVariants>["variant"];
}

/**
 * A full-screen chat thread component with message history, input, and suggestions
 */
export const MessageThreadFull = React.forwardRef<
  HTMLDivElement,
  MessageThreadFullProps
>(({ className, variant, ...props }, ref) => {
  const { containerRef, historyPosition } = useThreadContainerContext();
  const mergedRef = useMergeRefs<HTMLDivElement | null>(ref, containerRef);
  const threadHistorySidebar = (
    <ThreadHistory position={historyPosition}>
      <ThreadHistoryHeader />
      <ThreadHistoryNewButton />
      <ThreadHistorySearch />
      <ThreadHistoryList />
    </ThreadHistory>
  );

  return (
    <div className="flex h-full w-full">
      {/* Thread History Sidebar - rendered first if history is on the left */}
      {historyPosition === "left" && threadHistorySidebar}

      <ThreadContainer
        ref={mergedRef}
        disableSidebarSpacing
        className={className}
        {...props}
      >
        <ScrollableMessageContainer className="p-4">
          <ThreadContent variant={variant}>
            <ThreadContentMessages />
          </ThreadContent>
        </ScrollableMessageContainer>

        {/* Message suggestions status */}
        <MessageSuggestions>
          <MessageSuggestionsStatus />
        </MessageSuggestions>

        {/* Auto-clear context attachments after submit */}
        <ContextAutoClear />

        {/* One-time initial suggestions above input (only when chat is empty) */}
        <InitialSuggestions />

        {/* Message input */}
        <div className="px-4 pb-4">
          <MessageInput>
            {/* Context attachment badges (from text selection) */}
            <ContextAttachmentBadges />
            <MessageInputTextarea placeholder="Type your message or paste images..." />
            <MessageInputToolbar>
              <SummarizeDataButton />
              <VisualizeDataButton />
              <AddSelectionContextButton />
              <MessageInputMcpConfigButton />
              <MessageInputSubmitButton />
            </MessageInputToolbar>
            <MessageInputError />
          </MessageInput>
        </div>
      </ThreadContainer>

      {/* Thread History Sidebar - rendered last if history is on the right */}
      {historyPosition === "right" && threadHistorySidebar}
    </div>
  );
});
MessageThreadFull.displayName = "MessageThreadFull";
