"use client";

import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ResizeHandleProps {
  onResize: (deltaX: number) => void;
  className?: string;
}

/**
 * A draggable resize handle for split-panel layouts.
 * Fires onResize with pixel delta as the user drags.
 */
export function ResizeHandle({ onResize, className }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startXRef.current = e.clientX;
    },
    []
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startXRef.current;
      startXRef.current = e.clientX;
      onResize(deltaX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Prevent text selection during drag
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, onResize]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={cn(
        "w-2 shrink-0 cursor-col-resize flex items-center justify-center group relative",
        "hover:bg-blue-500/10 active:bg-blue-500/20 transition-colors",
        isDragging && "bg-blue-500/20",
        className
      )}
      title="Drag to resize"
    >
      <div
        className={cn(
          "absolute inset-y-0 w-[3px] rounded-full transition-colors",
          isDragging
            ? "bg-blue-500"
            : "bg-transparent group-hover:bg-blue-500/50"
        )}
      />
      <GripVertical
        className={cn(
          "h-5 w-5 text-muted-foreground/40 transition-colors z-10",
          "group-hover:text-muted-foreground",
          isDragging && "text-blue-500"
        )}
      />
    </div>
  );
}
