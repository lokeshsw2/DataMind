"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipProvider,
} from "@/components/tambo/suggestions-tooltip";
import {
  useTamboContextAttachment,
  useTamboThread,
  type ContextAttachment,
} from "@tambo-ai/react";
import { X, Quote } from "lucide-react";
import * as React from "react";

/**
 * Toolbar button that captures the current text selection from the chat area
 * and adds it as a context attachment for the next message.
 */
export const AddSelectionContextButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { addContextAttachment } = useTamboContextAttachment();
  const [justAdded, setJustAdded] = React.useState(false);

  const handleClick = React.useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString().trim();
    if (!text || text.length < 2) return;

    const truncated =
      text.length > 60 ? text.slice(0, 57) + "..." : text;

    addContextAttachment({
      context: text,
      displayName: `"${truncated}"`,
      type: "selected-text",
    });

    // Clear selection after adding
    selection.removeAllRanges();

    // Brief visual feedback
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }, [addContextAttachment]);

  return (
    <TooltipProvider>
      <Tooltip content="Add selected text as context" side="top">
        <button
          ref={ref}
          type="button"
          onClick={handleClick}
          className={cn(
            "w-10 h-10 rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            justAdded && "border-blue-400 text-blue-500",
            className,
          )}
          aria-label="Add selected text as context"
          data-slot="message-input-context-button"
          {...props}
        >
          <Quote className={cn("w-4 h-4", justAdded && "text-blue-500")} />
        </button>
      </Tooltip>
    </TooltipProvider>
  );
});
AddSelectionContextButton.displayName = "AddSelectionContextButton";

/**
 * Renders badges for each context attachment in the input area.
 * Each badge shows the display name and a remove button.
 * Automatically hidden when there are no attachments.
 */
export function ContextAttachmentBadges({ className }: { className?: string }) {
  const { attachments, removeContextAttachment } = useTamboContextAttachment();

  if (attachments.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 px-1 pb-2",
        className,
      )}
    >
      {attachments.map((att) => (
        <ContextBadge
          key={att.id}
          attachment={att}
          onRemove={() => removeContextAttachment(att.id)}
        />
      ))}
    </div>
  );
}

function ContextBadge({
  attachment,
  onRemove,
}: {
  attachment: ContextAttachment;
  onRemove: () => void;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 max-w-[280px] pl-2 pr-1 py-1 rounded-md text-xs",
        "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
        "border border-blue-200 dark:border-blue-800",
      )}
    >
      <Quote className="h-3 w-3 shrink-0 opacity-60" />
      <span className="truncate">
        {attachment.displayName || attachment.context.slice(0, 40)}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 p-0.5 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors shrink-0"
        aria-label="Remove context"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

/**
 * Invisible component that watches for new messages and auto-clears context
 * attachments after the user's message is sent.
 */
export function ContextAutoClear() {
  const { thread } = useTamboThread();
  const { attachments, clearContextAttachments } = useTamboContextAttachment();
  const prevMessageCountRef = React.useRef(thread.messages?.length ?? 0);
  const hadAttachmentsRef = React.useRef(false);

  // Track whether we had attachments when submitting
  React.useEffect(() => {
    if (attachments.length > 0) {
      hadAttachmentsRef.current = true;
    }
  }, [attachments]);

  // When a new message appears and we had attachments, clear them
  React.useEffect(() => {
    const currentCount = thread.messages?.length ?? 0;
    if (currentCount > prevMessageCountRef.current && hadAttachmentsRef.current) {
      clearContextAttachments();
      hadAttachmentsRef.current = false;
    }
    prevMessageCountRef.current = currentCount;
  }, [thread.messages?.length, clearContextAttachments]);

  return null;
}
