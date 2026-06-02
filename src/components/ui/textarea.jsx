import { useDialogComposition } from "@/components/ui/dialog";
import { useComposition } from "@/hooks/useComposition";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import * as React from "react";

function Textarea({
  className,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
  disabledHoverMessage,
  ...props
}) {
  // Get dialog composition context if available (will be no-op if not inside Dialog)
  const dialogComposition = useDialogComposition();

  // Add composition event handlers to support input method editor (IME) for CJK languages.
  const {
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
    onKeyDown: handleKeyDown,
  } = useComposition({
    onKeyDown: (e) => {
      // Check if this is an Enter key that should be blocked
      const isComposing = e.nativeEvent.isComposing || dialogComposition.justEndedComposing();

      // If Enter key is pressed while composing or just after composition ended,
      // don't call the user's onKeyDown (this blocks the business logic)
      // Note: For textarea, Shift+Enter should still work for newlines
      if (e.key === "Enter" && !e.shiftKey && isComposing) {
        return;
      }

      // Otherwise, call the user's onKeyDown
      onKeyDown?.(e);
    },
    onCompositionStart: e => {
      dialogComposition.setComposing(true);
      onCompositionStart?.(e);
    },
    onCompositionEnd: e => {
      // Mark that composition just ended - this helps handle the Enter key that confirms input
      dialogComposition.markCompositionEnd();
      // Delay setting composing to false to handle Safari's event order
      // In Safari, compositionEnd fires before the ESC keydown event
      setTimeout(() => {
        dialogComposition.setComposing(false);
      }, 100);
      onCompositionEnd?.(e);
    },
  });

  const hasTooltip = props.disabled && disabledHoverMessage;

  const textareaEl = (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-gray-200 dark:border-transparent placeholder:text-muted-foreground aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm shadow-none focus:shadow-none focus-visible:shadow-none focus-visible:ring-0",
        !props.disabled && "focus:border-[#F97316] focus-visible:border-[#F97316] dark:focus:border-[#F97316] dark:focus-visible:border-[#F97316]",
        hasTooltip && "pointer-events-none",
        className
      )}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );

  if (hasTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full cursor-not-allowed">
              {textareaEl}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" align="center" className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium px-3 py-1.5 rounded-md shadow-lg text-xs">
            {disabledHoverMessage}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return textareaEl;
}

export { Textarea };

