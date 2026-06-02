import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * ValidatedInput
 *
 * A labelled text input that optionally displays an "OBRIGATÓRIO" badge and
 * red border/background when the field is both required and empty, and the
 * caller has signalled that validation should be visible.
 *
 * Automatically normalizes text on blur:
 *  - Trims leading and trailing whitespace
 *  - Collapses sequences of 2+ internal spaces to a single space
 *
 * Props:
 *  - label          {string}   — field label text
 *  - value          {string}   — controlled input value
 *  - onChange       {function} — onChange handler (receives the raw event)
 *  - onBlur         {function} — optional extra onBlur handler (forwarded after normalization)
 *  - placeholder    {string}   — input placeholder
 *  - required       {boolean}  — marks the field as required (shows badge when empty + showError)
 *  - showError      {boolean}  — whether validation feedback is currently visible
 *                               (typically: !isNew && hasError)
 *  - mono           {boolean}  — render value in monospace font (for JSON paths)
 *  - inputClassName {string}   — extra classes forwarded to the <Input>
 *  - className      {string}   — extra classes on the outer wrapper div
 *  - id             {string}   — id forwarded to the <Input> (for a11y)
 */
export function ValidatedInput({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  showError = false,
  mono = false,
  inputClassName,
  className,
  id,
  ...rest
}) {
  // Show the error treatment only when the field is required, validation is
  // visible, and the value is actually empty.
  const hasValidationError = required && showError && !value?.trim();

  /**
   * On blur: normalize the current value and push it back via onChange
   * so the parent state is always clean, regardless of how the user typed.
   *  - trim()              removes leading / trailing whitespace
   *  - replace(/\s{2,}/g)  collapses any run of 2+ spaces into one
   *
   * We do this on blur rather than on every keystroke to avoid
   * cursor-position jumps while the user is still typing.
   */
  const handleBlur = (e) => {
    const raw = e.target.value;
    const normalized = raw.trim().replace(/\s{2,}/g, " ");
    if (normalized !== raw) {
      // Re-use the same event shape the parent expects (e.target.value)
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: normalized },
      };
      onChange(syntheticEvent);
    }
    onBlur?.(e);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Label row — always occupies the same height */}
      <div className="flex justify-between items-center min-h-[1.25rem]">
        <Label
          htmlFor={id}
          className="text-xs text-gray-500"
        >
          {label}
        </Label>
        {/* Error badge — always rendered but invisible when not needed to
            prevent layout shift */}
        <span
          aria-hidden={!hasValidationError}
          className={cn(
            "text-[10px] font-bold text-red-500 transition-opacity",
            hasValidationError ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          OBRIGATÓRIO
        </span>
      </div>

      <Input
        id={id}
        value={value ?? ""}
        onChange={onChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(
          "text-sm focus:border-orange-400",
          mono && "font-mono",
          hasValidationError && "border-red-300 bg-red-50",
          inputClassName
        )}
        {...rest}
      />
    </div>
  );
}
